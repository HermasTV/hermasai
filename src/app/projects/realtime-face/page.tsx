"use client";

import { useEffect, useRef, useState } from "react";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";
import * as ort from "onnxruntime-web/webgpu";
import { processOutputs, preprocess } from "@/components/ultraface/ultraface";

export default function RealtimeFacePage() {
  const [modelLoaded, setModelLoaded] = useState(false);
  const [loadingError, setLoadingError] = useState("");
  const [fps, setFps] = useState(0);
  const [isWebGPUAvailable, setIsWebGPUAvailable] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modelRef = useRef<ort.InferenceSession | null>(null);
  const lastUpdateTimeRef = useRef(Date.now());
  const frameTimes = useRef<number[]>([]);
  const [spinnerStyle, setSpinnerStyle] = useState({
    display: "none",
    width: "100px",
    height: "100px",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
  });

  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.gpu) {
      setIsWebGPUAvailable(true);
    }

    async function loadModel() {
      try {
        ort.env.wasm.wasmPaths = "/";
        // @ts-expect-error - This works fine at runtime, TypeScript types are overly strict
        const session = await ort.InferenceSession.create("/ultraface.onnx", {
          executionProviders: ["webgpu", "wasm", "webgl"],
          numThreads: 1,
        });
        modelRef.current = session;
        setModelLoaded(true);
        console.log("Model loaded successfully:", session);
      } catch (error) {
        setLoadingError("Failed to load the model");
      }
    }
    loadModel();
  }, []);

  useEffect(() => {
    async function setupWebcam() {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices) return;
      
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240 },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            processVideo();
          };
        }
      } catch (error) {
        console.error("Error accessing webcam:", error);
        setLoadingError("Failed to access webcam");
      }
    }
    if (modelLoaded) {
      setupWebcam();
    }
  }, [modelLoaded]);

  async function processVideo() {
    if (videoRef.current && canvasRef.current && modelRef.current && modelLoaded) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      const session = modelRef.current;

      if (!context) return;

      const videoRect = video.getBoundingClientRect();
      context.save();
      context.scale(-1, 1);
      context.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
      context.restore();

      const mirroredFrame = context.getImageData(0, 0, canvas.width, canvas.height);
      const inputTensor = preprocess(mirroredFrame, canvas.width, canvas.height);
      const detections = await processOutputs(session, inputTensor, canvas);

      if (detections.length > 0) {
        const [x1, y1, x2, y2] = detections[0].box;
        const scaleX = videoRect.width / canvas.width;
        const scaleY = videoRect.height / canvas.height;

        const centerX = ((x1 + x2) / 2) * scaleX;
        const centerY = ((y1 + y2) / 2) * scaleY;
        const radius = Math.min(((x2 - x1) / 2) * scaleX, ((y2 - y1) / 2) * scaleY);

        const now = Date.now();
        if (now - lastUpdateTimeRef.current > 100) {
          lastUpdateTimeRef.current = now;
          setSpinnerStyle({
            display: "block",
            top: `${centerY - radius}px`,
            left: `${centerX - radius}px`,
            width: `${radius * 2}px`,
            height: `${radius * 2}px`,
            transform: "translate(0, 0)",
          });
        }
      } else {
        setSpinnerStyle({ ...spinnerStyle, display: "none" });
      }

      const now = performance.now();
      frameTimes.current.push(now);

      if (frameTimes.current.length > 60) {
        frameTimes.current.shift();
      }

      const currentFps =
        frameTimes.current.length /
        ((frameTimes.current[frameTimes.current.length - 1] - frameTimes.current[0]) / 1000);
      setFps(Number(currentFps.toFixed(2)));

      requestAnimationFrame(processVideo);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/30">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 pt-20 pb-12">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-8 border border-white/20">
              <h1 className="text-4xl font-bold mb-4 text-white">Real-time Face Detection Demo</h1>
              <p className="text-gray-200 mb-4">
                This demo uses the UltraFace model to detect faces in real-time using your webcam.
                The model is loaded using ONNX Runtime Web and executed on the GPU using WebGPU when available.
                On Firefox, WebGL is used as a fallback, or CPU execution if neither is supported.
              </p>

              {/* Project Todo List */}
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-6">
                <h2 className="text-lg font-semibold text-green-400 mb-3">🚀 Project Roadmap</h2>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-green-400 text-sm">✅</span>
                    <span className="text-gray-200 line-through text-sm">Implement UltraFace ONNX model integration</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-green-400 text-sm">✅</span>
                    <span className="text-gray-200 line-through text-sm">Add WebGPU acceleration support</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-green-400 text-sm">✅</span>
                    <span className="text-gray-200 line-through text-sm">Build real-time video processing pipeline</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-yellow-400 text-sm">🟡</span>
                    <span className="text-gray-200 text-sm">Add facial landmark detection</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-400 text-sm">⭕</span>
                    <span className="text-gray-200 text-sm">Implement face recognition features</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-400 text-sm">⭕</span>
                    <span className="text-gray-200 text-sm">Add emotion detection capabilities</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-black/20 rounded-lg p-4">
                  <div className="text-sm text-gray-300">Model Status</div>
                  <div className="text-lg font-semibold text-white">
                    {loadingError ? "Error" : modelLoaded ? "Loaded" : "Loading..."}
                  </div>
                </div>
                <div className="bg-black/20 rounded-lg p-4">
                  <div className="text-sm text-gray-300">Device</div>
                  <div className="text-lg font-semibold text-white">
                    {isWebGPUAvailable ? "GPU" : "CPU"}
                  </div>
                </div>
                <div className="bg-black/20 rounded-lg p-4">
                  <div className="text-sm text-gray-300">FPS</div>
                  <div className="text-lg font-semibold text-white">{fps}</div>
                </div>
              </div>

              {loadingError && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-6">
                  <p className="text-red-200">{loadingError}</p>
                </div>
              )}
            </div>

            <div className="flex justify-center">
              <div className="relative">
                <div className="bg-gray-800 rounded-2xl p-8 shadow-2xl">
                  <div className="relative bg-black rounded-lg overflow-hidden" style={{ width: 640, height: 480 }}>
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      className="w-full h-full object-cover transform -scale-x-100"
                    />
                    <div 
                      className="absolute pointer-events-none"
                      style={spinnerStyle}
                    >
                      <svg viewBox="0 0 100 100" className="w-full h-full">
                        <defs>
                          <filter id="shadow">
                            <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#3b82f6" />
                          </filter>
                        </defs>
                        <circle 
                          cx="50" 
                          cy="50" 
                          r="45"
                          fill="transparent"
                          stroke="#3b82f6"
                          strokeWidth="4"
                          strokeLinecap="round"
                          filter="url(#shadow)"
                          className="animate-spin"
                          style={{
                            strokeDasharray: "80 20",
                            transformOrigin: "center",
                            animation: "spin 1.2s linear infinite"
                          }}
                        />
                      </svg>
                    </div>
                    <canvas 
                      ref={canvasRef} 
                      width="320" 
                      height="240" 
                      className="hidden"
                    />
                  </div>
                  
                  <div className="mt-4 flex justify-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <h2 className="text-2xl font-semibold text-white mb-4">Technical Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-200">
                <div>
                  <h3 className="text-lg font-semibold text-blue-300 mb-2">Model Architecture</h3>
                  <ul className="space-y-1 text-sm">
                    <li>• UltraFace: Lightweight face detection model</li>
                    <li>• Input: 320x240 RGB images</li>
                    <li>• Output: Bounding boxes and confidence scores</li>
                    <li>• Post-processing: Non-Maximum Suppression</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-300 mb-2">Performance</h3>
                  <ul className="space-y-1 text-sm">
                    <li>• WebGPU acceleration when available</li>
                    <li>• WebGL fallback for broader compatibility</li>
                    <li>• Client-side inference (no server required)</li>
                    <li>• Real-time processing at ~30 FPS</li>
                  </ul>
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