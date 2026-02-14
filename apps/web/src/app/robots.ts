import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = 'https://www.fileswift.in'; // Fallback, usually configured via env

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/api/', '/admin/'],
            },
            {
                userAgent: ['GPTBot', 'Google-Extended', 'CCBot', 'Claude-Web'],
                allow: '/',
            },
            {
                userAgent: 'Mediapartners-Google',
                allow: '/',
            }
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
