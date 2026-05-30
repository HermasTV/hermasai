import * as tf from "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-webgpu";
import { setWasmPaths } from "@tensorflow/tfjs-backend-wasm";

setWasmPaths(
  "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@4.22.0/dist/",
);
import "@tensorflow/tfjs-converter";
import * as faceDetection from "@tensorflow-models/face-detection";
import { installProgressFetch } from "./install-progress-fetch";
import { pickBackend } from "./pick-backend";

installProgressFetch();

let detector = null;
let busy = false;

self.addEventListener("message", async (e) => {
  const { type } = e.data;

  if (type === "init") {
    try {
      const backend = await pickBackend(tf, e.data.backend);
      detector = await faceDetection.createDetector(
        faceDetection.SupportedModels.MediaPipeFaceDetector,
        {
          runtime: "tfjs",
          maxFaces: 1,
          modelType: "short",
        },
      );
      self.postMessage({ type: "ready", backend });
    } catch (err) {
      self.postMessage({
        type: "error",
        message: `[face-detection] ${String(err?.message ?? err)}`,
      });
    }
    return;
  }

  if (type === "frame") {
    const { bitmap, timestamp } = e.data;
    if (!detector || busy) {
      bitmap?.close?.();
      return;
    }
    busy = true;
    try {
      const faces = await detector.estimateFaces(bitmap, {
        flipHorizontal: false,
      });
      const detections = faces.map((f) => ({
        box: f.box
          ? {
              xMin: f.box.xMin,
              yMin: f.box.yMin,
              xMax: f.box.xMax,
              yMax: f.box.yMax,
              width: f.box.width,
              height: f.box.height,
            }
          : null,
        keypoints: f.keypoints?.map((k) => ({ x: k.x, y: k.y, name: k.name })),
      }));
      self.postMessage({
        type: "result",
        timestamp,
        result: {
          detections,
          sourceWidth: bitmap.width,
          sourceHeight: bitmap.height,
        },
      });
    } catch (err) {
      self.postMessage({
        type: "error",
        message: `[face-detection] ${String(err?.message ?? err)}`,
      });
    } finally {
      bitmap.close();
      busy = false;
    }
  }
});
