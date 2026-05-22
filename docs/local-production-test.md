# Local Production Build Testing Guide

Test your production build locally before deploying to AWS Amplify.

---

## Prerequisites

Before testing locally, ensure your `.env.local` has all required variables:

```bash
# Check your .env.local file has these variables:
MONGODB_URI=mongodb+srv://...  # Your MongoDB Atlas connection string
PAYLOAD_SECRET=...              # Generate with: openssl rand -base64 32
S3_BUCKET=hermasai-media
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=...           # From AWS IAM
S3_SECRET_ACCESS_KEY=...       # From AWS IAM
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
NEXT_PUBLIC_PYTHON_SERVICES_URL=http://127.0.0.1:8000
```

**IMPORTANT:** Update the placeholder values with your actual credentials!

---

## Step 1: Update Your .env.local File

### Replace S3 Credentials
Copy your AWS S3 credentials from AWS Amplify environment variables:

1. **Get S3_ACCESS_KEY_ID:**
   - The Access Key ID you created in AWS IAM
   - Format: `AKIA...`

2. **Get S3_SECRET_ACCESS_KEY:**
   - The Secret Access Key from AWS IAM
   - Long random string

3. **Update .env.local:**
   ```bash
   # Replace these lines with your actual credentials
   S3_ACCESS_KEY_ID=AKIAXXXXXXXXXXXXXXXX
   S3_SECRET_ACCESS_KEY=your-actual-secret-key-here
   ```

### Verify MongoDB Connection
Make sure your MongoDB URI includes the database name:
```bash
# ✅ Correct format:
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/hermasai?retryWrites=true&w=majority

# ❌ Wrong (missing database name):
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/
```

---

## Step 2: Clean Build (Mimics Amplify)

This removes any cached files and builds fresh, just like Amplify does:

```bash
npm run build:test
```

**What this does:**
- Deletes `.next` directory (removes all cached builds)
- Runs `next build` from scratch
- Compiles TypeScript
- Builds all pages (frontend and admin)
- Generates Payload types

**Expected output:**
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (XX/XX)
✓ Finalizing page optimization

Route (app)                              Size     First Load JS
┌ ○ /                                    XXX kB         XXX kB
├ ○ /admin                               XXX kB         XXX kB
└ ... (more routes)
```

**Watch for:**
- ❌ TypeScript errors
- ❌ Build errors
- ❌ Missing environment variables warnings

---

## Step 3: Start Production Server

After successful build:

```bash
npm start
```

This starts Next.js in production mode on `http://localhost:3000`

---

## Step 4: Test Payload CMS Admin

### 4.1 Access Admin Panel
Open your browser:
```
http://localhost:3000/admin
```

### 4.2 First Time Setup
If you haven't created an admin user yet:
1. You'll see a signup form
2. Enter your email and password
3. Click **Create First User**

### 4.3 If You Already Have a User
1. Enter your credentials
2. Click **Login**

---

## Step 5: Test All Features

### ✅ Test Checklist:

**Frontend Tests:**
- [ ] Homepage loads: `http://localhost:3000/`
- [ ] Projects page works: `http://localhost:3000/projects`
- [ ] Blog page loads: `http://localhost:3000/blog`
- [ ] No console errors in browser DevTools (F12)

**Admin Panel Tests:**
- [ ] Can access admin: `http://localhost:3000/admin`
- [ ] Can log in successfully
- [ ] Dashboard displays correctly
- [ ] Collections visible (Posts, Authors, Categories, Media, Users)

**Blog Post Test:**
- [ ] Click **Posts** → **Create New**
- [ ] Fill in title: "Test Post"
- [ ] Add some content in the editor
- [ ] Set status to "Published"
- [ ] Click **Save**
- [ ] Post appears in Posts list

**Media Upload Test (S3):**
- [ ] Click **Media** → **Create New**
- [ ] Click **Upload Image**
- [ ] Select an image from your computer
- [ ] Click **Save**
- [ ] Check AWS S3 Console → `hermasai-media` bucket → Should see uploaded file

**View Published Post:**
- [ ] Go to `http://localhost:3000/blog`
- [ ] Your test post should appear
- [ ] Click on the post to view full page

---

## Step 6: Check for Production Issues

### Common Issues to Watch For:

