import type { Metadata } from 'next';
import { TOOLS } from '@/config/tools';
import dynamicImport from 'next/dynamic';
import { Tool } from '@/config/tools';

export const dynamic = "force-static";

const ToolClient = dynamicImport(() => import('../tools/[toolId]/ToolClient'), { ssr: false });

const TOOL_ID = 'image-resizer';

export async function generateMetadata(): Promise<Metadata> {
    const tool = TOOLS.find(t => t.id === TOOL_ID);
    if (!tool) return {};

    const keywordList = tool.keywords && tool.keywords.length > 0
        ? [...tool.keywords, 'file tools', 'pdf tools', 'online tools']
        : [`${tool.title} free`, `${tool.title} online`, 'file tools', 'pdf tools'];

    const primaryKeyword = tool.keywords?.[0] || tool.title;
    const titleCaseKeyword = primaryKeyword.replace(/\w\S*/g, (w) => (w.replace(/^\w/, (c) => c.toUpperCase())));
    const title = `${titleCaseKeyword} Online Free – Fast & Secure | FileSwift`;

    let description = "Resize images online for free. Change dimensions of JPG, PNG, and WEBP files. Set specific width and height in pixels.";

    return {
        title: title,
        description: description,
        keywords: keywordList,
        alternates: {
            canonical: `https://fileswift.in${tool.slug}`,
        },
        openGraph: {
            title: title,
            description: description,
            type: 'website',
            url: `https://fileswift.in${tool.slug}`,
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
        featureList: tool.content?.features.join(', ') || 'PDF Tools',
        softwareRequirements: 'Modern Web Browser',
    });

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

export default function Page() {
    const tool = TOOLS.find(t => t.id === TOOL_ID);
    if (!tool) return null;

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
            <div className="sr-only">
                <h1>{tool.title}</h1>
                <p>{tool.description}</p>
            </div>
            <ToolClient toolId={TOOL_ID} />
        </>
    );
}
