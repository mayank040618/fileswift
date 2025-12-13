import { ToolProcessor } from './types';
import { zipFiles } from '../utils/zipper';
import { PDFDocument, degrees as pdfDegrees } from 'pdf-lib';
import fs from 'fs-extra';
import path from 'path';
import { Document, Packer, Paragraph, TextRun } from "docx";
// @ts-ignore
import { PDFParse } from 'pdf-parse';
// import { getFileBuffer } from '../services/storage';
import { exec } from 'child_process';
import util from 'util';
import { getGsVersion, getQpdfVersion } from '../utils/cli-checks';
import { spawnWithTimeout } from '../utils/spawnWithTimeout';
import { makeTempDir, removeDir } from '../utils/file';
import { CompressionLogEntry, logCompressionEvent } from '../monitoring/compression-logger';
import { pMap } from '../utils/concurrency';
import { isValidPdf } from '../utils/validation';

const execAsync = util.promisify(exec);

// Helper to check for binaries
const hasBinary = async (cmd: string): Promise<boolean> => {
    try {
        await execAsync(`which ${cmd}`);
        return true;
    } catch {
        return false;
    }
};

const compressPdfProcessor: ToolProcessor = {
    id: 'compress-pdf',
    process: async ({ job, localPath, inputPaths, outputDir }) => {
        // Fix: localPath might be undefined in types, ensure array of strings
        const inputs: string[] = (inputPaths && inputPaths.length > 0)
            ? inputPaths
            : (localPath ? [localPath] : []);

        if (inputs.length === 0) throw new Error("No inputs provided");

        // Check tools using cached checks
        const [gsVersion, qpdfVersion] = await Promise.all([getGsVersion(), getQpdfVersion()]);
        const hasGs = !!gsVersion;
        const hasQpdf = !!qpdfVersion;

        // Parse quality (0-100)
        const { quality } = job.data.data || {};
        const q = quality !== undefined ? parseInt(String(quality)) : 75;

        // Calculate granular DPI based on quality (0-100)
        const targetDpi = Math.floor(Math.max(q * 3, 50));

        // Base preset
        let basePreset = '/screen';
        if (targetDpi >= 150) basePreset = '/ebook';
        if (targetDpi >= 300) basePreset = '/printer';

        console.log(`[compress-pdf] Job ${job.id} | Q: ${q} | TargetDPI: ${targetDpi} | Base: ${basePreset} | GS: ${gsVersion || 'No'} | QPDF: ${qpdfVersion || 'No'}`);

        const processFile = async (input: string) => {
            // Validation: Ensure it is actually a PDF
            if (!await isValidPdf(input)) {
                console.error(`[compress-pdf] Invalid PDF file detected: ${input}`);
                throw new Error("Invalid PDF file detected (incorrect magic bytes)");
            }

            const start = Date.now();
            const baseName = path.basename(input, '.pdf');
            const outputFilename = `compressed-${baseName}.pdf`;
            const finalOutputPath = path.join(outputDir, outputFilename);

            let compressed = false;
            let activeTool = '';
            let errorDetails = '';

            // Check page count for parallelization
            let pageCount = 0;
            try {
                const buffer = await fs.readFile(input);
                // Load without content for speed if possible, but pdf-lib loads all. 
                // For massive files, qpdf --show-npages is better, but let's stick to pdf-lib for consistency/portability first or just load header?
                // Actually pdf-lib `load` is fast enough for < 100MB usually.
                const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
                pageCount = doc.getPageCount();
            } catch (e) {
                console.warn("Failed to get page count, falling back to single-pass", e);
            }

            // Decision: Parallelize if > 10 pages and we are in a single-file job (to avoid saturating CPU if unlimited user uploads)
            // If inputs.length > 1, strictly serial processing per file (but files parallelized by pMap outer loop potentially)
            // Outer pMap concurrency is already restricted. 
            // If we are inside pMap, we are one of N workers.
            // If we split into M chunks, we spawn M GS processes.
            // Total GS processes = N * M.
            // If N=2 (outer pMap), M=4 (chunks), we have 8 GS processes. might be too much for free tier.
            // Let's be conservative: Only parallelize if we are processing a single file? 
            // Or restrict inner concurrency.

            // For now: Parallelize if > 5 pages.
            const useParallel = pageCount > 5 && hasGs;

            const LOG_BASE: CompressionLogEntry = {
                jobId: job.id || 'unknown',
                tool: 'none',
                inputSize: 0,
                outputSize: 0,
                durationMs: 0,
                success: false,
                timestamp: new Date().toISOString()
            };

            const inputStats = await fs.stat(input);
            const inputSize = inputStats.size;

            if (useParallel) {
                console.log(`[compress-pdf] Parallelizing ${baseName} (${pageCount} pages)...`);
                activeTool = 'ghostscript-parallel';
                const tempDir = await makeTempDir(`compress-parallel-${job.id}`);

                try {
                    // 1. Split into chunks
                    const CHUNK_SIZE = 5; // 5 pages per chunk
                    const chunks: { start: number, end: number, index: number }[] = [];
                    for (let i = 0; i < pageCount; i += CHUNK_SIZE) {
                        chunks.push({ start: i + 1, end: Math.min(i + CHUNK_SIZE, pageCount), index: chunks.length });
                    }

                    // 2. Process chunks in parallel
                    // Concurrency: 3 chunks at a time.
                    const chunkPaths = await pMap(chunks, async (chunk) => {
                        const chunkOutput = path.join(tempDir, `chunk-${chunk.index}.pdf`);

                        // GS Command for partial range
                        const args = [
                            '-sDEVICE=pdfwrite',
                            '-dCompatibilityLevel=1.4',
                            `-dPDFSETTINGS=${basePreset}`,
                            '-dNOPAUSE', '-dQUIET', '-dBATCH',
                            `-dColorImageResolution=${targetDpi}`,
                            `-dGrayImageResolution=${targetDpi}`,
                            `-dMonoImageResolution=${targetDpi}`,
                            '-dDownsampleColorImages=true',
                            '-dDownsampleGrayImages=true',
                            '-dDownsampleMonoImages=true',
                            // Page Range
                            `-dFirstPage=${chunk.start}`,
                            `-dLastPage=${chunk.end}`,
                            `-sOutputFile=${chunkOutput}`,
                            input
                        ];

                        const result = await spawnWithTimeout('gs', args, { cwd: tempDir }, 60000); // 1 min per chunk

                        if (result.timedOut || result.code !== 0) {
                            throw new Error(`Chunk ${chunk.index} failed: ${result.stderr || 'Timeout'}`);
                        }

                        if (!await fs.pathExists(chunkOutput) || (await fs.stat(chunkOutput)).size === 0) {
                            throw new Error(`Chunk ${chunk.index} produced empty/missing file`);
                        }

                        return chunkOutput;
                    }, 3); // Parallel Factor

                    // 3. Merge Chunks
                    // Use GS to merge for speed/reliability or pdf-lib
                    // GS merge is robust.
                    const mergeArgs = [
                        '-sDEVICE=pdfwrite',
                        '-dCompatibilityLevel=1.4',
                        '-dNOPAUSE', '-dQUIET', '-dBATCH',
                        `-sOutputFile=${finalOutputPath}`,
                        ...chunkPaths
                    ];

                    await spawnWithTimeout('gs', mergeArgs, {}, 120000);

                    if (await fs.pathExists(finalOutputPath)) {
                        const outStat = await fs.stat(finalOutputPath);
                        if (outStat.size > 0 && outStat.size < inputSize) {
                            compressed = true;
                        } else if (outStat.size > 0) {
                            // It grew (rare but possible), still successful operation
                            compressed = true;
                        }
                    }
                } catch (e) {
                    console.error("Parallel compression failed, falling back to single pass", e);
                    // Fallthrough to single pass
                } finally {
                    await removeDir(tempDir);
                }
            }

            if (!compressed) {
                // Fallback to Single Pass (Original Logic)
                const uniqueId = Math.random().toString(36).substring(7);
                const tempDir = await makeTempDir(`compress-${job.id}-${uniqueId}`);
                const tempOutput = path.join(tempDir, outputFilename);

                try {
                    if (hasGs) {
                        activeTool = 'ghostscript';
                        const result = await spawnWithTimeout(
                            'gs',
                            [
                                '-sDEVICE=pdfwrite',
                                '-dCompatibilityLevel=1.4',
                                `-dPDFSETTINGS=${basePreset}`,
                                '-dNOPAUSE', '-dQUIET', '-dBATCH',
                                `-dColorImageResolution=${targetDpi}`,
                                `-dGrayImageResolution=${targetDpi}`,
                                `-dMonoImageResolution=${targetDpi}`,
                                '-dDownsampleColorImages=true',
                                '-dDownsampleGrayImages=true',
                                '-dDownsampleMonoImages=true',
                                `-sOutputFile=${tempOutput}`,
                                input
                            ],
                            { cwd: tempDir },
                            120000 // 2 min timeout
                        );

                        if (result.timedOut) errorDetails += `GS Timeout; `;
                        else if (result.code !== 0) errorDetails += `GS Fail: ${result.stderr?.slice(0, 100)}; `;
                        else if (await fs.pathExists(tempOutput)) {
                            const outStat = await fs.stat(tempOutput);
                            if (outStat.size > 0) compressed = true;
                        }
                    }

                    if (!compressed && hasQpdf) {
                        activeTool = 'qpdf';
                        const result = await spawnWithTimeout('qpdf', ['--linearize', input, tempOutput], {}, 20000);
                        if (result.code === 0 && await fs.pathExists(tempOutput)) compressed = true;
                    }

                    if (!compressed) {
                        activeTool = 'copy_fallback';
                        await fs.copy(input, finalOutputPath);
                    } else {
                        await fs.move(tempOutput, finalOutputPath, { overwrite: true });
                    }
                } finally {
                    await removeDir(tempDir);
                }
            }

            // Logging
            const end = Date.now();
            const outSize = (await fs.pathExists(finalOutputPath)) ? (await fs.stat(finalOutputPath)).size : inputSize;

            await logCompressionEvent({
                ...LOG_BASE,
                tool: activeTool,
                inputSize,
                outputSize: outSize,
                durationMs: end - start,
                success: activeTool !== 'copy_fallback',
                errorDetails: activeTool === 'copy_fallback' ? errorDetails : undefined,
                meta: { quality: q, targetDpi, preset: basePreset, pages: pageCount, parallel: useParallel && activeTool === 'ghostscript-parallel' }
            });

            return finalOutputPath;
        };

        const outputFiles = (inputs.length === 1)
            ? [await processFile(inputs[0])]
            : await pMap(inputs, processFile, 2);

        if (outputFiles.length === 0) {
            throw new Error("Failed to process files");
        }

        if (outputFiles.length === 1) {
            return { resultKey: path.basename(outputFiles[0]) };
        } else {
            const zipName = `compressed-pdfs-${job.id}.zip`;
            await zipFiles(outputFiles, outputDir, zipName);
            return { resultKey: zipName };
        }
    }
};

