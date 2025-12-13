'use client';

import { motion } from 'framer-motion';

interface ProgressBarProps {
    status: 'uploading' | 'processing' | 'optimizing' | 'completed' | 'failed';
    progress: number;
    timeRemaining?: string;
}

export function ProgressBar({ status, progress, timeRemaining }: ProgressBarProps) {
    const getStatusText = () => {
        switch (status) {
            case 'uploading': return 'Uploading file securely...';
            case 'processing': return 'AI is processing content...';
            case 'optimizing': return 'Final polish and optimization...';
            case 'completed': return 'Ready for download!';
            case 'failed': return 'Processing failed.';
            default: return 'Initializing...';
        }
    };

    return (
        <div className="w-full max-w-md mx-auto space-y-4">
            <div className="flex justify-between items-end">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center">
                    {status === 'processing' && (
                        <span className="mr-2 relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                    )}
                    {getStatusText()}
                </span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{Math.round(progress)}%</span>
            </div>

            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className={`h-full rounded-full relative overflow-hidden ${status === 'failed' ? 'bg-red-500' : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                        }`}
                >
                    {status !== 'failed' && status !== 'completed' && (
                        <div className="absolute top-0 left-0 bottom-0 right-0 w-full h-full animate-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%]"></div>
                    )}
                </motion.div>
            </div>

            {(status === 'processing' || status === 'uploading') && (
                <p className="text-xs text-center text-slate-400 dark:text-slate-500 animate-pulse">
                    {timeRemaining || (status === 'processing' ? "Estimating time remaining..." : "Calculating...")}
                </p>
            )}
        </div>
    );
}
