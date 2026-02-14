import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BLOG_POSTS } from '@/config/blog-posts';
import { TOOLS } from '@/config/tools';
import { AdBanner } from '@/components/ads/AdBanner';
import { AdSquare } from '@/components/ads/AdSquare';

export async function generateStaticParams() {
    return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
    const post = BLOG_POSTS.find(p => p.slug === params.slug);
    if (!post) {
        return { title: 'Post Not Found – FileSwift Blog' };
    }

    return {
        title: post.metaTitle,
        description: post.description,
        keywords: post.keywords,
        authors: [{ name: 'FileSwift' }],
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
        twitter: {
            card: 'summary_large_image',
            title: post.title,
            description: post.description,
        },
    };
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
    const post = BLOG_POSTS.find(p => p.slug === params.slug);
    if (!post) notFound();

    const primaryTool = TOOLS.find(t => t.id === post.primaryToolId);
    const relatedTools = post.relatedToolIds.map(id => TOOLS.find(t => t.id === id)).filter(Boolean);
    const relatedPosts = post.relatedSlugs.map(slug => BLOG_POSTS.find(p => p.slug === slug)).filter(Boolean);

    // JSON-LD Schemas
    const schemas: object[] = [
        {
            '@context': 'https://schema.org',
            '@type': 'Article',
            'headline': post.title,
            'description': post.description,
            'datePublished': post.date,
            'dateModified': post.updatedDate,
            'author': {
                '@type': 'Organization',
                'name': 'FileSwift',
                'url': 'https://www.fileswift.in',
            },
            'publisher': {
                '@type': 'Organization',
                'name': 'FileSwift',
                'url': 'https://www.fileswift.in',
                'logo': {
                    '@type': 'ImageObject',
                    'url': 'https://www.fileswift.in/icon.png',
                },
            },
            'mainEntityOfPage': {
                '@type': 'WebPage',
                '@id': `https://www.fileswift.in/blog/${post.slug}`,
            },
            'url': `https://www.fileswift.in/blog/${post.slug}`,
            'keywords': post.keywords.join(', '),
        },
        {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            'itemListElement': [
                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.fileswift.in' },
                { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://www.fileswift.in/blog' },
                { '@type': 'ListItem', position: 3, name: post.title, item: `https://www.fileswift.in/blog/${post.slug}` },
            ],
        },
    ];

    // FAQ Schema
    if (post.faq.length > 0) {
        schemas.push({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            'mainEntity': post.faq.map(faq => ({
                '@type': 'Question',
                'name': faq.question,
                'acceptedAnswer': {
                    '@type': 'Answer',
                    'text': faq.answer,
                },
            })),
        });
    }

    return (
        <>
            {/* JSON-LD */}
            {schemas.map((schema, idx) => (
                <script
                    key={idx}
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
                />
            ))}

            <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
                {/* Breadcrumb */}
                <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                        <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                            <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
                            <span>/</span>
                            <Link href="/blog" className="hover:text-blue-600 transition-colors">Blog</Link>
                            <span>/</span>
                            <span className="text-slate-900 dark:text-white font-medium truncate">{post.title}</span>
                        </nav>
                    </div>
                </div>

                {/* Article Header */}
                <header className="bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 py-12 sm:py-16">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="inline-flex items-center px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold rounded-full">
                                {primaryTool?.title || 'Guide'}
                            </span>
                            <span className="text-blue-200 text-sm">{post.readingTime} min read</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4 tracking-tight leading-tight">
                            {post.title}
                        </h1>
                        <p className="text-lg text-blue-100 max-w-3xl">
                            {post.description}
                        </p>
                        <div className="mt-6 flex items-center gap-4 text-sm text-blue-200">
                            <time dateTime={post.date}>
                                Published {new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </time>
                            {post.updatedDate !== post.date && (
                                <>
                                    <span>•</span>
                                    <time dateTime={post.updatedDate}>
                                        Updated {new Date(post.updatedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                    </time>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Top Banner Ad */}
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
                    <AdBanner />
                </div>

                {/* Article Content */}
                <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    {/* Table of Contents */}
                    <nav className="mb-10 p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                            </svg>
                            Table of Contents
                        </h2>
                        <ol className="space-y-2">
                            {post.sections.map((section, idx) => (
                                <li key={idx}>
                                    <a
                                        href={`#section-${idx}`}
                                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2"
                                    >
                                        <span className="text-slate-400">{idx + 1}.</span>
                                        {section.heading}
                                    </a>
                                </li>
                            ))}
                            <li>
                                <a href="#faq" className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2">
                                    <span className="text-slate-400">{post.sections.length + 1}.</span>
                                    Frequently Asked Questions
                                </a>
                            </li>
                        </ol>
                    </nav>

                    {/* Content Sections */}
                    <div className="space-y-12">
                        {post.sections.map((section, idx) => (
                            <section key={idx} id={`section-${idx}`}>
                                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-4 scroll-mt-6">
                                    {section.heading}
                                </h2>
                                <div className="prose prose-lg dark:prose-invert max-w-none
                                    prose-headings:font-bold prose-headings:text-slate-900 dark:prose-headings:text-white
                                    prose-p:text-slate-600 dark:prose-p:text-slate-400
                                    prose-strong:text-slate-800 dark:prose-strong:text-slate-200
                                    prose-a:text-blue-600 dark:prose-a:text-blue-400
                                    prose-table:bg-white dark:prose-table:bg-slate-900
                                    prose-th:bg-slate-100 dark:prose-th:bg-slate-800
                                    prose-td:border-slate-200 dark:prose-td:border-slate-700
                                    prose-li:text-slate-600 dark:prose-li:text-slate-400">
                                    {section.content.split('\n\n').map((paragraph, pIdx) => {
                                        // Handle markdown tables
                                        if (paragraph.trim().startsWith('|')) {
                                            const rows = paragraph.trim().split('\n').filter(r => !r.match(/^\|[\s-|]+\|$/));
                                            if (rows.length < 2) return <p key={pIdx}>{paragraph}</p>;

                                            const headers = rows[0].split('|').filter(c => c.trim()).map(c => c.trim().replace(/\*\*/g, ''));
                                            const dataRows = rows.slice(1);

                                            return (
                                                <div key={pIdx} className="overflow-x-auto my-6">
                                                    <table className="w-full text-sm border-collapse border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                                                        <thead>
                                                            <tr>
                                                                {headers.map((h, hIdx) => (
                                                                    <th key={hIdx} className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                                                                        {h}
                                                                    </th>
                                                                ))}
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {dataRows.map((row, rIdx) => {
                                                                const cells = row.split('|').filter(c => c.trim()).map(c => c.trim());
                                                                return (
                                                                    <tr key={rIdx} className="border-b border-slate-100 dark:border-slate-800 even:bg-slate-50 dark:even:bg-slate-900/50">
                                                                        {cells.map((cell, cIdx) => (
                                                                            <td key={cIdx} className="px-4 py-2.5 text-slate-600 dark:text-slate-400"
                                                                                dangerouslySetInnerHTML={{ __html: cell.replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900 dark:text-white">$1</strong>') }}
                                                                            />
                                                                        ))}
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            );
                                        }

                                        // Handle regular paragraphs with inline bold
                                        const htmlContent = paragraph
                                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                            .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-600 dark:text-blue-400 hover:underline">$1</a>');

                                        // If it starts with a bullet or number
                                        if (paragraph.trim().match(/^[-•]\s/) || paragraph.trim().match(/^\d+\.\s/)) {
                                            const items = paragraph.trim().split('\n').filter(Boolean);
                                            const isOrdered = items[0].match(/^\d+\.\s/);
                                            const ListTag = isOrdered ? 'ol' : 'ul';
                                            return (
                                                <ListTag key={pIdx} className={`${isOrdered ? 'list-decimal' : 'list-disc'} pl-6 space-y-2 my-4`}>
                                                    {items.map((item, iIdx) => (
                                                        <li key={iIdx}
                                                            className="text-slate-600 dark:text-slate-400"
                                                            dangerouslySetInnerHTML={{
                                                                __html: item.replace(/^[-•\d.]+\s*/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-600 dark:text-blue-400 hover:underline">$1</a>'),
                                                            }}
                                                        />
                                                    ))}
                                                </ListTag>
                                            );
                                        }

                                        return (
                                            <p key={pIdx} className="text-slate-600 dark:text-slate-400 leading-relaxed my-4"
                                                dangerouslySetInnerHTML={{ __html: htmlContent }}
                                            />
                                        );
                                    })}
                                </div>

                                {/* Mid-content ad after 2nd and 4th sections */}
                                {(idx === 1 || idx === 3) && (
                                    <div className="my-8">
                                        <AdBanner />
                                    </div>
                                )}
                            </section>
                        ))}
                    </div>

                    {/* CTA: Try the Tool */}
                    {primaryTool && (
                        <div className="my-12 p-6 sm:p-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl text-center">
                            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                                Try {primaryTool.title} — Free & Instant
                            </h3>
                            <p className="text-blue-100 mb-5 max-w-lg mx-auto">
                                {primaryTool.description}
                            </p>
                            <Link
                                href={`/tools/${primaryTool.id}`}
                                className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors shadow-lg"
                            >
                                Use {primaryTool.title} Now
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </Link>
                        </div>
                    )}

                    {/* Why FileSwift */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                            Why Choose FileSwift?
                        </h2>
                        <div className="grid gap-3 sm:grid-cols-2">
                            {post.whyFileswift.map((point, idx) => (
                                <div key={idx} className="flex items-start gap-3 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-sm text-slate-700 dark:text-slate-300">{point}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* FAQ */}
                    <section id="faq" className="mb-12 scroll-mt-6">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                            Frequently Asked Questions
                        </h2>
                        <div className="space-y-4">
                            {post.faq.map((faq, idx) => (
                                <details
                                    key={idx}
                                    className="group bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden"
                                >
                                    <summary className="flex items-center justify-between px-6 py-4 cursor-pointer list-none hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <h3 className="font-semibold text-slate-900 dark:text-white pr-4">
                                            {faq.question}
                                        </h3>
                                        <svg className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </summary>
                                    <div className="px-6 pb-4 text-slate-600 dark:text-slate-400 leading-relaxed">
                                        {faq.answer}
                                    </div>
                                </details>
                            ))}
                        </div>
                    </section>

                    {/* Bottom Ad */}
                    <div className="mb-12">
                        <AdSquare />
                    </div>

                    {/* Related Articles */}
                    {relatedPosts.length > 0 && (
                        <section className="mb-12">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                                Related Articles
                            </h2>
                            <div className="grid gap-4 sm:grid-cols-2">
                                {relatedPosts.map((related) => related && (
                                    <Link
                                        key={related.slug}
                                        href={`/blog/${related.slug}`}
                                        className="group p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all hover:shadow-md"
                                    >
                                        <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors mb-2 line-clamp-2">
                                            {related.title}
                                        </h3>
                                        <p className="text-sm text-slate-500 line-clamp-2">{related.description}</p>
                                        <span className="text-sm text-blue-600 dark:text-blue-400 font-medium mt-3 block">Read →</span>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Related Tools */}
                    {relatedTools.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                                Related Tools
                            </h2>
                            <div className="grid gap-4 sm:grid-cols-3">
                                {[primaryTool, ...relatedTools].filter(Boolean).map((tool) => tool && (
                                    <Link
                                        key={tool.id}
                                        href={`/tools/${tool.id}`}
                                        className="group p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all hover:shadow-md text-center"
                                    >
                                        <div className="text-3xl mb-2">{tool.icon}</div>
                                        <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                                            {tool.title}
                                        </h3>
                                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{tool.description}</p>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}
                </article>
            </div>
        </>
    );
}