const pdfToWordProcessor: ToolProcessor = {
    id: 'pdf-to-word',
    process: async ({ job: _job, localPath, outputDir }) => {
        // PDF to Word usually takes one file. Parallelizing for bulk is possible but UI seems single-file oriented mostly.
        // Leaving as is for now unless 'inputPaths' is populated.
        // ... (existing logic) ...
        const outputFilename = `${path.basename(localPath, '.pdf')}.docx`;
        const outputPath = path.join(outputDir, outputFilename);

        // Try LibreOffice
        if (await hasBinary('soffice')) {
            console.log('[pdf-to-word] Using LibreOffice...');
            console.log('[pdf-to-word] Using LibreOffice...');
            try {
                // Security: Use spawn instead of exec to prevent shell injection
                const sanitizedInput = localPath; // Multer generates safe random names usually, but good practice to be aware

                // Validate PDF first
                if (!await isValidPdf(localPath)) throw new Error("Invalid PDF source");

                await spawnWithTimeout('soffice', [
                    '--headless',
                    '--infilter=writer_pdf_import',
                    '--convert-to', 'docx',
                    sanitizedInput,
                    '--outdir', outputDir
                ], {}, 60000);

                // LibreOffice uses input basename.  
                const expectedName = path.basename(localPath, '.pdf') + '.docx';
                const expectedPath = path.join(outputDir, expectedName);

                if (await fs.pathExists(expectedPath)) {
                    if (expectedPath !== outputPath) {
                        await fs.move(expectedPath, outputPath);
                    }
                    return { resultKey: outputFilename };
                }
            } catch (e) {
                console.error('[pdf-to-word] LibreOffice failed, falling back to JS.', e);
            }
        }

        // JS Fallback
        console.log('[pdf-to-word] Using Node.js fallback...');
        const dataBuffer = await fs.readFile(localPath);
        // @ts-ignore
        const parser = new PDFParse({ data: dataBuffer, url: localPath });
        // @ts-ignore
        const pdfData = await parser.getText();

        let rawText = pdfData.text || "";
        // Sanitize
        // eslint-disable-next-line no-control-regex
        const sanitizedText = rawText.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F]/g, '');

        let finalContent = sanitizedText;
        if (!sanitizedText.trim()) {
            finalContent = "[NO TEXT FOUND] This document appears to be an image-based or scanned PDF. No selectable text was found to extract.";
        }

        const doc = new Document({
            sections: [{
                properties: {},
                children: [
                    new Paragraph({
                        children: [new TextRun(finalContent)],
                    }),
                ],
            }],
        });

        const buffer = await Packer.toBuffer(doc);
        await fs.writeFile(outputPath, buffer);

        return { resultKey: outputFilename };
    }
};

