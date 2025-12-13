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
import { checkTools } from '../utils/cli-checks';

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

const getPageCount = async (filePath: string): Promise<number> => {
    try {
        const buffer = await fs.readFile(filePath);
        const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
        return doc.getPageCount();
    } catch (e) {
        console.warn(`Failed to count pages for ${filePath}`, e);
        return 0;
    }
};

const compressPdfProcessor: ToolProcessor = {
    id: 'compress-pdf',
    process: async ({ job, localPath, inputPaths, outputDir }) => {
        const inputs: string[] = (inputPaths && inputPaths.length > 0)
            ? inputPaths
            : (localPath ? [localPath] : []);

        if (inputs.length === 0) throw new Error("No inputs provided");

        const tools = await checkTools();
        const gsVersion = tools.gsVersion;
        const qpdfVersion = tools.qpdfVersion;

        const hasGs = !!gsVersion;
        const hasQpdf = !!qpdfVersion;

        const { quality } = job.data.data || {};
        const q = quality !== undefined ? parseInt(String(quality)) : 75;
        // DPI Calculation: 50 - 300
        const targetDpi = Math.floor(Math.max(q * 3, 50));

        let basePreset = '/screen';
        if (targetDpi >= 150) basePreset = '/ebook';
        if (targetDpi >= 300) basePreset = '/printer';

        console.log(`[compress-pdf] Job ${job.id} | Q: ${q} | DPI: ${targetDpi} | Preset: ${basePreset}`);

        const processFile = async (input: string) => {
            if (!await isValidPdf(input)) {
                throw new Error("Invalid PDF file detected (incorrect magic bytes)");
            }

            const start = Date.now();
            const inputStats = await fs.stat(input);
            const inputSize = inputStats.size;
            const baseName = path.basename(input, '.pdf');
            const outputFilename = `compressed-${baseName}.pdf`;
            const finalOutputPath = path.join(outputDir, outputFilename);

            // 1. Get Page Count (Critical for Validation)
            let pageCount = await getPageCount(input);
            if (pageCount === 0) {
                // Try qpdf if pdf-lib failed
                if (hasQpdf) {
                    try {
                        const res = await execAsync(`qpdf --show-npages "${input}"`);
                        pageCount = parseInt(res.stdout.trim());
                    } catch { }
                }
            }

            // If we still can't get page count, we can't safely parallelize.
            // But we can still single-pass compress.
            const canParallelize = pageCount > 5 && hasGs;

            let compressed = false;
            let activeTool = '';
            let errorDetails = '';

            // --- STRATEGY 1: Parallel Compression (Safe Mode) ---
            if (canParallelize) {
                console.log(`[compress-pdf] Attempting Safe Parallel for ${baseName} (${pageCount} pages)`);
                activeTool = 'ghostscript-parallel';
                const tempDir = await makeTempDir(`safe-parallel-${job.id}`);

                try {
                    const CHUNK_SIZE = 5;
                    const chunks: { start: number, end: number, index: number }[] = [];
                    for (let i = 0; i < pageCount; i += CHUNK_SIZE) {
                        chunks.push({ start: i + 1, end: Math.min(i + CHUNK_SIZE, pageCount), index: chunks.length });
                    }

                    // Strict Parallel Execution
                    const chunkPaths = await pMap(chunks, async (chunk) => {
                        const chunkOutput = path.join(tempDir, `chunk-${chunk.index}.pdf`);
                        const args = [
                            '-sDEVICE=pdfwrite', '-dCompatibilityLevel=1.4',
                            `-dPDFSETTINGS=${basePreset}`,
                            '-dNOPAUSE', '-dQUIET', '-dBATCH',
                            `-dColorImageResolution=${targetDpi}`,
                            `-dGrayImageResolution=${targetDpi}`,
                            `-dMonoImageResolution=${targetDpi}`,
                            '-dDownsampleColorImages=true',
                            '-dDownsampleGrayImages=true',
                            '-dDownsampleMonoImages=true',
                            `-dFirstPage=${chunk.start}`,
                            `-dLastPage=${chunk.end}`,
                            `-sOutputFile=${chunkOutput}`,
                            input
                        ];

                        const res = await spawnWithTimeout('gs', args, { cwd: tempDir }, 60000); // 60s per chunk
                        if (res.timedOut || res.code !== 0) {
                            throw new Error(`Chunk ${chunk.index} GS failed: ${res.stderr}`);
                        }
                        if (!await fs.pathExists(chunkOutput) || (await fs.stat(chunkOutput)).size === 0) {
                            throw new Error(`Chunk ${chunk.index} Empty Output`);
                        }
                        return chunkOutput;
                    }, 4); // Concurrency 4

                    // Merge Chunks
                    const mergeArgs = [
                        '-sDEVICE=pdfwrite', '-dCompatibilityLevel=1.4',
                        '-dNOPAUSE', '-dQUIET', '-dBATCH',
                        `-sOutputFile=${finalOutputPath}`,
                        ...chunkPaths
                    ];
                    const mergeRes = await spawnWithTimeout('gs', mergeArgs, {}, 120000);
                    if (mergeRes.timedOut || mergeRes.code !== 0) throw new Error("Merge Failed");

                    // FINAL VERIFICATION (Crucial)
                    const outputPageCount = await getPageCount(finalOutputPath);
                    if (outputPageCount !== pageCount) {
                        throw new Error(`Integrity Check Failed: Input ${pageCount} pages, Output ${outputPageCount} pages`);
                    }

                    compressed = true;

                } catch (e) {
                    console.warn(`[compress-pdf] Safe Parallel failed, reverting to Serial. Reason: ${e instanceof Error ? e.message : String(e)}`);
                    activeTool = ''; // Reset tool
                    // Cleanup output if it exists to avoid partial file being used
                    if (await fs.pathExists(finalOutputPath)) await fs.remove(finalOutputPath);
                } finally {
                    await removeDir(tempDir);
                }
            }

            // --- STRATEGY 2: Single Pass Fallback ---
            if (!compressed) {
                const uniqueId = Math.random().toString(36).substring(7);
                const tempDir = await makeTempDir(`compress-serial-${job.id}-${uniqueId}`);
                const tempOutput = path.join(tempDir, outputFilename);

                try {
                    if (hasGs) {
                        activeTool = 'ghostscript';
                        const args = [
                            '-sDEVICE=pdfwrite', '-dCompatibilityLevel=1.4',
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
                        ];
                        const res = await spawnWithTimeout('gs', args, { cwd: tempDir }, 180000); // 3 min timeout

                        if (res.code === 0 && await fs.pathExists(tempOutput) && (await fs.stat(tempOutput)).size > 0) {
                            compressed = true;
                        } else {
                            errorDetails += `GS Serial Failed: ${res.stderr || (res.timedOut ? 'Timeout' : 'Unknown')}; `;
                        }
                    }


                    // --- QPDF Fallback (Tier 2) ---
                    if (!compressed && hasQpdf) {
                        activeTool = 'qpdf';
                        // Enhanced QPDF flags for compression
                        const args = [
                            '--linearize',
                            '--object-streams=generate',
                            '--compress-streams=y',
                            input,
                            tempOutput
                        ];
                        const res = await spawnWithTimeout('qpdf', args, {}, 20000);
                        if (res.code === 0 && await fs.pathExists(tempOutput) && (await fs.stat(tempOutput)).size > 0) {
                            compressed = true;
                        }
                    }


                    // --- Size Sanity Check ---
                    // Even if compression "succeeded", did it make the file significantly larger?
                    if (compressed) {
                        const tempSize = (await fs.stat(tempOutput)).size;
                        // Tolerance: 5%
                        if (tempSize > inputSize * 1.05) {
                            console.log(`[compress-pdf] Output (${tempSize}) larger than input (${inputSize}). Discarding.`);
                            compressed = false; // Trigger fallback to original
                        } else {
                            await fs.move(tempOutput, finalOutputPath, { overwrite: true });
                        }
                    }

                    // Ultimate Fallback: Copy original
                    if (!compressed) {
                        activeTool = 'copy_fallback';
                        await fs.copy(input, finalOutputPath);
                    }


                } finally {
                    await removeDir(tempDir);
                }
            }

            const end = Date.now();
            const outSize = (await fs.pathExists(finalOutputPath)) ? (await fs.stat(finalOutputPath)).size : inputSize;

            await logCompressionEvent({
                jobId: job.id || 'unknown',
                tool: activeTool,
                inputSize,
                outputSize: outSize,
                durationMs: end - start,
                success: activeTool !== 'copy_fallback',
                errorDetails,
                compressionRatio: inputSize > 0 ? outSize / inputSize : 1,
                timestamp: new Date().toISOString(),
                meta: { quality: q, pages: pageCount, method: activeTool }
            });

            return finalOutputPath;
        };

        const outputFiles = (inputs.length === 1)
            ? [await processFile(inputs[0])]
            : await pMap(inputs, processFile, 2);

        if (outputFiles.length === 0) throw new Error("Processing failed");

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
