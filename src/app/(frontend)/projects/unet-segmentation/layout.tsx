import type { Metadata } from 'next';
import {
  BreadcrumbJsonLd,
  SoftwareApplicationJsonLd,
} from '@/lib/seo/jsonld';

export const metadata: Metadata = {
  title: 'DeepLabV3+ Semantic Segmentation in the Browser (WebGPU)',
  description:
    'AI-powered semantic image segmentation using DeepLabV3+ with a MobileNet backbone, running on ONNX Runtime + WebGPU directly in the browser. Includes layer-feature-map visualization. Built by Ahmed Hermas.',
  alternates: { canonical: '/projects/unet-segmentation' },
  openGraph: {
    title: 'DeepLabV3+ Semantic Segmentation in the Browser',
    description:
      'Pixel-level segmentation with DeepLabV3+ MobileNet on WebGPU — runs entirely client-side.',
    url: '/projects/unet-segmentation',
    type: 'website',
  },
  keywords: [
    'DeepLabV3+ browser',
    'semantic segmentation WebGPU',
    'ONNX semantic segmentation',
    'MobileNet segmentation demo',
    'browser image segmentation',
    'Pascal VOC segmentation',
    'feature map visualization',
    'Ahmed Hermas segmentation',
  ],
};

export default function UNetSegmentationLayout({
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
          { name: 'U-Net Segmentation', url: '/projects/unet-segmentation' },
        ]}
      />
      <SoftwareApplicationJsonLd
        name="DeepLabV3+ Semantic Segmentation"
        description="In-browser semantic image segmentation with DeepLabV3+ on a MobileNet backbone, running via ONNX Runtime + WebGPU."
        url="/projects/unet-segmentation"
        applicationCategory="MultimediaApplication"
        keywords={[
          'DeepLabV3+',
          'MobileNet',
          'Semantic Segmentation',
          'WebGPU',
          'ONNX Runtime',
        ]}
      />
      {children}
    </>
  );
}
