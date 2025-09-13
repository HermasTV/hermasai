# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Quick Start (Single Command)
- **Start all services**: `npm run start-all` (Linux/Mac) or `npm run start-all-win` (Windows)
- **Alternative**: `./start-dev.sh` (Linux/Mac) or `start-dev.bat` (Windows)

This single command will:
- Install all Node.js dependencies
- Set up Python virtual environment
- Install Python dependencies (pdf2docx, fastapi, etc.)
- Start Next.js dev server on http://localhost:3000
- Start Python PDF converter service on http://127.0.0.1:8000
- Handle graceful shutdown with Ctrl+C

### Individual Commands
- **Start development server**: `npm run dev` (Next.js only)
- **Build project**: `npm run build`
- **Start production server**: `npm start`
- **Lint code**: `npm run lint`

## Project Architecture

This is a Next.js 15 TypeScript application focused on AI/ML browser demos, particularly:

- **Speech recognition**: Uses Hugging Face Transformers with WebGPU for real-time speech-to-text
- **Computer vision**: Real-time face detection using ONNX Runtime and WebGPU
- **Browser-based AI**: All ML models run client-side using WebGPU, ONNX.js, and Transformers.js

### Key Directory Structure

- `src/app/`: Next.js 15 App Router pages
  - `projects/speech-to-text/`: Whisper WebGPU speech recognition demo
  - `projects/realtime-face/`: UltraFace real-time face detection
- `src/components/`: Reusable React components
  - `AudioManager.tsx`: Core audio processing for speech recognition
  - `ultraface/`: Face detection utilities and processing
- `src/hooks/`: Custom React hooks
  - `useTranscriber.ts`: Speech transcription with Web Workers
  - `useWorker.ts`: Web Worker management
- `public/`: Static assets including large ML model files (WASM, ONNX)

### Technical Stack

- **Frontend**: Next.js 15, React 19, TypeScript, TailwindCSS
- **AI/ML**: Hugging Face Transformers, ONNX Runtime (WebGPU), Web Workers
- **Build**: Custom webpack config for ML library compatibility
- **Path aliases**: `@/*` maps to `src/*`

### Important Configuration

- **WebGPU requirement**: Both main demos require WebGPU support
- **Large model files**: ONNX models and WASM files served from `public/`
- **Custom webpack aliases**: Special handling for @huggingface/transformers
- **Relaxed linting**: Many TypeScript/ESLint rules disabled for rapid prototyping
- **Build errors ignored**: TypeScript and ESLint errors ignored during builds

### Development Notes

- Components include WebGPU availability checks before rendering
- Client-side rendering patterns used extensively for browser APIs
- Web Workers handle heavy ML computations to keep UI responsive
- Model loading and inference optimized for browser performance
- Dont run 'npm run dev' command after any code update, I'll do it manually