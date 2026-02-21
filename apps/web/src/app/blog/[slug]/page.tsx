import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BLOG_POSTS } from '@/config/blog-posts';
import { TOOLS } from '@/config/tools';
import ReactMarkdown from 'react-markdown';

interface Props {
    params: {
        slug: string;
    };
}

export async function generateStaticParams() {
    return BLOG_POSTS.map((post) => ({
        slug: post.slug,
    }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const post = BLOG_POSTS.find((p) => p.slug === params.slug);
    if (!post) return {};

    return {
        title: post.metaTitle,
        description: post.description,
        keywords: post.keywords,
        alternates: {
            canonical: `https://www.fileswift.in/blog/${post.slug}`,
        },
        openGraph: {
            title: post.title,
            description: post.description,
            url: `https://www.fileswift.in/blog/${post.slug}`,
            siteName: 'FileSwift',
            type: 'article',
            publishedTime: post.date,
            modifiedTime: post.updatedDate,
            authors: ['FileSwift'],
        },
    };
}

export default function BlogPostPage({ params }: Props) {
    const post = BLOG_POSTS.find((p) => p.slug === params.slug);

    if (!post) {
        notFound();
    }

    const primaryTool = TOOLS.find(t => t.id === post.primaryToolId);

    return (
        <article className="min-h-screen bg-white dark:bg-slate-950">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 py-16 sm:py-24 border-b border-white/10">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="flex justify-center items-center gap-3 mb-6">
                        <Link
                            href="/blog"
                            className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-1 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to Blog
                        </Link>
                        <span className="text-slate-600">•</span>
                        <span className="text-slate-400 text-sm">{post.readingTime} min read</span>
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-extrabold text-white mb-6 tracking-tight leading-tight">
                        {post.title}
                    </h1>
                    <div className="flex justify-center items-center gap-4 text-slate-400 text-sm">
                        <time dateTime={post.date}>
                            {new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </time>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
                {/* Intro Description */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 sm:p-8 mb-12 border border-blue-100 dark:border-blue-900/30">
                    <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed italic">
                        {post.description}
                    </p>
                </div>

                {/* Main Content Sections */}
                <div className="space-y-16">
                    {post.sections.map((section, idx) => (
                        <section key={idx} className="prose prose-slate dark:prose-invert max-w-none">
                            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-6">
                                {section.heading}
                            </h2>
                            <div className="text-slate-700 dark:text-slate-300 leading-relaxed space-y-4 text-lg">
                                <ReactMarkdown
                                    components={{
                                        p: ({ children }) => <p className="mb-4">{children}</p>,
                                        ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-2">{children}</ul>,
                                        ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-2">{children}</ol>,
                                        li: ({ children }) => <li className="pl-2">{children}</li>,
                                        strong: ({ children }) => <strong className="font-bold text-slate-900 dark:text-white">{children}</strong>,
                                        table: ({ children }) => (
                                            <div className="overflow-x-auto my-8">
                                                <table className="w-full border-collapse border border-slate-200 dark:border-slate-800 rounded-lg text-sm">
                                                    {children}
                                                </table>
                                            </div>
                                        ),
                                        thead: ({ children }) => <thead className="bg-slate-50 dark:bg-slate-900">{children}</thead>,
                                        th: ({ children }) => <th className="border border-slate-200 dark:border-slate-800 p-3 text-left font-bold">{children}</th>,
                                        td: ({ children }) => <td className="border border-slate-200 dark:border-slate-800 p-3 text-left">{children}</td>,
                                        a: ({ href, children }) => (
                                            <a href={href} className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                                                {children}
                                            </a>
                                        ),
                                    }}
                                >
                                    {section.content}
                                </ReactMarkdown>
                            </div>
                        </section>
                    ))}
                </div>

                {/* FAQ Section */}
                {post.faq.length > 0 && (
                    <section className="mt-20 pt-16 border-t border-slate-100 dark:border-slate-800">
                        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-10 text-center">
                            Frequently Asked Questions
                        </h2>
                        <div className="grid gap-6 sm:grid-cols-2">
                            {post.faq.map((item, idx) => (
                                <div key={idx} className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
                                        {item.question}
                                    </h3>
                                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                        {item.answer}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Why FileSwift */}
                <section className="mt-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 sm:p-12 text-white shadow-2xl overflow-hidden relative">
                    <div className="relative z-10">
                        <h2 className="text-2xl sm:text-3xl font-bold mb-8">Why Thousands Choose FileSwift</h2>
                        <div className="grid sm:grid-cols-2 gap-6">
                            {post.whyFileswift.map((point, idx) => (
                                <div key={idx} className="flex items-start gap-3">
                                    <div className="mt-1 bg-white/20 rounded-full p-1 inline-flex shrink-0">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <p className="text-blue-50 font-medium">{point}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl"></div>
                </section>

                {/* Final CTA */}
                {primaryTool && (
                    <section className="mt-16 text-center">
                        <p className="text-slate-600 dark:text-slate-400 mb-6 font-medium">Ready to optimize your files?</p>
                        <Link
                            href={primaryTool.slug}
                            className={`inline-flex items-center gap-3 ${primaryTool.color} text-white px-8 py-4 rounded-2xl font-bold text-lg hover:opacity-90 transition-all shadow-xl hover:-translate-y-1`}
                        >
                            Try {primaryTool.title}
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </Link>
                    </section>
                )}
            </div>

            {/* Related Posts */}
            <div className="bg-slate-50 dark:bg-slate-900 py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-2xl font-bold mb-8 text-slate-900 dark:text-white">Related Guides</h2>
                    <div className="grid gap-6 sm:grid-cols-2">
                        {BLOG_POSTS.filter(p => post.relatedSlugs.includes(p.slug)).map(related => (
                            <Link
                                key={related.slug}
                                href={`/blog/${related.slug}`}
                                className="group bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 transition-all shadow-sm hover:shadow-md"
                            >
                                <h3 className="font-bold group-hover:text-blue-600 transition-colors mb-2 dark:text-white">{related.title}</h3>
                                <p className="text-sm text-slate-500 line-clamp-2">{related.description}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* JSON-LD Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'BlogPosting',
                        'headline': post.title,
                        'description': post.description,
                        'author': {
                            '@type': 'Organization',
                            'name': 'FileSwift',
                        },
                        'datePublished': post.date,
                        'dateModified': post.updatedDate,
                        'mainEntityOfPage': {
                            '@type': 'WebPage',
                            '@id': `https://www.fileswift.in/blog/${post.slug}`,
                        },
                        'publisher': {
                            '@type': 'Organization',
                            'name': 'FileSwift',
                            'logo': {
                                '@type': 'ImageObject',
                                'url': 'https://www.fileswift.in/icon.png',
                            },
                        },
                        'faqPage': {
                            '@type': 'FAQPage',
                            'mainEntity': post.faq.map(f => ({
                                '@type': 'Question',
                                'name': f.question,
                                'acceptedAnswer': {
                                    '@type': 'Answer',
                                    'text': f.answer,
                                },
                            })),
                        },
                    }),
                }}
            />
        </article>
    );
}
