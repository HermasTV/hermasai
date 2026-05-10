/**
 * Centralised SEO constants for hermas.uk.
 *
 * One source of truth for the canonical site URL, brand strings and the
 * social profiles that feed `Person.sameAs` in JSON-LD. Update once here,
 * propagate everywhere (metadata, sitemap, structured data).
 */

export const SITE = {
  /** Canonical production URL (no trailing slash). */
  url: 'https://hermas.uk',
  /** Site / brand name used in title templates and Schema.org. */
  name: 'Ahmed Hermas',
  /** Short brand label used in footers, manifest short_name, etc. */
  shortName: 'Hermas AI',
  /** Locale used for OpenGraph + html lang. */
  locale: 'en_US',
  /** Primary image used for default OG / Twitter card. */
  defaultOgImage: '/opengraph-image',
  /** Twitter handle (no @). Leave empty if none — code falls back to creator-less card. */
  twitterHandle: '',
} as const;

export const PERSON = {
  name: 'Ahmed Hermas',
  alternateName: 'Hermas',
  jobTitle: 'AI / Computer Vision Engineer',
  description:
    'Senior AI and Computer Vision Engineer with 8+ years building production ML systems — from ISO-certified biometrics and city-scale traffic AI to browser-based WebGPU demos.',
  email: 'a7medhermas@gmail.com',
  /** Locations associated with Ahmed (Person.address / workLocation). */
  worksFor: 'Tahaluf UAE',
  /** External profiles for Person.sameAs — strengthens entity disambiguation. */
  sameAs: [
    'https://github.com/HermasTV',
    'https://www.linkedin.com/in/ahmedhermas/',
    'https://www.instagram.com/ahmed_hermas/',
  ],
  knowsAbout: [
    'Computer Vision',
    'Machine Learning',
    'Deep Learning',
    'Face Recognition',
    'Anti-Spoofing',
    'Edge AI',
    'WebGPU',
    'ONNX Runtime',
    'TensorFlow.js',
    'Whisper',
    'Multi-camera Tracking',
    '3D Reconstruction',
    'Gaussian Splatting',
  ],
} as const;

/** Helper — build an absolute URL for sitemaps / canonical / OG. */
export function absoluteUrl(path: string = '/'): string {
  if (path.startsWith('http')) return path;
  return `${SITE.url}${path.startsWith('/') ? path : `/${path}`}`;
}
