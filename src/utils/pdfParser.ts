/**
 * Custom PDF Parser using PDF.js (Mozilla's PDF library)
 * Designed specifically for resume parsing with robust error handling
 */

interface PDFParseResult {
  text: string;
  pages: number;
  metadata?: any;
  success: boolean;
  error?: string;
}

export async function parsePDFBuffer(buffer: ArrayBuffer): Promise<PDFParseResult> {
  try {
    // Dynamic import to avoid server-side issues
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
    
    // Configure for server-side usage
    if (typeof window === 'undefined') {
      // Disable worker for server-side
      pdfjsLib.GlobalWorkerOptions.workerSrc = null;
    }

    // Load the PDF document with minimal configuration
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(buffer),
      // Minimal configuration for server-side
      useSystemFonts: true,
      disableFontFace: true,
      disableAutoFetch: true,
      disableStream: true,
      disableCreateObjectURL: true,
      isEvalSupported: false,
      fontExtraProperties: false,
      enableXfa: false,
      useWorkerFetch: false,
    });

    const pdf = await loadingTask.promise;

    console.log(`PDF loaded: ${pdf.numPages} pages`);

    let fullText = '';
    const textPromises = [];

    // Extract text from each page
    for (let i = 1; i <= pdf.numPages; i++) {
      textPromises.push(
        pdf.getPage(i).then(async (page) => {
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item: any) => {
              if ('str' in item) {
                return item.str;
              }
              return '';
            })
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();
          
          return `\n--- Page ${i} ---\n${pageText}`;
        })
      );
    }

    const pageTexts = await Promise.all(textPromises);
    fullText = pageTexts.join('\n').trim();

    // Get metadata
    const metadata = await pdf.getMetadata().catch(() => null);

    return {
      text: fullText,
      pages: pdf.numPages,
      metadata: metadata?.info || null,
      success: true
    };

  } catch (error: any) {
    console.error('PDF.js parsing failed:', error);
    
    return {
      text: '',
      pages: 0,
      success: false,
      error: error.message || 'Unknown PDF parsing error'
    };
  }
}

export async function parsePDFWithFallback(buffer: ArrayBuffer): Promise<PDFParseResult> {
  console.log('Starting PDF parsing with fallback approach...');
  
  // Try primary method: PDF.js
  const primaryResult = await parsePDFBuffer(buffer);
  
  if (primaryResult.success && primaryResult.text.trim().length > 0) {
    console.log('PDF.js parsing successful');
    return primaryResult;
  }

  console.log('PDF.js failed, trying alternative approach...');

  // Fallback: Try to extract basic text using simpler method
  try {
    // Convert buffer to text and look for readable content
    const uint8Array = new Uint8Array(buffer);
    const decoder = new TextDecoder('utf-8', { fatal: false });
    let rawText = decoder.decode(uint8Array);
    
    // Extract readable text using regex patterns
    const textMatches = rawText.match(/[\x20-\x7E]{4,}/g);
    const extractedText = textMatches ? textMatches.join(' ') : '';
    
    if (extractedText.trim().length > 50) {
      return {
        text: `[EXTRACTED WITH FALLBACK METHOD]\n\n${extractedText}`,
        pages: 1,
        success: true,
        error: 'Used fallback text extraction'
      };
    }
  } catch (fallbackError: any) {
    console.error('Fallback extraction failed:', fallbackError);
  }

  // Final fallback: Return error info
  return {
    text: `[PDF PARSING COMPLETELY FAILED]

Buffer size: ${buffer.byteLength} bytes
Primary error: ${primaryResult.error || 'Unknown error'}

This PDF could not be parsed. Common causes:
1. Encrypted or password-protected PDF
2. Scanned PDF (images only, no text)
3. Corrupted file
4. Unusual PDF format

Suggestions:
- Try converting to plain text (.txt) format
- Use a PDF-to-text converter online
- Save from your PDF reader as plain text
- Ensure the PDF contains selectable text (not just images)`,
    pages: 0,
    success: false,
    error: `PDF parsing failed: ${primaryResult.error}`
  };
}