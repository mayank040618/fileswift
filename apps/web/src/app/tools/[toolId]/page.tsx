import type { Metadata } from 'next';
import { TOOLS } from '@/config/tools';
import dynamic from 'next/dynamic';
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

    return {
        title: `${tool.title} | Free Online Tool - FileSwift`,
        description: tool.description,
        keywords: keywordList,
        openGraph: {
            title: `${tool.title} - FileSwift`,
            description: tool.description,
            type: 'website',
        }
    };
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

    return <ToolClient />;
}
