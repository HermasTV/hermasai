import Link from "next/link";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";
import AnimatedBackground from "@/components/animated-background";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <AnimatedBackground />
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 pt-24 pb-12">
      {/* Hero Section */}
      <section className="text-center py-20">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Hermas.ai
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
          Welcome to my Virtual Garage for AI experiments.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/projects" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            View Projects
          </Link>
          <Link 
            href="/contact" 
            className="border border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Get in Touch
          </Link>
        </div>
      </section>

      {/* Featured Areas */}
      <section className="py-16">
        <h2 className="text-3xl font-bold text-center mb-12">What I Do</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">Browser AI Demos</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Real-time AI applications running directly in the browser using ONNX.js, 
              TensorFlow.js, and WebGPU for optimal performance.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">ML APIs & Services</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Lightweight backend services for speech recognition, computer vision, 
              and other machine learning tasks with Python and FastAPI.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">AI Research & Tutorials</h3>
            <p className="text-gray-600 dark:text-gray-300">
              In-depth case studies, tutorials, and documentation of larger AI projects 
              and research experiments.
            </p>
          </div>
        </div>
      </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
