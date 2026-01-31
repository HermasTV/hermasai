import { getPayload } from 'payload'
import config from '@payload-config'
import Link from 'next/link'
import Image from 'next/image'
import { Navbar } from '@/components/navbar'
import Footer from '@/components/footer'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Blog | HermasAI',
  description: 'Tutorials, development insights, and AI/ML articles',
}

export default async function BlogPage() {
  console.log('[BLOG PAGE] Starting blog page render...')
  console.log('[BLOG PAGE] Environment:', process.env.NODE_ENV)
  console.log('[BLOG PAGE] MongoDB URI exists:', !!process.env.MONGODB_URI)
  console.log('[BLOG PAGE] MongoDB URI length:', process.env.MONGODB_URI?.length || 0)

  try {
    console.log('[BLOG PAGE] Getting Payload instance...')
    const startTime = Date.now()
    const payload = await getPayload({ config })
    const payloadInitTime = Date.now() - startTime
    console.log('[BLOG PAGE] Payload instance obtained successfully in', payloadInitTime + 'ms')

    console.log('[BLOG PAGE] Fetching published posts...')
    const queryStart = Date.now()
    const { docs: posts } = await payload.find({
      collection: 'posts',
      where: {
        status: {
          equals: 'published',
        },
      },
      sort: '-publishedAt',
      limit: 20,
      depth: 2,
    })
    const queryTime = Date.now() - queryStart
    console.log('[BLOG PAGE] Posts fetched successfully. Count:', posts.length, 'Time:', queryTime + 'ms')

    return renderBlogPage(posts, null)
  } catch (error) {
    console.error('[BLOG PAGE] ========== ERROR OCCURRED ==========')
    console.error('[BLOG PAGE] Error name:', error instanceof Error ? error.name : 'Unknown')
    console.error('[BLOG PAGE] Error message:', error instanceof Error ? error.message : String(error))
    console.error('[BLOG PAGE] Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    console.error('[BLOG PAGE] MongoDB URI exists:', !!process.env.MONGODB_URI)
    console.error('[BLOG PAGE] Payload Secret exists:', !!process.env.PAYLOAD_SECRET)
    console.error('[BLOG PAGE] ====================================')

    // Return error page instead of throwing
    return renderBlogPage([], error)
  }
}

function renderBlogPage(posts: any[], error: any = null) {
  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/30">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-8">
              <h1 className="text-3xl font-bold text-red-400 mb-4">
                Blog Page Error
              </h1>
              <div className="space-y-4 text-white">
                <div>
                  <h2 className="font-bold text-lg mb-2">Error Details:</h2>
                  <pre className="bg-black/50 p-4 rounded overflow-x-auto text-sm">
                    <code>{error instanceof Error ? error.message : String(error)}</code>
                  </pre>
                </div>
                {error instanceof Error && error.stack && (
                  <div>
                    <h2 className="font-bold text-lg mb-2">Stack Trace:</h2>
                    <pre className="bg-black/50 p-4 rounded overflow-x-auto text-xs">
                      <code>{error.stack}</code>
                    </pre>
                  </div>
                )}
                <div>
                  <h2 className="font-bold text-lg mb-2">Environment Check:</h2>
                  <pre className="bg-black/50 p-4 rounded overflow-x-auto text-sm">
                    <code>{JSON.stringify({
                      nodeEnv: process.env.NODE_ENV,
                      hasMongoUri: !!process.env.MONGODB_URI,
                      mongoUriLength: process.env.MONGODB_URI?.length || 0,
                      hasPayloadSecret: !!process.env.PAYLOAD_SECRET,
                      hasS3Bucket: !!process.env.S3_BUCKET,
                      timestamp: new Date().toISOString(),
                    }, null, 2)}</code>
                  </pre>
                </div>
                <p className="text-gray-300 mt-4">
                  Check the server logs in AWS Amplify → Monitoring → CloudWatch for more details.
                </p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/30">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Blog & Tutorials
            </h1>
            <p className="text-xl text-gray-300">
              Learn about AI, machine learning, and web development
            </p>
          </div>

          {/* Blog Posts Grid */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post: any) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden hover:border-blue-500/50 transition-all duration-300 hover:transform hover:scale-105"
              >
                {/* Featured Image */}
                {post.featuredImage && typeof post.featuredImage === 'object' && (
                  <div className="relative h-48 w-full overflow-hidden">
                    <Image
                      src={post.featuredImage.url}
                      alt={post.featuredImage.alt || post.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="p-6">
                  {/* Category */}
                  {post.category && typeof post.category === 'object' && (
                    <span
                      className="inline-block px-3 py-1 text-xs font-semibold rounded-full mb-3"
                      style={{
                        backgroundColor: `${post.category.color || '#3B82F6'}20`,
                        color: post.category.color || '#3B82F6',
                      }}
                    >
                      {post.category.title}
                    </span>
                  )}

                  {/* Title */}
                  <h2 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                    {post.title}
                  </h2>

                  {/* Excerpt */}
                  <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      {new Date(post.publishedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    {post.readingTime && (
                      <span>{post.readingTime} min read</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Empty State */}
          {posts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">
                No blog posts published yet. Check back soon!
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
