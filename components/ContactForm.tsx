'use client';

import { useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1000);
  };

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 p-6 rounded-2xl flex items-center gap-3 text-green-700 text-sm max-w-md mx-auto">
        <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
        <span>
          Thank you for your message! Our team will respond within 24 hours.
        </span>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-slate-50/50 p-6 rounded-3xl border border-slate-200/40 space-y-4 max-w-md mx-auto"
    >
      <h3 className="font-bold text-sm text-slate-800 mb-2">
        Send us a direct message
      </h3>
      <div className="grid grid-cols-2 gap-3">
        <input
          required
          type="text"
          placeholder="Name"
          className="bg-white border border-slate-200/60 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rose-500"
        />
        <input
          required
          type="email"
          placeholder="Email"
          className="bg-white border border-slate-200/60 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rose-500"
        />
      </div>
      <textarea
        required
        placeholder="Your message..."
        rows={4}
        className="w-full bg-white border border-slate-200/60 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rose-500"
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
