import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';

// Interface for document conversion results
interface ConversionResult {
  success: boolean;
  message: string;
  error?: string;
}

// Convert PDF to DOCX using Python API service
export async function pdfToDocx(pdfFile: File, filename?: string): Promise<ConversionResult> {
  try {
    console.log('Starting PDF to DOCX conversion using Python service...');
    
    // Validate file
    if (!pdfFile.name.toLowerCase().endsWith('.pdf')) {
      return {
        success: false,
        error: 'Please select a valid PDF file'
      };
    }

    // Check file size (50MB limit to match Python service)
    if (pdfFile.size > 50 * 1024 * 1024) {
      return {
        success: false,
        error: 'File size too large. Maximum 50MB allowed.'
      };
    }

    // Create FormData for file upload
    const formData = new FormData();
    formData.append('file', pdfFile);

    console.log('Uploading PDF to conversion service...');

    // Call Python API service
    const response = await fetch('http://127.0.0.1:8000/convert/pdf-to-docx', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = 'Conversion failed';
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorMessage;
      } catch {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }

      return {
        success: false,
        error: errorMessage
      };
    }

    // Get the converted DOCX file
    const blob = await response.blob();
    
    // Generate filename
    const outputFilename = filename || pdfFile.name.replace('.pdf', '') || 'converted_resume';
    const docxFilename = `${outputFilename}_converted.docx`;
    
    // Download the file
    saveAs(blob, docxFilename);

    console.log('PDF to DOCX conversion completed successfully');

    return {
      success: true,
      message: `Successfully converted PDF to DOCX using Python service. Downloaded as ${docxFilename}`
    };

  } catch (error: any) {
    console.error('PDF to DOCX conversion error:', error);
    
    // Provide helpful error messages
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return {
        success: false,
        error: 'Cannot connect to PDF conversion service. Please ensure the Python service is running on http://127.0.0.1:8000'
      };
    }

    return {
      success: false,
      error: error.message || 'Failed to convert PDF to DOCX'
    };
  }
}

