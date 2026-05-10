import type { Metadata } from 'next';
import {
  BreadcrumbJsonLd,
  SoftwareApplicationJsonLd,
} from '@/lib/seo/jsonld';

export const metadata: Metadata = {
  title: 'AI Meeting Summary & Audio Transcription (OpenAI Whisper)',
  description:
    'Upload audio files and get accurate AI-powered transcriptions using OpenAI Whisper, GPT-4o Mini, and GPT-4o. Built by Ahmed Hermas — perfect for meeting notes and audio content analysis.',
  alternates: { canonical: '/projects/ai-meeting-summary' },
  openGraph: {
    title: 'AI Meeting Summary · OpenAI Whisper Transcription',
    description:
      'Upload audio and get high-accuracy transcriptions using OpenAI Whisper, GPT-4o Mini, or GPT-4o.',
    url: '/projects/ai-meeting-summary',
    type: 'website',
  },
  keywords: [
    'AI meeting transcription',
    'OpenAI Whisper transcribe',
    'GPT-4o transcription',
    'meeting summary AI',
    'audio transcription tool',
    'whisper-1 API',
    'Ahmed Hermas meeting summary',
  ],
};

export default function AIMeetingSummaryLayout({
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
          { name: 'AI Meeting Summary', url: '/projects/ai-meeting-summary' },
        ]}
      />
      <SoftwareApplicationJsonLd
        name="AI Meeting Summary"
        description="AI-powered meeting transcription using OpenAI Whisper, GPT-4o Mini, and GPT-4o. Upload audio, get accurate transcripts."
        url="/projects/ai-meeting-summary"
        applicationCategory="BusinessApplication"
        keywords={['Whisper', 'OpenAI', 'GPT-4o', 'Transcription', 'Meeting Notes']}
      />
      {children}
    </>
  );
}
