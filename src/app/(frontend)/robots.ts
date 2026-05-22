import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/seo/site';

/**
 * robots.txt generated at build time.
 *
 * - Allow all crawlers everywhere except admin / Payload internals.
 * - Reference the sitemap so Google/Bing can discover URLs without manual
 *   submission (still recommended to submit via Search Console).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/',
          '/api/',
          '/settings',
          '/_next/',
        ],
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
