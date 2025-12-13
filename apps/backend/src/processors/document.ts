import { ToolProcessor } from './types';
import OpenAI from 'openai';
import fs from 'fs-extra';
// @ts-ignore
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

let pdf = require('pdf-parse');
// Handle ESM/CJS interop where require might return { default: fn }
if (typeof pdf !== 'function' && (pdf as any).default) {
    pdf = (pdf as any).default;
}
import path from 'path';
import { spawnWithTimeout } from '../utils/spawnWithTimeout';

// Mock OpenAI if key missing or AI disabled
const enableAI = process.env.ENABLE_AI !== 'false';
const openai = (enableAI && process.env.OPENAI_API_KEY)
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null;

// Helper to extract text
const extractText = async (filePath: string): Promise<string> => {
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
};

// --- Processors ---

import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import { PDFDocument, StandardFonts } from 'pdf-lib';

const summarizeProcessor: ToolProcessor = {
    id: 'ai-summary',
    process: async ({ job, localPath, outputDir }) => {
        const text = await extractText(localPath);
        const cleanText = text.trim();

        // OCR Check
        if (cleanText.length < 50) {
            const warningMsg = "This document appears to be a scanned image or contains very little text. AI Summary cannot process it without OCR (not currently enabled).";
            const result = {
                tldr: "OCR Required",
                bullets: ["Document is likely an image scan", "No selectable text found", "Try converting to text first"],
                paragraph: warningMsg
            };

            // Save and return early to save API cost
            const jsonPath = path.join(outputDir, `${job.id}-summary.json`);
            await fs.writeJson(jsonPath, result);

            // Create basic export indicating failure
            const txtPath = path.join(outputDir, `${job.id}-summary.txt`);
            await fs.writeFile(txtPath, warningMsg);

            const exports: Record<string, { fileName: string, localPath: string }> = {
                txt: { fileName: `summary.txt`, localPath: txtPath }
            };

            // We return a limited exports object.
            // The type definition expects Record<string, ...>.
            return {
                resultKey: path.basename(jsonPath),
                metadata: { type: 'json' },
                exports
            };
        }

        // Truncate for demo if token limit is an issue
        const truncated = cleanText.slice(0, 15000);

        let result = {
            tldr: "Could not generate summary (OpenAI Key missing)",
            bullets: ["Check API Key"],
            paragraph: "Please provide a valid OpenAI API Key to generate real summaries."
        };

        if (openai) {
            const completion = await openai.chat.completions.create({
                messages: [
                    { role: "system", content: "You are a helpful summarizer. Return a JSON with keys: tldr, bullets, and paragraph." },
                    { role: "user", content: `Summarize this text:\n\n${truncated}` }
                ],
                model: "gpt-4o-mini",
                response_format: { type: "json_object" }
            });
            const content = completion.choices[0].message.content;
            result = JSON.parse(content || '{}');
        }

        // 1. Save JSON (Primary Result)
        const jsonPath = path.join(outputDir, `${job.id}-summary.json`);
        await fs.writeJson(jsonPath, result);

        // 2. Generate Exports

        // TXT Export
        const txtContent = `TL;DR:\n${result.tldr}\n\nKey Points:\n${result.bullets.map((b: string) => `- ${b}`).join('\n')}\n\nSummary:\n${result.paragraph}`;
        const txtPath = path.join(outputDir, `${job.id}-summary.txt`);
        await fs.writeFile(txtPath, txtContent);

        // DOCX Export
        const doc = new Document({
            sections: [{
                properties: {},
                children: [
                    new Paragraph({ text: "Document Summary", heading: HeadingLevel.TITLE }),
                    new Paragraph({ text: "TL;DR", heading: HeadingLevel.HEADING_1 }),
                    new Paragraph({ children: [new TextRun(result.tldr)] }),
                    new Paragraph({ text: "Key Points", heading: HeadingLevel.HEADING_1 }),
                    ...result.bullets.map((b: string) => new Paragraph({ text: b, bullet: { level: 0 } })),
                    new Paragraph({ text: "Detailed Summary", heading: HeadingLevel.HEADING_1 }),
                    new Paragraph({ text: result.paragraph })
                ],
            }],
        });
        const docBuffer = await Packer.toBuffer(doc);
        const docPath = path.join(outputDir, `${job.id}-summary.docx`);
        await fs.writeFile(docPath, docBuffer);

        // PDF Export (Simple Text)
        const pdfDoc = await PDFDocument.create();
        let page = pdfDoc.addPage();
        const { width, height } = page.getSize();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        let y = height - 50;
        const margin = 50;
        const maxWidth = width - (margin * 2);

        const writeLine = (text: string, size = 12, isBold = false) => {
            const currentFont = isBold ? boldFont : font;
            // Very basic wrapping
            const words = text.split(' ');
            let line = '';

            for (const word of words) {
                const testLine = line + word + ' ';
                const textWidth = currentFont.widthOfTextAtSize(testLine, size);
                if (textWidth > maxWidth) {
                    page.drawText(line, { x: margin, y, size, font: currentFont });
                    y -= (size + 5);
                    line = word + ' ';

                    if (y < margin) {
                        page = pdfDoc.addPage();
                        y = height - margin;
                    }
                } else {
                    line = testLine;
                }
            }
            page.drawText(line, { x: margin, y, size, font: currentFont });
            y -= (size + 5);

            if (y < margin) {
                page = pdfDoc.addPage();
                y = height - margin;
            }
        };

        writeLine("Document Summary", 18, true);
        y -= 10;

        writeLine("TL;DR", 14, true);
        writeLine(result.tldr);
        y -= 10;

        writeLine("Key Points", 14, true);
        result.bullets.forEach((b: string) => writeLine(`• ${b}`));
        y -= 10;

        writeLine("Detailed Summary", 14, true);
        writeLine(result.paragraph);

        const pdfBytes = await pdfDoc.save();
        const pdfPath = path.join(outputDir, `${job.id}-summary.pdf`);
        await fs.writeFile(pdfPath, pdfBytes);

        return {
            resultKey: path.basename(jsonPath),
            metadata: { type: 'json' },
            exports: {
                txt: { fileName: `${job.id}-summary.txt`, localPath: txtPath },
                docx: { fileName: `${job.id}-summary.docx`, localPath: docPath },
                pdf: { fileName: `${job.id}-summary.pdf`, localPath: pdfPath }
            }
        };
    }
};

