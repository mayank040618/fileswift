/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    transpilePackages: ["@fileswift/ui"],
    async redirects() {
        return [
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
        ];
    },
};

module.exports = nextConfig;
