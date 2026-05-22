import type { MetadataRoute } from 'next';
import { SITE, PERSON } from '@/lib/seo/site';

/**
 * Web app manifest — gives the site PWA-style metadata that browsers
 * (and some search engines) use for richer presentation. Icons fall back
 * to /favicon.ico until proper PNG icons are added under /icons/.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${PERSON.name} — ${PERSON.jobTitle}`,
    short_name: SITE.shortName,
    description: PERSON.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0f1f',
    theme_color: '#0a0f1f',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
