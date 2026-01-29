// Load environment variables FIRST before any imports
import { config as dotenvConfig } from 'dotenv'
dotenvConfig({ path: '.env.local' })

// Now import after env vars are loaded
import { getPayload } from 'payload'
import config from '../src/payload/payload.config'

async function createFirstBlog() {
  console.log('🚀 Starting blog post creation...')

  const payload = await getPayload({ config })

  console.log('✅ Payload initialized')

  // Create first user if doesn't exist
  let user
  try {
    const users = await payload.find({
      collection: 'users',
      limit: 1,
    })

    if (users.docs.length === 0) {
      console.log('📝 Creating first admin user...')
      user = await payload.create({
        collection: 'users',
        data: {
          email: 'admin@hermasai.com',
          password: 'AdminPassword123!',
          name: 'Admin',
        },
      })
      console.log('✅ Admin user created:', user.email)
    } else {
      user = users.docs[0]
      console.log('✅ Using existing user:', user.email)
    }
  } catch (error) {
    console.error('❌ Error with user:', error)
    throw error
  }

  // Create author
  let author
  try {
    const authors = await payload.find({
      collection: 'authors',
      limit: 1,
    })

    if (authors.docs.length === 0) {
      console.log('📝 Creating author profile...')
      author = await payload.create({
        collection: 'authors',
        data: {
          name: 'Hermas AI',
          bio: 'Senior AI Engineer passionate about AI-assisted development, vibe coding, and building innovative web applications.',
          email: 'contact@hermasai.com',
          website: 'https://hermasai.com',
          socialLinks: [
            { platform: 'github', url: 'https://github.com/HermasTV' },
            { platform: 'twitter', url: 'https://twitter.com/hermasai' },
          ],
        },
      })
      console.log('✅ Author created:', author.name)
    } else {
      author = authors.docs[0]
      console.log('✅ Using existing author:', author.name)
    }
  } catch (error) {
    console.error('❌ Error with author:', error)
    throw error
  }

  // Create categories
  let aiCategory, webDevCategory
  try {
    console.log('📝 Creating categories...')

    const existingAI = await payload.find({
      collection: 'categories',
      where: { slug: { equals: 'ai-development' } },
    })

    if (existingAI.docs.length === 0) {
      aiCategory = await payload.create({
        collection: 'categories',
        data: {
          title: 'AI Development',
          slug: 'ai-development',
          description: 'AI-assisted development, machine learning, and intelligent automation',
          color: '#8B5CF6',
        },
      })
      console.log('✅ Category created: AI Development')
    } else {
      aiCategory = existingAI.docs[0]
    }

    const existingWeb = await payload.find({
      collection: 'categories',
      where: { slug: { equals: 'web-development' } },
    })

    if (existingWeb.docs.length === 0) {
      webDevCategory = await payload.create({
        collection: 'categories',
        data: {
          title: 'Web Development',
          slug: 'web-development',
          description: 'Modern web development, frameworks, and best practices',
          color: '#3B82F6',
        },
      })
      console.log('✅ Category created: Web Development')
    } else {
      webDevCategory = existingWeb.docs[0]
    }
  } catch (error) {
    console.error('❌ Error with categories:', error)
    throw error
  }

  // Create the blog post
  try {
    console.log('📝 Creating blog post...')

    const post = await payload.create({
      collection: 'posts',
      data: {
        title: 'Building a Full Personal Website with Vibe Coding and Claude Code',
        slug: 'building-personal-website-vibe-coding-claude-code',
        author: author.id,
        categories: [aiCategory.id, webDevCategory.id],
        excerpt: 'Discover how vibe coding with Claude Code can transform the way you build websites. Learn how AI-assisted development enables you to create a complete personal portfolio in hours, not weeks.',
        featured: true,
        allowComments: true,
        status: 'published',
        publishedAt: new Date().toISOString(),
        tags: ['AI', 'Claude Code', 'Vibe Coding', 'Web Development', 'Tutorial', 'Next.js'],
        readingTime: 12,
        content: [
          {
            blockType: 'richText',
            richText: {
              root: {
                type: 'root',
                children: [
                  {
                    type: 'paragraph',
                    children: [
                      {
                        type: 'text',
                        text: 'The landscape of web development has fundamentally changed. Gone are the days of spending weeks setting up boilerplate code, wrestling with configuration files, and debugging obscure errors. Welcome to the era of ',
                      },
                      {
                        type: 'text',
                        text: 'vibe coding',
                        bold: true,
                      },
                      {
                        type: 'text',
                        text: ' – where you describe what you want to build, and AI brings it to life.',
                      },
                    ],
                  },
                ],
              },
            },
          },
          {
            blockType: 'heading',
            level: 'h2',
            text: 'What is Vibe Coding?',
          },
          {
            blockType: 'richText',
            richText: {
              root: {
                type: 'root',
                children: [
                  {
                    type: 'paragraph',
                    children: [
                      {
                        type: 'text',
                        text: 'Vibe coding is a development philosophy where you work at the ',
                      },
                      {
                        type: 'text',
                        text: 'level of intent',
                        italic: true,
                      },
                      {
                        type: 'text',
                        text: ' rather than implementation details. Instead of typing out every line of code, you communicate your vision to an AI assistant like Claude Code, which then generates production-ready code that matches your mental model.',
                      },
                    ],
                  },
                ],
              },
            },
          },
          {
            blockType: 'callout',
            type: 'info',
            content: 'Think of vibe coding as having a senior developer pair programmer who instantly understands your vision and can implement it while you focus on architecture and user experience.',
          },
          {
            blockType: 'heading',
            level: 'h2',
            text: 'Why Claude Code Changes Everything',
          },
          {
            blockType: 'richText',
            richText: {
              root: {
                type: 'root',
                children: [
                  {
                    type: 'paragraph',
                    children: [
                      {
                        type: 'text',
                        text: 'Claude Code isn\'t just another code completion tool. It\'s an AI pair programmer that:',
                      },
                    ],
                  },
                  {
                    type: 'list',
                    listType: 'bullet',
                    children: [
                      {
                        type: 'listitem',
                        children: [
                          {
                            type: 'text',
                            text: 'Understands entire codebases and maintains context across files',
                          },
                        ],
                      },
                      {
                        type: 'listitem',
                        children: [
                          {
                            type: 'text',
                            text: 'Writes complete features from natural language descriptions',
                          },
                        ],
                      },
                      {
                        type: 'listitem',
                        children: [
                          {
                            type: 'text',
                            text: 'Refactors code while preserving functionality',
                          },
                        ],
                      },
                      {
                        type: 'listitem',
                        children: [
                          {
                            type: 'text',
                            text: 'Debugs issues by analyzing error messages and logs',
                          },
                        ],
                      },
                      {
                        type: 'listitem',
                        children: [
                          {
                            type: 'text',
                            text: 'Follows best practices and modern frameworks automatically',
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            },
          },
          {
            blockType: 'heading',
            level: 'h2',
            text: 'Building Your Personal Website: A Real Example',
          },
          {
            blockType: 'richText',
            richText: {
              root: {
                type: 'root',
                children: [
                  {
                    type: 'paragraph',
                    children: [
                      {
                        type: 'text',
                        text: 'Let me share how I built a complete personal portfolio website using Claude Code. The entire process took just a few hours, but the result is a production-ready site with:',
                      },
                    ],
                  },
                ],
              },
            },
          },
          {
            blockType: 'codeBlock',
            language: 'typescript',
            code: `// Modern Tech Stack Generated by Claude Code
- Next.js 15 (App Router)
- TypeScript
- TailwindCSS 4
- Payload CMS v3
- MongoDB Atlas
- AWS Amplify (Deployment)
- Real-time AI Demos (Speech-to-Text, Face Detection)
- Blog with Rich Content (Code Blocks, Videos, Images)`,
            filename: 'tech-stack.ts',
            showLineNumbers: false,
          },
          {
            blockType: 'heading',
            level: 'h3',
            text: 'Step 1: Project Initialization',
          },
          {
            blockType: 'richText',
            richText: {
              root: {
                type: 'root',
                children: [
                  {
                    type: 'paragraph',
                    children: [
                      {
                        type: 'text',
                        text: 'I started with a simple prompt:',
                      },
                    ],
                  },
                ],
              },
            },
          },
          {
            blockType: 'callout',
            type: 'success',
            content: '"Set up a Next.js 15 project with TypeScript, TailwindCSS, and a modern portfolio layout with a navigation bar, hero section, projects showcase, and contact form."',
          },
          {
            blockType: 'richText',
            richText: {
              root: {
                type: 'root',
                children: [
                  {
                    type: 'paragraph',
                    children: [
                      {
                        type: 'text',
                        text: 'Within minutes, Claude Code had:',
                      },
                    ],
                  },
                  {
                    type: 'list',
                    listType: 'number',
                    children: [
                      {
                        type: 'listitem',
                        children: [{ type: 'text', text: 'Created the entire project structure' }],
                      },
                      {
                        type: 'listitem',
                        children: [{ type: 'text', text: 'Configured TypeScript and TailwindCSS' }],
                      },
                      {
                        type: 'listitem',
                        children: [{ type: 'text', text: 'Built responsive components' }],
                      },
                      {
                        type: 'listitem',
                        children: [{ type: 'text', text: 'Set up routing and layouts' }],
                      },
                    ],
                  },
                ],
              },
            },
          },
          {
            blockType: 'heading',
            level: 'h3',
            text: 'Step 2: Adding AI-Powered Features',
          },
          {
            blockType: 'richText',
            richText: {
              root: {
                type: 'root',
                children: [
                  {
                    type: 'paragraph',
                    children: [
                      {
                        type: 'text',
                        text: 'To showcase my AI skills, I wanted live demos. Here\'s where vibe coding really shines:',
                      },
                    ],
                  },
                ],
              },
            },
          },
          {
            blockType: 'codeBlock',
            language: 'javascript',
            code: `// Prompt: "Add a real-time speech-to-text demo using Whisper WebGPU"
//
// Claude Code automatically:
// - Installed @huggingface/transformers
// - Set up Web Workers for performance
// - Created audio input handling
// - Built a beautiful UI with real-time transcription
// - Handled WebGPU availability checks
// - Added error handling and loading states

import { pipeline } from '@huggingface/transformers'

const transcriber = await pipeline(
  'automatic-speech-recognition',
  'Xenova/whisper-tiny.en',
  { device: 'webgpu' }
)`,
            filename: 'speech-to-text.js',
            showLineNumbers: true,
          },
          {
            blockType: 'heading',
            level: 'h3',
            text: 'Step 3: Integrating a CMS',
          },
          {
            blockType: 'richText',
            richText: {
              root: {
                type: 'root',
                children: [
                  {
                    type: 'paragraph',
                    children: [
                      {
                        type: 'text',
                        text: 'Every developer needs a blog. Instead of manually creating blog posts, I asked Claude Code to integrate Payload CMS:',
                      },
                    ],
                  },
                ],
              },
            },
          },
          {
            blockType: 'callout',
            type: 'warning',
            content: 'Pro Tip: When integrating third-party tools, always ask Claude Code to follow the official documentation. It will fetch the latest guides and implement best practices automatically.',
          },
          {
            blockType: 'richText',
            richText: {
              root: {
                type: 'root',
                children: [
                  {
                    type: 'paragraph',
                    children: [
                      {
                        type: 'text',
                        text: 'The result? A full-featured blog with:',
                      },
                    ],
                  },
                  {
                    type: 'list',
                    listType: 'bullet',
                    children: [
                      {
                        type: 'listitem',
                        children: [{ type: 'text', text: 'Rich text editor with code syntax highlighting' }],
                      },
                      {
                        type: 'listitem',
                        children: [{ type: 'text', text: 'Image uploads and optimization' }],
                      },
                      {
                        type: 'listitem',
                        children: [{ type: 'text', text: 'Video embeds (YouTube, Vimeo)' }],
                      },
                      {
                        type: 'listitem',
                        children: [{ type: 'text', text: 'Categories and tags' }],
                      },
                      {
                        type: 'listitem',
                        children: [{ type: 'text', text: 'Author profiles with social links' }],
                      },
                      {
                        type: 'listitem',
                        children: [{ type: 'text', text: 'SEO metadata' }],
                      },
                    ],
                  },
                ],
              },
            },
          },
          {
            blockType: 'heading',
            level: 'h2',
            text: 'The Vibe Coding Workflow',
          },
          {
            blockType: 'richText',
            richText: {
              root: {
                type: 'root',
                children: [
                  {
                    type: 'paragraph',
                    children: [
                      {
                        type: 'text',
                        text: 'Here\'s the workflow that made this possible:',
                      },
                    ],
                  },
                ],
              },
            },
          },
          {
            blockType: 'codeBlock',
            language: 'bash',
            code: `# 1. Describe Your Vision
"I want to add a blog section with Payload CMS"

# 2. Claude Code Plans
- Reviews official Payload docs
- Analyzes your codebase structure
- Proposes implementation approach

# 3. Review & Approve
- Check the plan
- Ask questions
- Request modifications

# 4. Claude Code Implements
- Installs dependencies
- Creates collections and schemas
- Sets up admin panel
- Builds frontend pages
- Handles routing

# 5. Iterate & Refine
"Can you add video embed support?"
"Make the code blocks use Prism for syntax highlighting"
"Add reading time estimation"`,
            filename: 'vibe-workflow.sh',
            showLineNumbers: false,
          },
          {
            blockType: 'heading',
            level: 'h2',
            text: 'Key Principles for Success',
          },
          {
            blockType: 'richText',
            richText: {
              root: {
                type: 'root',
                children: [
                  {
                    type: 'heading',
                    level: 3,
                    children: [{ type: 'text', text: '1. Be Specific About Intent, Not Implementation', bold: true }],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        type: 'text',
                        text: 'Instead of: "Create a useState hook for the form"',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        type: 'text',
                        text: 'Say: "Add form validation with error messages that appear in real-time"',
                      },
                    ],
                  },
                  {
                    type: 'heading',
                    level: 3,
                    children: [{ type: 'text', text: '2. Provide Context', bold: true }],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        type: 'text',
                        text: 'Claude Code works best when it understands your project. Use a CLAUDE.md file to document your architecture, conventions, and preferences.',
                      },
                    ],
                  },
                  {
                    type: 'heading',
                    level: 3,
                    children: [{ type: 'text', text: '3. Iterate in Small Steps', bold: true }],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        type: 'text',
                        text: 'Build features incrementally. Start with core functionality, then add polish.',
                      },
                    ],
                  },
                  {
                    type: 'heading',
                    level: 3,
                    children: [{ type: 'text', text: '4. Trust but Verify', bold: true }],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        type: 'text',
                        text: 'Claude Code is highly accurate, but always review the code. Use it as a learning opportunity to understand modern patterns.',
                      },
                    ],
                  },
                ],
              },
            },
          },
          {
            blockType: 'heading',
            level: 'h2',
            text: 'Real Results: Time Saved',
          },
          {
            blockType: 'richText',
            richText: {
              root: {
                type: 'root',
                children: [
                  {
                    type: 'paragraph',
                    children: [
                      {
                        type: 'text',
                        text: 'Let\'s be honest about the time savings:',
                      },
                    ],
                  },
                ],
              },
            },
          },
          {
            blockType: 'codeBlock',
            language: 'text',
            code: `Traditional Development:
- Project setup & configuration: 2-3 hours
- Building responsive layouts: 8-10 hours
- Implementing AI features: 15-20 hours
- CMS integration: 10-15 hours
- Debugging & polish: 10-15 hours
Total: 45-63 hours (1-2 weeks)

With Claude Code:
- Project setup: 5 minutes
- Building layouts: 1 hour
- AI features: 3 hours
- CMS integration: 2 hours
- Debugging & refinement: 2 hours
Total: 8 hours (1 day)`,
            filename: 'time-comparison.txt',
            showLineNumbers: false,
          },
          {
            blockType: 'callout',
            type: 'success',
            content: 'That\'s an 85% reduction in development time, allowing you to ship faster and iterate more.',
          },
          {
            blockType: 'heading',
            level: 'h2',
            text: 'Beyond Personal Websites',
          },
          {
            blockType: 'richText',
            richText: {
              root: {
                type: 'root',
                children: [
                  {
                    type: 'paragraph',
                    children: [
                      {
                        type: 'text',
                        text: 'While this article focused on building a personal website, the vibe coding approach scales to any project:',
                      },
                    ],
                  },
                  {
                    type: 'list',
                    listType: 'bullet',
                    children: [
                      {
                        type: 'listitem',
                        children: [{ type: 'text', text: 'SaaS applications' }],
                      },
                      {
                        type: 'listitem',
                        children: [{ type: 'text', text: 'E-commerce platforms' }],
                      },
                      {
                        type: 'listitem',
                        children: [{ type: 'text', text: 'Internal tools and dashboards' }],
                      },
                      {
                        type: 'listitem',
                        children: [{ type: 'text', text: 'Mobile app backends' }],
                      },
                      {
                        type: 'listitem',
                        children: [{ type: 'text', text: 'Data processing pipelines' }],
                      },
                    ],
                  },
                ],
              },
            },
          },
          {
            blockType: 'heading',
            level: 'h2',
            text: 'The Future is Here',
          },
          {
            blockType: 'richText',
            richText: {
              root: {
                type: 'root',
                children: [
                  {
                    type: 'paragraph',
                    children: [
                      {
                        type: 'text',
                        text: 'Vibe coding with Claude Code represents a fundamental shift in how we build software. It\'s not about replacing developers – it\'s about ',
                      },
                      {
                        type: 'text',
                        text: 'amplifying human creativity',
                        bold: true,
                      },
                      {
                        type: 'text',
                        text: '. You focus on vision, architecture, and user experience, while AI handles the implementation details.',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        type: 'text',
                        text: 'The barrier to building amazing software has never been lower. Whether you\'re a seasoned developer or just starting out, vibe coding lets you turn ideas into reality at unprecedented speed.',
                      },
                    ],
                  },
                ],
              },
            },
          },
          {
            blockType: 'callout',
            type: 'info',
            content: 'Ready to start vibe coding? Head to claude.ai/code and experience the future of development. Your next great project is just a conversation away.',
          },
          {
            blockType: 'heading',
            level: 'h2',
            text: 'Resources',
          },
          {
            blockType: 'richText',
            richText: {
              root: {
                type: 'root',
                children: [
                  {
                    type: 'list',
                    listType: 'bullet',
                    children: [
                      {
                        type: 'listitem',
                        children: [
                          {
                            type: 'link',
                            url: 'https://claude.ai/code',
                            children: [{ type: 'text', text: 'Claude Code' }],
                          },
                        ],
                      },
                      {
                        type: 'listitem',
                        children: [
                          {
                            type: 'link',
                            url: 'https://nextjs.org',
                            children: [{ type: 'text', text: 'Next.js Documentation' }],
                          },
                        ],
                      },
                      {
                        type: 'listitem',
                        children: [
                          {
                            type: 'link',
                            url: 'https://payloadcms.com',
                            children: [{ type: 'text', text: 'Payload CMS' }],
                          },
                        ],
                      },
                      {
                        type: 'listitem',
                        children: [
                          {
                            type: 'link',
                            url: 'https://huggingface.co/docs/transformers.js',
                            children: [{ type: 'text', text: 'Transformers.js' }],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            },
          },
        ],
      },
    })

    console.log('🎉 Blog post created successfully!')
    console.log('📝 Title:', post.title)
    console.log('🔗 Slug:', post.slug)
    console.log('✅ Status:', post.status)
    console.log('')
    console.log('🌐 View at: http://localhost:3000/blog/' + post.slug)

    process.exit(0)
  } catch (error) {
    console.error('❌ Error creating blog post:', error)
    process.exit(1)
  }
}

createFirstBlog().catch(console.error)
