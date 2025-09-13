"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";
import { AudioManager } from "@/components/AudioManager";
import Transcript from "@/components/Transcript";
import { useTranscriber } from "@/hooks/useTranscriber";

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
      <main className="flex-grow">
        <div className="container mx-auto px-4 pt-20 pb-12">
          <div className="max-w-4xl mx-auto">
            <div className='flex justify-center items-center min-h-[80vh]'>
              <div className='container flex flex-col justify-center items-center'>
                <h1 className='text-5xl font-extrabold tracking-tight text-white sm:text-7xl text-center mb-2'>
                  Whisper WebGPU
                </h1>
                <h2 className='mt-3 mb-5 px-4 text-center text-1xl font-semibold tracking-tight text-gray-200 sm:text-2xl'>
                  ML-powered speech recognition directly in your browser
                </h2>

                {/* Project Todo List */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6 mb-8 max-w-2xl">
                  <h3 className="text-xl font-semibold text-blue-400 mb-4">🚀 Project Roadmap</h3>
                  <div className="space-y-3 text-left">
                    <div className="flex items-center space-x-3">
                      <span className="text-green-400 text-lg">✅</span>
                      <span className="text-gray-200 line-through">Implement WebGPU-based Whisper model</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-green-400 text-lg">✅</span>
                      <span className="text-gray-200 line-through">Add real-time audio recording</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-green-400 text-lg">✅</span>
                      <span className="text-gray-200 line-through">Build browser-based transcription</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-yellow-400 text-lg">🟡</span>
                      <span className="text-gray-200">Add language detection</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-gray-400 text-lg">⭕</span>
                      <span className="text-gray-200">Implement offline model caching</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-gray-400 text-lg">⭕</span>
                      <span className="text-gray-200">Add export to various formats</span>
                    </div>
                  </div>
                </div>
                <AudioManager transcriber={transcriber} />
                <Transcript transcribedData={transcriber.output} />
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