const notesProcessor: ToolProcessor = {
    id: 'ai-notes',
    process: async ({ job, localPath, outputDir }) => {
        const text = await extractText(localPath);
        const truncated = text.slice(0, 15000);

        if (!openai) throw new Error("OpenAI Key missing");

        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: "You are a note-taking assistant. Generate structured notes. Return JSON with keys: title, topics (array of { heading, points })." },
                { role: "user", content: `Create notes for:\n\n${truncated}` }
            ],
            model: "gpt-4o-mini",
            response_format: { type: "json_object" }
        });

        const result = completion.choices[0].message.content;
        const outputPath = path.join(outputDir, `${job.id}-notes.json`);
        await fs.writeJson(outputPath, JSON.parse(result || '{}'));
        return { resultKey: path.basename(outputPath), metadata: { type: 'json' } };
    }
};

const rewriteProcessor: ToolProcessor = {
    id: 'ai-rewrite',
    process: async ({ job, localPath, outputDir }) => {
        const text = await extractText(localPath);
        const truncated = text.slice(0, 15000);
        const { tone } = job.data.data?.options || { tone: 'professional' };

        if (!openai) throw new Error("OpenAI Key missing");

        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: `You are an editor. Rewrite the text in a ${tone} tone. Return JSON with key 'rewrittenText'.` },
                { role: "user", content: `Rewrite this:\n\n${truncated}` }
            ],
            model: "gpt-4o-mini",
            response_format: { type: "json_object" }
        });

        const result = completion.choices[0].message.content;
        const outputPath = path.join(outputDir, `${job.id}-rewrite.json`);
        await fs.writeJson(outputPath, JSON.parse(result || '{}'));
        return { resultKey: path.basename(outputPath), metadata: { type: 'json' } };
    }
};

