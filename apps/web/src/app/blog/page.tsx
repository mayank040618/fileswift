import type { Metadata } from 'next';
import Link from 'next/link';
import { BLOG_POSTS } from '@/config/blog-posts';
import { TOOLS } from '@/config/tools';

export const metadata: Metadata = {
    title: 'Blog – PDF Tips, Compression Guides & File Optimization | FileSwift',
    description: 'Expert guides on PDF compression, file conversion, image optimization, and productivity tips. Learn to reduce PDF size, convert files, and work smarter.',
    keywords: ['pdf tips', 'pdf compression guide', 'how to compress pdf', 'file optimization blog', 'pdf tools guide', 'reduce file size'],
    alternates: {
        canonical: 'https://www.fileswift.in/blog',
    },
    openGraph: {
        title: 'FileSwift Blog – PDF Tips & File Optimization Guides',
        description: 'Expert guides on PDF compression, file conversion, and image optimization.',
        url: 'https://www.fileswift.in/blog',
        siteName: 'FileSwift',
        type: 'website',
    },
};

export default function BlogPage() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 py-16 sm:py-24">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight">
                        FileSwift Blog
                    </h1>
                    <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto">
                        Expert guides on PDF compression, file conversion, image optimization, and
                        productivity tips to help you work smarter.
                    </p>
                </div>
            </div>

            {/* Blog Grid */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {BLOG_POSTS.map((post) => {
                        const primaryTool = TOOLS.find(t => t.id === post.primaryToolId);
                        return (
                            <Link
                                key={post.slug}
                                href={`/blog/${post.slug}`}
                                className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 hover:-translate-y-1"
                            >
                                {/* Card Header */}
                                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4">
                                    <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold rounded-full">
                                        {primaryTool?.title || 'Guide'}
                                    </span>
                                </div>

                                {/* Card Body */}
                                <div className="p-5">
                                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                                        {post.title}
                                    </h2>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-3">
                                        {post.description}
                                    </p>

                                    {/* Meta */}
                                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-500">
                                        <span className="flex items-center gap-1">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {post.readingTime} min read
                                        </span>
                                        <span>•</span>
                                        <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                    </div>
                                </div>

                                {/* Card Footer */}
                                <div className="px-5 pb-4">
                                    <span className="text-sm text-blue-600 dark:text-blue-400 font-semibold group-hover:underline">
                                        Read More →
                                    </span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Bottom CTA */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 sm:p-12 text-center">
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                        Ready to Try FileSwift?
                    </h2>
                    <p className="text-blue-100 mb-6 max-w-xl mx-auto">
                        Compress PDFs, resize images, and convert files — free, fast, and private.
                    </p>
                    <Link
                        href="/tools"
                        className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors shadow-lg"
                    >
                        Explore All Tools
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </Link>
                </div>
            </div>

            {/* JSON-LD for Blog Index */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'Blog',
                        'name': 'FileSwift Blog',
                        'description': 'Expert guides on PDF compression, file conversion, image optimization, and productivity tips.',
                        'url': 'https://www.fileswift.in/blog',
                        'publisher': {
                            '@type': 'Organization',
                            'name': 'FileSwift',
                            'url': 'https://www.fileswift.in',
                            'logo': {
                                '@type': 'ImageObject',
                                'url': 'https://www.fileswift.in/icon.png',
                            },
                        },
                        'blogPost': BLOG_POSTS.map(post => ({
                            '@type': 'BlogPosting',
                            'headline': post.title,
                            'description': post.description,
                            'url': `https://www.fileswift.in/blog/${post.slug}`,
                            'datePublished': post.date,
                            'dateModified': post.updatedDate,
                            'author': {
                                '@type': 'Organization',
                                'name': 'FileSwift',
                            },
                        })),
                    }),
                }}
            />
        </div>
    );
}
