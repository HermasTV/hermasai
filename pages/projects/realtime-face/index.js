import React, { useEffect, useRef, useState } from 'react';
import Navbar from '../../../components/navbar';
import Footer from '../../../components/footer';
import * as ort from 'onnxruntime-web/webgpu';
import { processOutputs, preprocess } from '../../../components/ultraface/ultraface'; // Adjust the import path as needed

const FaceDetectionPage = () => {
  const [modelLoaded, setModelLoaded] = useState(false);
  const [loadingError, setLoadingError] = useState('');
  const [fps, setFps] = useState(0);
  const [isWebGPUAvailable, setIsWebGPUAvailable] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const modelRef = useRef(null);
  const lastUpdateTimeRef = useRef(Date.now());
  const frameTimes = useRef([]);
  const [spinnerStyle, setSpinnerStyle] = useState({
    display: 'none',
    width: '100px',
    height: '100px',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  });

  useEffect(() => {
    // Check for WebGPU availability
    if (navigator.gpu) {
      setIsWebGPUAvailable(true);
    }

    async function loadModel() {
      try {
        ort.env.wasm.wasmPaths = '/';
        const session = await ort.InferenceSession.create('/ultraface.onnx', { executionProviders: ['webgpu', 'wasm'] });
        modelRef.current = session;
        setModelLoaded(true);
        console.log('Model loaded successfully:', session);
      } catch (error) {
        setLoadingError('Failed to load the model');
      }
    }
    loadModel();
  }, []);

  useEffect(() => {
    async function setupWebcam() {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        processVideo();
      };
    }
    if (modelLoaded) {
      setupWebcam();
    }
  }, [modelLoaded]);

  async function processVideo() {
    if (videoRef.current && canvasRef.current && modelRef.current && modelLoaded) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      const session = modelRef.current;

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
            display: 'block',
            top: `${centerY - radius}px`,
            left: `${centerX - radius}px`,
            width: `${radius * 2}px`,
            height: `${radius * 2}px`,
            transform: 'translate(0, 0)',
          });
        }
      } else {
        setSpinnerStyle({ display: 'none' });
      }

      const now = performance.now();
      frameTimes.current.push(now);

      if (frameTimes.current.length > 60) {
        frameTimes.current.shift();
      }

      const fps = frameTimes.current.length / ((frameTimes.current[frameTimes.current.length - 1] - frameTimes.current[0]) / 1000);
      setFps(fps.toFixed(2));

      requestAnimationFrame(processVideo);
    }
  }

  return (
    <>
      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
        }

        html, body {
          width: 100%;
          height: 100%;
          overflow: auto;
          background: rgba(100, 190, 170, 1);
        }

        .container {
          text-align: center;
        }

        .container, .device, .frame, .screen {
          transition: all 0.5s ease;
        }

        .description {
          margin: 20px auto;
          padding: 20px;
          background: rgba(255, 255, 255, 0.8);
          border-radius: 10px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          font-family: "Open Sans", sans-serif;
          color: #333;
          text-align: left;
          max-width: 900px; /* Ensuring it matches the display screen width */
        }

        .stats {
          margin: 20px auto;
          padding: 10px;
          background: rgba(255, 255, 255, 0.8);
          border-radius: 10px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          font-family: "Open Sans", sans-serif;
          color: #333;
          text-align: left;
          max-width: 900px; /* Ensuring it matches the display screen width */
        }

        .device {
          display: inline-block;
          margin: 0 auto;
        }

        .frame {
          border-radius: 25px;
          padding: 50px 2px;
          background: #ddd;
          box-shadow: 0 0 0 1px #ccc;
        }

        .screen {
          position: relative;
          height: 300px;
          width: 200px;
          background: #444;
          box-shadow: inset 0 0 0 1px #333;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: hidden;
        }

        .screen video {
          width: 100%;
          height: 100%;
          object-fit: cover; /* Ensures video covers the whole frame */
          transform: scaleX(-1); /* Mirror the video stream */
        }

        .screen:before, .screen:after {
          position: absolute;
          width: 32px;
          left: 50%;
          margin-left: -16px;
          border-radius: 16px;
          content: " ";
          background: #bbb;
          box-shadow: 0 0 0 1px #eee;
        }

        .screen:before {
          height: 8px;
          top: -29px;
        }

        .screen:after {
          height: 32px;
          bottom: -41px;
        }

        #container {
          position: absolute; /* Positioning the spinner container absolutely within .screen */
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Tablet */
        @media all and (min-width: 600px) {
          .screen {
            height: 440px;
            width: 360px;
          }

          .screen:before {
            width: 10px;
            height: 10px;
            top: -30px;
            margin-left: -5px;
          }
        }

        /* Desktop */
        @media all and (min-width: 960px) {
          .frame {
            padding: 30px 2px 2px;
            border-radius: 10px;
          }

          .screen {
            height: 510px;
            width: 900px;
            border-radius: 0 0 10px 10px;
          }

          .screen:before {
            width: 10px;
            height: 10px;
            top: -20px;
            left: 15px;
            background: rgba(255, 100, 100, 1);
            box-shadow: 15px 0 rgba(100, 255, 100, 1), 30px 0 rgba(255, 255, 100, 1);
          }

          .screen:after {
            width: 90%;
            height: 16px;
            top: -23px;
            left: 10%;
            border-radius: 5px;
            background: #eee;
          }
        }

        #spinner {
          transform-origin: center;
          animation-name: animation;
          animation-duration: 1.2s;
          animation-timing-function: cubic-bezier;
          animation-iteration-count: infinite;
          fill: transparent;
          stroke: #dd2476;
          stroke-width: 7px;
          stroke-linecap: round;
          filter: url(#shadow);
        }

        @keyframes animation {
          0% {
            stroke-dasharray: 1 98;
            stroke-dashoffset: -105;
          }
          50% {
            stroke-dasharray: 80 10;
            stroke-dashoffset: -160;
          }
          100% {
            stroke-dasharray: 1 98;
            stroke-dashoffset: -300;
          }
        }

        .hidden {
          visibility: hidden;
        }
      `}</style>

      <Navbar />
      <div className="container">
        <div className="description">
          <h2>Real time Face Detection Demo</h2>
          <p>
            In this demo, we use the UltraFace model to detect faces in real-time using your webcam.
            The model is loaded using ONNX Runtime Web and executed on the GPU using WebGPU, if you are using
            firefox browser webgl is not supported so the model will be executed on the CPU.
          </p>
        </div>
        <div className="stats">
          <p>Model Status: {modelLoaded ? 'Loaded' : 'Loading...'}</p>
          <p>Available device  : {isWebGPUAvailable ? 'GPU' : 'CPU'}</p>
          <p>FPS: {fps}</p>
        </div>
        <div className="device">
          <div className="frame">
            <div className="screen">
              <video id="webcam" ref={videoRef} autoPlay playsInline></video>
              <div id="container" style={spinnerStyle}>
                <svg viewBox="0 0 100 100">
                  <defs>
                    <filter id="shadow">
                      <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#fc6767"/>
                    </filter>
                  </defs>
                  <circle id="spinner" cx="50" cy="50" r="45" />
                </svg>
              </div>
              <canvas ref={canvasRef} width="320" height="240" style={{ display: 'none' }} />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default FaceDetectionPage;
