"use client";

import { useEffect, useRef } from "react";
import { FACE_MESH_PAIRS } from "./face-mesh-pairs";

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

// EAR (Eye Aspect Ratio) — Soukupová & Čech, 2016 — used for blink detection.
// EAR = (|p2-p6| + |p3-p5|) / (2 · |p1-p4|), where p1/p4 are the eye corners
// and p2,p3 / p6,p5 are vertical lid pairs. Drops sharply when the eye closes.
// 6-point eye landmarks (outer, upper-outer, upper-inner, inner, lower-inner,
// lower-outer). These are *not* drawn as polylines anymore — they're only
// used to compute EAR.
const LEFT_EYE_EAR = [33, 160, 158, 133, 153, 144];
const RIGHT_EYE_EAR = [263, 387, 385, 362, 380, 373];
const EAR_CLOSE_THRESHOLD = 0.21; // eye considered closed below this
const EAR_OPEN_THRESHOLD = 0.26; // eye considered open above this (hysteresis)

function distance(
  a: { x: number; y: number },
  b: { x: number; y: number },
): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function eyeAspectRatio(
  pts: { x: number; y: number }[],
  indices: number[],
): number | null {
  const p1 = pts[indices[0]];
  const p2 = pts[indices[1]];
  const p3 = pts[indices[2]];
  const p4 = pts[indices[3]];
  const p5 = pts[indices[4]];
  const p6 = pts[indices[5]];
  if (!p1 || !p2 || !p3 || !p4 || !p5 || !p6) return null;
  const horiz = distance(p1, p4);
  if (horiz < 1e-6) return null;
  return (distance(p2, p6) + distance(p3, p5)) / (2 * horiz);
}

const HAND_CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [0, 17], [17, 18], [18, 19], [19, 20],
];

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

// Animated face-detection reticle: a glowing oval that gently pulses, with a
// pair of opposed arcs sweeping around it (a "scanning" ring). `t` is a
// monotonic timestamp in ms — the only thing that needs to vary per frame for
// the animation, so the effect can stay result-driven.
function drawAnimatedFaceOval(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  t: number,
) {
  ctx.save();
  ctx.lineCap = "round";

  // Gentle breathing pulse on the radii (~±2.5%).
  const pulse = 1 + Math.sin(t / 600) * 0.025;
  const erx = rx * pulse;
  const ery = ry * pulse;

  // Soft base oval.
  ctx.shadowColor = "#22d3ee";
  ctx.shadowBlur = 14;
  ctx.strokeStyle = "rgba(34, 211, 238, 0.4)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(cx, cy, erx, ery, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Two bright opposed arcs rotating around the oval.
  const phase = (t / 900) % (Math.PI * 2);
  const arcLen = Math.PI * 0.45;
  ctx.shadowBlur = 10;
  ctx.strokeStyle = "rgba(56, 189, 248, 0.95)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(cx, cy, erx, ery, 0, phase, phase + arcLen);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(cx, cy, erx, ery, 0, phase + Math.PI, phase + Math.PI + arcLen);
  ctx.stroke();

  ctx.restore();
}

interface Props {
  width: number;
  height: number;
  faceDetections: FaceDetectionPayload | null;
  faceMesh: FaceMeshPayload | null;
  handPose: HandPosePayload | null;
  onBlink?: () => void;
}

export function OverlayCanvas({
  width,
  height,
  faceDetections,
  faceMesh,
  handPose,
  onBlink,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Hysteretic blink state machine: only counts on the rising edge of
  // closed → open. `eyesClosed` flips when both eyes' EAR cross the close
  // threshold; the next time they cross the open threshold, a blink fires.
  const eyesClosedRef = useRef(false);
  const onBlinkRef = useRef(onBlink);
  onBlinkRef.current = onBlink;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (faceDetections?.detections?.length) {
      const sx = canvas.width / (faceDetections.sourceWidth || canvas.width);
      const sy = canvas.height / (faceDetections.sourceHeight || canvas.height);
      const t = performance.now();
      for (const det of faceDetections.detections) {
        const b = det.box;
        if (!b) continue;
        const cx = (b.xMin + b.width / 2) * sx;
        const cy = (b.yMin + b.height / 2) * sy;
        // Faces extend a little beyond the tight detection box vertically
        // (forehead/chin), so the oval is padded more on the y-axis.
        const rx = (b.width / 2) * sx * 1.04;
        const ry = (b.height / 2) * sy * 1.14;
        drawAnimatedFaceOval(ctx, cx, cy, rx, ry, t);
      }
    }

    if (faceMesh?.faces?.length) {
      const sx = canvas.width / (faceMesh.sourceWidth || canvas.width);
      const sy = canvas.height / (faceMesh.sourceHeight || canvas.height);
      for (const face of faceMesh.faces) {
        const k = face.keypoints;
        if (!k) continue;

        // Translucent mesh wireframe — single batched stroke, full tessellation.
        ctx.save();
        ctx.globalAlpha = 0.35;
        drawConnections(ctx, k, FACE_MESH_PAIRS, sx, sy, "#67e8f9", 1);
        ctx.restore();

        // Blink detection on this face. Both eyes must be closed to count
        // as a blink; this avoids triggering on winks and on lone-eye noise.
        const leftEar = eyeAspectRatio(k, LEFT_EYE_EAR);
        const rightEar = eyeAspectRatio(k, RIGHT_EYE_EAR);
        if (leftEar != null && rightEar != null) {
          const avgEar = (leftEar + rightEar) / 2;
          if (!eyesClosedRef.current && avgEar < EAR_CLOSE_THRESHOLD) {
            eyesClosedRef.current = true;
          } else if (eyesClosedRef.current && avgEar > EAR_OPEN_THRESHOLD) {
            eyesClosedRef.current = false;
            onBlinkRef.current?.();
          }
        }

        // Tint the eye region when closed so the user can see the detector
        // is reacting in real time, not just incrementing a hidden counter.
        if (eyesClosedRef.current) {
          ctx.save();
          ctx.globalAlpha = 0.5;
          ctx.fillStyle = "#fbbf24";
          for (const idx of [...LEFT_EYE_EAR, ...RIGHT_EYE_EAR]) {
            const p = k[idx];
            if (!p) continue;
            ctx.beginPath();
            ctx.arc(p.x * sx, p.y * sy, 3, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }
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
      className="absolute inset-0 w-full h-full object-cover pointer-events-none transform -scale-x-100"
    />
  );
}
