import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'FileSwift - AI Powered File Tools',
        short_name: 'FileSwift',
        description: 'Compress PDF, Convert to Word, Remove Backgrounds and more.',
        start_url: '/',
        display: 'standalone',
        background_color: '#0f172a',
        theme_color: '#0f172a',
        icons: [
            {
                src: '/icons/icon-192x192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/icons/icon-512x512.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
        categories: ['productivity', 'utilities'],
        orientation: 'any',
        screenshots: [
            {
                src: '/og-image.png', // Fallback to OG image for install preview
                sizes: '1200x630',
                type: 'image/png',
                label: 'FileSwift Dashboard',
            }
        ],
    }
}
