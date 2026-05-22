"use client";

import dynamic from "next/dynamic";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";
import AnimatedBackground from "@/components/animated-background";

const RealtimeFaceClient = dynamic(() => import("./realtime-face-client"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex flex-col">
      <AnimatedBackground />
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 pt-8 pb-12 sm:pt-12 max-w-7xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-2">
              Realtime Vision Pipeline
            </h1>
            <p className="text-base text-gray-300">Initializing…</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  ),
});

export default function RealtimeFacePage() {
  return <RealtimeFaceClient />;
}
