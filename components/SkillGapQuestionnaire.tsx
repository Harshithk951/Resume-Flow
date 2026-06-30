"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Loader2, Check } from "lucide-react";

interface Question {
  skill: string;
  question: string;
  hasSkill?: boolean;
  userResponse?: string;
}

interface SkillGapQuestionnaireProps {
  jobId: Id<"jobs">;
  questions: Question[];
}

export function SkillGapQuestionnaire({
  jobId,
  questions,
}: SkillGapQuestionnaireProps) {
  const [answers, setAnswers] = useState<Question[]>(
    questions.map((q) => ({
      ...q,
      hasSkill: q.hasSkill ?? false,
      userResponse: q.userResponse ?? "",
    }))
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitAnswersMutation = useMutation(api.jobs.submitGapAnswers);

  const handleToggleSkill = (idx: number, hasSkill: boolean) => {
    const updated = [...answers];
    updated[idx] = {
      ...updated[idx],
      hasSkill,
      userResponse: hasSkill ? updated[idx].userResponse : "",
    };
    setAnswers(updated);
  };

  const handleResponseChange = (idx: number, text: string) => {
    const updated = [...answers];
    updated[idx] = { ...updated[idx], userResponse: text };
    setAnswers(updated);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await submitAnswersMutation({
        jobId,
        answers: answers.map((q) => ({
          skill: q.skill,
          hasSkill: q.hasSkill ?? false,
          userResponse: q.userResponse ?? "",
        })),
      });
    } catch (e) {
      console.error("Failed to submit gap answers:", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 mt-6">
      <h3 className="font-bold text-slate-800 text-sm tracking-tight border-b pb-2">
        Confirm Skill Gaps
      </h3>
      <div className="space-y-4">
        {answers.map((q, idx) => (
          <div
            key={q.skill}
            className="bg-slate-50 border border-slate-200/50 p-4 rounded-2xl space-y-3"
          >
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              {q.question}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleToggleSkill(idx, true)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  q.hasSkill
                    ? "bg-green-50 border-green-200 text-green-700"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                Yes, I have this skill
              </button>
              <button
                type="button"
                onClick={() => handleToggleSkill(idx, false)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  !q.hasSkill
                    ? "bg-rose-50 border-rose-200 text-rose-700"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                No
              </button>
            </div>

            <motion.div
              initial={false}
              animate={{
                height: q.hasSkill ? "auto" : 0,
                opacity: q.hasSkill ? 1 : 0,
              }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <textarea
                value={q.userResponse}
                onChange={(e) => handleResponseChange(idx, e.target.value)}
                placeholder="How did you use this skill? (e.g. 'Used it for 2 years at TechCorp')"
                className="w-full mt-2 p-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 bg-white"
                rows={3}
              />
            </motion.div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full h-12 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20 transition-all focus:outline-none disabled:opacity-50"
      >
        {isSubmitting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <Check className="w-4 h-4" />
            <span>Submit Answers &amp; Start Tailor</span>
          </>
        )}
      </button>
    </div>
  );
}
