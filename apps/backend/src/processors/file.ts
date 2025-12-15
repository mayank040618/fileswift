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

        // --- RULE 3: MINIMUM SIZE THRESHOLD ---
        // Do not compress if < 500KB (likely to inflate or needless)
        // We handle this inside processFile loop

        console.log(`[compress-pdf] Job ${job.id} | Q: ${q}`);

        const processFile = async (input: string) => {
            if (!await isValidPdf(input)) {
                throw new Error("Invalid PDF file detected");
            }

            const start = Date.now();
            const inputStats = await fs.stat(input);
            const inputSize = inputStats.size;
            const baseName = path.basename(input, '.pdf');
            const outputFilename = `compressed-${baseName}.pdf`;
            const finalOutputPath = path.join(outputDir, outputFilename);

            // 0. CHECK MINIMUM SIZE
            if (inputSize < 500 * 1024) { // 500 KB
                console.log(`[compress-pdf] Skipping ${baseName} (Too small: ${inputSize} bytes)`);
                await fs.copy(input, finalOutputPath);
                return {
                    path: finalOutputPath,
                    meta: {
                        action: 'skipped_small',
                        originalSize: inputSize,
                        finalSize: inputSize
                    }
                };
            }

            // 1. Get Page Count & Text Stats for Classification
            let pageCount = await getPageCount(input);

            // Fallback for page count
            if (pageCount === 0 && hasQpdf) {
                try {
                    const res = await execAsync(`qpdf --show-npages "${input}"`);
                    pageCount = parseInt(res.stdout.trim());
                } catch { }
            }
            if (pageCount === 0) pageCount = 1; // Fallback to avoid division by zero

            // Simple Heuristic for Classification
            // We use pdf-parse (referenced in document.ts) to get text length? 
            // Importing pdf-parse here locally to keep it clean, or assume simple size heuristic.
            // Since we don't have pdf-parse imported in 'file.ts' (it was in document.ts), 
            // and adding imports might break things if not careful, let's look at imports.
            // Ah, line 8 says: // @ts-ignore import { PDFParse } from 'pdf-parse'; -> It IS imported!
            // Wait, looking at file content provided previously...
            // line 8: import { PDFParse } from 'pdf-parse'; -> This might be wrong import style for the library.
            // document.ts used `require('pdf-parse')`.
            // Let's stick to purely size-based heuristic for robustness if pdf-parse is flaky, 
            // OR try a quick text extraction if easy.

            const avgBytesPerPage = inputSize / pageCount;
            let classification = 'standard';

            // > 100KB per page usually means images/scans. < 30KB usually means text.
            if (avgBytesPerPage > 100 * 1024) {
                classification = 'image-heavy';
            } else if (avgBytesPerPage < 40 * 1024) {
                classification = 'text-heavy';
            }

            // Classification Logic for DPI/Quality
            // Image-heavy: Safe to downsample aggressive.
            // Text-heavy: Be careful, don't rasterize text.

            let targetDpi = Math.floor(Math.max(q * 3, 72));
            let basePreset = '/ebook'; // Default 150 dpi-ish

            if (classification === 'image-heavy') {
                // Aggressive checks
                basePreset = '/screen'; // 72 dpi
                targetDpi = Math.max(72, q * 2);
            } else if (classification === 'text-heavy') {
                basePreset = '/printer'; // 300 dpi (preserve text vectors mostly)
                targetDpi = 300;
            }

            console.log(`[compress-pdf] File: ${baseName} | Size: ${(inputSize / 1024 / 1024).toFixed(2)}MB | Pages: ${pageCount} | Class: ${classification} | Preset: ${basePreset}`);

            // Unique Temp Dir
            const workId = Math.random().toString(36).substring(7);
            const tempDir = await makeTempDir(`compress-work-${job.id}-${workId}`);

            try {
                let bestPath = '';
                let bestSize = inputSize; // Start with original being the "best" so far (baseline)

                // --- TIER 1: GHOSTSCRIPT ---
                if (hasGs) {
                    const gsOutput = path.join(tempDir, `temp-gs.pdf`);
                    const args = [
                        '-sDEVICE=pdfwrite', '-dCompatibilityLevel=1.4',
                        `-dPDFSETTINGS=${basePreset}`,
                        '-dNOPAUSE', '-dQUIET', '-dBATCH',
                        // Safety: Do not rotate pages automatically
                        '-dAutoRotatePages=/None',
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

                    const res = await spawnWithTimeout('gs', args, { cwd: tempDir }, 45000); // Increased timeout

                    if (res.code === 0 && await fs.pathExists(gsOutput)) {
                        const gsSize = (await fs.stat(gsOutput)).size;
                        console.log(`[compress-pdf] GS Result: ${gsSize} bytes (Ratio: ${(gsSize / inputSize).toFixed(2)})`);

                        // RULE 1: ABSOLUTE SIZE SAFETY
                        // Must be strictly SMALLER. Equal is not good enough to justify the rewrite risk.
                        if (gsSize < inputSize) {
                            bestPath = gsOutput;
                            bestSize = gsSize;
                        }
                    }
                }

                // --- TIER 2: QPDF (Linearization) ---
                // If GS failed to beat original, OR we want to optimize GS output?
                // Usually running QPDF *after* GS is good for web optimization (linearization).
                // But running QPDF on original is also a fallback.

                let sourceForQpdf = bestPath || input; // Process the best candidate so far
                const qpdfOutput = path.join(tempDir, `temp-qpdf.pdf`);

                if (hasQpdf) {
                    const args = [
                        '--linearize', // Web optimized
                        '--object-streams=generate',
                        '--recompress-flate',
                        sourceForQpdf,
                        qpdfOutput
                    ];
                    const res = await spawnWithTimeout('qpdf', args, {}, 30000);
                    if (res.code === 0 && await fs.pathExists(qpdfOutput)) {
                        const qpdfSize = (await fs.stat(qpdfOutput)).size;
                        console.log(`[compress-pdf] QPDF Result: ${qpdfSize} bytes`);

                        if (qpdfSize < bestSize) {
                            bestPath = qpdfOutput;
                            bestSize = qpdfSize;
                        }
                    }
                }

                // --- FINAL DECISION ---
                let action = 'compressed';

                // If we haven't found a smaller file
                if (!bestPath || bestSize >= inputSize) {
                    console.log(`[compress-pdf] No reduction achieved. Returning original.`);
                    await fs.copy(input, finalOutputPath, { overwrite: true });
                    action = 'skipped_optimized';
                    bestSize = inputSize;
                } else {
                    // Valid compression
                    console.log(`[compress-pdf] Validation Passed. Saving ${(bestSize / 1024).toFixed(2)} KB.`);
                    await fs.move(bestPath, finalOutputPath, { overwrite: true });
                }

                await logCompressionEvent({
                    jobId: job.id || 'unknown',
                    tool: 'smart-engine',
                    inputSize, outputSize: bestSize,
                    durationMs: Date.now() - start, success: true,
                    compressionRatio: bestSize / inputSize,
                    timestamp: new Date().toISOString(),
                    meta: { quality: q, pages: pageCount, classification, action }
                });

                return {
                    path: finalOutputPath,
                    meta: { action, originalSize: inputSize, finalSize: bestSize }
                };

            } catch (e: any) {
                console.error(`[compress-pdf] Error processing ${baseName}:`, e);
                // Safe Fallback
                if (!await fs.pathExists(finalOutputPath)) {
                    await fs.copy(input, finalOutputPath);
                }
                return {
                    path: finalOutputPath,
                    meta: { action: 'fallback_error', originalSize: inputSize, finalSize: inputSize }
                };
            } finally {
                await removeDir(tempDir);
            }
        };

        const results = (inputs.length === 1)
            ? [await processFile(inputs[0])]
            : await pMap(inputs, processFile, 2);

        // Aggregate Metadata for Frontend
        // We need to pass this metadata back. 
        // The return type of `process` handles { resultKey, metadata }.
        // We will sum up sizes for bulk stats.

        const totalOriginal = results.reduce((acc, r) => acc + (r.meta.originalSize || 0), 0);
        const totalFinal = results.reduce((acc, r) => acc + (r.meta.finalSize || 0), 0);
        const actions = results.map(r => r.meta.action);

        // Determine primary action for UI message
        // If mixed, prioritize 'compressed' > 'skipped_optimized'
        let primaryAction = 'skipped_optimized';
        if (actions.includes('compressed')) primaryAction = 'compressed';
        else if (actions.every(a => a === 'skipped_small')) primaryAction = 'skipped_small';

        const outputPaths = results.map(r => r.path);

        if (outputPaths.length === 1) {
            return {
                resultKey: path.basename(outputPaths[0]),
                metadata: {
                    type: 'pdf',
                    originalSize: totalOriginal,
                    finalSize: totalFinal,
                    action: primaryAction
                }
            };
        } else {
            const zipName = `compressed-pdfs-${job.id}.zip`;
            await zipFiles(outputPaths, outputDir, zipName);
            return {
                resultKey: zipName,
                metadata: {
                    type: 'zip',
                    originalSize: totalOriginal,
                    finalSize: totalFinal,
                    action: primaryAction
                }
            };
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
            try {
                const pdfBytes = await fs.readFile(input);
                const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
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
            } catch (e) {
                console.error(`[rotate-pdf] Failed to rotate ${input}`, e);
                // Fallback: Copy original
                const outputFilename = `failed-rotate-${path.basename(input)}`;
                const outputPath = path.join(outputDir, outputFilename);
                await fs.copy(input, outputPath);
                return outputPath;
            }
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
