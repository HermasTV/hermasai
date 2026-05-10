import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/seo/site';

/**
 * Dynamic sitemap.
 *
 * Static routes are listed by hand. Blog posts are intentionally NOT pulled
 * from Payload here to keep the sitemap build-safe even if MongoDB is
 * unavailable (Payload calls in /blog already crash gracefully — we don't
 * want sitemap generation to fail the whole build for the same reason).
 *
 * Once blog content stabilises, swap the static blog entry for a dynamic
 * Payload query wrapped in try/catch.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const routes: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
    { path: '/', priority: 1.0, changeFrequency: 'weekly' },
    { path: '/projects', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/contact', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/blog', priority: 0.7, changeFrequency: 'weekly' },
    // Project demos
    { path: '/projects/speech-to-text', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/projects/realtime-face', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/projects/resume-matcher', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/projects/ai-meeting-summary', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/projects/unet-segmentation', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/projects/i-am-not-a-number', priority: 0.6, changeFrequency: 'monthly' },
  ];

  return routes.map((r) => ({
    url: `${SITE.url}${r.path}`,
    lastModified,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
