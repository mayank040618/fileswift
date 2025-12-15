import { ToolProcessor } from './types';
import fs from 'fs-extra';
import { normalizeImage } from '../utils/normalizeImage';
import path from 'path';
import sharp from 'sharp';
import { zipFiles } from '../utils/zipper';
import { pMap } from '../utils/concurrency';

// HARD POLYFILL: Ensure DOMMatrix exists for pdf-lib here
if (typeof global.DOMMatrix === 'undefined') {
    // @ts-ignore
    global.DOMMatrix = class DOMMatrix {
        a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
        constructor(init?: any) {
            if (init) {
                this.a = init.a || 1; this.b = init.b || 0; this.c = init.c || 0;
                this.d = init.d || 1; this.e = init.e || 0; this.f = init.f || 0;
            }
        }
        multiply() { return this; }
        transformPoint(p: any) { return p; }
        toString() { return `matrix(${this.a}, ${this.b}, ${this.c}, ${this.d}, ${this.e}, ${this.f})`; }
    };
    // @ts-ignore
    global.DOMPoint = class DOMPoint {
        x = 0; y = 0; z = 0; w = 1;
        constructor(x = 0, y = 0, z = 0, w = 1) { this.x = x; this.y = y; this.z = z; this.w = w; }
        matrixTransform() { return this; }
    };
}

const imageResizerProcessor: ToolProcessor = {
    id: 'image-resizer',
    process: async ({ job, localPath, inputPaths, outputDir }) => {
        const { width, height } = job.data.data || {};
        const inputs = inputPaths && inputPaths.length > 0 ? inputPaths : [localPath];

        const outputFiles = await pMap(inputs, async (input) => {
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
            return outputPath;
        }, 5); // Concurrency 5

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
            // Safe concurrency for sharp (it uses threads internally too, so keep lower)

            const results = await pMap(inputs, async (input) => {
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

                return {
                    path: outputPath,
                    metadata: {
                        file: outputFilename,
                        originalName: originalName,
                        originalSize: result.originalSize,
                        compressedSize: result.compressedSize,
                        savedBytes: result.originalSize - result.compressedSize,
                        savedPercent: result.originalSize > 0
                            ? ((result.originalSize - result.compressedSize) / result.originalSize * 100).toFixed(1)
                            : 0
                    }
                };
            }, 3);

            const outputFiles = results.map(r => r.path);
            const metadata = results.map(r => r.metadata);

            // Clean result handling
            // We need to move the final result(s) to the EXPECTED 'outputDir' so the job processor can find them 
            // for upload/download handling.

            if (outputFiles.length === 1) {
                // Single File: Direct Move
                const singleFile = outputFiles[0];
                const destName = path.basename(singleFile);
                const finalPath = path.join(outputDir, destName);
                await fs.move(singleFile, finalPath, { overwrite: true });

                return { resultKey: destName };
            } else {
                // Multi File: Zip + Metadata
                const metaPath = path.join(tmpOutDir, 'result.json');
                await fs.writeJSON(metaPath, { processedAt: new Date(), files: metadata }, { spaces: 2 });
                outputFiles.push(metaPath);

                const zipName = `compressed-images-${job.id}.zip`;

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
        const inputs = inputPaths && inputPaths.length > 0 ? inputPaths : [localPath];

        const outputFiles = await pMap(inputs, async (input) => {
            const outputFilename = `bulk-resized-${path.basename(input, path.extname(input))}.png`;
            const outputPath = path.join(outputDir, outputFilename);
            await sharp(input).resize(800).toFile(outputPath);
            return outputPath;
        }, 5);

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
        const pdflib = await import('pdf-lib'); // Dynamic import to ensure polyfills loaded
        const { PDFDocument, PageSizes } = pdflib;

        const pdfDoc = await PDFDocument.create();
        const inputs = inputPaths && inputPaths.length > 0 ? inputPaths : [localPath];
        const alignment = job.data.data?.alignment || 'center'; // top, center, bottom

        for (const input of inputs) {
            let normalized;
            try {
                normalized = await normalizeImage(input);
            } catch (e) {
                console.error(`Failed to normalize image ${input}`, e);
                continue;
            }

            let image;
            try {
                if (normalized.format === 'png') {
                    image = await pdfDoc.embedPng(normalized.buffer);
                } else {
                    image = await pdfDoc.embedJpg(normalized.buffer);
                }
            } catch (e) {
                console.error(`Failed to embed image ${input}`, e);
                continue;
            }

            // Standardize Page (A4)
            // If image is landscape, use Landscape A4
            const isLandscape = normalized.width > normalized.height;
            const pageWidth = isLandscape ? PageSizes.A4[1] : PageSizes.A4[0];
            const pageHeight = isLandscape ? PageSizes.A4[0] : PageSizes.A4[1];

            const page = pdfDoc.addPage([pageWidth, pageHeight]);

            // Calculate Fit (Contain with margin)
            const margin = 20;
            const availableWidth = pageWidth - (margin * 2);
            const availableHeight = pageHeight - (margin * 2);

            const scale = Math.min(
                availableWidth / normalized.width,
                availableHeight / normalized.height
            );

            // If image is smaller than page, don't scale up (optional choice, but "contain" usually means max fit)
            // Let's stick to "contain" (scale UP or DOWN to fit available space) for consistent looking PDFs
            // Or better: Math.min(1, ...) if we don't want pixelation.
            // But usually PDF users want full page. Let's use exact fit to available area.

            const displayWidth = normalized.width * scale;
            const displayHeight = normalized.height * scale;

            // X Position (Always Center)
            const x = (pageWidth - displayWidth) / 2;

            // Y Position (Based on Alignment)
            let y = 0;
            if (alignment === 'top') {
                // Top of page (minus margin) - height of image
                y = pageHeight - margin - displayHeight;
            } else if (alignment === 'bottom') {
                // Bottom margin
                y = margin;
            } else {
                // Center
                y = (pageHeight - displayHeight) / 2;
            }

            page.drawImage(image, {
                x,
                y,
                width: displayWidth,
                height: displayHeight,
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
