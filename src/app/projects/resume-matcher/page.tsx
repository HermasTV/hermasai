"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";
import { getApiUrl, API_CONFIG } from "@/utils/apiConfig";

interface AnalysisResult {
  match_percentage?: number;
  overall_assessment?: string;
  strengths?: string[];
  gaps?: string[];
  improvement_suggestions?: string[];
  keywords_to_add?: string[];
  sections_to_enhance?: string[];
  grammar_corrections?: { original: string; corrected: string; explanation: string }[];
  section_enhancements?: { section: string; current_text: string; improved_text: string; reasoning: string }[];
  skill_recommendations?: { category: string; skills: string[]; priority: 'high' | 'medium' | 'low' }[];
  experience_suggestions?: string[];
  course_recommendations?: { course: string; provider?: string; relevance: string }[];
}

export default function ResumeMatchPage() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobUrl, setJobUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [selectedModel, setSelectedModel] = useState("gpt-4o-mini");
  const [result, setResult] = useState("");
  const [parsedResult, setParsedResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Debug states
  const [jobContent, setJobContent] = useState("");
  const [resumeContent, setResumeContent] = useState("");
  const [isDebugging, setIsDebugging] = useState(false);
  
  // Conversion states (for PDF to DOCX only)
  const [isConverting, setIsConverting] = useState(false);
  const [conversionMessage, setConversionMessage] = useState("");

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setResumeFile(file);
      setError("");
    }
  };

  const handleAnalyze = async () => {
    if (!resumeFile || !apiKey.trim() || !jobUrl.trim()) {
      setError("Please upload a resume, enter API key, and provide a job URL");
      return;
    }

    setIsLoading(true);
    setError("");
    setResult("");
    setParsedResult(null);

    try {
      const formData = new FormData();
      formData.append("resume", resumeFile);
      formData.append("jobUrl", jobUrl);
      formData.append("apiKey", apiKey);
      formData.append("model", selectedModel);

      const response = await fetch("/api/resume-match", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Analysis failed");

      setResult(data.analysis);
      if (data.parsed) {
        setParsedResult(data.parsed);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDebugJob = async () => {
    if (!jobUrl.trim()) {
      setError("Please enter a job URL first");
      return;
    }

    setIsDebugging(true);
    setError("");
    
    try {
      const response = await fetch("/api/debug-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobUrl }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch job");
      }

      setJobContent(data.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Debug job fetch failed");
    } finally {
      setIsDebugging(false);
    }
  };

  const handleDebugResume = async () => {
    if (!resumeFile) {
      setError("Please select a resume file first");
      return;
    }

    setIsDebugging(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("resume", resumeFile);

      const apiUrl = getApiUrl(API_CONFIG.PDF_CONVERTER.ENDPOINTS.DEBUG_RESUME);
      const response = await fetch(apiUrl, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to parse resume");
      }

      setResumeContent(data.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Debug resume parse failed");
    } finally {
      setIsDebugging(false);
    }
  };






  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-purple-900/20 to-blue-900/30">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl mb-4">
                Resume-to-Job Match Analyzer
              </h1>
              <p className="text-xl text-gray-200 max-w-2xl mx-auto">
                Upload your resume, paste a LinkedIn job URL, and get AI-powered suggestions to improve your resume match.
              </p>
            </div>

            {/* Project Todo List */}
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-6 mb-8">
              <h2 className="text-2xl font-semibold text-purple-400 mb-4">🚀 Project Roadmap</h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <span className="text-green-400 text-xl">✅</span>
                  <span className="text-gray-200 line-through">Add PDF and DOCX reader</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-green-400 text-xl">✅</span>
                  <span className="text-gray-200 line-through">Add PDF-DOCX debugger and converter</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-red-400 text-xl">🔄</span>
                  <span className="text-gray-200">Reconnect PDF parsing to documents-services</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-red-400 text-xl">🔄</span>
                  <span className="text-gray-200">Reconnect analysis API to documents-services</span>
                </div>
              </div>
            </div>

            {/* Service Migration Notice */}
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-yellow-400 mb-3">🚧 Service Migration Notice</h2>
              <p className="text-gray-200 mb-2">
                PDF processing and resume analysis features have been moved to a separate documents-services repository for better modularity.
              </p>
              <p className="text-gray-300 text-sm">
                These features will be reconnected to the new EC2-hosted service soon. Stay tuned!
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 space-y-6">
              {/* API Key */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">OpenAI API Key</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white"
                />
              </div>

              {/* Model Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Model</label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white"
                >
                  <option value="gpt-4o-mini">GPT-4o Mini (Fast & Cheap)</option>
                  <option value="gpt-4o">GPT-4o (Balanced)</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Economy)</option>
                </select>
              </div>

              {/* Job URL */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">LinkedIn Job URL</label>
                <input
                  type="url"
                  value={jobUrl}
                  onChange={(e) => setJobUrl(e.target.value)}
                  placeholder="https://www.linkedin.com/jobs/view/..."
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white"
                />
              </div>

              {/* Resume Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Resume File</label>
                <input
                  type="file"
                  accept=".pdf,.txt,.doc,.docx"
                  onChange={handleFileUpload}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-600 file:text-white file:cursor-pointer hover:file:bg-purple-700"
                />
                {resumeFile && (
                  <p className="text-sm text-green-400 mt-2">
                    Selected: {resumeFile.name} ({(resumeFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  Supported formats: PDF, TXT, DOC, DOCX
                </p>
              </div>

              {/* Debug Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={handleDebugJob}
                  disabled={isDebugging || !jobUrl.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  {isDebugging ? "Fetching..." : "🔍 Debug Job Fetch"}
                </button>
                <button
                  onClick={handleDebugResume}
                  disabled={isDebugging || !resumeFile}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  {isDebugging ? "Parsing..." : "📄 Debug Resume Parse"}
                </button>
              </div>


              {/* Analyze Button */}
              <button
                onClick={handleAnalyze}
                disabled={isLoading || !resumeFile || !apiKey.trim() || !jobUrl.trim()}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                {isLoading ? "Analyzing Resume..." : "Analyze Resume Match"}
              </button>

              {/* Error */}
              {error && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
                  <p className="text-red-200">{error}</p>
                </div>
              )}


              {/* Results */}
              {parsedResult && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-semibold text-white mb-4">📊 Analysis Results</h3>
                  
                  {/* Match Score */}
                  <div className="bg-white/5 border border-white/20 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xl font-semibold text-white">Match Score</h4>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-purple-400">
                          {parsedResult.match_percentage ?? 0}%
                        </div>
                        <div className="text-sm text-gray-400">
                          {(parsedResult.match_percentage ?? 0) >= 80 ? "Excellent Match" :
                           (parsedResult.match_percentage ?? 0) >= 70 ? "Good Match" :
                           (parsedResult.match_percentage ?? 0) >= 60 ? "Fair Match" : "Needs Work"}
                        </div>
                      </div>
                    </div>
                    {parsedResult.overall_assessment && (
                      <p className="text-gray-200 leading-relaxed">{parsedResult.overall_assessment}</p>
                    )}
                  </div>

                  {/* Strengths */}
                  {parsedResult.strengths && parsedResult.strengths.length > 0 && (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6">
                      <h4 className="text-xl font-semibold text-green-400 mb-4">✅ Your Strengths</h4>
                      <ul className="space-y-2">
                        {parsedResult.strengths.map((strength, index) => (
                          <li key={index} className="text-gray-200 flex items-start">
                            <span className="text-green-400 mr-2">•</span>
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Gaps */}
                  {parsedResult.gaps && parsedResult.gaps.length > 0 && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
                      <h4 className="text-xl font-semibold text-red-400 mb-4">⚠️ Areas to Address</h4>
                      <ul className="space-y-2">
                        {parsedResult.gaps.map((gap, index) => (
                          <li key={index} className="text-gray-200 flex items-start">
                            <span className="text-red-400 mr-2">•</span>
                            {gap}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Improvement Suggestions */}
                  {parsedResult.improvement_suggestions && parsedResult.improvement_suggestions.length > 0 && (
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
                      <h4 className="text-xl font-semibold text-blue-400 mb-4">💡 Improvement Suggestions</h4>
                      <ul className="space-y-2">
                        {parsedResult.improvement_suggestions.map((suggestion, index) => (
                          <li key={index} className="text-gray-200 flex items-start">
                            <span className="text-blue-400 mr-2">•</span>
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Keywords to Add */}
                  {parsedResult.keywords_to_add && parsedResult.keywords_to_add.length > 0 && (
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6">
                      <h4 className="text-xl font-semibold text-yellow-400 mb-4">🔑 Keywords to Include</h4>
                      <div className="flex flex-wrap gap-2">
                        {parsedResult.keywords_to_add.map((keyword, index) => (
                          <span key={index} className="bg-yellow-500/20 text-yellow-200 px-3 py-1 rounded-full text-sm">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Copy Raw Results */}
                  <div className="bg-white/5 border border-white/20 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-medium text-gray-400">Raw Analysis</h4>
                      <button
                        onClick={() => navigator.clipboard.writeText(result)}
                        className="text-xs bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                    <pre className="text-xs text-gray-300 whitespace-pre-wrap leading-relaxed max-h-32 overflow-y-auto">
                      {result}
                    </pre>
                  </div>
                  
                </div>
              )}

              {/* Grammar Corrections */}
              {parsedResult?.grammar_corrections && parsedResult.grammar_corrections.length > 0 && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
                  <h4 className="text-xl font-semibold text-red-400 mb-4">📝 Grammar & Language Corrections</h4>
                  <div className="space-y-4">
                    {parsedResult.grammar_corrections.map((correction, index) => (
                      <div key={index} className="bg-white/5 border border-white/10 rounded-lg p-4">
                        <div className="mb-2">
                          <span className="text-red-300 text-sm font-medium">Original:</span>
                          <div className="bg-red-900/30 p-2 rounded mt-1 text-gray-200">
                            {correction.original}
                          </div>
                        </div>
                        <div className="mb-2">
                          <span className="text-green-300 text-sm font-medium">Corrected:</span>
                          <div className="bg-green-900/30 p-2 rounded mt-1 text-gray-200 relative">
                            {correction.corrected}
                            <button
                              onClick={() => navigator.clipboard.writeText(correction.corrected)}
                              className="absolute top-1 right-1 bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 rounded transition-colors"
                            >
                              Copy
                            </button>
                          </div>
                        </div>
                        <div className="text-xs text-gray-400">
                          <strong>Explanation:</strong> {correction.explanation}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Section Enhancements */}
              {parsedResult?.section_enhancements && parsedResult.section_enhancements.length > 0 && (
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-6">
                  <h4 className="text-xl font-semibold text-purple-400 mb-4">✨ Section Enhancements</h4>
                  <div className="space-y-6">
                    {parsedResult.section_enhancements.map((enhancement, index) => (
                      <div key={index} className="bg-white/5 border border-white/10 rounded-lg p-4">
                        <h5 className="text-lg font-medium text-purple-300 mb-3">{enhancement.section}</h5>
                        
                        <div className="mb-3">
                          <span className="text-orange-300 text-sm font-medium">Current version:</span>
                          <div className="bg-orange-900/20 p-3 rounded mt-1 text-gray-200 text-sm">
                            {enhancement.current_text}
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <span className="text-green-300 text-sm font-medium">Enhanced version:</span>
                          <div className="bg-green-900/20 p-3 rounded mt-1 text-gray-200 text-sm relative">
                            {enhancement.improved_text}
                            <button
                              onClick={() => navigator.clipboard.writeText(enhancement.improved_text)}
                              className="absolute top-2 right-2 bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 rounded transition-colors"
                            >
                              Copy Enhanced Text
                            </button>
                          </div>
                        </div>
                        
                        <div className="text-xs text-blue-300">
                          <strong>Why this is better:</strong> {enhancement.reasoning}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skill Recommendations */}
              {parsedResult?.skill_recommendations && parsedResult.skill_recommendations.length > 0 && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
                  <h4 className="text-xl font-semibold text-blue-400 mb-4">🎯 Skills to Develop</h4>
                  <div className="space-y-4">
                    {parsedResult.skill_recommendations.map((skillGroup, index) => (
                      <div key={index} className="bg-white/5 border border-white/10 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="text-lg font-medium text-blue-300">{skillGroup.category}</h5>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            skillGroup.priority === 'high' ? 'bg-red-500/20 text-red-300' :
                            skillGroup.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                            'bg-green-500/20 text-green-300'
                          }`}>
                            {skillGroup.priority.toUpperCase()} PRIORITY
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {skillGroup.skills.map((skill, skillIndex) => (
                            <span key={skillIndex} className="bg-blue-500/20 text-blue-200 px-2 py-1 rounded text-sm cursor-pointer hover:bg-blue-500/30 transition-colors"
                                  onClick={() => navigator.clipboard.writeText(skill)}
                                  title="Click to copy">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience & Course Recommendations */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Experience Suggestions */}
                {parsedResult?.experience_suggestions && parsedResult.experience_suggestions.length > 0 && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6">
                    <h4 className="text-xl font-semibold text-yellow-400 mb-4">💼 Experience to Highlight</h4>
                    <ul className="space-y-3">
                      {parsedResult.experience_suggestions.map((suggestion, index) => (
                        <li key={index} className="text-gray-200 bg-white/5 p-3 rounded border-l-4 border-yellow-500 relative">
                          {suggestion}
                          <button
                            onClick={() => navigator.clipboard.writeText(suggestion)}
                            className="absolute top-2 right-2 bg-yellow-600 hover:bg-yellow-700 text-white text-xs px-2 py-1 rounded transition-colors"
                          >
                            Copy
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Course Recommendations */}
                {parsedResult?.course_recommendations && parsedResult.course_recommendations.length > 0 && (
                  <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-6">
                    <h4 className="text-xl font-semibold text-indigo-400 mb-4">🎓 Recommended Courses</h4>
                    <div className="space-y-3">
                      {parsedResult.course_recommendations.map((course, index) => (
                        <div key={index} className="bg-white/5 p-3 rounded border border-white/10">
                          <div className="font-medium text-indigo-300 mb-1">{course.course}</div>
                          {course.provider && (
                            <div className="text-sm text-gray-400 mb-2">Provider: {course.provider}</div>
                          )}
                          <div className="text-sm text-gray-300">{course.relevance}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Debug Results */}
              {jobContent && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">🔍 Job Content Debug:</h3>
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 max-h-64 overflow-y-auto">
                    <pre className="text-blue-200 whitespace-pre-wrap text-sm leading-relaxed">{jobContent}</pre>
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(jobContent)}
                    className="mt-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-1 px-3 rounded transition-colors"
                  >
                    Copy Job Content
                  </button>
                </div>
              )}

              {resumeContent && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">📄 Resume Content Debug:</h3>
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 max-h-64 overflow-y-auto">
                    <pre className="text-green-200 whitespace-pre-wrap text-sm leading-relaxed">{resumeContent}</pre>
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(resumeContent)}
                    className="mt-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-1 px-3 rounded transition-colors"
                  >
                    Copy Resume Content
                  </button>
                </div>
              )}

              {/* Fallback for non-parsed results */}
              {result && !parsedResult && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Analysis Result:</h3>
                  <div className="bg-white/5 border border-white/20 rounded-lg p-4 max-h-96 overflow-y-auto">
                    <pre className="text-gray-200 whitespace-pre-wrap leading-relaxed">{result}</pre>
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(result)}
                    className="mt-3 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Copy Analysis
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
