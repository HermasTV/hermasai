/**
 * JSON-LD helper components.
 *
 * Each helper returns a `<script type="application/ld+json">` element. We
 * intentionally serialize with `JSON.stringify` (no HTML entities) and inject
 * via `dangerouslySetInnerHTML` — this is the documented Next.js App Router
 * pattern for structured data.
 *
 * Validate any new schema with https://validator.schema.org before shipping.
 */
import React from 'react';
import { SITE, PERSON, absoluteUrl } from './site';

type Json = Record<string, unknown>;

function JsonLd({ data, id }: { data: Json | Json[]; id?: string }) {
  return (
    <script
      type="application/ld+json"
      id={id}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/** Person schema for Ahmed Hermas — primary entity that owns the site. */
export function PersonJsonLd() {
  const data: Json = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${SITE.url}/#person`,
    name: PERSON.name,
    alternateName: PERSON.alternateName,
    url: SITE.url,
    image: absoluteUrl('/opengraph-image'),
    jobTitle: PERSON.jobTitle,
    description: PERSON.description,
    email: `mailto:${PERSON.email}`,
    worksFor: { '@type': 'Organization', name: PERSON.worksFor },
    knowsAbout: PERSON.knowsAbout,
    sameAs: PERSON.sameAs,
  };
  return <JsonLd id="ld-person" data={data} />;
}

/** WebSite schema with SearchAction — eligible for sitelinks search box. */
export function WebSiteJsonLd() {
  const data: Json = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE.url}/#website`,
    url: SITE.url,
    name: SITE.name,
    description: PERSON.description,
    inLanguage: 'en',
    publisher: { '@id': `${SITE.url}/#person` },
    // No site-wide search yet — add a SearchAction once /search exists.
  };
  return <JsonLd id="ld-website" data={data} />;
}

/** Generic SoftwareApplication schema for project demos. */
export function SoftwareApplicationJsonLd(opts: {
  name: string;
  description: string;
  url: string; // canonical project page URL (path or full URL)
  applicationCategory?: string;
  operatingSystem?: string;
  image?: string;
  keywords?: string[];
}) {
  const data: Json = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: opts.name,
    description: opts.description,
    url: absoluteUrl(opts.url),
    applicationCategory: opts.applicationCategory ?? 'WebApplication',
    operatingSystem: opts.operatingSystem ?? 'Any (modern browser with WebGPU/WebGL)',
    image: opts.image ? absoluteUrl(opts.image) : absoluteUrl('/opengraph-image'),
    author: { '@id': `${SITE.url}/#person` },
    creator: { '@id': `${SITE.url}/#person` },
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    ...(opts.keywords ? { keywords: opts.keywords.join(', ') } : {}),
  };
  return <JsonLd data={data} />;
}

/** CreativeWork schema for non-software portfolio case studies. */
export function CreativeWorkJsonLd(opts: {
  name: string;
  description: string;
  url: string;
  image?: string;
  keywords?: string[];
}) {
  const data: Json = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: opts.name,
    description: opts.description,
    url: absoluteUrl(opts.url),
    image: opts.image ? absoluteUrl(opts.image) : absoluteUrl('/opengraph-image'),
    author: { '@id': `${SITE.url}/#person` },
    creator: { '@id': `${SITE.url}/#person` },
    ...(opts.keywords ? { keywords: opts.keywords.join(', ') } : {}),
  };
  return <JsonLd data={data} />;
}

/** Breadcrumb schema for nested pages. */
export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  const data: Json = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.url),
    })),
  };
  return <JsonLd data={data} />;
}

/** BlogPosting schema for individual articles. */
export function BlogPostingJsonLd(opts: {
  title: string;
  description: string;
  url: string;
  image?: string;
  datePublished?: string | Date;
  dateModified?: string | Date;
  authorName?: string;
  keywords?: string[];
}) {
  const data: Json = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: opts.title,
    description: opts.description,
    url: absoluteUrl(opts.url),
    image: opts.image ? absoluteUrl(opts.image) : absoluteUrl('/opengraph-image'),
    author: opts.authorName
      ? { '@type': 'Person', name: opts.authorName }
      : { '@id': `${SITE.url}/#person` },
    publisher: { '@id': `${SITE.url}/#person` },
    ...(opts.datePublished
      ? { datePublished: new Date(opts.datePublished).toISOString() }
      : {}),
    ...(opts.dateModified
      ? { dateModified: new Date(opts.dateModified).toISOString() }
      : {}),
    mainEntityOfPage: { '@type': 'WebPage', '@id': absoluteUrl(opts.url) },
    ...(opts.keywords ? { keywords: opts.keywords.join(', ') } : {}),
  };
  return <JsonLd data={data} />;
}
