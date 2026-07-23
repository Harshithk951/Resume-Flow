import React from "react";
import Navbar from "@/components/Navbar";
import { PricingSection } from "@/components/blocks/pricing-section";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — ResumeFlow AI Resume Builder",
  description: "Flexible, transparent pricing for ResumeFlow. Free tier available with zero credit card required.",
  alternates: { canonical: "https://resumeflow.harshithkumar.in/pricing" },
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-rose-500 selection:text-white flex flex-col justify-between">
      <Navbar />
      <main className="py-12 md:py-20 max-w-7xl mx-auto px-6 w-full flex-1">
        <PricingSection />
      </main>
      <footer className="py-8 border-t border-slate-800 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} ResumeFlow. All rights reserved.
      </footer>
    </div>
  );
}
