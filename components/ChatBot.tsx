"use client";

// components/ChatBot.tsx
//
// Floating Placement Prep Chatbot Widget
// Mounts a bottom-right floating button that expands into a context-aware chat box.
// Scoped to the current Job context (if jobId is provided).

import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { MessageSquare, X, Send, Loader2, Maximize2, Minimize2, LogIn } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatBotProps {
  jobId?: string;
  guestMode?: boolean;
}

const GUEST_MESSAGE_LIMIT = 2;

function getGuestReply(input: string, messageCount: number): string {
  if (messageCount >= GUEST_MESSAGE_LIMIT) {
    return (
      "You've reached the free preview limit. **Sign in** to unlock unlimited chatting, " +
      "job-specific interview prep, and personalized resume help from the AI-Powered Assistant."
    );
  }

  const q = input.toLowerCase();

  if (
    q.includes("what is resumeflow") ||
    q.includes("what is resume flow") ||
    q.includes("how does resumeflow") ||
    q.includes("how does it work") ||
    q.includes("what do you do")
  ) {
    return (
      "**ResumeFlow** is an AI-powered placement platform. It helps you:\n\n" +
      "* Upload your master resume and job descriptions\n" +
      "* Tailor ATS-optimized resumes per company\n" +
      "* Track applications on a live Kanban board\n" +
      "* Prep for interviews with the **AI-Powered Assistant**\n\n" +
      "Sign in to start building tailored resumes for your target roles."
    );
  }

  if (q.includes("ats") || q.includes("applicant tracking")) {
    return (
      "**ATS (Applicant Tracking System)** tips:\n\n" +
      "* Use clear section headings (Education, Experience, Skills)\n" +
      "* Mirror keywords from the job description naturally\n" +
      "* Avoid complex tables, graphics, or unusual fonts\n" +
      "* Keep formatting simple — one column works best\n\n" +
      "ResumeFlow auto-tailors your resume for ATS compatibility. Sign in to try it."
    );
  }

  if (
    q.includes("resume") ||
    q.includes("cv") ||
    q.includes("tailor") ||
    q.includes("customize")
  ) {
    return (
      "A strong tailored resume highlights skills that match each job description. " +
      "ResumeFlow analyzes the JD, finds skill gaps, and rewrites your bullets with ATS keywords.\n\n" +
      "**Sign in** to upload your profile and generate company-specific resumes."
    );
  }

  if (
    q.includes("interview") ||
    q.includes("prep") ||
    q.includes("placement") ||
    q.includes("coach")
  ) {
    return (
      "Interview prep works best when it's **role-specific**. After you sign in, the **AI-Powered Assistant** " +
      "can help with technical questions, behavioral answers, and company research for each application.\n\n" +
      "Sign in to unlock full assistant access for your active job drives."
    );
  }

  if (
    q.includes("price") ||
    q.includes("cost") ||
    q.includes("free") ||
    q.includes("sign up") ||
    q.includes("sign in") ||
    q.includes("login") ||
    q.includes("register")
  ) {
    return (
      "Create a free account to get started. Upload your resume, add job listings, and generate " +
      "tailored PDFs with daily usage limits.\n\n" +
      "**Sign in** or **Sign up** to access the full platform."
    );
  }

  if (q.includes("hello") || q.includes("hi") || q.includes("hey")) {
    return (
      "Hi! I'm the **AI-Powered Assistant** preview. I can explain how ResumeFlow works, share general " +
      "resume and ATS tips, and answer basic interview prep questions.\n\n" +
      "For personalized, job-specific help, please sign in."
    );
  }

  return (
    "I can help with general questions about **ResumeFlow**, resume formatting, ATS tips, and " +
    "interview prep basics. For deeper, personalized help tied to your applications, " +
    "**sign in** to continue chatting."
  );
}

const CYCLING_MESSAGES = [
  "Analyzing request...",
  "Consulting placement database...",
  "Structuring recommendations...",
  "Tailoring industry insights...",
  "Drafting professional response...",
  "Polishing final details..."
];

