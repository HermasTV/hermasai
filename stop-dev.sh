#!/bin/bash

# HermasAI Development Server Stop Script (Ubuntu Server)
# Stops all running development services

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_status "🛑 Stopping HermasAI Development Environment..."
echo "=================================================="

# Function to kill processes by port
kill_by_port() {
    local port=$1
    local service_name=$2
    
    local pid=$(lsof -t -i:$port 2>/dev/null || echo "")
    
    if [ -n "$pid" ]; then
        kill -TERM $pid 2>/dev/null || kill -KILL $pid 2>/dev/null
        print_success "✅ Stopped $service_name (PID: $pid) on port $port"
        return 0
    else
        print_warning "⚠️  No $service_name process found on port $port"
        return 1
    fi
}

# Function to kill processes by name
kill_by_name() {
    local process_name=$1
    local service_name=$2
    
    local pids=$(pgrep -f "$process_name" 2>/dev/null || echo "")
    
    if [ -n "$pids" ]; then
        echo "$pids" | while read pid; do
            if [ -n "$pid" ]; then
                kill -TERM $pid 2>/dev/null || kill -KILL $pid 2>/dev/null
                print_success "✅ Stopped $service_name (PID: $pid)"
            fi
        done
        return 0
    else
        print_warning "⚠️  No $service_name processes found"
        return 1
    fi
}

stopped_services=0

# Stop Python PDF service (port 8000)
print_status "🐍 Stopping Python PDF converter service..."
if kill_by_port 8000 "Python PDF service"; then
    ((stopped_services++))
fi

# Also try to kill by process name as backup
if kill_by_name "main.py" "Python PDF service"; then
    ((stopped_services++))
fi

# Stop Next.js development server (port 3000)
print_status "⚛️  Stopping Next.js development server..."
if kill_by_port 3000 "Next.js dev server"; then
    ((stopped_services++))
fi

# Also try to kill by process name as backup
if kill_by_name "next dev" "Next.js dev server"; then
    ((stopped_services++))
fi

# Stop any remaining Node.js processes related to the project
print_status "🧹 Cleaning up any remaining Node.js processes..."
if kill_by_name "node.*next" "Node.js processes"; then
    ((stopped_services++))
fi

# Clean up Python processes in virtual environment
print_status "🧹 Cleaning up Python processes..."
if kill_by_name "python.*uvicorn" "Python uvicorn processes"; then
    ((stopped_services++))
fi

# Wait a moment for processes to terminate
sleep 2

# Final check
print_status "🔍 Performing final check..."

# Check if ports are still in use
port_8000_check=$(lsof -t -i:8000 2>/dev/null || echo "")
port_3000_check=$(lsof -t -i:3000 2>/dev/null || echo "")

if [ -n "$port_8000_check" ]; then
    print_warning "⚠️  Port 8000 still in use by PID: $port_8000_check"
    print_status "💀 Force killing remaining process on port 8000..."
    kill -KILL $port_8000_check 2>/dev/null || true
fi

if [ -n "$port_3000_check" ]; then
    print_warning "⚠️  Port 3000 still in use by PID: $port_3000_check"
    print_status "💀 Force killing remaining process on port 3000..."
    kill -KILL $port_3000_check 2>/dev/null || true
fi

echo ""
echo "=============================================="
if [ $stopped_services -gt 0 ]; then
    print_success "🎉 HermasAI Development Environment Stopped!"
    print_success "📊 Stopped $stopped_services service(s)"
else
    print_warning "⚠️  No running services were found to stop"
fi
echo "=============================================="
echo ""
print_status "✨ All development services have been terminated"
print_status "🚀 Run ./start-dev.sh to start services again"
echo ""