import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";
import AnimatedBackground from "@/components/animated-background";
import Link from "next/link";
import { BreadcrumbJsonLd } from "@/lib/seo/jsonld";

// /projects is the hub page that internally links every demo. Targeting
// "Ahmed Hermas projects" + the project-type long-tails keeps the index
// competitive for people searching the brand alongside topic terms.
export const metadata: Metadata = {
  title: "AI Projects & Browser ML Demos",
  description:
    "Live AI projects by Ahmed Hermas — browser-based Whisper speech-to-text, real-time face detection, U-Net segmentation, and AI-powered resume analysis. All demos run in your browser with WebGPU.",
  alternates: { canonical: "/projects" },
  openGraph: {
    title: "AI Projects & Browser ML Demos · Ahmed Hermas",
    description:
      "Live, browser-based AI demos by Ahmed Hermas — WebGPU Whisper, real-time face detection, segmentation, and more.",
    url: "/projects",
    type: "website",
  },
  keywords: [
    "Ahmed Hermas projects",
    "browser AI demos",
    "WebGPU demos",
    "ONNX browser",
    "Whisper WebGPU",
    "real-time face detection JavaScript",
    "AI portfolio",
  ],
};

type ProjectTagColor = 'blue' | 'green' | 'orange' | 'purple' | 'pink' | 'gray';

type Project = {
  href: string;
  title: string;
  badge: string;
  badgeColor: ProjectTagColor;
  iconColor: string;
  description: string;
  tags: { label: string; color: ProjectTagColor }[];
  iconPath: React.ReactNode;
  iconStrokeWidth?: number;
};

const PROJECTS: Project[] = [
  {
    href: '/projects/realtime-face',
    title: 'Real-time Face Detection',
    badge: 'Live Demo',
    badgeColor: 'green',
    iconColor: 'bg-blue-600',
    description:
      'Browser-based face detection using ONNX.js and the UltraFace model. Runs completely client-side with real-time performance.',
    tags: [
      { label: 'ONNX.js', color: 'blue' },
      { label: 'Computer Vision', color: 'purple' },
      { label: 'WebRTC', color: 'green' },
    ],
    iconPath: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
      />
    ),
  },
  {
    href: '/projects/speech-to-text',
    title: 'Speech-to-Text',
    badge: 'Record & Process',
    badgeColor: 'green',
    iconColor: 'bg-green-600',
    description:
      "Browser-based speech recognition using OpenAI's Whisper Tiny model. Record audio and get accurate transcriptions completely client-side.",
    tags: [
      { label: 'Whisper', color: 'green' },
      { label: 'Speech Recognition', color: 'purple' },
      { label: 'Audio Processing', color: 'blue' },
    ],
    iconPath: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
      />
    ),
  },
  {
    href: '/projects/ai-meeting-summary',
    title: 'AI Meeting Summary',
    badge: 'Upload & Transcribe',
    badgeColor: 'orange',
    iconColor: 'bg-orange-600',
    description:
      "Upload audio files and get AI-powered transcriptions using OpenAI's Whisper model. Perfect for meeting notes and audio content analysis.",
    tags: [
      { label: 'OpenAI Whisper', color: 'orange' },
      { label: 'Transcription', color: 'purple' },
      { label: 'File Upload', color: 'blue' },
    ],
    iconPath: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    ),
  },
  {
    href: '/projects/resume-matcher',
    title: 'Resume-to-Job Matcher',
    badge: 'AI Analysis',
    badgeColor: 'purple',
    iconColor: 'bg-purple-600',
    description:
      'Upload your resume and LinkedIn job URL to get AI-powered matching analysis, gap identification, and improvement suggestions.',
    tags: [
      { label: 'Resume Analysis', color: 'purple' },
      { label: 'Job Matching', color: 'blue' },
      { label: 'Career Insights', color: 'green' },
    ],
    iconPath: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    ),
  },
  {
    href: '/projects/unet-segmentation',
    title: 'U-Net Segmentation',
    badge: 'Image Segmentation',
    badgeColor: 'pink',
    iconColor: 'bg-pink-600',
    description:
      'AI-powered semantic segmentation using deep learning. Upload images and get pixel-level object classification with real-time inference.',
    tags: [
      { label: 'U-Net', color: 'pink' },
      { label: 'Computer Vision', color: 'purple' },
      { label: 'WebGPU', color: 'blue' },
    ],
    iconPath: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      />
    ),
  },
  {
    href: '/projects/i-am-not-a-number',
    title: 'I Am Not a Number',
    badge: 'Memorial',
    badgeColor: 'gray',
    iconColor: 'bg-gray-900 border border-gray-700',
    description:
      'An interactive WebGL particle memorial for the 72,000+ Palestinians killed in Gaza. Each light is a name — hover to remember them.',
    tags: [
      { label: 'WebGL', color: 'gray' },
      { label: 'Vanilla JS', color: 'gray' },
      { label: '60,199 names', color: 'gray' },
    ],
    iconStrokeWidth: 1.5,
    iconPath: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 3v1m0 16v1M4.22 4.22l.707.707m12.02 12.02.707.707M1 12h2m18 0h2M4.22 19.78l.707-.707M18.95 5.05l.707-.707M12 7a5 5 0 100 10A5 5 0 0012 7z"
      />
    ),
  },
];

