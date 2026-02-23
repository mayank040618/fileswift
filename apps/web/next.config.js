/** @type {import('next').NextConfig} */
const nextConfig = {
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

        // Force usage of the browser bundle to avoid Node.js specific code (createRequire)
        try {
            const path = require('path');
            const onnxPath = require.resolve('onnxruntime-web/package.json');
            const onnxDir = path.dirname(onnxPath);

            // Root alias (exact match)
            config.resolve.alias['onnxruntime-web$'] = path.join(onnxDir, 'dist/ort.min.js');

            // Subpath aliases
            config.resolve.alias['onnxruntime-web/webgpu'] = path.join(onnxDir, 'dist/ort.webgpu.min.js');
            config.resolve.alias['onnxruntime-web/wasm'] = path.join(onnxDir, 'dist/ort.wasm.min.js');
            config.resolve.alias['onnxruntime-web/all'] = path.join(onnxDir, 'dist/ort.all.min.js');

        } catch (e) {
            console.warn('Could not resolve onnxruntime-web path, build might fail:', e);
        }

        return config;
    },
};
const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);
