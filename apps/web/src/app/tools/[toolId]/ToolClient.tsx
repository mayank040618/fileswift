'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { BulkUploader } from '@/components/BulkUploader';
import { ProgressBar } from '@/components/ProgressBar';
import { TOOLS } from '@/config/tools';
import { Icons } from '@/components/Icons';
import { useInterval } from '@/hooks/useInterval';
import clsx from 'clsx';
import { AdBanner } from '@/components/ads/AdBanner';
import { AdSquare } from '@/components/ads/AdSquare';
import { Feedback } from '@/components/Feedback';
import { ToolCard } from '@/components/ToolCard';

export default function ToolClient() {
    const params = useParams();
    const toolId = params.toolId as string;
    const tool = TOOLS.find(t => t.id === toolId);

    const [files, setFiles] = useState<File[]>([]);
    const [jobId, setJobId] = useState<string | null>(null);
    const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'completed' | 'failed'>('idle');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [result, setResult] = useState<any>(null); // eslint-disable-line
    const [quality, setQuality] = useState(75); // Percentage for compression slider

    // Chat State
    const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([]);
    const [chatInput, setChatInput] = useState('');

    if (!tool) return <div className="p-10 text-center">Tool not found</div>;

    useInterval(async () => {
        if (status === 'processing' && jobId && tool.id !== 'ai-chat') {
            try {
                const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080').replace(/\/$/, '');
                const res = await fetch(`${apiUrl}/api/jobs/${jobId}/status`);
                const data = await res.json();

                if (res.status === 200) {
                    if (data.status === 'completed') {
                        setStatus('completed');
                        setResult(data);
                    } else if (data.status === 'failed') {
                        setStatus('failed');
                        alert(data.error || "Job failed");
                    }
                } else if (res.status === 404) {
                    // Job lost (server restart?)
                    setStatus('failed');
                } else if (res.status === 429) {
                    // Rate limit hit - stop polling to be safe
                    setStatus('failed');
                }
            } catch (e) {
                console.error("Polling error", e);
            }
        }
    }, status === 'processing' ? 1000 : null);

    const handleUpload = async () => {
        if (files.length === 0) return;
        setStatus('uploading');

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

        if (tool.id === 'pdf-to-image') data.format = 'png';
        if (tool.id === 'image-to-pdf') data.format = 'pdf';

        formData.append('data', JSON.stringify(data));

        try {
            // 1. Upload
            const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080').replace(/\/$/, '');
            const endpoint = `${apiUrl}/upload`;
            console.log(`[Upload] Endpoint: ${endpoint}`);

            const responseData = await new Promise<any>((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('POST', endpoint);

                xhr.upload.onprogress = (event) => {
                    if (event.lengthComputable) {
                        const percent = Math.round((event.loaded * 100) / event.total);
                        setUploadProgress(percent);
                    }
                };

                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolve(JSON.parse(xhr.responseText));
                    } else {
                        reject(new Error(xhr.responseText));
                    }
                };

                xhr.onerror = () => reject(new Error('Network Error'));
                xhr.send(formData);
            });

            if (responseData.jobId) {
                setJobId(responseData.jobId);
                setStatus('processing');

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
            try {
                const errorData = JSON.parse(e.message);
                alert(errorData.error || "Upload failed");
            } catch {
                alert("Upload failed: " + e.message);
            }
        }
    };


    const handleChatSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim()) return;

        const userMsg = chatInput;
        setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setChatInput('');

        try {
            const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080').replace(/\/$/, '');
            const res = await fetch(`${apiUrl}/api/ai/chat-message`, {
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
                                    : { 'application/pdf': ['.pdf'] }
                                }
                                maxFiles={maxFiles}
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
                                                <span className="text-sm font-bold text-blue-600 bg-blue-100 dark:bg-blue-900/40 px-2 py-1 rounded">{quality}%</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="5"
                                                max="95"
                                                value={quality}
                                                onChange={(e) => setQuality(parseInt(e.target.value))}
                                                id="compress-q"
                                                className="w-full accent-blue-600"
                                            />
                                            <div className="flex justify-between text-xs text-slate-500 mt-1">
                                                <span>Max Compression (Low Quality)</span>
                                                <span>Light Compression (High Quality)</span>
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
                                    <span className="font-medium dark:text-white">
                                        {files.length > 1 ? `${files.length} files processing...` : files[0]?.name}
                                    </span>
                                </div>
                                <button onClick={() => { setFiles([]); setStatus('idle'); setChatMessages([]); setResult(null); }} className="text-sm text-red-500 hover:text-red-600">
                                    Cancel
                                </button>
                            </div>

                            {(status === 'processing' || status === 'uploading') && (
                                <ProgressBar status={status} progress={status === 'uploading' ? uploadProgress : 65} />
                            )}

                            {status === 'failed' && (
                                <div className="text-center py-10">
                                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Icons.FileText className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-xl font-bold dark:text-white mb-2">Processing Failed</h3>
                                    <p className="text-slate-500 mb-6">Something went wrong while processing your files. Please try again.</p>
                                    <button onClick={() => { setFiles([]); setStatus('idle'); setResult(null); }} className="bg-slate-200 text-slate-700 px-6 py-2 rounded-xl font-medium hover:bg-slate-300 transition-colors">
                                        Try Again
                                    </button>
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

                                    <p className="text-slate-600 dark:text-slate-400 mb-8">
                                        {result?.result?.count ? `Successfully processed ${result.result.count} files.` : 'Your files are ready for download.'}
                                    </p>

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
                    <Feedback />
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
            </div>
        </div>
    );
}
