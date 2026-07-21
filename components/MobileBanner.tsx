"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Smartphone, Globe, ExternalLink, X, ArrowRight, Sparkles } from "lucide-react";

type DeviceInfo = {
  isMobile: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isSafari: boolean;
  isChrome: boolean;
  browserName: string;
  osName: string;
};

function detectDevice(): DeviceInfo {
  if (typeof window === "undefined") {
    return {
      isMobile: false,
      isIOS: false,
      isAndroid: false,
      isSafari: false,
      isChrome: false,
      browserName: "",
      osName: "",
    };
  }

  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/.test(ua);
  const isMobile = isIOS || isAndroid || /Mobi|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
  const isChrome = /Chrome/.test(ua) && !/Edg|OPR/.test(ua);

  let browserName = "Browser";
  if (isSafari) browserName = "Safari";
  else if (isChrome) browserName = "Chrome";
  else if (/Edg/.test(ua)) browserName = "Edge";
  else if (/OPR|Opera/.test(ua)) browserName = "Opera";
  else if (/Firefox/.test(ua)) browserName = "Firefox";

  let osName = "Unknown";
  if (isIOS) osName = "iOS";
  else if (isAndroid) osName = "Android";

  return { isMobile, isIOS, isAndroid, isSafari, isChrome, browserName, osName };
}

function getOpenInChromeUrl(): string {
  const currentUrl = window.location.href;
  if (/Android/.test(navigator.userAgent)) {
    // Android intent URL to open in Chrome
    return `intent://${currentUrl.replace(/^https?:\/\//, "")}#Intent;scheme=https;package=com.android.chrome;end`;
  }
  if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
    // iOS: Chrome has a custom URL scheme but it's limited. Use googlechrome://
    return `googlechrome://${currentUrl.replace(/^https?:\/\//, "")}`;
  }
  return currentUrl;
}

const STORAGE_KEY = "resumeflow_mobile_banner_dismissed";

export default function MobileBanner() {
  const [device, setDevice] = useState<DeviceInfo | null>(null);
  const [dismissed, setDismissed] = useState(true); // Default to hidden until we check
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const info = detectDevice();
    setDevice(info);

    // Only show banner on actual mobile devices
    if (!info.isMobile) {
      setDismissed(true);
      return;
    }

    // Check localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "true") {
      setDismissed(true);
    } else {
      setDismissed(false);
      // Slight delay for smooth entrance animation
      const timer = setTimeout(() => setIsVisible(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    // Wait for exit animation before setting dismissed
    setTimeout(() => {
      setDismissed(true);
      try {
        localStorage.setItem(STORAGE_KEY, "true");
      } catch {}
    }, 300);
  };

  const handleOpenInChrome = () => {
    const chromeUrl = getOpenInChromeUrl();
    window.open(chromeUrl, "_blank");
    // Also dismiss the banner after trying to open
    handleDismiss();
  };

  if (dismissed || !device?.isMobile) return null;

  // Determine messaging based on device
  const isNotChrome = !device.isChrome;
  const showChromePrompt = isNotChrome && (device.isAndroid || device.isIOS);

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -20 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed top-0 left-0 right-0 z-[60]"
        >
          <div className="relative bg-gradient-to-r from-rose-600 via-rose-500 to-pink-600 shadow-lg shadow-rose-500/20">
            {/* Subtle pattern overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_60%)]" />
            
            <div className="relative max-w-7xl mx-auto px-4 py-3 sm:px-6">
              <div className="flex items-center justify-between gap-4">
                {/* Left: Icon + Text */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="hidden sm:flex items-center justify-center w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 shrink-0">
                    <Smartphone className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 text-sm font-bold text-white">
                        <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                        Mobile App Coming Soon
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/15 text-[10px] font-bold text-white/80 border border-white/10 uppercase tracking-wider">
                        {device.osName}
                      </span>
                    </div>
                    <p className="text-xs text-white/70 mt-0.5">
                      For the best experience, use our web app on desktop or{" "}
                      {showChromePrompt ? "open in Chrome" : "your preferred browser"}.
                    </p>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {showChromePrompt && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleOpenInChrome}
                      className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-rose-600 text-xs font-extrabold hover:bg-white/90 transition-all shadow-sm"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>Open in Chrome</span>
                      <ExternalLink className="w-3 h-3 opacity-60" />
                    </motion.button>
                  )}
                  <button
                    onClick={handleDismiss}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white text-xs font-semibold transition-all border border-white/10"
                  >
                    <span>Continue to Web App</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="flex items-center justify-center w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-all"
                    aria-label="Dismiss"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom shimmer line */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
