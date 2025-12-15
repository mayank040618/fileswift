

import { getProcessor, isValidToolId } from './toolRegistry';
import { getFileBuffer, uploadToR2 } from './storage';
import path from 'path';
import fs from 'fs-extra';
import os from 'os';



export interface JobData {
    toolId: string;
    key?: string; // Optional (legacy/R2)
    filename: string;
    path?: string; // Local temp path
    inputFiles?: { filename: string; path: string }[]; // New bulk input
    data?: any;
}

const errorCounts: Record<string, { count: number, resetAt: number }> = {};

const trackError = (toolId: string) => {
    const now = Date.now();
    if (!errorCounts[toolId] || now > errorCounts[toolId].resetAt) {
        errorCounts[toolId] = { count: 0, resetAt: now + 10 * 60 * 1000 }; // 10 mins
    }
    errorCounts[toolId].count++;

    if (errorCounts[toolId].count > 3) {
        console.warn(`[ALERT] Tool ${toolId} has failed ${errorCounts[toolId].count} times in the last 10 minutes.`);
    }
};

// Abstract Job wrapper to handle both BullMQ Job and our Mock Job
export interface IJob {
    id: string;
    data: JobData;
    updateProgress?: (progress: number | object) => Promise<void>;
}

export const executeJob = async (job: IJob) => {
    console.log("!!! EXECUTE JOB CALLED !!!");
    console.log(`Processing job ${job.id} for tool ${job.data.toolId}`);

    const { toolId, key, filename, path: inputTempPath } = job.data;

    // Strict Registry Check
    // Ideally use top-level import, but let's stick to replacing the logic block safely.

    if (!isValidToolId(toolId)) {
        throw new Error(`CRITICAL FAILURE: Invalid Tool ID '${toolId}' - Security Block`);
    }

    const processor = getProcessor(toolId);

    // Redundant check since getProcessor throws, but keeping for safety
    if (!processor) {
        throw new Error(`CRITICAL FAILURE: No processor found for tool ${toolId}`);
    }

    // Create temp workspace with standardized structure
    // {tmp}/fileswift-uploads/jobs/{jobId}/
    const uploadsDir = process.env.UPLOAD_DIR ? path.join(process.cwd(), process.env.UPLOAD_DIR) : path.join(os.tmpdir(), 'fileswift-uploads');
    const workDir = path.join(uploadsDir, 'jobs', job.id);
    await fs.ensureDir(workDir);

    // Subdirectories
    const outputDir = path.join(workDir, 'outputs');
    await fs.ensureDir(outputDir);

    const inputPath = path.join(workDir, 'original-' + filename);

    console.log(JSON.stringify({
        event: 'JOB_STARTED',
        jobId: job.id,
        toolId,
        filename
    }));

    try {
        const inputPaths: string[] = [];

        // 1. Prepare Input(s)
        if (job.data.inputFiles && job.data.inputFiles.length > 0) {
            // New Bulk Flow
            // New Bulk Flow - Parallelized
            const inputFilesPromises = job.data.inputFiles.map(async (file, index) => {
                const safeName = path.basename(file.filename);
                // Append index to avoid "dest already exists" if user uploads duplicate filenames
                const fileInputPath = path.join(workDir, `input-${index}-${safeName}`);

                if (await fs.pathExists(file.path)) {
                    await fs.move(file.path, fileInputPath, { overwrite: true });
                    return fileInputPath;
                }
                return null;
            });

            const results = await Promise.all(inputFilesPromises);
            const validPaths = results.filter((p): p is string => p !== null);
            inputPaths.push(...validPaths);

            if (inputPaths.length === 0) throw new Error("All input files missing or failed to move");
        } else if (inputTempPath && await fs.pathExists(inputTempPath)) {
            // Legacy/Single Flow
            await fs.move(inputTempPath, inputPath);
            inputPaths.push(inputPath);
            console.log(`[Job] Moved input from ${inputTempPath} to ${inputPath}`);
        } else if (key) {
            // R2/S3 Flow
            const fileBuffer = await getFileBuffer(key);
            await fs.writeFile(inputPath, fileBuffer);
            inputPaths.push(inputPath);
        } else {
            throw new Error("No input file provided (path or key missing)");
        }

        const inputStats = await fs.stat(inputPaths[0]); // Stat first file for logs

        console.log(JSON.stringify({
            event: 'INPUT_READY',
            jobId: job.id,
            sizeBytes: inputStats.size
        }));


        // 2. Process
        const result = await processor.process({
            job: job as any,
            localPath: inputPaths[0], // Keep primary for compat
            inputPaths, // Pass all
            outputDir: outputDir
        });

        let resultSizeBytes = 0;
        if (result.resultKey && !result.resultKey.startsWith('http')) {
            try {
                const p = path.join(outputDir, result.resultKey);
                if (await fs.pathExists(p)) {
                    resultSizeBytes = (await fs.stat(p)).size;
                }
            } catch (e) { /* ignore */ }
        }

        console.log(JSON.stringify({
            event: 'PROCESSING_COMPLETED',
            jobId: job.id,
            resultKey: result.resultKey,
            outputSizeBytes: resultSizeBytes
        }));

        // 3. Upload Result (or keep local if needed, logic primarily stays same but paths updated)
        let finalKey = result.resultKey;

        // If result.resultKey is NOT a URL (meaning it's a local filename), upload it
        if (result.resultKey && !result.resultKey.startsWith('http')) {
            const resultPath = path.join(outputDir, result.resultKey);

            if (await fs.pathExists(resultPath)) {
                const isR2 = process.env.STORAGE_PROVIDER === 's3' || process.env.STORAGE_PROVIDER === 'r2';

                if (isR2) {
                    try {
                        const resultBuffer = await fs.readFile(resultPath);
                        finalKey = await uploadToR2(
                            resultBuffer,
                            result.resultKey,
                            'application/octet-stream'
                        );
                    } catch (e) {
                        console.log(JSON.stringify({ event: 'UPLOAD_SKIPPED_OR_FAILED', error: String(e) }));
                        finalKey = resultPath;
                    }
                } else {
                    // Local: Use absolute path directly
                    finalKey = resultPath;
                }
            }
        }

        // Handle additional exports if present (for Summary tool)
        const finalExports: Record<string, { fileName: string, downloadUrl: string }> = {};
        if (result.exports) {
            for (const [format, exportInfo] of Object.entries(result.exports)) {
                const exp = exportInfo as { fileName: string, localPath?: string, downloadUrl?: string };

                // If it has a localPath, upload it
                if (exp.localPath && await fs.pathExists(exp.localPath)) {
                    // Same upload logic
                    // ... for brevity reusing existing flow or simplifying
                    // For now, let's assume if R2 fails we just use local serving
                    const apiUrl = (process.env.PUBLIC_API_URL || 'http://localhost:8080').replace(/\/$/, '');
                    const downloadUrl = `${apiUrl}/api/download/${job.id}/${exp.fileName}`;
                    finalExports[format] = {
                        fileName: exp.fileName,
                        downloadUrl
                    };
                } else if (exp.downloadUrl) {
                    finalExports[format] = {
                        fileName: exp.fileName,
                        downloadUrl: exp.downloadUrl
                    };
                }
            }
        }

        // Construct Primary Download URL
        // If finalKey is a URL, use it. If it's a filename, assume local serving via jobID
        // IMPORTANT: For local serving, we must use result.resultKey (the file in /tmp) 
        // because finalKey (from uploadToR2) might have an extra timestamp prepended.
        const apiUrl = (process.env.PUBLIC_API_URL || 'http://localhost:8080').replace(/\/$/, '');
        const primaryDownloadUrl = finalKey.startsWith('http')
            ? finalKey
            : `${apiUrl}/api/download/${job.id}/${path.basename(result.resultKey)}`;

        console.log(JSON.stringify({
            event: 'JOB_FINISHED',
            jobId: job.id,
            downloadUrl: primaryDownloadUrl
        }));

        return {
            ...result,
            resultKey: finalKey,
            downloadUrl: primaryDownloadUrl,
            exports: Object.keys(finalExports).length > 0 ? finalExports : undefined
        };
    } catch (error: any) {
        trackError(toolId);
        console.error(JSON.stringify({
            event: 'TOOL_FAIL',
            tool: toolId,
            errorCode: error.code || 'UNKNOWN',
            message: error.message,
            timestamp: new Date().toISOString()
        }));

        console.error(JSON.stringify({
            event: 'JOB_FAILED',
            jobId: job.id,
            error: error.message,
            stack: error.stack
        }));
        throw error;
    }
    // Do NOT remove workDir immediately if we want to serve files from it locally!
    // We rely on the cleanup script to remove old dirs.
    // } finally {
    //    // await fs.remove(workDir).catch(console.error);
    // }
};
