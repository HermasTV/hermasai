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
    webpack: (config: any, { isServer, webpack }: { isServer: boolean; webpack: typeof import("webpack") }) => {
        config.resolve.alias = {
            ...config.resolve.alias,
            '@huggingface/transformers': path.resolve(__dirname, 'node_modules/@huggingface/transformers'),
            "onnxruntime-node$": false,
            "@tensorflow/tfjs-node$": false,
            "@tensorflow/tfjs-node-gpu$": false,
            // sharp is a Node-only native module. @huggingface/transformers
            // statically imports it but only uses it server-side. Remap the
            // browser/worker import to a real empty stub so the module graph
            // resolves and the worker boots cleanly. The companion step that
            // makes this actually take effect is in the externals filter at
            // the bottom — withPayload adds 'sharp' to webpack externals for
            // ALL targets, and externals win over aliases, so we must remove
            // it from the client externals list there.
            ...(!isServer && {
                "sharp$": path.resolve(__dirname, "src/lib/empty-sharp.js"),
            }),
        }
        // @huggingface/transformers 3.x statically imports node:fs /
        // node:path / node:url for its server-side filesystem cache.
        // Webpack 5 treats `node:*` as a built-in URI scheme and short-
        // circuits before `resolve.alias` runs, so aliasing those is
        // inert. NormalModuleReplacementPlugin operates at scheme-resolve
        // time and lets us redirect the request to an empty stub on the
        // client/worker side.
        if (!isServer) {
            config.plugins.push(
                new webpack.NormalModuleReplacementPlugin(
                    /^node:(fs|path|url)$/,
                    (resource: { request: string }) => {
                        resource.request = path.resolve(
                            __dirname,
                            "src/lib/empty-node.js",
                        );
                    },
                ),
            );
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

// withPayload wraps our config and appends 'sharp' (plus a few others) to the
// webpack externals list for every compilation target. That includes the
// browser worker bundle, where @huggingface/transformers' static
// `import sharp from 'sharp'` then resolves to `module.exports = sharp` —
// referencing a global `sharp` identifier that does not exist in the worker.
// The worker therefore throws before installing its `message` listener and
// the Transcribe button silently does nothing.
//
// Webpack externals are resolved before `resolve.alias`, so aliasing sharp
// to a stub is not enough. We must post-process the *final* webpack config
// (i.e. after withPayload has run its own callback) and remove 'sharp' from
// the client/worker externals. Server externals are left untouched so
// Payload/Next image optimization keep using the native node binary.
const wrapped = withPayload(nextConfig);
const wrappedWebpack = wrapped.webpack;

const finalConfig: NextConfig = {
    ...wrapped,
    webpack: (config: any, opts: any) => {
        const out =
            typeof wrappedWebpack === "function"
                ? wrappedWebpack(config, opts)
                : config;
        if (!opts.isServer && Array.isArray(out.externals)) {
            out.externals = out.externals.filter(
                (ext: any) => !(typeof ext === "string" && ext === "sharp"),
            );
        }
        return out;
    },
};

export default finalConfig;
