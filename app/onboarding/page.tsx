"use client";

import React, { useState, useEffect } from "react";

import { useUser, useSession } from "@clerk/nextjs";
import { useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  CheckCircle,
  Award,
  BookOpen,
  User,
  Phone,
  Mail,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { triggerSideCannons } from "@/lib/confetti";

// Custom Cubic Bezier Easing from Awards Design Guidelines
const easeOutExpo = [0.16, 1, 0.3, 1] as const;

// Staggered reveal variants
const stepVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: easeOutExpo }
  },
  exit: {
    opacity: 0,
    x: -50,
    transition: { duration: 0.5, ease: easeOutExpo }
  }
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const staggerItem = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: easeOutExpo }
  }
};

export default function OnboardingPage() {
  const { user, isLoaded: isClerkLoaded } = useUser();
  const { session } = useSession();

  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Convex integration
  const createOrGetUser = useMutation(api.users.createOrGetUser);
  const confirmProfile = useMutation(api.onboarding.confirmProfile);
  const markOnboardingComplete = useAction(api.onboarding.markOnboardingComplete);

  // Form Fields State
  const [userId, setUserId] = useState<any>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [branch, setBranch] = useState("Computer Science");
  const [cgpa, setCgpa] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");
  const [portfolio] = useState("");

  // Establish Convex User record
  useEffect(() => {
    let active = true;
    if (isClerkLoaded && user) {
      createOrGetUser()
        .then((uid) => {
          if (active) {
            setUserId(uid);
          }
        })
        .catch((err) => {
          console.error("Failed to establish Convex user record:", err);
        });
    }
    return () => {
      active = false;
    };
  }, [isClerkLoaded, user, createOrGetUser]);

  // Trigger confetti celebration when onboarding finishes (Step 2)
  useEffect(() => {
    if (step === 2) {
      triggerSideCannons();
    }
  }, [step]);

  // Pre-fill name and email from Clerk user when entering the form step
  useEffect(() => {
    if (step === 1 && user) {
      setName((prev) => prev || user.fullName || "");
      setEmail((prev) => prev || user?.primaryEmailAddress?.emailAddress || "");
    }
  }, [step, user]);

  if (!isClerkLoaded) {
    return (
      <div className="min-h-[100dvh] bg-[var(--color-surface-soft)] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-[var(--color-primary)] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const handleConfirmProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cgpaFloat = parseFloat(cgpa);
    if (isNaN(cgpaFloat) || cgpaFloat < 0.0 || cgpaFloat > 10.0) {
      setError("Please enter a valid CGPA between 0.0 and 10.0.");
      return;
    }

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    try {
      // 1. Confirm and save profile metrics
      const result = await confirmProfile({
        userId,
        branch,
        cgpa: cgpaFloat,
        personalInfo: {
          name,
          email,
          phone,
          linkedin,
          github,
          portfolio,
        },
      });

      if (!result.success) {
        setError(result.error || "Failed to confirm profile. Please try again.");
        return;
      }

      // 2. Mark onboarding as complete and update Clerk publicMetadata
      if (user) {
        await markOnboardingComplete({
          userId,
          clerkId: user.id,
        });

        // Set user-scoped local cookie synchronously to bypass Clerk JWT propagation latency
        document.cookie = `onboarding_complete_${user.id}=true; path=/; max-age=31536000; SameSite=Lax; Secure`;

        // Force refresh Clerk session token to include onboardingComplete claim
        try {
          if (session) {
            await session.reload();
            await session.getToken({ skipCache: true });
          }
        } catch (reloadErr) {
          console.error("Failed to reload Clerk session in confirmProfile:", reloadErr);
        }
      }

      setStep(2);
    } catch (err: any) {
      console.error(err);
      const msg = err.data || err.message || "Failed to confirm profile. Please try again.";
      setError(msg);
    }
  };

  const handleEnterDashboard = async () => {
    try {
      if (user) {
        document.cookie = `onboarding_complete_${user.id}=true; path=/; max-age=31536000; SameSite=Lax; Secure`;
      }
      if (session) {
        await session.reload();
        await session.getToken({ skipCache: true });
      }
    } catch (reloadErr) {
      console.error("Failed to reload Clerk session in handleEnterDashboard:", reloadErr);
    }
    window.location.href = "/dashboard";
  };

  return (
    <div className="min-h-[100dvh] bg-[var(--color-surface-soft)] text-[var(--color-ink)] flex flex-col justify-between selection:bg-[var(--color-primary)] selection:text-white">
      {/* Background Gradients (Awards Design: color & atmosphere) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-radial from-rose-500/5 to-transparent blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-radial from-[rgba(230,0,35,0.03)] to-transparent blur-[120px]" />
      </div>

      {/* Header */}
      <header className="px-[var(--spacing-xl)] py-6 flex justify-between items-center z-10 border-b border-[var(--color-hairline-soft)] bg-white/40 backdrop-blur-md sticky top-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white font-bold text-lg">
            R
          </div>
          <span className="font-extrabold tracking-tight text-xl">ResumeFlow</span>
        </div>
        <div className="flex items-center gap-2 type-body-sm text-[var(--color-mute)]">
          <span>Step {step + 1} of 3</span>
          <div className="w-24 h-1.5 bg-[var(--color-hairline)] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: `${((step + 1) / 3) * 100}%` }}
              transition={{ ease: easeOutExpo, duration: 0.8 }}
              className="h-full bg-[var(--color-primary)]"
            />
          </div>
        </div>
      </header>

      {/* Main Form container */}
      <main className="flex-1 flex items-center justify-center px-[var(--spacing-xl)] py-12 z-10">
        <div className="w-full max-w-[900px] grid grid-cols-1 sm:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: Visual Typography Intro (Awards Design: Asymmetry & Scale) */}
          <div className="sm:col-span-5 flex flex-col justify-between p-6">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.span variants={staggerItem} className="text-[var(--color-primary)] font-bold text-xs uppercase tracking-widest block mb-4">
                Placement Suite Onboarding
              </motion.span>
              
              <AnimatePresence mode="wait">
                {step === 0 && (
                  <motion.div
                    key="intro-0"
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={stepVariants}
                  >
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.1] mb-6 no-orphans">
                      Begin your placement journey.
                    </h1>
                    <p className="type-body-md text-[var(--color-mute)]">
                      Set up your academic profile to start matching and tailoring applications for campus placements.
                    </p>
                  </motion.div>
                )}
                {step === 1 && (
                  <motion.div
                    key="intro-1"
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={stepVariants}
                  >
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.1] mb-6 no-orphans">
                      Confirm credentials.
                    </h1>
                    <p className="type-body-md text-[var(--color-mute)]">
                      Please verify your academic division details. Your CGPA must conform to the 10-point scale for placement filter matches.
                    </p>
                  </motion.div>
                )}
                {step === 2 && (
                  <motion.div
                    key="intro-2"
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={stepVariants}
                  >
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.1] mb-6 no-orphans">
                      You are fully verified.
                    </h1>
                    <p className="type-body-md text-[var(--color-mute)]">
                      Your profile has been created. You have been granted 10,000 credits (20 resume generations) to get started.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <div className="mt-8 pt-8 border-t border-[var(--color-hairline-soft)] hidden md:block">
              <div className="flex items-center gap-3 text-xs text-[var(--color-mute)]">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Single-tenant sandbox encryption active</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interaction Card */}
          <div className="sm:col-span-7 bg-[var(--color-canvas)] rounded-[32px] border border-[var(--color-hairline-soft)] p-8 shadow-sm flex flex-col justify-center relative overflow-hidden">
            <AnimatePresence mode="wait">
              
              {/* STEP 0: Welcome / Start */}
              {step === 0 && (
                <motion.div
                  key="step-0"
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={stepVariants}
                  className="flex flex-col gap-6"
                >
                  <div className="flex gap-4 items-start p-4 rounded-2xl bg-[var(--color-surface-soft)]">
                    <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-[var(--color-primary)] shrink-0">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="type-body-strong">Welcome Credits
                      </h4>
                      <p className="type-body-sm mt-1">10,000 credits included — enough for 20 tailored resumes.</p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start p-4 rounded-2xl bg-[var(--color-surface-soft)]">
                    <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-[var(--color-primary)] shrink-0">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="type-body-strong">Campus Placement Sync</h4>
                      <p className="type-body-sm mt-1">Direct integration with your college Placement Cell inbound database.</p>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setStep(1)}
                    className="btn-primary w-full mt-6 flex items-center justify-center gap-2 h-12"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </motion.div>
              )}

              {/* STEP 1: Profile Form (Manual Entry) */}
              {step === 1 && (
                <motion.div
                  key="step-1"
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={stepVariants}
                >
                  <form onSubmit={handleConfirmProfile} className="flex flex-col gap-5">
                    {error && (
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 text-[var(--color-error)] text-sm border border-red-100">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Name */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-[var(--color-mute)] flex items-center gap-1">
                          <User className="w-3 h-3" /> Full Name
                        </label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-hairline)] bg-[var(--color-surface-soft)] focus:outline-none focus:border-[var(--color-primary)] transition-all"
                          placeholder="John Doe"
                        />
                      </div>

                      {/* Email */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-[var(--color-mute)] flex items-center gap-1">
                          <Mail className="w-3 h-3" /> Email Address
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-hairline)] bg-[var(--color-surface-soft)] focus:outline-none focus:border-[var(--color-primary)] transition-all"
                          placeholder="john@university.edu"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Branch Dropdown */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-[var(--color-mute)] flex items-center gap-1">
                          <GraduationCap className="w-3 h-3" /> Branch / Department
                        </label>
                        <select
                          value={branch}
                          onChange={(e) => setBranch(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-hairline)] bg-[var(--color-surface-soft)] focus:outline-none focus:border-[var(--color-primary)] transition-all cursor-pointer"
                        >
                          <option value="Computer Science">Computer Science & Engineering</option>
                          <option value="Information Technology">Information Technology</option>
                          <option value="Electronics & Communication">Electronics & Communication</option>
                          <option value="Electrical Engineering">Electrical Engineering</option>
                          <option value="Mechanical Engineering">Mechanical Engineering</option>
                          <option value="Civil Engineering">Civil Engineering</option>
                          <option value="Biotechnology">Biotechnology</option>
                          <option value="Business Administration">Business Administration</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      {/* CGPA */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-[var(--color-mute)] flex items-center gap-1">
                          <Award className="w-3 h-3" /> Cumulative CGPA
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={cgpa}
                          onChange={(e) => setCgpa(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-hairline)] bg-[var(--color-surface-soft)] focus:outline-none focus:border-[var(--color-primary)] transition-all"
                          placeholder="e.g. 8.54"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Phone */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-[var(--color-mute)] flex items-center gap-1">
                          <Phone className="w-3 h-3" /> Phone Number
                        </label>
                        <input
                          type="text"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-[var(--color-hairline)] bg-[var(--color-surface-soft)] focus:outline-none focus:border-[var(--color-primary)] transition-all text-sm"
                          placeholder="+91 99999 88888"
                        />
                      </div>

                      {/* LinkedIn */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-[var(--color-mute)]">LinkedIn URL (opt)</label>
                        <input
                          type="text"
                          value={linkedin}
                          onChange={(e) => setLinkedin(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-[var(--color-hairline)] bg-[var(--color-surface-soft)] focus:outline-none focus:border-[var(--color-primary)] transition-all text-sm"
                          placeholder="https://linkedin.com/in/..."
                        />
                      </div>

                      {/* GitHub */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-[var(--color-mute)]">GitHub URL (opt)</label>
                        <input
                          type="text"
                          value={github}
                          onChange={(e) => setGithub(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-[var(--color-hairline)] bg-[var(--color-surface-soft)] focus:outline-none focus:border-[var(--color-primary)] transition-all text-sm"
                          placeholder="https://github.com/..."
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn-primary w-full h-12 mt-4 flex items-center justify-center gap-2"
                    >
                      <span>Verify & Complete Registration</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                </motion.div>
              )}

              {/* STEP 2: Completion Screen */}
              {step === 2 && (
                <motion.div
                  key="step-2"
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={stepVariants}
                  className="flex flex-col items-center text-center gap-6 py-6"
                >
                  <div className="w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center text-[var(--color-primary)] mb-2">
                    <CheckCircle className="w-12 h-12" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Welcome to ResumeFlow</h2>
                    <p className="type-body-sm text-[var(--color-mute)] max-w-[360px] mx-auto">
                      Your student profile has been synced with division filters. You are ready to start matching and tailoring applications.
                    </p>
                  </div>

                  <div className="w-full p-4 rounded-2xl bg-[var(--color-surface-soft)] border border-[var(--color-hairline-soft)] flex justify-between items-center text-left">
                    <div>
                      <h4 className="type-body-strong">Granted Balance
                    </h4>
                    <p className="type-caption-sm text-[var(--color-mute)]">10,000 credits = 20 tailored resumes</p>
                  </div>
                  <span className="text-3xl font-extrabold text-[var(--color-primary)]">10,000</span>
                  </div>

                  <button
                    onClick={handleEnterDashboard}
                    className="btn-primary w-full h-12 mt-4 flex items-center justify-center gap-2"
                  >
                    <span>Enter Placement Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-[var(--spacing-xl)] py-6 text-center text-xs text-[var(--color-ash)] border-t border-[var(--color-hairline-soft)] bg-white/40 backdrop-blur-md">
        © 2026 ResumeFlow. Designed with Awwwards Design Core Principles.
      </footer>
    </div>
  );
}
