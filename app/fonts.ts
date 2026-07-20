import { Plus_Jakarta_Sans } from "next/font/google";

// Primary body font — warm, geometric, premium feel
export const jakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700", "800"],
});

// Display/heading font — bold, distinctive, editorial
// Using Plus Jakarta Sans ExtraBold as display substitute
// (Clash Display requires a paid license; this keeps it free)
export const displayFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
  weight: ["700", "800"],
});
