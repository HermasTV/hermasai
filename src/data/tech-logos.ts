/**
 * tech-logos.ts
 * -------------
 * The 50-logo data set for the homepage <TechLogoField/> ambient background.
 *
 * Two kinds of entry:
 *  - kind: 'brand'  — the official monochrome SVG path is sourced at runtime
 *    from the `simple-icons` package by slug (see `getSimpleIcon` below). No
 *    hand-guessed path data — the package is the authority. simple-icons ships
 *    every icon on a 24×24 viewBox as a single `d` path string.
 *  - kind: 'line'   — a hand-drawn line-icon for hardware/devices that are not
 *    brand logos (Jetson box, CCTV camera, drone, smartphone, GPU card).
 *    Drawn as stroked outlines on a 24×24 viewBox to sit visually beside the
 *    monochrome brand marks. Every logo is rendered in one unified brand tint,
 *    so brand vs line is purely a sourcing distinction, not a visual one.
 *
 * The field renders all 50 in a single brand-tinted monochrome treatment —
 * deliberately NOT real brand colors (cohesion + sidesteps trademark concerns).
 */

import * as simpleIcons from 'simple-icons';
import type { SimpleIcon } from 'simple-icons';

/** A logo that ships as a filled monochrome SVG via the simple-icons package. */
export interface BrandLogo {
  kind: 'brand';
  /** Human label — used for the SVG <title> / aria fallback only. */
  label: string;
  /** simple-icons export key, e.g. 'siPytorch'. */
  iconKey: string;
}

/** A hand-drawn stroked line-icon for a hardware/device (not a brand mark). */
export interface LineLogo {
  kind: 'line';
  label: string;
  /** SVG markup for the icon body, drawn on a 0 0 24 24 viewBox. Stroked,
   *  no fill — `currentColor` so the field can tint it uniformly. */
  body: string;
}

export type TechLogo = BrandLogo | LineLogo;

/**
 * Resolve a brand logo's official path data from simple-icons.
 * Returns the single `d` string (24×24 viewBox) or null if the slug is gone
 * (simple-icons occasionally drops icons on trademark requests).
 */
export function getSimpleIcon(iconKey: string): SimpleIcon | null {
  const icon = (simpleIcons as Record<string, SimpleIcon | undefined>)[iconKey];
  return icon ?? null;
}

/* --------------------------------------------------------------------------
 * Hand-drawn hardware line-icons (≈5). Stroke-based, 24×24 viewBox, no fill —
 * intentionally simple silhouettes so they read at small sizes and blurred.
 * ------------------------------------------------------------------------ */

/** NVIDIA Jetson AGX — a compact heat-sinked edge-AI box. */
const JETSON: LineLogo = {
  kind: 'line',
  label: 'NVIDIA Jetson AGX edge module',
  body:
    '<rect x="3.5" y="6" width="17" height="12" rx="1.6" ' +
    'fill="none" stroke="currentColor" stroke-width="1.5"/>' +
    '<path d="M7 6V4.5M12 6V4.5M17 6V4.5" stroke="currentColor" ' +
    'stroke-width="1.5" stroke-linecap="round"/>' +
    '<path d="M7 18v1.5M12 18v1.5M17 18v1.5" stroke="currentColor" ' +
    'stroke-width="1.5" stroke-linecap="round"/>' +
    '<path d="M8 10h8M8 12.5h8M8 15h5" stroke="currentColor" ' +
    'stroke-width="1.4" stroke-linecap="round"/>',
};

/** Vision / CCTV camera — a bullet camera on a wall mount. */
const CAMERA: LineLogo = {
  kind: 'line',
  label: 'Vision CCTV camera',
  body:
    '<path d="M3 5v8" stroke="currentColor" stroke-width="1.6" ' +
    'stroke-linecap="round"/>' +
    '<path d="M3 9h3" stroke="currentColor" stroke-width="1.6" ' +
    'stroke-linecap="round"/>' +
    '<rect x="6" y="6.2" width="13" height="5.6" rx="2.8" ' +
    'fill="none" stroke="currentColor" stroke-width="1.6"/>' +
    '<circle cx="16.4" cy="9" r="1.5" fill="none" ' +
    'stroke="currentColor" stroke-width="1.5"/>' +
    '<path d="M9 12.6l-2 6M14 12.4l1.4 6.2" stroke="currentColor" ' +
    'stroke-width="1.5" stroke-linecap="round"/>',
};

