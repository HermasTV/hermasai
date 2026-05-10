import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import "./globals.css";
import { ConfigInitializer } from "@/components/ConfigInitializer";
import { SITE, PERSON } from "@/lib/seo/site";
import { PersonJsonLd, WebSiteJsonLd } from "@/lib/seo/jsonld";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    // Default and template — every child page that sets `title: 'Foo'`
    // automatically renders as "Foo | Ahmed Hermas".
    default: "Ahmed Hermas — AI & Computer Vision Engineer",
    template: "%s | Ahmed Hermas",
  },
  description: PERSON.description,
  applicationName: SITE.shortName,
  authors: [{ name: PERSON.name, url: SITE.url }],
  creator: PERSON.name,
  publisher: PERSON.name,
  keywords: [
    "Ahmed Hermas",
    "Hermas AI",
    "AI Engineer",
    "Machine Learning Engineer",
    "Computer Vision Engineer",
    "ML Engineer Portfolio",
    "WebGPU",
    "Browser AI",
    "ONNX",
    "Whisper WebGPU",
    "Edge AI",
    "Face Recognition",
    "UAE AI Engineer",
    "Egypt AI Engineer",
  ],
  category: "technology",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: SITE.locale,
    url: SITE.url,
    siteName: SITE.name,
    title: "Ahmed Hermas — AI & Computer Vision Engineer",
    description: PERSON.description,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Ahmed Hermas — AI & Computer Vision Engineer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ahmed Hermas — AI & Computer Vision Engineer",
    description: PERSON.description,
    images: ["/opengraph-image"],
    ...(SITE.twitterHandle
      ? { creator: `@${SITE.twitterHandle}`, site: `@${SITE.twitterHandle}` }
      : {}),
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  formatDetection: {
    email: false,
    telephone: false,
    address: false,
  },
  // Manifest + icons are auto-detected from app/manifest.ts and app/favicon.ico
};

export const viewport: Viewport = {
  themeColor: "#0a0f1f",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} antialiased`}
      >
        {/* Site-wide structured data — Person is the primary entity, WebSite enables sitelinks search box. */}
        <PersonJsonLd />
        <WebSiteJsonLd />
        <ConfigInitializer />
        {children}
      </body>
    </html>
  );
}
