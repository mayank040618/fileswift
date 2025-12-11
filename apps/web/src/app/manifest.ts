import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'FileSwift - AI Powered File Tools',
        short_name: 'FileSwift',
        description: 'Compress PDF, Convert to Word, Remove Backgrounds and more.',
        start_url: '/',
        display: 'standalone',
        background_color: '#2563EB',
        theme_color: '#2563EB',
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
    }
}
