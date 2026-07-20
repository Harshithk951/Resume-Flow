"use client";

import { ChevronDown } from "lucide-react";

interface SectionLabelProps {
  children: React.ReactNode;
}

export function SectionLabel({ children }: SectionLabelProps) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-stone)] mb-2">
      {children}
    </p>
  );
}

interface SelectFieldProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

export function SelectField({ label, value, options, onChange }: SelectFieldProps) {
  return (
    <div>
      <SectionLabel>{label}</SectionLabel>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-lg border border-[var(--color-hairline)] bg-[var(--color-canvas)] px-3 py-2.5 pr-9 text-sm text-[var(--color-ink-soft)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/15"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-stone)]"
        />
      </div>
    </div>
  );
}

interface SliderFieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
}

export function SliderField({
  label,
  value,
  min,
  max,
  step = 1,
  unit = "",
  onChange,
}: SliderFieldProps) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <SectionLabel>{label}</SectionLabel>
        <span className="text-xs font-medium text-[var(--color-mute)]">
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[var(--color-secondary-bg)] accent-[var(--color-primary)]"
      />
    </div>
  );
}

interface RadioGroupProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

export function RadioGroup({ label, value, options, onChange }: RadioGroupProps) {
  return (
    <div>
      <SectionLabel>{label}</SectionLabel>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                selected
                  ? "border-[var(--color-primary)] bg-rose-50 text-[var(--color-primary)]"
                  : "border-[var(--color-hairline)] bg-[var(--color-canvas)] text-[var(--color-mute)] hover:border-[var(--color-secondary-bg)]"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface TextInputProps {
  label: string;
  value: string;
  placeholder?: string;
  type?: string;
  onChange: (value: string) => void;
}

export function TextInput({
  label,
  value,
  placeholder,
  type = "text",
  onChange,
}: TextInputProps) {
  return (
    <div>
      <SectionLabel>{label}</SectionLabel>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-[var(--color-hairline)] bg-[var(--color-canvas)] px-3 py-2.5 text-sm text-[var(--color-ink-soft)] placeholder:text-[var(--color-stone)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/15"
      />
    </div>
  );
}
