import type { Metadata } from 'next';
import {
  BreadcrumbJsonLd,
  SoftwareApplicationJsonLd,
} from '@/lib/seo/jsonld';

// The page itself is "use client" (WebGPU detection), so metadata + JSON-LD
// live in this server-component layout. This is the canonical Next.js
// App Router pattern when a page must be client-only but still needs SEO.
export const metadata: Metadata = {
  title: 'Whisper WebGPU Speech-to-Text Demo (In-Browser)',
  description:
    "Browser-based speech recognition using OpenAI's Whisper Tiny model accelerated with WebGPU. Records audio and transcribes it entirely client-side — no server, no API key, full privacy. Built by Ahmed Hermas.",
  alternates: { canonical: '/projects/speech-to-text' },
  openGraph: {
    title: 'Whisper WebGPU Speech-to-Text Demo',
    description:
      'Run OpenAI Whisper Tiny in your browser with WebGPU. Real-time, private, fully client-side speech transcription.',
    url: '/projects/speech-to-text',
    type: 'website',
  },
  keywords: [
    'Whisper WebGPU',
    'Whisper browser demo',
    'in-browser speech to text',
    'OpenAI Whisper JavaScript',
    'WebGPU Whisper Tiny',
    'transformers.js Whisper',
    'client-side speech recognition',
    'private speech-to-text',
    'Ahmed Hermas Whisper',
  ],
};

export default function SpeechToTextLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Projects', url: '/projects' },
          { name: 'Speech-to-Text', url: '/projects/speech-to-text' },
        ]}
      />
      <SoftwareApplicationJsonLd
        name="Whisper WebGPU Speech-to-Text"
        description="Browser-based speech recognition using OpenAI Whisper Tiny accelerated with WebGPU. Runs entirely client-side."
        url="/projects/speech-to-text"
        applicationCategory="MultimediaApplication"
        keywords={[
          'Whisper',
          'WebGPU',
          'Speech-to-Text',
          'Transformers.js',
          'ONNX Runtime',
        ]}
      />
      {children}
    </>
  );
}
