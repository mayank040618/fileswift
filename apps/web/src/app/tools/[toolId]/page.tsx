import type { Metadata } from 'next';
import { TOOLS } from '@/config/tools';
import dynamic from 'next/dynamic';
import { Tool } from '@/config/tools';
import ReactMarkdown from 'react-markdown';

const ToolClient = dynamic(() => import('./ToolClient'), { ssr: false });

export async function generateMetadata({ params }: { params: { toolId: string } }): Promise<Metadata> {
    const tool = TOOLS.find(t => t.id === params.toolId);

    if (!tool) {
        return {
            title: 'Tool Not Found - FileSwift',
            description: 'The requested tool could not be found.',
        };
    }

    const keywordList = tool.keywords && tool.keywords.length > 0
        ? [...tool.keywords, 'file tools', 'pdf tools', 'online tools']
        : [`${tool.title} free`, `${tool.title} online`, 'file tools', 'pdf tools'];

    // New Title Format: {Primary Keyword} Online Free – Fast & Secure | FileSwift
    // Primary keyword is usually the first item in the keywords list if available, or the title.
    const primaryKeyword = tool.keywords?.[0] || tool.title;

    // Capitalize first letter of each word in primary keyword for Title Case
    const titleCaseKeyword = primaryKeyword.replace(/\w\S*/g, (w) => (w.replace(/^\w/, (c) => c.toUpperCase())));

    const title = `${titleCaseKeyword} Online Free – Fast & Secure | FileSwift`;

    // Dynamic Description based on tool type
    let description = tool.description;
    if (tool.id === 'compress-pdf') {
        description = "Compress and optimize PDFs online for free. FileSwift reduces PDF size without quality loss. No signup. Secure & fast.";
    } else if (tool.type === 'image') {
        description = `${tool.title} online for free. Optimize and resize images without losing quality. Secure, fast, and no signup required.`;
    } else {
        description = `${tool.title} online. Convert files securely and quickly with FileSwift. No installation or registration needed.`;
    }

    return {
        title: title,
        description: description,
        keywords: keywordList,
        alternates: {
            canonical: `https://www.fileswift.in/tools/${params.toolId}`,
        },
        openGraph: {
            title: title,
            description: description,
            type: 'website',
            url: `https://www.fileswift.in/tools/${params.toolId}`,
            siteName: 'FileSwift',
        },
        twitter: {
            card: 'summary_large_image',
            title: title,
            description: description,
        }
    };
}

function getJsonLd(tool: Tool) {
    const schemas: any[] = [];

    // 1. SoftwareApplication Schema
    schemas.push({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: tool.title,
        description: tool.description,
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Any',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
        },
        featureList: tool.content?.features.join(', ') || 'PDF Compression, Image Resizing, Format Conversion',
        softwareRequirements: 'Modern Web Browser',
    });

    // 2. FAQPage Schema
    if (tool.content?.faq && tool.content.faq.length > 0) {
        schemas.push({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: tool.content.faq.map(item => ({
                '@type': 'Question',
                name: item.question,
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: item.answer
                }
            }))
        });
    }

    return schemas;
}

export default function Page({ params }: { params: { toolId: string } }) {
    const tool = TOOLS.find(t => t.id === params.toolId);

    if (tool?.comingSoon) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center mb-6">
                    <span className="text-3xl">🚧</span>
                </div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                    {tool.title} is Coming Soon
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-400 max-w-lg mb-8">
                    We are working hard to bring this advanced AI feature to you.
                    It will be available in our upcoming Pro Plan.
                </p>
                <a href="/" className="text-blue-600 hover:text-blue-500 font-medium">
                    ← Back to Tools
                </a>
            </div>
        );
    }

    if (!tool) {
        return (
            <div className="min-h-[40vh] flex flex-col items-center justify-center">
                <h1 className="text-2xl font-bold mb-4">Tool Not Found</h1>
                <a href="/" className="text-blue-600 hover:text-blue-500">← Return Home</a>
            </div>
        )
    }

    const schemas = getJsonLd(tool);

    return (
        <>
            {schemas.map((schema, idx) => (
                <script
                    key={idx}
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
                />
            ))}
            
            <ToolClient />

            {/* Server-Side Content for SEO & AdSense */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
                
                {/* 1. Features Grid */}
                {tool.content?.features && (
                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Key Features</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {tool.content.features.map((feature, i) => (
                                <div key={i} className="flex gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                        <span className="font-bold text-lg">✓</span>
                                    </div>
                                    <div>
                                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                                            {feature.split(':')[0]}
                                        </p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                            {feature.split(':')[1]}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* 2. How To Guide */}
                {tool.content?.howTo && (
                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">
                            How to {tool.title.replace('Online', '').trim()}?
                        </h2>
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                            <div className="p-8">
                                <ol className="relative border-l border-slate-200 dark:border-slate-700 ml-3 space-y-8">
                                    {tool.content.howTo.map((step, i) => (
                                        <li key={i} className="mb-4 ml-6">
                                            <span className="absolute flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full -left-4 ring-4 ring-white dark:ring-slate-900 text-blue-600 dark:text-blue-400 font-bold text-sm">
                                                {i + 1}
                                            </span>
                                            <p className="text-lg text-slate-700 dark:text-slate-300">
                                                {step}
                                            </p>
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        </div>
                    </section>
                )}

                 {/* 3. Long Description (Markdown) */}
                 {tool.longDescription && (
                    <section className="prose dark:prose-invert max-w-none prose-slate prose-lg">
                        <ReactMarkdown>{tool.longDescription}</ReactMarkdown>
                    </section>
                )}

                {/* 4. Benefits */}
                {tool.content?.benefits && (
                    <section>
                         <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Benefits</h2>
                         <ul className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {tool.content.benefits.map((benefit, i) => (
                                <li key={i} className="flex items-center gap-3 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg">
                                    <span className="text-green-500 flex-shrink-0">✓</span>
                                    {benefit}
                                </li>
                            ))}
                         </ul>
                    </section>
                )}

                {/* 5. FAQ */}
                {tool.content?.faq && (
                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Frequently Asked Questions</h2>
                        <div className="space-y-4">
                            {tool.content.faq.map((item, i) => (
                                <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                                        {item.question}
                                    </h3>
                                    <p className="text-slate-600 dark:text-slate-400">
                                        {item.answer}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </>
    );
}
