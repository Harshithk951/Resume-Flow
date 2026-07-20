// scripts/migrate-dark-mode-classes.ts
//
// Bulk migration: replace hardcoded Tailwind light-mode utility classes
// with CSS variable equivalents so they adapt automatically in dark mode.
//
// This transforms patterns like:
//   bg-white        → bg-[var(--color-canvas)]
//   text-slate-900  → text-[var(--color-ink)]
//   bg-slate-50     → bg-[var(--color-surface-soft)]
//   border-slate-200 → border-[var(--color-hairline)]
//
// Usage:
//   npx tsx scripts/migrate-dark-mode-classes.ts                    # dry-run (preview)
//   npx tsx scripts/migrate-dark-mode-classes.ts --apply            # actually modify files
//   npx tsx scripts/migrate-dark-mode-classes.ts --apply --targets dashboard  # only dashboard files

import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

const ROOT = path.resolve(__dirname, "..");

// ─── Replacement Rules ──────────────────────────────────────
// Ordered: more specific patterns first, generic patterns last.

interface Replacement {
  pattern: RegExp;
  replacement: string;
  description: string;
}

const REPLACEMENTS: Replacement[] = [
  // ── Backgrounds ──
  // IMPORTANT: Negative lookahead (?!\/) prevents matching bg-white/40, bg-white/60 etc.
  // Opacity modifiers like /40 are NOT valid with CSS var() arbitrary values.
  { pattern: /\bbg-white\b(?!\/)/g, replacement: "bg-[var(--color-canvas)]", description: "bg-white → canvas" },
  { pattern: /\bbg-slate-50\b/g, replacement: "bg-[var(--color-surface-soft)]", description: "bg-slate-50 → surface-soft" },
  { pattern: /\bbg-slate-100\b/g, replacement: "bg-[var(--color-surface-card)]", description: "bg-slate-100 → surface-card" },
  { pattern: /\bbg-slate-200\b/g, replacement: "bg-[var(--color-secondary-bg)]", description: "bg-slate-200 → secondary-bg" },
  { pattern: /\bbg-slate-300\b/g, replacement: "bg-[var(--color-hairline)]", description: "bg-slate-300 → hairline" },
  { pattern: /\bbg-slate-400\b/g, replacement: "bg-[var(--color-stone)]", description: "bg-slate-400 → stone" },
  { pattern: /\bbg-slate-600\b/g, replacement: "bg-[var(--color-mute)]", description: "bg-slate-600 → mute" },
  { pattern: /\bbg-slate-700\b/g, replacement: "bg-[var(--color-charcoal)]", description: "bg-slate-700 → charcoal" },
  { pattern: /\bbg-slate-800\b/g, replacement: "bg-[var(--color-surface-dark)]", description: "bg-slate-800 → surface-dark" },
  { pattern: /\bbg-slate-900\b(?!\/)/g, replacement: "bg-[var(--color-surface-dark)]", description: "bg-slate-900 → surface-dark" },
  { pattern: /\bbg-slate-950\b(?!\/)/g, replacement: "bg-[var(--color-surface-dark)]", description: "bg-slate-950 → surface-dark" },
  { pattern: /\bbg-gray-50\b/g, replacement: "bg-[var(--color-surface-soft)]", description: "bg-gray-50 → surface-soft" },
  { pattern: /\bbg-gray-100\b/g, replacement: "bg-[var(--color-surface-card)]", description: "bg-gray-100 → surface-card" },
  { pattern: /\bbg-gray-200\b/g, replacement: "bg-[var(--color-secondary-bg)]", description: "bg-gray-200 → secondary-bg" },

  // ── Slate backgrounds with /NN opacity (overlay/scrim patterns) ──
  // These match patterns like bg-slate-900/40, bg-slate-900/30, bg-slate-950/45.
  // OPACITY SUFFIX IS PRESERVED after the CSS variable substitution.
  { pattern: /\bbg-slate-900\/(\d+)/g, replacement: "bg-[var(--color-surface-dark)]/$1", description: "bg-slate-900/N → surface-dark/N" },
  { pattern: /\bbg-slate-950\/(\d+)/g, replacement: "bg-[var(--color-surface-dark)]/$1", description: "bg-slate-950/N → surface-dark/N" },
  { pattern: /\bbg-slate-200\/(\d+)/g, replacement: "bg-[var(--color-hairline)]/$1", description: "bg-slate-200/N → hairline/N" },

  // ── Text colors ──
  { pattern: /\btext-slate-950\b/g, replacement: "text-[var(--color-ink)]", description: "text-slate-950 → ink" },
  { pattern: /\btext-slate-900\b/g, replacement: "text-[var(--color-ink)]", description: "text-slate-900 → ink" },
  { pattern: /\btext-slate-800\b/g, replacement: "text-[var(--color-ink-soft)]", description: "text-slate-800 → ink-soft" },
  { pattern: /\btext-slate-700\b/g, replacement: "text-[var(--color-charcoal)]", description: "text-slate-700 → charcoal" },
  { pattern: /\btext-slate-600\b/g, replacement: "text-[var(--color-mute)]", description: "text-slate-600 → mute" },
  { pattern: /\btext-slate-500\b/g, replacement: "text-[var(--color-ash)]", description: "text-slate-500 → ash" },
  { pattern: /\btext-slate-400\b/g, replacement: "text-[var(--color-stone)]", description: "text-slate-400 → stone" },
  { pattern: /\btext-slate-300\b/g, replacement: "text-[var(--color-ash)]", description: "text-slate-300 → ash" },
  { pattern: /\btext-slate-200\b/g, replacement: "text-[var(--color-stone)]", description: "text-slate-200 → stone" },
  { pattern: /\btext-gray-900\b/g, replacement: "text-[var(--color-ink)]", description: "text-gray-900 → ink" },
  { pattern: /\btext-gray-800\b/g, replacement: "text-[var(--color-ink-soft)]", description: "text-gray-800 → ink-soft" },
  { pattern: /\btext-gray-700\b/g, replacement: "text-[var(--color-charcoal)]", description: "text-gray-700 → charcoal" },
  { pattern: /\btext-gray-600\b/g, replacement: "text-[var(--color-mute)]", description: "text-gray-600 → mute" },
  { pattern: /\btext-gray-500\b/g, replacement: "text-[var(--color-ash)]", description: "text-gray-500 → ash" },
  { pattern: /\btext-gray-400\b/g, replacement: "text-[var(--color-stone)]", description: "text-gray-400 → stone" },

  // ── Border colors ──
  { pattern: /\bborder-slate-200\b/g, replacement: "border-[var(--color-hairline)]", description: "border-slate-200 → hairline" },
  { pattern: /\bborder-slate-300\b/g, replacement: "border-[var(--color-secondary-bg)]", description: "border-slate-300 → secondary-bg" },
  { pattern: /\bborder-slate-100\b/g, replacement: "border-[var(--color-hairline-soft)]", description: "border-slate-100 → hairline-soft" },
  { pattern: /\bborder-gray-200\b/g, replacement: "border-[var(--color-hairline)]", description: "border-gray-200 → hairline" },
  { pattern: /\bborder-gray-100\b/g, replacement: "border-[var(--color-hairline-soft)]", description: "border-gray-100 → hairline-soft" },

  // ── Divide colors ──
  { pattern: /\bdivide-slate-200\b/g, replacement: "divide-[var(--color-hairline)]", description: "divide-slate-200 → hairline" },
  { pattern: /\bdivide-slate-100\b/g, replacement: "divide-[var(--color-hairline-soft)]", description: "divide-slate-100 → hairline-soft" },
  { pattern: /\bdivide-gray-100\b/g, replacement: "divide-[var(--color-hairline-soft)]", description: "divide-gray-100 → hairline-soft" },

  // ── Ring colors ──
  { pattern: /\bring-slate-200\b/g, replacement: "ring-[var(--color-hairline)]", description: "ring-slate-200 → hairline" },

  // ── Placeholder text ──
  { pattern: /\bplaceholder:text-slate-400\b/g, replacement: "placeholder:text-[var(--color-ash)]", description: "placeholder:text-slate-400 → ash" },
  { pattern: /\bplaceholder-slate-400\b/g, replacement: "placeholder-[var(--color-ash)]", description: "placeholder-slate-400 → ash" },
];