/** Quadcopter / drone — body with four arms and rotors. */
const DRONE: LineLogo = {
  kind: 'line',
  label: 'Quadcopter drone',
  body:
    '<rect x="9" y="9" width="6" height="6" rx="1.4" ' +
    'fill="none" stroke="currentColor" stroke-width="1.5"/>' +
    '<path d="M9 9L5.5 5.5M15 9l3.5-3.5M9 15l-3.5 3.5M15 15l3.5 3.5" ' +
    'stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>' +
    '<ellipse cx="5" cy="5" rx="2.6" ry="1" fill="none" ' +
    'stroke="currentColor" stroke-width="1.4"/>' +
    '<ellipse cx="19" cy="5" rx="2.6" ry="1" fill="none" ' +
    'stroke="currentColor" stroke-width="1.4"/>' +
    '<ellipse cx="5" cy="19" rx="2.6" ry="1" fill="none" ' +
    'stroke="currentColor" stroke-width="1.4"/>' +
    '<ellipse cx="19" cy="19" rx="2.6" ry="1" fill="none" ' +
    'stroke="currentColor" stroke-width="1.4"/>',
};

/** Smartphone — on-device / browser ML demos run here. */
const PHONE: LineLogo = {
  kind: 'line',
  label: 'Smartphone',
  body:
    '<rect x="7" y="2.5" width="10" height="19" rx="2.4" ' +
    'fill="none" stroke="currentColor" stroke-width="1.6"/>' +
    '<path d="M10.5 5h3" stroke="currentColor" stroke-width="1.5" ' +
    'stroke-linecap="round"/>' +
    '<circle cx="12" cy="18.6" r="1.05" fill="currentColor"/>',
};

/** GPU card — a graphics card with a fan, for training/inference compute. */
const GPU: LineLogo = {
  kind: 'line',
  label: 'GPU graphics card',
  body:
    '<rect x="2.5" y="7" width="19" height="10" rx="1.4" ' +
    'fill="none" stroke="currentColor" stroke-width="1.5"/>' +
    '<circle cx="8.5" cy="12" r="3.2" fill="none" ' +
    'stroke="currentColor" stroke-width="1.5"/>' +
    '<path d="M8.5 9.6v4.8M6.4 10.8l4.2 2.4M6.4 13.2l4.2-2.4" ' +
    'stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>' +
    '<path d="M15 11h4M15 14h4" stroke="currentColor" ' +
    'stroke-width="1.4" stroke-linecap="round"/>' +
    '<path d="M6 17v2.2M18 17v2.2" stroke="currentColor" ' +
    'stroke-width="1.5" stroke-linecap="round"/>',
};

/* --------------------------------------------------------------------------
 * The 50-logo set.
 *
 * Brand logos (45) — sourced as official monochrome SVGs from simple-icons.
 *   A few intended brands are unavailable in simple-icons (the package drops
 *   icons on trademark requests), so domain-relevant substitutes are used:
 *     - AWS        → Google Cloud  (cloud platform; the AWS mark is no longer
 *                    shipped by simple-icons)
 *     - LlamaIndex → scikit-learn  (classic ML library; LlamaIndex mark is not
 *                    in simple-icons)
 *   All substitutes are core to a Senior AI / Computer-Vision engineer's
 *   stack, so the field stays accurate to the domain.
 *
 * Hardware line-icons (5) — hand-drawn above.
 * ------------------------------------------------------------------------ */
