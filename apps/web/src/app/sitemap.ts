import { MetadataRoute } from 'next';
import { TOOLS } from '@/config/tools';
import { SEO_PAGES } from '@/config/seo-pages';
import { BLOG_POSTS } from '@/config/blog-posts';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://www.fileswift.in';
    const lastModified = new Date();

    const staticPaths = [
        {
            url: baseUrl,
            lastModified,
            changeFrequency: 'daily',
            priority: 1.0,
        },
        {
            url: `${baseUrl}/tools`,
            lastModified,
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/about`,
            lastModified,
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${baseUrl}/contact`,
            lastModified,
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${baseUrl}/privacy-policy`,
            lastModified,
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${baseUrl}/terms`,
            lastModified,
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${baseUrl}/use-cases`,
            lastModified,
            changeFrequency: 'weekly',
            priority: 0.7,
        },
    ] as const;

    const toolPaths = TOOLS
        .filter((tool) => !tool.comingSoon)
        .map((tool) => ({
            url: `${baseUrl}${tool.slug}`,
            lastModified,
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        }));

    const seoPaths = SEO_PAGES.map((page) => ({
        url: `${baseUrl}/tools/${page.id}`,
        lastModified,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    const blogPaths = BLOG_POSTS.map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: new Date(post.updatedDate),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    const blogIndex = {
        url: `${baseUrl}/blog`,
        lastModified,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    };

    return [...staticPaths, ...toolPaths, ...seoPaths, blogIndex, ...blogPaths];
}
