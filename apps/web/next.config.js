/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ["@fileswift/ui"],
    typescript: {
        ignoreBuildErrors: true,
    },
    experimental: {
        optimizePackageImports: ['lucide-react', 'date-fns', 'lodash', 'framer-motion', '@headlessui/react'],
    },
    webpack: (config, { isServer }) => {
        // Handle pdfjs-dist canvas dependency
        config.resolve.alias.canvas = false;

        // Exclude pdfjs-dist from server-side bundling
        if (isServer) {
            config.externals.push('pdfjs-dist');
        }

        return config;
    },
    // Redirects are now handled by vercel.json at edge level for better SEO
};

module.exports = nextConfig;
