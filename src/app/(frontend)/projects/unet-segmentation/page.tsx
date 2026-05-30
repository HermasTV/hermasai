"use client";

import { useEffect, useRef, useState } from "react";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";
import LogosBackground from "@/components/logos-background";
import * as ort from "onnxruntime-web/webgpu";

interface SegmentationResult {
  mask: ImageData;
  inferenceTime: number;
}

interface LayerVisualization {
  name: string;
  featureMaps: ImageData[];
  channels: number;
}

export default function UNetSegmentationPage() {
  const [modelLoaded, setModelLoaded] = useState(false);
  const [loadingError, setLoadingError] = useState("");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [segmentationResult, setSegmentationResult] = useState<SegmentationResult | null>(null);
  const [layerVisualization, setLayerVisualization] = useState<LayerVisualization | null>(null);
  const [selectedLayer, setSelectedLayer] = useState<string>("");
  const [selectedChannel, setSelectedChannel] = useState<number>(0);
  const [showLayerViz, setShowLayerViz] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isWebGPUAvailable, setIsWebGPUAvailable] = useState(false);
  const modelRef = useRef<ort.InferenceSession | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const layerCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.gpu) {
      setIsWebGPUAvailable(true);
    }

    async function loadModel() {
      try {
        ort.env.wasm.wasmPaths = "/";

        // Using single DeepLabV3-Plus-MobileNet.onnx model file
        const modelPath = "/models/DeepLabV3-Plus-MobileNet.onnx";

        const session = await ort.InferenceSession.create(modelPath, {
          executionProviders: ["webgpu", "wasm", "webgl"],
          numThreads: 1,
        });
        modelRef.current = session;
        setModelLoaded(true);
        console.log("DeepLabV3-Plus-MobileNet model loaded successfully:", session);
        console.log("Model inputs:", session.inputNames);
        console.log("Model outputs:", session.outputNames);

        // Initialize layer selection with the first available layer
        if (session.outputNames.length > 1) {
          setSelectedLayer(session.outputNames[1]); // Skip the main output
        }
      } catch (error) {
        console.error("Model loading error:", error);
        setLoadingError("Failed to load the DeepLabV3-Plus-MobileNet model");
      }
    }
    loadModel();
  }, []);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        setSegmentationResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const preprocessImage = async (imageUrl: string): Promise<ort.Tensor> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;

        // Resize to model input size (513x513 for DeepLabV3+)
        canvas.width = 513;
        canvas.height = 513;
        ctx.drawImage(img, 0, 0, 513, 513);

        const imageData = ctx.getImageData(0, 0, 513, 513);
        const { data } = imageData;

        // Convert to float32 and normalize for DeepLabV3+ (ImageNet normalization)
        // Mean: [0.485, 0.456, 0.406], Std: [0.229, 0.224, 0.225]
        const mean = [0.485, 0.456, 0.406];
        const std = [0.229, 0.224, 0.225];
        const input = new Float32Array(3 * 513 * 513);

        for (let i = 0; i < data.length; i += 4) {
          const pixelIndex = i / 4;
          // Normalize to [0, 1] then apply ImageNet normalization
          const r = (data[i] / 255.0 - mean[0]) / std[0];
          const g = (data[i + 1] / 255.0 - mean[1]) / std[1];
          const b = (data[i + 2] / 255.0 - mean[2]) / std[2];

          input[pixelIndex] = r; // R channel
          input[pixelIndex + 513 * 513] = g; // G channel
          input[pixelIndex + 2 * 513 * 513] = b; // B channel
        }

        const tensor = new ort.Tensor('float32', input, [1, 3, 513, 513]);
        resolve(tensor);
      };
      img.onerror = reject;
      img.src = imageUrl;
    });
  };

  const processSegmentation = async () => {
    if (!uploadedImage || !modelRef.current) return;

    setIsProcessing(true);
    try {
      const startTime = performance.now();

      const inputTensor = await preprocessImage(uploadedImage);

      // Get the correct input name from the model
      const inputName = modelRef.current.inputNames[0];
      console.log("Using input name:", inputName);

      const outputs = await modelRef.current.run({ [inputName]: inputTensor });

      const endTime = performance.now();
      const inferenceTime = endTime - startTime;

      // Process output tensor to create segmentation mask
      const outputTensor = outputs[Object.keys(outputs)[0]];
      const mask = createSegmentationMask(outputTensor);

      setSegmentationResult({
        mask,
        inferenceTime
      });

      // Extract layer visualization if requested
      if (showLayerViz && selectedLayer && outputs[selectedLayer]) {
        const layerOutput = outputs[selectedLayer];
        const layerViz = createLayerVisualization(selectedLayer, layerOutput);
        setLayerVisualization(layerViz);

        // Draw layer visualization
        if (layerCanvasRef.current && layerViz.featureMaps[selectedChannel]) {
          const ctx = layerCanvasRef.current.getContext('2d')!;
          ctx.putImageData(layerViz.featureMaps[selectedChannel], 0, 0);
        }
      }

      // Draw the result on canvas
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d')!;
        ctx.putImageData(mask, 0, 0);
      }
    } catch (error) {
      console.error("Segmentation error:", error);
      setLoadingError("Failed to process segmentation");
    } finally {
      setIsProcessing(false);
    }
  };

  const createSegmentationMask = (outputTensor: ort.Tensor): ImageData => {
    const canvas = document.createElement('canvas');
    canvas.width = 513;
    canvas.height = 513;
    const ctx = canvas.getContext('2d')!;

    const imageData = ctx.createImageData(513, 513);
    const data = imageData.data;

    // Convert tensor output to segmentation mask
    const outputData = outputTensor.data as Float32Array;
    const dims = outputTensor.dims;

    // DeepLabV3+ output shape is typically [1, num_classes, height, width]
    const numClasses = dims[1] || 21; // Pascal VOC has 21 classes
    const height = dims[2] || 513;
    const width = dims[3] || 513;

    console.log("Output tensor dims:", dims);

    for (let h = 0; h < height; h++) {
      for (let w = 0; w < width; w++) {
        const pixelIndex = h * width + w;

        // Find class with highest probability for this pixel
        let maxClass = 0;
        let maxProb = outputData[pixelIndex]; // Class 0 (background)

        for (let c = 1; c < numClasses; c++) {
          const prob = outputData[c * height * width + pixelIndex];
          if (prob > maxProb) {
            maxProb = prob;
            maxClass = c;
          }
        }

        // Color based on class (simple colormap)
        const color = getClassColor(maxClass);
        const dataIndex = pixelIndex * 4;
        data[dataIndex] = color[0];     // R
        data[dataIndex + 1] = color[1]; // G
        data[dataIndex + 2] = color[2]; // B
        data[dataIndex + 3] = maxClass > 0 ? 180 : 0; // A (transparent for background)
      }
    }

    return imageData;
  };

  const getClassColor = (classId: number): [number, number, number] => {
    const colors: [number, number, number][] = [
      [0, 0, 0],       // background
      [128, 0, 0],     // person
      [0, 128, 0],     // bicycle
      [128, 128, 0],   // car
      [0, 0, 128],     // motorcycle
      [128, 0, 128],   // airplane
      [0, 128, 128],   // bus
      [128, 128, 128], // train
      [64, 0, 0],      // truck
      [192, 0, 0],     // boat
      [64, 128, 0],    // traffic light
      [192, 128, 0],   // fire hydrant
      [64, 0, 128],    // stop sign
      [192, 0, 128],   // parking meter
      [64, 128, 128],  // bench
      [192, 128, 128], // bird
      [0, 64, 0],      // cat
      [128, 64, 0],    // dog
      [0, 192, 0],     // horse
      [128, 192, 0],   // sheep
      [0, 64, 128],    // cow
    ];
    return colors[classId % colors.length] || [255, 255, 255];
  };

  const createLayerVisualization = (layerName: string, tensor: ort.Tensor): LayerVisualization => {
    const data = tensor.data as Float32Array;
    const dims = tensor.dims;

    // Assume tensor shape is [batch, channels, height, width]
    const channels = dims[1] || 1;
    const height = dims[2] || dims[dims.length - 2];
    const width = dims[3] || dims[dims.length - 1];

    console.log(`Layer ${layerName} dimensions:`, dims);

    const featureMaps: ImageData[] = [];

    // Create visualization for each channel (limit to first 16 for performance)
    const maxChannels = Math.min(channels, 16);

    for (let c = 0; c < maxChannels; c++) {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      const imageData = ctx.createImageData(width, height);
      const imgData = imageData.data;

      // Get min/max values for this channel for normalization
      let minVal = Infinity;
      let maxVal = -Infinity;

      for (let h = 0; h < height; h++) {
        for (let w = 0; w < width; w++) {
          const idx = c * height * width + h * width + w;
          const val = data[idx];
          minVal = Math.min(minVal, val);
          maxVal = Math.max(maxVal, val);
        }
      }

      // Normalize and create grayscale visualization
      const range = maxVal - minVal;
      for (let h = 0; h < height; h++) {
        for (let w = 0; w < width; w++) {
          const tensorIdx = c * height * width + h * width + w;
          const imgIdx = (h * width + w) * 4;

          // Normalize to 0-255
          const normalizedVal = range > 0 ? ((data[tensorIdx] - minVal) / range) * 255 : 0;
          const value = Math.max(0, Math.min(255, normalizedVal));

          imgData[imgIdx] = value;     // R
          imgData[imgIdx + 1] = value; // G
          imgData[imgIdx + 2] = value; // B
          imgData[imgIdx + 3] = 255;   // A
        }
      }

      featureMaps.push(imageData);
    }

    return {
      name: layerName,
      featureMaps,
      channels: maxChannels
    };
  };

  const updateLayerVisualization = () => {
    if (layerVisualization && layerCanvasRef.current && layerVisualization.featureMaps[selectedChannel]) {
      const ctx = layerCanvasRef.current.getContext('2d')!;
      const featureMap = layerVisualization.featureMaps[selectedChannel];

      // Resize canvas to match feature map size
      layerCanvasRef.current.width = featureMap.width;
      layerCanvasRef.current.height = featureMap.height;

      ctx.putImageData(featureMap, 0, 0);
    }
  };

  // Update visualization when channel selection changes
  useEffect(() => {
    updateLayerVisualization();
  }, [selectedChannel, layerVisualization]);

  return isWebGPUAvailable ? (
    <div className="min-h-screen flex flex-col">
      <LogosBackground />
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 pt-8 pb-12 sm:pt-12 max-w-7xl">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-10">
            <h1 className='text-3xl sm:text-4xl font-bold tracking-tight text-white mb-2'>
              DeepLabV3+ Segmentation
            </h1>
            <h2 className='text-base sm:text-lg font-medium tracking-tight text-gray-300 max-w-2xl mx-auto'>
              AI-powered image segmentation using MobileNet backbone
            </h2>
          </div>

          {/* Main Image Processing Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

            {/* Left Panel - Image Upload */}
            <div className="bg-gray-800 border border-gray-700/50 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <span className="text-purple-400">📁</span>
                Original Image
              </h3>

              {/* Upload Controls */}
              <div className="mb-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600/50 rounded-lg text-white file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:bg-purple-600 file:text-white file:cursor-pointer hover:file:bg-purple-700 file:text-sm"
                />
              </div>

              {/* Image Display */}
              {uploadedImage ? (
                <div className="space-y-4">
                  <div className="relative bg-gray-900 rounded-lg border border-gray-600/30 p-2">
                    <img
                      src={uploadedImage}
                      alt="Uploaded"
                      className="w-full max-h-80 object-contain rounded-lg"
                    />
                  </div>
                  <div className="space-y-3">
                    <button
                      onClick={processSegmentation}
                      disabled={isProcessing || !modelLoaded}
                      className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                    >
                      {isProcessing ? "Processing..." : "Segment Image"}
                    </button>

                    {/* Layer Visualization Toggle */}
                    <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg border border-gray-600/30">
                      <label className="text-sm text-gray-300 flex items-center gap-2">
                        <span className="text-orange-400">🔍</span>
                        Layer Visualization
                      </label>
                      <input
                        type="checkbox"
                        checked={showLayerViz}
                        onChange={(e) => setShowLayerViz(e.target.checked)}
                        className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
                      />
                    </div>

                    {/* Layer Selection Controls */}
                    {showLayerViz && modelRef.current && (
                      <div className="space-y-2 p-3 bg-gray-700 rounded-lg border border-gray-600/30">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Output Layer</label>
                          <select
                            value={selectedLayer}
                            onChange={(e) => setSelectedLayer(e.target.value)}
                            className="w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-xs"
                          >
                            {modelRef.current.outputNames.slice(1).map((name) => (
                              <option key={name} value={name}>{name}</option>
                            ))}
                          </select>
                        </div>

                        {layerVisualization && (
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">
                              Channel ({layerVisualization.channels} total)
                            </label>
                            <input
                              type="range"
                              min="0"
                              max={layerVisualization.channels - 1}
                              value={selectedChannel}
                              onChange={(e) => setSelectedChannel(parseInt(e.target.value))}
                              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                            />
                            <div className="text-xs text-gray-500 text-center mt-1">
                              Channel {selectedChannel + 1} / {layerVisualization.channels}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="min-h-[300px] flex items-center justify-center bg-gray-900 rounded-lg border border-gray-600/30">
                  <p className="text-gray-400 text-center">
                    Upload an image to start segmentation
                  </p>
                </div>
              )}
            </div>

            {/* Right Panel - Results */}
            <div className="bg-gray-800 border border-gray-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  {showLayerViz && layerVisualization ? (
                    <>
                      <span className="text-orange-400">🔍</span>
                      Layer Visualization
                    </>
                  ) : (
                    <>
                      <span className="text-green-400">🎨</span>
                      Segmentation Result
                    </>
                  )}
                </h3>

                {showLayerViz && layerVisualization && (
                  <div className="text-xs bg-orange-500/20 text-orange-300 px-2 py-1 rounded">
                    {layerVisualization.name}
                  </div>
                )}
              </div>

              {showLayerViz && layerVisualization ? (
                <div className="space-y-4">
                  <div className="relative bg-gray-900 rounded-lg border border-gray-600/30 p-2">
                    <canvas
                      ref={layerCanvasRef}
                      className="w-full max-h-80 object-contain rounded-lg"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-400 mb-2">
                      Feature Map: Channel {selectedChannel + 1} / {layerVisualization.channels}
                    </div>
                    <div className="text-xs text-gray-500">
                      Layer: {layerVisualization.name} |
                      Size: {layerVisualization.featureMaps[0]?.width || 'N/A'}x{layerVisualization.featureMaps[0]?.height || 'N/A'}
                    </div>
                  </div>
                </div>
              ) : segmentationResult ? (
                <div className="space-y-4">
                  <div className="relative bg-gray-900 rounded-lg border border-gray-600/30 p-2">
                    <canvas
                      ref={canvasRef}
                      width={513}
                      height={513}
                      className="w-full max-h-80 object-contain rounded-lg"
                      style={{ imageRendering: 'auto' }}
                    />
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-400 mb-2">
                      Inference completed in {segmentationResult.inferenceTime.toFixed(0)}ms
                    </div>
                    <div className="text-xs text-gray-500">
                      Model Status: {loadingError ? "Error" : modelLoaded ? "Loaded" : "Loading..."} |
                      Device: {isWebGPUAvailable ? " WebGPU" : " CPU/WebGL"}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="min-h-[300px] flex items-center justify-center bg-gray-900 rounded-lg border border-gray-600/30">
                  <p className="text-gray-400 text-center">
                    {showLayerViz ? "Layer visualizations will appear here" : "Segmentation results will appear here"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Section - About and Roadmap */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* About Section */}
            <div className="bg-gray-800 border border-gray-700/50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-blue-400">🎯</span>
                About This Project
              </h3>

              <div className="space-y-4">
                <div>
                  <h4 className="text-base font-semibold text-blue-400 mb-2">Technical Overview</h4>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    Deep learning-based semantic segmentation using DeepLabV3+ with MobileNet backbone.
                    Upload images and get pixel-level classification with real-time inference.
                  </p>
                </div>

                <div>
                  <h4 className="text-base font-semibold text-purple-400 mb-2">Key Features</h4>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li className="flex items-center gap-2">
                      <span className="text-green-400">✓</span>
                      Real-time segmentation
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-400">✓</span>
                      WebGPU acceleration
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-400">✓</span>
                      21 Pascal VOC object classes
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-400">✓</span>
                      Privacy-preserving (client-side)
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-base font-semibold text-emerald-400 mb-2">Model Specifications</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="bg-gray-900 rounded-lg p-2 border border-gray-600/30">
                      <span className="text-blue-300 font-medium text-xs">Architecture:</span>
                      <p className="text-xs text-gray-400">DeepLabV3+ + MobileNet</p>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-2 border border-gray-600/30">
                      <span className="text-purple-300 font-medium text-xs">Input Size:</span>
                      <p className="text-xs text-gray-400">513x513 RGB</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Roadmap Section */}
            <div className="bg-gray-800 border border-purple-500/20 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-purple-400">🚀</span>
                Development Roadmap
              </h3>

              <div className="space-y-4">
                <div>
                  <h4 className="text-base font-semibold text-green-400 mb-2">✅ Completed</h4>
                  <div className="space-y-1">
                    <div className="text-sm text-gray-300 bg-green-500/10 px-2 py-1 rounded-md">ONNX model integration</div>
                    <div className="text-sm text-gray-300 bg-green-500/10 px-2 py-1 rounded-md">WebGPU acceleration</div>
                    <div className="text-sm text-gray-300 bg-green-500/10 px-2 py-1 rounded-md">Real-time segmentation</div>
                    <div className="text-sm text-gray-300 bg-green-500/10 px-2 py-1 rounded-md">Layer visualization</div>
                  </div>
                </div>

                <div>
                  <h4 className="text-base font-semibold text-yellow-400 mb-2">🔄 In Progress</h4>
                  <div className="space-y-1">
                    <div className="text-sm text-gray-300 bg-yellow-500/10 px-2 py-1 rounded-md">Performance optimization</div>
                    <div className="text-sm text-gray-300 bg-yellow-500/10 px-2 py-1 rounded-md">Advanced feature analysis</div>
                  </div>
                </div>

                <div>
                  <h4 className="text-base font-semibold text-gray-400 mb-2">⏳ Planned</h4>
                  <div className="space-y-1">
                    <div className="text-sm text-gray-300 bg-gray-700 px-2 py-1 rounded-md">Overlay blend modes</div>
                    <div className="text-sm text-gray-300 bg-gray-700 px-2 py-1 rounded-md">Batch processing</div>
                    <div className="text-sm text-gray-300 bg-gray-700 px-2 py-1 rounded-md">Custom color schemes</div>
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
    <div className="min-h-screen flex flex-col">
      <LogosBackground />
      <Navbar />
      <main className="flex-grow flex items-center justify-center px-4 py-16">
        <div className='flex flex-col justify-center items-center text-center max-w-md bg-gray-800 border border-gray-700/50 rounded-2xl p-8'>
          <h1 className='text-3xl sm:text-4xl font-bold text-white mb-3'>WebGPU Not Supported</h1>
          <p className='text-base sm:text-lg text-gray-300 leading-relaxed'>WebGPU is not supported by this browser. Please use Chrome or Edge with WebGPU enabled.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}