const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');
const sharp = require('sharp');

async function createAssets() {
    const outDir = path.join(process.cwd(), 'test-assets');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

    // Create PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    page.drawText('Test PDF for FileSwift');
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(path.join(outDir, 'test.pdf'), pdfBytes);
    console.log('Created test.pdf');

    // Create Image
    await sharp({
        create: {
            width: 300,
            height: 200,
            channels: 4,
            background: { r: 255, g: 0, b: 0, alpha: 0.5 }
        }
    })
        .jpeg()
        .toFile(path.join(outDir, 'test.jpg'));
    console.log('Created test.jpg');
}

createAssets().catch(console.error);