**1. Environment Variables Missing**
```
Error: Environment variable PAYLOAD_SECRET is required
```
**Fix:** Check `.env.local` has all variables

**2. MongoDB Connection Failed**
```
Error: MongoServerSelectionError: connect ECONNREFUSED
```
**Fix:** Verify MongoDB URI is correct and includes database name

**3. S3 Upload Fails**
```
Error: Access Denied
```
**Fix:** Verify S3 credentials are correct and IAM user has S3 permissions

**4. Image Upload Works but Image Not Showing**
**Fix:** Check S3 bucket CORS configuration

**5. Admin Panel 404**
**Fix:** Ensure `next.config.ts` has `withPayload()` wrapper

---

## Step 7: Production Build Size Check

After successful build, check the output for page sizes:

```bash
# Look for this in build output:
Route (app)                              Size     First Load JS
```

**Warning signs:**
- ⚠️ Any page over 1MB First Load JS (may be slow)
- ⚠️ Total bundle size over 3MB (optimize if possible)

For your project (AI/ML demos), larger bundles are expected due to ONNX models.

---

## Step 8: Stop Production Server

When done testing:

```bash
# Press Ctrl+C in the terminal where you ran `npm start`
```

---

## Quick One-Command Test

For rapid testing, use this single command that builds and starts:

```bash
npm run start:prod
```

This runs `next build && next start` automatically.

---

## Comparing Local vs Amplify Build

| Aspect | Local Build | Amplify Build |
|--------|-------------|---------------|
| **Build Command** | `npm run build` | `npm run build` ✅ Same |
| **Environment** | Your machine | AWS Lambda |
| **Node Version** | Your version | AWS managed |
| **Environment Vars** | `.env.local` | Amplify Console |
| **MongoDB** | Same Atlas DB ✅ | Same Atlas DB ✅ |
| **S3 Bucket** | Same bucket ✅ | Same bucket ✅ |
| **Build Cache** | `.next/cache/` | Amplify cache |

**Key Difference:**
- Local uses your `.env.local` file
- Amplify uses Environment Variables from Console

---

## Pre-Deployment Checklist

Before pushing to AWS Amplify, verify:

- [ ] `npm run build:test` succeeds with no errors
- [ ] Admin panel accessible at `/admin`
- [ ] Can create and publish blog posts
- [ ] Can upload images to S3
- [ ] Published posts visible on `/blog`
- [ ] No console errors in browser
- [ ] All Amplify environment variables match your local `.env.local`

---

## Troubleshooting

### Build Fails Locally But Worked Before

**Try:**
```bash
# Clear all caches
rm -rf .next node_modules package-lock.json

# Reinstall
npm install

# Rebuild
npm run build:test
```

### Payload Admin Not Loading

**Check:**
```bash
# Verify Payload config is correct
cat src/payload/payload.config.ts

# Should have withPayload wrapper
cat next.config.ts | grep withPayload
```

### Need to Test with Fresh Database

**Option 1:** Use Local MongoDB
```bash
# Install MongoDB locally
# Update .env.local:
MONGODB_URI=mongodb://localhost:27017/hermasai-test
```

**Option 2:** Create Test Database on Atlas
- Create new database called `hermasai-test`
- Update `.env.local` to use test database
- Test without affecting production data

---

## Success Criteria

Your production build is ready for Amplify when:

✅ **Build succeeds** - No TypeScript or build errors
✅ **Admin works** - Can log in and manage content
✅ **S3 uploads work** - Images upload to S3 bucket
✅ **Frontend displays** - Blog posts show correctly
✅ **No console errors** - Clean browser console
✅ **MongoDB connected** - Database operations work

---

## Push to Amplify

Once all tests pass:

```bash
git add .
git commit -m "Your commit message"
git push origin genai
```

Amplify will automatically build and deploy using the **exact same build command** you tested locally.

---

## Monitoring Amplify Build

After pushing:

1. Go to AWS Amplify Console
2. Click on your app
3. Watch the build logs in real-time
4. Compare output to your local build

If local build succeeded and Amplify fails:
- Check environment variables are set correctly
- Check build logs for specific error
- Verify all variables match between local and Amplify

---

**Questions?** Check the build logs or test each feature individually to isolate issues.
