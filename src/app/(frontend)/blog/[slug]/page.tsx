import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Navbar } from '@/components/navbar'
import Footer from '@/components/footer'
import { BlockRenderer } from '@/components/blog/BlockRenderer'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const payload = await getPayload({ config })

  const { docs: posts } = await payload.find({
    collection: 'posts',
    where: { slug: { equals: slug } },
    limit: 1,
  })

  const post = posts[0]

  if (!post) {
    return { title: 'Post Not Found' }
  }

  return {
    title: `${post.title} | HermasAI Blog`,
    description: post.excerpt || post.title,
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const payload = await getPayload({ config })

  const { docs: posts } = await payload.find({
    collection: 'posts',
    where: {
      slug: { equals: slug },
      status: { equals: 'published' },
    },
    limit: 1,
    depth: 2,
  })

  const post = posts[0]

  if (!post) {
    notFound()
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/30">
      <Navbar />

      <main className="flex-grow">
        <article className="max-w-4xl mx-auto px-4 py-24">
          {/* Header */}
          <header className="mb-12">
            {/* Category */}
            {post.category && typeof post.category === 'object' && (
              <span
                className="inline-block px-4 py-2 text-sm font-semibold rounded-full mb-4"
                style={{
                  backgroundColor: `${post.category.color || '#3B82F6'}20`,
                  color: post.category.color || '#3B82F6',
                }}
              >
                {post.category.title}
              </span>
            )}

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {post.title}
            </h1>

            {/* Meta */}
            <div className="flex items-center gap-4">
              {post.author && typeof post.author === 'object' && (
                <>
                  {post.author.avatar &&
                    typeof post.author.avatar === 'object' && (
                      <div className="relative w-12 h-12 rounded-full overflow-hidden">
                        <Image
                          src={post.author.avatar.url}
                          alt={post.author.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                  <div>
                    <p className="text-white font-medium">{post.author.name}</p>
                    <div className="flex items-center gap-3 text-sm text-gray-400">
                      <time>
                        {new Date(post.publishedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </time>
                      {post.readingTime && (
                        <>
                          <span>•</span>
                          <span>{post.readingTime} min read</span>
                        </>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </header>

          {/* Featured Image */}
          {post.featuredImage && typeof post.featuredImage === 'object' && (
            <div className="relative w-full h-[400px] rounded-xl overflow-hidden mb-12">
              <Image
                src={post.featuredImage.url}
                alt={post.featuredImage.alt || post.title}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Content Blocks */}
          <div className="prose prose-invert prose-lg max-w-none">
            <BlockRenderer blocks={post.content || []} />
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-700">
              <div className="flex flex-wrap gap-2">
                {post.tags.map((item: any, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 text-sm bg-gray-800 text-gray-300 rounded-full"
                  >
                    #{item.tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Author Bio */}
          {post.author && typeof post.author === 'object' && post.author.bio && (
            <div className="mt-16 p-6 bg-gray-800/50 rounded-xl border border-gray-700">
              <div className="flex items-start gap-4">
                {post.author.avatar && typeof post.author.avatar === 'object' && (
                  <div className="relative w-20 h-20 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src={post.author.avatar.url}
                      alt={post.author.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">
                    About {post.author.name}
                  </h3>
                  <p className="text-gray-300 mb-3">{post.author.bio}</p>
                  {post.author.socialLinks && (
                    <div className="flex gap-3">
                      {post.author.socialLinks.twitter && (
                        <a
                          href={`https://twitter.com/${post.author.socialLinks.twitter}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300"
                        >
                          Twitter
                        </a>
                      )}
                      {post.author.socialLinks.github && (
                        <a
                          href={`https://github.com/${post.author.socialLinks.github}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300"
                        >
                          GitHub
                        </a>
                      )}
                      {post.author.socialLinks.linkedin && (
                        <a
                          href={`https://linkedin.com/in/${post.author.socialLinks.linkedin}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300"
                        >
                          LinkedIn
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </article>
      </main>

      <Footer />
    </div>
  )
}
