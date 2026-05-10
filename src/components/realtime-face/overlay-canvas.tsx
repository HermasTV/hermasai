"use client";

import { useEffect, useRef } from "react";

export interface FaceDetection {
  box: { xMin: number; yMin: number; xMax: number; yMax: number; width: number; height: number } | null;
  keypoints?: { x: number; y: number; name?: string }[];
}

export interface FaceDetectionPayload {
  detections: FaceDetection[];
  sourceWidth: number;
  sourceHeight: number;
}

export interface FaceMeshFace {
  box: { xMin: number; yMin: number; xMax: number; yMax: number } | null;
  keypoints: { x: number; y: number }[];
}

export interface FaceMeshPayload {
  faces: FaceMeshFace[];
  sourceWidth: number;
  sourceHeight: number;
}

export interface HandPoseHand {
  keypoints: { x: number; y: number; name?: string }[];
  handedness: string;
  score: number;
}

export interface HandPosePayload {
  hands: HandPoseHand[];
  sourceWidth: number;
  sourceHeight: number;
}

const FACE_OVAL = [
  10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378,
  400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21,
  54, 103, 67, 109, 10,
];
const LEFT_EYE = [33, 133, 160, 158, 153, 144, 33];
const RIGHT_EYE = [263, 362, 387, 385, 380, 373, 263];
const LIPS_OUTER = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 61];
const LEFT_BROW = [70, 63, 105, 66, 107];
const RIGHT_BROW = [336, 296, 334, 293, 300];
const NOSE_BRIDGE = [168, 6, 197, 195, 5, 4];

const HAND_CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [0, 17], [17, 18], [18, 19], [19, 20],
];

function drawPolyline(
  ctx: CanvasRenderingContext2D,
  pts: { x: number; y: number }[],
  indices: number[],
  sx: number,
  sy: number,
  color: string,
  lineWidth: number,
) {
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  for (let i = 0; i < indices.length; i++) {
    const p = pts[indices[i]];
    if (!p) continue;
    const x = p.x * sx;
    const y = p.y * sy;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
}

function drawConnections(
  ctx: CanvasRenderingContext2D,
  pts: { x: number; y: number }[],
  connections: [number, number][],
  sx: number,
  sy: number,
  color: string,
  lineWidth: number,
) {
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  for (const [a, b] of connections) {
    const pa = pts[a];
    const pb = pts[b];
    if (!pa || !pb) continue;
    ctx.moveTo(pa.x * sx, pa.y * sy);
    ctx.lineTo(pb.x * sx, pb.y * sy);
  }
  ctx.stroke();
}

function drawPoints(
  ctx: CanvasRenderingContext2D,
  pts: { x: number; y: number }[],
  sx: number,
  sy: number,
  color: string,
  radius: number,
) {
  ctx.fillStyle = color;
  for (const p of pts) {
    ctx.beginPath();
    ctx.arc(p.x * sx, p.y * sy, radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

interface Props {
  width: number;
  height: number;
  faceDetections: FaceDetectionPayload | null;
  faceMesh: FaceMeshPayload | null;
  handPose: HandPosePayload | null;
}

export function OverlayCanvas({
  width,
  height,
  faceDetections,
  faceMesh,
  handPose,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (faceDetections?.detections?.length) {
      const sx = canvas.width / (faceDetections.sourceWidth || canvas.width);
      const sy = canvas.height / (faceDetections.sourceHeight || canvas.height);
      ctx.strokeStyle = "#3b82f6";
      ctx.lineWidth = 2;
      ctx.font = "12px ui-sans-serif, system-ui";
      ctx.fillStyle = "#3b82f6";
      for (const det of faceDetections.detections) {
        const b = det.box;
        if (!b) continue;
        ctx.strokeRect(b.xMin * sx, b.yMin * sy, b.width * sx, b.height * sy);
      }
    }

    if (faceMesh?.faces?.length) {
      const sx = canvas.width / (faceMesh.sourceWidth || canvas.width);
      const sy = canvas.height / (faceMesh.sourceHeight || canvas.height);
      for (const face of faceMesh.faces) {
        const k = face.keypoints;
        if (!k) continue;
        drawPolyline(ctx, k, FACE_OVAL, sx, sy, "#a855f7", 1);
        drawPolyline(ctx, k, LEFT_EYE, sx, sy, "#10b981", 1);
        drawPolyline(ctx, k, RIGHT_EYE, sx, sy, "#10b981", 1);
        drawPolyline(ctx, k, LEFT_BROW, sx, sy, "#10b981", 1);
        drawPolyline(ctx, k, RIGHT_BROW, sx, sy, "#10b981", 1);
        drawPolyline(ctx, k, LIPS_OUTER, sx, sy, "#f97316", 1);
        drawPolyline(ctx, k, NOSE_BRIDGE, sx, sy, "#a855f7", 1);
      }
    }

    if (handPose?.hands?.length) {
      const sx = canvas.width / (handPose.sourceWidth || canvas.width);
      const sy = canvas.height / (handPose.sourceHeight || canvas.height);
      for (const hand of handPose.hands) {
        const k = hand.keypoints;
        if (!k) continue;
        drawConnections(ctx, k, HAND_CONNECTIONS, sx, sy, "#facc15", 2);
        drawPoints(ctx, k, sx, sy, "#fbbf24", 3);
      }
    }
  }, [faceDetections, faceMesh, handPose]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0 w-full h-full pointer-events-none transform -scale-x-100"
    />
  );
}
