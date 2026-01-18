/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    transpilePackages: ["@fileswift/ui"],
    async redirects() {
        return [
            // Legacy tool URLs -> New /tools/ path
            {
                source: '/compress-pdf',
                destination: '/tools/compress-pdf',
                permanent: true,
            },
            {
                source: '/merge-pdf',
                destination: '/tools/merge-pdf',
                permanent: true,
            },
            {
                source: '/rotate-pdf',
                destination: '/tools/rotate-pdf',
                permanent: true,
            },
            {
                source: '/pdf-to-word',
                destination: '/tools/pdf-to-word',
                permanent: true,
            },
            {
                source: '/pdf-to-image',
                destination: '/tools/pdf-to-image',
                permanent: true,
            },
            {
                source: '/doc-to-pdf',
                destination: '/tools/doc-to-pdf',
                permanent: true,
            },
            {
                source: '/image-to-pdf',
                destination: '/tools/image-to-pdf',
                permanent: true,
            },
            {
                source: '/image-compressor',
                destination: '/tools/image-compressor',
                permanent: true,
            },
            {
                source: '/image-resizer',
                destination: '/tools/image-resizer',
                permanent: true,
            },
            {
                source: '/bulk-image-resizer',
                destination: '/tools/bulk-image-resizer',
                permanent: true,
            },
        ];
    },
};

module.exports = nextConfig;
