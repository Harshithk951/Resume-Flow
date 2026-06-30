// lib/animations.ts
//
// Centralized Framer Motion variant library for ResumeFlow.
// All motion uses GPU-safe properties only: transform, opacity, filter.
// Custom spring curve: cubic-bezier(0.32, 0.72, 0, 1)

// ─── Spring Constants ──────────────────────────────────────
export const SPRING_SMOOTH = { type: "spring" as const, stiffness: 100, damping: 20 };
export const SPRING_SNAPPY = { type: "spring" as const, stiffness: 400, damping: 30 };
export const SPRING_BOUNCY = { type: "spring" as const, stiffness: 300, damping: 15 };
export const EASE_VANGUARD = [0.32, 0.72, 0, 1] as const;
export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

// ─── Scroll-Triggered Reveals ──────────────────────────────
export const scrollRevealUp = {
  hidden: { opacity: 0, y: 40, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: EASE_VANGUARD },
  },
};

export const scrollRevealLeft = {
  hidden: { opacity: 0, x: -40, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: EASE_VANGUARD },
  },
};

export const scrollRevealRight = {
  hidden: { opacity: 0, x: 40, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: EASE_VANGUARD },
  },
};

export const scrollRevealScale = {
  hidden: { opacity: 0, scale: 0.92, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: EASE_VANGUARD },
  },
};

// ─── Stagger Containers ────────────────────────────────────
export const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

export const staggerContainerSlow = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

// ─── Word-by-Word Text Reveal ──────────────────────────────
export const wordReveal = {
  hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: EASE_VANGUARD },
  },
};

// ─── Magnetic Button Hover ─────────────────────────────────
export const magneticHover = {
  rest: { scale: 1 },
  hover: {
    scale: 1.03,
    transition: { type: "spring" as const, stiffness: 400, damping: 17 },
  },
  tap: { scale: 0.97 },
};

// ─── Floating / Orbit Animation ────────────────────────────
export const floatingCard = {
  animate: {
    y: [0, -12, 0],
    rotateZ: [0, 1, 0, -1, 0],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// ─── FAQ Accordion Spring ──────────────────────────────────
export const accordionContent = {
  collapsed: {
    height: 0,
    opacity: 0,
    transition: { duration: 0.3, ease: EASE_VANGUARD },
  },
  expanded: {
    height: "auto",
    opacity: 1,
    transition: { duration: 0.4, ease: EASE_VANGUARD },
  },
};

// ─── Icon Rotate (FAQ +/−) ─────────────────────────────────
export const iconRotate = {
  collapsed: { rotate: 0, transition: { duration: 0.3, ease: EASE_VANGUARD } },
  expanded: { rotate: 45, transition: { duration: 0.3, ease: EASE_VANGUARD } },
};

// ─── Parallax Scroll Hook Helpers ──────────────────────────
export const parallaxSlow = {
  // Use with useTransform(scrollYProgress, [0, 1], [0, -50])
  outputRange: [0, -50] as const,
};

export const parallaxFast = {
  outputRange: [0, -120] as const,
};

// ─── Shimmer / Gradient Animation ──────────────────────────
export const shimmerLoop = {
  animate: {
    backgroundPosition: ["200% 0", "-200% 0"],
    transition: { duration: 3, repeat: Infinity, ease: "linear" },
  },
};

// ─── Scale-In for Modals/Dialogs ───────────────────────────
export const scaleIn = {
  hidden: { opacity: 0, scale: 0.95, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.3, ease: EASE_VANGUARD },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    filter: "blur(4px)",
    transition: { duration: 0.2 },
  },
};