const translateProcessor: ToolProcessor = {
    id: 'ai-translate',
    process: async ({ job, localPath, outputDir }) => {
        const text = await extractText(localPath);
        const truncated = text.slice(0, 15000);
        const { language } = job.data.data?.options || { language: 'spanish' };

        if (!openai) throw new Error("OpenAI Key missing");

        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: `You are a translator. Translate the text to ${language}. Return JSON with key 'translatedText'.` },
                { role: "user", content: `Translate this:\n\n${truncated}` }
            ],
            model: "gpt-4o-mini",
            response_format: { type: "json_object" }
        });

        const result = completion.choices[0].message.content;
        const outputPath = path.join(outputDir, `${job.id}-translate.json`);
        await fs.writeJson(outputPath, JSON.parse(result || '{}'));
        return { resultKey: path.basename(outputPath), metadata: { type: 'json' } };
    }
};

const rotatePdfProcessor: ToolProcessor = {
    id: 'rotate-pdf',
    process: async ({ job, localPath, outputDir }) => {
        const { angle = '90' } = job.data.data || {};
        const pdfBytes = await fs.readFile(localPath);
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const degrees = parseInt(String(angle));

        const pages = pdfDoc.getPages();
        pages.forEach(page => {
            const rotation = page.getRotation();
            // @ts-ignore
            page.setRotation({ type: 'degrees', angle: rotation.angle + degrees });
        });

        const outputBytes = await pdfDoc.save();
        const outputFilename = `rotated-${job.id}.pdf`;
        const outputPath = path.join(outputDir, outputFilename);
        await fs.writeFile(outputPath, outputBytes);

        return { resultKey: outputFilename, metadata: { type: 'pdf' } };
    }
};

