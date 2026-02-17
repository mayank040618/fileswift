/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config) => {
        // pdfjs-dist optionally imports 'canvas' (Node.js native module)
        // which isn't available in the browser. Mark it as external.
        config.resolve.alias.canvas = false;
        config.resolve.alias.encoding = false;
        return config;
    },
};
module.exports = nextConfig;
