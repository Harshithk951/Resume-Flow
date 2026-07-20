"use client";

// components/ChatHistoryPanel.tsx
//
// Slide-over panel shown from the sidebar "Chat History" button.
// Lists past chat sessions grouped by date. Each session can be
// opened in the ChatBot or deleted.

import { useState } from "react";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { MessageSquare, Trash2, X, ExternalLink, History, ChevronRight, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ChatHistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

function formatSessionDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (a: Date, b: Date) =>
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate();

  if (isSameDay(date, today)) return "Today";
  if (isSameDay(date, yesterday)) return "Yesterday";
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function ChatHistoryPanel({ isOpen, onClose }: ChatHistoryPanelProps) {
  const { isAuthenticated } = useConvexAuth();
  const sessions = useQuery(
    api.chat.getChatSessions,
    isAuthenticated ? {} : "skip"
  ) ?? [];
  const deleteChatSession = useMutation(api.chat.deleteChatSession);

  const [deletingKey, setDeletingKey] = useState<string | null>(null);
  const [confirmKey, setConfirmKey] = useState<string | null>(null);

  const handleOpen = (session: { jobId?: string; sessionDate: string }) => {
    // Dispatch a custom event that ChatBot listens to
    window.dispatchEvent(
      new CustomEvent("open-chat-session", {
        detail: { jobId: session.jobId, sessionDate: session.sessionDate },
      })
    );
    onClose();
  };

  const handleDelete = async (session: { jobId?: string; sessionDate: string }) => {
    const key = `${session.jobId ?? "general"}::${session.sessionDate}`;
    setDeletingKey(key);
    try {
      await deleteChatSession({
        jobId: session.jobId as any,
        sessionDate: session.sessionDate,
      });
    } finally {
      setDeletingKey(null);
      setConfirmKey(null);
    }
  };

  // Group sessions by date label
  const grouped = sessions.reduce<Record<string, typeof sessions>>((acc, s) => {
    const label = formatSessionDate(s.sessionDate);
    if (!acc[label]) acc[label] = [];
    acc[label].push(s);
    return acc;
  }, {});

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-[2px] z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed left-[72px] md:left-[72px] top-0 bottom-0 w-80 bg-[var(--color-canvas)] border-r border-[var(--color-hairline)]/60 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-hairline-soft)]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center shadow-sm">
                  <History className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[var(--color-ink-soft)]">Chat History</p>
                  <p className="text-[10px] text-[var(--color-stone)]">{sessions.length} conversation{sessions.length !== 1 ? "s" : ""}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-[var(--color-surface-card)] text-[var(--color-stone)] hover:text-[var(--color-charcoal)] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Session list */}
            <div className="flex-1 overflow-y-auto py-2">
              {sessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center px-6">
                  <div className="w-12 h-12 rounded-full bg-[var(--color-surface-card)] flex items-center justify-center mb-3">
                    <MessageSquare className="w-5 h-5 text-slate-300" />
                  </div>
                  <p className="text-sm font-semibold text-[var(--color-ash)]">No conversations yet</p>
                  <p className="text-xs text-[var(--color-stone)] mt-1">Start chatting with the AI assistant</p>
                </div>
              ) : (
                Object.entries(grouped).map(([dateLabel, groupSessions]) => (
                  <div key={dateLabel}>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-stone)] px-5 pt-4 pb-1.5">
                      {dateLabel}
                    </p>
                    {groupSessions.map((session) => {
                      const key = `${session.jobId ?? "general"}::${session.sessionDate}`;
                      const isDeleting = deletingKey === key;
                      const isConfirming = confirmKey === key;

                      return (
                        <div
                          key={key}
                          className="group mx-2 mb-1 rounded-xl hover:bg-[var(--color-surface-soft)] border border-transparent hover:border-[var(--color-hairline)]/60 transition-all duration-150"
                        >
                          <div className="flex items-start gap-3 px-3 py-3">
                            {/* Icon */}
                            <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0 mt-0.5">
                              <MessageSquare className="w-3.5 h-3.5 text-rose-500" />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-[var(--color-charcoal)] truncate">
                                {session.jobId ? "Job Interview Prep" : "General Chat"}
                              </p>
                              <p className="text-[11px] text-[var(--color-stone)] truncate mt-0.5 leading-relaxed">
                                {session.lastMessage}
                              </p>
                              <p className="text-[10px] text-slate-300 mt-1">
                                {session.messageCount} message{session.messageCount !== 1 ? "s" : ""}
                              </p>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                              {/* Open button */}
                              <button
                                onClick={() => handleOpen(session)}
                                className="p-1.5 rounded-lg hover:bg-rose-50 text-[var(--color-stone)] hover:text-rose-600 transition-colors"
                                title="Open this conversation"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete button */}
                              {isConfirming ? (
                                <div className="flex flex-col gap-1">
                                  <button
                                    onClick={() => handleDelete(session)}
                                    disabled={isDeleting}
                                    className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                                    title="Confirm delete"
                                  >
                                    {isDeleting ? (
                                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                      <Trash2 className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                  <button
                                    onClick={() => setConfirmKey(null)}
                                    className="p-1.5 rounded-lg hover:bg-[var(--color-surface-card)] text-[var(--color-stone)] transition-colors"
                                    title="Cancel"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={(e) => { e.stopPropagation(); setConfirmKey(key); }}
                                  className="p-1.5 rounded-lg hover:bg-red-50 text-[var(--color-stone)] hover:text-red-500 transition-colors"
                                  title="Delete conversation"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Confirm banner */}
                          <AnimatePresence>
                            {isConfirming && !isDeleting && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="px-3 pb-2.5 text-[10px] text-red-500 font-semibold">
                                  Delete this session? This can't be undone.
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Open row - click whole card to open */}
                          <button
                            onClick={() => handleOpen(session)}
                            className="w-full flex items-center gap-1 px-3 pb-2.5 text-[10px] font-bold text-rose-500 hover:text-rose-700 transition-colors"
                          >
                            <ChevronRight className="w-3 h-3" />
                            Open conversation
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            {/* Footer hint */}
            <div className="px-5 py-3 border-t border-[var(--color-hairline-soft)] bg-[var(--color-surface-soft)]/50">
              <p className="text-[10px] text-[var(--color-stone)] text-center">
                Click any conversation to resume it in the chat widget
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
