#!/bin/bash

echo "🚀 Deploying PDF Converter to AWS Lambda..."

# Check if AWS CLI and SAM CLI are installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not found. Please install it first."
    exit 1
fi

if ! command -v sam &> /dev/null; then
    echo "❌ AWS SAM CLI not found. Please install it first."
    exit 1
fi

# Check AWS credentials
echo "🔍 Checking AWS credentials..."
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS credentials not configured. Please run 'aws configure' first."
    exit 1
fi

echo "✅ AWS credentials configured"

# Build the application
echo "🔨 Building SAM application..."
sam build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

# Deploy the application
echo "🚀 Deploying to AWS..."
sam deploy --guided --stack-name hermasai-pdf-converter

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo "📋 Getting API Gateway URL..."
    API_URL=$(aws cloudformation describe-stacks --stack-name hermasai-pdf-converter --query 'Stacks[0].Outputs[?OutputKey==`ApiGatewayUrl`].OutputValue' --output text)
    echo ""
    echo "🌐 Your API is available at: $API_URL"
    echo ""
    echo "📝 Update your Next.js environment variables:"
    echo "NEXT_PUBLIC_PDF_CONVERTER_API_URL=$API_URL"
    echo ""
else
    echo "❌ Deployment failed!"
    exit 1
fi