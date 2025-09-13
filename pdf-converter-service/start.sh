#!/bin/bash

# PDF to DOCX Converter Service Startup Script

echo "🚀 Starting PDF to DOCX Converter Service"
echo "========================================"

# Check if Python is available
if ! command -v python &> /dev/null; then
    echo "❌ Python not found. Please install Python 3.8+ to continue."
    exit 1
fi

# Check if we're in a virtual environment
if [[ "$VIRTUAL_ENV" != "" ]]; then
    echo "✅ Virtual environment detected: $VIRTUAL_ENV"
else
    echo "⚠️  Warning: Not running in a virtual environment"
    echo "   Consider creating one: python -m venv venv && source venv/bin/activate"
fi

# Install dependencies if requirements.txt exists
if [ -f "requirements.txt" ]; then
    echo "📦 Installing Python dependencies..."
    pip install -r requirements.txt
    if [ $? -eq 0 ]; then
        echo "✅ Dependencies installed successfully"
    else
        echo "❌ Failed to install dependencies"
        exit 1
    fi
else
    echo "❌ requirements.txt not found"
    exit 1
fi

# Start the FastAPI service
echo "🌟 Starting FastAPI service on http://127.0.0.1:8000"
echo "📝 Access API docs at: http://127.0.0.1:8000/docs"
echo "🔄 Press Ctrl+C to stop the service"
echo ""

python main.py