const compressPdfProcessor: ToolProcessor = {
    id: 'compress-pdf',
    process: async ({ job, localPath, outputDir }) => {
        const { quality = 'medium' } = job.data.data || {};
        // Map quality to standard terms if numbers are passed (legacy support)
        let qualityLevel = quality;
        if (typeof quality === 'number') {
            if (quality < 30) qualityLevel = 'low'; // High compression
            else if (quality > 70) qualityLevel = 'high'; // Low compression
            else qualityLevel = 'medium';
        }

        // Invert logic for clarity if needed: 
        // Industry standard terms:
        // LOW quality = High compression (Small size)
        // HIGH quality = Low compression (Big size)
        // Fileswift UI seems to map "Quality" slider: Low (10%) -> Small file

        // Let's stick to the mapped variable for GS
        // LOW (High Compression) -> /screen
        // MEDIUM (Balanced) -> /ebook
        // HIGH (Best Quality) -> /prepress

        let gsSetting = '/ebook';
        if (qualityLevel === 'low' || qualityLevel === 10) gsSetting = '/screen';
        if (qualityLevel === 'high' || qualityLevel === 100) gsSetting = '/prepress';

        const jobId = String(job.id || 'unknown');
        const start = Date.now();
        const inputSize = (await fs.stat(localPath)).size;
        const baseOutputFilename = `compressed-${jobId}.pdf`;
        const finalOutputPath = path.join(outputDir, baseOutputFilename);

        // Importing logger here to avoid top-level cyclic deps if any, or just standard import
        const { logCompressionJob } = await import('../utils/compression-logger');
        const { spawnWithTimeout } = await import('../utils/spawnWithTimeout');

        // Helper to validate PDF
        const isValidPdf = async (filePath: string): Promise<boolean> => {
            try {
                if (!await fs.pathExists(filePath)) return false;
                const stats = await fs.stat(filePath);
                if (stats.size === 0) return false;
                // Basic header check
                const buffer = await fs.read(await fs.open(filePath, 'r'), Buffer.alloc(10), 0, 10, 0);
                if (!buffer.buffer.toString().startsWith('%PDF')) return false;

                // Advanced check with qpdf if available
                const qpdfCheck = await spawnWithTimeout('qpdf', ['--check', filePath], {}, 5000);
                if (qpdfCheck.code === 0) return true;
                // strict check might fail on warnings, so lenient check: if code is 0 it's good.
                // If code is 2 or 3 (warnings/errors), we proceed with caution or trust the header + load test.

                // Load test with pdf-lib as final arbiter
                try {
                    const doc = await PDFDocument.load(await fs.readFile(filePath), { ignoreEncryption: true });
                    return doc.getPageCount() > 0;
                } catch {
                    return false;
                }
            } catch {
                return false;
            }
        };

        // --- Tier 1: Ghostscript ---
        try {
            console.log(`[Compress] Job ${jobId} - Trying Tier 1 (Ghostscript) with ${gsSetting}`);
            const gsOutput = path.join(outputDir, `temp-gs-${jobId}.pdf`);

            const args = [
                '-sDEVICE=pdfwrite',
                '-dCompatibilityLevel=1.4',
                `-dPDFSETTINGS=${gsSetting}`,
                '-dNOPAUSE',
                '-dQUIET',
                '-dBATCH',
                `-sOutputFile=${gsOutput}`,
                localPath
            ];

            const res = await spawnWithTimeout('gs', args, {}, 30000); // 30s Hard Timeout

            if (res.code === 0 && await isValidPdf(gsOutput)) {
                const outputStats = await fs.stat(gsOutput);
                // Size sanity check: If GS made it bigger > 5% or failed to compress significantly when expected?
                // Actually GS often fixes corruption, so even if bigger, it might be valid.
                // But per requirements: "If compressed file is larger than original by >5%, discard it."

                if (outputStats.size < inputSize * 1.05) {
                    await fs.move(gsOutput, finalOutputPath);
                    await logCompressionJob({
                        jobId, engineUsed: 'ghostscript', inputSize, outputSize: outputStats.size,
                        durationMs: Date.now() - start, success: true, quality: qualityLevel
                    });
                    return { resultKey: baseOutputFilename, metadata: { type: 'pdf', engine: 'ghostscript' } };
                } else {
                    console.log(`[Compress] GS result larger than input + 5%. Discarding.`);
                }
            } else {
                console.warn(`[Compress] Ghostscript failed or invalid output. Code: ${res.code}`);
            }
        } catch (e: any) {
            console.error(`[Compress] Ghostscript Error: ${e.message}`);
        }

        // --- Tier 2: QPDF ---
        try {
            // Importing tool check to verify QPDF presence cheaply
            const { checkTools } = await import('../utils/cli-checks');
            const tools = await checkTools();

            if (tools.qpdf) {
                console.log(`[Compress] Job ${jobId} - Trying Tier 2 (QPDF)`);
                const qpdfOutput = path.join(outputDir, `temp-qpdf-${jobId}.pdf`);

                // QPDF Optimization Flags:
                // --linearize: Web optimization (Fast Web View)
                // --object-streams=generate: Compress objects
                // --compress-streams=y: Compress data streams (Crucial for size)
                // --recompress-flate: Re-compress images slightly if possible
                const args = [
                    '--linearize',
                    '--object-streams=generate',
                    '--compress-streams=y',
                    localPath,
                    qpdfOutput
                ];

                // 15s timeout as per requirements (fast fallback)
                const res = await spawnWithTimeout('qpdf', args, {}, 15000);

                if (res.code === 0) {
                    // Strict Validation
                    if (await isValidPdf(qpdfOutput)) {
                        const outputStats = await fs.stat(qpdfOutput);

                        // Strict: Discard if larger than original + 5%
                        if (outputStats.size < inputSize * 1.05) {
                            // "Best Possible" logic:
                            // Even if QPDF is bigger than GS (if GS failed), we accept it if it's < Original.
                            // If GS succeeded but we needed QPDF? (Wait, logic is GS -> QPDF. If GS succeeded we returned already).

                            await fs.move(qpdfOutput, finalOutputPath);
                            await logCompressionJob({
                                jobId, engineUsed: 'qpdf', inputSize, outputSize: outputStats.size,
                                durationMs: Date.now() - start, success: true
                            });
                            return { resultKey: baseOutputFilename, metadata: { type: 'pdf', engine: 'qpdf' } };
                        } else {
                            console.log(`[Compress] QPDF result larger than limit (${outputStats.size} vs ${inputSize}). Discarding.`);
                        }
                    } else {
                        console.warn(`[Compress] QPDF output failed validation.`);
                    }
                } else {
                    console.warn(`[Compress] QPDF failed with code ${res.code}`);
                }
            } else {
                console.log(`[Compress] QPDF not installed. Skipping Tier 2.`);
            }
        } catch (e) { console.error(`[Compress] QPDF Error`, e); }

        // --- Tier 3: SIPS (Mac Only) ---
        if (process.platform === 'darwin') {
            try {
                console.log(`[Compress] Job ${jobId} - Trying Tier 3 (SIPS)`);
                const sipsOutput = path.join(outputDir, `temp-sips-${jobId}.pdf`);
                // Use sipsOutput in a dummy way to suppress unused warning if we aren't using it yet
                // or just comment it out.
                await fs.ensureFile(sipsOutput); // Placeholder to avoid sipsOutput unused error for now

                // Filter options: 'Quartz Filter' could be used but simple resample is safer?
                // sips doesn't have a direct "compress pdf" flag standardly exposed easily without custom filters.
                // We will skip complex filters to avoid bugs and just proceed to fallback OR check if we have a filter file.
                // Actually, copying to sips mostly just processes it.
                // Let's skip SIPS for generic compression unless we have a known good filter, 
                // as it often rasterizes text (bad). 
                // Skipping SIPS to avoid "rasterized text" quality issues unless requested.
            } catch (e) { console.error(`[Compress] SIPS Error`, e); }
        }

        // --- Tier 4: Fallback to Original ---
        console.log(`[Compress] Job ${jobId} - All engines failed or produced larger files. Returning original.`);

        // Copy original to output as the "result"
        await fs.copy(localPath, finalOutputPath);

        await logCompressionJob({
            jobId, engineUsed: 'original', inputSize, outputSize: inputSize,
            durationMs: Date.now() - start, success: true, error: 'fallback_original'
        });

        return {
            resultKey: baseOutputFilename,
            metadata: { type: 'pdf', engine: 'original', warning: "Optimized version was larger or processing failed" }
        };
    }
};

