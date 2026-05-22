# HermasAI - AI/ML Demo Platform

A Next.js 15 TypeScript application showcasing browser-based AI/ML capabilities with microservices architecture for document processing.

## 🚀 Features

### Browser-Based AI/ML Demos
- **Speech Recognition**: Real-time speech-to-text using Hugging Face Transformers with WebGPU
- **Computer Vision**: Real-time face detection using UltraFace and ONNX Runtime
- **Resume Analysis**: AI-powered resume matching and optimization with OpenAI integration

### Document Processing Services
- **PDF to DOCX Conversion**: Server-side document format conversion
- **Resume Text Extraction**: Debug-friendly PDF text parsing
- **AI-Powered Analysis**: Comprehensive resume analysis with improvement suggestions

## 🏗️ Architecture

### Microservices Design
- **Frontend**: Next.js 15 application (this repository)
- **Backend Services**: FastAPI-based services (separate repository as git submodule)
- **Deployment**: AWS Amplify (frontend) + AWS EC2 (backend services)

### Key Technologies
- **Frontend**: Next.js 15, React 19, TypeScript, TailwindCSS
- **AI/ML**: Hugging Face Transformers, ONNX Runtime, WebGPU, Web Workers
- **Backend**: FastAPI, PyPDF2, pdf2docx, Uvicorn
- **Deployment**: AWS Amplify, AWS EC2, CORS-enabled REST APIs

## 🛠️ Quick Start

### Prerequisites
1. **Node.js 18+** and **Python 3.8+**
2. **Git submodules** for backend services
3. **WebGPU-compatible browser** for AI demos

### Setup
```bash
# Clone repository with submodules
git clone --recursive https://github.com/HermasTV/hermasai.git
cd hermasai

# Frontend
npm install
npm run dev   # http://localhost:3000

# Backend (in services/documents-services/)
cd services/documents-services
pip install -r requirements.txt
python main.py   # http://127.0.0.1:8000

# Build for production
npm run build
npm start
```

## 📁 Project Structure

```
hermasai/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes (resume analysis)
│   │   ├── projects/          # AI/ML demo pages
│   │   │   ├── speech-to-text/
│   │   │   ├── realtime-face/
│   │   │   └── resume-matcher/
│   ├── components/            # React components
│   ├── hooks/                # Custom hooks (Web Workers, AI)
│   └── utils/                # Utilities (API config)
├── public/                   # Static assets (ML models)
├── services/          # Backend services (git submodule)
│   └── documents-services/   # FastAPI document processing
└── ignore-folder/           # Archive/backup files
```

## 🌐 API Endpoints

### Backend Services (`services/documents-services`)
- `GET /` - Service health status
- `GET /health` - Health check
- `POST /convert/pdf-to-docx` - PDF to DOCX conversion
- `POST /debug-resume` - Extract text from PDF resumes

### Frontend APIs (`src/app/api`)
- `POST /api/resume-match` - AI-powered resume analysis with OpenAI

## 🚀 Deployment

### Development
- **Frontend**: http://localhost:3000
- **Backend**: http://127.0.0.1:8000

### Production
- **Frontend**: AWS Amplify (auto-deployment from git)
- **Backend**: AWS EC2 instances
- **Environment**: Set `NEXT_PUBLIC_PDF_CONVERTER_API_URL` to your EC2 endpoint

### 🎯 Simple Environment Configuration
**Only 3 environment variables needed!** Clean and straightforward setup:

```env
NEXT_PUBLIC_PYTHON_SERVICES_URL=http://your-backend.com
NEXT_PUBLIC_ADMIN_USERNAME=admin
NEXT_PUBLIC_ADMIN_PASSWORD=your-secure-password
```

**Default admin credentials**: `admin` / `hermasai2024` (for local development)

### Configuration Management
Simple environment-based configuration:

- **Python Services URL**: Set your backend endpoint via environment variable
- **Admin Credentials**: Set via environment variables (secure and simple)
- **Admin Panel**: View current configuration at `/admin`
- **No Database Required**: Zero external dependencies for configuration

## 🔧 Development

### Submodule Management
Backend services are maintained in a separate repository:
```bash
# Initialize submodules (first time)
git submodule update --init --recursive

# Update submodule to latest
cd services/documents-services
git pull origin master
cd ../..
git add services/documents-services
git commit -m "Update documents-services submodule"
```

### WebGPU Requirements
- Chrome/Edge 113+ with WebGPU enabled
- Firefox Nightly with WebGPU flag enabled
- Required for speech recognition and face detection demos

## 📚 Additional Resources

- [docs/startup.md](./docs/startup.md) - Detailed development guide
- [CLAUDE.md](./CLAUDE.md) - Claude Code AI assistant instructions
- [Documents Services Repository](https://github.com/HermasTV/documents-services) - Backend services

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes and test locally
4. Update documentation if needed
5. Submit a pull request

For backend service changes, contribute to the [documents-services repository](https://github.com/HermasTV/documents-services) separately.

## 🤖 AI Co-Development

This project has been co-developed with **Claude AI** (Anthropic) to accelerate development and enhance code quality. Claude AI assisted in:
- Architecture design and implementation
- UI/UX improvements and modern component design
- Machine learning integration and ONNX model implementation
- API development and microservices architecture
- Documentation and code optimization
