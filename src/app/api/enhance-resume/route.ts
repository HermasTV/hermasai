import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { originalResume, analysisResult, apiKey, model = "gpt-4o-mini" } = body;

    if (!originalResume || !analysisResult || !apiKey) {
      return NextResponse.json({ error: "Missing required inputs" }, { status: 400 });
    }

    // Validate API key
    if (!apiKey.startsWith("sk-")) {
      return NextResponse.json({ error: "Invalid API key format" }, { status: 400 });
    }

    // Create enhancement prompt based on analysis results
    const systemPrompt = `You are an expert resume writer and career coach. Your task is to enhance a resume by applying specific improvement suggestions from a job matching analysis.

INSTRUCTIONS:
1. Apply all improvement suggestions while maintaining the original resume structure
2. Add missing keywords naturally into existing content
3. Enhance sections that were identified as weak
4. Maintain professional tone and formatting
5. Keep all original achievements and experiences, but present them more effectively
6. Add relevant skills and keywords from the suggestions
7. Ensure the enhanced resume directly addresses the gaps identified in the analysis

IMPORTANT: Return ONLY the enhanced resume text, maintaining a clear professional format with sections like:
- Contact Information
- Professional Summary/Objective
- Skills
- Experience
- Education
- Additional relevant sections

Do not include any commentary or explanation - just the improved resume text.`;

    const userPrompt = `ORIGINAL RESUME:
${originalResume}

ANALYSIS RESULTS:
Match Percentage: ${analysisResult.match_percentage}%
Overall Assessment: ${analysisResult.overall_assessment}

IDENTIFIED GAPS:
${analysisResult.gaps?.map((gap: string) => `• ${gap}`).join('\n') || 'None specified'}

IMPROVEMENT SUGGESTIONS:
${analysisResult.improvement_suggestions?.map((suggestion: string) => `• ${suggestion}`).join('\n') || 'None specified'}

KEYWORDS TO ADD:
${analysisResult.keywords_to_add?.map((keyword: string) => `• ${keyword}`).join('\n') || 'None specified'}

SECTIONS TO ENHANCE:
${analysisResult.sections_to_enhance?.map((section: string) => `• ${section}`).join('\n') || 'None specified'}

Please enhance this resume by applying all the suggestions above. Make it more competitive for the target job while keeping all original information accurate.`;

    // Call OpenAI API
    try {
      const response = await axios.post("https://api.openai.com/v1/chat/completions", {
        model: model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 3000,
      }, {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      });

      const enhancedResume = response.data.choices[0]?.message?.content;
      
      if (!enhancedResume) {
        throw new Error("No enhanced resume returned from AI");
      }

      console.log("Enhanced resume generated, length:", enhancedResume.length);

      return NextResponse.json({ 
        enhancedResume: enhancedResume.trim(),
        originalLength: originalResume.length,
        enhancedLength: enhancedResume.length,
        success: true 
      });

    } catch (error: any) {
      console.error("OpenAI API Error:", error.response?.data || error.message);
      
      if (error.response?.status === 401) {
        return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
      }
      
      if (error.response?.status === 429) {
        return NextResponse.json({ error: "Rate limit exceeded. Please try again later." }, { status: 429 });
      }

      return NextResponse.json({ 
        error: "Resume enhancement failed. Please check your API key and try again." 
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error("Resume enhancement error:", error);
    return NextResponse.json({ 
      error: error.message || "Internal server error" 
    }, { status: 500 });
  }
}