// ─── Target Files ───────────────────────────────────────────

const ALL_TARGETS: Record<string, string[]> = {
  "dashboard": [
    "app/(app)/dashboard/page.tsx",
    "components/dashboard/StatsGrid.tsx",
    "components/dashboard/RecentActivityFeed.tsx",
    "components/dashboard/QuickActions.tsx",
    "components/dashboard/AddJobModal.tsx",
    "components/dashboard/PipelineToolbar.tsx",
    "components/dashboard/NeedsAttentionPanel.tsx",
    "components/dashboard/ColumnEmptyState.tsx",
    "components/dashboard/ApplicationTracker.tsx",
  ],
  "company": [
    "app/(app)/company/[id]/page.tsx",
  ],
  "templates": [
    "components/templates/TemplateBrowser.tsx",
    "components/templates/TemplateSelectTab.tsx",
    "components/templates/EditTab.tsx",
    "components/templates/shared.tsx",
  ],
  "builder": [
    "app/(app)/resume/builder/page.tsx",
  ],
  "profile": [
    "app/(app)/profile/page.tsx",
  ],
  "components": [
    "components/ChatHistoryPanel.tsx",
    "components/KanbanBoard.tsx",
    "components/SkillGapQuestionnaire.tsx",
    "components/ContactForm.tsx",
    "components/HydrationProtectionGuard.tsx",
    "components/PricingSection.tsx",
    "components/ui/input.tsx",
    "components/ui/badge.tsx",
    "components/ui/button.tsx",
    "components/ui/card.tsx",
    "components/blocks/pricing-section.tsx",
    "components/WhyResumeFlow.tsx",
    "components/StaticPageWrapper.tsx",
    "components/grids/BentoGrid.tsx",
  ],
  "onboarding": [
    "app/onboarding/page.tsx",
  ],
  "remaining": [
    // Files not covered by any other group — surfaced by dark mode audit
    // NOTE: app/globals.css is intentionally excluded — its patterns are
    // design-token definitions and .dark utility overrides that must stay as-is.
    "app/resources/[slug]/page.tsx",
    "app/(app)/layout.tsx",
    "app/info/[slug]/page.tsx",
    "components/Navbar.tsx",
    "app/(app)/ops/dead-letter/page.tsx",
    "components/TemplateCarousel.tsx",
    "components/ChatBot.tsx",
    "components/grids/FeatureGrid.tsx",
    "components/AppBackButton.tsx",
    "components/ui/tabs.tsx",
    "components/ui/progress.tsx",
    "app/sign-in/[[...sign-in]]/page.tsx",
    "components/LiveSandboxPreview.tsx",
    "components/dashboard/DashboardSkeleton.tsx",
  ],
  "all": [], // populated below
};

