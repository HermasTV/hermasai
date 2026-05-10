import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";
import AnimatedBackground from "@/components/animated-background";
import HomeHero from "@/components/home-hero";
import FlipCard from "@/components/flip-card";

// Homepage owns the personal-brand search. Title is intentionally short so
// the brand string stays visible even after Google appends "| Ahmed Hermas"
// on internal pages. Description hits the highest-volume long-tail variants
// people use when looking for Ahmed by name.
export const metadata: Metadata = {
  title: "Ahmed Hermas — AI & Computer Vision Engineer",
  description:
    "Ahmed Hermas is a Senior AI / Computer Vision Engineer building production ML systems and browser-based WebGPU demos. Explore live AI projects, computer-vision case studies, and writing on edge AI.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "profile",
    title: "Ahmed Hermas — AI & Computer Vision Engineer",
    description:
      "Senior AI / Computer Vision Engineer. 8+ years shipping ISO-certified biometrics, city-scale traffic AI, and browser-based WebGPU demos.",
    url: "/",
    firstName: "Ahmed",
    lastName: "Hermas",
  },
};

const cards = [
  {
    icon: '🧠',
    title: 'Browser AI Demos',
    subtitle: 'WebGPU · ONNX.js · TensorFlow.js',
    details: 'Real-time AI applications running directly in the browser using ONNX.js, TensorFlow.js, and WebGPU for optimal performance.',
    gradient: 'bg-gradient-to-br from-blue-600/90 to-purple-700/90',
    iconBg: 'bg-blue-500/20',
  },
  {
    icon: '⚡',
    title: 'ML APIs & Services',
    subtitle: 'FastAPI · Python · Computer Vision',
    details: 'Lightweight backend services for speech recognition, computer vision, and other machine learning tasks with Python and FastAPI.',
    gradient: 'bg-gradient-to-br from-purple-600/90 to-pink-700/90',
    iconBg: 'bg-purple-500/20',
  },
  {
    icon: '📖',
    title: 'AI Research & Tutorials',
    subtitle: 'Case Studies · Deep Dives · Docs',
    details: 'In-depth case studies, tutorials, and documentation of larger AI projects and research experiments.',
    gradient: 'bg-gradient-to-br from-emerald-600/90 to-teal-700/90',
    iconBg: 'bg-emerald-500/20',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <AnimatedBackground />
      <Navbar />
      <main className="flex-1 flex flex-col">
        <div className="container mx-auto px-4 py-4 sm:py-6 max-w-6xl flex-1 flex flex-col justify-center">

          <HomeHero />

          {/* What I Do Section */}
          <section className="pt-4 sm:pt-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-white mb-1 tracking-tight">What I Do</h2>
            <p className="text-center text-gray-400 mb-4 sm:mb-6 text-xs">Hover over a card to learn more</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
              {cards.map((card) => (
                <FlipCard key={card.title} {...card} />
              ))}
            </div>
          </section>

        </div>
      </main>
      <Footer />
    </div>
  );
}
