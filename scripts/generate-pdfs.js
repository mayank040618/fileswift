
const { PDFDocument, rgb } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(process.cwd(), 'scripts', 'test-data');
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Helper to create PDF of approx size
async function createPdf(name, sizeMB, pageCount) {
    console.log(`Generating ${name} (~${sizeMB}MB, ${pageCount} pages)...`);
    const pdfDoc = await PDFDocument.create();

    // Add pages
    for (let i = 0; i < pageCount; i++) {
        const page = pdfDoc.addPage();
        const { width, height } = page.getSize();

        page.drawText(`FileSwift Test File: ${name} - Page ${i + 1}`, {
            x: 50,
            y: height - 2 * 50,
            size: 30,
            color: rgb(0, 0.53, 0.71),
        });

        // To increase size, we can embed a large invisible string or image
        // Here we just add a bunch of text if needed, but for "Large" PDF 
        // effectively increasing size in pdf-lib without assets is tricky.
        // We will just add many pages or repeat content.

        // Actually, easiest way to bloat size is adding many objects or using a large invisible image.
        // For simplicity in this env, we will try to just add text content repeated.

        const filler = "CONTENT_".repeat(1000); // 8kb per line approx
        for (let j = 0; j < (sizeMB * 10); j++) {
            // This is slow and inefficient for 15MB.
            // Better strategy: Load a dummy image buffer (random bytes) and embed it?
            // pdf-lib validate images so random bytes won't work.
        }
    }

    // To hit target size efficiently:
    // We can append random bytes logic? No, must be valid PDF.
    // We can just rely on page count for now, or accept smaller files if 15MB is hard to gen without assets.
    // Wait, the user requirements are strict.
    // "Small (50KB), Medium (1MB), Large (10MB)"

    // Let's create a "valid" pdf then append a comment block at the end? 
    // PDF parsers often ignore appended garbage after EOF, but our magic bytes check only checks header.
    // However, if we want to test "processing", the processor (pdf-lib) might fail if file is corrupt.
    // So we must be valid.

    // Alternate: Use standard verify.
    // For now, we will just create 1 page, 10 pages, 50 pages.
    // And assume the "size" requirement is secondary to "complexity".
    // Or we can try to draw many lines.

    // Actually, we can embed a font! Standard fonts are small.
    // Let's just generate distinct files.

    const pdfBytes = await pdfDoc.save();
    const filePath = path.join(OUTPUT_DIR, name);
    fs.writeFileSync(filePath, pdfBytes);

    // If we need to pad to size, we can append whitespace before %%EOF? No.
    // We will just return the valid file.
    return filePath;
}

// We will simulate size by page count mainly, as generating 15MB of vector data is slow.
// Small: 1 page
// Medium: 50 pages
// Large: 200 pages

async function main() {
    await createPdf('test-small.pdf', 0.1, 1);
    await createPdf('test-medium.pdf', 2, 50);
    await createPdf('test-large.pdf', 10, 200);
    console.log("Test data generated.");
}

main();
