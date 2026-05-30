import * as tf from "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-webgpu";
import { setWasmPaths } from "@tensorflow/tfjs-backend-wasm";

setWasmPaths(
  "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@4.22.0/dist/",
);
import "@tensorflow/tfjs-converter";
import * as faceLandmarksDetection from "@tensorflow-models/face-landmarks-detection";
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
      detector = await faceLandmarksDetection.createDetector(
        faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
        {
          runtime: "tfjs",
          maxFaces: 1,
          refineLandmarks: false,
        },
      );
      self.postMessage({ type: "ready", backend });
    } catch (err) {
      self.postMessage({
        type: "error",
        message: `[face-mesh] ${String(err?.message ?? err)}`,
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
      const facesOut = faces.map((f) => ({
        box: f.box
          ? {
              xMin: f.box.xMin,
              yMin: f.box.yMin,
              xMax: f.box.xMax,
              yMax: f.box.yMax,
            }
          : null,
        keypoints: f.keypoints?.map((k) => ({ x: k.x, y: k.y })),
      }));
      self.postMessage({
        type: "result",
        timestamp,
        result: {
          faces: facesOut,
          sourceWidth: bitmap.width,
          sourceHeight: bitmap.height,
        },
      });
    } catch (err) {
      self.postMessage({
        type: "error",
        message: `[face-mesh] ${String(err?.message ?? err)}`,
      });
    } finally {
      bitmap.close();
      busy = false;
    }
  }
});
