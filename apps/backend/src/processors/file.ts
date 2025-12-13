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
import { logCompressionEvent } from '../monitoring/compression-logger';
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
            // If we still can't get page count, we can't safely parallelize.
            // But we can still single-pass compress.
            let errorDetails = '';
            // Unique Temp Dir for this file processing to ensure isolation
            const workId = Math.random().toString(36).substring(7);
            const tempDir = await makeTempDir(`compress-work-${job.id}-${workId}`);

            try {
                // --- TIER 1: GHOSTSCRIPT (Quality Based) ---
                if (hasGs) {
                    const gsOutput = path.join(tempDir, `temp-gs.pdf`);
                    const args = [
                        '-sDEVICE=pdfwrite', '-dCompatibilityLevel=1.4',
                        `-dPDFSETTINGS=${basePreset}`,
                        '-dNOPAUSE', '-dQUIET', '-dBATCH',
                        // Image Downsampling
                        `-dColorImageResolution=${targetDpi}`,
                        `-dGrayImageResolution=${targetDpi}`,
                        `-dMonoImageResolution=${targetDpi}`,
                        '-dDownsampleColorImages=true',
                        '-dDownsampleGrayImages=true',
                        '-dDownsampleMonoImages=true',
                        `-sOutputFile=${gsOutput}`,
                        input
                    ];

                    // 30s Hard Timeout (Requirement)
                    const res = await spawnWithTimeout('gs', args, { cwd: tempDir }, 30000);

                    if (res.code === 0 && await fs.pathExists(gsOutput)) {
                        const tempSize = (await fs.stat(gsOutput)).size;

                        // Size Sanity Check: Must not be > 5% larger (Inflation Check)
                        if (tempSize > 0 && tempSize <= inputSize * 1.05) {
                            await fs.move(gsOutput, finalOutputPath, { overwrite: true });

                            // Log Success & Return immediately
                            await logCompressionEvent({
                                jobId: job.id || 'unknown',
                                tool: 'ghostscript',
                                inputSize, outputSize: tempSize,
                                durationMs: Date.now() - start, success: true,
                                compressionRatio: tempSize / inputSize,
                                timestamp: new Date().toISOString(),
                                meta: { quality: q, pages: pageCount }
                            });
                            return finalOutputPath;
                        } else {
                            errorDetails += `GS Inflation/Empty (${tempSize} bytes); `;
                        }
                    } else {
                        errorDetails += `GS Failed (Code ${res.code} / ${res.timedOut ? 'Timeout' : 'Error'}); `;
                    }
                }

                // --- TIER 2: QPDF (Linearization & Optimization) ---
                // Only runs if Tier 1 failed or was skipped
                if (hasQpdf) {
                    const qpdfOutput = path.join(tempDir, `temp-qpdf.pdf`);
                    // Optimization Flags: Linearize + Object Streams + Stream Compression
                    const args = [
                        '--linearize',
                        '--object-streams=generate',
                        '--compress-streams=y',
                        '--compress-streams=y',
                        input,
                        qpdfOutput
                    ];

                    // 30s Hard Timeout (Requirement)
                    const res = await spawnWithTimeout('qpdf', args, {}, 30000);

                    if (res.code === 0 && await fs.pathExists(qpdfOutput)) {
                        const tempSize = (await fs.stat(qpdfOutput)).size;

                        // Size Sanity Check
                        if (tempSize > 0 && tempSize <= inputSize * 1.05) {
                            await fs.move(qpdfOutput, finalOutputPath, { overwrite: true });

                            await logCompressionEvent({
                                jobId: job.id || 'unknown',
                                tool: 'qpdf',
                                inputSize, outputSize: tempSize,
                                durationMs: Date.now() - start, success: true,
                                compressionRatio: tempSize / inputSize,
                                timestamp: new Date().toISOString(),
                                meta: { quality: q, pages: pageCount, note: 'Tier 2 used' }
                            });
                            return finalOutputPath;
                        } else {
                            errorDetails += `QPDF Inflation/Empty (${tempSize} bytes); `;
                        }
                    } else {
                        errorDetails += `QPDF Failed (Code ${res.code}); `;
                    }
                }

                // --- TIER 3: FALLBACK TO ORIGINAL ---
                // If we reached here, both engines failed or inflated the file.
                console.log(`[compress-pdf] Job ${job.id} - Fallback to original. Errors: ${errorDetails}`);
                await fs.copy(input, finalOutputPath, { overwrite: true });

                await logCompressionEvent({
                    jobId: job.id || 'unknown',
                    tool: 'original',
                    inputSize, outputSize: inputSize,
                    durationMs: Date.now() - start, success: true,
                    compressionRatio: 1.0,
                    errorDetails: `All engines failed/inflated. ${errorDetails}`,
                    timestamp: new Date().toISOString(),
                    meta: { quality: q, pages: pageCount, fallback: true }
                });

                return finalOutputPath;

            } catch (e: any) {
                // Catastrophic failure catch - should rarely happen due to spawn checks
                console.error(`[compress-pdf] Critical Error`, e);
                // Last ditch effort: ensure user gets *something*
                if (!await fs.pathExists(finalOutputPath)) {
                    await fs.copy(input, finalOutputPath);
                }
                return finalOutputPath;
            } finally {
                await removeDir(tempDir);
            }
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
