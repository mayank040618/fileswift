import { MetadataRoute } from 'next';
import { TOOLS } from '@/config/tools';

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
    ] as const;

    const toolPaths = TOOLS
        .filter((tool) => !tool.comingSoon)
        .map((tool) => ({
            url: `${baseUrl}${tool.slug}`,
            lastModified,
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        }));

    return [...staticPaths, ...toolPaths];
}
