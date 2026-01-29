#!/bin/bash

TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZmJmMjc1ZDhhMWI1YmU5YWJlOGE1MSIsImNvbGxlY3Rpb24iOiJ1c2VycyIsImVtYWlsIjoibW9udGFkYTdAZ21haWwuY29tIiwic2lkIjoiMzc5M2Q0OWMtNTg1Yy00NzE2LTg2MjAtMDAwMDg1YTlkZGU0IiwiaWF0IjoxNzYxMzUzMTMzLCJleHAiOjE3NjEzNjAzMzN9.4mSUzd5CY6FHAaFOIJQfZ4S4p7jEPskWdEYYJPSX5tE"
API_URL="http://localhost:3000/api"

echo "🚀 Creating your first blog post..."

# Step 1: Create Author
echo "📝 Creating author Hermas..."
AUTHOR_RESPONSE=$(curl -s -X POST "$API_URL/authors" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Hermas",
    "bio": "Senior AI Engineer passionate about AI-assisted development, vibe coding, and building innovative web applications with cutting-edge technologies.",
    "email": "montada7@gmail.com",
    "website": "https://hermasai.com",
    "socialLinks": [
      {
        "platform": "github",
        "url": "https://github.com/HermasTV"
      },
      {
        "platform": "twitter",
        "url": "https://twitter.com/hermasai"
      }
    ]
  }')

