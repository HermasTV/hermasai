/** @type {import('next').NextConfig} */
import path from "path";
import { fileURLToPath } from 'url';
import type { NextConfig } from "next";
import { withPayload } from '@payloadcms/next/withPayload'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextConfig: NextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    webpack: (config: any) => {
        config.resolve.alias = {
            ...config.resolve.alias,
            '@huggingface/transformers': path.resolve(__dirname, 'node_modules/@huggingface/transformers'),
            "onnxruntime-node$": false,
            "@tensorflow/tfjs-node$": false,
            "@tensorflow/tfjs-node-gpu$": false,
        }
        return config;
    },
    serverExternalPackages: [
        "@huggingface/transformers",
        "@tensorflow/tfjs-core",
        "@tensorflow/tfjs-converter",
        "@tensorflow/tfjs-backend-webgpu",
        "@tensorflow/tfjs-backend-wasm",
        "@tensorflow-models/face-detection",
        "@tensorflow-models/face-landmarks-detection",
        "@tensorflow-models/hand-pose-detection",
    ],
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
    },
    async redirects() {
        return [
            // The Experience page used to live at /contact.
            { source: '/contact', destination: '/experience', permanent: true },
        ];
    },
};

export default withPayload(nextConfig);
