"use client";

// components/SkillGapModal.tsx
//
// SkillGapModal component.
// Triggers when pipeline state is "needs_user_input".
// Renders the AI-generated questions with Yes/No buttons + short text response fields.
// Designed with Design.md tokens (cream background, rounded-md, Pinterest red CTA).

import React, { useState } from "react";
import { Sparkles, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SkillQuestion {
  skill: string;
  question: string;
}

interface SkillGapModalProps {
  questions: SkillQuestion[];
  onSubmit: (answers: { skill: string; hasSkill: boolean; userResponse: string }[]) => void;
  isSubmitting: boolean;
}

export default function SkillGapModal({ questions, onSubmit, isSubmitting }: SkillGapModalProps) {
  // Store responses for each skill
  const [answers, setAnswers] = useState<Record<string, { hasSkill: boolean; response: string }>>(
    questions.reduce((acc, q) => {
      acc[q.skill] = { hasSkill: false, response: "" };
      return acc;
    }, {} as any)
  );

  const handleToggle = (skill: string, hasSkill: boolean) => {
    setAnswers((prev) => ({
      ...prev,
      [skill]: {
        ...prev[skill],
        hasSkill,
        // Clear response text if toggled to No
        response: hasSkill ? prev[skill].response : "",
      },
    }));
  };

  const handleResponseChange = (skill: string, text: string) => {
    setAnswers((prev) => ({
      ...prev,
      [skill]: {
        ...prev[skill],
        response: text,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedAnswers = Object.entries(answers).map(([skill, val]) => ({
      skill,
      hasSkill: val.hasSkill,
      userResponse: val.response,
    }));
    onSubmit(formattedAnswers);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark Scrim overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative z-10 w-full max-w-2xl bg-[var(--color-canvas)] rounded-[32px] shadow-xl border border-[var(--color-hairline)] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-[var(--color-hairline)] bg-[var(--color-surface-soft)]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[var(--color-primary)]" />
            <h3 className="type-heading-md">Review Skill Gap Analysis</h3>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="px-8 py-6 max-h-[60vh] overflow-y-auto flex flex-col gap-6">
            <p className="type-body-md text-[var(--color-mute)] leading-relaxed">
              Our analyzer detected a few requirements from the job description that might be
              missing or under-represented in your Master Profile. Please help us clarify so the
              AI can tailor your experiences accurately.
            </p>

            <div className="flex flex-col gap-6 divide-y divide-[var(--color-hairline)]">
              {questions.map((q, index) => {
                const answer = answers[q.skill] || { hasSkill: false, response: "" };
                return (
                  <div key={q.skill} className={`flex flex-col gap-4 ${index > 0 ? "pt-6" : ""}`}>
                    <div>
                      <span className="inline-block bg-[rgba(230,0,35,0.08)] text-[var(--color-primary)] text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-[8px] mb-2">
                        {q.skill}
                      </span>
                      <h4 className="type-body-strong text-sm font-semibold">{q.question}</h4>
                    </div>

                    {/* Yes / No Toggle buttons */}
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => handleToggle(q.skill, true)}
                        className={`flex-1 py-2 rounded-[16px] text-sm font-semibold border transition-all ${
                          answer.hasSkill
                            ? "bg-[var(--color-ink)] text-[var(--color-on-dark)] border-[var(--color-ink)]"
                            : "bg-[var(--color-canvas)] text-[var(--color-mute)] border-[var(--color-hairline)] hover:border-[var(--color-ash)]"
                        }`}
                      >
                        Yes, I have experience with this
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggle(q.skill, false)}
                        className={`flex-1 py-2 rounded-[16px] text-sm font-semibold border transition-all ${
                          !answer.hasSkill
                            ? "bg-[var(--color-secondary-bg)] text-[var(--color-ink)] border-[var(--color-secondary-bg)]"
                            : "bg-[var(--color-canvas)] text-[var(--color-mute)] border-[var(--color-hairline)] hover:border-[var(--color-ash)]"
                        }`}
                      >
                        No, skip this skill
                      </button>
                    </div>

                    {/* Explanatory text field displayed conditionally with animation */}
                    <AnimatePresence initial={false}>
                      {answer.hasSkill && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="flex flex-col gap-1.5 pt-2">
                            <label className="type-body-strong text-xs font-medium text-[var(--color-mute)]">
                              Provide brief context (e.g. projects, duration, or coursework)
                            </label>
                            <textarea
                              required
                              rows={2}
                              className="w-full bg-[var(--color-surface-soft)] border border-[var(--color-hairline)] rounded-[16px] p-3 text-sm focus:border-[var(--color-ink)] focus:outline-none"
                              placeholder="e.g., Deployed AWS ECS containers using Terraform for my third-year internship project..."
                              value={answer.response}
                              onChange={(e) => handleResponseChange(q.skill, e.target.value)}
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer actions */}
          <div className="px-8 py-5 border-t border-[var(--color-hairline)] bg-[var(--color-surface-soft)] flex justify-end gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary min-w-[200px] flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  />
                  Saving & Tailoring...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Tailor My Resume
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
