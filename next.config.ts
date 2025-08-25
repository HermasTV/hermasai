/** @type {import('next').NextConfig} */
import path from "path";
import { fileURLToPath } from 'url';
import type { NextConfig } from "next";

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
            "sharp$": false,
            "onnxruntime-node$": false,
        }
        return config;
    },
    serverExternalPackages: ["@huggingface/transformers"],
};

export default nextConfig;
