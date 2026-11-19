import { Plus_Jakarta_Sans, Outfit, Inter } from "next/font/google";

// Primary body font — warm, humanist, readable (Variable: 200-800)
export const jakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jakarta",
});

// Geometric display font — bold, architectural, authoritative (Variable: 100-900)
export const outfitFont = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-outfit",
});

// Scalable variable sans — neutral, ultra-crisp for UI, metrics, and tables (Variable: 100-900)
export const interFont = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

// Display font export alias for backward compatibility
export const displayFont = outfitFont;
