import { NextResponse } from 'next/server';

export const revalidate = 3600; // Revalidate every hour

export async function GET() {
    const baseUrl = 'https://fileswift-web.vercel.app';
    // Use current date
    const lastModified = new Date().toISOString();

    const paths = [
        { url: '/', changeFreq: 'daily', priority: 1.0 },
        { url: '/compress-pdf', changeFreq: 'weekly', priority: 0.8 },
        { url: '/image-compressor', changeFreq: 'weekly', priority: 0.8 },
        { url: '/image-to-pdf', changeFreq: 'weekly', priority: 0.8 },
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths
            .map(
                (path) => `  <url>
    <loc>${baseUrl}${path.url === '/' ? '' : path.url}</loc>
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