ALL_TARGETS["all"] = Object.values(ALL_TARGETS).flat().filter((f, i, a) => a.indexOf(f) === i);

// ─── Migration Engine ───────────────────────────────────────

interface MigrationResult {
  file: string;
  changes: number;
  replacements: { description: string; count: number }[];
}

function migrateFile(filePath: string, dryRun: boolean): MigrationResult {
  const fullPath = path.join(ROOT, filePath);
  if (!fs.existsSync(fullPath)) {
    return { file: filePath, changes: 0, replacements: [] };
  }

  let content = fs.readFileSync(fullPath, "utf-8");
  const changeCounts: Record<string, number> = {};

  for (const repl of REPLACEMENTS) {
    const before = content;
    content = content.replace(repl.pattern, repl.replacement);
    // More accurate count:
    const matches = before.match(repl.pattern);
    const actualCount = matches ? matches.length : 0;
    if (actualCount > 0) {
      changeCounts[repl.description] = (changeCounts[repl.description] || 0) + actualCount;
    }
  }

  const totalChanges = Object.values(changeCounts).reduce((a, b) => a + b, 0);
  
  if (!dryRun && totalChanges > 0) {
    fs.writeFileSync(fullPath, content, "utf-8");
  }

  return {
    file: filePath,
    changes: totalChanges,
    replacements: Object.entries(changeCounts).map(([description, count]) => ({ description, count })),
  };
}

// ─── Main ───────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);
  const dryRun = !args.includes("--apply");
  const targetKey = args.find((a) => a.startsWith("--targets="))?.split("=")[1] || "all";
  const verbose = args.includes("--verbose");

  const targets = ALL_TARGETS[targetKey];
  if (!targets) {
    console.error(`Unknown target group "${targetKey}". Available: ${Object.keys(ALL_TARGETS).join(", ")}`);
    process.exit(1);
  }

  console.log(`\n🔧 Dark Mode Class Migration`);
  console.log(`   Mode: ${dryRun ? "DRY RUN (preview)" : "APPLY (modifying files)"}`);
  console.log(`   Target group: ${targetKey} (${targets.length} files)`);
  console.log(`   ${REPLACEMENTS.length} replacement patterns\n`);

  if (dryRun) {
    console.log("── Preview of changes ──\n");
  }

  let totalChanges = 0;
  let filesChanged = 0;

  for (const target of targets) {
    const result = migrateFile(target, dryRun);
    if (result.changes > 0) {
      filesChanged++;
      totalChanges += result.changes;
      console.log(`\n📄 ${result.file}`);
      console.log(`   ${result.changes} replacement(s)`);
      if (verbose) {
        for (const r of result.replacements) {
          console.log(`   • ${r.description}: ${r.count}`);
        }
      }
    }
  }

  console.log(`\n${dryRun ? "─── DRY RUN SUMMARY ───" : "─── RESULTS ───"}`);
  console.log(`   Files touched: ${filesChanged}`);
  console.log(`   Total replacements: ${totalChanges}`);
  
  if (dryRun) {
    console.log(`\n   Run with --apply to make these changes permanent.`);
  }

  // Run the audit after applying
  if (!dryRun && totalChanges > 0) {
    console.log(`\n   Running audit to verify changes...`);
    try {
      execSync(`npx tsx scripts/audit-dark-mode.ts 2>&1`, {
        cwd: ROOT,
        stdio: "inherit",
        timeout: 30000,
      });
    } catch {
      // audit exit code is non-zero if HIGH findings, which is expected
    }
  }
}

main();
