
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function createHugePdf() {
    const pdfDoc = await PDFDocument.create();
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);

    // Add 2000 pages of text to bulk it up
    for (let i = 0; i < 2000; i++) {
        const page = pdfDoc.addPage();
        const { width, height } = page.getSize();
        const fontSize = 30;
        page.drawText(`Page ${i + 1} - HUGE Content Test`, {
            x: 50,
            y: height - 4 * fontSize,
            size: fontSize,
            font: timesRomanFont,
            color: rgb(0, 0.53, 0.71),
        });
        page.drawText("Some filler text to ensure it takes up space. ".repeat(20), {
            x: 50, y: height - 100, size: 10
        });
    }

    const pdfBytes = await pdfDoc.save();
    const outputPath = path.join(__dirname, 'test-data', 'real-huge.pdf');
    fs.writeFileSync(outputPath, pdfBytes);
    console.log(`Created real-huge.pdf: ${(pdfBytes.length / 1024).toFixed(2)} KB`);
}

createHugePdf();
