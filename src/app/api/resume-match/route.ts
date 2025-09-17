import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const resumeFile = formData.get("resume") as File;
    const jobUrl = formData.get("jobUrl") as string;
    const apiKey = formData.get("apiKey") as string;
    const model = (formData.get("model") as string) || "gpt-4o-mini";

    if (!resumeFile || !jobUrl || !apiKey) {
      return NextResponse.json({ error: "Missing required inputs" }, { status: 400 });
    }

    // Validate API key
    if (!apiKey.startsWith("sk-")) {
      return NextResponse.json({ error: "Invalid API key format" }, { status: 400 });
    }

    // Validate LinkedIn URL
    if (!jobUrl.includes("linkedin.com/jobs")) {
      return NextResponse.json({ error: "Please provide a valid LinkedIn job URL" }, { status: 400 });
    }

    // Extract resume text using pdf-parse
    let resumeText = "";
    try {
      if (resumeFile.type === "application/pdf" || resumeFile.name.toLowerCase().endsWith('.pdf')) {
        console.log('Parsing PDF resume with pdf-parse...');

        const arrayBuffer = await resumeFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Use try-catch to handle pdf-parse debug mode issues in deployment
        let parseResult;
        try {
          // Dynamic import to avoid build issues
          const pdfParse = (await import('pdf-parse')).default;
          parseResult = await pdfParse(buffer);
        } catch (importError) {
          // If pdf-parse fails due to debug mode, try our simple parser
          console.log('pdf-parse failed, trying simple parser:', importError.message);
          const { parseSimplePdf } = await import('@/utils/simplePdfParser');
          const simpleResult = await parseSimplePdf(buffer);
          parseResult = {
            text: simpleResult,
            numpages: 1, // We don't know the actual page count from simple parser
            info: {},
            metadata: {}
          };
        }

        resumeText = parseResult.text;

        if (!resumeText.trim()) {
          return NextResponse.json({
            error: "PDF parsing failed: No readable text found. Please try converting your resume to TXT format or use the debug button to see what went wrong."
          }, { status: 400 });
        }

        console.log(`PDF parsed successfully: ${parseResult.numpages} pages, ${resumeText.length} characters`);
      } else {
        console.log('Processing text resume...');
        resumeText = await resumeFile.text();
      }

      if (!resumeText.trim()) {
        return NextResponse.json({ error: "Could not extract text from resume file" }, { status: 400 });
      }
    } catch (error: any) {
      console.error('Resume parsing error:', error);
      return NextResponse.json({
        error: `Failed to parse resume file: ${error.message}`
      }, { status: 400 });
    }

    // Fetch job posting content
    let jobText = "";
    try {
      console.log("Fetching job from URL:", jobUrl);

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

      console.log("Job response status:", jobResp.status);
      console.log("Job response content-type:", jobResp.headers.get('content-type'));

      if (!jobResp.ok) {
        throw new Error(`HTTP ${jobResp.status}: ${jobResp.statusText}`);
      }

      const jobHtml = await jobResp.text();
      console.log("Job HTML length:", jobHtml.length);
      console.log("Job HTML starts with:", jobHtml.substring(0, 100));

      // Check if we got HTML or JSON response
      if (jobHtml.trim().startsWith('<!DOCTYPE') || jobHtml.trim().startsWith('<html')) {
        // Process HTML
        jobText = jobHtml
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Remove scripts
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // Remove styles
          .replace(/<[^>]+>/g, ' ') // Remove HTML tags
          .replace(/\s+/g, ' ') // Normalize whitespace
          .trim()
          .slice(0, 8000); // Limit length
      } else {
        // Might be JSON or other format
        try {
          const jsonData = JSON.parse(jobHtml);
          jobText = JSON.stringify(jsonData).slice(0, 8000);
        } catch {
          // Fall back to treating as plain text
          jobText = jobHtml.slice(0, 8000);
        }
      }

      console.log("Processed job text length:", jobText.length);

      if (!jobText.trim()) {
        throw new Error("Could not extract job description text");
      }
    } catch (error: any) {
      console.error("Job fetch error:", error);
      return NextResponse.json({
        error: `Failed to fetch job posting: ${error.message}. LinkedIn may be blocking automated access. Try using the debug button to see what was fetched.`
      }, { status: 400 });
    }

    // Enhanced prompt for detailed analysis and suggestions
    const systemPrompt = `You are an expert HR consultant, career coach, and resume optimization specialist with 15+ years of experience in recruitment and talent acquisition. You specialize in detailed resume analysis, grammar correction, and providing actionable improvement suggestions.

Your task is to analyze a candidate's resume against a specific job posting and provide comprehensive, actionable feedback that the user can copy and implement manually.

ANALYSIS FRAMEWORK:
1. Technical Skills Match: Compare required vs available skills
2. Experience Level: Years of experience, seniority level fit
3. Industry Alignment: Relevant industry background
4. Role Responsibilities: Match between past roles and job requirements
5. Education & Certifications: Relevant qualifications
6. Keywords: ATS-friendly keyword alignment
7. Grammar and Language Quality: Identify errors and improvements
8. Section Enhancement: Suggest better versions of resume sections
9. Skills Development: Recommend skills to learn
10. Experience Positioning: How to better highlight existing experience
11. Professional Development: Courses and certifications to pursue

SCORING METHODOLOGY:
- 90-100%: Exceptional match, ready to apply
- 80-89%: Strong candidate, minor improvements needed
- 70-79%: Good potential, moderate gaps to address
- 60-69%: Considerable gaps, significant improvements required
- Below 60%: Major mismatch, extensive rework needed`;

    const userPrompt = `JOB POSTING:
${jobText}

CANDIDATE RESUME:
${resumeText}

Provide a comprehensive analysis in the following JSON format only (no additional text). Focus on providing specific, actionable suggestions that the user can copy and implement:

{
  "match_percentage": <number between 0-100>,
  "overall_assessment": "<brief summary in 2-3 sentences>",
  "strengths": [
    "<specific strength with evidence from resume>",
    "<another strength>",
    "..."
  ],
  "gaps": [
    "<specific gap or missing requirement>",
    "<another gap>",
    "..."
  ],
  "improvement_suggestions": [
    "<actionable suggestion with specific keywords/skills to add>",
    "<formatting or presentation improvement>",
    "<experience highlighting suggestion>",
    "..."
  ],
  "keywords_to_add": [
    "<ATS-friendly keyword from job posting>",
    "<technical term>",
    "..."
  ],
  "sections_to_enhance": [
    "<resume section that needs work>",
    "<another section>",
    "..."
  ],
  "grammar_corrections": [
    {
      "original": "<exact text from resume with grammar/language issues>",
      "corrected": "<corrected version>",
      "explanation": "<why this is better - grammar, clarity, impact, etc.>"
    }
  ],
  "section_enhancements": [
    {
      "section": "<section name like 'Professional Summary', 'Work Experience - Software Engineer at ABC Corp', etc.>",
      "current_text": "<current text from that section>",
      "improved_text": "<enhanced version that better matches job requirements>",
      "reasoning": "<why this version is better - keywords, impact, clarity, job alignment>"
    }
  ],
  "skill_recommendations": [
    {
      "category": "<skill category like 'Technical Skills', 'Soft Skills', 'Certifications'>",
      "skills": ["<skill1>", "<skill2>", "<skill3>"],
      "priority": "<high|medium|low based on job requirements>"
    }
  ],
  "experience_suggestions": [
    "<suggestion on how to better position or describe existing experience>",
    "<another suggestion>",
    "..."
  ],
  "course_recommendations": [
    {
      "course": "<course or certification name>",
      "provider": "<provider if known, like Coursera, Udemy, AWS, etc.>",
      "relevance": "<why this course would help for this specific job>"
    }
  ]
}`;

    // Call OpenAI API
    try {
      const response = await axios.post("https://api.openai.com/v1/chat/completions", {
        model: model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 4000,
      }, {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      });

      const analysis = response.data.choices[0]?.message?.content;

      if (!analysis) {
        throw new Error("No analysis returned from AI");
      }

      console.log("Raw AI response:", analysis);

      // Try to parse as JSON, if it fails return as text with better error handling
      try {
        // Clean the analysis text to extract JSON
        let cleanedAnalysis = analysis.trim();

        // Remove code blocks if present
        cleanedAnalysis = cleanedAnalysis.replace(/```json\n?/g, '').replace(/```\n?/g, '');

        // Try to find JSON in the response
        const jsonMatch = cleanedAnalysis.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          cleanedAnalysis = jsonMatch[0];
        }

        const jsonAnalysis = JSON.parse(cleanedAnalysis);

        return NextResponse.json({
          analysis: analysis,
          parsed: jsonAnalysis,
          success: true
        });
      } catch (parseError: any) {
        console.error("JSON parse error:", parseError.message);
        console.log("Failed to parse:", analysis);

        // Return raw text if JSON parsing fails
        return NextResponse.json({
          analysis: analysis,
          success: true,
          parseError: parseError.message
        });
      }

    } catch (error: any) {
      console.error("OpenAI API Error:", error.response?.data || error.message);

      if (error.response?.status === 401) {
        return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
      }

      if (error.response?.status === 429) {
        return NextResponse.json({ error: "Rate limit exceeded. Please try again later." }, { status: 429 });
      }

      return NextResponse.json({
        error: "AI analysis failed. Please check your API key and try again."
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error("Resume matching error:", error);
    return NextResponse.json({
      error: error.message || "Internal server error"
    }, { status: 500 });
  }
}