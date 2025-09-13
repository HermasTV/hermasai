/**
 * Simple PDF Text Extractor using multiple approaches
 * Designed to work reliably in Next.js server environment
 */

interface SimplePDFResult {
  text: string;
  pages: number;
  method: string;
  success: boolean;
  error?: string;
  score?: number;
}

// Helper function to assess text quality
function calculateTextQuality(text: string): number {
  if (!text || text.length === 0) return 0;
  
  let score = 0;
  
  // Bonus for length (but diminishing returns)
  score += Math.min(text.length / 10, 100);
  
  // Bonus for readable words
  const words = text.match(/[A-Za-z]{3,}/g);
  if (words) {
    score += words.length * 2;
  }
  
  // Bonus for email addresses, URLs, names
  if (text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)) score += 20;
  if (text.match(/https?:\/\/[^\s]+/)) score += 10;
  if (text.match(/[A-Z][a-z]+ [A-Z][a-z]+/)) score += 15; // Names
  
  // Penalty for PDF artifacts
  if (text.includes('%PDF')) score -= 50;
  if (text.includes('obj')) score -= 30;
  if (text.includes('endstream')) score -= 40;
  if (text.includes('<<')) score -= 20;
  if (text.includes('>>')) score -= 20;
  
  // Penalty for too many numbers or symbols
  const symbols = text.match(/[^A-Za-z0-9\s@.,\-_]/g);
  if (symbols && symbols.length > text.length * 0.3) score -= 30;
  
  return Math.max(0, score);
}

// Final text cleaning to remove remaining PDF artifacts
function finalTextCleaning(text: string): string {
  return text
    // Remove PDF structure elements
    .replace(/%PDF-[0-9.]+/g, '')
    .replace(/\d+\s+0\s+obj/g, ' ')
    .replace(/endobj/g, ' ')
    .replace(/<<[^>]*>>/g, ' ')
    .replace(/stream\s*[\s\S]*?endstream/g, ' ')
    .replace(/\/[A-Za-z]+/g, ' ') // Remove PDF commands like /Type, /Font
    .replace(/\(\s*\)/g, ' ') // Remove empty parentheses
    .replace(/\[\s*\]/g, ' ') // Remove empty brackets
    // Clean up whitespace and characters
    .replace(/[^\x20-\x7E]/g, ' ') // Keep only printable ASCII
    .replace(/\s+/g, ' ') // Normalize spaces
    .split(' ')
    .filter(word => {
      // Final word filtering
      const w = word.trim();
      return w.length > 1 &&
             !w.match(/^[0-9.]+$/) && // No pure numbers
             !w.includes('R') && // No PDF references
             w.length < 30; // No extremely long strings
    })
    .join(' ')
    .trim();
}

// Method 1: Try to extract text using a basic PDF parsing approach
async function extractWithBasicParsing(buffer: ArrayBuffer): Promise<SimplePDFResult> {
  try {
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
    
    // Minimal server-side configuration
    pdfjsLib.GlobalWorkerOptions.workerSrc = false;
    
    const pdf = await pdfjsLib.getDocument({
      data: new Uint8Array(buffer),
      useSystemFonts: false,
      disableAutoFetch: true,
      disableStream: true,
      stopAtErrors: false
    }).promise;

    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      try {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str || '')
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
        
        if (pageText) {
          fullText += `\n--- Page ${i} ---\n${pageText}`;
        }
      } catch (pageError) {
        console.warn(`Failed to extract page ${i}:`, pageError);
        fullText += `\n--- Page ${i} (extraction failed) ---\n`;
      }
    }

    return {
      text: fullText.trim(),
      pages: pdf.numPages,
      method: 'PDF.js basic extraction',
      success: fullText.trim().length > 0
    };

  } catch (error: any) {
    return {
      text: '',
      pages: 0,
      method: 'PDF.js basic extraction',
      success: false,
      error: error.message
    };
  }
}

// Method 2: Extract readable text from raw PDF buffer
function extractTextFromRawPDF(buffer: ArrayBuffer): SimplePDFResult {
  try {
    const uint8Array = new Uint8Array(buffer);
    const decoder = new TextDecoder('latin1');
    const rawText = decoder.decode(uint8Array);
    
    // Extract text using more sophisticated patterns
    const textPatterns = [
      // Look for text in parentheses (common in PDF text objects)
      /\((.*?)\)/g,
      // Look for text in brackets
      /\[(.*?)\]/g,
      // Look for readable text between common PDF delimiters
      /BT\s+(.*?)\s+ET/gs,
      /Tj\s*\((.*?)\)/g,
      /TJ\s*\[(.*?)\]/g
    ];
    
    let extractedTexts: string[] = [];
    
    // Try each pattern
    for (const pattern of textPatterns) {
      const matches = rawText.match(pattern);
      if (matches) {
        extractedTexts.push(...matches.map(match => 
          match.replace(/[\(\)\[\]]/g, ' ')
               .replace(/BT|ET|Tj|TJ/g, ' ')
               .trim()
        ));
      }
    }
    
    // Also look for continuous readable text sequences
    const readableSequences = rawText.match(/[A-Za-z][A-Za-z0-9@.,\s\-_]{10,}/g);
    if (readableSequences) {
      extractedTexts.push(...readableSequences);
    }
    
    // Clean and filter the text
    const meaningfulText = extractedTexts
      .join(' ')
      .replace(/\\[nrt]/g, ' ') // Remove escape sequences
      .replace(/[^\x20-\x7E\s]/g, ' ') // Keep only printable ASCII and spaces
      .replace(/\s+/g, ' ')
      .split(' ')
      .filter(word => {
        // Filter out PDF artifacts and keep meaningful words
        return word.length > 1 && 
               !word.match(/^[0-9]+$/) && // No pure numbers
               !word.match(/^[0-9.]+$/) && // No decimal numbers
               !word.startsWith('/') && // No PDF commands
               !word.includes('>>') && // No PDF syntax
               !word.includes('<<') &&
               !word.includes('obj') &&
               !word.includes('endobj') &&
               !word.includes('stream') &&
               !word.includes('endstream') &&
               !word.includes('xref') &&
               word !== 'R' &&
               word.length < 50; // No extremely long strings
      })
      .join(' ')
      .trim();

    return {
      text: meaningfulText,
      pages: 1,
      method: 'Raw text extraction with pattern matching',
      success: meaningfulText.length > 50,
    };
    
  } catch (error: any) {
    return {
      text: '',
      pages: 0,
      method: 'Raw text extraction',
      success: false,
      error: error.message
    };
  }
}

