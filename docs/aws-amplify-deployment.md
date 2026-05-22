# AWS Amplify Deployment Guide - Payload CMS Integration

This guide covers deploying your Next.js app with Payload CMS to AWS Amplify.

## Prerequisites

- ✅ MongoDB Atlas database (you already have this)
- ✅ AWS Account with Amplify access
- ✅ AWS S3 bucket for media storage

---

## Step 1: Create AWS S3 Bucket for Media

### 1.1 Create S3 Bucket
1. Go to AWS S3 Console: https://s3.console.aws.amazon.com/
2. Click **Create bucket**
3. **Bucket name**: `hermasai-media` (or your preferred name)
4. **Region**: `us-east-1` (or your preferred region)
5. **Block Public Access**: Keep defaults (block all public access)
6. Click **Create bucket**

### 1.2 Configure CORS for S3 Bucket
1. Select your bucket → **Permissions** tab
2. Scroll to **Cross-origin resource sharing (CORS)**
3. Click **Edit** and paste:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": [
      "http://localhost:3000",
      "https://*.amplifyapp.com"
    ],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

4. Click **Save changes**

### 1.3 Create IAM User for S3 Access
1. Go to IAM Console: https://console.aws.amazon.com/iam/
2. Click **Users** → **Create user**
3. **User name**: `payload-s3-user`
4. Click **Next**
5. **Permissions**: Select **Attach policies directly**
6. Search and select: `AmazonS3FullAccess` (or create custom policy)
7. Click **Next** → **Create user**

### 1.4 Generate Access Keys
1. Click on the newly created user
2. Go to **Security credentials** tab
3. Scroll to **Access keys** → Click **Create access key**
4. Select **Application running outside AWS**
5. Click **Next** → **Create access key**
6. **IMPORTANT**: Save these credentials (you won't see them again):
   - `Access key ID`
   - `Secret access key`

---

## Step 2: Configure AWS Amplify Environment Variables

### 2.1 Go to Amplify Console
1. Open AWS Amplify Console
2. Select your app
3. Go to **Environment variables** (in left sidebar)

### 2.2 Add Required Environment Variables

Click **Add variable** for each:

| Variable Name | Value | Notes |
|---------------|-------|-------|
| `PAYLOAD_SECRET` | Generate with: `openssl rand -base64 32` | Min 32 characters |
| `MONGODB_URI` | Your MongoDB Atlas connection string | Example: `mongodb+srv://user:pass@cluster.mongodb.net/hermasai` |
| `S3_BUCKET` | `hermasai-media` | Your S3 bucket name |
| `S3_REGION` | `us-east-1` | Your S3 bucket region |
| `S3_ACCESS_KEY_ID` | From Step 1.4 | IAM user access key |
| `S3_SECRET_ACCESS_KEY` | From Step 1.4 | IAM user secret key |
| `NEXT_PUBLIC_PYTHON_SERVICES_URL` | Your EC2 backend URL | Example: `http://your-ec2-ip:8000` |
| `NEXT_PUBLIC_ADMIN_USERNAME` | `admin` | Optional: For your custom admin page |
| `NEXT_PUBLIC_ADMIN_PASSWORD` | Your password | Optional: For your custom admin page |

**Example MongoDB URI format:**
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/hermasai?retryWrites=true&w=majority
```

---

## Step 3: Deploy to AWS Amplify

### 3.1 Push Code to GitHub
```bash
git push origin genai
```

### 3.2 AWS Amplify Auto-Deploy
- If connected to GitHub, Amplify will automatically detect the push
- Build will start automatically
- Check build logs in Amplify Console

### 3.3 Build Configuration
Your `amplify.yml` is already configured correctly:
- ✅ Installs dependencies with `npm ci`
- ✅ Runs `npm run build`
- ✅ Caches `.next` and `node_modules`

---

## Step 4: Create First Admin User

### 4.1 Access Admin Panel
After deployment completes:
```
https://your-app-name.amplifyapp.com/admin
```

### 4.2 Create Admin Account
1. First visit will show a signup form (when no users exist)
2. Fill in:
   - **Email**: your@email.com
   - **Password**: Strong password (min 8 chars)
3. Click **Create First User**

---

## Step 5: Verify Everything Works

### Test Checklist:
- [ ] Main website loads: `https://your-app.amplifyapp.com/`
- [ ] Admin panel accessible: `https://your-app.amplifyapp.com/admin`
- [ ] Can log in to admin
- [ ] Can create a blog post
- [ ] Can upload an image (should upload to S3)
- [ ] Blog post appears on frontend: `https://your-app.amplifyapp.com/blog`

---

## Common Issues & Solutions

### Issue 1: Build Fails with "Sharp" Error
**Solution**: Sharp is already configured. If issues persist, add to `package.json`:
```json
"optionalDependencies": {
  "sharp": "^0.34.4"
}
```

### Issue 2: MongoDB Connection Timeout
**Causes:**
- MongoDB Atlas IP whitelist doesn't include AWS
- Incorrect connection string

**Solution:**
1. Go to MongoDB Atlas → Network Access
2. Add `0.0.0.0/0` to IP whitelist (allow all)
3. Verify connection string is correct (use the "Node.js" driver format)

### Issue 3: Cannot Access /admin (404 Error)
**Cause**: Payload admin routes not being served

**Solution**: Verify `next.config.ts` has:
```typescript
import { withPayload } from '@payloadcms/next/withPayload'
export default withPayload(nextConfig)
```
✅ Already configured in your project

### Issue 4: Images Upload but Don't Display
**Cause**: S3 bucket permissions or CORS

**Solution:**
1. Verify CORS configuration (Step 1.2)
2. Check S3 bucket policy allows GetObject
3. Verify S3 credentials are correct

### Issue 5: Build Succeeds but Site Shows Errors
**Check:**
1. Amplify logs: Build tab → View build logs
2. Runtime logs: Monitoring tab → View logs
3. Environment variables are all set correctly

---

## Updating the Site After Deployment

### For Code Changes:
```bash
git add .
git commit -m "Your changes"
git push origin genai
```
Amplify auto-deploys on push.

### For Blog Content:
1. Go to `https://your-app.amplifyapp.com/admin`
2. Edit content in CMS
3. Changes are live immediately (no redeployment needed)

---

## Cost Estimates

**AWS Services:**
- **Amplify Hosting**: ~$5/month (free tier: 1000 build minutes/month)
- **S3 Storage**: ~$0.02/GB/month + data transfer
- **MongoDB Atlas**: Free tier (512MB storage, good for small blogs)

**Total**: ~$5-10/month for a personal blog

---

## Security Best Practices

1. ✅ Use strong `PAYLOAD_SECRET` (32+ random characters)
2. ✅ MongoDB connection string uses SSL (`mongodb+srv://`)
3. ✅ S3 bucket blocks public access (Payload manages access)
4. ⚠️ Consider adding custom domain with SSL certificate
5. ⚠️ Enable CloudFront CDN for better performance

---

## Need Help?

If deployment fails:
1. Check Amplify build logs
2. Verify all environment variables are set
3. Test MongoDB connection locally first
4. Ensure S3 credentials have correct permissions

Questions? Check the issues or contact support.
