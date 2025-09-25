# 🚀 Zero-Configuration AWS Deployment Guide

Deploy to AWS Amplify with **zero environment variables** - everything auto-configured!

## Quick Deployment Steps

### 1. Create DynamoDB Table
```bash
# AWS Console: DynamoDB → Create Table
Table name: hermasai
Partition key: configKey (String)
Capacity mode: On-demand
```

### 2. Set IAM Permissions
Add this policy to your Amplify service role:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "dynamodb:GetItem",
                "dynamodb:PutItem",
                "dynamodb:DescribeTable"
            ],
            "Resource": "arn:aws:dynamodb:us-east-1:YOUR-ACCOUNT-ID:table/hermasai"
        }
    ]
}
```

### 3. Deploy to Amplify
1. Connect your GitHub repository
2. **No environment variables needed!**
3. Deploy automatically

### 4. Configure via Admin Panel
1. Go to `your-app.amplifyapp.com/admin`
2. Login: `admin` / `hermasai2024`
3. Set your Python Services URL
4. Change admin credentials immediately
5. Save - configuration persists forever!

## That's It! 🎉

- ✅ **No .env files**
- ✅ **No build-time configuration**
- ✅ **Auto-detects AWS environment**
- ✅ **Web-based configuration**
- ✅ **Persistent across deployments**

## Local Development

1. Start DynamoDB Local: `npm run dynamodb:local`
2. Start app: `npm run dev`
3. Auto-detects localhost and uses local DynamoDB
4. Same admin panel interface

## Troubleshooting

### DynamoDB Access Denied
- Check IAM role has DynamoDB permissions
- Verify table exists in us-east-1 region
- Ensure table name is exactly `hermasai`

### Admin Panel Not Loading
- Check browser console for errors
- Verify table creation succeeded
- Try clearing browser cache

### Local Development Issues
- Ensure DynamoDB Local is running on port 8000
- Use Docker: `docker run --rm -p 8000:8000 amazon/dynamodb-local`