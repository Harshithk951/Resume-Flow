import type { CarouselTemplate } from "@/components/TemplateCarousel";

export const carouselTemplates: CarouselTemplate[] = [
  {
    id: "academic-cv",
    label: "Academic CV",
    image: "/images/template-academic-cv.png",
    twoColumn: true,
  },
  {
    id: "entry-level",
    label: "Entry Level",
    image: "/images/template-entry-level.png",
    ats: true,
  },
  {
    id: "modern-professional",
    label: "Classic",
    image: "/images/template-modern-professional.png",
  },
  {
    id: "traditional",
    label: "Traditional",
    image: "/images/template-traditional.png",
    ats: true,
  },
  {
    id: "sidebar-pro",
    label: "Professional",
    image: "/images/template-sidebar-pro.png",
    withPhoto: true,
    twoColumn: true,
  },
  {
    id: "ats-strict",
    label: "ATS Strict",
    image: "/images/template-ats-strict.png",
    ats: true,
  },
  {
    id: "prime-ats",
    label: "Prime ATS",
    image: "/images/template-prime-ats.png",
    ats: true,
  },
  {
    id: "modern-executive",
    label: "Modern Executive",
    image: "/images/template-modern-executive.png",
    withPhoto: true,
    twoColumn: true,
  },
  {
    id: "tech-innovator",
    label: "Tech Innovator",
    image: "/images/template-tech-innovator.png",
    creative: true,
  },
  {
    id: "creative-minimalist",
    label: "Creative Minimalist",
    image: "/images/template-creative-minimalist.png",
    creative: true,
    withPhoto: true,
  },
];

export type TemplateFilterId =
  | "all"
  | "withPhoto"
  | "twoColumn"
  | "ats"
  | "creative";

export const templateFilters: { id: TemplateFilterId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "withPhoto", label: "With photo" },
  { id: "twoColumn", label: "Two column" },
  { id: "ats", label: "ATS" },
  { id: "creative", label: "Creative" },
];

export const templateAccentColors = [
  { id: "rose", hex: "#e60023", label: "Rose" },
  { id: "navy", hex: "#1e3a5f", label: "Navy" },
  { id: "blue", hex: "#2563eb", label: "Blue" },
  { id: "teal", hex: "#0d9488", label: "Teal" },
  { id: "green", hex: "#15803d", label: "Green" },
  { id: "purple", hex: "#7c3aed", label: "Purple" },
  { id: "orange", hex: "#ea580c", label: "Orange" },
  { id: "slate", hex: "#334155", label: "Slate" },
] as const;

export function filterTemplates(
  templates: CarouselTemplate[],
  filter: TemplateFilterId
): CarouselTemplate[] {
  if (filter === "all") return templates;
  if (filter === "withPhoto") return templates.filter((t) => t.withPhoto);
  if (filter === "twoColumn") return templates.filter((t) => t.twoColumn);
  if (filter === "ats") return templates.filter((t) => t.ats);
  if (filter === "creative") return templates.filter((t) => t.creative);
  return templates;
}
