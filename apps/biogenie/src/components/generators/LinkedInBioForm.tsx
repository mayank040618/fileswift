'use client';

import { useState } from 'react';

interface LinkedInBioFormProps {
    onGenerate: (results: string[]) => void;
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
}

const industries = [
    'Technology/IT',
    'Finance/Banking',
    'Healthcare',
    'Marketing/Sales',
    'Education',
    'Consulting',
    'Engineering',
    'Media/Entertainment',
    'Retail/E-commerce',
    'Startup',
    'Student/Fresh Graduate',
    'Other',
];

const tones = [
    { id: 'professional', label: 'Professional', description: 'Formal and polished' },
    { id: 'friendly', label: 'Friendly', description: 'Warm and approachable' },
    { id: 'confident', label: 'Confident', description: 'Bold and assertive' },
    { id: 'storytelling', label: 'Story-based', description: 'Narrative style' },
];

export function LinkedInBioForm({ onGenerate, isLoading, setIsLoading }: LinkedInBioFormProps) {
    const [jobTitle, setJobTitle] = useState('');
    const [industry, setIndustry] = useState('');
    const [experience, setExperience] = useState('');
    const [skills, setSkills] = useState('');
    const [selectedTone, setSelectedTone] = useState('professional');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!jobTitle || !industry) return;

        setIsLoading(true);

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'linkedin',
                    jobTitle,
                    industry,
                    experience,
                    skills,
                    tone: selectedTone,
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
                <h2 className="text-xl font-semibold">LinkedIn Summary Generator</h2>
                <p className="text-gray-400 text-sm">Create a professional summary that stands out</p>
            </div>

            {/* Job Title */}
            <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                    Job Title / Role *
                </label>
                <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g., Software Engineer, Marketing Manager..."
                    className="input-field"
                    required
                />
            </div>

            {/* Industry */}
            <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                    Industry *
                </label>
                <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="select-field"
                    required
                >
                    <option value="">Select your industry...</option>
                    {industries.map((i) => (
                        <option key={i} value={i}>{i}</option>
                    ))}
                </select>
            </div>

            {/* Experience */}
            <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                    Years of Experience
                </label>
                <select
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="select-field"
                >
                    <option value="">Select experience level...</option>
                    <option value="student">Student / Intern</option>
                    <option value="entry">0-2 years (Entry Level)</option>
                    <option value="mid">3-5 years (Mid Level)</option>
                    <option value="senior">6-10 years (Senior)</option>
                    <option value="expert">10+ years (Expert)</option>
                </select>
            </div>

            {/* Skills */}
            <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                    Key Skills (optional)
                </label>
                <input
                    type="text"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="e.g., Python, Leadership, Data Analysis..."
                    className="input-field"
                />
                <p className="text-xs text-gray-500 mt-1">Separate with commas</p>
            </div>

            {/* Tone Selection */}
            <div>
                <label className="block text-sm font-medium mb-3 text-gray-300">
                    Choose your tone
                </label>
                <div className="flex flex-wrap gap-2">
                    {tones.map((tone) => (
                        <button
                            key={tone.id}
                            type="button"
                            onClick={() => setSelectedTone(tone.id)}
                            className={`vibe-btn ${selectedTone === tone.id ? 'selected' : ''}`}
                        >
                            {tone.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Submit */}
            <button
                type="submit"
                disabled={isLoading || !jobTitle || !industry}
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
                    '💼 Generate Summary'
                )}
            </button>
        </form>
    );
}
