import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Upload } from "@aws-sdk/lib-storage";
import fs from 'fs-extra';
import path from 'path';
import { Readable } from 'stream';

const PROVIDER = process.env.STORAGE_PROVIDER || 'local';
const LOCAL_UPLOAD_DIR = path.join(__dirname, '../../uploads');

// Ensure local upload dir exists
if (PROVIDER === 'local') {
    fs.ensureDirSync(LOCAL_UPLOAD_DIR);
}

const s3 = (PROVIDER === 's3' || PROVIDER === 'r2') ? new S3Client({
    region: process.env.S3_REGION || 'auto',
    endpoint: process.env.S3_ENDPOINT || process.env.R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID || process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || process.env.R2_SECRET_ACCESS_KEY || '',
    },
}) : null;

const BUCKET = process.env.S3_BUCKET || process.env.R2_BUCKET_NAME || 'fileswift';

export const uploadToR2 = async (fileBuffer: Buffer, filename: string, mimeType: string) => {
    const key = `${Date.now()}-${filename}`;

    if (s3) {
        await s3.send(new PutObjectCommand({
            Bucket: BUCKET,
            Key: key,
            Body: fileBuffer,
            ContentType: mimeType,
        }));
    } else {
        await fs.writeFile(path.join(LOCAL_UPLOAD_DIR, key), fileBuffer);
    }

    return key;
};

// New: Stream directly to S3/R2
export const streamToR2 = async (stream: Readable, filename: string, mimeType: string): Promise<string> => {
    const key = `${Date.now()}-${filename}`;

    if (s3) {
        const parallelUploads3 = new Upload({
            client: s3,
            params: {
                Bucket: BUCKET,
                Key: key,
                Body: stream,
                ContentType: mimeType,
            },
        });

        await parallelUploads3.done();
        return key;
    } else {
        // Fallback to local FS stream
        const writeStream = fs.createWriteStream(path.join(LOCAL_UPLOAD_DIR, key));
        return new Promise((resolve, reject) => {
            stream.pipe(writeStream);
            stream.on('error', reject);
            writeStream.on('finish', () => resolve(key));
            writeStream.on('error', reject);
        });
    }
};

export const getDownloadUrl = async (key: string) => {
    if (s3) {
        const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
        return await getSignedUrl(s3, command, { expiresIn: 3600 });
    } else {
        // Return a mock local URL or just empty if handled internally
        const apiUrl = (process.env.PUBLIC_API_URL || process.env.API_URL || 'http://localhost:8080').replace(/\/$/, '');
        return `${apiUrl}/uploads/${key}`;
    }
};

export const getFileBuffer = async (key: string): Promise<Buffer> => {
    if (s3) {
        const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
        const response = await s3.send(command);
        return Buffer.from(await response.Body!.transformToByteArray());
    } else {
        return fs.readFile(path.join(LOCAL_UPLOAD_DIR, key));
    }
};

export const getUploadUrl = async (key: string, contentType: string): Promise<{ url: string, method: string, headers: Record<string, string> }> => {
    if (s3) {
        const command = new PutObjectCommand({
            Bucket: BUCKET,
            Key: key,
            ContentType: contentType
        });
        const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
        return {
            url,
            method: 'PUT',
            headers: { 'Content-Type': contentType }
        };
    } else {
        // Local: Return a relative URL that the frontend will prepend API_BASE to.
        // The route will be /api/upload/binary/:key
        const apiUrl = (process.env.PUBLIC_API_URL || 'http://localhost:8080').replace(/\/$/, '');
        return {
            url: `${apiUrl}/api/upload/binary/${key}`,
            method: 'PUT',
            headers: { 'Content-Type': 'application/octet-stream' } // Local doesn't enforce strict types yet
        };
    }
};
