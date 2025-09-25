@echo off
REM Script to start DynamoDB Local for development on Windows

echo 🚀 Starting DynamoDB Local...

REM Check if Docker is available
docker --version >nul 2>&1
if %errorlevel% == 0 (
    echo 📦 Using Docker to run DynamoDB Local...
    docker run --rm -p 8000:8000 amazon/dynamodb-local:latest
) else (
    echo ❌ Docker not found. Please install Docker or use npm to install DynamoDB Local.
    echo Alternative: npm install -g dynamodb-local
    echo Then run: dynamodb-local
    pause
)