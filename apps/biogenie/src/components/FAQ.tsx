'use client';

import { useState } from 'react';

const faqs = [
    {
        question: 'Is BioGenie really free?',
        answer: 'Yes! BioGenie is 100% free to use. No signup, no credit card, no limits. We sustain the service through minimal, non-intrusive ads.',
    },
    {
        question: 'How does the AI generate bios?',
        answer: 'We use Google\'s Gemini AI, one of the most advanced language models. It understands context, tone, and platform-specific formatting to create perfect bios.',
    },
    {
        question: 'Can I use the generated bios commercially?',
        answer: 'Absolutely! All bios generated are 100% yours to use however you want - personal profiles, business accounts, client work, etc.',
    },
    {
        question: 'Do you store my information?',
        answer: 'No. We don\'t store any of your inputs or generated content. Everything is processed in real-time and discarded immediately.',
    },
    {
        question: 'What platforms do you support?',
        answer: 'Currently we support Instagram, LinkedIn, Twitter/X bios, and social media captions. We\'re adding Tinder, Bumble, YouTube, and more soon!',
    },
    {
        question: 'Can I generate bios in Hindi?',
        answer: 'Hindi support is coming soon! We\'re training our AI to generate culturally relevant bios in Hindi and other Indian languages.',
    },
];

export function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section id="faq" className="py-20 px-4">
            <div className="max-w-3xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
                    Frequently Asked <span className="gradient-text">Questions</span>
                </h2>
                <p className="text-gray-400 text-center mb-12">
                    Got questions? We&apos;ve got answers.
                </p>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div key={index} className="glass-card overflow-hidden">
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full p-5 text-left flex items-center justify-between"
                            >
                                <span className="font-medium">{faq.question}</span>
                                <span className={`text-2xl transition-transform ${openIndex === index ? 'rotate-45' : ''}`}>
                                    +
                                </span>
                            </button>
                            {openIndex === index && (
                                <div className="px-5 pb-5 text-gray-400">
                                    {faq.answer}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
