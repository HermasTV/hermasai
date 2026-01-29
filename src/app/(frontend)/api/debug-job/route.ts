import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { jobUrl } = await req.json();

    if (!jobUrl) {
      return NextResponse.json({ error: "Job URL is required" }, { status: 400 });
    }

    if (!jobUrl.includes("linkedin.com/jobs")) {
      return NextResponse.json({ error: "Please provide a valid LinkedIn job URL" }, { status: 400 });
    }

    // Fetch job posting content with debugging
    try {
      const jobResp = await fetch(jobUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        }
      });
      
      console.log('Job fetch response status:', jobResp.status);
      console.log('Job fetch response headers:', Object.fromEntries(jobResp.headers.entries()));
      
      if (!jobResp.ok) {
        throw new Error(`HTTP ${jobResp.status}: ${jobResp.statusText}`);
      }
      
      const jobHtml = await jobResp.text();
      console.log('Raw HTML length:', jobHtml.length);
      console.log('HTML starts with:', jobHtml.substring(0, 200));
      
      // Better HTML cleaning and text extraction
      let jobText = jobHtml
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Remove scripts
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // Remove styles
        .replace(/<[^>]+>/g, ' ') // Remove HTML tags
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();

      // Limit length for debugging
      const truncatedText = jobText.slice(0, 5000);
      
      console.log('Cleaned text length:', jobText.length);
      console.log('Truncated text length:', truncatedText.length);

      return NextResponse.json({
        success: true,
        content: truncatedText,
        fullLength: jobText.length,
        url: jobUrl,
        responseStatus: jobResp.status
      });

    } catch (fetchError: any) {
      console.error("Job fetch error:", fetchError);
      return NextResponse.json({ 
        error: `Failed to fetch job posting: ${fetchError.message}`,
        details: fetchError.toString()
      }, { status: 400 });
    }

  } catch (error: any) {
    console.error("Debug job error:", error);
    return NextResponse.json({ 
      error: error.message || "Internal server error" 
    }, { status: 500 });
  }
}