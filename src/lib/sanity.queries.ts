import { client } from './sanity.client';

// Query to get all blog posts
export async function getAllPosts() {
  const query = `*[_type == "post"] | order(publishedAt desc) {
    _id,
    title,
    slug,
    excerpt,
    publishedAt,
    mainImage,
    author->{
      name,
      image
    },
    categories[]->{
      title,
      slug
    }
  }`;

  return await client.fetch(query);
}

// Query to get a single post by slug
export async function getPostBySlug(slug: string) {
  const query = `*[_type == "post" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    excerpt,
    publishedAt,
    mainImage,
    body,
    author->{
      name,
      bio,
      image
    },
    categories[]->{
      title,
      slug
    }
  }`;

  return await client.fetch(query, { slug });
}

// Query to get featured posts
export async function getFeaturedPosts(limit = 3) {
  const query = `*[_type == "post" && featured == true] | order(publishedAt desc) [0...$limit] {
    _id,
    title,
    slug,
    excerpt,
    publishedAt,
    mainImage,
    author->{
      name,
      image
    }
  }`;

  return await client.fetch(query, { limit });
}
