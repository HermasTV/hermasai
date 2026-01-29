"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";
import { AudioManager } from "@/components/AudioManager";
import Transcript from "@/components/Transcript";
import { useTranscriber } from "@/hooks/useTranscriber";

// Force dynamic rendering for this page (WebGPU requires browser environment)
export const dynamic = 'force-dynamic';

export default function SpeechToTextPage() {
  const transcriber = useTranscriber();
  const [isWebGPUAvailable, setIsWebGPUAvailable] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
    if (typeof navigator !== 'undefined' && navigator.gpu) {
      setIsWebGPUAvailable(true);
    }
  }, []);

  if (!isClient) {
    return null; // Don't render anything during SSR
  }

  return isWebGPUAvailable ? (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/30">
      <Navbar />
      <main className="flex-grow overflow-hidden">
        <div className="container mx-auto px-4 pt-24 pb-4 h-[calc(100vh-96px)]">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className='text-3xl font-bold tracking-tight text-white sm:text-4xl mb-2'>
              Whisper WebGPU
            </h1>
            <h2 className='text-lg font-medium tracking-tight text-gray-200'>
              ML-powered speech recognition directly in your browser
            </h2>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100%-120px)]">

            {/* Left Panel - About Section */}
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5 backdrop-blur-sm overflow-y-auto">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-blue-400">🎯</span>
                About
              </h3>

              <div className="space-y-4">
                <div>
                  <h4 className="text-base font-semibold text-blue-400 mb-3">Technical Overview</h4>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    Browser-based AI using OpenAI's Whisper model optimized for WebGPU.
                    Performs real-time speech-to-text transcription entirely client-side.
                  </p>
                </div>

                <div>
                  <h4 className="text-base font-semibold text-purple-400 mb-3">Key Features</h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-center gap-2">
                      <span className="text-green-400">✓</span>
                      Real-time audio processing
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-400">✓</span>
                      WebGPU acceleration
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-400">✓</span>
                      Offline operation
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-400">✓</span>
                      Privacy-preserving
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-base font-semibold text-emerald-400 mb-3">Tech Stack</h4>
                  <div className="space-y-2">
                    <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-600/30">
                      <span className="text-blue-300 font-medium text-sm">Frontend:</span>
                      <p className="text-sm text-gray-400">Next.js 15, React 19, TypeScript</p>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-600/30">
                      <span className="text-purple-300 font-medium text-sm">ML Engine:</span>
                      <p className="text-sm text-gray-400">Transformers.js, ONNX Runtime</p>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-600/30">
                      <span className="text-emerald-300 font-medium text-sm">Performance:</span>
                      <p className="text-sm text-gray-400">WebGPU, Web Workers, WASM</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-base font-semibold text-orange-400 mb-3">Architecture</h4>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    Uses Web Workers for non-blocking ML inference, custom audio processing pipeline,
                    and optimized model loading with progressive enhancement for WebGPU-capable browsers.
                  </p>
                </div>
              </div>
            </div>

            {/* Center Panel - Controls and Transcript */}
            <div className="flex flex-col gap-4">
              {/* Audio Controls */}
              <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 backdrop-blur-sm">
                <AudioManager transcriber={transcriber} />
              </div>

              {/* Transcript Area */}
              <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 backdrop-blur-sm flex-1 min-h-0">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <span className="text-green-400">📝</span>
                  Transcript
                </h3>
                <div className="h-full overflow-y-auto">
                  <Transcript transcribedData={transcriber.output} />
                </div>
              </div>
            </div>

            {/* Right Panel - Roadmap */}
            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-5 backdrop-blur-sm overflow-y-auto">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-blue-400">🚀</span>
                Roadmap
              </h3>

              <div className="space-y-5">
                <div>
                  <h4 className="text-base font-semibold text-green-400 mb-3">✅ Completed</h4>
                  <div className="space-y-2">
                    <div className="text-sm text-gray-300 bg-green-500/10 px-3 py-2 rounded-md">WebGPU Whisper integration</div>
                    <div className="text-sm text-gray-300 bg-green-500/10 px-3 py-2 rounded-md">Real-time audio recording</div>
                    <div className="text-sm text-gray-300 bg-green-500/10 px-3 py-2 rounded-md">Browser transcription engine</div>
                  </div>
                </div>

                <div>
                  <h4 className="text-base font-semibold text-yellow-400 mb-3">🔄 In Progress</h4>
                  <div className="space-y-2">
                    <div className="text-sm text-gray-300 bg-yellow-500/10 px-3 py-2 rounded-md">Supporting other models beyond Whisper</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  ) : (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/30">
      <Navbar />
      <main className="flex-grow flex items-center justify-center">
        <div className='text-white text-2xl font-semibold flex flex-col justify-center items-center text-center max-w-md'>
          <h1 className='text-4xl mb-4'>WebGPU Not Supported</h1>
          <p className='text-lg text-gray-300'>WebGPU is not supported by this browser. Please use Chrome or Edge with WebGPU enabled.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}