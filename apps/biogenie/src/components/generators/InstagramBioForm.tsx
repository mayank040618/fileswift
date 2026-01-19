'use client';

import { useState } from 'react';

interface InstagramBioFormProps {
    onGenerate: (results: string[]) => void;
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
}

const professions = [
    'Student',
    'Creator/Influencer',
    'Developer/Tech',
    'Designer',
    'Entrepreneur',
    'Freelancer',
    'Artist/Musician',
    'Fitness/Health',
    'Food/Travel',
    'Other',
];

const vibes = [
    { id: 'funny', label: 'Funny 😂', description: 'Witty and humorous' },
    { id: 'aesthetic', label: 'Aesthetic ✨', description: 'Soft and minimal' },
    { id: 'professional', label: 'Pro 💼', description: 'Clean and serious' },
    { id: 'bold', label: 'Bold 🔥', description: 'Confident and edgy' },
    { id: 'cute', label: 'Cute 🌸', description: 'Soft and adorable' },
];

export function InstagramBioForm({ onGenerate, isLoading, setIsLoading }: InstagramBioFormProps) {
    const [profession, setProfession] = useState('');
    const [selectedVibe, setSelectedVibe] = useState('funny');
    const [interests, setInterests] = useState('');
    const [includeEmojis, setIncludeEmojis] = useState(true);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profession) return;

        setIsLoading(true);

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'instagram',
                    profession,
                    vibe: selectedVibe,
                    interests,
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
                <h2 className="text-xl font-semibold">Instagram Bio Generator</h2>
                <p className="text-gray-400 text-sm">Create the perfect bio for your profile</p>
            </div>

            {/* Profession */}
            <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                    What do you do? *
                </label>
                <select
                    value={profession}
                    onChange={(e) => setProfession(e.target.value)}
                    className="select-field"
                    required
                >
                    <option value="">Select your profession...</option>
                    {professions.map((p) => (
                        <option key={p} value={p}>{p}</option>
                    ))}
                </select>
            </div>

            {/* Vibe Selection */}
            <div>
                <label className="block text-sm font-medium mb-3 text-gray-300">
                    Choose your vibe
                </label>
                <div className="flex flex-wrap gap-2">
                    {vibes.map((vibe) => (
                        <button
                            key={vibe.id}
                            type="button"
                            onClick={() => setSelectedVibe(vibe.id)}
                            className={`vibe-btn ${selectedVibe === vibe.id ? 'selected' : ''}`}
                        >
                            {vibe.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Interests */}
            <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                    Your interests (optional)
                </label>
                <input
                    type="text"
                    value={interests}
                    onChange={(e) => setInterests(e.target.value)}
                    placeholder="e.g., coffee, coding, travel, music..."
                    className="input-field"
                />
                <p className="text-xs text-gray-500 mt-1">Separate with commas</p>
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
                disabled={isLoading || !profession}
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
                    '✨ Generate Bio'
                )}
            </button>
        </form>
    );
}
