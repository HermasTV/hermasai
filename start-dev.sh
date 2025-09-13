#!/bin/bash

# HermasAI Development Server Startup Script (Ubuntu Server)
# Runs both Next.js frontend and Python PDF converter service
# Prerequisites: Run ./install.sh first to set up all dependencies

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to cleanup background processes on exit
cleanup() {
    print_status "🛑 Shutting down services..."
    
    # Kill Python service if running
    if [[ -n $PYTHON_PID ]]; then
        kill $PYTHON_PID 2>/dev/null || true
        print_status "🐍 Python PDF service stopped"
    fi
    
    # Kill Next.js dev server if running
    if [[ -n $NEXTJS_PID ]]; then
        kill $NEXTJS_PID 2>/dev/null || true
        print_status "⚛️  Next.js dev server stopped"
    fi
    
    print_success "✅ All services stopped. Goodbye!"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

print_status "🚀 Starting HermasAI Development Environment (Ubuntu Server)"
echo "=========================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "❌ Node.js not found. Please run ./install.sh first."
    exit 1
fi

# Check if Python3 is installed
if ! command -v python3 &> /dev/null; then
    print_error "❌ Python3 not found. Please run ./install.sh first."
    exit 1
fi

print_success "✅ Node.js version: $(node --version)"
print_success "✅ Python version: $(python3 --version)"

# Check if Node.js dependencies are installed
if [ ! -d "node_modules" ]; then
    print_error "❌ Node.js dependencies not found. Please run ./install.sh first."
    exit 1
fi

# Check if Python virtual environment exists
if [ ! -d "pdf-converter-service/venv" ]; then
    print_error "❌ Python virtual environment not found. Please run ./install.sh first."
    exit 1
fi

print_status "🌟 Starting services..."

# Start Python PDF service in background
print_status "🐍 Starting Python PDF converter service..."
cd pdf-converter-service
source venv/bin/activate
python3 main.py &
PYTHON_PID=$!
cd ..

# Wait a moment for Python service to start
sleep 3

# Check if Python service started successfully
if kill -0 $PYTHON_PID 2>/dev/null; then
    print_success "✅ Python PDF service started (PID: $PYTHON_PID) on http://127.0.0.1:8000"
else
    print_error "❌ Failed to start Python PDF service"
    exit 1
fi

# Start Next.js development server
print_status "⚛️  Starting Next.js development server..."
npm run dev &
NEXTJS_PID=$!

# Wait a moment for Next.js to start
sleep 5

if kill -0 $NEXTJS_PID 2>/dev/null; then
    print_success "✅ Next.js development server started (PID: $NEXTJS_PID) on http://localhost:3000"
else
    print_error "❌ Failed to start Next.js development server"
    cleanup
    exit 1
fi

# Display service information
echo ""
echo "=============================================="
print_success "🎉 HermasAI Development Environment is Ready!"
echo "=============================================="
echo ""
echo -e "${CYAN}📱 Frontend (Next.js):${NC}     http://localhost:3000"
echo -e "${CYAN}🐍 Python PDF Service:${NC}    http://127.0.0.1:8000"
echo -e "${CYAN}📝 API Documentation:${NC}     http://127.0.0.1:8000/docs"
echo ""
echo -e "${PURPLE}🔄 Both services are running concurrently${NC}"
echo -e "${YELLOW}⚠️  Press Ctrl+C to stop all services${NC}"
echo ""

# Keep script running and wait for user interrupt
while true; do
    # Check if both processes are still running
    if ! kill -0 $PYTHON_PID 2>/dev/null; then
        print_error "❌ Python service died unexpectedly"
        cleanup
        exit 1
    fi
    
    if ! kill -0 $NEXTJS_PID 2>/dev/null; then
        print_error "❌ Next.js service died unexpectedly"
        cleanup
        exit 1
    fi
    
    sleep 5
done