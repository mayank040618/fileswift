'use client';

import { useState } from 'react';
import { TabType } from './TabSelector';

interface ResultsSectionProps {
    results: string[];
    isLoading: boolean;
    tabType: TabType;
}

export function ResultsSection({ results, isLoading, tabType }: ResultsSectionProps) {
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handleCopy = async (text: string, index: number) => {
        await navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const getTitle = () => {
        switch (tabType) {
            case 'instagram': return '🎯 Generated Instagram Bios';
            case 'linkedin': return '💼 Generated LinkedIn Summaries';
            case 'twitter': return '🐦 Generated Twitter Bios';
            case 'caption': return '✨ Generated Captions';
            default: return '🎯 Generated Results';
        }
    };

    if (isLoading) {
        return (
            <div className="glass-card p-6 mt-6">
                <h3 className="text-lg font-semibold mb-4">{getTitle()}</h3>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="result-card shimmer h-20" />
                    ))}
                </div>
                <div className="flex items-center justify-center gap-2 mt-6 text-gray-400">
                    <div className="loading-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                    <span className="ml-2">Generating with AI...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="glass-card p-6 mt-6">
            <h3 className="text-lg font-semibold mb-4">{getTitle()}</h3>
            <div className="space-y-3">
                {results.map((result, index) => (
                    <div key={index} className="result-card">
                        <div className="flex justify-between items-start gap-4">
                            <p className="text-gray-200 whitespace-pre-wrap flex-1">{result}</p>
                            <button
                                onClick={() => handleCopy(result, index)}
                                className={`copy-btn shrink-0 ${copiedIndex === index ? 'copied' : ''}`}
                            >
                                {copiedIndex === index ? (
                                    <>
                                        <span>✓</span>
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <span>📋</span>
                                        Copy
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
