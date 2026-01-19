'use client';

import { useState } from 'react';

interface CaptionFormProps {
    onGenerate: (results: string[]) => void;
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
}

const contentTypes = [
    'Photo/Selfie',
    'Travel',
    'Food',
    'Fitness/Gym',
    'Fashion/OOTD',
    'Nature/Sunset',
    'Friends/Group',
    'Achievement/Milestone',
    'Motivational',
    'Random/General',
];

const moods = [
    { id: 'happy', label: 'Happy 😊' },
    { id: 'funny', label: 'Funny 😂' },
    { id: 'aesthetic', label: 'Aesthetic ✨' },
    { id: 'deep', label: 'Deep 💭' },
    { id: 'sarcastic', label: 'Sarcastic 😏' },
    { id: 'romantic', label: 'Romantic 💕' },
];

export function CaptionForm({ onGenerate, isLoading, setIsLoading }: CaptionFormProps) {
    const [contentType, setContentType] = useState('');
    const [selectedMood, setSelectedMood] = useState('happy');
    const [context, setContext] = useState('');
    const [hashtagCount, setHashtagCount] = useState('5');
    const [includeEmojis, setIncludeEmojis] = useState(true);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!contentType) return;

        setIsLoading(true);

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'caption',
                    contentType,
                    mood: selectedMood,
                    context,
                    hashtagCount: parseInt(hashtagCount),
                    includeEmojis,
                }),
            });

            const data = await response.json();

            if (data.results) {
                onGenerate(data.results);
            }
        } catch (error) {
            console.error('Generation failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header */}
            <div className="text-center mb-2">
                <h2 className="text-xl font-semibold">Caption Generator</h2>
                <p className="text-gray-400 text-sm">Create engaging captions with hashtags</p>
            </div>

            {/* Content Type */}
            <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                    What&apos;s your post about? *
                </label>
                <select
                    value={contentType}
                    onChange={(e) => setContentType(e.target.value)}
                    className="select-field"
                    required
                >
                    <option value="">Select content type...</option>
                    {contentTypes.map((c) => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
            </div>

            {/* Mood Selection */}
            <div>
                <label className="block text-sm font-medium mb-3 text-gray-300">
                    Choose the mood
                </label>
                <div className="flex flex-wrap gap-2">
                    {moods.map((mood) => (
                        <button
                            key={mood.id}
                            type="button"
                            onClick={() => setSelectedMood(mood.id)}
                            className={`vibe-btn ${selectedMood === mood.id ? 'selected' : ''}`}
                        >
                            {mood.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Context */}
            <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                    Additional context (optional)
                </label>
                <input
                    type="text"
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    placeholder="e.g., Beach vacation in Goa, First marathon..."
                    className="input-field"
                />
            </div>

            {/* Hashtag Count */}
            <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                    Number of hashtags
                </label>
                <select
                    value={hashtagCount}
                    onChange={(e) => setHashtagCount(e.target.value)}
                    className="select-field"
                >
                    <option value="0">No hashtags</option>
                    <option value="3">3 hashtags</option>
                    <option value="5">5 hashtags</option>
                    <option value="10">10 hashtags</option>
                    <option value="15">15 hashtags (max reach)</option>
                </select>
            </div>

            {/* Emoji toggle */}
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={() => setIncludeEmojis(!includeEmojis)}
                    className={`w-12 h-6 rounded-full transition-all ${includeEmojis ? 'bg-purple-500' : 'bg-gray-600'
                        } relative`}
                >
                    <span
                        className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-all ${includeEmojis ? 'left-6' : 'left-0.5'
                            }`}
                    />
                </button>
                <span className="text-sm text-gray-300">Include emojis</span>
            </div>

            {/* Submit */}
            <button
                type="submit"
                disabled={isLoading || !contentType}
                className="btn-primary w-full"
            >
                {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                        <div className="loading-dots">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                        Generating...
                    </span>
                ) : (
                    '✍️ Generate Caption'
                )}
            </button>
        </form>
    );
}
