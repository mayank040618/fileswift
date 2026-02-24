/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverComponentsExternalPackages: ['onnxruntime-web', 'onnxruntime-node', '@imgly/background-removal'],
    },
    webpack: (config, { isServer, dev }) => {
        // pdfjs-dist optionally imports 'canvas' (Node.js native module)
        // which isn't available in the browser. Mark it as external.
        config.resolve.alias.canvas = false;
        config.resolve.alias.encoding = false;

        // Configuration for onnxruntime-web and @imgly/background-removal
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                path: false,
                crypto: false,
                module: false, // Add module fallback
            };
        }

        // Ignore onnxruntime-node because we are in the browser
        config.resolve.alias['onnxruntime-node$'] = false;

        // Fix ONNX Runtime Web "import.meta" ES Module errors by forcing Webpack to parse .mjs fully
        config.module.rules.push({
            test: /\.m?js$/,
            type: 'javascript/auto',
            resolve: {
                fullySpecified: false,
            },
        });

        return config;
    },
};
const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);