const mergePdfProcessor: ToolProcessor = {
    id: 'merge-pdf',
    process: async ({ job, localPath, inputPaths, outputDir }) => {
        // Merge runs sequentially by definition (order matters).
        const inputs = inputPaths && inputPaths.length > 0 ? inputPaths : [localPath];
        const mergedPdf = await PDFDocument.create();

        for (const input of inputs) {
            const buffer = await fs.readFile(input);
            const pdf = await PDFDocument.load(buffer);
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            copiedPages.forEach((page) => mergedPdf.addPage(page));
        }

        const outputPath = path.join(outputDir, `${job.id}-merged.pdf`);
        await fs.writeFile(outputPath, await mergedPdf.save());
        return { resultKey: path.basename(outputPath) };
    }
};

const rotatePdfProcessor: ToolProcessor = {
    id: 'rotate-pdf',
    process: async ({ job, localPath, inputPaths, outputDir }) => {
        const { angle } = job.data.data || {};
        const rotationToAdd = angle ? parseInt(String(angle)) : 90;

        const inputs = inputPaths && inputPaths.length > 0 ? inputPaths : [localPath];

        const outputFiles = await pMap(inputs, async (input) => {
            const pdfBytes = await fs.readFile(input);
            const pdfDoc = await PDFDocument.load(pdfBytes);
            const pages = pdfDoc.getPages();

            pages.forEach(page => {
                const currentRotation = page.getRotation().angle;
                const newRotation = (currentRotation + rotationToAdd) % 360;
                page.setRotation(pdfDegrees(newRotation));
            });

            const outputFilename = `rotated-${path.basename(input)}`;
            const outputPath = path.join(outputDir, outputFilename);
            await fs.writeFile(outputPath, await pdfDoc.save());
            return outputPath;
        }, 5);

        if (outputFiles.length === 1) {
            return { resultKey: path.basename(outputFiles[0]) };
        } else {
            const zipName = `rotated-pdfs-${job.id}.zip`;
            await zipFiles(outputFiles, outputDir, zipName);
            return { resultKey: zipName };
        }
    }
};




