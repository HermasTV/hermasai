import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";
import Link from "next/link";

export default function ProjectsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 pt-24 pb-8">
      <h1 className="text-4xl font-bold mb-8">Projects</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/projects/realtime-face" className="block group">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-transform duration-300 group-hover:scale-105 group-hover:shadow-lg">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-1">Real-time Face Detection</h3>
                <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Live Demo</span>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Browser-based face detection using ONNX.js and the UltraFace model. Runs completely client-side with real-time performance.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">ONNX.js</span>
              <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">Computer Vision</span>
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">WebRTC</span>
            </div>
          </div>
        </Link>

        <Link href="/projects/speech-to-text" className="block group">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-transform duration-300 group-hover:scale-105 group-hover:shadow-lg">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-1">Speech-to-Text</h3>
                <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Record & Process</span>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Browser-based speech recognition using OpenAI&apos;s Whisper Tiny model. Record audio and get accurate transcriptions completely client-side.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Whisper</span>
              <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">Speech Recognition</span>
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Audio Processing</span>
            </div>
          </div>
        </Link>
        
        <Link href="/projects/ai-meeting-summary" className="block group">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-transform duration-300 group-hover:scale-105 group-hover:shadow-lg">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-1">AI Meeting Summary</h3>
                <span className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">Upload & Transcribe</span>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Upload audio files and get AI-powered transcriptions using OpenAI's Whisper model. Perfect for meeting notes and audio content analysis.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">OpenAI Whisper</span>
              <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">Transcription</span>
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">File Upload</span>
            </div>
          </div>
        </Link>
        
        <Link href="/projects/resume-matcher" className="block group">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-transform duration-300 group-hover:scale-105 group-hover:shadow-lg">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-1">Resume-to-Job Matcher</h3>
                <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">AI Analysis</span>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Upload your resume and LinkedIn job URL to get AI-powered matching analysis, gap identification, and improvement suggestions.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">Resume Analysis</span>
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Job Matching</span>
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Career Insights</span>
            </div>
          </div>
        </Link>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 opacity-60">
          <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
          <p className="text-gray-600 dark:text-gray-300">
            More AI projects and demos will be showcased here.
          </p>
        </div>
      </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}