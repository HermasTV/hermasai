#!/bin/bash
# Script to start DynamoDB Local for development

echo "🚀 Starting DynamoDB Local..."

# Check if Docker is available
if command -v docker &> /dev/null; then
    echo "📦 Using Docker to run DynamoDB Local..."
    docker run --rm -p 8000:8000 amazon/dynamodb-local:latest
else
    echo "❌ Docker not found. Please install Docker or use npm to install DynamoDB Local."
    echo "Alternative: npm install -g dynamodb-local"
    echo "Then run: dynamodb-local"
fi