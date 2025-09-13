import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;
    const apiKey = formData.get("apiKey") as string;
    const model = (formData.get("model") as string) || "whisper-1";

    if (!audioFile || !apiKey) {
      return NextResponse.json(
        { error: "Audio file and API key are required" },
        { status: 400 }
      );
    }

    // Check file size (OpenAI limit is 25MB)
    if (audioFile.size > 25 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Audio file must be less than 25MB" },
        { status: 400 }
      );
    }

    // Validate API key format
    if (!apiKey.startsWith("sk-")) {
      return NextResponse.json(
        { error: "Invalid API key format" },
        { status: 400 }
      );
    }

    let response;
    let transcription;

    if (model === "gpt-4o-mini-transcribe" || model === "gpt-4o-transcribe") {
      // For GPT-4o models, we need to first transcribe with Whisper, then enhance with the selected GPT model
      const whisperFormData = new FormData();
      whisperFormData.append("file", audioFile);
      whisperFormData.append("model", "whisper-1");
      whisperFormData.append("language", "ar"); // Set Arabic as primary language for code-switching
      whisperFormData.append("response_format", "verbose_json");
      whisperFormData.append("prompt", "This audio contains Arabic and English mixed conversation. Please transcribe both languages accurately maintaining the original code-switching pattern. نصوص باللغة العربية والإنجليزية");

      try {
        const whisperResponse = await axios.post("https://api.openai.com/v1/audio/transcriptions", whisperFormData, {
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "multipart/form-data",
          },
        });

        const whisperResult = whisperResponse.data;
        const rawTranscription = whisperResult.text || "";

        // Now enhance with GPT model for Arabic-English code-switching
        const gptModel = model === "gpt-4o-transcribe" ? "gpt-4o" : "gpt-4o-mini";
        const gptResponse = await axios.post("https://api.openai.com/v1/chat/completions", {
          model: gptModel,
          messages: [
            {
              role: "system",
              content: `You are a professional Arabic-English bilingual transcription editor. Clean up the following mixed Arabic-English transcription by:
              1. Fixing grammar and punctuation in both Arabic and English
              2. Maintaining natural code-switching between Arabic and English
              3. Ensuring proper RTL formatting for Arabic text
              4. Adding proper paragraph breaks and structure
              5. Preserving the original speaker's intent and natural flow
              6. Do not translate - keep both languages as spoken`
            },
            {
              role: "user",
              content: `Please clean up and improve this Arabic-English mixed transcription while maintaining the code-switching:\n\n${rawTranscription}`
            }
          ],
          temperature: 0.2
        }, {
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        });

        transcription = gptResponse.data.choices[0]?.message?.content || rawTranscription;
      } catch (error: any) {
        console.error(`${gptModel} enhancement error:`, error.response?.data || error.message);
        // Fall back to standard Whisper if enhancement fails
        const fallbackFormData = new FormData();
        fallbackFormData.append("file", audioFile);
        fallbackFormData.append("model", "whisper-1");
        fallbackFormData.append("language", "ar");
        fallbackFormData.append("response_format", "text");
        fallbackFormData.append("prompt", "This audio contains Arabic and English. نصوص باللغة العربية والإنجليزية");

        const fallbackResponse = await axios.post("https://api.openai.com/v1/audio/transcriptions", fallbackFormData, {
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "multipart/form-data",
          },
        });
        transcription = fallbackResponse.data;
      }
    } else {
      // Standard Whisper transcription with Arabic-English support
      const openAIFormData = new FormData();
      openAIFormData.append("file", audioFile);
      openAIFormData.append("model", "whisper-1");
      openAIFormData.append("language", "ar"); // Set Arabic as primary language
      openAIFormData.append("response_format", "text");
      openAIFormData.append("prompt", "This audio contains Arabic and English mixed conversation. Please transcribe both languages accurately. نصوص باللغة العربية والإنجليزية");

      try {
        const response = await axios.post("https://api.openai.com/v1/audio/transcriptions", openAIFormData, {
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "multipart/form-data",
          },
        });
        transcription = response.data;
      } catch (error: any) {
        console.error("OpenAI API Error:", error.response?.data || error.message);
        
        if (error.response?.status === 401) {
          return NextResponse.json(
            { error: "Invalid API key" },
            { status: 401 }
          );
        }
        
        if (error.response?.status === 429) {
          return NextResponse.json(
            { error: "Rate limit exceeded. Please try again later." },
            { status: 429 }
          );
        }

        return NextResponse.json(
          { error: "Transcription failed. Please check your API key and try again." },
          { status: error.response?.status || 500 }
        );
      }
    }

    return NextResponse.json({
      transcription: transcription.trim(),
    });

  } catch (error) {
    console.error("Transcription error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}