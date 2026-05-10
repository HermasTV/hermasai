import type { Metadata } from 'next';
import {
  BreadcrumbJsonLd,
  SoftwareApplicationJsonLd,
} from '@/lib/seo/jsonld';

export const metadata: Metadata = {
  title: 'Real-Time Face Detection in the Browser (UltraFace + ONNX)',
  description:
    'Live, browser-based face detection running the UltraFace model on ONNX Runtime Web. Real-time inference from your webcam — no server round-trip, no uploads. Built by Ahmed Hermas.',
  alternates: { canonical: '/projects/realtime-face' },
  openGraph: {
    title: 'Real-Time Face Detection in the Browser',
    description:
      'UltraFace + ONNX.js real-time face detection running entirely client-side from your webcam.',
    url: '/projects/realtime-face',
    type: 'website',
  },
  keywords: [
    'real-time face detection JavaScript',
    'UltraFace ONNX',
    'browser face detection',
    'ONNX Runtime web',
    'WebRTC face detection',
    'client-side computer vision',
    'face detection demo',
    'Ahmed Hermas face detection',
  ],
};

export default function RealtimeFaceLayout({
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
          { name: 'Real-time Face Detection', url: '/projects/realtime-face' },
        ]}
      />
      <SoftwareApplicationJsonLd
        name="Real-Time Face Detection (UltraFace · ONNX)"
        description="Browser-based real-time face detection using the UltraFace model on ONNX Runtime Web with WebRTC camera input."
        url="/projects/realtime-face"
        applicationCategory="MultimediaApplication"
        keywords={[
          'UltraFace',
          'ONNX',
          'Face Detection',
          'WebRTC',
          'Computer Vision',
          'Real-time',
        ]}
      />
      {children}
    </>
  );
}
