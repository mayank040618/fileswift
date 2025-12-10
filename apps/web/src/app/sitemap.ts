import { MetadataRoute } from 'next';
import { TOOLS } from '@/config/tools';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://fileswift.com';

    const toolUrls = TOOLS.map((tool) => ({
        url: `${baseUrl}${tool.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        ...toolUrls,
    ];
}
