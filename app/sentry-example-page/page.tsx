"use client";

import { useState } from "react";
import * as Sentry from "@sentry/nextjs";

export default function SentryExamplePage() {
  const [status, setStatus] = useState<string>("");

  const triggerClientError = () => {
    setStatus("Triggering client error...");
    // Call an undefined function as requested by Sentry testing guidelines
    try {
      (window as Record<string, () => void>).myUndefinedFunction();
    } catch (err) {
      Sentry.captureException(err);
      setStatus("Client error captured and sent to Sentry!");
      throw err;
    }
  };

  const triggerManualException = () => {
    setStatus("Triggering manual Sentry exception...");
    Sentry.captureException(new Error("Test Sentry Error from ResumeFlow Sentry Example Page"));
    setStatus("Manual Sentry error sent!");
  };

  const triggerUnhandledRejection = () => {
    setStatus("Triggering unhandled rejection...");
    Promise.reject(new Error("Unhandled Promise Rejection Test Error"));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-xl">
            S
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Sentry Verification Page</h1>
            <p className="text-sm text-slate-400">Test error capturing in ResumeFlow</p>
          </div>
        </div>

        {status && (
          <div className="p-3 bg-purple-950/50 border border-purple-800/50 rounded-lg text-sm text-purple-300">
            {status}
          </div>
        )}

        <div className="space-y-3 pt-2">
          <button
            onClick={triggerClientError}
            className="w-full py-3 px-4 bg-red-600 hover:bg-red-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-red-600/20 text-left flex items-center justify-between"
          >
            <span>1. Trigger Undefined Function Error</span>
            <span className="text-xs bg-red-800/60 px-2 py-1 rounded">myUndefinedFunction()</span>
          </button>

          <button
            onClick={triggerManualException}
            className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-purple-600/20 text-left flex items-center justify-between"
          >
            <span>2. Capture Manual Sentry Exception</span>
            <span className="text-xs bg-purple-800/60 px-2 py-1 rounded">Sentry.captureException()</span>
          </button>

          <button
            onClick={triggerUnhandledRejection}
            className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-amber-600/20 text-left flex items-center justify-between"
          >
            <span>3. Trigger Unhandled Promise Rejection</span>
            <span className="text-xs bg-amber-800/60 px-2 py-1 rounded">Promise.reject()</span>
          </button>
        </div>

        <div className="text-xs text-slate-500 border-t border-slate-800 pt-4">
          <p>Sentry Organization: <strong className="text-slate-400">resume-flow</strong> | Project: <strong className="text-slate-400">resumeflow</strong></p>
        </div>
      </div>
    </div>
  );
}
