'use client';

import { useState } from 'react';

interface TwitterBioFormProps {
    onGenerate: (results: string[]) => void;
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
}

const personalities = [
    'Witty & Sarcastic',
    'Inspirational',
    'Nerdy/Geeky',
    'Minimalist',
    'Edgy & Bold',
    'Professional',
    'Meme Lord',
    'Mysterious',
];

const niches = [
    'Tech/Developer',
    'Creator/Influencer',
    'Artist/Designer',
    'Writer/Author',
    'Entrepreneur',
    'Crypto/Web3',
    'Gaming',
    'Fitness',
    'Just Vibing',
];

export function TwitterBioForm({ onGenerate, isLoading, setIsLoading }: TwitterBioFormProps) {
    const [personality, setPersonality] = useState('');
    const [niche, setNiche] = useState('');
    const [whatYouDo, setWhatYouDo] = useState('');
    const [includeEmojis, setIncludeEmojis] = useState(true);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!personality || !niche) return;

        setIsLoading(true);

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'twitter',
                    personality,
                    niche,
                    whatYouDo,
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
                <h2 className="text-xl font-semibold">Twitter/X Bio Generator</h2>
                <p className="text-gray-400 text-sm">Create witty bios that get followers</p>
            </div>

            {/* Personality */}
            <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                    Your personality *
                </label>
                <select
                    value={personality}
                    onChange={(e) => setPersonality(e.target.value)}
                    className="select-field"
                    required
                >
                    <option value="">Select your vibe...</option>
                    {personalities.map((p) => (
                        <option key={p} value={p}>{p}</option>
                    ))}
                </select>
            </div>

            {/* Niche */}
            <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                    Your niche *
                </label>
                <select
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    className="select-field"
                    required
                >
                    <option value="">What do you tweet about...</option>
                    {niches.map((n) => (
                        <option key={n} value={n}>{n}</option>
                    ))}
                </select>
            </div>

            {/* What you do */}
            <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                    Brief description (optional)
                </label>
                <input
                    type="text"
                    value={whatYouDo}
                    onChange={(e) => setWhatYouDo(e.target.value)}
                    placeholder="e.g., Building SaaS, Sharing memes, Coffee addict..."
                    className="input-field"
                />
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

            {/* Character limit note */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                <p className="text-blue-400 text-sm">
                    💡 Twitter bios have a 160 character limit. We&apos;ll keep it short!
                </p>
            </div>

            {/* Submit */}
            <button
                type="submit"
                disabled={isLoading || !personality || !niche}
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
                    '🐦 Generate Bio'
                )}
            </button>
        </form>
    );
}