export default function ChatBot({ jobId, guestMode = false }: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    if (!isGenerating) {
      setCurrentMessageIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % CYCLING_MESSAGES.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [isGenerating]);

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isTracking, setIsTracking] = useState(false);
  const [idleGaze, setIdleGaze] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const btnCenterX = rect.left + rect.width / 2;
        const btnCenterY = rect.top + rect.height / 2;

        const dx = e.clientX - btnCenterX;
        const dy = e.clientY - btnCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const trackingRadius =
          window.innerWidth < 640 ? 100 : window.innerWidth < 768 ? 120 : 150;

        if (distance <= trackingRadius) {
          const maxTranslate =
            window.innerWidth < 640 ? 8 : window.innerWidth < 768 ? 10 : 12;
          const x = Math.max(
            -maxTranslate,
            Math.min(maxTranslate, (dx / trackingRadius) * maxTranslate)
          );
          const y = Math.max(
            -maxTranslate * 0.6,
            Math.min(maxTranslate * 0.6, (dy / trackingRadius) * maxTranslate * 0.6)
          );
          setMousePos({ x, y });
          setIsTracking(true);
        } else {
          setIsTracking(false);
        }
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    if (isTracking) {
      setIdleGaze({ x: 0, y: 0 });
      return;
    }

    let isLookingAway = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    const lookAround = () => {
      const maxT = window.innerWidth < 640 ? 8 : window.innerWidth < 768 ? 10 : 12;
      const lookAwayDirections = [
        { x: -maxT, y: 0 },
        { x: maxT, y: 0 },
        { x: 0, y: -maxT * 0.6 },
        { x: 0, y: maxT * 0.6 },
        { x: -maxT * 0.7, y: -maxT * 0.4 },
        { x: maxT * 0.7, y: -maxT * 0.4 },
        { x: -maxT * 0.7, y: maxT * 0.4 },
        { x: maxT * 0.7, y: maxT * 0.4 },
      ];

      let nextGaze: { x: number; y: number };
      let nextDelay: number;

      if (!isLookingAway) {
        const randomIndex = Math.floor(Math.random() * lookAwayDirections.length);
        nextGaze = lookAwayDirections[randomIndex];
        isLookingAway = true;
        nextDelay = 800 + Math.random() * 800;
      } else {
        nextGaze = { x: 0, y: 0 };
        isLookingAway = false;
        nextDelay = 2500 + Math.random() * 2000;
      }

      setIdleGaze(nextGaze);
      timeoutId = setTimeout(lookAround, nextDelay);
    };

    timeoutId = setTimeout(lookAround, 3000);
    return () => clearTimeout(timeoutId);
  }, [isTracking]);

  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    const triggerBlink = () => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 120);
    };

    const blinkCycle = () => {
      const nextDelay = 3000 + Math.random() * 3000;
      return setTimeout(() => {
        triggerBlink();
        timeoutId = blinkCycle();
      }, nextDelay);
    };

    let timeoutId = blinkCycle();
    return () => clearTimeout(timeoutId);
  }, []);

  const parseChatMessage = (text: string, isUser = false) => {
    let html = text;
    html = html.replace(/\r/g, "");
    html = html.replace(/\n{3,}/g, "\n\n");
    html = html.replace(
      /^#+\s*(.*$)/gim,
      `<h4 class="${isUser ? "text-white" : "text-rose-600"} font-bold mt-3 mb-1 text-sm tracking-tight">➔ $1</h4>`
    );
    html = html.replace(
      /\*\*(.*?)\*\*/g,
      `<strong class="font-semibold ${isUser ? "text-white" : "text-slate-900"}">$1</strong>`
    );
    html = html.replace(
      /^\* (.*$)/gim,
      `<li class="ml-4 list-disc pl-1 py-0.5 ${isUser ? "text-white/90" : "text-slate-700"} text-sm">$1</li>`
    );
    html = html.replace(
      /^- (.*$)/gim,
      `<li class="ml-4 list-disc pl-1 py-0.5 ${isUser ? "text-white/90" : "text-slate-700"} text-sm">$1</li>`
    );
    html = html.replace(/\n\n/g, '<div class="h-2"></div>');
    html = html.replace(/\n/g, " ");

    return (
      <span
        className={`block ${isUser ? "text-white" : "text-slate-800"} leading-relaxed`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  };

  const chatJobId = jobId as Id<"jobs"> | undefined;
  const { isSignedIn } = useAuth();
  const { isAuthenticated } = useConvexAuth();
  const isGuest = guestMode && !isSignedIn;

  const [guestMessages, setGuestMessages] = useState<ChatMessage[]>([]);
  const [guestUserCount, setGuestUserCount] = useState(0);

  const chatHistory =
    useQuery(
      api.chat.getChatHistory,
      !isGuest && isAuthenticated ? { jobId: chatJobId } : "skip"
    ) ?? [];
  const sendChatMessage = useMutation(api.chat.sendChatMessage);

  const displayMessages: ChatMessage[] = isGuest ? guestMessages : chatHistory;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayMessages, isOpen, isGenerating]);

  useEffect(() => {
    if (isGuest) return;
    if (chatHistory.length > 0) {
      const lastMessage = chatHistory[chatHistory.length - 1];
      setIsGenerating(lastMessage.role === "user");
    } else {
      setIsGenerating(false);
    }
  }, [chatHistory, isGuest]);

  const guestLimitReached = isGuest && guestUserCount >= GUEST_MESSAGE_LIMIT;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isGenerating) return;

    const text = inputValue.trim();
    setInputValue("");
    setChatError(null);

    if (isGuest) {
      if (guestLimitReached) {
        setChatError("Sign in to continue chatting.");
        return;
      }

      const userMsg: ChatMessage = { role: "user", content: text };
      setGuestMessages((prev) => [...prev, userMsg]);
      setIsGenerating(true);

      const nextCount = guestUserCount + 1;
      setGuestUserCount(nextCount);

      await new Promise((r) => setTimeout(r, 600));

      const reply: ChatMessage = {
        role: "assistant",
        content: getGuestReply(text, nextCount),
      };
      setGuestMessages((prev) => [...prev, reply]);
      setIsGenerating(false);
      return;
    }

    if (!isAuthenticated) {
      setChatError("Authentication is syncing, please wait a moment.");
      return;
    }

    setIsGenerating(true);

    try {
      await sendChatMessage({
        jobId: chatJobId,
        content: text,
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to send message. Please try again.";
      console.error("Failed to send message:", err);
      setChatError(message);
      setIsGenerating(false);
    }
  };

  const eyeX = isTracking ? mousePos.x : idleGaze.x;
  const eyeY = isTracking ? mousePos.y : idleGaze.y;

  return (
    <>
      <AnimatePresence>
        {isOpen && isMaximized && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity"
            onClick={() => setIsMaximized(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            layout
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={
              isMaximized
                ? "fixed inset-4 md:inset-10 lg:inset-16 m-auto max-w-4xl h-[80vh] z-50 rounded-3xl bg-[var(--color-canvas)] shadow-2xl border border-[var(--color-hairline)] flex flex-col overflow-hidden"
                : "fixed bottom-28 sm:bottom-32 right-6 w-96 h-[550px] z-50 bg-[var(--color-canvas)] rounded-[24px] shadow-2xl border border-[var(--color-hairline)] flex flex-col overflow-visible"
            }
          >
            <div className="flex items-center justify-between px-5 py-3 bg-[var(--color-ink)] text-white rounded-t-[24px]">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 relative overflow-hidden rounded-full bg-black flex items-center justify-center shrink-0 border border-white/15">
                  <div className="w-full h-full relative">
                    <Image
                      src="/chatbot-icon.png"
                      alt="AI Assistant avatar"
                      fill
                      className="object-cover rounded-full"
                      sizes="24px"
                    />
                  </div>
                  <div
                    className="absolute inset-0 m-auto w-[14px] h-[9px] rounded-full bg-black z-10"
                    style={{ transform: "translateY(-1.5px)" }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                    <motion.div
                      animate={{
                        x: (isTracking ? mousePos.x : idleGaze.x) * 0.4,
                        y: (isTracking ? mousePos.y : idleGaze.y) * 0.4 - 1.5,
                        scaleY: isBlinking ? 0.05 : 1,
                      }}
                      transition={
                        isBlinking
                          ? { duration: 0.08 }
                          : { type: "spring", stiffness: 150, damping: 15 }
                      }
                      className="flex gap-0.5 items-center justify-center"
                    >
                      <div className="w-[1.5px] h-2 bg-white rounded-full shadow-[0_0_4px_rgba(255,255,255,0.9)]" />
                      <div className="w-[1.5px] h-2 bg-white rounded-full shadow-[0_0_4px_rgba(255,255,255,0.9)]" />
                    </motion.div>
                  </div>
                </div>
                <span className="text-xs font-bold uppercase tracking-wider">AI-Powered Assistant</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsMaximized(!isMaximized)}
                  className="p-1.5 rounded-lg hover:bg-[rgba(255,255,255,0.15)] text-white/80 hover:text-rose-400 transition-colors"
                  title={isMaximized ? "Minimize" : "Maximize"}
                >
                  {isMaximized ? (
                    <Minimize2 className="w-4 h-4" />
                  ) : (
                    <Maximize2 className="w-4 h-4" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setIsMaximized(false);
                  }}
                  className="p-1.5 rounded-lg hover:bg-[rgba(255,255,255,0.15)] text-white/80 hover:text-rose-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[var(--color-surface-soft)]">
              {displayMessages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center px-4">
                  <div className="w-12 h-12 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center mb-3">
                    <MessageSquare className="w-6 h-6 text-[var(--color-primary)]" />
                  </div>
                  <p className="type-body-strong text-sm mb-1">AI-Powered Assistant</p>
                  <p className="type-body-sm text-[var(--color-mute)] text-xs leading-relaxed">
                    {isGuest
                      ? "Ask how ResumeFlow works, get ATS tips, or basic interview prep. Sign in for unlimited, personalized assistance."
                      : "Ask about interview questions, resume tips, or company-specific prep for this role."}
                  </p>
                </div>
              )}

              {displayMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-2.5 rounded-[16px] text-sm ${
                      msg.role === "user"
                        ? "bg-[var(--color-primary)] text-white rounded-br-sm"
                        : "bg-[var(--color-canvas)] border border-[var(--color-hairline)] text-[var(--color-body)] rounded-bl-sm shadow-sm"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <p className="leading-relaxed">{msg.content}</p>
                    ) : (
                      parseChatMessage(msg.content)
                    )}
                  </div>
                </div>
              ))}

              {isGenerating && (
                <div className="flex justify-start">
                  <div className="bg-[var(--color-canvas)] border border-[var(--color-hairline)] px-4 py-3 rounded-[16px] rounded-bl-sm shadow-sm flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-[var(--color-primary)] shrink-0" />
                    <div className="flex items-center min-w-[200px] overflow-hidden">
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={currentMessageIndex}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.18 }}
                          className="text-xs text-[var(--color-mute)] font-medium block whitespace-nowrap"
                        >
                          {CYCLING_MESSAGES[currentMessageIndex]}
                        </motion.span>
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {isGuest && (
              <div className="px-3 pt-2 bg-[var(--color-surface-soft)]">
                {guestLimitReached ? (
                  <Link
                    href="/sign-in"
                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-pressed)] text-white text-xs font-bold rounded-[16px] transition-colors"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    Sign in to continue chatting
                  </Link>
                ) : (
                  <p className="text-[10px] text-center text-[var(--color-mute)] pb-1">
                    Preview mode — {GUEST_MESSAGE_LIMIT - guestUserCount} free message
                    {GUEST_MESSAGE_LIMIT - guestUserCount === 1 ? "" : "s"} left.{" "}
                    <Link href="/sign-in" className="text-[var(--color-primary)] font-semibold hover:underline">
                      Sign in
                    </Link>{" "}
                    for full access.
                  </p>
                )}
              </div>
            )}

            <form
              onSubmit={handleSendMessage}
              className="p-3 border-t border-[var(--color-hairline)] bg-[var(--color-surface-soft)] flex flex-col gap-2 rounded-b-[24px]"
            >
              {chatError && (
                <div className="text-[10px] text-[var(--color-error)] px-2 font-semibold leading-tight">
                  {chatError}
                </div>
              )}
              <div className="flex gap-2 items-center w-full">
                <input
                  disabled={isGenerating || guestLimitReached}
                  type="text"
                  className="flex-1 bg-[var(--color-canvas)] border border-[var(--color-hairline)] rounded-[16px] px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-ink)] disabled:opacity-60"
                  placeholder={
                    guestLimitReached
                      ? "Sign in to continue..."
                      : isGuest
                        ? "Ask about ResumeFlow, ATS, or interview tips..."
                        : "Ask your AI assistant..."
                  }
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    setChatError(null);
                  }}
                />
                <button
                  type="submit"
                  disabled={isGenerating || !inputValue.trim() || guestLimitReached}
                  className="p-2.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-pressed)] disabled:bg-[var(--color-secondary-bg)] disabled:text-[var(--color-ash)] text-white rounded-full transition-colors shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>

            {isOpen && !isMaximized && (
              <>
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: 1,
                    opacity: 0.95,
                    y: [0, -3, 0],
                    x: [0, 1.5, 0],
                  }}
                  transition={{
                    delay: 0.05,
                    y: { repeat: Infinity, duration: 3, ease: "easeInOut" },
                    x: { repeat: Infinity, duration: 3.5, ease: "easeInOut" },
                  }}
                  className="absolute -bottom-4 right-10 w-6 h-6 bg-white border border-slate-100 rounded-full shadow-md backdrop-blur-md z-40 pointer-events-none"
                />
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: 1,
                    opacity: 0.9,
                    y: [0, 3, 0],
                    x: [0, -1.5, 0],
                  }}
                  transition={{
                    delay: 0.12,
                    y: { repeat: Infinity, duration: 3.4, ease: "easeInOut" },
                    x: { repeat: Infinity, duration: 2.8, ease: "easeInOut" },
                  }}
                  className="absolute -bottom-8 right-14 w-4 h-4 bg-white border border-slate-100 rounded-full shadow-sm backdrop-blur-md z-40 pointer-events-none"
                />
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: 1,
                    opacity: 0.85,
                    y: [-2, 2, -2],
                  }}
                  transition={{
                    delay: 0.2,
                    y: { repeat: Infinity, duration: 2.5, ease: "easeInOut" },
                  }}
                  className="absolute -bottom-12 right-16 w-2.5 h-2.5 bg-white border border-slate-100 rounded-full shadow-sm backdrop-blur-md z-40 pointer-events-none"
                />
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div ref={buttonRef} className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        <motion.div
          animate={{ y: [0, -12, 0, -4, 0] }}
          transition={{
            repeat: Infinity,
            repeatDelay: 1,
            duration: 1.2,
            times: [0, 0.4, 0.7, 0.85, 1],
            ease: ["easeOut", "easeIn", "easeOut", "easeIn"],
          }}
          className="relative group"
        >
          <div className="absolute inset-0 rounded-full bg-rose-500/10 animate-ping group-hover:bg-rose-500/20" />

          {isGenerating && (
            <motion.div
              animate={{ rotate: 360, scale: [1, 1.12, 1] }}
              transition={{ repeat: Infinity, duration: 5, ease: "linear" }}
              className="absolute -inset-1.5 rounded-full bg-gradient-to-tr from-rose-500 via-purple-500 to-indigo-500 opacity-40 blur-md pointer-events-none"
            />
          )}

          <motion.button
            type="button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 12 }}
            onClick={() => setIsOpen(!isOpen)}
            className="relative w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center focus:outline-none overflow-hidden transition-all shadow-2xl bg-black border border-white/5 z-10"
          >
            <div className="w-full h-full relative scale-105">
              <Image
                src="/chatbot-icon.png"
                alt="AI-Powered Assistant"
                fill
                className="object-cover rounded-full"
                sizes="(max-width: 640px) 56px, (max-width: 768px) 64px, 80px"
                priority
              />
            </div>

            <div
              className="absolute inset-0 m-auto w-[28px] h-[18px] sm:w-[32px] sm:h-[22px] md:w-[44px] md:h-[28px] rounded-full bg-black z-10"
              style={{ transform: "translateY(-5px)" }}
            />

            <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
              <motion.div
                animate={{
                  x: eyeX,
                  y: eyeY - 5,
                  scaleY: isBlinking ? 0.05 : 1,
                }}
                transition={
                  isBlinking
                    ? { duration: 0.08 }
                    : { type: "spring", stiffness: 150, damping: 15 }
                }
                className="flex gap-[2px] sm:gap-[3px] md:gap-[4px] items-center justify-center"
              >
                <div className="w-[2px] h-[7px] sm:w-[3px] sm:h-[10px] md:w-[4px] md:h-[12px] bg-white rounded-full shadow-[0_0_6px_rgba(255,255,255,0.9)]" />
                <div className="w-[2px] h-[7px] sm:w-[3px] sm:h-[10px] md:w-[4px] md:h-[12px] bg-white rounded-full shadow-[0_0_6px_rgba(255,255,255,0.9)]" />
              </motion.div>
            </div>
          </motion.button>
        </motion.div>
      </div>
    </>
  );
}
