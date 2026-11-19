import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FeatureGrid } from "@/components/grids/FeatureGrid";
import { BentoGrid } from "@/components/grids/BentoGrid";
import { WhyResumeFlow } from "@/components/WhyResumeFlow";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Features — ResumeFlow AI Resume Engineering",
  description: "Explore ResumeFlow's AI tailoring, WASM client-side PDF compiler, ATS scoring, and live company research capabilities.",
  alternates: { canonical: "https://resumeflow.harshithkumar.in/features" },
};

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-rose-500 selection:text-white flex flex-col justify-between">
      <Navbar />
      <main className="py-12 md:py-20 space-y-16 max-w-7xl mx-auto px-6 w-full flex-1">
        <FeatureGrid />
        <BentoGrid />
        <WhyResumeFlow />
      </main>
      <Footer />
    </div>
  );
}
