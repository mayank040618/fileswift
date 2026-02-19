'use client';
import { useState } from 'react';
import axios from 'axios';

interface FeedbackProps {
    toolId: string;
}

export function FeedbackWidget({ toolId }: FeedbackProps) {
    const [submitted, setSubmitted] = useState(false);

    const sendFeedback = async (helpful: boolean) => {
        try {
            await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080'}/api/feedback`, {
                toolId,
                helpful
            });
        } catch (e) {
            console.error('Feedback failed', e);
        } finally {
            setSubmitted(true);
            setTimeout(() => setSubmitted(false), 5000); // Reset after 5s or just leave it? Reset allows re-vote potentially, but let's just leave it "Thanks"
        }
    };

    if (submitted) {
        return (
            <div className="text-center text-sm text-green-600 dark:text-green-400 mt-8 animate-fade-in">
                Thank you for your feedback! ❤️
            </div>
        );
    }

    return (
        <div className="mt-12 p-6 border-t border-slate-200 dark:border-slate-800 text-center">
            <p className="text-sm text-slate-500 mb-4">Was this tool helpful?</p>
            <div className="flex justify-center gap-4">
                <button
                    onClick={() => sendFeedback(true)}
                    className="px-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
                >
                    👍 Yes
                </button>
                <button
                    onClick={() => sendFeedback(false)}
                    className="px-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
                >
                    👎 No
                </button>
            </div>
        </div>
    );
}
