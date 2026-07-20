'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from '@/lib/toast';

export function ContactForm() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Message sent! We\'ll respond within 24 hours.');
    }, 1000);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[var(--color-surface-soft)]/50 p-6 rounded-3xl border border-[var(--color-hairline)]/40 space-y-4 max-w-md mx-auto"
    >
      <h3 className="font-bold text-sm text-[var(--color-ink-soft)] mb-2">
        Send us a direct message
      </h3>
      <div className="grid grid-cols-2 gap-3">
        <input
          required
          type="text"
          placeholder="Name"
          className="bg-[var(--color-canvas)] border border-[var(--color-hairline)]/60 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rose-500"
        />
        <input
          required
          type="email"
          placeholder="Email"
          className="bg-[var(--color-canvas)] border border-[var(--color-hairline)]/60 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rose-500"
        />
      </div>
      <textarea
        required
        placeholder="Your message..."
        rows={4}
        className="w-full bg-[var(--color-canvas)] border border-[var(--color-hairline)]/60 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rose-500"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
      >
        {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
        Send Message
      </button>
    </form>
  );
}
