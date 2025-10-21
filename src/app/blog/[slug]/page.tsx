import { notFound } from 'next/navigation';
import { getPostBySlug, getAllPosts } from '@/lib/sanity.queries';
import { urlFor } from '@/lib/sanity.client';
import PortableText from '@/components/PortableText';

type Props = {
  params: { slug: string };
};

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post: any) => ({
    slug: post.slug.current,
  }));
}

export async function generateMetadata({ params }: Props) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: `${post.title} | HermasAI Blog`,
    description: post.excerpt || post.title,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            {post.categories?.map((category: any) => (
              <span
                key={category._id}
                className="text-sm px-3 py-1 rounded-full bg-blue-500/20 text-blue-400"
              >
                {category.title}
              </span>
            ))}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {post.title}
          </h1>
          <div className="flex items-center gap-4 text-gray-400">
            {post.author?.image && (
              <img
                src={urlFor(post.author.image).width(50).height(50).url()}
                alt={post.author.name}
                className="w-12 h-12 rounded-full"
              />
            )}
            <div>
              <p className="text-white font-medium">{post.author?.name}</p>
              <p className="text-sm text-gray-500">
                {new Date(post.publishedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </header>

        {/* Main Image */}
        {post.mainImage && (
          <div className="mb-12 rounded-lg overflow-hidden">
            <img
              src={urlFor(post.mainImage).width(1200).height(600).url()}
              alt={post.mainImage.alt || post.title}
              className="w-full"
            />
          </div>
        )}

        {/* Content */}
        <div className="prose prose-invert prose-lg max-w-none">
          <PortableText value={post.body} />
        </div>

        {/* Author Bio */}
        {post.author?.bio && (
          <div className="mt-16 p-6 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="flex items-start gap-4">
              {post.author.image && (
                <img
                  src={urlFor(post.author.image).width(80).height(80).url()}
                  alt={post.author.name}
                  className="w-20 h-20 rounded-full"
                />
              )}
              <div>
                <h3 className="text-xl font-bold text-white mb-2">
                  About {post.author.name}
                </h3>
                <div className="text-gray-300">
                  <PortableText value={post.author.bio} />
                </div>
              </div>
            </div>
          </div>
        )}
      </article>
    </div>
  );
}
