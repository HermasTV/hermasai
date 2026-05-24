"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";
import LogosBackground from "@/components/logos-background";

export default function AIMeetingSummaryPage() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [selectedModel, setSelectedModel] = useState("whisper-1");
  const [transcription, setTranscription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAudioFile(file);
      setError("");
    }
  };

  const handleTranscribe = async () => {
    if (!audioFile || !apiKey.trim()) {
      setError("Please select an audio file and enter your OpenAI API key");
      return;
    }

    setIsLoading(true);
    setError("");
    setTranscription("");

    try {
      const formData = new FormData();
      formData.append("audio", audioFile);
      formData.append("apiKey", apiKey);
      formData.append("model", selectedModel);

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Transcription failed");
      }

      setTranscription(data.transcription);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <LogosBackground />
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 pt-8 pb-12 sm:pt-12 max-w-7xl">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-10">
            <h1 className='text-3xl sm:text-4xl font-bold tracking-tight text-white mb-2'>
              AI Meeting Summary
            </h1>
            <h2 className='text-base sm:text-lg font-medium tracking-tight text-gray-300 max-w-2xl mx-auto'>
              AI-powered transcription using OpenAI&apos;s latest models
            </h2>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left Panel - About Section */}
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5 sm:p-6 backdrop-blur-sm">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-blue-400">🎯</span>
                About
              </h3>

              <div className="space-y-4">
                <div>
                  <h4 className="text-base font-semibold text-blue-400 mb-3">Technical Overview</h4>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    AI-powered meeting transcription service using OpenAI's advanced speech-to-text models.
                    Upload audio files and get accurate transcriptions with multiple model options.
                  </p>
                </div>

                <div>
                  <h4 className="text-base font-semibold text-purple-400 mb-3">Key Features</h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-center gap-2">
                      <span className="text-green-400">✓</span>
                      Multiple OpenAI model support
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-400">✓</span>
                      High-accuracy transcription
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-400">✓</span>
                      API key privacy protection
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-400">✓</span>
                      Multiple audio format support
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-base font-semibold text-emerald-400 mb-3">Available Models</h4>
                  <div className="space-y-2">
                    <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-600/30">
                      <span className="text-blue-300 font-medium text-sm">Whisper-1:</span>
                      <p className="text-sm text-gray-400">Standard speech recognition</p>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-600/30">
                      <span className="text-purple-300 font-medium text-sm">GPT-4o Mini:</span>
                      <p className="text-sm text-gray-400">Advanced transcription</p>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-600/30">
                      <span className="text-emerald-300 font-medium text-sm">GPT-4o:</span>
                      <p className="text-sm text-gray-400">Premium quality & multilingual</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-base font-semibold text-orange-400 mb-3">Architecture</h4>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    File upload with secure API key handling, server-side OpenAI API integration,
                    and real-time transcription processing with copy-to-clipboard functionality.
                  </p>
                </div>
              </div>
            </div>

            {/* Center Panel - Controls and Transcription */}
            <div className="flex flex-col gap-4 lg:gap-6 min-w-0">
              {/* Input Controls */}
              <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 sm:p-5 backdrop-blur-sm space-y-4">
                {/* API Key Input */}
                <div>
                  <label htmlFor="apiKey" className="block text-sm font-medium text-gray-200 mb-2">
                    OpenAI API Key
                  </label>
                  <input
                    type="password"
                    id="apiKey"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-..."
                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Your API key is only used for this request and not stored
                  </p>
                </div>

                {/* Model Selection */}
                <div>
                  <label htmlFor="model" className="block text-sm font-medium text-gray-200 mb-2">
                    Model
                  </label>
                  <select
                    id="model"
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="whisper-1" className="bg-gray-800 text-white">
                      Whisper-1 (Standard)
                    </option>
                    <option value="gpt-4o-mini-transcribe" className="bg-gray-800 text-white">
                      GPT-4o Mini (Advanced)
                    </option>
                    <option value="gpt-4o-transcribe" className="bg-gray-800 text-white">
                      GPT-4o (Premium)
                    </option>
                  </select>
                </div>

                {/* Audio File Upload */}
                <div>
                  <label htmlFor="audioFile" className="block text-sm font-medium text-gray-200 mb-2">
                    Audio File
                  </label>
                  <input
                    type="file"
                    id="audioFile"
                    accept="audio/*"
                    onChange={handleFileUpload}
                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:bg-blue-600 file:text-white file:cursor-pointer hover:file:bg-blue-700 file:text-sm"
                  />
                  {audioFile && (
                    <p className="text-xs text-green-400 mt-1">
                      Selected: {audioFile.name} ({(audioFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>

                {/* Transcribe Button */}
                <button
                  onClick={handleTranscribe}
                  disabled={isLoading || !audioFile || !apiKey.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
                >
                  {isLoading ? "Transcribing..." : "Transcribe Audio"}
                </button>

                {/* Error Display */}
                {error && (
                  <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
                    <p className="text-red-200 text-sm">{error}</p>
                  </div>
                )}
              </div>

              {/* Transcription Results */}
              <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 sm:p-5 backdrop-blur-sm flex-1 min-h-[280px] flex flex-col">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <span className="text-green-400">📝</span>
                  Transcription
                </h3>
                {transcription ? (
                  <div className="flex flex-col flex-1 min-h-0">
                    <div className="bg-gray-900/50 border border-gray-600/30 rounded-lg p-4 flex-1 overflow-y-auto">
                      <p className="text-gray-200 whitespace-pre-wrap leading-relaxed text-sm">
                        {transcription}
                      </p>
                    </div>
                    <button
                      onClick={() => navigator.clipboard.writeText(transcription)}
                      className="mt-3 bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors self-start"
                    >
                      Copy to Clipboard
                    </button>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <p className="text-gray-400 text-sm text-center">Upload an audio file and start transcribing to see results here</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel - Roadmap */}
            <div className="bg-gradient-to-br from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-xl p-5 sm:p-6 backdrop-blur-sm">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-green-400">🚀</span>
                Roadmap
              </h3>

              <div className="space-y-5">
                <div>
                  <h4 className="text-base font-semibold text-green-400 mb-3">✅ Completed</h4>
                  <div className="space-y-2">
                    <div className="text-sm text-gray-300 bg-green-500/10 px-3 py-2 rounded-md">Add speech to text module using API</div>
                  </div>
                </div>

                <div>
                  <h4 className="text-base font-semibold text-yellow-400 mb-3">🔄 In Progress</h4>
                  <div className="space-y-2">
                    <div className="text-sm text-gray-300 bg-yellow-500/10 px-3 py-2 rounded-md">Add speaker diarization</div>
                  </div>
                </div>

                <div>
                  <h4 className="text-base font-semibold text-gray-400 mb-3">⏳ Planned</h4>
                  <div className="space-y-2">
                    <div className="text-sm text-gray-300 bg-gray-500/10 px-3 py-2 rounded-md">Develop summarization feature</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}