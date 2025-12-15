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
import { ChunkedUploader, XHRUploader } from '@/utils/chunkedUpload';

export default function ToolClient({ toolId: propToolId }: { toolId?: string }) {
    const params = useParams();
    const toolId = propToolId || (params?.toolId as string);
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
    const [alignment, setAlignment] = useState<'top' | 'center' | 'bottom'>('center');

    // Chat State
    const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([]);
    const [chatInput, setChatInput] = useState('');

    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Debugging: Log errors to console (also ensures variable is 'used' for linter)
    useEffect(() => {
        if (errorMessage) console.error('[ToolClient] Error:', errorMessage);
    }, [errorMessage]);

    if (!tool) return <div className="p-10 text-center">Tool not found</div>;

    // Resume & Visibility Logic
    useEffect(() => {
        // Resume from LocalStorage
        const savedJobId = localStorage.getItem(`fileswift_job_${toolId}`);
        if (savedJobId && status === 'idle') {
            console.log('[Resume] Found saved job:', savedJobId);
            setJobId(savedJobId);
            setStatus('processing');
            setTimeRemaining('Resuming upload...');
        }

        // Tab Visibility Protection
        const handleVisibilityChange = () => {
            if (document.hidden && status === 'processing') {
                // We can't blocking alert, but we can set a state to show a warning banner if needed.
                // Or simply log. The real protection is backend not killing job + LocalStorage resume.
                console.log('[Visibility] App backgrounded, job continues on server.');
            } else if (!document.hidden && status === 'processing') {
                console.log('[Visibility] App returned, polling continues.');
                // Polling interval picks up naturally
            }
        };

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (status === 'processing' || status === 'uploading') {
                e.preventDefault();
                e.returnValue = ''; // Standard for Chrome
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [toolId, status]);

    useInterval(async () => {
        if (status === 'processing' && jobId && tool.id !== 'ai-chat') {
            try {
                const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';
                const res = await fetch(`${API_BASE}/api/jobs/${jobId}/status`);

                if (res.status === 200) {
                    const data = await res.json();
                    if (data.status === 'completed') {
                        setStatus('completed');
                        setResult(data);
                        localStorage.removeItem(`fileswift_job_${toolId}`); // Clear saved job
                    } else if (data.status === 'failed') {
                        setStatus('failed');
                        setErrorMessage(data.error);
                        localStorage.removeItem(`fileswift_job_${toolId}`);
                    }
                } else if (res.status === 404) {
                    // Job lost (server restart?) - Only if we didn't just resume it (give it a chance if persistent store is slow?)
                    // If server persistence is working, 404 means truly gone.
                    setStatus('failed');
                    setErrorMessage("Job not found (Server might have restarted)");
                    localStorage.removeItem(`fileswift_job_${toolId}`);
                } else if (res.status === 429) {
                    setStatus('failed');
                    setErrorMessage("Rate limit exceeded.");
                }
            } catch (e) {
                console.error("Polling error", e);
            }
        }

        // Processing Timer Update
        if (status === 'processing' && processingStartTime) {
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
    }, status === 'processing' ? 2000 : null);

    // Upload Logic
    const handleUpload = async () => {
        if (files.length === 0) return;

        // 1. Health Check (Optimistic)
        // We warn the user if health check fails, but we DO NOT BLOCK.
        // This ensures mobile wakeups/transient errors don't prevent uploads.
        const healthResult = await checkHealth();
        if (!healthResult.ready) {
            console.warn('[ToolClient] Health check failed, proceeding optimistically:', healthResult.error);
            // Optional: Show a toast? For now, silent validation.
        }

        setStatus('uploading');
        setTimeRemaining('Starting...');
        setUploadProgress(0);

        // Gather Data
        const data: Record<string, any> = {};
        const wInput = document.getElementById('resize-w') as HTMLInputElement;
        if (wInput?.value) data.width = wInput.value;
        const hInput = document.getElementById('resize-h') as HTMLInputElement;
        if (hInput?.value) data.height = hInput.value;
        const qInput = document.getElementById('compress-q') as HTMLInputElement;
        if (qInput?.value) data.quality = qInput.value;
        const angleInput = document.getElementById('rotate-angle') as HTMLSelectElement;
        if (angleInput?.value) data.angle = angleInput.value;
        if (tool.id === 'pdf-to-image') data.format = 'png';
        if (tool.id === 'pdf-to-image') data.format = 'png';
        if (tool.id === 'image-to-pdf') {
            data.format = 'pdf';
            data.alignment = alignment;
        }

        const isMobile = typeof navigator !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';
        console.log(`[Forensic] Uploading to API_BASE: ${API_BASE} | Files: ${files.length} | Mobile: ${isMobile}`);

        try {
            let responseData;

            // Strategy Selection
            if (isMobile && files.length === 1) {
                // Mobile Optimization: Chunked Upload (Single File)
                console.log('[Upload] Using Chunked Strategy (Mobile)');
                const uploader = new ChunkedUploader(files[0], tool.id, API_BASE);

                responseData = await uploader.start((p) => {
                    setUploadProgress(p.percent);
                    setTimeRemaining(p.percent < 100 ? `${100 - p.percent}% remaining` : 'Finalizing...');
                }, data);

            } else {
                // Standard Strategy: XHR (Desktop or Multi-file)
                console.log('[Upload] Using standard XHR Strategy');
                const uploader = new XHRUploader(files, tool.id, API_BASE);

                responseData = await uploader.start((p) => {
                    setUploadProgress(p.percent);
                    setTimeRemaining(p.percent < 100 ? `${100 - p.percent}%` : 'Processing...');
                }, data);
            }

            // Success Handling
            if (responseData.jobId) {
                localStorage.setItem(`fileswift_job_${tool.id}`, responseData.jobId);
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
                setStatus('failed');
                setErrorMessage("No Job ID received.");
            }

        } catch (e: any) {
            console.error("Upload failed", e);
            setStatus('failed');
            setErrorMessage(e.message || "Upload failed");
        }
    };


    // Fail-Open Health Check: We generally assume success unless proven otherwise.
    const checkHealth = async (): Promise<{ ready: boolean; error?: string }> => {
        const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';
        let lastError: any;

        // Try health check, but if it fails, we warn instead of blocking.
        // We only return ready: false if we have a very specific reason to believe upload is impossible.
        // Actually, for Adobe-grade reliability, we should probably NEVER block on a GET check.
        // We'll return the error for logging/warning, but handleUpload will decide.

        for (let i = 0; i < 3; i++) {
            try {
                const res = await fetch(`${API_BASE}/api/health/upload`);
                if (res.ok) {
                    const data = await res.json();

                    // Warning: Can we process? (Non-blocking)
                    fetch(`${API_BASE}/api/health/process`)
                        .then(r => r.json())
                        .then(d => {
                            if (!d.processReady) console.warn('[Health] Processing degraded:', d.error);
                        })
                        .catch(() => console.warn('[Health] Processing check failed'));

                    if (data.uploadReady) return { ready: true };
                }

                if (res.status === 503) {
                    await new Promise(r => setTimeout(r, 1000));
                    continue;
                }
                lastError = new Error(`Server returned ${res.status}`);

            } catch (e: any) {
                console.warn(`Health check attempt ${i + 1} failed (Non-blocking warning)`, e);
                lastError = e;
                await new Promise(r => setTimeout(r, 1000));
            }
        }

        return { ready: false, error: lastError?.message || 'Connection Warning' };
    };

    const handleChatSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim()) return;

        const userMsg = chatInput;
        setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setChatInput('');

        try {
            const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';
            const res = await fetch(`${API_BASE}/api/ai/chat-message`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jobId, message: userMsg })
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
                                    ? { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] }
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
                                                    <label htmlFor="resize-w" className="text-xs text-slate-500 block mb-1">Width (px)</label>
                                                    <input type="number" placeholder="Auto" id="resize-w" aria-label="Resize Width" className="w-full rounded-md border-slate-300 dark:bg-slate-900 dark:border-slate-600 px-3 py-2 text-sm" />
                                                </div>
                                                <div>
                                                    <label htmlFor="resize-h" className="text-xs text-slate-500 block mb-1">Height (px)</label>
                                                    <input type="number" placeholder="Auto" id="resize-h" aria-label="Resize Height" className="w-full rounded-md border-slate-300 dark:bg-slate-900 dark:border-slate-600 px-3 py-2 text-sm" />
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
                                                aria-label="Compression Quality"
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
                                            <select id="rotate-angle" aria-label="Rotation Angle" className="w-full rounded-md border-slate-300 dark:bg-slate-900 dark:border-slate-600 px-3 py-2 text-sm">
                                                <option value="90">90° Clockwise</option>
                                                <option value="180">180°</option>
                                                <option value="270">90° Counter-Clockwise</option>
                                            </select>
                                        </div>

                                    )}

                                    {tool.id === 'image-to-pdf' && (
                                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                                            <h3 className="font-semibold mb-3 dark:text-white">Image Alignment</h3>
                                            <div className="flex bg-white dark:bg-slate-900 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
                                                {(['top', 'center', 'bottom'] as const).map((opt) => (
                                                    <button
                                                        key={opt}
                                                        onClick={() => setAlignment(opt)}
                                                        className={clsx(
                                                            "flex-1 py-2 text-sm font-medium rounded-md transition-all",
                                                            alignment === opt
                                                                ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 shadow-sm"
                                                                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                                        )}
                                                    >
                                                        {opt.charAt(0).toUpperCase() + opt.slice(1)}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        onClick={handleUpload}
                                        className="w-full mt-6 bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
                                    >
                                        {files.length > 1 ? `Process ${files.length} Files` : 'Process File'}
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
                                <ProgressBar
                                    status={status}
                                    progress={status === 'uploading' ? uploadProgress : processingProgress}
                                    timeRemaining={timeRemaining}
                                />
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
                                                    {msg.content}
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

                            {status === 'completed' && tool.id !== 'ai-chat' && (
                                <div className="text-center py-10">
                                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4 animate-in zoom-in duration-300">
                                        <Icons.ListChecks className="w-8 h-8" />
                                    </div>

                                    <h3 className="text-xl font-bold dark:text-white mb-2">Processing Complete!</h3>

                                    {tool.id === 'compress-pdf' ? (
                                        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6 mb-8 border border-slate-200 dark:border-slate-700">
                                            {/* Smart Message Logic */}
                                            {result?.result?.metadata?.action === 'compressed' ? (
                                                <>
                                                    <span className="inline-block px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-sm font-bold mb-3">
                                                        Saved {Math.round((1 - (result.result.metadata.finalSize / result.result.metadata.originalSize)) * 100)}%
                                                    </span>
                                                    <p className="text-2xl font-bold dark:text-white mb-1">
                                                        {(result.result.metadata.finalSize / 1024 / 1024).toFixed(2)} MB
                                                        <span className="text-base font-normal text-slate-400 line-through ml-2">
                                                            {(result.result.metadata.originalSize / 1024 / 1024).toFixed(2)} MB
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
        </div >
    );
}
