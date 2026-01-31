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
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className='text-3xl font-bold tracking-tight text-white sm:text-4xl mb-2'>
              UltraFace Detection
            </h1>
            <h2 className='text-lg font-medium tracking-tight text-gray-200'>
              Real-time face detection using WebGPU acceleration
            </h2>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left Panel - About Section */}
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 backdrop-blur-sm">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-blue-400">🎯</span>
                About
              </h3>

              <div className="space-y-4">
                <div>
                  <h4 className="text-base font-semibold text-blue-400 mb-2">Technical Overview</h4>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    Real-time face detection using UltraFace ONNX model with WebGPU acceleration.
                    Processes webcam video at 30+ FPS entirely client-side for privacy.
                  </p>
                </div>

                <div>
                  <h4 className="text-base font-semibold text-purple-400 mb-2">Key Features</h4>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li className="flex items-center gap-2">
                      <span className="text-green-400">✓</span>
                      Real-time video processing
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-400">✓</span>
                      WebGPU acceleration
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-400">✓</span>
                      Client-side inference
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-400">✓</span>
                      Privacy-preserving
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-base font-semibold text-emerald-400 mb-2">Tech Stack</h4>
                  <div className="space-y-2">
                    <div className="bg-gray-900/50 rounded-lg p-2 border border-gray-600/30">
                      <span className="text-blue-300 font-medium text-sm">Model:</span>
                      <p className="text-sm text-gray-400">UltraFace ONNX, 320x240 input</p>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-2 border border-gray-600/30">
                      <span className="text-purple-300 font-medium text-sm">Runtime:</span>
                      <p className="text-sm text-gray-400">ONNX Runtime Web, WebGPU</p>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-2 border border-gray-600/30">
                      <span className="text-emerald-300 font-medium text-sm">Processing:</span>
                      <p className="text-sm text-gray-400">NMS, Real-time inference</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-base font-semibold text-orange-400 mb-2">Architecture</h4>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    Webcam frames are preprocessed, fed to UltraFace model for face detection,
                    and post-processed with Non-Maximum Suppression for accurate bounding boxes.
                  </p>
                </div>
              </div>
            </div>

            {/* Center Panel - Video Feed and Status */}
            <div className="flex flex-col gap-4">
              {/* Status Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4 backdrop-blur-sm">
                  <div className="text-xs text-gray-400">Status</div>
                  <div className="text-sm font-semibold text-white">
                    {loadingError ? "Error" : modelLoaded ? "Loaded" : "Loading..."}
                  </div>
                </div>
                <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4 backdrop-blur-sm">
                  <div className="text-xs text-gray-400">Device</div>
                  <div className="text-sm font-semibold text-white">
                    {isWebGPUAvailable ? "GPU" : "CPU"}
                  </div>
                </div>
                <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4 backdrop-blur-sm">
                  <div className="text-xs text-gray-400">FPS</div>
                  <div className="text-sm font-semibold text-white">{fps}</div>
                </div>
              </div>

              {/* Video Feed */}
              <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 backdrop-blur-sm flex items-center justify-center">
                {loadingError ? (
                  <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
                    <p className="text-red-200 text-sm">{loadingError}</p>
                  </div>
                ) : (
                  <div className="relative w-full max-w-2xl">
                    <div className="bg-gray-900 rounded-lg p-4 shadow-xl">
                      <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
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

                      <div className="mt-3 flex justify-center space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel - Roadmap */}
            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-6 backdrop-blur-sm">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-green-400">🚀</span>
                Roadmap
              </h3>

              <div className="space-y-4">
                <div>
                  <h4 className="text-base font-semibold text-green-400 mb-2">✅ Completed</h4>
                  <div className="space-y-1">
                    <div className="text-sm text-gray-300 bg-green-500/10 px-2 py-1 rounded-md">UltraFace ONNX integration</div>
                    <div className="text-sm text-gray-300 bg-green-500/10 px-2 py-1 rounded-md">WebGPU acceleration</div>
                    <div className="text-sm text-gray-300 bg-green-500/10 px-2 py-1 rounded-md">Real-time video pipeline</div>
                  </div>
                </div>

                <div>
                  <h4 className="text-base font-semibold text-yellow-400 mb-2">🔄 In Progress</h4>
                  <div className="space-y-1">
                    <div className="text-sm text-gray-300 bg-yellow-500/10 px-2 py-1 rounded-md">Facial landmark detection</div>
                  </div>
                </div>

                <div>
                  <h4 className="text-base font-semibold text-gray-400 mb-2">⏳ Planned</h4>
                  <div className="space-y-1">
                    <div className="text-sm text-gray-300 bg-gray-500/10 px-2 py-1 rounded-md">Face recognition features</div>
                    <div className="text-sm text-gray-300 bg-gray-500/10 px-2 py-1 rounded-md">Emotion detection</div>
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