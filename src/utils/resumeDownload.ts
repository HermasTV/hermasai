import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';

interface ResumeDownloadOptions {
  content: string;
  filename?: string;
  format?: 'pdf' | 'txt';
}

export async function downloadResumeAsPDF({ content, filename = 'enhanced_resume' }: ResumeDownloadOptions) {
  try {
    // Create a new jsPDF instance
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Set font
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(11);

    // Page dimensions
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    const maxWidth = pageWidth - 2 * margin;
    const lineHeight = 5;
    
    let yPosition = margin;

    // Split content into lines and handle page breaks
    const lines = content.split('\n');
    
    for (const line of lines) {
      if (!line.trim()) {
        yPosition += lineHeight / 2; // Smaller gap for empty lines
        continue;
      }

      // Check if we need to wrap long lines
      const wrappedLines = pdf.splitTextToSize(line, maxWidth);
      
      for (const wrappedLine of wrappedLines) {
        // Check if we need a new page
        if (yPosition + lineHeight > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
        
        // Determine font style based on content
        if (line.toUpperCase() === line && line.length < 50) {
          // Likely a section header
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(12);
        } else if (line.startsWith('•') || line.startsWith('-')) {
          // Bullet points
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(10);
        } else {
          // Regular text
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(11);
        }
        
        pdf.text(wrappedLine, margin, yPosition);
        yPosition += lineHeight;
      }
      
      // Add some extra space after paragraphs
      yPosition += 2;
    }

    // Save the PDF
    pdf.save(`${filename}.pdf`);
    return { success: true, message: 'PDF downloaded successfully' };
    
  } catch (error: any) {
    console.error('PDF generation error:', error);
    return { success: false, error: error.message };
  }
}

export function downloadResumeAsText({ content, filename = 'enhanced_resume' }: ResumeDownloadOptions) {
  try {
    // Create a blob with the text content
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    
    // Create a download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.txt`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return { success: true, message: 'Text file downloaded successfully' };
    
  } catch (error: any) {
    console.error('Text download error:', error);
    return { success: false, error: error.message };
  }
}

export async function downloadResumeAsDOCX({ content, filename = 'enhanced_resume' }: ResumeDownloadOptions) {
  try {
    // Parse content into structured document elements
    const lines = content.split('\n').filter(line => line.trim());
    const children: Paragraph[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (!line) continue;

      // Detect section headers (all caps, relatively short)
      if (line.toUpperCase() === line && line.length < 50 && line.length > 2) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: line,
                bold: true,
                size: 24, // 12pt font
              }),
            ],
            spacing: {
              before: 240, // 12pt spacing before
              after: 120,  // 6pt spacing after
            },
          })
        );
      }
      // Detect bullet points
      else if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
        const bulletText = line.replace(/^[\-\*•]\s*/, '');
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `• ${bulletText}`,
                size: 22, // 11pt font
              }),
            ],
            spacing: {
              before: 60, // 3pt spacing
              after: 60,
            },
            indent: {
              left: 360, // 0.25 inch indent
            },
          })
        );
      }
      // Regular paragraphs
      else {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: line,
                size: 22, // 11pt font
              }),
            ],
            spacing: {
              before: 120, // 6pt spacing
              after: 120,
            },
          })
        );
      }
    }

    // Create the document
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: children,
        },
      ],
    });

    // Generate and download the DOCX file
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${filename}.docx`);

    return { success: true, message: 'DOCX file downloaded successfully' };

  } catch (error: any) {
    console.error('DOCX generation error:', error);
    return { success: false, error: error.message };
  }
}

// Format resume content for better PDF presentation
export function formatResumeForDownload(content: string): string {
  return content
    // Clean up multiple consecutive line breaks
    .replace(/\n{3,}/g, '\n\n')
    // Ensure proper spacing around section headers
    .replace(/^([A-Z\s]{2,}[A-Z])$/gm, '\n$1\n')
    // Format bullet points consistently
    .replace(/^[\-\*]\s*/gm, '• ')
    // Ensure contact info is properly formatted
    .replace(/Email:\s*/gi, 'Email: ')
    .replace(/Phone:\s*/gi, 'Phone: ')
    .replace(/LinkedIn:\s*/gi, 'LinkedIn: ')
    .trim();
}