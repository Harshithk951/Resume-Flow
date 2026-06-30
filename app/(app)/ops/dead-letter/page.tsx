"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Copy,
  ChevronRight,
  Database,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

type TabStatus = "all" | "failed" | "pending" | "delivered";

export default function DeadLetterDashboard() {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabStatus>("all");
  const [copied, setCopied] = useState(false);
  const [replayingId, setReplayingId] = useState<string | null>(null);
  const [forcingWorker, setForcingWorker] = useState(false);

  // Queries
  const events = useQuery(
    api.webhooks.listWebhookEvents,
    activeTab === "all" ? {} : { status: activeTab as any }
  ) ?? [];

  // Mutations
  const replayWebhook = useMutation(api.webhooks.manualReplayWebhook);
  const forceProcessQueue = useMutation(api.webhooks.forceProcessQueue);

  // Find selected event details
  const selectedEvent = events.find((e: any) => e._id === selectedEventId);

  // Stats calculation
  const totalCount = events.length;
  const failedCount = events.filter((e: any) => e.status === "failed").length;
  const pendingCount = events.filter((e: any) => e.status === "pending").length;
  const deliveredCount = events.filter((e: any) => e.status === "delivered").length;

  const handleCopyPayload = (payload: any) => {
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReplay = async (eventId: any) => {
    setReplayingId(eventId);
    try {
      await replayWebhook({ eventId });
    } catch (err) {
      console.error("Failed to replay webhook:", err);
    } finally {
      setReplayingId(null);
    }
  };

  const handleForceProcess = async () => {
    setForcingWorker(true);
    try {
      await forceProcessQueue();
    } catch (err) {
      console.error("Failed to process queue worker:", err);
    } finally {
      setTimeout(() => setForcingWorker(false), 1500);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header section with Awwwards-style typography */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-rose-600 uppercase tracking-widest bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
            System Operations
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight mt-3 text-slate-900">
            Integration Pipeline
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitor and replay outbound webhook sync events across all placement tenants.
          </p>
        </div>
        
        <button
          onClick={handleForceProcess}
          disabled={forcingWorker}
          className="btn-primary flex items-center justify-center gap-2 self-start md:self-auto min-w-[180px] h-12 shadow-md hover:shadow-lg transition-all rounded-2xl bg-slate-900 text-white font-medium hover:bg-slate-800 disabled:opacity-70"
        >
          {forcingWorker ? (
            <RefreshCw className="w-4 h-4 animate-spin text-rose-500" />
          ) : (
            <Activity className="w-4 h-4 text-rose-500" />
          )}
          <span>{forcingWorker ? "Processing Queue..." : "Run Queue Worker"}</span>
        </button>
      </div>

      {/* Stats Bento Grid Panel */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/40 backdrop-blur-md border border-slate-200/40 p-6 rounded-3xl shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group hover:border-slate-300 transition-colors">
          <div className="absolute top-[-20%] right-[-10%] w-24 h-24 bg-rose-500/5 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Buffer</span>
          <span className="text-3xl font-extrabold text-slate-800">{totalCount}</span>
        </div>

        <div className="bg-white/40 backdrop-blur-md border border-slate-200/40 p-6 rounded-3xl shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group hover:border-slate-300 transition-colors">
          <div className="absolute top-[-20%] right-[-10%] w-24 h-24 bg-green-500/5 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500" />
          <span className="text-xs font-bold text-green-600 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Delivered
          </span>
          <span className="text-3xl font-extrabold text-slate-800">{deliveredCount}</span>
        </div>

        <div className="bg-white/40 backdrop-blur-md border border-slate-200/40 p-6 rounded-3xl shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group hover:border-slate-300 transition-colors">
          <div className="absolute top-[-20%] right-[-10%] w-24 h-24 bg-amber-500/5 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500" />
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Pending
          </span>
          <span className="text-3xl font-extrabold text-slate-800">{pendingCount}</span>
        </div>

        <div className="bg-white/40 backdrop-blur-md border border-slate-200/40 p-6 rounded-3xl shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group hover:border-slate-300 transition-colors">
          <div className="absolute top-[-20%] right-[-10%] w-24 h-24 bg-rose-500/10 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500" />
          <span className="text-xs font-bold text-rose-600 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            Failed (Dead)
          </span>
          <span className="text-3xl font-extrabold text-slate-800">{failedCount}</span>
        </div>
      </div>

      {/* Main Split Layout Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Webhook Queue List */}
        <div className="lg:col-span-5 space-y-4">
          {/* Tab Selection */}
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200/60 max-w-md">
            {(["all", "failed", "pending", "delivered"] as TabStatus[]).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setSelectedEventId(null);
                }}
                className={`flex-1 text-center py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
                  activeTab === tab
                    ? "bg-white text-rose-600 shadow-sm border border-slate-200/40 font-extrabold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[600px] pr-2">
            {events.length === 0 ? (
              <div className="bg-white/40 border border-slate-200/40 rounded-3xl p-8 text-center text-slate-400">
                <Database className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-500" />
                <span className="text-xs font-semibold">No webhook events in queue.</span>
              </div>
            ) : (
              events.map((event: any) => {
                const isSelected = selectedEventId === event._id;
                return (
                  <motion.div
                    key={event._id}
                    layoutId={`event-${event._id}`}
                    onClick={() => setSelectedEventId(event._id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative group flex items-center justify-between bg-white ${
                      isSelected
                        ? "border-rose-400 shadow-md ring-1 ring-rose-300"
                        : "border-slate-200/80 hover:border-slate-300 shadow-sm"
                    }`}
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800 truncate uppercase tracking-wider">
                          {event.eventType}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          ({event.attempts} attempts)
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 truncate">
                        <span>Tenant:</span>
                        <span className="font-semibold text-slate-600 truncate">{event.tenantId}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 ml-4">
                      {event.status === "delivered" && (
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                      )}
                      {event.status === "pending" && (
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                      )}
                      {event.status === "failed" && (
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)] animate-pulse" />
                      )}
                      <ChevronRight className={`w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform ${isSelected ? "text-rose-500" : ""}`} />
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Detailed View Panel */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {selectedEvent ? (
              <motion.div
                key={selectedEvent._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="bg-white/60 backdrop-blur-md border border-slate-200/50 rounded-3xl p-6 shadow-md space-y-6 relative overflow-hidden"
              >
                {/* Visual glow element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-radial from-rose-500/5 to-transparent blur-xl pointer-events-none" />

                <div className="flex justify-between items-start gap-4 pb-4 border-b border-slate-200/60">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">
                      {selectedEvent.eventType}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      Event ID: {selectedEvent._id}
                    </p>
                  </div>
                  
                  {selectedEvent.status === "failed" && (
                    <button
                      onClick={() => handleReplay(selectedEvent._id)}
                      disabled={replayingId === selectedEvent._id}
                      className="btn-primary h-9 px-4 rounded-xl text-xs font-bold tracking-wider uppercase bg-rose-600 hover:bg-rose-500 text-white shadow-sm flex items-center gap-1.5 transition-all disabled:opacity-70"
                    >
                      {replayingId === selectedEvent._id ? (
                        <RefreshCw className="w-3 h-3 animate-spin" />
                      ) : (
                        <RefreshCw className="w-3 h-3" />
                      )}
                      <span>{replayingId === selectedEvent._id ? "Replaying..." : "Replay Webhook"}</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Status</span>
                    <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md inline-block border mt-1 ${
                      selectedEvent.status === "delivered" ? "bg-green-50 text-green-600 border-green-200" :
                      selectedEvent.status === "pending" ? "bg-amber-50 text-amber-600 border-amber-200" :
                      "bg-rose-50 text-rose-600 border-rose-200"
                    }`}>
                      {selectedEvent.status}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Next Retry</span>
                    <span className="text-xs font-semibold text-slate-700 mt-1.5 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {formatDistanceToNow(new Date(selectedEvent.nextRetryTime), { addSuffix: true })}
                    </span>
                  </div>
                </div>

                {selectedEvent.lastError && (
                  <div className="space-y-1.5 bg-rose-50/50 border border-rose-100 rounded-2xl p-4">
                    <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Last Inbound Error Trace
                    </span>
                    <p className="text-xs font-mono text-rose-700 whitespace-pre-wrap leading-relaxed">
                      {selectedEvent.lastError}
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Payload Payload JSON</span>
                    <button
                      onClick={() => handleCopyPayload(selectedEvent.payload)}
                      className="text-xs text-slate-500 hover:text-rose-600 flex items-center gap-1 transition-colors"
                    >
                      {copied ? (
                        <Check className="w-3.5 h-3.5 text-green-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copied ? "Copied!" : "Copy JSON"}</span>
                    </button>
                  </div>

                  <div className="bg-slate-950 border border-slate-900 rounded-2xl p-4 overflow-hidden relative group">
                    <div className="absolute inset-0 bg-radial from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    
                    <pre className="text-xs font-mono text-emerald-400/90 overflow-x-auto max-h-[300px] leading-relaxed p-1">
                      {JSON.stringify(selectedEvent.payload, null, 2)}
                    </pre>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="bg-white/40 backdrop-blur-md border border-slate-200/40 rounded-3xl p-16 text-center text-slate-400 h-[400px] flex flex-col justify-center items-center">
                <Database className="w-12 h-12 mb-3 text-slate-300 animate-pulse" />
                <h4 className="font-bold text-slate-800 text-sm">Select a webhook event</h4>
                <p className="text-xs text-slate-500 max-w-[280px] mx-auto mt-1">
                  Click on an item in the queue to inspect its outbound payload and trace retry backlogs.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