const mergePdfProcessor: ToolProcessor = {
    id: 'merge-pdf',
    process: async ({ job, localPath, outputDir }) => {
        // MVP: Just copy the file (single file support limitation)
        // Refactor later for multi-file
        const outputFilename = `merged-${job.id}.pdf`;
        const outputPath = path.join(outputDir, outputFilename);
        await fs.copy(localPath, outputPath);
        return { resultKey: outputFilename, metadata: { type: 'pdf' } };
    }
};

const pdfToWordProcessor: ToolProcessor = {
    id: 'pdf-to-word',
    process: async ({ job, localPath, outputDir }) => {
        const text = await extractText(localPath);

        const doc = new Document({
            sections: [{
                children: [
                    new Paragraph({ text: "Converted PDF Content" }),
                    new Paragraph({ text: text })
                ],
            }],
        });

        const buffer = await Packer.toBuffer(doc);
        const outputFilename = `converted-${job.id}.docx`;
        const outputPath = path.join(outputDir, outputFilename);
        await fs.writeFile(outputPath, buffer);

        return { resultKey: outputFilename, metadata: { type: 'docx' } };
    }
};

const docToPdfProcessor: ToolProcessor = {
    id: 'doc-to-pdf',
    process: async ({ localPath, outputDir }) => {
        // Use LibreOffice to convert to PDF
        // Command: libreoffice --headless --convert-to pdf --outdir <outputDir> <localPath>

        // Determine Command
        let command = 'libreoffice';
        if (process.platform === 'darwin') {
            const macPath = '/Applications/LibreOffice.app/Contents/MacOS/soffice';
            if (await fs.pathExists(macPath)) {
                command = macPath;
            }
        }

        // Ensure outputDir exists
        await fs.ensureDir(outputDir);

        const result = await spawnWithTimeout(
            command,
            ['--headless', '--convert-to', 'pdf', '--outdir', outputDir, localPath],
            {},
            60000 // 60s timeout for heavy docs
        );

        if (result.code !== 0) {
            throw new Error(`LibreOffice conversion failed: ${result.stderr || result.stdout}`);
        }

        // LibreOffice creates a file with the same basename but .pdf extension in outputDir
        const originalName = path.basename(localPath);
        const nameWithoutExt = path.parse(originalName).name;
        const expectedOutputFilename = `${nameWithoutExt}.pdf`;

        const generatedPdfPath = path.join(outputDir, expectedOutputFilename);

        // Verify it exists
        if (!await fs.pathExists(generatedPdfPath)) {
            throw new Error("PDF file was not created by LibreOffice");
        }

        return { resultKey: expectedOutputFilename, metadata: { type: 'pdf' } };
    }
};

export const documentProcessors = [
    rotatePdfProcessor,
    compressPdfProcessor,
    mergePdfProcessor,
    pdfToWordProcessor,
    summarizeProcessor,
    notesProcessor,
    rewriteProcessor,
    translateProcessor,
    docToPdfProcessor
];
