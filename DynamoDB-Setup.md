# DynamoDB Setup Guide

This project uses DynamoDB for persistent configuration management that works both locally and in production.

## Local Development Setup

### Option 1: Docker (Recommended)
```bash
# Start DynamoDB Local with Docker
npm run dynamodb:local

# Or use the scripts directly
./scripts/start-dynamodb-local.sh        # Linux/Mac
scripts/start-dynamodb-local.bat         # Windows
```

### Option 2: NPM Global Install
```bash
# Install DynamoDB Local globally
npm install -g dynamodb-local

# Start DynamoDB Local
dynamodb-local
```

## Environment Configuration

Create `.env.local` file:
```env
# DynamoDB Configuration
DYNAMODB_LOCAL=true
DYNAMODB_LOCAL_ENDPOINT=http://localhost:8000

# Admin Panel
ADMIN_USERNAME=admin
ADMIN_PASSWORD=hermasai2024

# AWS Configuration (production only)
AWS_REGION=us-east-1
```

## Production Setup (AWS Amplify)

### 1. Create DynamoDB Table
```bash
# Using AWS CLI
aws dynamodb create-table \
    --table-name hermasai-config \
    --attribute-definitions AttributeName=configKey,AttributeType=S \
    --key-schema AttributeName=configKey,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --region us-east-1
```

### 2. Set Environment Variables in Amplify
```
DYNAMODB_LOCAL=false
AWS_REGION=us-east-1
ADMIN_USERNAME=your-username
ADMIN_PASSWORD=your-secure-password
```

### 3. Add IAM Permissions
Ensure your Amplify execution role has these DynamoDB permissions:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "dynamodb:GetItem",
                "dynamodb:PutItem",
                "dynamodb:DescribeTable",
                "dynamodb:CreateTable"
            ],
            "Resource": "arn:aws:dynamodb:*:*:table/hermasai-config"
        }
    ]
}
```

## How It Works

- **Local**: DynamoDB Local runs on `localhost:8000`
- **Production**: Uses AWS DynamoDB service
- **Automatic**: Table creation and fallback to default config
- **Persistent**: Configuration survives deployments and restarts

## Testing

1. Start DynamoDB Local: `npm run dynamodb:local`
2. Start Next.js: `npm run dev`
3. Go to `/admin` and update configuration
4. Changes are saved to DynamoDB and applied immediately

## Troubleshooting

### Local Issues
- **Port 8000 busy**: Kill existing DynamoDB process or change port
- **Docker not found**: Install Docker or use npm global method
- **Table creation fails**: Check DynamoDB Local is running

### Production Issues
- **Access denied**: Check IAM permissions
- **Table not found**: Ensure table exists in correct region
- **Connection timeout**: Check AWS credentials and region