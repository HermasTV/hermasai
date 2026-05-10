// Portfolio case-studies for the /contact (Experience) page.
//
// Media is initially the shared placeholder. Drop real assets at the canonical
// paths below and update each project's `media` field. Examples:
//   /portfolio/biometri/cover.gif
//   /portfolio/queue-management/cover.jpg
//   /portfolio/smart-cities/cover.mp4
//   /portfolio/adnoc-stations/cover.jpg
//   /portfolio/adnoc-3d-vision/cover.mp4

export type PortfolioMedia =
  | { kind: 'image'; src: string; alt: string }
  | { kind: 'gif'; src: string; alt: string }
  | { kind: 'video'; src: string; poster?: string; alt: string };

export type PortfolioKpi = {
  /** Display label, e.g. "Roll-call time", "Speed-estimation error". */
  label: string;
  /** Final string shown after the counter (or static if numeric is omitted). */
  value: string;
  /** Numeric target for the count-up animation. Omit for static KPIs. */
  numeric?: number;
  /** Decimal places when interpolating numeric values. */
  decimals?: number;
  /** Optional prefix (e.g. "<", "~"). */
  prefix?: string;
  /** Optional suffix (e.g. "%", "×", " km/h"). */
  suffix?: string;
};

export type PortfolioProject = {
  slug: string;
  eyebrow: string;
  title: string;
  role: string;
  paragraph: string;
  highlights: string[];
  kpis: PortfolioKpi[];
  tags: string[];
  media: PortfolioMedia;
};

const PLACEHOLDER: PortfolioMedia = {
  kind: 'image',
  src: '/portfolio/placeholder.svg',
  alt: 'Project media placeholder',
};

