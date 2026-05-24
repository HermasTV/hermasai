import * as tf from "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-webgpu";
import { setWasmPaths } from "@tensorflow/tfjs-backend-wasm";

setWasmPaths(
  "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@4.22.0/dist/",
);
import "@tensorflow/tfjs-converter";
import * as handPoseDetection from "@tensorflow-models/hand-pose-detection";
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
      detector = await handPoseDetection.createDetector(
        handPoseDetection.SupportedModels.MediaPipeHands,
        {
          runtime: "tfjs",
          maxHands: 2,
          modelType: "lite",
        },
      );
      self.postMessage({ type: "ready", backend });
    } catch (err) {
      self.postMessage({
        type: "error",
        message: `[hand-pose] ${String(err?.message ?? err)}`,
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
      const hands = await detector.estimateHands(bitmap, {
        flipHorizontal: false,
      });
      const handsOut = hands.map((h) => ({
        keypoints: h.keypoints?.map((k) => ({ x: k.x, y: k.y, name: k.name })),
        handedness: h.handedness,
        score: h.score,
      }));
      self.postMessage({
        type: "result",
        timestamp,
        result: {
          hands: handsOut,
          sourceWidth: bitmap.width,
          sourceHeight: bitmap.height,
        },
      });
    } catch (err) {
      self.postMessage({
        type: "error",
        message: `[hand-pose] ${String(err?.message ?? err)}`,
      });
    } finally {
      bitmap.close();
      busy = false;
    }
  }
});