const splitPdfProcessor: ToolProcessor = {
    id: 'split-pdf',
    process: async ({ job, localPath, inputPaths, outputDir }) => {
        const inputs = inputPaths && inputPaths.length > 0 ? inputPaths : [localPath];
        const outputFiles: string[] = [];

        for (const input of inputs) {
            const buffer = await fs.readFile(input);
            const pdf = await PDFDocument.load(buffer);
            const pageCount = pdf.getPageCount();
            const baseName = path.basename(input, '.pdf');

            for (let i = 0; i < pageCount; i++) {
                const newPdf = await PDFDocument.create();
                const [page] = await newPdf.copyPages(pdf, [i]);
                newPdf.addPage(page);

                const outputName = `${baseName}-page-${i + 1}.pdf`;
                const outputPath = path.join(outputDir, outputName);
                await fs.writeFile(outputPath, await newPdf.save());
                outputFiles.push(outputPath);
            }
        }

        const zipName = `split-pdfs-${job.id}.zip`;
        await zipFiles(outputFiles, outputDir, zipName);
        return { resultKey: zipName };
    }
};

const pdfToImageProcessor: ToolProcessor = {
    id: 'pdf-to-image',
    process: async ({ job, localPath, inputPaths, outputDir }) => {
        const inputs = inputPaths && inputPaths.length > 0 ? inputPaths : [localPath];
        const outputFiles: string[] = [];

        // Check if we have standard GS or Mac SIPS
        const hasGs = await hasBinary('gs');
        const hasSips = await hasBinary('sips');

        if (!hasGs && !hasSips) {
            throw new Error("PDF to Image extraction requires Ghostscript (gs) or macOS sips, which are missing in this environment.");
        }

        console.log(`[pdf-to-image] Using ${hasGs ? 'Ghostscript' : 'SIPS'}...`);

        for (const input of inputs) {
            const buffer = await fs.readFile(input);
            const pdf = await PDFDocument.load(buffer);
            const pageCount = pdf.getPageCount();
            const baseName = path.basename(input, '.pdf');

            for (let i = 0; i < pageCount; i++) {
                // Steps:
                // 1. Extract single page to temp PDF
                const newPdf = await PDFDocument.create();
                const [page] = await newPdf.copyPages(pdf, [i]);
                newPdf.addPage(page);

                const tempPdfName = `temp-${job.id}-${baseName}-${i}.pdf`;
                const tempPdfPath = path.join(outputDir, tempPdfName);
                await fs.writeFile(tempPdfPath, await newPdf.save());

                // 2. Convert temp PDF to PNG
                const outputName = `${baseName}-page-${i + 1}.png`;
                const outputPath = path.join(outputDir, outputName);

                try {
                    if (hasGs) {
                        // GS Command - Increased to 300 DPI for better quality
                        await execAsync(`gs -dQUIET -dSAFER -dBATCH -dNOPAUSE -dNOPROMPT -sDEVICE=png16m -dTextAlphaBits=4 -dGraphicsAlphaBits=4 -r300 -sOutputFile="${outputPath}" "${tempPdfPath}"`);
                    } else if (hasSips) {
                        // SIPS Command (Mac) - Force high resolution (max dimension 3000px, approx 300dpi for A4)
                        await execAsync(`sips -s format png --resampleHeightWidthMax 3000 "${tempPdfPath}" --out "${outputPath}"`);
                    }

                    if (await fs.pathExists(outputPath)) {
                        outputFiles.push(outputPath);
                    }
                } catch (e) {
                    console.error(`[pdf-to-image] Failed to convert page ${i + 1} of ${baseName}`, e);
                } finally {
                    // Cleanup temp page
                    await fs.remove(tempPdfPath).catch(() => { });
                }
            }
        }

        if (outputFiles.length === 0) {
            throw new Error("Failed to convert any pages to images.");
        }

        const zipName = `converted-images-${job.id}.zip`;
        await zipFiles(outputFiles, outputDir, zipName);
        return { resultKey: zipName };
    }
};

export const fileProcessors = [
    compressPdfProcessor,
    pdfToWordProcessor,
    mergePdfProcessor,
    rotatePdfProcessor,
    splitPdfProcessor,
    pdfToImageProcessor
];
