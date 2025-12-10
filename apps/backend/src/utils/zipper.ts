
import archiver from 'archiver';
import fs from 'fs-extra';
import path from 'path';

export const createZip = async (sourceDir: string, outputDir: string, zipName: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const outputPath = path.join(outputDir, zipName);
        const output = fs.createWriteStream(outputPath);
        const archive = archiver('zip', {
            zlib: { level: 9 } // Sets the compression level.
        });

        output.on('close', function () {
            console.log(archive.pointer() + ' total bytes');
            console.log('archiver has been finalized and the output file descriptor has closed.');
            resolve(zipName);
        });

        archive.on('error', function (err) {
            reject(err);
        });

        archive.pipe(output);

        // Append files from sourceDir
        archive.directory(sourceDir, false);

        archive.finalize();
    });
};

export const zipFiles = async (files: string[], outputDir: string, zipName: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const outputPath = path.join(outputDir, zipName);
        const output = fs.createWriteStream(outputPath);
        const archive = archiver('zip', {
            zlib: { level: 9 }
        });

        output.on('close', function () {
            resolve(zipName);
        });

        archive.on('error', function (err) {
            reject(err);
        });

        archive.pipe(output);

        files.forEach(file => {
            archive.file(file, { name: path.basename(file) });
        });

        archive.finalize();
    });
}
