#!/bin/bash

# HermasAI Installation Script for Ubuntu Server
# Sets up all dependencies for the development environment

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

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

print_status "🔧 HermasAI Installation Script for Ubuntu Server"
echo "=================================================="

# Check if running on Ubuntu/Debian
if ! command -v apt &> /dev/null; then
    print_error "❌ This script is designed for Ubuntu/Debian systems with apt package manager"
    exit 1
fi

print_success "✅ Ubuntu/Debian system detected"

# Update package lists
print_status "📦 Updating package lists..."
sudo apt update

# Install system dependencies
print_status "🔧 Installing system dependencies..."
sudo apt install -y curl wget gnupg2 software-properties-common build-essential

# Install Node.js 18+ using NodeSource repository
if ! command -v node &> /dev/null; then
    print_status "📦 Installing Node.js 18..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs
    print_success "✅ Node.js installed: $(node --version)"
else
    print_success "✅ Node.js already installed: $(node --version)"
fi

# Install Python 3 and pip if not available
if ! command -v python3 &> /dev/null; then
    print_status "🐍 Installing Python 3..."
    sudo apt install -y python3 python3-pip python3-venv python3-dev
    print_success "✅ Python installed: $(python3 --version)"
else
    print_success "✅ Python already installed: $(python3 --version)"
fi

# Install system libraries needed for Python packages
print_status "📚 Installing Python system dependencies..."
sudo apt install -y \
    python3-dev \
    python3-pip \
    python3-venv \
    libxml2-dev \
    libxslt1-dev \
    zlib1g-dev \
    libjpeg-dev \
    libpng-dev \
    libfreetype6-dev \
    liblcms2-dev \
    libopenjp2-7-dev \
    libtiff5-dev \
    tk-dev \
    libffi-dev \
    libssl-dev

# Install LibreOffice for docx2pdf conversion
print_status "📄 Installing LibreOffice (required for DOCX to PDF conversion)..."
sudo apt install -y libreoffice

# Install Node.js dependencies
print_status "📦 Installing Node.js dependencies..."
if [ ! -d "node_modules" ]; then
    npm install
    if [ $? -eq 0 ]; then
        print_success "✅ Node.js dependencies installed"
    else
        print_error "❌ Failed to install Node.js dependencies"
        exit 1
    fi
else
    print_success "✅ Node.js dependencies already installed"
fi

# Set up Python virtual environment
print_status "🐍 Setting up Python virtual environment..."

cd python-services/documents-services

if [ ! -d "venv" ]; then
    python3 -m venv venv
    print_success "✅ Python virtual environment created"
else
    print_success "✅ Python virtual environment already exists"
fi

# Activate virtual environment and install Python dependencies
print_status "📦 Installing Python dependencies..."
source venv/bin/activate

# Upgrade pip first
pip install --upgrade pip

# Install Python packages
pip install -r requirements.txt
if [ $? -eq 0 ]; then
    print_success "✅ Python dependencies installed successfully"
else
    print_error "❌ Failed to install Python dependencies"
    exit 1
fi

cd ../..

# Create systemd service files for production deployment (optional)
print_status "📋 Creating systemd service templates..."

# Create Next.js service template
cat > hermasai-frontend.service.template << EOF
[Unit]
Description=HermasAI Next.js Frontend
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$(pwd)
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
EOF

# Create Python API service template
cat > hermasai-api.service.template << EOF
[Unit]
Description=HermasAI Python PDF API Service
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$(pwd)/python-services/documents-services
ExecStart=$(pwd)/python-services/documents-services/venv/bin/python main.py
Restart=always
RestartSec=10
Environment=PYTHONPATH=$(pwd)/python-services/documents-services

[Install]
WantedBy=multi-user.target
EOF

print_success "✅ Systemd service templates created"

# Make scripts executable
chmod +x start-dev.sh

echo ""
echo "=================================================="
print_success "🎉 HermasAI Installation Complete!"
echo "=================================================="
echo ""
echo -e "${CYAN}✅ System dependencies installed${NC}"
echo -e "${CYAN}✅ Node.js $(node --version) installed${NC}"
echo -e "${CYAN}✅ Python $(python3 --version) installed${NC}"
echo -e "${CYAN}✅ LibreOffice installed${NC}"
echo -e "${CYAN}✅ Node.js packages installed${NC}"
echo -e "${CYAN}✅ Python virtual environment set up${NC}"
echo -e "${CYAN}✅ Python packages installed${NC}"
echo ""
echo -e "${GREEN}🚀 Ready to start development:${NC}"
echo -e "${YELLOW}   ./start-dev.sh${NC}"
echo ""
echo -e "${PURPLE}📋 Optional: Set up systemd services for production${NC}"
echo -e "${PURPLE}   sudo cp *.service.template /etc/systemd/system/${NC}"
echo ""