export const TECH_LOGOS: TechLogo[] = [
  // --- languages ---
  { kind: 'brand', label: 'Python', iconKey: 'siPython' },
  { kind: 'brand', label: 'C++', iconKey: 'siCplusplus' },
  { kind: 'brand', label: 'JavaScript', iconKey: 'siJavascript' },
  // --- ML / DL frameworks & runtimes ---
  { kind: 'brand', label: 'PyTorch', iconKey: 'siPytorch' },
  { kind: 'brand', label: 'TensorFlow', iconKey: 'siTensorflow' },
  { kind: 'brand', label: 'ONNX', iconKey: 'siOnnx' },
  { kind: 'brand', label: 'NVIDIA', iconKey: 'siNvidia' },
  { kind: 'brand', label: 'OpenCV', iconKey: 'siOpencv' },
  { kind: 'brand', label: 'scikit-learn', iconKey: 'siScikitlearn' },
  // --- agentic / LLM tooling ---
  { kind: 'brand', label: 'LangChain', iconKey: 'siLangchain' },
  { kind: 'brand', label: 'Hugging Face', iconKey: 'siHuggingface' },
  { kind: 'brand', label: 'Milvus', iconKey: 'siMilvus' },
  // --- scientific Python ---
  { kind: 'brand', label: 'NumPy', iconKey: 'siNumpy' },
  { kind: 'brand', label: 'pandas', iconKey: 'siPandas' },
  { kind: 'brand', label: 'Jupyter', iconKey: 'siJupyter' },
  // --- backend / web ---
  { kind: 'brand', label: 'FastAPI', iconKey: 'siFastapi' },
  { kind: 'brand', label: 'Next.js', iconKey: 'siNextdotjs' },
  { kind: 'brand', label: 'React', iconKey: 'siReact' },
  { kind: 'brand', label: 'Tailwind CSS', iconKey: 'siTailwindcss' },
  // --- platform / infra / tooling ---
  { kind: 'brand', label: 'Docker', iconKey: 'siDocker' },
  { kind: 'brand', label: 'Linux', iconKey: 'siLinux' },
  { kind: 'brand', label: 'Google Cloud', iconKey: 'siGooglecloud' },
  { kind: 'brand', label: 'GitHub', iconKey: 'siGithub' },
  { kind: 'brand', label: 'Git', iconKey: 'siGit' },
  { kind: 'brand', label: 'Arduino', iconKey: 'siArduino' },
  { kind: 'brand', label: 'Kubernetes', iconKey: 'siKubernetes' },
  { kind: 'brand', label: 'Raspberry Pi', iconKey: 'siRaspberrypi' },
  // --- DL frameworks (more) ---
  { kind: 'brand', label: 'Keras', iconKey: 'siKeras' },
  // --- CV / ML tooling & experiment tracking ---
  { kind: 'brand', label: 'Roboflow', iconKey: 'siRoboflow' },
  { kind: 'brand', label: 'Weights & Biases', iconKey: 'siWeightsandbiases' },
  { kind: 'brand', label: 'MLflow', iconKey: 'siMlflow' },
  { kind: 'brand', label: 'Kaggle', iconKey: 'siKaggle' },
  { kind: 'brand', label: 'Google Colab', iconKey: 'siGooglecolab' },
  // --- agentic / LLM tooling (more) ---
  { kind: 'brand', label: 'Ollama', iconKey: 'siOllama' },
  { kind: 'brand', label: 'Google Gemini', iconKey: 'siGooglegemini' },
  // --- scientific Python (more) ---
  { kind: 'brand', label: 'SciPy', iconKey: 'siScipy' },
  // --- ML app / demo frameworks ---
  { kind: 'brand', label: 'Gradio', iconKey: 'siGradio' },
  { kind: 'brand', label: 'Streamlit', iconKey: 'siStreamlit' },
  // --- C++ build & GUI tooling ---
  { kind: 'brand', label: 'CMake', iconKey: 'siCmake' },
  { kind: 'brand', label: 'Qt', iconKey: 'siQt' },
  // --- AI labs & agentic / RAG tooling ---
  { kind: 'brand', label: 'Anthropic', iconKey: 'siAnthropic' },
  { kind: 'brand', label: 'Mistral AI', iconKey: 'siMistralai' },
  { kind: 'brand', label: 'DeepMind', iconKey: 'siDeepmind' },
  { kind: 'brand', label: 'LangGraph', iconKey: 'siLanggraph' },
  { kind: 'brand', label: 'Qdrant', iconKey: 'siQdrant' },
  // --- hardware / device line-icons ---
  JETSON,
  CAMERA,
  DRONE,
  PHONE,
  GPU,
];
