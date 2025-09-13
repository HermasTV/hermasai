# PDF to DOCX Converter Service

A FastAPI-based service that converts PDF files to DOCX format using the `pdf2docx` library, which preserves formatting, fonts, and structure much better than browser-based solutions.

## Features

- High-quality PDF to DOCX conversion using `pdf2docx`
- Preserves fonts, formatting, tables, and images
- File size validation (50MB limit)
- Proper error handling for corrupted/protected PDFs
- CORS enabled for Next.js frontend integration
- Automatic cleanup of temporary files

## Installation

1. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

## Running the Service

```bash
python main.py
```

The service will start on `http://127.0.0.1:8000`

## API Endpoints

### `POST /convert/pdf-to-docx`
Convert a PDF file to DOCX format.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: PDF file upload

**Response:**
- Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document
- Body: DOCX file download

**Example using curl:**
```bash
curl -X POST "http://127.0.0.1:8000/convert/pdf-to-docx" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@resume.pdf" \
  --output converted_resume.docx
```

### `GET /health`
Health check endpoint.

### `GET /`
Service information.

## Error Handling

The service provides specific error messages for:
- Invalid file types (non-PDF files)
- File size limits (>50MB)
- Password-protected PDFs
- Corrupted PDF files
- General conversion errors

## Integration with Next.js

The service is configured with CORS to accept requests from:
- `http://localhost:3000` (Next.js dev server)
- `http://127.0.0.1:3000`

## Dependencies

- **FastAPI**: Modern Python web framework
- **pdf2docx**: High-quality PDF to DOCX conversion
- **uvicorn**: ASGI server
- **aiofiles**: Async file operations
- **python-multipart**: File upload handling