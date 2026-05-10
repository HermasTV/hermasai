import type { Metadata } from 'next';
import {
  BreadcrumbJsonLd,
  CreativeWorkJsonLd,
} from '@/lib/seo/jsonld';

// Memorial project — uses CreativeWork (not SoftwareApplication) since the
// primary purpose is artistic / commemorative rather than utility software.
export const metadata: Metadata = {
  title: 'I Am Not a Number — Interactive Gaza Memorial',
  description:
    'An interactive WebGL particle memorial visualising the names of 60,199 Palestinians killed in Gaza. Each light represents a life — hover to remember them. By Ahmed Hermas.',
  alternates: { canonical: '/projects/i-am-not-a-number' },
  openGraph: {
    title: 'I Am Not a Number — Interactive Gaza Memorial',
    description:
      'Interactive WebGL memorial for the 60,199 Palestinians killed in Gaza — each light is a life.',
    url: '/projects/i-am-not-a-number',
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['ar_PS'],
  },
  keywords: [
    'I Am Not a Number',
    'Gaza memorial',
    'Palestinian names visualization',
    'WebGL memorial',
    'interactive memorial',
    'Remember Their Names',
    'Ahmed Hermas memorial',
  ],
};

export default function IAmNotANumberLayout({
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
          { name: 'I Am Not a Number', url: '/projects/i-am-not-a-number' },
        ]}
      />
      <CreativeWorkJsonLd
        name="I Am Not a Number"
        description="An interactive WebGL particle memorial visualising the names of 60,199 Palestinians killed in Gaza."
        url="/projects/i-am-not-a-number"
        keywords={[
          'Gaza memorial',
          'WebGL',
          'Interactive visualization',
          'Memorial',
          'Palestinian names',
        ]}
      />
      {children}
    </>
  );
}
