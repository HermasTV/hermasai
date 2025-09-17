# 🚀 HermasAI Quick Start Guide

## Prerequisites

### System Requirements
- **Node.js 18+** - [Download](https://nodejs.org/)
- **Python 3.8+** - [Download](https://python.org/)
- **WebGPU-compatible browser** - Chrome 113+, Edge 113+, or Firefox Nightly
- **Git** - For submodule management

### First-time Setup
1. **Clone with submodules**:
```bash
git clone --recursive https://github.com/HermasTV/hermasai.git
cd hermasai
```

2. **Initialize submodules** (if cloned without --recursive):
```bash
git submodule update --init --recursive
```

3. **Install all dependencies**:
```bash
./install.sh
```

## Single Command Startup

Run the entire development environment (Next.js + Python services) with just one command:

### Linux/Mac:
```bash
./start-dev.sh
```

### Windows:
```bash
start-dev.bat
```

## What This Does

The startup script automatically:

1. ✅ **Checks Prerequisites**
   - Verifies Node.js 18+ is installed
   - Verifies Python 3.8+ is installed
   - Validates git submodule structure

2. 📦 **Installs Dependencies**
   - Installs Node.js packages (`npm install`)
   - Creates Python virtual environment in `python-services/documents-services`
   - Installs Python packages (FastAPI, PyPDF2, pdf2docx, etc.)

3. 🌟 **Starts Services**
   - **Next.js Frontend**: http://localhost:3000
   - **Python Document Service**: http://127.0.0.1:8000
   - **API Documentation**: http://127.0.0.1:8000/docs

4. 🔄 **Process Management**
   - Runs both services concurrently
   - Handles graceful shutdown with Ctrl+C
   - Monitors service health and auto-restarts on crashes

## Service URLs

Once started, you can access:

| Service | URL | Description |
|---------|-----|-------------|
| 🌐 **Frontend** | http://localhost:3000 | Next.js web application |
| 🐍 **Document API** | http://127.0.0.1:8000 | Python FastAPI document service |
| 📚 **API Docs** | http://127.0.0.1:8000/docs | Interactive API documentation |
| 🔧 **Health Check** | http://127.0.0.1:8000/health | Service status endpoint |

## Features Available

### AI/ML Browser Demos
- 🎤 **Speech-to-Text** - Real-time speech recognition with Whisper WebGPU
- 👁️ **Face Detection** - Real-time computer vision with UltraFace ONNX

### Document Processing & AI Analysis
- ✨ **AI Resume Matching** - Upload resume and job URL for comprehensive AI analysis
- 🔍 **Resume Debug Parse** - Extract and display PDF text content for debugging
- 🔄 **PDF to DOCX Conversion** - High-quality document format conversion
- 📊 **Match Scoring** - Percentage-based compatibility scoring
- 📝 **Grammar Corrections** - Automated text improvements
- 💡 **Improvement Suggestions** - AI-powered enhancement recommendations
- 🎯 **Keyword Optimization** - ATS-friendly keyword suggestions
- 📚 **Course Recommendations** - Skill development suggestions

## Stopping Services

- Press **Ctrl+C** in the terminal to stop all services gracefully
- On Windows: Close both command windows that opened

## Prerequisites

Make sure you have installed:

- **Node.js 18+** - [Download](https://nodejs.org/)
- **Python 3.8+** - [Download](https://python.org/)

## Troubleshooting

If you encounter issues:

1. **Permission Denied (Linux/Mac)**:
   ```bash
   chmod +x start-dev.sh
   ```

2. **Python Not Found**:
   - Install Python 3.8+ from python.org
   - On Ubuntu/Debian: `sudo apt install python3 python3-pip python3-venv`

3. **Node.js Not Found**:
   - Install Node.js 18+ from nodejs.org
   - Or use NVM: `nvm install 18 && nvm use 18`

4. **Port Already in Use**:
   - Make sure ports 3000 and 8000 are not used by other services
   - Kill existing processes: `lsof -ti:3000 | xargs kill -9`

## Manual Startup (Alternative)

If you prefer to start services individually:

1. **Start Python PDF Service**:
   ```bash
   cd documents-services
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   python main.py
   ```

2. **Start Next.js Frontend** (in another terminal):
   ```bash
   npm install
   npm run dev
   ```

Happy coding! 🎉