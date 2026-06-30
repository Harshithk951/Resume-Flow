// lib/latex/layoutAdapter.ts

export interface LayoutContract {
  fontSize: string;
  bodyLineSpacing: string;
  sectionSpacing: string;
  headingClass: string;
  latexMarginCmd: string;
  docxSpacingTwips: { before: number; after: number; line: number };
}

export const SpacingContractMap: Record<"compact" | "executive", LayoutContract> = {
  compact: {
    fontSize: "10pt",
    bodyLineSpacing: "1.15",
    sectionSpacing: "mb-2",
    headingClass: "text-md font-bold uppercase tracking-tight border-b pb-0.5",
    latexMarginCmd: "\\geometry{top=0.5in,bottom=0.5in,left=0.5in,right=0.5in}",
    docxSpacingTwips: { before: 40, after: 40, line: 240 }
  },
  executive: {
    fontSize: "12pt",
    bodyLineSpacing: "1.5",
    sectionSpacing: "mb-4",
    headingClass: "text-lg font-semibold tracking-normal border-b pb-1",
    latexMarginCmd: "\\geometry{top=0.75in,bottom=0.75in,left=0.75in,right=0.75in}",
    docxSpacingTwips: { before: 120, after: 120, line: 360 }
  }
};
