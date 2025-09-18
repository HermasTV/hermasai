"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";

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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-green-900/20 to-blue-900/30">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl mb-4">
                AI Meeting Summary
              </h1>
              <p className="text-xl text-gray-200 max-w-2xl mx-auto">
                Upload an audio file and get AI-powered transcription using OpenAI's latest models
              </p>
            </div>

            {/* Project Todo List */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6 mb-8">
              <h2 className="text-2xl font-semibold text-blue-400 mb-4">🚀 Project Roadmap</h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <span className="text-green-400 text-xl">✅</span>
                  <span className="text-gray-200 line-through">Add speech to text module using API</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-yellow-400 text-xl">🟡</span>
                  <span className="text-gray-200">Add speaker diarization</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-gray-400 text-xl">⭕</span>
                  <span className="text-gray-200">Develop summarization feature</span>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 space-y-6">
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
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Your API key is only used for this request and not stored
                </p>
              </div>

              {/* Model Selection */}
              <div>
                <label htmlFor="model" className="block text-sm font-medium text-gray-200 mb-2">
                  Transcription Model
                </label>
                <select
                  id="model"
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="whisper-1" className="bg-gray-800 text-white">
                    Whisper-1 (Standard)
                  </option>
                  <option value="gpt-4o-mini-transcribe" className="bg-gray-800 text-white">
                    GPT-4o Mini Transcribe (Advanced)
                  </option>
                  <option value="gpt-4o-transcribe" className="bg-gray-800 text-white">
                    GPT-4o Transcribe (Premium)
                  </option>
                </select>
                <p className="text-xs text-gray-400 mt-1">
                  {selectedModel === "whisper-1" 
                    ? "OpenAI's standard Whisper model for speech recognition"
                    : selectedModel === "gpt-4o-mini-transcribe"
                    ? "Advanced transcription with GPT-4o Mini for better accuracy"
                    : "Premium transcription with GPT-4o for highest quality and multilingual support"
                  }
                </p>
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
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white file:cursor-pointer hover:file:bg-blue-700"
                />
                {audioFile && (
                  <p className="text-sm text-green-400 mt-2">
                    Selected: {audioFile.name} ({(audioFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>

              {/* Transcribe Button */}
              <button
                onClick={handleTranscribe}
                disabled={isLoading || !audioFile || !apiKey.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                {isLoading ? "Transcribing..." : "Transcribe Audio"}
              </button>

              {/* Error Display */}
              {error && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
                  <p className="text-red-200">{error}</p>
                </div>
              )}

              {/* Transcription Results */}
              {transcription && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Transcription:</h3>
                  <div className="bg-white/5 border border-white/20 rounded-lg p-4 max-h-96 overflow-y-auto">
                    <p className="text-gray-200 whitespace-pre-wrap leading-relaxed">
                      {transcription}
                    </p>
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(transcription)}
                    className="mt-3 bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Copy to Clipboard
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