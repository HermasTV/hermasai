// Portfolio case-studies for the /experience page.
//
// Media is initially the shared placeholder. Drop real assets at the canonical
// paths below and update each project's media field. Examples:
// /portfolio/biometri/cover.gif
// /portfolio/queue-management/cover.jpg
// /portfolio/smart-cities/cover.mp4
// /portfolio/adnoc-stations/cover.jpg
// /portfolio/adnoc-3d-vision/cover.mp4

export type PortfolioMedia =
  | { kind: 'image'; src: string; alt: string }
  | {
      kind: 'image-rotation';
      srcs: string[];
      alt: string;
      /** Time each image is shown before cross-fading to the next. */
      intervalMs?: number;
    }
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
    title: 'Biometri — ISO-Compliant E-KYC',
    role: 'Led R&D and delivery of the face-recognition and anti-spoofing stack.',
    paragraph:
      'A facial recognition platform engineered for high-stakes identity verification. I directed the research, training, and productization of the core face engine and the presentation-attack detection layer, successfully earning the system its ISO/IEC 30107 certification. This solution was seamlessly deployed into a diplomatic payment gateway and a regional educational attendance system running efficiently on Edge hardware.',
    highlights: [
      'Achieved ISO/IEC 30107 (Presentation Attack Detection) compliance.',
      'Powered the identity verification layer of a secure payment gateway for a diplomatic mission.',
      'Developed a custom-trained variant for high-volume student attendance, fully certified by the client.',
      'Optimized the on-device inference path for low-specification mobile units in the field.',
    ],
    kpis: [
      { label: 'Standard', value: 'ISO 30107' },
      { label: 'Transactions Daily', value: '5000+', numeric: 5000, suffix: 'k' },
      { label: 'Accuracy', value: '99.2%', numeric: 99.2, decimals: 1, suffix: '%' },
    ],
    tags: ['Face Recognition', 'Anti-Spoofing', 'ISO 30107', 'Edge ML'],
    media: {
      kind: 'image-rotation',
      srcs: [
        '/portfolio/biometri/biometri.webp',
        '/portfolio/biometri/school.webp',
      ],
      intervalMs: 5000,
      alt: 'Biometri face-recognition and anti-spoofing in production, including the school-attendance deployment.',
    },
  },
  {
    slug: 'queue-management',
    title: 'Vision AI Vehicle Inspection Center',
    role: 'From Faulty prototype to production-ready solution.',
    paragraph:
      'A computer-vision queue-management product designed for high-volume vehicle-inspection centers, where lane throughput directly dictates operational KPIs. I owned the hardening phase—transforming an initial pilot into a robust, production-ready system capable of withstanding extreme field conditions. The final architecture runs end-to-end on a single embedded edge device, eliminating cloud latency and dependencies.',
    highlights: [
      'Resolved all reported field anomalies across multiple pilot deployments.',
      'Re-architected the inference pipeline to run seamlessly on a single-board edge device.',
      'Sustained real-time processing throughput in demanding, multi-lane environments.',
    ],
    kpis: [
      { label: 'False Negatives', value: '0', numeric: 0 },
      { label: 'wait time reduction', value: '30%' },
      { label: 'Vehicles Processed Daily', value: '500+', numeric: 500 },
    ],
    tags: ['Edge AI', 'Object Tracking', 'IoT', 'Site Reliability'],
    media: {
      kind: 'image',
      src: '/portfolio/queue-management/vic.webp',
      alt: 'Vision AI vehicle-inspection center: cameras tracking vehicles through the inspection lanes in real time.',
    },
  },
  {
    slug: 'smart-cities',
    title: 'Smart Cities — Traffic Intelligence Platform',
    role: 'Directed model optimization and edge deployment of an 8-model AI suite.',
    paragraph:
      'A city-scale traffic-intelligence platform powered by eight cooperating computer-vision models, enabling multi-camera tracking, sensor-fusion speed estimation, in-cabin behavior detection, and an algorithmic reckless-driving classifier. I led the migration of the entire software suite from server-grade GPUs to NVIDIA Jetson AGX edge units in production. This effort maintained strict accuracy thresholds while unlocking real-time, multi-camera processing capabilities at the edge.',
    highlights: [
      'Engineered multi-camera, multi-object real-time tracking for both vehicles and pedestrians.',
      'Vision-based vehicle speed estimation.',
      'Seatbelt and phone-use detection models utilizing custom-collected datasets.',
      'Implemented algorithmic real-time reckless-driving recognition.',
      'Successfully compressed and re-validated eight distinct models for the Jetson AGX environment.',
    ],
    kpis: [
      { label: 'Speed-estimation error', value: '<3 km/h', numeric: 1, prefix: '<', suffix: ' km/h' },
      { label: 'In-cabin behavior accuracy', value: '95%', numeric: 95, suffix: '%' },
    ],
    tags: ['Multi-Camera Tracking', 'Edge Optimization', 'Jetson AGX', 'Speed Estimation'],
    media: {
      kind: 'video',
      src: '/portfolio/smart-cities/radar.mp4',
      poster: '/portfolio/smart-cities/radar-poster.webp',
      alt: 'Radar-fused traffic monitoring: vehicles tracked across lanes with live speed estimation.',
    },
  },
  {
    slug: 'Gas-stations',
    title: 'Cross-Camera Journey Analytics Platform',
    role: 'Lead Architect: End-to-end research, pipeline development, and deployment.',
    paragraph:
      'An end-to-end multi-camera tracking system developed for a major national energy provider, designed to stitch together the complex journeys of vehicles and pedestrians across expansive service station footprints. I independently managed this project from the initial research phase—selecting and optimizing the re-identification stack—through to full deployment. The system successfully translates raw camera feeds into actionable operational dashboards, significantly strengthening the security posture for site stakeholders.',
    highlights: [
      'Multi-camera vehicle & person re-ID across 20+ cameras site-wide.',
      'Searchable journey database — cut investigation time from hours to seconds.',
      'Real-time heatmaps & dwell analytics for ops and security teams.',
    ],
    kpis: [
      { label: 'Daily Entities', value: '1000+', numeric: 1000, suffix: '+' },
      { label: 'Uptime', value: '24/7' },
      { label: 'Accuracy ', value: '95%+ re-ID' },
    ],
    tags: ['Re-Identification', 'Multi-Camera', 'Analytics', 'Security'],
    media: {
      kind: 'image-rotation',
      srcs: [
        '/portfolio/adnoc-stations/shop-view.webp',
        '/portfolio/adnoc-stations/car-parked.webp',
        '/portfolio/adnoc-stations/car-leave.webp',
      ],
      intervalMs: 5000,
      alt: 'Cross-camera journey analytics: vehicles and people tracked across service-station cameras.',
    },
  },
  {
    slug: 'adnoc-3d-vision',
    title: '3DAI Vehicle Inspection and Audit',
    role: 'Managed the end-to-end proof of concept architecture and delivery.',
    paragraph:
      'A pioneering proof-of-concept initiative translating advanced Gaussian splatting algorithm into practical, industrial vehicle-inspection workflows. I led the development of a complete pipeline capable of capturing a vehicle in-bay and reconstructing it in high-fidelity 3D. The resulting operator-facing navigable model provided audit-grade documentation, equipping inspectors with next-generation spatial visualization tools that revolutionized their standard operational procedures.',
    highlights: [
      'Built an end-to-end Gaussian-splatting pipeline optimized for confined in-bay capture environments.',
      'Developed an interactive, operator-facing 3D viewer tailored for detailed inspection and audit documentation.',
      'Validated the underlying technology as a scalable foundation for future remote inspection workflows.',
    ],
    kpis: [
      { label: 'Manual Effort', value: '70% less', numeric: 70, suffix: '%' },
      { label: 'Scan Time', value: '<5 min', numeric: 5, prefix: '<', suffix: ' min' },
      { label: 'PSNR', value: '<30db', numeric: 30, prefix: '<', suffix: ' db' }, 
    ],
    tags: ['Gaussian Splatting', '3D Reconstruction', 'Inspection'],
    media: {
      kind: 'video',
      src: '/portfolio/adnoc-3d-vision/3d.mp4',
      poster: '/portfolio/adnoc-3d-vision/3d-poster.webp',
      alt: 'Gaussian-splatting 3D reconstruction of a vehicle, orbiting for inspection and audit documentation.',
    },
  },
];