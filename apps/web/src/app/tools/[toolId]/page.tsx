import type { Metadata } from 'next';
import { TOOLS } from '@/config/tools';
import dynamic from 'next/dynamic';
import { Tool } from '@/config/tools';

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
            canonical: `https://fileswift.in/tools/${params.toolId}`,
        },
        openGraph: {
            title: title,
            description: description,
            type: 'website',
            url: `https://fileswift.in/tools/${params.toolId}`,
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
        </>
    );
}
