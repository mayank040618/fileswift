'use client';

const features = [
    {
        emoji: '⚡',
        title: 'Instant Generation',
        description: 'Get 5 unique bio options in under 3 seconds with our AI.',
    },
    {
        emoji: '🎨',
        title: 'Multiple Vibes',
        description: 'Choose from funny, professional, aesthetic, or custom tones.',
    },
    {
        emoji: '🔒',
        title: '100% Private',
        description: 'We don\'t store your data. Generate and go.',
    },
    {
        emoji: '📱',
        title: 'Works Everywhere',
        description: 'Mobile-friendly design. Use on any device, anytime.',
    },
    {
        emoji: '💯',
        title: 'Completely Free',
        description: 'No signup, no credit card, no hidden fees. Ever.',
    },
    {
        emoji: '🌍',
        title: 'Hindi Support',
        description: 'Generate bios in Hindi for regional appeal. Coming soon!',
    },
];

export function Features() {
    return (
        <section id="features" className="py-20 px-4">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
                    Why <span className="gradient-text">BioGenie</span>?
                </h2>
                <p className="text-gray-400 text-center max-w-2xl mx-auto mb-12">
                    The smartest AI bio generator built for creators, professionals, and everyone who wants to stand out online.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => (
                        <div key={index} className="glass-card p-6 hover:scale-[1.02] transition-transform">
                            <div className="text-4xl mb-4">{feature.emoji}</div>
                            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                            <p className="text-gray-400">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
