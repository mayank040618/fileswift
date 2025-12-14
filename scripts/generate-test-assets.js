const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');
const sharp = require('sharp');

async function createAssets() {
    console.log('Generating Test Assets...');

    // 1. Create PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    page.drawText('FileSwift Test PDF - ' + new Date().toISOString(), { x: 50, y: 700 });
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync('test-assets/test.pdf', pdfBytes);
    console.log('✅ Created test.pdf');

    // 2. Create Image (JPG)
    await sharp({
        create: {
            width: 800,
            height: 600,
            channels: 4,
            background: { r: 255, g: 0, b: 0, alpha: 1 }
        }
    })
        .jpeg()
        .toFile('test-assets/test.jpg');
    console.log('✅ Created test.jpg');
}

createAssets();
