# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Quick Start (Single Command)
- **Start all services**: `npm run start-all`
- **Stop all services**: `npm run stop-all`

### Individual Commands
- **Start Next.js development server**: `npm run dev`
- **Build project**: `npm run build`
- **Start production server**: `npm start`
- **Lint code**: `npm run lint`

### Python Backend Service Commands
Navigate to `python-services/documents-services/` directory:
- **Install Python dependencies**: `pip install -r requirements.txt`
- **Start Python service**: `python main.py` (runs on http://127.0.0.1:8000)
- **Health check**: `curl http://127.0.0.1:8000/health`

### Production Deployment
- **Frontend**: Deploy via AWS Amplify (main Next.js application)
- **Backend**: Deploy Python services to AWS EC2 instances
- **Environment**: Set `NEXT_PUBLIC_PDF_CONVERTER_API_URL` to your EC2 endpoint

## Project Architecture

This is a Next.js 15 TypeScript application with separated backend services, focused on:

- **AI/ML browser demos**: Speech recognition, computer vision, real-time face detection
- **Document processing**: Resume analysis, PDF parsing, and AI-powered content enhancement
- **Microservices architecture**: Frontend and backend services deployed independently

### Key Directory Structure

**Frontend (Main Repository)**:
- `src/app/`: Next.js 15 App Router pages
  - `api/`: Next.js API routes (resume-match for AI analysis)
  - `projects/speech-to-text/`: Whisper WebGPU speech recognition demo
  - `projects/realtime-face/`: UltraFace real-time face detection
  - `projects/resume-matcher/`: AI-powered resume analysis tool
- `src/components/`: Reusable React components
  - `AudioManager.tsx`: Core audio processing for speech recognition
  - `ultraface/`: Face detection utilities and processing
- `src/hooks/`: Custom React hooks
  - `useTranscriber.ts`: Speech transcription with Web Workers
  - `useWorker.ts`: Web Worker management
- `src/utils/`: Utility functions
  - `apiConfig.ts`: API configuration for backend services
- `public/`: Static assets including large ML model files (WASM, ONNX)

**Backend Services (Submodule)**:
- `python-services/documents-services/`: Git submodule (separate repository)
  - FastAPI-based document processing service
  - PDF to DOCX conversion (`/convert/pdf-to-docx`)
  - Resume text extraction (`/debug-resume`)
  - PyPDF2-based PDF parsing with error handling

### Technical Stack

**Frontend**:
- Next.js 15, React 19, TypeScript, TailwindCSS
- Hugging Face Transformers, ONNX Runtime (WebGPU), Web Workers
- Custom webpack config for ML library compatibility
- Path aliases: `@/*` maps to `src/*`

**Backend Services**:
- FastAPI with async/await support
- PyPDF2 for PDF text extraction
- pdf2docx for document conversion
- CORS middleware for cross-origin requests
- Uvicorn ASGI server

### Important Configuration

- **WebGPU requirement**: Both main demos require WebGPU support
- **Large model files**: ONNX models and WASM files served from `public/`
- **Custom webpack aliases**: Special handling for @huggingface/transformers
- **Relaxed linting**: Many TypeScript/ESLint rules disabled for rapid prototyping
- **Build errors ignored**: TypeScript and ESLint errors ignored during builds

### Service Configuration

**API Endpoints (Backend Services)**:
- `GET /` - Service health status
- `GET /health` - Health check endpoint
- `POST /convert/pdf-to-docx` - Convert PDF files to DOCX format
- `POST /debug-resume` - Extract text content from PDF resumes for debugging

**Environment Variables**:
- `NEXT_PUBLIC_PDF_CONVERTER_API_URL` - Production backend service URL (e.g., http://your-ec2-ip:8000)
- `NEXT_PUBLIC_PDF_CONVERTER_API_URL_DEV` - Development backend service URL (defaults to http://127.0.0.1:8000)

**Submodule Management**:
- Backend services are in separate git repository: `https://github.com/HermasTV/documents-services`
- Use `git submodule update --init --recursive` to initialize submodules
- Backend changes are committed and pushed to the documents-services repository independently
- Main repository references specific commits from the submodule

### Development Notes

- Components include WebGPU availability checks before rendering
- Client-side rendering patterns used extensively for browser APIs
- Web Workers handle heavy ML computations to keep UI responsive
- Model loading and inference optimized for browser performance
- Backend services run independently and can be deployed separately
- API configuration automatically handles development vs production URLs
- Don't run 'npm run dev' command after any code update, I'll do it manually

### Deployment Architecture

**Development**:
- Frontend: http://localhost:3000 (Next.js)
- Backend: http://127.0.0.1:8000 (FastAPI)

**Production**:
- Frontend: AWS Amplify (auto-deployed from git)
- Backend: AWS EC2 instances (manually deployed)
- Communication via CORS-enabled REST API