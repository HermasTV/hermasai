"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ParticleSystem } from "./ParticleSystem";
import styles from "./page.module.css";

// ─── i18n ────────────────────────────────────────────────────────────────────

const translations = {
  en: {
    title: "I Am Not a Number",
    subtitle: "In memory of the <strong>72,000+</strong> Palestinians killed in the Israeli genocide in Gaza.",
    toggle: "عربي",
    footer: "Each light represents a life. Hover to remember them.",
    age: "Age",
    born: "Born",
    loading: "Loading 60,199 lives...",
    filterTitle: "Filter by Age",
    filterShowing: "Showing:",
    filterReset: "Reset",
    searchTitle: "Search by Name",
    searchPlaceholder: "Enter a name / أدخل اسمًا",
    searchShowing: "Showing:",
    searchReset: "Reset",
    infoBody: `<p>This visual shows the names of 60,199 Palestinians killed by Israeli forces in Gaza from 7 Oct 2023 to 31 Jul 2025. This staggering figure includes only those whose names and ages could be identified by the Ministry of Health in Gaza up to that date. The number as of February 2026 has increased to 73,188+. Thousands of people remain unidentified because their bodies are damaged beyond recognition, they have no surviving family to identify them, or the Ministry of Health in Gaza has been unable to recover their bodies amid the ongoing genocide.</p><p>The names were translated by <a href='https://iraqbodycount.org/' target='_blank' rel='noopener'>Iraq Body Count</a>. We are grateful for their work, which they have released as a <a href='https://www.iraqbodycount.org/pal/moh_2025-07-31.xlsx' target='_blank' rel='noopener'>public spreadsheet.</a></p><p>We will continue to update this visual as more information becomes available.</p><p>This visualization is inspired by <a href='https://visualizingpalestine.org/gaza-names/en.html' target='_blank' rel='noopener'>Remember Their Names</a>.</p>`,
  },
  ar: {
    title: "أنا لست مجرّد رقم",
    subtitle: "في ذكرى <strong>٧٢,٠٠٠+</strong> فلسطينيًّا قُتلوا في غزّة في الإبادة الجماعية الإسرائيلية.",
    toggle: "English",
    footer: "كل ضوء يمثّل حياة. مرّر المؤشر لتتذكّرهم.",
    age: "العمر",
    born: "تاريخ الميلاد",
    loading: "...جارٍ تحميل ٦٠,١٩٩ حياة",
    filterTitle: "تصفية حسب العمر",
    filterShowing: ":يُعرَض",
    filterReset: "إعادة تعيين",
    searchTitle: "البحث بالاسم",
    searchPlaceholder: "أدخل اسمًا / Enter a name",
    searchShowing: ":يُعرَض",
    searchReset: "إعادة تعيين",
    infoBody: `<p>يعرض هذا العمل المرئي أسماء ٦٠,١٩٩ فلسطينيًّا قتلتهم القوات الإسرائيلية في غزّة من ٧ أكتوبر ٢٠٢٣ إلى ٣١ يوليو ٢٠٢٥. يشمل هذا الرقم فقط أولئك الذين تمكّنت وزارة الصحة في غزّة من التعرّف على أسمائهم وأعمارهم حتى ذلك التاريخ. ارتفع العدد في فبراير ٢٠٢٦ إلى أكثر من ٧٣,١٨٨+. لا يزال آلاف الأشخاص مجهولي الهوية لأن أجسادهم تضرّرت بشكل يتعذّر معه التعرّف عليهم، أو لعدم وجود أسرة على قيد الحياة للتعرّف عليهم، أو لعدم تمكّن وزارة الصحة في غزّة من انتشال جثثهم في ظل الإبادة الجماعية المستمرة.</p><p>تُرجمت الأسماء بواسطة <a href='https://iraqbodycount.org/' target='_blank' rel='noopener'>Iraq Body Count</a>. نحن ممتنّون لعملهم الذي أتاحوه <a href='https://www.iraqbodycount.org/pal/moh_2025-07-31.xlsx' target='_blank' rel='noopener'>كجدول بيانات عام.</a></p><p>سنواصل تحديث هذا العمل المرئي كلّما توفّرت معلومات جديدة.</p><p>هذا التمثيل البصري مستوحى من <a href='https://visualizingpalestine.org/gaza-names/en.html' target='_blank' rel='noopener'>تذكروا أسماءهم</a>.</p>`,
  },
} as const;

type Lang = keyof typeof translations;

// ─── Types ───────────────────────────────────────────────────────────────────

interface VictimData {
  n: string;  // English name
  a: string;  // Arabic name
  g: string;  // Age string
  b: string;  // Birth date
  s: "m" | "f"; // Sex
}