AUTHOR_ID=$(echo $AUTHOR_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
echo "✅ Author created: $AUTHOR_ID"

# Step 2: Create Categories
echo "📂 Creating categories..."
CAT1_RESPONSE=$(curl -s -X POST "$API_URL/categories" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "AI Development",
    "slug": "ai-development",
    "description": "AI-assisted development, machine learning, and intelligent automation",
    "color": "#8B5CF6"
  }')
CAT1_ID=$(echo $CAT1_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

CAT2_RESPONSE=$(curl -s -X POST "$API_URL/categories" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Web Development",
    "slug": "web-development",
    "description": "Modern web development, frameworks, and best practices",
    "color": "#3B82F6"
  }')
CAT2_ID=$(echo $CAT2_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
echo "✅ Categories created"

# Step 3: Create Blog Post with Rich Content
echo "✍️  Creating blog post with rich content..."
POST_RESPONSE=$(curl -s -X POST "$API_URL/posts" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Building a Full Personal Website with Vibe Coding and Claude Code",
    "slug": "building-personal-website-vibe-coding-claude-code",
    "author": "'"$AUTHOR_ID"'",
    "categories": ["'"$CAT1_ID"'", "'"$CAT2_ID"'"],
    "excerpt": "Discover how vibe coding with Claude Code can transform the way you build websites. Learn how AI-assisted development enables you to create a complete personal portfolio in hours, not weeks.",
    "featured": true,
    "allowComments": true,
    "status": "published",
    "publishedAt": "'"$(date -Iseconds)"'",
    "tags": ["AI", "Claude Code", "Vibe Coding", "Web Development", "Tutorial", "Next.js", "Productivity"],
    "readingTime": 12,
    "content": [
      {
        "blockType": "richText",
        "text": "The landscape of web development has fundamentally changed. Gone are the days of spending weeks setting up boilerplate code, wrestling with configuration files, and debugging obscure errors. Welcome to the era of **vibe coding** – where you describe what you want to build, and AI brings it to life."
      },
      {
        "blockType": "heading",
        "level": "h2",
        "text": "What is Vibe Coding?"
      },
      {
        "blockType": "richText",
        "text": "Vibe coding is a development philosophy where you work at the *level of intent* rather than implementation details. Instead of typing out every line of code, you communicate your vision to an AI assistant like Claude Code, which then generates production-ready code that matches your mental model."
      },
      {
        "blockType": "callout",
        "type": "info",
        "content": "💡 Think of vibe coding as having a senior developer pair programmer who instantly understands your vision and can implement it while you focus on architecture and user experience."
      },
      {
        "blockType": "image",
        "url": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=80",
        "alt": "Developer coding with AI assistance",
        "caption": "Modern development powered by AI"
      },
      {
        "blockType": "heading",
        "level": "h2",
        "text": "Why Claude Code Changes Everything"
      },
      {
        "blockType": "richText",
        "text": "Claude Code isn'"'"'t just another code completion tool. It'"'"'s an AI pair programmer that:\n\n- 🧠 Understands entire codebases and maintains context across files\n- ✨ Writes complete features from natural language descriptions\n- 🔄 Refactors code while preserving functionality\n- 🐛 Debugs issues by analyzing error messages and logs\n- 📚 Follows best practices and modern frameworks automatically"
      },
      {
        "blockType": "heading",
        "level": "h2",
        "text": "Building Your Personal Website: A Real Example"
      },
      {
        "blockType": "richText",
        "text": "Let me share how I built a complete personal portfolio website using Claude Code. The entire process took just a few hours, but the result is a production-ready site with:"
      },
      {
        "blockType": "codeBlock",
        "language": "typescript",
        "code": "// Modern Tech Stack Generated by Claude Code\nconst techStack = {\n  frontend: [\n    '"'"'Next.js 15 (App Router)'"'"',\n    '"'"'TypeScript'"'"',\n    '"'"'TailwindCSS 4'"'"',\n    '"'"'React 19'"'"'\n  ],\n  backend: [\n    '"'"'Payload CMS v3'"'"',\n    '"'"'MongoDB Atlas'"'"',\n    '"'"'REST & GraphQL APIs'"'"'\n  ],\n  deployment: [\n    '"'"'AWS Amplify'"'"',\n    '"'"'Vercel Edge Functions'"'"'\n  ],\n  features: [\n    '"'"'Real-time AI Demos'"'"',\n    '"'"'Speech-to-Text with Whisper'"'"',\n    '"'"'Face Detection with UltraFace'"'"',\n    '"'"'Rich Content Blog'"'"'\n  ]\n};",
        "filename": "tech-stack.ts",
        "showLineNumbers": true
      },
      {
        "blockType": "heading",
        "level": "h3",
        "text": "Step 1: Project Initialization"
      },
      {
        "blockType": "callout",
        "type": "success",
        "content": "🎯 Prompt: '"'"'Set up a Next.js 15 project with TypeScript, TailwindCSS, and a modern portfolio layout with a navigation bar, hero section, projects showcase, and contact form.'"'"'"
      },
      {
        "blockType": "richText",
        "text": "Within minutes, Claude Code had:\n\n1. ✅ Created the entire project structure\n2. ✅ Configured TypeScript and TailwindCSS\n3. ✅ Built responsive components\n4. ✅ Set up routing and layouts\n5. ✅ Added dark mode support"
      },
      {
        "blockType": "image",
        "url": "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&q=80",
        "alt": "Modern web development setup",
        "caption": "From idea to implementation in minutes"
      },
      {
        "blockType": "heading",
        "level": "h3",
        "text": "Step 2: Adding AI-Powered Features"
      },
      {
        "blockType": "richText",
        "text": "To showcase my AI skills, I wanted live demos. Here'"'"'s where vibe coding really shines:"
      },
      {
        "blockType": "codeBlock",
        "language": "javascript",
        "code": "// Prompt: \"Add a real-time speech-to-text demo using Whisper WebGPU\"\n//\n// Claude Code automatically:\n// ✓ Installed @huggingface/transformers\n// ✓ Set up Web Workers for performance\n// ✓ Created audio input handling\n// ✓ Built a beautiful UI with real-time transcription\n// ✓ Handled WebGPU availability checks\n// ✓ Added error handling and loading states\n\nimport { pipeline } from '"'"'@huggingface/transformers'"'"'\n\nconst transcriber = await pipeline(\n  '"'"'automatic-speech-recognition'"'"',\n  '"'"'Xenova/whisper-tiny.en'"'"',\n  { device: '"'"'webgpu'"'"' }\n)\n\n// Real-time transcription in the browser!\nconst result = await transcriber(audioData)\nconsole.log(result.text) // Your speech converted to text",
        "filename": "speech-to-text.js",
        "showLineNumbers": true
      },
      {
        "blockType": "heading",
        "level": "h3",
        "text": "Step 3: Integrating Payload CMS"
      },
      {
        "blockType": "callout",
        "type": "warning",
        "content": "⚡ Pro Tip: When integrating third-party tools, always ask Claude Code to follow the official documentation. It will fetch the latest guides and implement best practices automatically."
      },
      {
        "blockType": "richText",
        "text": "Every developer needs a blog. Instead of manually creating blog posts, I asked Claude Code to integrate Payload CMS. The result? A full-featured blog with:\n\n- 📝 Rich text editor with code syntax highlighting\n- 🖼️ Image uploads and optimization\n- 🎥 Video embeds (YouTube, Vimeo)\n- 🏷️ Categories and tags\n- 👤 Author profiles with social links\n- 🔍 SEO metadata\n- 💬 Comments system ready"
      },
      {
        "blockType": "image",
        "url": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80",
        "alt": "Content management system",
        "caption": "Powerful CMS integrated seamlessly"
      },
      {
        "blockType": "heading",
        "level": "h2",
        "text": "The Vibe Coding Workflow"
      },
      {
        "blockType": "codeBlock",
        "language": "bash",
        "code": "# 1. Describe Your Vision\n\"I want to add a blog section with Payload CMS\"\n\n# 2. Claude Code Plans\n- Reviews official Payload docs\n- Analyzes your codebase structure  \n- Proposes implementation approach\n\n# 3. Review & Approve\n- Check the plan\n- Ask questions\n- Request modifications\n\n# 4. Claude Code Implements  \n- Installs dependencies\n- Creates collections and schemas\n- Sets up admin panel\n- Builds frontend pages\n- Handles routing\n\n# 5. Iterate & Refine\n\"Can you add video embed support?\"\n\"Make the code blocks use Prism for syntax highlighting\"\n\"Add reading time estimation\"",
        "filename": "vibe-workflow.sh",
        "showLineNumbers": false
      },
      {
        "blockType": "heading",
        "level": "h2",
        "text": "Real Results: Time Saved"
      },
      {
        "blockType": "richText",
        "text": "Let'"'"'s be honest about the time savings:"
      },
      {
        "blockType": "codeBlock",
        "language": "text",
        "code": "Traditional Development:\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n📦 Project setup & configuration:     2-3 hours\n🎨 Building responsive layouts:       8-10 hours  \n🤖 Implementing AI features:          15-20 hours\n📝 CMS integration:                   10-15 hours\n🐛 Debugging & polish:                10-15 hours\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n⏰ Total: 45-63 hours (1-2 weeks)\n\nWith Claude Code:\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n📦 Project setup:                     5 minutes\n🎨 Building layouts:                  1 hour\n🤖 AI features:                       3 hours\n📝 CMS integration:                   2 hours  \n🐛 Debugging & refinement:            2 hours\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n⏰ Total: 8 hours (1 day)\n\n📊 Time saved: 85% reduction!",
        "filename": "time-comparison.txt",
        "showLineNumbers": false
      },
      {
        "blockType": "callout",
        "type": "success",
        "content": "🚀 That'"'"'s an 85% reduction in development time, allowing you to ship faster and iterate more!"
      },
      {
        "blockType": "image",
        "url": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80",
        "alt": "Productivity and efficiency",
        "caption": "Ship 10x faster with AI assistance"
      },
      {
        "blockType": "heading",
        "level": "h2",
        "text": "Key Principles for Success"
      },
      {
        "blockType": "richText",
        "text": "### 1. Be Specific About Intent, Not Implementation\n\n❌ Instead of: *\"Create a useState hook for the form\"*\n\n✅ Say: *\"Add form validation with error messages that appear in real-time\"*\n\n### 2. Provide Context\n\nClaude Code works best when it understands your project. Use a `CLAUDE.md` file to document your architecture, conventions, and preferences.\n\n### 3. Iterate in Small Steps\n\nBuild features incrementally. Start with core functionality, then add polish.\n\n### 4. Trust but Verify\n\nClaude Code is highly accurate, but always review the code. Use it as a learning opportunity to understand modern patterns."
      },
      {
        "blockType": "heading",
        "level": "h2",
        "text": "Beyond Personal Websites"
      },
      {
        "blockType": "richText",
        "text": "While this article focused on building a personal website, the vibe coding approach scales to any project:\n\n- 💼 SaaS applications\n- 🛒 E-commerce platforms  \n- 📊 Internal tools and dashboards\n- 📱 Mobile app backends\n- ⚙️ Data processing pipelines\n- 🎮 Game development\n- 🔬 Research prototypes"
      },
      {
        "blockType": "image",
        "url": "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80",
        "alt": "Team collaboration",
        "caption": "AI-assisted development for any project"
      },
      {
        "blockType": "heading",
        "level": "h2",
        "text": "The Future is Here"
      },
      {
        "blockType": "richText",
        "text": "Vibe coding with Claude Code represents a fundamental shift in how we build software. It'"'"'s not about replacing developers – it'"'"'s about **amplifying human creativity**. You focus on vision, architecture, and user experience, while AI handles the implementation details.\n\nThe barrier to building amazing software has never been lower. Whether you'"'"'re a seasoned developer or just starting out, vibe coding lets you turn ideas into reality at unprecedented speed."
      },
      {
        "blockType": "callout",
        "type": "info",
        "content": "🎯 Ready to start vibe coding? Head to claude.ai/code and experience the future of development. Your next great project is just a conversation away."
      },
      {
        "blockType": "videoEmbed",
        "platform": "youtube",
        "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "title": "Introduction to Vibe Coding"
      },
      {
        "blockType": "heading",
        "level": "h2",
        "text": "Resources & Links"
      },
      {
        "blockType": "richText",
        "text": "- 🔗 [Claude Code](https://claude.ai/code) - Get started with AI-assisted development\n- 📚 [Next.js Documentation](https://nextjs.org) - Learn Next.js 15\n- 🎨 [Payload CMS](https://payloadcms.com) - The headless CMS for modern developers\n- 🤖 [Transformers.js](https://huggingface.co/docs/transformers.js) - Machine learning in the browser\n- 💬 [Join the Discussion](https://github.com/anthropics/claude-code/discussions) - Share your vibe coding experiences"
      }
    ]
  }')

POST_ID=$(echo $POST_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$POST_ID" ]; then
  echo "❌ Failed to create blog post"
  echo "Response: $POST_RESPONSE"
  exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 SUCCESS! Your first blog post is live!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 Title: Building a Full Personal Website with Vibe Coding"
echo "🆔 Post ID: $POST_ID"
echo "✅ Status: Published"
echo "📅 Published: $(date)"
echo ""
echo "🌐 View your blog post at:"
echo "   👉 http://localhost:3000/blog/building-personal-website-vibe-coding-claude-code"
echo ""
echo "📋 All blog posts:"
echo "   👉 http://localhost:3000/blog"
echo ""
echo "⚙️  Manage in admin:"
echo "   👉 http://localhost:3000/admin/collections/posts"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
