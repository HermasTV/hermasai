# 🚀 HermasAI Quick Start Guide

## Single Command Startup

Run the entire development environment (Next.js + Python services) with just one command:

### Linux/Mac:
```bash
npm run start-all
```
or
```bash
./start-dev.sh
```

### Windows:
```bash
npm run start-all-win
```
or
```bash
start-dev.bat
```

## What This Does

The startup script automatically:

1. ✅ **Checks Prerequisites**
   - Verifies Node.js 18+ is installed
   - Verifies Python 3.8+ is installed

2. 📦 **Installs Dependencies**
   - Installs Node.js packages (`npm install`)
   - Creates Python virtual environment
   - Installs Python packages (FastAPI, pdf2docx, etc.)

3. 🌟 **Starts Services**
   - **Next.js Frontend**: http://localhost:3000
   - **Python PDF Service**: http://127.0.0.1:8000
   - **API Documentation**: http://127.0.0.1:8000/docs

4. 🔄 **Process Management**
   - Runs both services concurrently
   - Handles graceful shutdown with Ctrl+C
   - Monitors service health

## Service URLs

Once started, you can access:

| Service | URL | Description |
|---------|-----|-------------|
| 🌐 **Frontend** | http://localhost:3000 | Next.js web application |
| 🐍 **PDF API** | http://127.0.0.1:8000 | Python FastAPI service |
| 📚 **API Docs** | http://127.0.0.1:8000/docs | Interactive API documentation |

## Features Available

With both services running, you can use:

- ✨ **AI Resume Matching** - Upload resume and job URL for AI analysis
- 🔄 **PDF to DOCX Conversion** - High-quality conversion using Python pdf2docx
- 📄 **Resume Enhancement** - AI-powered resume improvement suggestions
- 🎤 **Speech-to-Text** - Real-time speech recognition
- 👁️ **Face Detection** - Real-time computer vision demos

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
   cd pdf-converter-service
   pip install -r requirements.txt
   python main.py
   ```

2. **Start Next.js Frontend** (in another terminal):
   ```bash
   npm install
   npm run dev
   ```

Happy coding! 🎉