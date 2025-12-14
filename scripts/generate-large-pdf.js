
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function createLargePdf() {
    const pdfDoc = await PDFDocument.create();
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);

    // Add 50 pages of text to bulk it up
    for (let i = 0; i < 50; i++) {
        const page = pdfDoc.addPage();
        const { width, height } = page.getSize();
        const fontSize = 30;
        page.drawText(`Page ${i + 1} - Large Content Test`, {
            x: 50,
            y: height - 4 * fontSize,
            size: fontSize,
            font: timesRomanFont,
            color: rgb(0, 0.53, 0.71),
        });

        // Add hidden text off-screen to add bytes?
        // Or just lots of text.
        let content = "Lorem ipsum dolor sit amet ".repeat(500);
        page.drawText(content.substring(0, 3000), {
            x: 50, y: height - 200, size: 10, lineHeight: 12, maxWidth: width - 100
        });
    }

    const pdfBytes = await pdfDoc.save();
    const outputPath = path.join(__dirname, 'test-data', 'real-large.pdf');
    fs.writeFileSync(outputPath, pdfBytes);
    console.log(`Created real-large.pdf: ${(pdfBytes.length / 1024).toFixed(2)} KB`);
}

createLargePdf();
