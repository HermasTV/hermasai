import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2025-10-21', // Use current date for API version
  useCdn: true, // Enable CDN for faster reads
});

// Helper function for generating image URLs
const builder = imageUrlBuilder(client);

export function urlFor(source: any) {
  return builder.image(source);
}
