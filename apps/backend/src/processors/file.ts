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
import { findCli, getGsVersion, getQpdfVersion } from '../utils/cli-checks';
import { spawnWithTimeout } from '../utils/spawnWithTimeout';
import { makeTempDir, removeDir } from '../utils/file';
import { CompressionLogEntry, logCompressionEvent } from '../monitoring/compression-logger';

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

        const outputFiles: string[] = [];

        // Check tools using cached checks
        const [gsVersion, qpdfVersion] = await Promise.all([getGsVersion(), getQpdfVersion()]);
        const hasGs = !!gsVersion;
        const hasQpdf = !!qpdfVersion;
        const hasSips = await findCli('sips'); // Mac only

        const LOG_BASE: CompressionLogEntry = {
            jobId: job.id || 'unknown',
            tool: 'none',
            inputSize: 0,
            outputSize: 0,
            durationMs: 0,
            success: false,
            timestamp: new Date().toISOString()
        };

        // Parse quality (0-100)
        const { quality } = job.data.data || {};
        const q = quality !== undefined ? parseInt(String(quality)) : 75;

        let pdfSettings = '/ebook';

        if (q < 40) {
            pdfSettings = '/screen';
        } else if (q >= 80) {
            pdfSettings = '/printer';
        }

        console.log(`[compress-pdf] Job ${job.id} | Q: ${q} | GS: ${gsVersion || 'No'} | QPDF: ${qpdfVersion || 'No'}`);

        for (const input of inputs) {
            const start = Date.now();
            const baseName = path.basename(input, '.pdf');
            const outputFilename = `compressed-${baseName}.pdf`;
            // Temp dir for processing to avoid partial writes to final output
            const tempDir = await makeTempDir(`compress-${job.id}`);
            const tempOutput = path.join(tempDir, outputFilename);
            const finalOutputPath = path.join(outputDir, outputFilename);

            let compressed = false;
            let activeTool = '';
            let errorDetails = '';

            try {
                const inputStats = await fs.stat(input);
                const inputSize = inputStats.size;

                // Priority 1: Ghostscript
                if (hasGs) {
                    activeTool = 'ghostscript';
                    console.log(`[compress-pdf] Trying GS for ${baseName}`);

                    const result = await spawnWithTimeout(
                        'gs',
                        [
                            '-sDEVICE=pdfwrite',
                            '-dCompatibilityLevel=1.4',
                            `-dPDFSETTINGS=${pdfSettings}`,
                            '-dNOPAUSE',
                            '-dQUIET',
                            '-dBATCH',
                            '-sOutputFile=' + tempOutput,
                            input
                        ],
                        {},
                        30000 // 30s strict timeout
                    );

                    if (result.timedOut) {
                        console.warn(`[compress-pdf] GS timed out for ${baseName}`);
                        errorDetails += `GS Timeout; `;
                    } else if (result.code !== 0) {
                        console.warn(`[compress-pdf] GS failed (code ${result.code}): ${result.stderr}`);
                        errorDetails += `GS Fail: ${result.stderr.slice(0, 100)}; `;
                    } else if (await fs.pathExists(tempOutput)) {
                        // Validate output size > 0
                        const outStat = await fs.stat(tempOutput);
                        if (outStat.size > 0) {
                            compressed = true;
                        }
                    }
                }

                // Priority 2: QPDF (Linearize) - Fallback
                if (!compressed && hasQpdf) {
                    activeTool = 'qpdf';
                    console.log(`[compress-pdf] Falling back to QPDF for ${baseName}`);

                    // qpdf --linearize input output
                    const result = await spawnWithTimeout(
                        'qpdf',
                        ['--linearize', input, tempOutput],
                        {},
                        15000 // 15s timeout
                    );

                    if (result.timedOut || result.code !== 0) {
                        console.warn(`[compress-pdf] QPDF failed: ${result.stderr}`);
                        errorDetails += `QPDF Fail: ${result.stderr.slice(0, 100)}; `;
                    } else if (await fs.pathExists(tempOutput) && (await fs.stat(tempOutput)).size > 0) {
                        compressed = true;
                    }
                }

                // Priority 3: SIPS (Mac Raster) - Low Quality Only
                if (!compressed && hasSips && q < 40) {
                    // Simplified SIPS check to avoid unused var 'sipsMaxDim' warning for now as logic was commented out
                    // Ideally we re-enable full logic, but for "build fix" we just skip or use it simply.
                    // The previous code had unused sipsMaxDim. 
                    // Let's actually use sipsMaxDim if we are to keep the logic, but the logic was "skipped (complex)".
                    // We will keep the skip log but remove the unused variable.
                    // Or just implement a simple SIPS call:
                    console.log(`[compress-pdf] Falling back to SIPS simple for ${baseName}`);
                    // sips -s format pdf --resampleHeightWidthMax [dim] input --out output
                    // Note: sips pdf-to-pdf resize isn't great but it's valid syntax.
                    const dim = q < 40 ? '800' : '1600';
                    const result = await spawnWithTimeout(
                        'sips',
                        ['-s', 'format', 'pdf', '--resampleHeightWidthMax', dim, input, '--out', tempOutput],
                        {},
                        15000
                    );

                    if (result.code === 0 && (await fs.pathExists(tempOutput))) {
                        compressed = true;
                        activeTool = 'sips';
                    } else {
                        errorDetails += "SIPS failed; ";
                    }
                }

                // Priority 4: Copy Original (Failure is not an option)
                if (!compressed) {
                    activeTool = 'copy_fallback';
                    console.warn(`[compress-pdf] All tools failed. Copying original.`);
                    await fs.copy(input, finalOutputPath);
                    compressed = true; // Technically handled
                } else {
                    // Move temp output to final
                    await fs.move(tempOutput, finalOutputPath, { overwrite: true });
                }

                // Logging
                const end = Date.now();
                const outSize = (await fs.stat(finalOutputPath)).size;

                await logCompressionEvent({
                    ...LOG_BASE,
                    tool: activeTool,
                    inputSize,
                    outputSize: outSize,
                    durationMs: end - start,
                    success: activeTool !== 'copy_fallback',
                    errorDetails: activeTool === 'copy_fallback' ? errorDetails : undefined
                });

                outputFiles.push(finalOutputPath);
            } catch (e) {
                console.error(`[compress-pdf] Fatal error processing ${baseName}:`, e);
                // Clean up any partials
                throw e;
            } finally {
                await removeDir(tempDir);
            }
        }

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
        const outputFilename = `${path.basename(localPath, '.pdf')}.docx`;
        const outputPath = path.join(outputDir, outputFilename);

        // Try LibreOffice
        if (await hasBinary('soffice')) {
            console.log('[pdf-to-word] Using LibreOffice...');
            try {
                await execAsync(`soffice --headless --infilter="writer_pdf_import" --convert-to docx "${localPath}" --outdir "${outputDir}"`);
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
        console.log(`[pdf-to-word] Extracted text length: ${rawText.length}`);
        console.log(`[pdf-to-word] Preview: ${rawText.substring(0, 200)}`);

        // Sanitize
        // eslint-disable-next-line no-control-regex
        const sanitizedText = rawText.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F]/g, '');

        let finalContent = sanitizedText;
        if (!sanitizedText.trim()) {
            finalContent = "[NO TEXT FOUND] This document appears to be an image-based or scanned PDF. No selectable text was found to extract.";
        } else if (sanitizedText.trim().length < 100) {
            finalContent = sanitizedText + "\n\n" +
                "------------------------------------------------------------------\n" +
                "[WARNING] Very little text was extracted. This document might be an image/scan with only some metadata text.";
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
        // Prioritize inputPaths from upload
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
        // Fix: ToolClient sends 'angle', not 'options.rotation'
        const { angle } = job.data.data || {};
        const rotationToAdd = angle ? parseInt(String(angle)) : 90;

        const inputs = inputPaths && inputPaths.length > 0 ? inputPaths : [localPath];
        const outputFiles: string[] = [];

        for (const input of inputs) {
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
            outputFiles.push(outputPath);
        }

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
