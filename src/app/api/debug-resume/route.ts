import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const resumeFile = formData.get("resume") as File;

    if (!resumeFile) {
      return NextResponse.json({ error: "Resume file is required" }, { status: 400 });
    }

    console.log('Resume file details:');
    console.log('- Name:', resumeFile.name);
    console.log('- Type:', resumeFile.type);
    console.log('- Size:', resumeFile.size);

    let resumeText = "";
    let extractionMethod = "";
    let additionalInfo: any = {};

    try {
      if (resumeFile.type === "application/pdf" || resumeFile.name.toLowerCase().endsWith('.pdf')) {
        console.log('Processing as PDF with pdf-parse...');
        
        const arrayBuffer = await resumeFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        // Dynamic import to avoid build issues
        const pdfParse = (await import('pdf-parse')).default;
        const parseResult = await pdfParse(buffer);
        
        resumeText = parseResult.text;  
        extractionMethod = "pdf-parse library";
          
        additionalInfo = {
          pages: parseResult.numpages,
          parseSuccess: true,
          info: parseResult.info,
          metadata: parseResult.metadata,
          extractionMethod: "pdf-parse library"
        };
        
      } else {
        console.log('Processing as text file...');
        extractionMethod = "Direct text reading";
        resumeText = await resumeFile.text();
      }

      console.log('Extracted text length:', resumeText.length);
      console.log('Text starts with:', resumeText.substring(0, 200));

      // Check if we got meaningful text content
      if (!resumeText || resumeText.trim().length === 0) {
        console.warn('No readable text content extracted from PDF');
        extractionMethod += ' (WARNING: No readable text found)';
      }

      // Always return something, even if empty
      const truncatedText = resumeText.slice(0, 5000);

      return NextResponse.json({
        success: true,
        content: truncatedText,
        fullLength: resumeText.length,
        extractionMethod: extractionMethod,
        fileName: resumeFile.name,
        fileType: resumeFile.type,
        fileSize: resumeFile.size,
        ...additionalInfo
      });

    } catch (parseError: any) {
      console.error("File parsing error:", parseError);
      return NextResponse.json({ 
        success: false,
        error: `Failed to parse file: ${parseError.message}`,
        details: parseError.toString(),
        extractionMethod: extractionMethod,
        fileName: resumeFile.name,
        fileType: resumeFile.type,
        fileSize: resumeFile.size
      }, { status: 400 });
    }

  } catch (error: any) {
    console.error("Debug resume error:", error);
    return NextResponse.json({ 
      error: error.message || "Internal server error" 
    }, { status: 500 });
  }
}