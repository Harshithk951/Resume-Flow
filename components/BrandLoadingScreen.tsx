"use client";

import { BrandLogo } from "@/components/BrandLogo";
import { Loader2 } from "lucide-react";

export function BrandLoadingScreen({ message = "Loading workspace..." }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#fbfbf9] px-4 select-none">
      <div className="flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in duration-200">
        {/* Animated Brand Emblem inside squircle card */}
        <div className="relative flex items-center justify-center">
          <div className="absolute -inset-2 rounded-3xl bg-[#5B50E6]/10 blur-xl animate-pulse" />
          <div className="w-16 h-16 rounded-2xl bg-white shadow-md border border-purple-100/80 flex items-center justify-center relative">
            <BrandLogo size="sm" showText={false} animated glow={false} />
          </div>
        </div>

        {/* Brand Name & Loading Indicator */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-center gap-1">
            <span className="text-lg font-black text-slate-900 tracking-tight">Resume</span>
            <span className="text-lg font-black bg-gradient-to-r from-[#00B5D8] to-[#5B50E6] bg-clip-text text-transparent tracking-tight">Flow</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400 font-medium">
            <Loader2 className="w-3.5 h-3.5 text-[#5B50E6] animate-spin" />
            <span>{message}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BrandLoadingScreen;