// Method 3: Look for text streams in PDF structure
function extractFromPDFStreams(buffer: ArrayBuffer): SimplePDFResult {
  try {
    const decoder = new TextDecoder('latin1');
    const pdfString = decoder.decode(new Uint8Array(buffer));
    
    let extractedWords: string[] = [];
    
    // Look for common text patterns in PDF
    const patterns = [
      // Email addresses
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
      // URLs
      /https?:\/\/[^\s<>"{}|\\^`\[\]]+/g,
      // Phone numbers
      /[\+]?[1-9]?[\d\s\-\(\)]{7,15}/g,
      // Names (capitalized words)
      /\b[A-Z][a-z]{2,}\s+[A-Z][a-z]{2,}\b/g,
      // Words in context (surrounded by spaces or common punctuation)
      /\b[A-Za-z]{3,}\b/g,
      // Dates
      /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b|\b\d{4}-\d{2}-\d{2}\b/g,
    ];
    
    for (const pattern of patterns) {
      const matches = pdfString.match(pattern);
      if (matches) {
        extractedWords.push(...matches);
      }
    }
    
    // Look for text that might be encoded or in streams
    const streamMatches = pdfString.match(/stream\s*(.*?)\s*endstream/gs);
    if (streamMatches) {
      for (const stream of streamMatches) {
        // Try to extract readable text from streams
        const readableInStream = stream.match(/[A-Za-z][A-Za-z\s]{3,}[A-Za-z]/g);
        if (readableInStream) {
          extractedWords.push(...readableInStream);
        }
      }
    }
    
    // Clean and deduplicate
    const meaningfulWords = Array.from(new Set(extractedWords))
      .filter(word => {
        const cleaned = word.trim();
        return cleaned.length > 2 && 
               cleaned.length < 100 &&
               !cleaned.match(/^[0-9\s]+$/) &&
               !cleaned.includes('>>') &&
               !cleaned.includes('<<') &&
               !cleaned.includes('obj') &&
               !cleaned.includes('endobj');
      })
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    return {
      text: meaningfulWords,
      pages: 1,
      method: 'Advanced PDF pattern extraction',
      success: meaningfulWords.length > 20,
    };
    
  } catch (error: any) {
    return {
      text: '',
      pages: 0,
      method: 'PDF stream extraction',
      success: false,
      error: error.message
    };
  }
}

// Main function that tries all methods
export async function extractPDFText(buffer: ArrayBuffer): Promise<SimplePDFResult> {
  console.log('Starting PDF text extraction...');
  
  // Method 1: Try PDF.js
  console.log('Trying PDF.js extraction...');
  const pdfJsResult = await extractWithBasicParsing(buffer);
  if (pdfJsResult.success && pdfJsResult.text.length > 100) {
    console.log('PDF.js extraction successful');
    return pdfJsResult;
  }
  
  // Method 2: Try raw text extraction
  console.log('Trying raw text extraction...');
  const rawResult = extractTextFromRawPDF(buffer);
  if (rawResult.success && rawResult.text.length > 100) {
    console.log('Raw text extraction successful');
    return rawResult;
  }
  
  // Method 3: Try stream extraction
  console.log('Trying stream extraction...');
  const streamResult = extractFromPDFStreams(buffer);
  if (streamResult.success && streamResult.text.length > 50) {
    console.log('Stream extraction successful');
    return streamResult;
  }
  
  // Return the best result we got, even if not ideal
  const results = [pdfJsResult, rawResult, streamResult]
    .filter(r => r.text.length > 0)
    .map(r => ({
      ...r,
      // Score based on text quality, not just length
      score: calculateTextQuality(r.text)
    }))
    .sort((a, b) => b.score - a.score);
    
  if (results.length > 0) {
    const bestResult = results[0];
    const cleanedText = finalTextCleaning(bestResult.text);
    
    return {
      ...bestResult,
      text: cleanedText.length > 50 ? cleanedText : `[PARTIAL EXTRACTION - ${bestResult.method}]\n\n${cleanedText}`,
      success: cleanedText.length > 20
    };
  }
  
  // Complete failure
  return {
    text: `[PDF TEXT EXTRACTION FAILED]

Buffer size: ${buffer.byteLength} bytes

All extraction methods failed:
1. PDF.js: ${pdfJsResult.error || 'No readable text found'}
2. Raw extraction: ${rawResult.error || 'No readable text found'}  
3. Stream extraction: ${streamResult.error || 'No readable text found'}

This might be because:
- PDF is encrypted/password protected
- PDF contains only images (scanned document)
- PDF is corrupted or uses unsupported format
- Text is encoded in a complex way

Please try:
- Converting to plain text manually
- Using a different PDF file
- Ensuring the PDF contains selectable text (not just images)`,
    pages: 0,
    method: 'All methods failed',
    success: false,
    error: 'Complete extraction failure'
  };
}