import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";
import AnimatedBackground from "@/components/animated-background";
import HomeHero from "@/components/home-hero";
import FlipCard from "@/components/flip-card";

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
      <main className="flex-grow">
        <div className="container mx-auto px-4 pt-12 pb-12">

          <HomeHero />

          {/* What I Do Section */}
          <section className="py-16">
            <h2 className="text-3xl font-bold text-center text-white mb-4">What I Do</h2>
            <p className="text-center text-gray-400 mb-12 text-sm">Hover over a card to learn more</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
