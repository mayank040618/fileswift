import { NextResponse } from 'next/server';
import { TOOLS } from '@/config/tools';

export const revalidate = 3600; // Revalidate every hour

export async function GET() {
    const baseUrl = 'https://fileswift-web.vercel.app';
    // Use current date
    const lastModified = new Date().toISOString();

    const paths = [
        { url: '/', changeFreq: 'daily', priority: 1.0 },
        { url: '/about', changeFreq: 'monthly', priority: 0.5 },
        { url: '/contact', changeFreq: 'monthly', priority: 0.5 },
        { url: '/privacy-policy', changeFreq: 'monthly', priority: 0.5 },
        { url: '/terms', changeFreq: 'monthly', priority: 0.5 },
    ];

    // Add active tools
    const toolPaths = TOOLS
        .filter(t => !t.comingSoon)
        .map(tool => ({
            url: tool.slug,
            changeFreq: 'weekly',
            priority: 0.8
        }));

    const allPaths = [...paths, ...toolPaths];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPaths
            .map(
                (path) => `  <url>
    <loc>${baseUrl}${path.url}</loc>
    <lastmod>${lastModified}</lastmod>
    <changefreq>${path.changeFreq}</changefreq>
    <priority>${path.priority}</priority>
  </url>`
            )
            .join('\n')}
</urlset>`;

    return new NextResponse(xml, {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=59',
        },
    });
}
