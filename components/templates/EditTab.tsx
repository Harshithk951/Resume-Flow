"use client";

import Link from "next/link";
import { ArrowRight, User } from "lucide-react";
import { TextInput } from "./shared";

interface EditTabProps {
  jobTarget: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  onJobTargetChange: (value: string) => void;
  onFullNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onSummaryChange: (value: string) => void;
}

export default function EditTab({
  jobTarget,
  fullName,
  email,
  phone,
  location,
  summary,
  onJobTargetChange,
  onFullNameChange,
  onEmailChange,
  onPhoneChange,
  onLocationChange,
  onSummaryChange,
}: EditTabProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-[var(--color-hairline)] bg-[var(--color-surface-soft)] p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-canvas)] border border-[var(--color-hairline)]">
            <User size={16} className="text-[var(--color-ash)]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[var(--color-ink)]">Personal details</p>
            <p className="mt-0.5 text-xs text-[var(--color-ash)] leading-relaxed">
              Fill in basics here or import your full master profile for tailored resumes.
            </p>
            <Link
              href="/resume/builder"
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-primary)] hover:underline"
            >
              Open full profile
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>

      <TextInput
        label="Job target"
        value={jobTarget}
        placeholder="e.g. Software Engineer"
        onChange={onJobTargetChange}
      />
      <TextInput
        label="Full name"
        value={fullName}
        placeholder="Your name"
        onChange={onFullNameChange}
      />
      <TextInput
        label="Email"
        type="email"
        value={email}
        placeholder="you@email.com"
        onChange={onEmailChange}
      />
      <TextInput
        label="Phone"
        value={phone}
        placeholder="+1 (555) 000-0000"
        onChange={onPhoneChange}
      />
      <TextInput
        label="Location"
        value={location}
        placeholder="City, Country"
        onChange={onLocationChange}
      />

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-stone)] mb-2">
          Professional summary
        </p>
        <textarea
          value={summary}
          placeholder="Brief overview of your experience and goals..."
          rows={4}
          onChange={(e) => onSummaryChange(e.target.value)}
          className="w-full resize-none rounded-lg border border-[var(--color-hairline)] bg-[var(--color-canvas)] px-3 py-2.5 text-sm text-[var(--color-ink-soft)] placeholder:text-[var(--color-stone)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/15"
        />
      </div>
    </div>
  );
}
