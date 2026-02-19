import { MetadataRoute } from 'next';
import { TOOLS } from '@/config/tools';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://fileswift.in';

export default function sitemap(): MetadataRoute.Sitemap {
    const staticPages = [
        '',
        '/about',
        '/contact',
        '/privacy-policy',
        '/terms',
        '/blog',
        '/use-cases'
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: route === '' ? 1.0 : 0.8,
    }));

    const toolPages = TOOLS
        .filter((tool) => !tool.comingSoon)
        .map((tool) => ({
            url: `${baseUrl}/tools/${tool.id}`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.9,
        }));

    return [...staticPages, ...toolPages];
}
