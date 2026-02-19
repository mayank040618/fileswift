/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config, { isServer }) => {
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
            const onnxPath = require.resolve('onnxruntime-web');
            // onnxPath is likely .../dist/ort.node.min.js

            // Root alias (exact match)
            config.resolve.alias['onnxruntime-web$'] = onnxPath.replace('ort.node.min.js', 'ort.min.js');

            // Subpath aliases
            config.resolve.alias['onnxruntime-web/webgpu'] = onnxPath.replace('ort.node.min.js', 'ort.webgpu.min.js');
            config.resolve.alias['onnxruntime-web/wasm'] = onnxPath.replace('ort.node.min.js', 'ort.wasm.min.js');
            config.resolve.alias['onnxruntime-web/all'] = onnxPath.replace('ort.node.min.js', 'ort.all.min.js');

        } catch (e) {
            console.warn('Could not resolve onnxruntime-web path, build might fail:', e);
        }

        return config;
    },
};
module.exports = nextConfig;
