import { Plus_Jakarta_Sans, Outfit, Inter } from "next/font/google";

// Primary body font — warm, humanist, readable
export const jakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700", "800"],
});

// Geometric display font — bold, architectural, authoritative
export const outfitFont = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-outfit",
  weight: ["500", "600", "700", "800", "900"],
});

// Scalable variable sans — neutral, ultra-crisp for UI, metrics, and tables
export const interFont = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["400", "500", "600", "700", "800"],
});

// Display font export alias for backward compatibility
export const displayFont = outfitFont;
