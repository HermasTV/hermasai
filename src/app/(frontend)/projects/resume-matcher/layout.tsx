import type { Metadata } from 'next';
import {
  BreadcrumbJsonLd,
  SoftwareApplicationJsonLd,
} from '@/lib/seo/jsonld';

export const metadata: Metadata = {
  title: 'AI Resume-to-Job Match Analyzer (LinkedIn Job URL)',
  description:
    'Upload your resume and a LinkedIn job URL to get an AI-powered match score, gap analysis, keyword suggestions, and rewritten section drafts. Built by Ahmed Hermas with OpenAI GPT-4o.',
  alternates: { canonical: '/projects/resume-matcher' },
  openGraph: {
    title: 'AI Resume-to-Job Match Analyzer',
    description:
      'AI-powered resume vs job-description matching with gap analysis and rewrite suggestions.',
    url: '/projects/resume-matcher',
    type: 'website',
  },
  keywords: [
    'AI resume matcher',
    'resume job match analyzer',
    'LinkedIn job match AI',
    'resume gap analysis',
    'GPT-4o resume',
    'AI resume rewriter',
    'ATS keyword optimizer',
    'Ahmed Hermas resume matcher',
  ],
};

export default function ResumeMatcherLayout({
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
          { name: 'Resume Matcher', url: '/projects/resume-matcher' },
        ]}
      />
      <SoftwareApplicationJsonLd
        name="AI Resume-to-Job Match Analyzer"
        description="AI-powered resume vs LinkedIn job-description analyzer. Returns match score, gap analysis, keyword suggestions, and rewrite drafts."
        url="/projects/resume-matcher"
        applicationCategory="BusinessApplication"
        keywords={[
          'Resume Matching',
          'OpenAI',
          'GPT-4o',
          'Career AI',
          'ATS Optimization',
        ]}
      />
      {children}
    </>
  );
}
