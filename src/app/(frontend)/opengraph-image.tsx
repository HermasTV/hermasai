import { ImageResponse } from 'next/og';
import { PERSON } from '@/lib/seo/site';

/**
 * Default Open Graph image rendered at the edge.
 *
 * Next.js auto-discovers this file and serves it at /opengraph-image (and
 * uses it as the default OG image for the root segment unless a child
 * route provides its own).
 *
 * Per Next.js docs: must export `alt`, `size`, `contentType` + a default
 * function returning an ImageResponse.
 */
export const runtime = 'edge';
export const alt = `${PERSON.name} — ${PERSON.jobTitle}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '80px',
          background:
            'linear-gradient(135deg, #0a0f1f 0%, #14102b 45%, #1a0b2e 100%)',
          color: '#ffffff',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Gradient accent orb */}
        <div
          style={{
            position: 'absolute',
            top: -200,
            right: -200,
            width: 600,
            height: 600,
            borderRadius: 9999,
            background:
              'radial-gradient(circle, rgba(96,165,250,0.5) 0%, rgba(167,139,250,0.25) 40%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -200,
            left: -100,
            width: 500,
            height: 500,
            borderRadius: 9999,
            background:
              'radial-gradient(circle, rgba(236,72,153,0.4) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />

        <div
          style={{
            display: 'flex',
            fontSize: 28,
            fontWeight: 600,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#9ca3af',
            marginBottom: 24,
          }}
        >
          hermas.uk
        </div>

        <div
          style={{
            display: 'flex',
            fontSize: 124,
            fontWeight: 800,
            lineHeight: 1.0,
            letterSpacing: '-0.04em',
            background:
              'linear-gradient(90deg, #60a5fa 0%, #a78bfa 50%, #ec4899 100%)',
            backgroundClip: 'text',
            color: 'transparent',
            marginBottom: 28,
          }}
        >
          Ahmed Hermas
        </div>

        <div
          style={{
            display: 'flex',
            fontSize: 44,
            fontWeight: 600,
            color: '#e5e7eb',
            marginBottom: 16,
          }}
        >
          AI &amp; Computer Vision Engineer
        </div>

        <div
          style={{
            display: 'flex',
            fontSize: 24,
            color: '#9ca3af',
            maxWidth: 900,
          }}
        >
          Browser-based AI demos · WebGPU · ONNX · Edge ML · Production CV systems
        </div>
      </div>
    ),
    { ...size }
  );
}
