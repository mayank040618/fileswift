import { ToolProcessor } from './types';
import OpenAI from 'openai';
import fs from 'fs-extra';
// @ts-ignore
// @ts-ignore
// const require = createRequire(import.meta.url); // Removed for CommonJS

import path from 'path';
import { spawnWithTimeout } from '../utils/spawnWithTimeout';

// Mock OpenAI if key missing or AI disabled
const enableAI = process.env.ENABLE_AI !== 'false';
const openai = (enableAI && process.env.OPENAI_API_KEY)
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null;

// Helper to extract text
const extractText = async (filePath: string): Promise<string> => {
    let pdf = require('pdf-parse');
    if (typeof pdf !== 'function' && (pdf as any).default) pdf = (pdf as any).default;

    const dataBuffer = await fs.readFile(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
};

// --- Processors ---

import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export const summarizeProcessor: ToolProcessor = {
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

export const notesProcessor: ToolProcessor = {
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

export const rewriteProcessor: ToolProcessor = {
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

export const translateProcessor: ToolProcessor = {
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

export const docToPdfProcessor: ToolProcessor = {
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

        const originalName = path.basename(localPath);
        const nameWithoutExt = path.parse(originalName).name;
        const expectedOutputFilename = `${nameWithoutExt}.pdf`;
        const generatedPdfPath = path.join(outputDir, expectedOutputFilename);

        try {
            const hasBinary = async (cmd: string) => {
                try { await spawnWithTimeout('which', [cmd], {}, 2000); return true; } catch { return false; }
            };

            const hasLibreOffice = (command.includes('/') && await fs.pathExists(command)) || await hasBinary(command);

            if (!hasLibreOffice) throw new Error("LibreOffice binary not found");

            const result = await spawnWithTimeout(
                command,
                ['--headless', '--convert-to', 'pdf', '--outdir', outputDir, localPath],
                {},
                60000 // 60s timeout for heavy docs
            );

            if (result.code !== 0) {
                throw new Error(`LibreOffice conversion failed: ${result.stderr || result.stdout}`);
            }

            // Verify it exists
            if (!await fs.pathExists(generatedPdfPath)) {
                throw new Error("PDF file was not created by LibreOffice");
            }
        } catch (e: any) {
            console.error(`[doc-to-pdf] Failed: ${e.message}. Using fallback.`);

            // Fallback: Generate a PDF explaining the failure
            const pdfDoc = await PDFDocument.create();
            const page = pdfDoc.addPage();
            const { height } = page.getSize();

            page.drawText('Document Conversion Failed', { x: 50, y: height - 50, size: 24 });
            page.drawText('LibreOffice is required for high-fidelity conversion.', { x: 50, y: height - 100, size: 12 });
            page.drawText(`Error: ${e.message}`, { x: 50, y: height - 130, size: 10, color: rgb(1, 0, 0) });

            await fs.writeFile(generatedPdfPath, await pdfDoc.save());
        }

        return { resultKey: expectedOutputFilename, metadata: { type: 'pdf' } };
    }
};

export const documentProcessors = [
    rotatePdfProcessor,
    mergePdfProcessor,
    pdfToWordProcessor,
    summarizeProcessor,
    notesProcessor,
    rewriteProcessor,
    translateProcessor,
    docToPdfProcessor
];
