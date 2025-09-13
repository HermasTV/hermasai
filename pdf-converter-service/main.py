#!/usr/bin/env python3

import os
import tempfile
import uuid
from pathlib import Path
from typing import Optional

import aiofiles
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pdf2docx import Converter
from mangum import Mangum

app = FastAPI(
    title="PDF to DOCX Converter Service",
    description="Convert PDF files to DOCX format with proper formatting preservation",
    version="1.0.0"
)

# Add CORS middleware to allow requests from Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for production deployment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Lambda handler
handler = Mangum(app)

# Create temp directories
TEMP_DIR = Path(tempfile.gettempdir()) / "pdf_converter"
TEMP_DIR.mkdir(exist_ok=True)

@app.get("/")
async def root():
    return {
        "service": "PDF to DOCX Converter",
        "status": "running",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/convert/pdf-to-docx")
async def convert_pdf_to_docx(
    file: UploadFile = File(...)
):
    """
    Convert uploaded PDF file to DOCX format.
    
    - **file**: PDF file to convert
    - Returns: DOCX file as downloadable response
    """
    
    # Validate file type
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(
            status_code=400, 
            detail="Only PDF files are allowed"
        )
    
    if file.size and file.size > 50 * 1024 * 1024:  # 50MB limit
        raise HTTPException(
            status_code=400,
            detail="File size too large. Maximum 50MB allowed."
        )
    
    # Generate unique filenames
    request_id = str(uuid.uuid4())
    original_name = Path(file.filename).stem
    
    pdf_path = TEMP_DIR / f"{request_id}_input.pdf"
    docx_path = TEMP_DIR / f"{request_id}_output.docx"
    
    try:
        # Save uploaded PDF file
        async with aiofiles.open(pdf_path, 'wb') as f:
            content = await file.read()
            await f.write(content)
        
        print(f"Saved PDF file: {pdf_path} ({len(content)} bytes)")
        
        # Convert PDF to DOCX using pdf2docx
        cv = Converter(str(pdf_path))
        cv.convert(str(docx_path), start=0, end=None)
        cv.close()
        
        print(f"Conversion completed: {docx_path}")
        
        # Check if output file was created
        if not docx_path.exists():
            raise HTTPException(
                status_code=500,
                detail="Conversion failed - no output file generated"
            )
        
        # Return the converted DOCX file
        response_filename = f"{original_name}_converted.docx"
        
        return FileResponse(
            path=str(docx_path),
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            filename=response_filename,
            headers={
                "Content-Disposition": f"attachment; filename={response_filename}"
            }
        )
        
    except Exception as e:
        print(f"Conversion error: {str(e)}")
        
        # Clean up files on error
        cleanup_files([pdf_path, docx_path])
        
        # Provide more specific error messages
        if "password" in str(e).lower():
            raise HTTPException(
                status_code=400,
                detail="PDF appears to be password protected. Please provide an unlocked PDF."
            )
        elif "corrupt" in str(e).lower() or "invalid" in str(e).lower():
            raise HTTPException(
                status_code=400,
                detail="PDF file appears to be corrupted or invalid."
            )
        else:
            raise HTTPException(
                status_code=500,
                detail=f"Conversion failed: {str(e)}"
            )
    
    finally:
        # Schedule cleanup (files will be removed after response is sent)
        cleanup_files([pdf_path])


def cleanup_files(file_paths: list[Path]):
    """Clean up temporary files"""
    for path in file_paths:
        try:
            if path.exists():
                path.unlink()
                print(f"Cleaned up: {path}")
        except Exception as e:
            print(f"Failed to cleanup {path}: {e}")

@app.on_event("shutdown")
async def cleanup_temp_files():
    """Clean up all temporary files on shutdown"""
    try:
        for file_path in TEMP_DIR.glob("*"):
            file_path.unlink()
        print("Cleaned up all temporary files")
    except Exception as e:
        print(f"Error during cleanup: {e}")

if __name__ == "__main__":
    import uvicorn
    
    # Run the server
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        log_level="info"
    )