export const PORTFOLIO: PortfolioProject[] = [
  {
    slug: 'biometri',
    eyebrow: 'Tahaluf UAE · 2024 · AI Lead',
    title: 'Biometri — ISO-Compliant E-KYC',
    role: 'Led R&D and delivery of the face-recognition + anti-spoofing stack.',
    paragraph:
      'A face-recognition platform engineered for high-stakes identity verification. I led the research, training, and productization of the core face engine and the presentation-attack detection layer that earned the system its ISO/IEC 30107 certification — and shipped it into a sovereign-grade payments gateway and a school-attendance product running on commodity hardware.',
    highlights: [
      'Achieved ISO/IEC 30107 (Presentation Attack Detection) compliance.',
      'Powered the identity layer of a sovereign consular payments gateway.',
      'Custom-trained variant for student attendance, certified by the client.',
      'On-device inference path for low-spec phones in the field.',
    ],
    kpis: [
      { label: 'Standard', value: 'ISO 30107' },
      { label: 'Roll-call speedup', value: '10×', numeric: 10, suffix: '×' },
      { label: 'Spoof rejection', value: 'Real-time' },
    ],
    tags: ['Face Recognition', 'Anti-Spoofing', 'ISO 30107', 'Edge ML'],
    media: {
      ...PLACEHOLDER,
      alt: 'Biometri anti-spoofing demo placeholder',
    },
  },
  {
    slug: 'queue-management',
    eyebrow: 'Tahaluf UAE · 2023 · AI Engineer',
    title: 'AI-Vision Queue Intelligence for Inspection Lanes',
    role: 'Drove product hardening and edge-deployment for vehicle-inspection centers.',
    paragraph:
      'A computer-vision queue-management product for vehicle-inspection centers, where lane throughput translates directly into operator KPIs. I owned the hardening phase — turning a brittle pilot into a system that survives every site condition reported from the field, and runs end-to-end on a single embedded edge device with no cloud round-trip.',
    highlights: [
      'Closed every reported field issue across pilot sites.',
      'Re-architected inference for a single-board edge device.',
      'Sustained real-time throughput on busy multi-lane sites.',
    ],
    kpis: [
      { label: 'Field issues open', value: '0', numeric: 0 },
      { label: 'Cloud round-trip', value: 'None' },
      { label: 'Inference', value: 'Real-time' },
    ],
    tags: ['Edge AI', 'Object Tracking', 'IoT', 'Site Reliability'],
    media: { ...PLACEHOLDER, alt: 'Queue management vision system placeholder' },
  },
  {
    slug: 'smart-cities',
    eyebrow: 'Tahaluf UAE · 2022 · AI Engineer',
    title: 'Smart Cities — Traffitix & Initor',
    role: 'Led model-optimization and edge deployment of an 8-model AI suite.',
    paragraph:
      'A city-scale traffic-intelligence platform built around eight cooperating computer-vision models — multi-camera tracking, multi-sensor speed estimation, in-cabin behavior detection, and an algorithmic reckless-driving classifier. I led the work to ship the entire suite from server-grade GPUs onto NVIDIA AGX Jetson edge units in production, holding the accuracy line within a few percentage points while unlocking realtime multi-camera deployments.',
    highlights: [
      'Multi-camera, multi-object realtime tracking (vehicles + pedestrians).',
      'Multi-sensor vision-based vehicle speed estimation.',
      'Seatbelt and phone-use detection on custom-collected data.',
      'Algorithmic realtime reckless-driving recognition.',
      'Eight models compressed and re-validated for AGX Jetson.',
    ],
    kpis: [
      { label: 'Speed-estimation error', value: '<1 km/h', numeric: 1, prefix: '<', suffix: ' km/h' },
      { label: 'In-cabin behavior accuracy', value: '95%', numeric: 95, suffix: '%' },
      { label: 'Edge accuracy drop', value: '<3%', numeric: 3, prefix: '<', suffix: '%' },
      { label: 'Models on edge', value: '8', numeric: 8 },
    ],
    tags: ['Multi-Camera Tracking', 'Edge Optimization', 'Jetson AGX', 'Speed Estimation'],
    media: { ...PLACEHOLDER, alt: 'Smart cities traffic intelligence placeholder' },
  },
  {
    slug: 'adnoc-stations',
    eyebrow: 'Tahaluf UAE · 2023 · Project Owner',
    title: 'ADNOC Smart Stations — Journey Analytics',
    role: 'Sole owner: research, build, and deployment.',
    paragraph:
      'An end-to-end multi-camera tracking system for ADNOC fuel stations, stitching the journeys of vehicles and people across the entire station footprint. I owned this one alone — from the research that picked the right re-identification stack, through the deployment that turned raw camera feeds into operational dashboards and a stronger security posture for site operators.',
    highlights: [
      'Multi-camera vehicle and person re-identification across station premises.',
      'Operational analytics surfaced for station and HQ stakeholders.',
      'Strengthened security posture through anomaly detection.',
    ],
    kpis: [
      { label: 'Coverage', value: 'Full-site' },
      { label: 'Ownership', value: 'End-to-end' },
      { label: 'Output', value: 'Live insights' },
    ],
    tags: ['Re-Identification', 'Multi-Camera', 'Analytics', 'Security'],
    media: { ...PLACEHOLDER, alt: 'ADNOC station journey analytics placeholder' },
  },
  {
    slug: 'adnoc-3d-vision',
    eyebrow: 'Tahaluf UAE · 2024 · Project Lead',
    title: 'ADNOC 3D Vision — Vehicle Inspection POC',
    role: 'Managed the end-to-end POC.',
    paragraph:
      'A proof-of-concept that brings Gaussian splatting out of the research lab and into a vehicle-inspection bay. I led the build of an end-to-end pipeline that captures a vehicle, reconstructs it in 3D, and hands operators a navigable model for inspection and audit-grade documentation — giving inspectors a tool that didn’t exist in this workflow before.',
    highlights: [
      'End-to-end Gaussian-splatting pipeline tuned for in-bay capture.',
      'Operator-facing 3D viewer for inspection and documentation.',
      'Validated as a foundation for remote inspection workflows.',
    ],
    kpis: [
      { label: 'Technique', value: '3D Gaussian Splatting' },
      { label: 'Pipeline', value: 'End-to-end' },
      { label: 'Stage', value: 'POC delivered' },
    ],
    tags: ['Gaussian Splatting', '3D Reconstruction', 'Inspection', 'POC'],
    media: { ...PLACEHOLDER, alt: 'ADNOC 3D vision inspection placeholder' },
  },
];
