import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import fs from 'fs-extra';
import path from 'path';

const PROVIDER = process.env.STORAGE_PROVIDER || 'local';
const LOCAL_UPLOAD_DIR = path.join(__dirname, '../../uploads');

// Ensure local upload dir exists
if (PROVIDER === 'local') {
    fs.ensureDirSync(LOCAL_UPLOAD_DIR);
}

const s3 = (PROVIDER === 's3' || PROVIDER === 'r2') ? new S3Client({
    region: process.env.S3_REGION || 'auto',
    endpoint: process.env.S3_ENDPOINT, // Optional for real AWS S3, required for R2/Minio
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
    },
}) : null;

const BUCKET = process.env.S3_BUCKET || 'fileswift';

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
