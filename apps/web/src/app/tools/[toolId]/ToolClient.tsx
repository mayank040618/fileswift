'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { BulkUploader } from '@/components/BulkUploader';
import { ProgressBar } from '@/components/ProgressBar';
import { TOOLS } from '@/config/tools';
import { Icons } from '@/components/Icons';
import { useInterval } from '@/hooks/useInterval';
import clsx from 'clsx';
import { AdBanner } from '@/components/ads/AdBanner';
import { AdSquare } from '@/components/ads/AdSquare';
import { FeedbackWidget } from '@/components/FeedbackWidget';
import { ToolCard } from '@/components/ToolCard';
import ReactMarkdown from 'react-markdown';
import { downloadNotesAsPdf, downloadTextAsPdf } from '@/lib/generatePdf';

// Client-side processors
import {
    isClientSideTool,
    mergePDFs,
    rotatePDF,
    splitPDF,
    imagesToPDF,
    compressImage,
    compressImages,
    resizeImage,
    resizeImages,
    summarizePDF,
    convertImageFormat,
    type ProcessorResult,
    type SummaryMode,
    extractTextFromPDF
} from '@/lib/processors';

export default function ToolClient() {
    const params = useParams();
    const toolId = params.toolId as string;
    const tool = TOOLS.find(t => t.id === toolId);

    const [files, setFiles] = useState<File[]>([]);
    const [jobId, setJobId] = useState<string | null>(null);
    const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'completed' | 'failed'>('idle');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [processingProgress, setProcessingProgress] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState<string>('');
    const [processingStartTime, setProcessingStartTime] = useState<number | null>(null);
    const [result, setResult] = useState<any>(null); // eslint-disable-line
    const [compressionQuality, setCompressionQuality] = useState(75);

    // Chat State
    const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [pdfContext, setPdfContext] = useState<string>(''); // Store extracted text

    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // AI Summarizer State
    const [summaryMode, setSummaryMode] = useState<SummaryMode>('brief');
    const [summaryResult, setSummaryResult] = useState<string | null>(null);
    const [summaryStatus, setSummaryStatus] = useState<string>('');

    // AI Tools Result State
    const [aiResult, setAiResult] = useState<any>(null); // eslint-disable-line

    // Debugging: Log errors to console (also ensures variable is 'used' for linter)
    useEffect(() => {
        if (errorMessage) console.error('[ToolClient] Error:', errorMessage);
    }, [errorMessage]);

    useInterval(async () => {
        // Only run if processing and check internal conditions
        if (status !== 'processing' || !tool) return;

        // Polling logic
        if (jobId && tool.id !== 'ai-chat') {
            try {
                const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';
                const res = await fetch(`${API_BASE}/api/jobs/${jobId}/status`);
                const data = await res.json();

                if (res.status === 200) {
                    if (data.status === 'completed') {
                        setStatus('completed');
                        setResult(data);

                        // Auto-fetch JSON for AI tools and display inline
                        const aiTools = ['ai-notes', 'ai-rewrite', 'ai-translate'];
                        if (aiTools.includes(tool.id) && data.downloadUrl) {
                            try {
                                const jsonRes = await fetch(data.downloadUrl);
                                const jsonData = await jsonRes.json();
                                setAiResult(jsonData);
                            } catch (fetchErr) {
                                console.error('[AI] Failed to fetch result JSON:', fetchErr);
                            }
                        }
                    } else if (data.status === 'failed') {
                        setStatus('failed');
                        setErrorMessage(data.error);
                        // alert(data.error || "Job failed"); // Removed alert to use inline UI
                    }
                } else if (res.status === 404) {
                    // Job lost (server restart?)
                    setStatus('failed');
                    setErrorMessage("Job not found (Server might have restarted)");
                } else if (res.status === 429) {
                    // Rate limit hit - stop polling to be safe
                    setStatus('failed');
                    setErrorMessage("Rate limit exceeded. Please try again.");
                }
            } catch (e) {
                console.error("Polling error", e);
            }
        }

        // Processing Timer Update
        if (processingStartTime) {
            const elapsed = Math.round((Date.now() - processingStartTime) / 1000);
            setTimeRemaining(`${elapsed}s elapsed`);

            // Simulated Progress: Smoothly increment to 95%
            setProcessingProgress(prev => {
                if (prev >= 95) return 95;

                // Adaptive increment based on current progress
                let minInc = 0.5;
                let maxInc = 1.5;

                // Fast start (0-30%)
                if (prev < 30) {
                    minInc = 2;
                    maxInc = 5;
                }
                // Medium speed (30-70%)
                else if (prev < 70) {
                    minInc = 1;
                    maxInc = 3;
                }
                // Slow finish (>70%) to avoid getting stuck at 99 too early
                else {
                    minInc = 0.2;
                    maxInc = 0.8;
                }

                // Add varied increment
                const increment = Math.random() * (maxInc - minInc) + minInc;
                return Math.min(prev + increment, 95);
            });
        }
    }, 2000);

    if (!tool) return <div className="p-10 text-center">Tool not found</div>;

    // Client-side processing for applicable tools
    const handleClientSideProcess = async () => {
        if (files.length === 0) return;
        setStatus('processing');
        setProcessingStartTime(Date.now());
        setProcessingProgress(0);
        setTimeRemaining('Processing locally...');

        if (tool.id === 'ai-chat') {
            // Extract text for chat context
            try {
                setTimeRemaining('Reading document...');
                const extraction = await extractTextFromPDF(files[0]);
                if (extraction.success && extraction.text) {
                    setPdfContext(extraction.text);
                    setChatMessages([{ role: 'ai', content: `I've read **${files[0].name}**. Ask me anything about it!` }]);
                    setStatus('completed');
                    setResult({ isChat: true });
                } else {
                    throw new Error(extraction.error || 'Failed to read PDF text');
                }
            } catch (e: any) {
                setErrorMessage(e.message);
                setStatus('failed');
            }
            return;
        }

        try {
            let processorResult: ProcessorResult | null = null;

            // Get options from form
            const angleInput = document.getElementById('rotate-angle') as HTMLSelectElement;
            const angle = angleInput?.value ? parseInt(angleInput.value) as 90 | 180 | 270 : 90;

            const qInput = document.getElementById('compress-q') as HTMLInputElement;
            const quality = qInput?.value ? parseInt(qInput.value) : compressionQuality;

            const wInput = document.getElementById('resize-w') as HTMLInputElement;
            const hInput = document.getElementById('resize-h') as HTMLInputElement;
            const width = wInput?.value ? parseInt(wInput.value) : undefined;
            const height = hInput?.value ? parseInt(hInput.value) : undefined;

            // Route to appropriate processor
            switch (tool.id) {
                case 'merge-pdf':
                    processorResult = await mergePDFs(files, setProcessingProgress);
                    break;
                case 'rotate-pdf':
                    processorResult = await rotatePDF(files[0], angle, setProcessingProgress);
                    break;
                case 'split-pdf':
                    processorResult = await splitPDF(files[0], setProcessingProgress);
                    break;
                case 'image-to-pdf':
                    processorResult = await imagesToPDF(files, setProcessingProgress);
                    break;
                case 'image-compressor':
                    if (files.length === 1) {
                        processorResult = await compressImage(files[0], quality, setProcessingProgress);
                    } else {
                        processorResult = await compressImages(files, quality, setProcessingProgress);
                    }
                    break;
                case 'image-resizer':
                case 'resize-image-for-youtube-thumbnail':
                case 'resize-photo-for-resume':
                case 'resize-image-for-instagram':
                case 'resize-image-for-linkedin':
                case 'resize-image-for-facebook':
                    // Hardcoded dimensions for specialized tools
                    let targetW = width;
                    let targetH = height;

                    if (tool.id === 'resize-image-for-youtube-thumbnail') { targetW = 1280; targetH = 720; }
                    else if (tool.id === 'resize-image-for-instagram') { targetW = 1080; targetH = 1080; }
                    else if (tool.id === 'resize-image-for-linkedin') { targetW = 1200; targetH = 627; }
                    else if (tool.id === 'resize-image-for-facebook') { targetW = 1200; targetH = 630; }
                    else if (tool.id === 'resize-photo-for-resume') { targetW = 600; targetH = 600; }

                    if (files.length === 1) {
                        processorResult = await resizeImage(files[0], targetW, targetH, setProcessingProgress);
                    } else {
                        processorResult = await resizeImages(files, targetW, targetH, setProcessingProgress);
                    }
                    break;
                case 'remove-background': {
                    // Dynamic import to avoid bundling 21MB ONNX package on every page
                    const { removeBackground } = await import('@/lib/processors/remove-background');
                    processorResult = await removeBackground(files[0], setProcessingProgress);
                    break;
                }
                case 'summarize-pdf':
                    // Special handling for AI summarizer
                    const summaryResult = await summarizePDF(
                        files[0],
                        summaryMode,
                        (status) => setSummaryStatus(status)
                    );
                    if (summaryResult.success && summaryResult.summary) {
                        setProcessingProgress(100);
                        setSummaryResult(summaryResult.summary);
                        setResult({ isSummary: true, isMock: summaryResult.isMock });
                        setStatus('completed');
                    } else {
                        throw new Error(summaryResult.error || 'Failed to summarize PDF');
                    }
                    return; // Early return - don't process like other tools
                case 'jpg-to-png':
                    processorResult = await convertImageFormat(files[0], 'png', undefined, setProcessingProgress);
                    break;
                case 'png-to-jpg':
                    processorResult = await convertImageFormat(files[0], 'jpeg', 0.92, setProcessingProgress);
                    break;
                case 'heic-to-jpg':
                    processorResult = await convertImageFormat(files[0], 'jpeg', 0.95, setProcessingProgress);
                    break;
                default:
                    throw new Error('Unknown client-side tool');
            }

            if (!processorResult || !processorResult.success) {
                throw new Error(processorResult?.error || 'Processing failed');
            }

            setProcessingProgress(100);

            // Handle single file result
            if (processorResult.blob) {
                const url = URL.createObjectURL(processorResult.blob);
                setResult({
                    downloadUrl: url,
                    isClientSide: true,
                    filename: processorResult.filename,
                    result: {
                        metadata: {
                            originalSize: processorResult.originalSize,
                            finalSize: processorResult.finalSize,
                            action: processorResult.finalSize && processorResult.originalSize && processorResult.finalSize < processorResult.originalSize ? 'compressed' : 'processed'
                        }
                    }
                });
                setStatus('completed');
            }
            // Handle multiple file results
            else if (processorResult.blobs && processorResult.blobs.length > 0) {
                // For now, just use the first blob - in future could zip them
                const url = URL.createObjectURL(processorResult.blobs[0]);
                const isCompressed = processorResult.originalSize && processorResult.finalSize && processorResult.finalSize < processorResult.originalSize;

                setResult({
                    downloadUrl: url,
                    isClientSide: true,
                    filename: processorResult.filenames?.[0],
                    result: {
                        metadata: {
                            originalSize: processorResult.originalSize,
                            finalSize: processorResult.finalSize,
                            action: isCompressed ? 'compressed' : 'processed',
                            count: processorResult.blobs.length
                        }
                    },
                    // Store all blobs for download
                    allBlobs: processorResult.blobs,
                    allFilenames: processorResult.filenames
                });
                setStatus('completed');
            }
            else {
                throw new Error('No output generated');
            }

        } catch (error: any) {
            console.error('Client-side processing error:', error);
            setStatus('failed');
            setErrorMessage(error.message || 'Processing failed');
        }
    };

    // Decide which handler to use based on tool
    const handleProcess = () => {
        if (isClientSideTool(tool.id)) {
            handleClientSideProcess();
        } else {
            handleUpload();
        }
    };

    const handleUpload = async () => {
        if (files.length === 0) return;
        setStatus('uploading');
        setTimeRemaining('Calculating...');
        const startTime = Date.now();

        const formData = new FormData();
        formData.append('toolId', tool.id);

        // Append all files
        files.forEach(file => {
            formData.append('files', file);
        });

        // Gather Inputs
        const data: Record<string, any> = {};

        const wInput = document.getElementById('resize-w') as HTMLInputElement;
        if (wInput?.value) data.width = wInput.value;

        const hInput = document.getElementById('resize-h') as HTMLInputElement;
        if (hInput?.value) data.height = hInput.value;

        const qInput = document.getElementById('compress-q') as HTMLInputElement;
        if (qInput?.value) data.quality = qInput.value;

        const angleInput = document.getElementById('rotate-angle') as HTMLSelectElement;
        if (angleInput?.value) data.angle = angleInput.value;

        // Specialized Tool Data Injection
        if (tool.id === 'resize-image-for-youtube-thumbnail') { data.width = 1280; data.height = 720; }
        else if (tool.id === 'resize-image-for-instagram') { data.width = 1080; data.height = 1080; }
        else if (tool.id === 'resize-image-for-linkedin') { data.width = 1200; data.height = 627; }
        else if (tool.id === 'resize-image-for-facebook') { data.width = 1200; data.height = 630; }
        else if (tool.id === 'resize-photo-for-resume') { data.width = 600; data.height = 600; }
        else if (tool.id === 'compress-pdf-to-1mb') { data.targetSize = 1024 * 1024; data.quality = 60; }
        else if (tool.id === 'compress-pdf-under-200kb') { data.targetSize = 200 * 1024; data.quality = 40; }
        else if (tool.id === 'ai-translate') {
            const langInput = document.getElementById('target-language') as HTMLSelectElement;
            data.language = langInput?.value || 'hindi';
        }
        else if (tool.id === 'ai-rewrite') {
            const toneInput = document.getElementById('rewrite-tone') as HTMLSelectElement;
            data.tone = toneInput?.value || 'professional';
        }

        const formatInput = document.getElementById('output-format') as HTMLSelectElement;
        if (tool.id === 'pdf-to-image') data.format = formatInput?.value || 'png';
        if (tool.id === 'image-to-pdf') data.format = 'pdf';

        formData.append('data', JSON.stringify(data));

        try {
            // 1. Upload
            const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';
            const endpoint = `${API_BASE}/api/upload`;
            console.log(`[Upload] Endpoint: ${endpoint}`);

            const responseData = await new Promise<any>((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('POST', endpoint);

                xhr.upload.onprogress = (event) => {
                    if (event.lengthComputable) {
                        const percent = Math.round((event.loaded * 100) / event.total);
                        setUploadProgress(percent);

                        // Calculate Speed & Time Remaining
                        const elapsedSeconds = (Date.now() - startTime) / 1000;
                        if (elapsedSeconds > 0.5) { // Wait a bit for stability

                            // Requirement: >90% switch UI to "Finalizing..."
                            if (percent > 90) {
                                setTimeRemaining('Finalizing... Network slow');
                            } else {
                                const speedBytesPerSec = event.loaded / elapsedSeconds;
                                const remainingBytes = event.total - event.loaded;
                                const remainingSeconds = Math.ceil(remainingBytes / speedBytesPerSec);

                                if (remainingSeconds < 60) {
                                    setTimeRemaining(`${remainingSeconds}s remaining`);
                                } else {
                                    setTimeRemaining(`${Math.ceil(remainingSeconds / 60)}m remaining`);
                                }
                            }
                        }
                    }
                };

                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        try {
                            resolve(JSON.parse(xhr.responseText));
                        } catch (e) {
                            // If JSON parse fails, implies bad response
                            reject(new Error("Invalid server response"));
                        }
                    } else {
                        reject(new Error(xhr.responseText || `Upload failed with status ${xhr.status}`));
                    }
                };

                xhr.onerror = () => {
                    // Requirement: Do NOT treat XHR.onerror as failure on mobile immediately
                    // Root cause is usually mobile browser cutting connection on slow response.
                    // Since we fixed backend to be ACK-first, this should be rare.
                    // If it happens, we assume it failed but we log it.
                    console.error('[Upload] XHR Network Error triggered');
                    console.error('[Upload] Status:', xhr.status);
                    console.error('[Upload] ReadyState:', xhr.readyState);
                    console.error('[Upload] ResponseText:', xhr.responseText);
                    reject(new Error('Network Error (Check connection)'));
                };

                console.log('[Upload] Sending XHR with formData, files count:', files.length);
                console.log('[Upload] FormData toolId:', formData.get('toolId'));
                xhr.send(formData);
            });

            if (responseData.jobId) {
                setJobId(responseData.jobId);
                setStatus('processing');
                setProcessingStartTime(Date.now());
                setProcessingProgress(0);
                setTimeRemaining('0s elapsed');

                if (tool.id === 'ai-chat') {
                    setStatus('completed');
                    setChatMessages([{ role: 'ai', content: `Ready to chat with ${files[0].name}. Ask me anything!` }]);
                }
            } else {
                console.error("Upload failed: No jobId received", responseData);
                setStatus('failed');
                alert(responseData.error || "Upload failed");
            }
        } catch (e: any) {
            console.error("Upload error", e);
            setStatus('failed');

            let displayMsg = e.message;
            try {
                // Try to parse JSON error from backend if possible
                const errorData = JSON.parse(e.message);
                displayMsg = errorData.error || e.message;
            } catch {
                // Raw message
            }

            setErrorMessage(displayMsg); // Show in the Red Box
            // alert(displayMsg); // Optional: keep alert or remove it
        }
    };


    const handleChatSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim()) return;

        const userMsg = chatInput;
        setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setChatInput('');

        try {
            // Chat API is a Next.js API route (not on backend)
            const res = await fetch('/api/ai/chat-message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg, context: pdfContext })
            });
            const data = await res.json();
            setChatMessages(prev => [...prev, { role: 'ai', content: data.response }]);
        } catch (e) {
            console.error(e);
        }
    };

    const maxFiles = parseInt(process.env.NEXT_PUBLIC_MAX_UPLOAD_FILES || '100');

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3 flex items-center justify-center gap-3">
                        {tool.title}
                        {tool.ai && <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded-full">AI Powered</span>}
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">{tool.description}</p>
                </div>

                {/* Main Content */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl dark:shadow-blue-900/10 p-8 border border-slate-100 dark:border-slate-800 min-h-[400px]">
                    {status === 'idle' ? (
                        <>
                            <BulkUploader
                                files={files}
                                onFilesChange={setFiles}
                                accept={tool.type === 'image' || tool.id === 'image-to-pdf'
                                    ? { 'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp', '.tiff', '.tif', '.heic', '.heif'] }
                                    : tool.id === 'doc-to-pdf'
                                        ? {
                                            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
                                            'application/msword': ['.doc']
                                        }
                                        : { 'application/pdf': ['.pdf'] }
                                }
                                maxFiles={maxFiles}
                                maxSize={100 * 1024 * 1024} // 100MB
                            />

                            {/* Options Panel */}
                            {files.length > 0 && (
                                <div className="mt-8 animate-in fade-in slide-in-from-bottom-4">
                                    {tool.id === 'image-resizer' && (
                                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                                            <h3 className="font-semibold mb-3 dark:text-white">Resize Options</h3>
                                            <div className="flex gap-4">
                                                <div>
                                                    <label className="text-xs text-slate-500 block mb-1">Width (px)</label>
                                                    <input type="number" placeholder="Auto" id="resize-w" className="w-full rounded-md border-slate-300 dark:bg-slate-900 dark:border-slate-600 px-3 py-2 text-sm" />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-slate-500 block mb-1">Height (px)</label>
                                                    <input type="number" placeholder="Auto" id="resize-h" className="w-full rounded-md border-slate-300 dark:bg-slate-900 dark:border-slate-600 px-3 py-2 text-sm" />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {(tool.id === 'image-compressor' || tool.id === 'compress-pdf') && (
                                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                                            <div className="flex justify-between items-center mb-3">
                                                <h3 className="font-semibold dark:text-white">Compression Level</h3>
                                                <span className="text-sm font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-md">
                                                    {compressionQuality}%
                                                </span>
                                            </div>
                                            <input
                                                type="range"
                                                min="30"
                                                max="90"
                                                value={compressionQuality}
                                                onChange={(e) => setCompressionQuality(parseInt(e.target.value))}
                                                id="compress-q"
                                                className="w-full accent-blue-600"
                                            />
                                            <div className="flex justify-between text-xs text-slate-500 mt-1">
                                                <span>Max Safe Compression</span>
                                                <span>Light Compression</span>
                                            </div>
                                        </div>
                                    )}

                                    {tool.id === 'rotate-pdf' && (
                                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                                            <h3 className="font-semibold mb-3 dark:text-white">Rotation</h3>
                                            <select id="rotate-angle" className="w-full rounded-md border-slate-300 dark:bg-slate-900 dark:border-slate-600 px-3 py-2 text-sm">
                                                <option value="90">90° Clockwise</option>
                                                <option value="180">180°</option>
                                                <option value="270">90° Counter-Clockwise</option>
                                            </select>
                                        </div>
                                    )}

                                    {tool.id === 'pdf-to-image' && (
                                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                                            <h3 className="font-semibold mb-3 dark:text-white">Output Format</h3>
                                            <select id="output-format" title="Select output image format" className="w-full rounded-md border-slate-300 dark:bg-slate-900 dark:border-slate-600 px-3 py-2 text-sm">
                                                <option value="png">PNG — Lossless, best quality</option>
                                                <option value="jpg">JPG — Smaller file size</option>
                                            </select>
                                            <p className="text-xs text-slate-500 mt-2">PNG preserves sharp text. JPG is better for photos and smaller files.</p>
                                        </div>
                                    )}

                                    {tool.id === 'summarize-pdf' && (
                                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                                            <h3 className="font-semibold mb-3 dark:text-white">Summary Mode</h3>
                                            <div className="grid grid-cols-3 gap-2">
                                                {(['brief', 'detailed', 'bullets'] as const).map((mode) => (
                                                    <button
                                                        key={mode}
                                                        onClick={() => setSummaryMode(mode)}
                                                        className={clsx(
                                                            "py-3 px-4 rounded-lg text-sm font-medium transition-all",
                                                            summaryMode === mode
                                                                ? "bg-violet-600 text-white shadow-lg shadow-violet-500/25"
                                                                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-600"
                                                        )}
                                                    >
                                                        {mode === 'brief' && '📝 Brief'}
                                                        {mode === 'detailed' && '📄 Detailed'}
                                                        {mode === 'bullets' && '• Bullets'}
                                                    </button>
                                                ))}
                                            </div>
                                            <p className="text-xs text-slate-500 mt-3">
                                                {summaryMode === 'brief' && 'Get a 2-3 sentence overview of the main points.'}
                                                {summaryMode === 'detailed' && 'Get a comprehensive multi-paragraph summary.'}
                                                {summaryMode === 'bullets' && 'Get 5-10 bullet points with key takeaways.'}
                                            </p>
                                        </div>
                                    )}

                                    {tool.id === 'ai-translate' && (
                                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                                            <h3 className="font-semibold mb-3 dark:text-white">Target Language</h3>
                                            <select id="target-language" title="Select target language" className="w-full rounded-md border-slate-300 dark:bg-slate-900 dark:border-slate-600 px-3 py-2 text-sm">
                                                <option value="hindi">Hindi (हिंदी)</option>
                                                <option value="marathi">Marathi (मराठी)</option>
                                                <option value="tamil">Tamil (தமிழ்)</option>
                                                <option value="telugu">Telugu (తెలుగు)</option>
                                                <option value="bengali">Bengali (বাংলা)</option>
                                                <option value="kannada">Kannada (ಕನ್ನಡ)</option>
                                                <option value="gujarati">Gujarati (ગુજરાતી)</option>
                                                <option value="spanish">Spanish</option>
                                                <option value="french">French</option>
                                                <option value="german">German</option>
                                            </select>
                                        </div>
                                    )}

                                    {tool.id === 'ai-rewrite' && (
                                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                                            <h3 className="font-semibold mb-3 dark:text-white">Desired Tone</h3>
                                            <select id="rewrite-tone" title="Select desired tone" className="w-full rounded-md border-slate-300 dark:bg-slate-900 dark:border-slate-600 px-3 py-2 text-sm">
                                                <option value="professional">Professional & Polished</option>
                                                <option value="casual">Casual & Friendly</option>
                                                <option value="formal">Academic & Formal</option>
                                                <option value="creative">Creative & Engaging</option>
                                                <option value="simple">Simple & Easy to Read</option>
                                            </select>
                                        </div>
                                    )}

                                    <button
                                        onClick={handleProcess}
                                        className="w-full mt-6 bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
                                    >
                                        {files.length > 1 ? `Process ${files.length} Files` : 'Process File'}
                                        {isClientSideTool(tool.id) && (
                                            <span className="ml-2 text-xs opacity-80">⚡ Instant</span>
                                        )}
                                    </button>
                                </div>
                            )}

                            <div className="mt-8">
                                <AdBanner />
                            </div>
                        </>
                    ) : (
                        <div className="w-full">
                            {/* Status Bar */}
                            <div className="mb-8 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Icons.File className="text-blue-500 w-5 h-5" />
                                    <div className="flex flex-col">
                                        <span className="font-medium dark:text-white">
                                            {files.length > 1 ? `${files.length} files selected` : files[0]?.name}
                                        </span>
                                        <span className="text-xs text-slate-500">
                                            {(files.reduce((acc, f) => acc + f.size, 0) / (1024 * 1024)).toFixed(2)} MB total
                                        </span>
                                    </div>
                                </div>
                                <button onClick={() => { setFiles([]); setStatus('idle'); setChatMessages([]); setResult(null); }} className="text-sm text-red-500 hover:text-red-600">
                                    Cancel
                                </button>
                            </div>

                            {(status === 'processing' || status === 'uploading') && (
                                <div className="w-full">
                                    <ProgressBar
                                        status={status}
                                        progress={status === 'uploading' ? uploadProgress : processingProgress}
                                        timeRemaining={timeRemaining}
                                    />
                                    {summaryStatus && (
                                        <p className="text-xs text-center text-slate-500 mt-2 animate-pulse">
                                            {summaryStatus}
                                        </p>
                                    )}
                                </div>
                            )}

                            {status === 'failed' && (
                                <div className="text-center py-10">
                                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Icons.FileText className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-xl font-bold dark:text-white mb-2">Processing Failed</h3>
                                    <div className="text-slate-500 mb-6 bg-red-50 dark:bg-red-900/10 p-4 rounded-xl inline-block max-w-lg">
                                        <p className="font-medium text-red-600 dark:text-red-400 mb-1">{errorMessage || "Something went wrong while processing your files."}</p>
                                        <p className="text-xs text-slate-400">Ref: {jobId ? jobId.slice(-6) : 'UPLOAD_ERR'}</p>
                                    </div>
                                    <div className="flex justify-center gap-4">
                                        <button onClick={() => { setStatus('idle'); setResult(null); }} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
                                            Retry
                                        </button>
                                        <button onClick={() => { setFiles([]); setStatus('idle'); setResult(null); }} className="bg-slate-200 text-slate-700 px-6 py-2 rounded-xl font-medium hover:bg-slate-300 transition-colors">
                                            Start Over
                                        </button>
                                    </div>
                                </div>
                            )}

                            {status === 'completed' && tool.id === 'ai-chat' && (
                                <div className="flex flex-col h-[500px]">
                                    <div className="flex-1 overflow-y-auto mb-4 space-y-4 p-4 bg-slate-50 dark:bg-black/20 rounded-xl">
                                        {chatMessages.map((msg, idx) => (
                                            <div key={idx} className={clsx("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
                                                <div className={clsx("max-w-[80%] rounded-2xl px-4 py-3",
                                                    msg.role === 'user' ? "bg-blue-600 text-white rounded-br-none" : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-bl-none dark:text-slate-200")}>
                                                    {msg.role === 'ai' ? (
                                                        <div className="prose prose-sm dark:prose-invert max-w-none">
                                                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                                                        </div>
                                                    ) : (
                                                        <p className="whitespace-pre-wrap">{msg.content}</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <form onSubmit={handleChatSubmit} className="flex gap-2">
                                        <input
                                            value={chatInput}
                                            onChange={e => setChatInput(e.target.value)}
                                            placeholder="Ask something about the document..."
                                            className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                                        />
                                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl transition-colors">
                                            <Icons.ArrowRight className="w-5 h-5" />
                                        </button>
                                    </form>
                                </div>
                            )}

                            {status === 'completed' && tool.id === 'summarize-pdf' && summaryResult && (
                                <div className="py-6">
                                    <div className="flex items-center justify-center gap-2 mb-6">
                                        <div className="w-12 h-12 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                                            <Icons.ListChecks className="w-6 h-6" />
                                        </div>
                                        <div className="text-left">
                                            <h3 className="text-lg font-bold dark:text-white">Summary Ready!</h3>
                                            {result?.isMock && (
                                                <span className="text-xs text-amber-600 dark:text-amber-400">Demo mode - API key not configured</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6 mb-6 border border-slate-200 dark:border-slate-700 text-left">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="text-xs font-medium text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-900/30 px-2 py-1 rounded">
                                                {summaryMode === 'brief' ? '📝 Brief Summary' : summaryMode === 'detailed' ? '📄 Detailed Summary' : '• Bullet Points'}
                                            </span>
                                            <button
                                                onClick={() => navigator.clipboard.writeText(summaryResult)}
                                                className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1"
                                            >
                                                <Icons.Copy className="w-3 h-3" /> Copy
                                            </button>
                                        </div>
                                        <div className="prose prose-sm dark:prose-invert max-w-none">
                                            <ReactMarkdown>{summaryResult}</ReactMarkdown>
                                        </div>
                                    </div>

                                    <div className="flex justify-center gap-4">
                                        <button
                                            onClick={() => {
                                                const blob = new Blob([summaryResult], { type: 'text/plain' });
                                                const url = URL.createObjectURL(blob);
                                                const a = document.createElement('a');
                                                a.href = url;
                                                a.download = `${files[0]?.name?.replace('.pdf', '') || 'document'}-summary.txt`;
                                                a.click();
                                                URL.revokeObjectURL(url);
                                            }}
                                            className="flex items-center gap-2 bg-violet-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-violet-700 transition-all shadow-lg shadow-violet-500/25"
                                        >
                                            <Icons.Download className="w-4 h-4" />
                                            Download Summary
                                        </button>
                                        <button
                                            onClick={() => { setFiles([]); setStatus('idle'); setResult(null); setSummaryResult(null); }}
                                            className="px-6 py-3 text-slate-500 hover:text-slate-700 font-medium"
                                        >
                                            Summarize Another
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* AI Notes Result Viewer */}
                            {status === 'completed' && tool.id === 'ai-notes' && aiResult && (
                                <div className="py-6">
                                    <div className="flex items-center justify-center gap-2 mb-6">
                                        <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                                            <Icons.FileText className="w-6 h-6" />
                                        </div>
                                        <div className="text-left">
                                            <h3 className="text-lg font-bold dark:text-white">Notes Ready!</h3>
                                            <p className="text-xs text-slate-500">Structured notes generated from your PDF</p>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6 mb-6 border border-slate-200 dark:border-slate-700 text-left">
                                        <div className="flex justify-between items-start mb-4">
                                            <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                                                {aiResult.title || 'Notes'}
                                            </h2>
                                            <button
                                                onClick={() => {
                                                    const text = (aiResult.topics || []).map((t: any) =>
                                                        `## ${t.heading}\n${(t.points || []).map((p: string) => `- ${p}`).join('\n')}`
                                                    ).join('\n\n');
                                                    navigator.clipboard.writeText(`# ${aiResult.title || 'Notes'}\n\n${text}`);
                                                }}
                                                className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1 shrink-0"
                                            >
                                                <Icons.Copy className="w-3 h-3" /> Copy
                                            </button>
                                        </div>

                                        <div className="space-y-5">
                                            {(aiResult.topics || []).map((topic: any, idx: number) => (
                                                <div key={idx}>
                                                    <h3 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-2">
                                                        <span className="w-6 h-6 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                                                        {topic.heading}
                                                    </h3>
                                                    <ul className="space-y-1.5 ml-8">
                                                        {(topic.points || []).map((point: string, pIdx: number) => (
                                                            <li key={pIdx} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                                                                <span className="text-blue-400 mt-1.5 shrink-0">•</span>
                                                                <span>{point}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex justify-center gap-4">
                                        <button
                                            onClick={() => {
                                                downloadNotesAsPdf(
                                                    aiResult,
                                                    `${files[0]?.name?.replace('.pdf', '') || 'document'}-notes.pdf`
                                                );
                                            }}
                                            className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/25"
                                        >
                                            <Icons.Download className="w-4 h-4" />
                                            Download Notes
                                        </button>
                                        <button
                                            onClick={() => { setFiles([]); setStatus('idle'); setResult(null); setAiResult(null); }}
                                            className="px-6 py-3 text-slate-500 hover:text-slate-700 font-medium"
                                        >
                                            Generate More Notes
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* AI Rewrite Result Viewer */}
                            {status === 'completed' && tool.id === 'ai-rewrite' && aiResult && (
                                <div className="py-6">
                                    <div className="flex items-center justify-center gap-2 mb-6">
                                        <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                                            <Icons.FileText className="w-6 h-6" />
                                        </div>
                                        <div className="text-left">
                                            <h3 className="text-lg font-bold dark:text-white">Rewrite Complete!</h3>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6 mb-6 border border-slate-200 dark:border-slate-700 text-left">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-2 py-1 rounded">✍️ Rewritten Text</span>
                                            <button onClick={() => navigator.clipboard.writeText(aiResult.rewrittenText || '')} className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1">
                                                <Icons.Copy className="w-3 h-3" /> Copy
                                            </button>
                                        </div>
                                        <div className="prose prose-sm dark:prose-invert max-w-none">
                                            <ReactMarkdown>{aiResult.rewrittenText || 'No content generated.'}</ReactMarkdown>
                                        </div>
                                    </div>
                                    <div className="flex justify-center gap-4">
                                        <button
                                            onClick={() => {
                                                downloadTextAsPdf(
                                                    aiResult.rewrittenText || '',
                                                    `${files[0]?.name?.replace('.pdf', '') || 'document'}-rewritten.pdf`,
                                                    'Rewritten Document'
                                                );
                                            }}
                                            className="flex items-center gap-2 bg-amber-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-amber-700 transition-all shadow-lg shadow-amber-500/25"
                                        >
                                            <Icons.Download className="w-4 h-4" /> Download Rewrite
                                        </button>
                                        <button onClick={() => { setFiles([]); setStatus('idle'); setResult(null); setAiResult(null); }} className="px-6 py-3 text-slate-500 hover:text-slate-700 font-medium">Rewrite Another</button>
                                    </div>
                                </div>
                            )}

                            {/* AI Translate Result Viewer */}
                            {status === 'completed' && tool.id === 'ai-translate' && aiResult && (
                                <div className="py-6">
                                    <div className="flex items-center justify-center gap-2 mb-6">
                                        <div className="w-12 h-12 bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                                            <Icons.FileText className="w-6 h-6" />
                                        </div>
                                        <div className="text-left">
                                            <h3 className="text-lg font-bold dark:text-white">Translation Ready!</h3>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6 mb-6 border border-slate-200 dark:border-slate-700 text-left">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="text-xs font-medium text-sky-600 dark:text-sky-400 bg-sky-100 dark:bg-sky-900/30 px-2 py-1 rounded">🌐 Translated Text</span>
                                            <button onClick={() => navigator.clipboard.writeText(aiResult.translatedText || '')} className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1">
                                                <Icons.Copy className="w-3 h-3" /> Copy
                                            </button>
                                        </div>
                                        <div className="prose prose-sm dark:prose-invert max-w-none">
                                            <ReactMarkdown>{aiResult.translatedText || 'No content generated.'}</ReactMarkdown>
                                        </div>
                                    </div>
                                    <div className="flex justify-center gap-4">
                                        <button
                                            onClick={() => {
                                                downloadTextAsPdf(
                                                    aiResult.translatedText || '',
                                                    `${files[0]?.name?.replace('.pdf', '') || 'document'}-translated.pdf`,
                                                    'Translated Document'
                                                );
                                            }}
                                            className="flex items-center gap-2 bg-sky-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-sky-700 transition-all shadow-lg shadow-sky-500/25"
                                        >
                                            <Icons.Download className="w-4 h-4" /> Download Translation
                                        </button>
                                        <button onClick={() => { setFiles([]); setStatus('idle'); setResult(null); setAiResult(null); }} className="px-6 py-3 text-slate-500 hover:text-slate-700 font-medium">Translate Another</button>
                                    </div>
                                </div>
                            )}

                            {status === 'completed' && tool.id !== 'ai-chat' && tool.id !== 'summarize-pdf' && tool.id !== 'ai-notes' && tool.id !== 'ai-rewrite' && tool.id !== 'ai-translate' && (
                                <div className="text-center py-10">
                                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4 animate-in zoom-in duration-300">
                                        <Icons.ListChecks className="w-8 h-8" />
                                    </div>

                                    <h3 className="text-xl font-bold dark:text-white mb-2">Processing Complete!</h3>

                                    {tool.id === 'compress-pdf' || tool.id === 'image-compressor' ? (
                                        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6 mb-8 border border-slate-200 dark:border-slate-700">
                                            {/* Smart Message Logic */}
                                            {result?.result?.metadata?.action === 'compressed' ? (
                                                <>
                                                    <span className="inline-block px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-sm font-bold mb-3">
                                                        Saved {Math.round((1 - (result.result.metadata.finalSize / result.result.metadata.originalSize)) * 100)}%
                                                    </span>
                                                    <p className="text-2xl font-bold dark:text-white mb-1">
                                                        {result.result.metadata.finalSize < 1024 * 1024
                                                            ? `${(result.result.metadata.finalSize / 1024).toFixed(0)} KB`
                                                            : `${(result.result.metadata.finalSize / 1024 / 1024).toFixed(2)} MB`}
                                                        <span className="text-base font-normal text-slate-400 line-through ml-2">
                                                            {result.result.metadata.originalSize < 1024 * 1024
                                                                ? `${(result.result.metadata.originalSize / 1024).toFixed(0)} KB`
                                                                : `${(result.result.metadata.originalSize / 1024 / 1024).toFixed(2)} MB`}
                                                        </span>
                                                    </p>
                                                    <p className="text-slate-500 text-sm">
                                                        Compression successful!
                                                        {compressionQuality <= 35 && (
                                                            <span className="block text-xs text-slate-400 mt-1">Maximum safe compression applied</span>
                                                        )}
                                                    </p>
                                                </>
                                            ) : result?.result?.metadata?.action === 'skipped_optimized' ? (
                                                <>
                                                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-sm font-bold mb-3">
                                                        Already Optimized
                                                    </span>
                                                    <p className="text-lg font-medium dark:text-white mb-2">
                                                        This PDF is already efficient.
                                                    </p>
                                                    <p className="text-slate-500 text-sm max-w-sm mx-auto">
                                                        We skipped compression to prevent quality loss or file size increase.
                                                    </p>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 rounded-full text-sm font-bold mb-3">
                                                        File Too Small
                                                    </span>
                                                    <p className="text-lg font-medium dark:text-white mb-2">
                                                        No compression needed.
                                                    </p>
                                                    <p className="text-slate-500 text-sm">
                                                        This file is small enough that compression would likely increase its size.
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-slate-600 dark:text-slate-400 mb-8">
                                            {result?.result?.count ? `Successfully processed ${result.result.count} files.` : 'Your files are ready for download.'}
                                        </p>
                                    )}

                                    <div className="flex justify-center gap-4">
                                        <button onClick={() => window.open(result?.downloadUrl || '#', '_blank')} className="flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transform hover:-translate-y-0.5">
                                            <Icons.Download className="w-5 h-5" />
                                            Download Result
                                        </button>

                                        <button onClick={() => { setFiles([]); setStatus('idle'); setResult(null); }} className="px-6 py-4 text-slate-500 hover:text-slate-700 font-medium">
                                            Process Another
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Ad Square */}
                            {(status === 'completed' || status === 'failed') && (
                                <div className="mt-8">
                                    <AdSquare />
                                </div>
                            )}
                        </div>
                    )}
                    <FeedbackWidget toolId={tool.id} />
                </div>

                {/* Related Tools */}
                <div className="mt-20">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 text-center">Related Tools</h2>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {TOOLS.filter(t => t.type === tool.type && t.id !== tool.id).slice(0, 3).map(related => (
                            <ToolCard key={related.id} tool={related} />
                        ))}
                    </div>
                </div>

                {/* SEO Content */}
                {tool.content && (
                    <div className="mt-20 space-y-20">
                        {/* Long Description (Rich SEO Content) */}
                        {tool.longDescription && (
                            <article className="prose prose-lg dark:prose-invert max-w-4xl mx-auto
                                prose-headings:font-bold prose-headings:text-slate-900 dark:prose-headings:text-white
                                prose-p:text-slate-600 dark:prose-p:text-slate-400
                                prose-strong:text-slate-900 dark:prose-strong:text-white
                                prose-li:text-slate-600 dark:prose-li:text-slate-400">
                                <ReactMarkdown>{tool.longDescription}</ReactMarkdown>
                            </article>
                        )}

                        {/* Features */}
                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 text-center">
                                Why use our {tool.title}?
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {tool.content.features.map((feature, idx) => {
                                    const [title, desc] = feature.split(': ');
                                    return (
                                        <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                                            <div className="flex items-start gap-4">
                                                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl">
                                                    <Icons.CheckCircle className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{title}</h3>
                                                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{desc || feature}</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>

                        {/* How To */}
                        <section className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 text-center">
                                How to {tool.title}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {tool.content.howTo.map((step, idx) => (
                                    <div key={idx} className="relative">
                                        <div className="text-5xl font-bold text-slate-100 dark:text-slate-800 absolute -top-4 -left-2 -z-10 select-none">
                                            {idx + 1}
                                        </div>
                                        <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Step {idx + 1}</h3>
                                        <p className="text-slate-600 dark:text-slate-400 text-sm">{step}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* FAQ */}
                        {tool.content.faq && tool.content.faq.length > 0 && (
                            <section className="max-w-3xl mx-auto">
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 text-center">
                                    Frequently Asked Questions
                                </h2>
                                <div className="space-y-4">
                                    {tool.content.faq.map((item, idx) => (
                                        <div key={idx} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                                            <div className="p-6">
                                                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{item.question}</h3>
                                                <p className="text-slate-600 dark:text-slate-400 text-sm">{item.answer}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Benefits Text Block */}
                        <section className="text-center max-w-2xl mx-auto">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                                Benefits of using FileSwift
                            </h2>
                            <div className="flex flex-wrap justify-center gap-3">
                                {tool.content.benefits.map((benefit, idx) => (
                                    <span key={idx} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full text-sm font-medium">
                                        {benefit}
                                    </span>
                                ))}
                            </div>
                        </section>
                    </div>
                )}
            </div>
        </div>
    );
}
