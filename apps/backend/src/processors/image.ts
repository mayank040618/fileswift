import { ToolProcessor } from './types';
import fs from 'fs-extra';
import path from 'path';
import sharp from 'sharp';
import { PDFDocument } from 'pdf-lib';
import { zipFiles } from '../utils/zipper';

const imageResizerProcessor: ToolProcessor = {
    id: 'image-resizer',
    process: async ({ job, localPath, inputPaths, outputDir }) => {
        const { width, height } = job.data.data || {};
        const inputs = inputPaths && inputPaths.length > 0 ? inputPaths : [localPath];
        const outputFiles: string[] = [];

        for (const input of inputs) {
            let pipeline = sharp(input);

            if (width || height) {
                pipeline = pipeline.resize({
                    width: width ? parseInt(String(width)) : undefined,
                    height: height ? parseInt(String(height)) : undefined,
                    fit: 'contain'
                });
            }

            const outputFilename = `resized-${path.basename(input, path.extname(input))}.png`;
            const outputPath = path.join(outputDir, outputFilename);
            await pipeline.toFile(outputPath);
            outputFiles.push(outputPath);
        }

        if (outputFiles.length === 1) {
            return { resultKey: path.basename(outputFiles[0]) };
        } else {
            // Zip
            const zipName = `resized-images-${job.id}.zip`;
            await zipFiles(outputFiles, outputDir, zipName);
            return { resultKey: zipName };
        }
    }
};


import { compressImage } from '../utils/compressImage';
import { createTempDir, cleanTempDir } from '../utils/fs';

const imageCompressorProcessor: ToolProcessor = {
    id: 'image-compressor',
    process: async ({ job, localPath, inputPaths, outputDir }) => {
        // Create a truly unique temp dir for this specific job execution to avoid collisions
        // We ignore 'outputDir' passed by default in favor of our isolated workspace
        const tmpWorkDir = await createTempDir('img-compress-');
        const tmpOutDir = path.join(tmpWorkDir, 'out');
        await fs.ensureDir(tmpOutDir);

        try {
            const { quality } = job.data.data || {};
            const q = quality ? parseInt(String(quality)) : 75;

            const inputs = inputPaths && inputPaths.length > 0 ? inputPaths : [localPath];
            const outputFiles: string[] = [];
            const metadata: any[] = [];

            for (const input of inputs) {
                const inputBuffer = await fs.readFile(input);
                const originalName = path.basename(input);

                const result = await compressImage(inputBuffer, originalName, q);

                // Determine output filename
                const ext = path.extname(input);
                const baseName = path.basename(input, ext);
                const outExt = result.format === 'jpeg' ? '.jpg' : `.${result.format}`;

                // "out/<originalname>-q<quality>.<ext>"
                const safeName = baseName.replace(/[^a-zA-Z0-9-_]/g, '_');
                const outputFilename = `${safeName}-q${q}${outExt}`;
                const outputPath = path.join(tmpOutDir, outputFilename);

                await fs.writeFile(outputPath, result.buffer);
                outputFiles.push(outputPath);

                metadata.push({
                    file: outputFilename,
                    originalName: originalName,
                    originalSize: result.originalSize,
                    compressedSize: result.compressedSize,
                    savedBytes: result.originalSize - result.compressedSize,
                    savedPercent: result.originalSize > 0
                        ? ((result.originalSize - result.compressedSize) / result.originalSize * 100).toFixed(1)
                        : 0
                });
            }

            // Clean result handling
            // We need to move the final result(s) to the EXPECTED 'outputDir' so the job processor can find them 
            // for upload/download handling.

            if (outputFiles.length === 1) {
                // Single File: Direct Move
                const singleFile = outputFiles[0];
                const destName = path.basename(singleFile);
                const finalPath = path.join(outputDir, destName);
                await fs.move(singleFile, finalPath, { overwrite: true });

                // Note: We can't easily add Headers here as the processor just returns a key.
                // The logical place for headers would be the download endpoint.
                // For now, we return the simple file.
                return { resultKey: destName };
            } else {
                // Multi File: Zip + Metadata
                const metaPath = path.join(tmpOutDir, 'result.json');
                await fs.writeJSON(metaPath, { processedAt: new Date(), files: metadata }, { spaces: 2 });
                outputFiles.push(metaPath);

                const zipName = `compressed-images-${job.id}.zip`;
                // const zipPath = path.join(outputDir, zipName); // unused

                await zipFiles(outputFiles, outputDir, zipName);
                return { resultKey: zipName };
            }

        } finally {
            // Cleanup our unique temp workspace
            await cleanTempDir(tmpWorkDir);
        }
    }
};


const bulkImageResizerProcessor: ToolProcessor = {
    id: 'bulk-image-resizer',
    process: async ({ job, localPath, inputPaths, outputDir }) => {
        // Same as image-resizer but force defaults? reused logic
        // For MVP just reuse same logic
        const inputs = inputPaths && inputPaths.length > 0 ? inputPaths : [localPath];
        const outputFiles: string[] = [];

        for (const input of inputs) {
            const outputFilename = `bulk-resized-${path.basename(input, path.extname(input))}.png`;
            const outputPath = path.join(outputDir, outputFilename);
            await sharp(input).resize(800).toFile(outputPath);
            outputFiles.push(outputPath);
        }

        if (outputFiles.length === 1) {
            return { resultKey: path.basename(outputFiles[0]) };
        } else {
            const zipName = `bulk-resized-${job.id}.zip`;
            await zipFiles(outputFiles, outputDir, zipName);
            return { resultKey: zipName };
        }
    }
};

const imageToPdfProcessor: ToolProcessor = {
    id: 'image-to-pdf',
    process: async ({ job, localPath, inputPaths, outputDir }) => {
        const pdfDoc = await PDFDocument.create();
        const inputs = inputPaths && inputPaths.length > 0 ? inputPaths : [localPath];

        for (const input of inputs) {
            const imageBytes = await fs.readFile(input);
            let image;
            try {
                // Determine type roughly
                const ext = path.extname(input).toLowerCase();
                if (ext === '.png') {
                    image = await pdfDoc.embedPng(imageBytes);
                } else if (ext === '.jpg' || ext === '.jpeg') {
                    image = await pdfDoc.embedJpg(imageBytes);
                } else {
                    // Fallback try both
                    try { image = await pdfDoc.embedJpg(imageBytes); }
                    catch { image = await pdfDoc.embedPng(imageBytes); }
                }
            } catch (e) {
                console.error(`Failed to embed image ${input}`, e);
                continue;
            }

            const page = pdfDoc.addPage([image.width, image.height]);
            page.drawImage(image, {
                x: 0,
                y: 0,
                width: image.width,
                height: image.height,
            });
        }

        const outputBytes = await pdfDoc.save();
        const outputFilename = `converted-${job.id}.pdf`;
        const outputPath = path.join(outputDir, outputFilename);
        await fs.writeFile(outputPath, outputBytes);

        return { resultKey: outputFilename, metadata: { type: 'pdf' } };
    }
};


export const imageProcessors = [
    imageResizerProcessor,
    imageCompressorProcessor,
    bulkImageResizerProcessor,
    imageToPdfProcessor,
    // Legacy AI
    // upscaleProcessor,
    // enhanceProcessor,
    // colorizeProcessor
];
