import Link from 'next/link';
import { getAllPosts } from '@/lib/sanity.queries';
import { urlFor } from '@/lib/sanity.client';

export const metadata = {
  title: 'Blog | HermasAI',
  description: 'Tutorials, development insights, and AI/ML articles',
};

export default async function BlogPage() {
  const posts = await getAllPosts();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Blog</h1>
          <p className="text-xl text-gray-300">
            Tutorials, development insights, and AI/ML articles
          </p>
        </div>

        {/* Posts Grid */}
        {posts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">
              No posts yet. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post: any) => (
              <article
                key={post._id}
                className="bg-gray-800/50 rounded-lg overflow-hidden hover:bg-gray-800/70 transition-all duration-300 border border-gray-700 hover:border-blue-500"
              >
                <Link href={`/blog/${post.slug.current}`}>
                  {post.mainImage && (
                    <div className="aspect-video relative overflow-hidden">
                      <img
                        src={urlFor(post.mainImage).width(600).height(400).url()}
                        alt={post.mainImage.alt || post.title}
                        className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      {post.categories?.map((category: any) => (
                        <span
                          key={category._id}
                          className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400"
                        >
                          {category.title}
                        </span>
                      ))}
                    </div>
                    <h2 className="text-xl font-semibold text-white mb-2 line-clamp-2">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="text-gray-400 mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      {post.author?.image && (
                        <img
                          src={urlFor(post.author.image).width(40).height(40).url()}
                          alt={post.author.name}
                          className="w-8 h-8 rounded-full"
                        />
                      )}
                      <div>
                        <p className="text-gray-400">{post.author?.name}</p>
                        <p className="text-gray-500">
                          {new Date(post.publishedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
