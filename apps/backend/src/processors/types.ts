import { Job } from 'bullmq';

export interface ProcessorContext {
    job: Job;
    localPath: string; // Primary Input file path (for backward compatibility or single file)
    inputPaths?: string[]; // All input file paths for bulk processing
    outputDir: string; // Directory to save output
}

export interface ToolProcessorResult {
    resultKey: string;
    metadata?: any;
    uploaded?: boolean;
    exports?: Record<string, { fileName: string; localPath?: string; downloadUrl?: string }>;
}

export interface ToolProcessor {
    id: string;
    process: (ctx: ProcessorContext) => Promise<ToolProcessorResult>;
}