interface InfoCard {
  visible: boolean;
  name: string;
  nameAlt: string;
  age: string;
  born: string;
  x: number;
  y: number;
  nameFontFamily: string;
  nameAltFontFamily: string;
  nameAltDir: string;
  profileSlug?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseAgeToYears(ageStr: string): number {
  if (!ageStr) return -1;
  const s = String(ageStr).toLowerCase().trim();
  if (s === "less than a day") return 0;
  const num = parseInt(s);
  if (isNaN(num)) return -1;
  if (s.includes("day") || s.includes("month")) return 0;
  return num;
}

function drawSilhouette(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  alpha: number,
  sex: "m" | "f"
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "#fff";

  if (sex === "f") {
    ctx.beginPath(); ctx.arc(0, -24, 7, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-7, -26); ctx.quadraticCurveTo(-10, -20, -9, -14); ctx.lineTo(-7, -14); ctx.quadraticCurveTo(-8, -20, -5, -25); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(7, -26); ctx.quadraticCurveTo(10, -20, 9, -14); ctx.lineTo(7, -14); ctx.quadraticCurveTo(8, -20, 5, -25); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-7, -15); ctx.quadraticCurveTo(-9, -10, -8, -4); ctx.quadraticCurveTo(-6, 0, -5, 2); ctx.lineTo(5, 2); ctx.quadraticCurveTo(6, 0, 8, -4); ctx.quadraticCurveTo(9, -10, 7, -15); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-5, 2); ctx.quadraticCurveTo(-12, 14, -11, 25); ctx.lineTo(11, 25); ctx.quadraticCurveTo(12, 14, 5, 2); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-7, -14); ctx.quadraticCurveTo(-14, -4, -12, 6); ctx.lineTo(-9, 6); ctx.quadraticCurveTo(-11, -3, -5, -12); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(7, -14); ctx.quadraticCurveTo(14, -4, 12, 6); ctx.lineTo(9, 6); ctx.quadraticCurveTo(11, -3, 5, -12); ctx.closePath(); ctx.fill();
  } else {
    ctx.beginPath(); ctx.arc(0, -22, 7, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-8, -13); ctx.quadraticCurveTo(-9, -5, -7, 2); ctx.lineTo(-5, 6); ctx.lineTo(5, 6); ctx.lineTo(7, 2); ctx.quadraticCurveTo(9, -5, 8, -13); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-8, -13); ctx.quadraticCurveTo(-14, -2, -12, 8); ctx.lineTo(-9, 8); ctx.quadraticCurveTo(-11, -1, -6, -11); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(8, -13); ctx.quadraticCurveTo(14, -2, 12, 8); ctx.lineTo(9, 8); ctx.quadraticCurveTo(13, -1, 8, -11); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-5, 6); ctx.quadraticCurveTo(-6, 16, -7, 25); ctx.lineTo(-3, 25); ctx.quadraticCurveTo(-2, 16, -2, 6); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(5, 6); ctx.quadraticCurveTo(6, 16, 7, 25); ctx.lineTo(3, 25); ctx.quadraticCurveTo(2, 16, 2, 6); ctx.closePath(); ctx.fill();
  }

  ctx.restore();
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function IAmNotANumberPage() {
  // Canvas and container refs
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // Map of dataIndex → { slug, hasPicture } for profiles that exist in the DB
  const profilesMap = useRef<Map<number, { slug: string; hasPicture: boolean }>>(new Map());

  // All animation-loop state in a single mutable ref to avoid stale closures
  const S = useRef({
    particles: null as ParticleSystem | null,
    overlayCtx: null as CanvasRenderingContext2D | null,
    data: [] as VictimData[],
    ageValues: [] as number[],
    // Mouse coords in device pixels, relative to container
    mouseX: -1000,
    mouseY: -1000,
    // Viewport coords for info card (position:absolute in container)
    cMouseX: -1000,
    cMouseY: -1000,
    currentHovered: -1,
    hoverAnim: 0,
    lastTime: 0,
    raf: 0,
    lang: "en" as Lang,
    searchQuery: "",
    filterMin: 0,
    filterMax: 110,
    isMuted: false,
    isMobile: false,
    audioUnlocked: false,
    targetVol: 0,
    fadeInterval: null as ReturnType<typeof setInterval> | null,
    searchDebounce: null as ReturnType<typeof setTimeout> | null,
  });

  // React UI state
  const [lang, setLang] = useState<Lang>("en");
  const [phase, setPhase] = useState<"loading" | "ready" | "fading" | "entered">("loading");
  const [fillWidth, setFillWidth] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [filterMin, setFilterMin] = useState(0);
  const [filterMax, setFilterMax] = useState(110);
  const [visibleCount, setVisibleCount] = useState("60,199");
  const [infoCard, setInfoCard] = useState<InfoCard>({
    visible: false,
    name: "",
    nameAlt: "",
    age: "",
    born: "",
    x: 0,
    y: 0,
    nameFontFamily: "'Inter', sans-serif",
    nameAltFontFamily: "'Noto Kufi Arabic', sans-serif",
    nameAltDir: "rtl",
  });

  const t = (key: keyof typeof translations.en) => translations[lang][key];

  // ── Audio helpers ───────────────────────────────────────────────────────────

  function startFade() {
    const s = S.current;
    const audio = audioRef.current;
    if (!audio || s.fadeInterval) return;
    s.fadeInterval = setInterval(() => {
      const diff = s.targetVol - audio.volume;
      if (Math.abs(diff) < 0.003) {
        audio.volume = s.targetVol;
        clearInterval(s.fadeInterval!);
        s.fadeInterval = null;
      } else {
        audio.volume = Math.min(1, Math.max(0, audio.volume + (diff > 0 ? 0.008 : -0.005)));
      }
    }, 30);
  }

  function fadeInAudio() {
    const s = S.current;
    if (s.isMuted || !s.audioUnlocked) return;
    s.targetVol = 0.10;
    startFade();
  }

  function fadeOutAudio() {
    S.current.targetVol = 0;
    if (!S.current.audioUnlocked) return;
    startFade();
  }

  // ── Filter / search ─────────────────────────────────────────────────────────

  function applyFilters(minOverride?: number, maxOverride?: number, queryOverride?: string) {
    const s = S.current;
    if (!s.particles) return;
    const min = minOverride ?? s.filterMin;
    const max = maxOverride ?? s.filterMax;
    const query = (queryOverride ?? s.searchQuery).toLowerCase();
    let count = 0;
    for (let i = 0; i < s.data.length; i++) {
      const age = s.ageValues[i];
      let vis = age >= min && age <= max;
      if (vis && query) {
        const d = s.data[i];
        vis = (d.n?.toLowerCase().includes(query)) || (d.a?.includes(queryOverride ?? s.searchQuery));
      }
      s.particles.setVisible(i, vis);
      if (vis) count++;
    }
    setVisibleCount(count.toLocaleString());
  }

  // ── Overlay (silhouette) renderer ──────────────────────────────────────────

  function renderOverlay(dt: number) {
    const s = S.current;
    if (!s.overlayCtx || !overlayRef.current) return;
    const dpr = window.devicePixelRatio || 1;
    s.overlayCtx.clearRect(0, 0, overlayRef.current.width / dpr, overlayRef.current.height / dpr);
    if (s.currentHovered >= 0 && s.particles) {
      s.hoverAnim = Math.min(1, s.hoverAnim + dt * 3);
      const px = s.mouseX / dpr;
      const py = s.mouseY / dpr;
      const idx = s.currentHovered;
      const phase = s.particles.phases![idx];
      const drift = Math.sin(s.particles.time * 0.3 + phase) * 2.0;
      const driftY = Math.cos(s.particles.time * 0.2 + phase * 1.3) * 1.5;
      const bx = (s.particles.basePositions![idx * 2] + drift) / dpr;
      const by = (s.particles.basePositions![idx * 2 + 1] + driftY) / dpr;
      const sex = idx < s.data.length ? s.data[idx].s : "m";
      drawSilhouette(s.overlayCtx, bx, by, s.hoverAnim * 1.2, s.hoverAnim * 0.9, sex);
    }
  }

  // ── Info card update ────────────────────────────────────────────────────────

  function updateHover() {
    const s = S.current;
    if (!s.particles) return;
    const idx = s.particles.getIndexAt(s.mouseX, s.mouseY);
    if (idx === s.currentHovered) return;
    s.currentHovered = idx;
    s.particles.setHovered(idx);
    s.hoverAnim = 0;

    if (idx >= 0 && idx < s.data.length) {
      fadeInAudio();
      const d = s.data[idx];
      const container = containerRef.current;
      if (!container) return;
      const dpr = window.devicePixelRatio || 1;
      const px = s.mouseX / dpr;
      const py = s.mouseY / dpr;
      const cW = container.clientWidth;
      const cH = container.clientHeight;
      const cardW = 280;
      const cardH = 120;
      let cardX = px + 20;
      let cardY = py - 20;
      if (s.isMobile) {
        cardX = px - cardW / 2;
        cardY = py - cardH - 60;
      } else {
        if (cardX + cardW > cW) cardX = px - cardW;
      }
      if (cardX + cardW > cW - 10) cardX = cW - cardW - 10;
      if (cardX < 10) cardX = 10;
      if (cardY + cardH > cH - 10) cardY = py - cardH - 20;
      if (cardY < 10) cardY = py + 40;

      const isAr = s.lang === "ar";
      const profile = profilesMap.current.get(idx);
      setInfoCard({
        visible: true,
        name: isAr ? d.a : d.n,
        nameAlt: isAr ? d.n : d.a,
        age: `${translations[s.lang].age}: ${d.g}`,
        born: `${translations[s.lang].born}: ${d.b}`,
        x: cardX,
        y: cardY,
        nameFontFamily: isAr ? "'Noto Kufi Arabic', sans-serif" : "'Inter', sans-serif",
        nameAltFontFamily: isAr ? "'Inter', sans-serif" : "'Noto Kufi Arabic', sans-serif",
        nameAltDir: isAr ? "ltr" : "rtl",
        profileSlug: profile?.slug,
      });
    } else {
      setInfoCard((c) => ({ ...c, visible: false }));
      fadeOutAudio();
    }
  }

  // ── Animation loop ──────────────────────────────────────────────────────────

  function animate(timestamp: number) {
    const s = S.current;
    if (!s.particles) return;
    const dt = Math.min((timestamp - s.lastTime) / 1000, 0.05);
    s.lastTime = timestamp;
    updateHover();
    s.particles.render(dt);
    renderOverlay(dt);
    s.raf = requestAnimationFrame(animate);
  }

  // ── Resize ──────────────────────────────────────────────────────────────────

  function handleResize() {
    const s = S.current;
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const overlay = overlayRef.current;
    if (!container || !canvas || !overlay || !s.particles) return;
    const dpr = window.devicePixelRatio || 1;
    const w = container.clientWidth * dpr;
    const h = container.clientHeight * dpr;
    canvas.width = w;
    canvas.height = h;
    s.particles.resize(w, h);
    overlay.width = w;
    overlay.height = h;
    s.overlayCtx = overlay.getContext("2d");
    if (s.overlayCtx) s.overlayCtx.scale(dpr, dpr);
  }

  // ── Enter handler (called when user clicks Enter button) ────────────────────

  function handleEnter() {
    const s = S.current;
    const audio = audioRef.current;
    const canvas = canvasRef.current;
    const overlay = overlayRef.current;
    const container = containerRef.current;
    if (!canvas || !overlay || !container) return;

    // Unlock audio on this user gesture
    if (audio && !s.isMuted) {
      audio.volume = 0;
      audio.play().then(() => { s.audioUnlocked = true; }).catch(() => {});
    }

    // Init WebGL
    const dpr = window.devicePixelRatio || 1;
    const w = container.clientWidth * dpr;
    const h = container.clientHeight * dpr;
    canvas.width = w;
    canvas.height = h;
    canvas.style.width = container.clientWidth + "px";
    canvas.style.height = container.clientHeight + "px";

    s.particles = new ParticleSystem(canvas);
    s.particles.init(s.data.length, w, h);

    // Init overlay
    overlay.width = w;
    overlay.height = h;
    s.overlayCtx = overlay.getContext("2d");
    if (s.overlayCtx) s.overlayCtx.scale(dpr, dpr);

    // Start animation
    s.lastTime = performance.now();
    s.raf = requestAnimationFrame(animate);

    // Fade out loading screen
    setPhase("fading");
    setTimeout(() => setPhase("entered"), 800);
  }

  // ── Toggle language ─────────────────────────────────────────────────────────

  function toggleLang() {
    const newLang: Lang = S.current.lang === "en" ? "ar" : "en";
    S.current.lang = newLang;
    setLang(newLang);
    // Refresh info card text if visible
    const s = S.current;
    if (s.currentHovered >= 0 && s.currentHovered < s.data.length) {
      const d = s.data[s.currentHovered];
      const isAr = newLang === "ar";
      setInfoCard((c) => ({
        ...c,
        name: isAr ? d.a : d.n,
        nameAlt: isAr ? d.n : d.a,
        age: `${translations[newLang].age}: ${d.g}`,
        born: `${translations[newLang].born}: ${d.b}`,
        nameFontFamily: isAr ? "'Noto Kufi Arabic', sans-serif" : "'Inter', sans-serif",
        nameAltFontFamily: isAr ? "'Inter', sans-serif" : "'Noto Kufi Arabic', sans-serif",
        nameAltDir: isAr ? "ltr" : "rtl",
      }));
    }
  }

  // ── Toggle mute ─────────────────────────────────────────────────────────────

  function toggleMute() {
    const s = S.current;
    const audio = audioRef.current;
    const newMuted = !s.isMuted;
    s.isMuted = newMuted;
    setIsMuted(newMuted);

    if (!audio) return;

    if (!s.audioUnlocked) {
      audio.volume = newMuted ? 0 : 0.10;
      audio.muted = newMuted;
      audio.play().then(() => { s.audioUnlocked = true; }).catch(() => {});
      return;
    }

    if (newMuted) {
      audio.muted = true;
    } else {
      audio.muted = false;
      if (s.isMobile) {
        s.targetVol = 0.10;
        audio.volume = 0.10;
      } else if (s.currentHovered >= 0) {
        fadeInAudio();
      }
    }
  }

  // ── Mouse / touch events ────────────────────────────────────────────────────

  function onMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    S.current.mouseX = (e.clientX - rect.left) * dpr;
    S.current.mouseY = (e.clientY - rect.top) * dpr;
  }

  function onMouseLeave() {
    S.current.mouseX = -1000;
    S.current.mouseY = -1000;
    S.current.currentHovered = -1;
    S.current.particles?.setHovered(-1);
    setInfoCard((c) => ({ ...c, visible: false }));
    fadeOutAudio();
  }

  // ── Main effect: load data + setup touch events + resize ───────────────────

  useEffect(() => {
    const s = S.current;
    s.isMobile = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      ("ontouchstart" in window && navigator.maxTouchPoints > 1);
    s.isMuted = s.isMobile;
    if (s.isMobile) setIsMuted(true);

    // Load data and profiles map in parallel
    (async () => {
      setFillWidth(30);
      const [dataResp, profilesResp] = await Promise.all([
        fetch("/i-am-not-a-number/data.json"),
        fetch("/api/victim-profiles").catch(() => null),
      ]);
      setFillWidth(70);
      s.data = await dataResp.json();
      s.ageValues = s.data.map((d) => parseAgeToYears(d.g));

      if (profilesResp?.ok) {
        const profileData: Record<string, { slug: string; hasPicture: boolean }> = await profilesResp.json();
        profilesMap.current = new Map(
          Object.entries(profileData).map(([k, v]) => [Number(k), v])
        );
      }

      setFillWidth(100);
      setTimeout(() => setPhase("ready"), 300);
    })();

    // Touch events (need passive: false for touchmove)
    const canvas = canvasRef.current;
    if (canvas) {
      const onTouchStart = (e: TouchEvent) => {
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        const touch = e.touches[0];
        s.mouseX = (touch.clientX - rect.left) * dpr;
        s.mouseY = (touch.clientY - rect.top) * dpr;
      };
      const onTouchMove = (e: TouchEvent) => {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        const touch = e.touches[0];
        s.mouseX = (touch.clientX - rect.left) * dpr;
        s.mouseY = (touch.clientY - rect.top) * dpr;
      };
      const onTouchEnd = () => {
        s.mouseX = -1000;
        s.mouseY = -1000;
        s.currentHovered = -1;
        s.particles?.setHovered(-1);
        setInfoCard((c) => ({ ...c, visible: false }));
      };
      canvas.addEventListener("touchstart", onTouchStart, { passive: true });
      canvas.addEventListener("touchmove", onTouchMove, { passive: false });
      canvas.addEventListener("touchend", onTouchEnd);

      return () => {
        canvas.removeEventListener("touchstart", onTouchStart);
        canvas.removeEventListener("touchmove", onTouchMove);
        canvas.removeEventListener("touchend", onTouchEnd);
      };
    }
  }, []);

  // Resize listener
  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      const s = S.current;
      if (s.raf) cancelAnimationFrame(s.raf);
      if (s.fadeInterval) clearInterval(s.fadeInterval);
      if (s.searchDebounce) clearTimeout(s.searchDebounce);
    };
  }, []);

  // ── Filter handlers ─────────────────────────────────────────────────────────

  function onFilterMinChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = Math.min(parseInt(e.target.value), filterMax);
    S.current.filterMin = val;
    setFilterMin(val);
    applyFilters(val, undefined);
  }

  function onFilterMaxChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = Math.max(parseInt(e.target.value), filterMin);
    S.current.filterMax = val;
    setFilterMax(val);
    applyFilters(undefined, val);
  }

  function onFilterReset() {
    S.current.filterMin = 0;
    S.current.filterMax = 110;
    setFilterMin(0);
    setFilterMax(110);
    applyFilters(0, 110);
  }

  function onSearchInput(e: React.ChangeEvent<HTMLInputElement>) {
    const s = S.current;
    if (s.searchDebounce) clearTimeout(s.searchDebounce);
    const query = e.target.value.trim();
    s.searchDebounce = setTimeout(() => {
      s.searchQuery = query;
      applyFilters(undefined, undefined, query);
    }, 200);
  }

  function onSearchReset() {
    S.current.searchQuery = "";
    if (searchInputRef.current) searchInputRef.current.value = "";
    applyFilters(undefined, undefined, "");
  }

  // ── Range fill percentages ──────────────────────────────────────────────────

  const fillLeft = `${(filterMin / 110) * 100}%`;
  const fillW = `${((filterMax - filterMin) / 110) * 100}%`;

  const isRtl = lang === "ar";

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div
      ref={containerRef}
      className="relative bg-black text-white overflow-hidden cursor-default"
      style={{ height: "100dvh" }}
      dir={isRtl ? "rtl" : "ltr"}
    >

        {/* WebGL particle canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
        />

        {/* 2D silhouette overlay */}
        <canvas
          ref={overlayRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 20 }}
        />

        {/* ── Header overlay ── */}
        <div
          className="absolute inset-x-0 top-0 text-center pointer-events-none"
          style={{
            padding: "56px 20px 20px",
            zIndex: 10,
            background: "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)",
          }}
        >
          <img
            src="/i-am-not-a-number/Handala.png"
            alt="Handala"
            style={{ height: "clamp(40px,7vw,80px)", marginBottom: 8, filter: "invert(1)", opacity: 0.85 }}
          />
          <h1
            style={{
              fontSize: "clamp(1.3rem,3.5vw,2.8rem)",
              fontWeight: 300,
              letterSpacing: isRtl ? 0 : "0.15em",
              textTransform: isRtl ? "none" : "uppercase",
              marginBottom: 6,
              fontFamily: isRtl ? "'Noto Kufi Arabic', sans-serif" : "'Inter', sans-serif",
            }}
          >
            {t("title")}
          </h1>
          <p
            dangerouslySetInnerHTML={{ __html: t("subtitle") }}
            style={{ fontSize: "clamp(0.7rem,1.3vw,0.95rem)", fontWeight: 300 }}
          />
        </div>

        {/* ── Top buttons ── */}
        <div
          className="absolute flex gap-2"
          style={{
            top: 52,
            [isRtl ? "left" : "right"]: 16,
            zIndex: 30,
          }}
        >
          <button onClick={toggleLang} style={btnStyle}>
            {t("toggle")}
          </button>
          <button onClick={() => setShowModal(true)} style={{ ...btnStyle, width: 36, fontFamily: "Georgia, serif", fontStyle: "italic", fontWeight: 600 }}>
            i
          </button>
          <button onClick={() => { setShowSearch((v) => !v); setTimeout(() => searchInputRef.current?.focus(), 50); }} style={{ ...btnStyle, width: 36, padding: 8 }}>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx={11} cy={11} r={8} /><line x1={21} y1={21} x2={16.65} y2={16.65} />
            </svg>
          </button>
          <button onClick={() => setShowFilter((v) => !v)} style={{ ...btnStyle, width: 36, padding: 8 }}>
            <svg width={16} height={16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path d="M1 3h14M3 8h10M5.5 13h5" />
            </svg>
          </button>
          <button onClick={toggleMute} style={{ ...btnStyle, width: 36, padding: 8 }}>
            {isMuted ? (
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <line x1={23} y1={9} x2={17} y2={15} /><line x1={17} y1={9} x2={23} y2={15} />
              </svg>
            ) : (
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
            )}
          </button>
        </div>

        {/* ── Info card ── */}
        {infoCard.visible && (
          <div
            className="absolute"
            style={{
              left: infoCard.x,
              top: infoCard.y,
              zIndex: 15,
              background: "rgba(0,0,0,0.85)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 8,
              padding: "14px 18px",
              minWidth: 220,
              maxWidth: 320,
              backdropFilter: "blur(10px)",
              transition: "opacity 0.2s ease",
            }}
          >
            <p style={{ fontSize: "1.05rem", fontWeight: 600, marginBottom: 2, lineHeight: 1.4, fontFamily: infoCard.nameFontFamily }}>
              {infoCard.name}
            </p>
            <p style={{ fontSize: "0.88rem", fontWeight: 300, opacity: 0.6, marginBottom: 10, fontFamily: infoCard.nameAltFontFamily, lineHeight: 1.5 }} dir={infoCard.nameAltDir}>
              {infoCard.nameAlt}
            </p>
            <div style={{ display: "flex", gap: 16, fontSize: "0.78rem", opacity: 0.5 }}>
              <span>{infoCard.age}</span>
              <span>{infoCard.born}</span>
            </div>
            {infoCard.profileSlug && (
              <Link
                href={`/projects/i-am-not-a-number/profile/${infoCard.profileSlug}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  marginTop: 12,
                  fontSize: "0.75rem",
                  color: "rgba(255,255,255,0.9)",
                  textDecoration: "none",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  borderTop: "1px solid rgba(255,255,255,0.1)",
                  paddingTop: 10,
                  width: "100%",
                  pointerEvents: "all",
                }}
              >
                View Their Story
                <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            )}
          </div>
        )}

        {/* ── Filter panel ── */}
        <div
          style={{
            ...panelStyle,
            opacity: showFilter ? 1 : 0,
            transform: showFilter ? "translateX(-50%) translateY(0)" : "translateX(-50%) translateY(10px)",
            pointerEvents: showFilter ? "all" : "none",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <span style={{ fontSize: "0.85rem", opacity: 0.7 }}>{t("filterTitle")}</span>
            <button onClick={() => setShowFilter(false)} style={closeBtnStyle}>×</button>
          </div>
          <div className={styles.rangeTrack} style={{ marginBottom: 8 }}>
            {/* Range fill bar */}
            <div style={{ position: "absolute", top: 12.5, height: 3, background: "rgba(255,255,255,0.5)", borderRadius: 2, pointerEvents: "none", left: fillLeft, width: fillW }} />
            <input className={styles.rangeMin} type="range" min={0} max={110} value={filterMin} step={1} onChange={onFilterMinChange} />
            <input type="range" min={0} max={110} value={filterMax} step={1} onChange={onFilterMaxChange} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", opacity: 0.5, marginBottom: 10 }}>
            <span>{filterMin}</span>
            <span>{filterMax >= 110 ? "110+" : filterMax}</span>
          </div>
          <div style={{ fontSize: "0.8rem", opacity: 0.6, marginBottom: 10 }}>
            {isRtl
              ? <span><strong>{visibleCount}</strong> {t("filterShowing")}</span>
              : <span>{t("filterShowing")} <strong>{visibleCount}</strong></span>
            }
          </div>
          <button onClick={onFilterReset} style={resetBtnStyle}>{t("filterReset")}</button>
        </div>

        {/* ── Search panel ── */}
        <div
          style={{
            ...panelStyle,
            opacity: showSearch ? 1 : 0,
            transform: showSearch ? "translateX(-50%) translateY(0)" : "translateX(-50%) translateY(10px)",
            pointerEvents: showSearch ? "all" : "none",
            bottom: showFilter ? 220 : 60,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <span style={{ fontSize: "0.85rem", opacity: 0.7 }}>{t("searchTitle")}</span>
            <button onClick={() => setShowSearch(false)} style={closeBtnStyle}>×</button>
          </div>
          <input
            ref={searchInputRef}
            type="text"
            placeholder={t("searchPlaceholder")}
            autoComplete="off"
            dir="auto"
            onChange={onSearchInput}
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 6,
              color: "#fff",
              padding: "10px 14px",
              fontSize: "0.9rem",
              fontFamily: "'Inter', 'Noto Kufi Arabic', sans-serif",
              outline: "none",
              marginBottom: 12,
            }}
          />
          <div style={{ fontSize: "0.8rem", opacity: 0.6, marginBottom: 10 }}>
            {isRtl
              ? <span><strong>{visibleCount}</strong> {t("searchShowing")}</span>
              : <span>{t("searchShowing")} <strong>{visibleCount}</strong></span>
            }
          </div>
          <button onClick={onSearchReset} style={resetBtnStyle}>{t("searchReset")}</button>
        </div>

        {/* ── Info modal ── */}
        {showModal && (
          <div
            onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.85)",
              zIndex: 50,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backdropFilter: "blur(8px)",
            }}
          >
            <div style={{
              background: "rgba(20,20,20,0.95)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 12,
              padding: "32px 36px",
              maxWidth: 600,
              width: "90%",
              maxHeight: "80%",
              overflowY: "auto",
              position: "relative",
              lineHeight: 1.7,
              fontSize: "0.95rem",
              fontWeight: 300,
              textAlign: isRtl ? "right" : "left",
            }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  position: "absolute",
                  top: 12,
                  [isRtl ? "left" : "right"]: 16,
                  background: "none",
                  border: "none",
                  color: "rgba(255,255,255,0.5)",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                }}
              >
                ×
              </button>
              <div
                className={styles.modalContent}
                dangerouslySetInnerHTML={{ __html: t("infoBody") }}
              />
            </div>
          </div>
        )}

        {/* ── Loading / Enter screen ── */}
        {phase !== "entered" && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              background: "#000",
              zIndex: 100,
              opacity: phase === "fading" ? 0 : 1,
              transition: "opacity 0.8s ease",
              pointerEvents: phase === "fading" ? "none" : "all",
            }}
          >
            <div style={{ opacity: phase === "ready" ? 0 : 1, transition: "opacity 0.4s ease", pointerEvents: "none" }}>
              <p style={{ fontSize: "1rem", fontWeight: 300, marginBottom: 20, opacity: 0.7, fontFamily: isRtl ? "'Noto Kufi Arabic', sans-serif" : "'Inter', sans-serif" }}>
                {t("loading")}
              </p>
              <div style={{ width: 200, height: 2, background: "rgba(255,255,255,0.1)", borderRadius: 1, overflow: "hidden" }}>
                <div style={{ width: `${fillWidth}%`, height: "100%", background: "rgba(255,255,255,0.6)", transition: "width 0.3s ease" }} />
              </div>
            </div>
            {phase === "ready" && (
              <button
                onClick={handleEnter}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.3)",
                  color: "#fff",
                  padding: "12px 48px",
                  fontSize: "1rem",
                  fontWeight: 300,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  fontFamily: "'Inter', sans-serif",
                  borderRadius: 4,
                  transition: "background 0.3s, border-color 0.3s",
                }}
                onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.background = "rgba(255,255,255,0.08)"; }}
                onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.background = "transparent"; }}
              >
                Enter
              </button>
            )}
          </div>
        )}

        {/* ── Footer ── */}
        <div
          className="absolute inset-x-0 bottom-0 text-center pointer-events-none"
          style={{
            padding: 20,
            zIndex: 10,
            background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 100%)",
          }}
        >
          <p style={{ fontSize: "clamp(0.65rem,1.1vw,0.82rem)", fontWeight: 300 }}>
            {t("footer")}
          </p>
        </div>

        {/* Hidden audio element */}
        <audio ref={audioRef} src="/i-am-not-a-number/darwish.mp3" loop preload="auto" />

        {/* ── Notch navbar ── */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 44,
            zIndex: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 16px",
            background: "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, transparent 100%)",
            backdropFilter: "blur(0px)",
            pointerEvents: "none",
          }}
        >
          {/* Logo — Handala icon linking home */}
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              pointerEvents: "all",
              opacity: 0.75,
              transition: "opacity 0.2s",
              textDecoration: "none",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.75")}
          >
            <img
              src="/i-am-not-a-number/Handala.png"
              alt="Handala"
              style={{ height: 22, filter: "invert(1)" }}
            />
            <span style={{ fontSize: "0.7rem", letterSpacing: "0.12em", color: "#fff", fontWeight: 400, textTransform: "uppercase", fontFamily: "'Inter', sans-serif" }}>
              hermas.uk
            </span>
          </Link>

          {/* Back to projects */}
          <Link
            href="/projects"
            style={{
              pointerEvents: "all",
              display: "flex",
              alignItems: "center",
              gap: 5,
              color: "rgba(255,255,255,0.6)",
              fontSize: "0.7rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              textDecoration: "none",
              fontFamily: "'Inter', sans-serif",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,1)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.6)")}
          >
            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Projects
          </Link>
        </div>
    </div>
  );
}

// ─── Shared style objects ─────────────────────────────────────────────────────

const btnStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.2)",
  color: "#fff",
  padding: "8px 16px",
  fontSize: "0.85rem",
  cursor: "pointer",
  fontFamily: "'Noto Kufi Arabic', 'Inter', sans-serif",
  borderRadius: 4,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "background 0.3s",
};

const panelStyle: React.CSSProperties = {
  position: "absolute",
  bottom: 60,
  left: "50%",
  transform: "translateX(-50%)",
  background: "rgba(10,10,10,0.9)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 12,
  padding: "16px 24px",
  zIndex: 20,
  backdropFilter: "blur(10px)",
  minWidth: 320,
  transition: "opacity 0.25s ease, transform 0.25s ease",
};

const closeBtnStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "rgba(255,255,255,0.4)",
  fontSize: "1.2rem",
  cursor: "pointer",
  padding: "0 4px",
};

const resetBtnStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.15)",
  color: "#fff",
  padding: "6px 14px",
  fontSize: "0.75rem",
  cursor: "pointer",
  borderRadius: 4,
  width: "100%",
  transition: "background 0.2s",
};