const TAG_STYLES: Record<ProjectTagColor, string> = {
  blue: 'bg-blue-100 text-blue-800',
  green: 'bg-green-100 text-green-800',
  orange: 'bg-orange-100 text-orange-800',
  purple: 'bg-purple-100 text-purple-800',
  pink: 'bg-pink-100 text-pink-800',
  gray: 'bg-gray-100 text-gray-800',
};

const BADGE_STYLES: Record<ProjectTagColor, string> = {
  blue: 'bg-blue-100 text-blue-800',
  green: 'bg-green-100 text-green-800',
  orange: 'bg-orange-100 text-orange-800',
  purple: 'bg-purple-100 text-purple-800',
  pink: 'bg-pink-100 text-pink-800',
  gray: 'bg-gray-100 text-gray-800',
};

export default function ProjectsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Projects', url: '/projects' },
        ]}
      />
      <AnimatedBackground />
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 pt-12 sm:pt-16 pb-16 max-w-6xl">
          <header className="mb-10 sm:mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">Projects</h1>
            <p className="mt-3 text-base text-gray-400 max-w-2xl">
              Live, browser-based AI demos and tools — built end-to-end and shipped here.
            </p>
          </header>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
            {PROJECTS.map((p) => (
              <Link
                key={p.href}
                href={p.href}
                className="block group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60 rounded-xl"
              >
                <div className="bg-gray-800/80 border border-gray-700/50 backdrop-blur-sm rounded-xl p-6 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-2xl group-hover:border-gray-500/60 h-full flex flex-col">
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-12 h-12 ${p.iconColor} rounded-lg flex items-center justify-center flex-shrink-0 shadow-md`}>
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {p.iconPath}
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg sm:text-xl font-semibold text-white leading-snug">
                        {p.title}
                      </h3>
                      <span className={`inline-block mt-2 ${BADGE_STYLES[p.badgeColor]} text-xs px-2 py-1 rounded-full font-medium`}>
                        {p.badge}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed mb-5 flex-1">
                    {p.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-auto">
                    {p.tags.map((tag) => (
                      <span key={tag.label} className={`${TAG_STYLES[tag.color]} text-xs px-2 py-1 rounded font-medium`}>
                        {tag.label}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}

            {/* Coming Soon placeholder card */}
            <div className="bg-gray-800/30 border border-dashed border-gray-700/60 backdrop-blur-sm rounded-xl p-6 h-full flex flex-col items-start justify-center min-h-[180px]">
              <div className="w-12 h-12 rounded-lg border border-dashed border-gray-600/60 flex items-center justify-center mb-4 text-gray-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-200">Coming Soon</h3>
              <p className="text-gray-500 text-sm">
                More AI projects and demos will be showcased here.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
