/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverComponentsExternalPackages: ['@imgly/background-removal', 'onnxruntime-web'],
    },
    webpack: (config, { isServer }) => {
        // pdfjs-dist optionally imports 'canvas' (Node.js native module)
        // which isn't available in the browser. Mark it as external.
        config.resolve.alias.canvas = false;
        config.resolve.alias.encoding = false;

        if (isServer) {
            config.resolve.alias['@imgly/background-removal'] = false;
        }

        return config;
    },
};
module.exports = nextConfig;
