import React from "react";
import type { StructuredResumeContent, TemplateId } from "../types";
import { normalizeTemplateId } from "../types";
import { MinimalTemplate } from "./MinimalTemplate";
import { ModernTemplate } from "./ModernTemplate";
import { ClassicTemplate } from "./ClassicTemplate";
import { TwoColumnTemplate } from "./TwoColumnTemplate";

export { MinimalTemplate, ModernTemplate, ClassicTemplate, TwoColumnTemplate };

export interface TemplateDefinition {
  id: TemplateId;
  label: string;
  description: string;
  note?: string;
  component: React.ComponentType<{ data: StructuredResumeContent }>;
}

export const TEMPLATES_REGISTRY: Record<TemplateId, TemplateDefinition> = {
  classic: {
    id: "classic",
    label: "Classic Professional",
    description: "Serif typography, clean centered header, and traditional Harvard ATS formatting.",
    component: ClassicTemplate,
  },
  modern: {
    id: "modern",
    label: "Modern",
    description: "Header accent band, high readability, and clean left-aligned typography.",
    component: ModernTemplate,
  },
  minimal: {
    id: "minimal",
    label: "Minimal",
    description: "Understated, distraction-free layout with em-dash bullet styling.",
    component: MinimalTemplate,
  },
  "two-column": {
    id: "two-column",
    label: "Two-column",
    description: "Distinctive sidebar layout for education and skills with high contrast.",
    note: "Best for sharing directly with recruiters. Some ATS systems read two-column layouts less reliably.",
    component: TwoColumnTemplate,
  },
};

/**
 * Returns the React-PDF document component for the given template ID.
 * Defaults / falls back to ClassicTemplate.
 */
export function getTemplateComponent(
  templateId?: string
): React.ComponentType<{ data: StructuredResumeContent }> {
  const normalized = normalizeTemplateId(templateId);
  return TEMPLATES_REGISTRY[normalized]?.component ?? ClassicTemplate;
}
