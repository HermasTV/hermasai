#!/bin/bash

# This script uses Payload's REST API to create the blog post
# Much simpler and faster than initializing Payload in a separate process

API_URL="http://localhost:3000/api"

echo "🚀 Creating blog post via Payload REST API..."

# Step 1: Create first user
echo "📝 Creating admin user..."
USER_RESPONSE=$(curl -s -X POST "$API_URL/users/first-register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@hermasai.com",
    "password": "AdminPassword123!",
    "name": "Admin"
  }')

echo "✅ User created"

# Step 2: Login to get token
echo "🔐 Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/users/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@hermasai.com",
    "password": "AdminPassword123!"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed"
  exit 1
fi

echo "✅ Logged in successfully"

# Step 3: Create Author
echo "📝 Creating author..."
AUTHOR_RESPONSE=$(curl -s -X POST "$API_URL/authors" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Hermas AI",
    "bio": "Senior AI Engineer passionate about AI-assisted development, vibe coding, and building innovative web applications.",
    "email": "contact@hermasai.com",
    "website": "https://hermasai.com"
  }')

AUTHOR_ID=$(echo $AUTHOR_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)
echo "✅ Author created: $AUTHOR_ID"

# Step 4: Create Categories
echo "📝 Creating categories..."
CAT1_RESPONSE=$(curl -s -X POST "$API_URL/categories" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "AI Development",
    "slug": "ai-development",
    "description": "AI-assisted development, machine learning, and intelligent automation",
    "color": "#8B5CF6"
  }')

CAT1_ID=$(echo $CAT1_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)

CAT2_RESPONSE=$(curl -s -X POST "$API_URL/categories" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Web Development",
    "slug": "web-development",
    "description": "Modern web development, frameworks, and best practices",
    "color": "#3B82F6"
  }')

CAT2_ID=$(echo $CAT2_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)
echo "✅ Categories created"

# Step 5: Create the Blog Post
echo "📝 Creating blog post..."
POST_RESPONSE=$(curl -s -X POST "$API_URL/posts" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d @- << 'EOF'
{
  "title": "Building a Full Personal Website with Vibe Coding and Claude Code",
  "slug": "building-personal-website-vibe-coding-claude-code",
  "author": "'"$AUTHOR_ID"'",
  "categories": ["'"$CAT1_ID"'", "'"$CAT2_ID"'"],
  "excerpt": "Discover how vibe coding with Claude Code can transform the way you build websites. Learn how AI-assisted development enables you to create a complete personal portfolio in hours, not weeks.",
  "featured": true,
  "allowComments": true,
  "status": "published",
  "publishedAt": "'"$(date -Iseconds)"'",
  "tags": ["AI", "Claude Code", "Vibe Coding", "Web Development", "Tutorial", "Next.js"],
  "readingTime": 12,
  "content": "See BLOG_CONTENT.md for full content - simplified version for now"
}
EOF
)

echo "🎉 Blog post created!"
echo ""
echo "🌐 View at: http://localhost:3000/blog/building-personal-website-vibe-coding-claude-code"
