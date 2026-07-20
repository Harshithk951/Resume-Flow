"use client";

// app/profile/page.tsx
//
// Master Profile Onboarding & Verification Gate
// Coordinates file upload, background OCR extraction, human validation form,
// and safe read/write state machine for returning users.
// Adheres strictly to Design.md warm cream themes and Bento layout.

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useAction, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  User,
  GraduationCap,
  Briefcase,
  Code,
  Sparkles,
  Award,
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  Check,
  AlertTriangle,
  Loader2,
  BookOpen,
  ShieldCheck,
  ClipboardCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FileUpload from "@/components/FileUpload";

type Section = "contact" | "education" | "experience" | "projects" | "skills" | "extras";

export default function ProfilePage() {
  const { isLoaded, isSignedIn } = useUser();
  const { isLoading, isAuthenticated } = useConvexAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const mode = searchParams.get("mode");

  const existingProfile = useQuery(
    api.profiles.getMyProfile,
    isAuthenticated ? {} : "skip"
  );

  // API Mutations and Actions
  const generateUploadUrl = useMutation(api.profiles.generateUploadUrl);
  const extractProfile = useAction(api.ai.extractResume.extractProfile);
  const createOrUpdateProfile = useMutation(api.profiles.createOrUpdateProfile);
  const updateExtractionStatus = useMutation(api.profiles.updateExtractionStatus);

  // Page States
  const [activeSection, setActiveSection] = useState<Section>("contact");
  const [isEditing, setIsEditing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [rawResumeStorageId, setRawResumeStorageId] = useState<string | undefined>(undefined);

  // Form State
  const [profile, setProfile] = useState<any>({
    personalInfo: { name: "", email: "", phone: "", linkedin: "", github: "", portfolio: "" },
    education: [],
    experience: [],
    projects: [],
    skills: { languages: [], frameworks: [], tools: [], databases: [], soft: [] },
    certifications: [],
    achievements: [],
  });

  // State Machine helper
  const [engineState, setEngineState] = useState<"IDLE" | "EXTRACTING" | "FAILED" | "VERIFYING" | "SAVING">("IDLE");

  // Synchronize Convex DB state and safe Edit Mode
  useEffect(() => {
    if (existingProfile === undefined) return;

    if (existingProfile) {
      if (existingProfile.extractionStatus === "extracting") {
        setEngineState("EXTRACTING");
      } else if (existingProfile.extractionStatus === "failed") {
        setEngineState("FAILED");
      } else if (existingProfile.extractionStatus === "success") {
        if (mode === "edit" || isEditing) {
          setEngineState("VERIFYING");
        } else {
          setEngineState("IDLE"); // Idle state will render SavedProfileView if profile exists
        }
      }
    } else {
      if (isProcessing) {
        setEngineState("EXTRACTING");
      } else if (localError) {
        setEngineState("FAILED");
      } else {
        setEngineState("IDLE");
      }
    }
  }, [existingProfile, isProcessing, localError, isEditing, mode]);

  // Load existing profile details into form state
  useEffect(() => {
    if (existingProfile && existingProfile.extractionStatus === "success") {
      setProfile({
        personalInfo: existingProfile.personalInfo || { name: "", email: "", phone: "", linkedin: "", github: "", portfolio: "" },
        education: existingProfile.education || [],
        experience: existingProfile.experience || [],
        projects: existingProfile.projects || [],
        skills: {
          languages: existingProfile.skills?.languages || [],
          frameworks: existingProfile.skills?.frameworks || [],
          tools: existingProfile.skills?.tools || [],
          databases: existingProfile.skills?.databases || [],
          soft: existingProfile.skills?.soft || [],
        },
        certifications: existingProfile.certifications || [],
        achievements: existingProfile.achievements || [],
      });
      if (existingProfile.rawResumeStorageId) {
        setRawResumeStorageId(existingProfile.rawResumeStorageId);
      }
    }
  }, [existingProfile]);

  // If user visits with ?mode=edit directly, force verification form active
  useEffect(() => {
    if (existingProfile && existingProfile.extractionStatus === "success" && mode === "edit") {
      setIsEditing(true);
    }
  }, [existingProfile, mode]);

  // File Accepted & AI Extraction Process
  const handleFileAccepted = async (file: File) => {
    if (isLoading || !isAuthenticated) {
      setLocalError("Please sign in before uploading your resume.");
      return;
    }
    setIsProcessing(true);
    setLocalError(null);
    try {
      // 1. Set db status to extracting
      await updateExtractionStatus({ status: "extracting" });

      // 2. Generate Convex storage upload URL
      const uploadUrl = await generateUploadUrl();

      // 3. Upload raw file binary to storage
      const uploadResponse = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload resume file to storage.");
      }

      const { storageId } = await uploadResponse.json();
      setRawResumeStorageId(storageId);

      // 4. Trigger server-side background action to parse file
      const extractedData = await extractProfile({
        storageId,
        fileSize: file.size,
      });

      // 5. Populate form and go to verification edit mode
      setProfile({
        personalInfo: extractedData.personalInfo || { name: "", email: "", phone: "", linkedin: "", github: "", portfolio: "" },
        education: extractedData.education || [],
        experience: extractedData.experience || [],
        projects: extractedData.projects || [],
        skills: {
          languages: extractedData.skills?.languages || [],
          frameworks: extractedData.skills?.frameworks || [],
          tools: extractedData.skills?.tools || [],
          databases: extractedData.skills?.databases || [],
          soft: extractedData.skills?.soft || [],
        },
        certifications: extractedData.certifications || [],
        achievements: extractedData.achievements || [],
      });
      setIsEditing(true);
      setEngineState("VERIFYING");
    } catch (err: any) {
      console.error("Ingestion failed:", err);
      setLocalError(err.message || "Failed to parse and extract resume information.");
      await updateExtractionStatus({ status: "failed" });
      setEngineState("FAILED");
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset FAILED state back to IDLE
  const handleCancelRetry = async () => {
    setLocalError(null);
    setIsProcessing(false);
    setIsEditing(false);
    await updateExtractionStatus({ status: "idle" });
    setEngineState("IDLE");
  };

  // Submit and Save Profile Mutation
  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await createOrUpdateProfile({
        personalInfo: {
          name: profile.personalInfo.name || "",
          email: profile.personalInfo.email || "",
          phone: profile.personalInfo.phone || "",
          linkedin: profile.personalInfo.linkedin || undefined,
          github: profile.personalInfo.github || undefined,
          portfolio: profile.personalInfo.portfolio || undefined,
        },
        education: (profile.education || []).map((edu: any) => ({
          institution: edu.institution || "",
          degree: edu.degree || "",
          gpa: edu.gpa || undefined,
          year: edu.year || "",
          relevantCourses: edu.relevantCourses || [],
        })),
        experience: (profile.experience || []).map((exp: any) => ({
          company: exp.company || "",
          role: exp.role || "",
          duration: exp.duration || "",
          bullets: exp.bullets || [],
          location: exp.location || undefined,
          technologies: exp.technologies || [],
        })),
        projects: (profile.projects || []).map((proj: any) => ({
          name: proj.name || "",
          description: proj.description || "",
          technologies: proj.technologies || [],
          link: proj.link || undefined,
          bullets: proj.bullets || [],
        })),
        skills: {
          languages: profile.skills.languages || [],
          frameworks: profile.skills.frameworks || [],
          tools: profile.skills.tools || [],
          databases: profile.skills.databases || [],
          soft: profile.skills.soft || [],
        },
        certifications: profile.certifications ? profile.certifications.map((cert: any) => ({
          name: cert.name || "",
          issuer: cert.issuer || "",
          year: cert.year || "",
        })) : undefined,
        achievements: profile.achievements ? profile.achievements.map((ach: any) => ({
          description: ach.description || "",
          year: ach.year || undefined,
        })) : undefined,
        rawResumeStorageId: rawResumeStorageId ? (rawResumeStorageId as any) : undefined,
      });

      setSaveSuccess(true);
      setIsEditing(false);
      router.push("/dashboard");
    } catch (err: any) {
      setLocalError(err.message || "Failed to save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Form Field Change Handlers
  const handlePersonalChange = (field: string, value: string) => {
    setProfile((prev: any) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value },
    }));
  };

  const handleSkillsChange = (category: string, value: string) => {
    setProfile((prev: any) => ({
      ...prev,
      skills: {
        ...prev.skills,
        [category]: value.split(",").map((s) => s.trim()).filter(Boolean),
      },
    }));
  };

  // List Item Actions
  const addEducation = () => {
    setProfile((prev: any) => ({
      ...prev,
      education: [...(prev.education || []), { institution: "", degree: "", gpa: "", year: "", relevantCourses: [] }],
    }));
  };

  const removeEducation = (index: number) => {
    setProfile((prev: any) => ({
      ...prev,
      education: prev.education.filter((_: any, i: number) => i !== index),
    }));
  };

  const addExperience = () => {
    setProfile((prev: any) => ({
      ...prev,
      experience: [...(prev.experience || []), { company: "", role: "", duration: "", bullets: [""], technologies: [] }],
    }));
  };

  const removeExperience = (index: number) => {
    setProfile((prev: any) => ({
      ...prev,
      experience: prev.experience.filter((_: any, i: number) => i !== index),
    }));
  };

  const addProject = () => {
    setProfile((prev: any) => ({
      ...prev,
      projects: [...(prev.projects || []), { name: "", description: "", technologies: [], link: "", bullets: [""] }],
    }));
  };

  const removeProject = (index: number) => {
    setProfile((prev: any) => ({
      ...prev,
      projects: prev.projects.filter((_: any, i: number) => i !== index),
    }));
  };

  const addCertification = () => {
    setProfile((prev: any) => ({
      ...prev,
      certifications: [...(prev.certifications || []), { name: "", issuer: "", year: "" }],
    }));
  };

  const removeCertification = (index: number) => {
    setProfile((prev: any) => ({
      ...prev,
      certifications: prev.certifications.filter((_: any, i: number) => i !== index),
    }));
  };

  const addAchievement = () => {
    setProfile((prev: any) => ({
      ...prev,
      achievements: [...(prev.achievements || []), { description: "", year: "" }],
    }));
  };

  const removeAchievement = (index: number) => {
    setProfile((prev: any) => ({
      ...prev,
      achievements: prev.achievements.filter((_: any, i: number) => i !== index),
    }));
  };

  const isConvexLoading = isSignedIn && !isAuthenticated;
  const isQueryLoading = isAuthenticated && existingProfile === undefined;

  // Global Page Loading Screens
  if (!isLoaded || isLoading || isQueryLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-surface-soft)]">
        <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
      </div>
    );
  }

  if (isConvexLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--color-surface-soft)] p-6">
        <Loader2 className="w-8 h-8 animate-spin text-rose-600 mb-4" />
        <div className="text-center max-w-md bg-[var(--color-canvas)] p-8 rounded-3xl border border-[var(--color-hairline-soft)] shadow-sm">
          <p className="text-md font-semibold text-[var(--color-ink-soft)] mb-2">Connecting to Realtime Database...</p>
          <p className="text-sm text-[var(--color-ash)]">
            If this takes more than a few seconds, verify that you have configured the <strong>"convex" JWT template</strong> in your Clerk Dashboard.
          </p>
        </div>
      </div>
    );
  }

  const showSavedView = existingProfile?.extractionStatus === "success" && !isEditing && mode !== "edit";

  return (
    <div className="min-h-full bg-[var(--color-surface-soft)] text-[var(--color-ink)] flex flex-col font-sans -m-6 md:-m-8">
      <main className="max-w-7xl mx-auto px-6 py-8 md:py-12 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 items-start">
          
          {/* Left Column: Stateful Engine (60% Width) */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            
            {/* IDLE State with Saved view fallback */}
            {engineState === "IDLE" && (
              <>
                {showSavedView ? (
                  // Saved Profile Viewer
                  <div className="bg-[var(--color-canvas)] rounded-3xl border border-[var(--color-hairline-soft)] p-8 shadow-sm flex flex-col gap-8">
                    <div className="flex justify-between items-start pb-6 border-b border-[var(--color-hairline-soft)]">
                      <div>
                        <h2 className="text-2xl font-bold text-[var(--color-ink-soft)]">{profile.personalInfo.name || "Master Profile"}</h2>
                        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-[var(--color-ash)] mt-2">
                          <span>{profile.personalInfo.email}</span>
                          {profile.personalInfo.phone && (
                            <>
                              <span>•</span>
                              <span>{profile.personalInfo.phone}</span>
                            </>
                          )}
                          {profile.personalInfo.linkedin && (
                            <>
                              <span>•</span>
                              <a href={`https://${profile.personalInfo.linkedin}`} target="_blank" rel="noreferrer" className="text-rose-600 hover:underline">
                                LinkedIn
                              </a>
                            </>
                          )}
                          {profile.personalInfo.github && (
                            <>
                              <span>•</span>
                              <a href={`https://${profile.personalInfo.github}`} target="_blank" rel="noreferrer" className="text-rose-600 hover:underline">
                                GitHub
                              </a>
                            </>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setIsEditing(true);
                          router.push("/profile?mode=edit");
                        }}
                        className="px-4 py-2 text-xs font-semibold rounded-xl bg-[var(--color-surface-card)] hover:bg-[var(--color-secondary-bg)] text-[var(--color-ink-soft)] transition-all active:scale-95"
                      >
                        Edit Profile
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {/* Left Block: Education & Skills */}
                      <div className="md:col-span-1 flex flex-col gap-6">
                        <div>
                          <h3 className="text-sm font-bold text-[var(--color-ink-soft)] mb-3 flex items-center gap-2">
                            <GraduationCap className="w-4 h-4 text-rose-500" /> Education
                          </h3>
                          <div className="flex flex-col gap-4">
                            {profile.education.map((edu: any, index: number) => (
                              <div key={index} className="text-xs">
                                <h4 className="font-semibold text-[var(--color-ink-soft)]">{edu.institution}</h4>
                                <p className="text-[var(--color-ash)] mt-0.5">{edu.degree}</p>
                                <p className="text-[var(--color-stone)] font-medium mt-0.5">
                                  {edu.year} {edu.gpa ? `| GPA: ${edu.gpa}` : ""}
                                </p>
                              </div>
                            ))}
                            {profile.education.length === 0 && (
                              <span className="text-xs text-[var(--color-stone)]">No education entries added.</span>
                            )}
                          </div>
                        </div>

                        <div>
                          <h3 className="text-sm font-bold text-[var(--color-ink-soft)] mb-3 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-rose-500" /> Skills
                          </h3>
                          <div className="flex flex-col gap-3">
                            {Object.entries(profile.skills).map(([key, value]: [string, any]) => {
                              if (!value || value.length === 0) return null;
                              return (
                                <div key={key} className="text-xs">
                                  <span className="font-semibold text-[var(--color-stone)] capitalize block mb-1">
                                    {key}
                                  </span>
                                  <div className="flex flex-wrap gap-1.5">
                                    {value.map((skill: string, i: number) => (
                                      <span
                                        key={i}
                                        className="bg-[var(--color-surface-soft)] border border-[var(--color-hairline-soft)] px-2 py-0.5 rounded-lg text-[var(--color-charcoal)] font-medium"
                                      >
                                        {skill}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Right Block: Experience & Projects */}
                      <div className="md:col-span-2 flex flex-col gap-6">
                        <div>
                          <h3 className="text-sm font-bold text-[var(--color-ink-soft)] mb-4 flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-rose-500" /> Experience
                          </h3>
                          <div className="flex flex-col gap-6 divide-y divide-[var(--color-hairline-soft)]">
                            {profile.experience.map((exp: any, index: number) => (
                              <div key={index} className="pt-4 first:pt-0 flex flex-col gap-1.5 text-xs">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="font-bold text-[var(--color-ink-soft)]">{exp.company}</h4>
                                    <p className="text-[var(--color-ash)]">{exp.role}</p>
                                  </div>
                                  <span className="text-[10px] text-[var(--color-stone)] font-semibold">{exp.duration}</span>
                                </div>
                                <ul className="list-disc pl-5 text-[var(--color-mute)] space-y-1 mt-1">
                                  {exp.bullets.map((b: string, i: number) => (
                                    <li key={i}>{b}</li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                            {profile.experience.length === 0 && (
                              <span className="text-xs text-[var(--color-stone)]">No work experience added.</span>
                            )}
                          </div>
                        </div>

                        <div>
                          <h3 className="text-sm font-bold text-[var(--color-ink-soft)] mb-4 flex items-center gap-2">
                            <Code className="w-4 h-4 text-rose-500" /> Projects
                          </h3>
                          <div className="flex flex-col gap-6 divide-y divide-[var(--color-hairline-soft)]">
                            {profile.projects.map((proj: any, index: number) => (
                              <div key={index} className="pt-4 first:pt-0 flex flex-col gap-1.5 text-xs">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="font-bold text-[var(--color-ink-soft)]">{proj.name}</h4>
                                    <p className="text-[var(--color-ash)]">{proj.description}</p>
                                  </div>
                                  {proj.link && (
                                    <a href={`https://${proj.link}`} target="_blank" rel="noreferrer" className="text-rose-600 hover:underline font-medium">
                                      Link
                                    </a>
                                  )}
                                </div>
                                <ul className="list-disc pl-5 text-[var(--color-mute)] space-y-1 mt-1">
                                  {proj.bullets.map((b: string, i: number) => (
                                    <li key={i}>{b}</li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                            {profile.projects.length === 0 && (
                              <span className="text-xs text-[var(--color-stone)]">No projects added.</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Overwrite Drag & Drop block */}
                    <div className="border-t border-[var(--color-hairline-soft)] pt-6 mt-4">
                      <h3 className="text-sm font-bold text-[var(--color-ink-soft)] mb-3">Re-upload & Replace Resume</h3>
                      <FileUpload onFileAccepted={handleFileAccepted} isProcessing={isProcessing} />
                    </div>
                  </div>
                ) : (
                  // Normal First-Time Onboarding drag-and-drop
                  <div className="bg-[var(--color-canvas)] rounded-3xl border border-[var(--color-hairline-soft)] p-8 shadow-sm">
                    <h2 className="text-xl font-bold text-[var(--color-ink-soft)] mb-2">Upload Master Resume</h2>
                    <p className="text-sm text-[var(--color-ash)] mb-6 leading-relaxed">
                      Upload your master resume in PDF or image format. Our AI will automatically
                      extract and organize your details into a structured profile. You will review and
                      verify the fields before saving.
                    </p>

                    <FileUpload onFileAccepted={handleFileAccepted} isProcessing={isProcessing} />

                    {localError && (
                      <div className="mt-4 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm flex gap-2">
                        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                        <div>
                          <span className="font-semibold">Error:</span> {localError}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* EXTRACTING State */}
            {engineState === "EXTRACTING" && (
              <div className="bg-[var(--color-canvas)] rounded-3xl border border-[var(--color-hairline-soft)] p-12 shadow-sm flex flex-col items-center justify-center text-center gap-6 min-h-[400px]">
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-24 h-24 rounded-full bg-rose-500/20 blur-xl animate-pulse" />
                  <Loader2 className="w-12 h-12 text-rose-600 animate-spin relative z-10" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--color-ink-soft)]">Processing Master Profile</h3>
                  <p className="text-sm text-[var(--color-ash)] mt-2 max-w-sm leading-relaxed">
                    Converting text streams and image screenshots into structural JSON layout...
                  </p>
                </div>
              </div>
            )}

            {/* FAILED State */}
            {engineState === "FAILED" && (
              <div className="bg-[var(--color-canvas)] rounded-3xl border border-[var(--color-hairline-soft)] p-8 shadow-sm flex flex-col gap-6">
                <div className="p-6 rounded-2xl bg-red-50 border border-red-100 flex gap-4 items-start">
                  <div className="p-3 bg-red-100 text-red-600 rounded-xl shrink-0">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-md font-bold text-red-800">Ingestion Pipeline Failed</h3>
                    <p className="text-sm text-red-700 mt-1 leading-relaxed">
                      {existingProfile?.pipelineError || localError || "Failed to parse and extract resume details."}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={handleCancelRetry}
                    className="px-6 py-3 rounded-2xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 transition-all flex items-center gap-2 justify-center shadow-md active:scale-95"
                  >
                    Cancel & Retry
                  </button>
                </div>
              </div>
            )}

            {/* VERIFYING State (The Form) */}
            {engineState === "VERIFYING" && (
              <div className="bg-[var(--color-canvas)] rounded-3xl border border-[var(--color-hairline-soft)] p-8 shadow-sm flex flex-col">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-[var(--color-hairline-soft)]">
                  <div>
                    <h2 className="text-xl font-bold text-[var(--color-ink-soft)]">Verify Profile Details</h2>
                    <p className="text-xs text-[var(--color-stone)] mt-0.5">Human verification checks are required before saving.</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      router.push("/profile");
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--color-hairline-soft)] bg-[var(--color-surface-soft)] hover:bg-[var(--color-surface-card)] text-[var(--color-mute)] text-xs font-semibold transition-all active:scale-95"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </button>
                </div>

                {/* Tab buttons */}
                <div className="flex flex-wrap gap-2 pb-4 border-b border-[var(--color-hairline-soft)] mb-6">
                  {[
                    { id: "contact", label: "Contact", icon: User },
                    { id: "education", label: "Education", icon: GraduationCap },
                    { id: "experience", label: "Experience", icon: Briefcase },
                    { id: "projects", label: "Projects", icon: Code },
                    { id: "skills", label: "Skills", icon: Sparkles },
                    { id: "extras", label: "Extras", icon: Award },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeSection === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveSection(tab.id as Section)}
                        className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl border transition-all ${
                          isActive
                            ? "bg-rose-50 border-rose-200 text-rose-700 shadow-sm"
                            : "bg-[var(--color-canvas)] border-[var(--color-hairline-soft)] text-[var(--color-mute)] hover:bg-[var(--color-surface-soft)]"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {/* Tab Contents */}
                <div className="min-h-[300px]">
                  
                  {/* CONTACT Tab */}
                  {activeSection === "contact" && (
                    <div className="flex flex-col gap-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col">
                          <label className="text-xs font-bold text-[var(--color-ash)] uppercase tracking-wider block mb-1.5">Full Name</label>
                          <input
                            type="text"
                            className="w-full px-4 py-3 bg-[var(--color-surface-soft)] border border-[var(--color-hairline)] rounded-xl text-[var(--color-ink-soft)] text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                            value={profile.personalInfo.name || ""}
                            onChange={(e) => handlePersonalChange("name", e.target.value)}
                            placeholder="John Doe"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-xs font-bold text-[var(--color-ash)] uppercase tracking-wider block mb-1.5">Email Address</label>
                          <input
                            type="email"
                            className="w-full px-4 py-3 bg-[var(--color-surface-soft)] border border-[var(--color-hairline)] rounded-xl text-[var(--color-ink-soft)] text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                            value={profile.personalInfo.email || ""}
                            onChange={(e) => handlePersonalChange("email", e.target.value)}
                            placeholder="john@example.com"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-xs font-bold text-[var(--color-ash)] uppercase tracking-wider block mb-1.5">Phone Number</label>
                          <input
                            type="text"
                            className="w-full px-4 py-3 bg-[var(--color-surface-soft)] border border-[var(--color-hairline)] rounded-xl text-[var(--color-ink-soft)] text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                            value={profile.personalInfo.phone || ""}
                            onChange={(e) => handlePersonalChange("phone", e.target.value)}
                            placeholder="+91 9876543210"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-xs font-bold text-[var(--color-ash)] uppercase tracking-wider block mb-1.5">LinkedIn Profile (Optional)</label>
                          <input
                            type="text"
                            className="w-full px-4 py-3 bg-[var(--color-surface-soft)] border border-[var(--color-hairline)] rounded-xl text-[var(--color-ink-soft)] text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                            value={profile.personalInfo.linkedin || ""}
                            onChange={(e) => handlePersonalChange("linkedin", e.target.value)}
                            placeholder="linkedin.com/in/johndoe"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-xs font-bold text-[var(--color-ash)] uppercase tracking-wider block mb-1.5">GitHub Profile (Optional)</label>
                          <input
                            type="text"
                            className="w-full px-4 py-3 bg-[var(--color-surface-soft)] border border-[var(--color-hairline)] rounded-xl text-[var(--color-ink-soft)] text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                            value={profile.personalInfo.github || ""}
                            onChange={(e) => handlePersonalChange("github", e.target.value)}
                            placeholder="github.com/johndoe"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-xs font-bold text-[var(--color-ash)] uppercase tracking-wider block mb-1.5">Portfolio Link (Optional)</label>
                          <input
                            type="text"
                            className="w-full px-4 py-3 bg-[var(--color-surface-soft)] border border-[var(--color-hairline)] rounded-xl text-[var(--color-ink-soft)] text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                            value={profile.personalInfo.portfolio || ""}
                            onChange={(e) => handlePersonalChange("portfolio", e.target.value)}
                            placeholder="johndoe.dev"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* EDUCATION Tab */}
                  {activeSection === "education" && (
                    <div className="flex flex-col gap-5">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-[var(--color-ash)] uppercase">Degree History</span>
                        <button
                          onClick={addEducation}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-100 bg-rose-50/50 hover:bg-rose-50 text-rose-700 text-xs font-semibold transition-all active:scale-95"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Education
                        </button>
                      </div>

                      <div className="flex flex-col gap-6 divide-y divide-[var(--color-hairline-soft)]">
                        {profile.education.map((edu: any, index: number) => (
                          <div key={index} className="pt-6 first:pt-0 flex flex-col gap-4">
                            <div className="flex justify-between items-center">
                              <h3 className="text-xs font-bold text-[var(--color-stone)]">Entry #{index + 1}</h3>
                              <button
                                onClick={() => removeEducation(index)}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-red-50 text-red-600 hover:text-red-700 text-xs font-semibold transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Remove
                              </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="flex flex-col">
                                <label className="text-xs font-bold text-[var(--color-ash)] uppercase tracking-wider block mb-1.5">Institution</label>
                                <input
                                  type="text"
                                  className="w-full px-4 py-3 bg-[var(--color-surface-soft)] border border-[var(--color-hairline)] rounded-xl text-[var(--color-ink-soft)] text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                                  value={edu.institution || ""}
                                  onChange={(e) => {
                                    const updated = [...profile.education];
                                    updated[index].institution = e.target.value;
                                    setProfile({ ...profile, education: updated });
                                  }}
                                  placeholder="Stanford University"
                                />
                              </div>
                              <div className="flex flex-col">
                                <label className="text-xs font-bold text-[var(--color-ash)] uppercase tracking-wider block mb-1.5">Degree / Branch</label>
                                <input
                                  type="text"
                                  className="w-full px-4 py-3 bg-[var(--color-surface-soft)] border border-[var(--color-hairline)] rounded-xl text-[var(--color-ink-soft)] text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                                  value={edu.degree || ""}
                                  onChange={(e) => {
                                    const updated = [...profile.education];
                                    updated[index].degree = e.target.value;
                                    setProfile({ ...profile, education: updated });
                                  }}
                                  placeholder="B.Tech in Computer Science"
                                />
                              </div>
                              <div className="flex flex-col">
                                <label className="text-xs font-bold text-[var(--color-ash)] uppercase tracking-wider block mb-1.5">GPA / CGPA (Optional)</label>
                                <input
                                  type="text"
                                  className="w-full px-4 py-3 bg-[var(--color-surface-soft)] border border-[var(--color-hairline)] rounded-xl text-[var(--color-ink-soft)] text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                                  value={edu.gpa || ""}
                                  onChange={(e) => {
                                    const updated = [...profile.education];
                                    updated[index].gpa = e.target.value;
                                    setProfile({ ...profile, education: updated });
                                  }}
                                  placeholder="3.9/4.0 or 9.5 CGPA"
                                />
                              </div>
                              <div className="flex flex-col">
                                <label className="text-xs font-bold text-[var(--color-ash)] uppercase tracking-wider block mb-1.5">Graduation Year</label>
                                <input
                                  type="text"
                                  className="w-full px-4 py-3 bg-[var(--color-surface-soft)] border border-[var(--color-hairline)] rounded-xl text-[var(--color-ink-soft)] text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                                  value={edu.year || ""}
                                  onChange={(e) => {
                                    const updated = [...profile.education];
                                    updated[index].year = e.target.value;
                                    setProfile({ ...profile, education: updated });
                                  }}
                                  placeholder="2026"
                                />
                              </div>
                            </div>
                          </div>
                        ))}

                        {profile.education.length === 0 && (
                          <div className="text-center py-8 text-[var(--color-stone)] text-sm">
                            No education records added yet. Click Add to insert one.
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* EXPERIENCE Tab */}
                  {activeSection === "experience" && (
                    <div className="flex flex-col gap-5">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-[var(--color-ash)] uppercase">Employment Timeline</span>
                        <button
                          onClick={addExperience}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-100 bg-rose-50/50 hover:bg-rose-50 text-rose-700 text-xs font-semibold transition-all active:scale-95"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Experience
                        </button>
                      </div>

                      <div className="flex flex-col gap-8 divide-y divide-[var(--color-hairline-soft)]">
                        {profile.experience.map((exp: any, index: number) => (
                          <div key={index} className="pt-6 first:pt-0 flex flex-col gap-4">
                            <div className="flex justify-between items-center">
                              <h3 className="text-xs font-bold text-[var(--color-stone)]">Job Entry #{index + 1}</h3>
                              <button
                                onClick={() => removeExperience(index)}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-red-50 text-red-600 hover:text-red-700 text-xs font-semibold transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Remove
                              </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="flex flex-col">
                                <label className="text-xs font-bold text-[var(--color-ash)] uppercase tracking-wider block mb-1.5">Company</label>
                                <input
                                  type="text"
                                  className="w-full px-4 py-3 bg-[var(--color-surface-soft)] border border-[var(--color-hairline)] rounded-xl text-[var(--color-ink-soft)] text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                                  value={exp.company || ""}
                                  onChange={(e) => {
                                    const updated = [...profile.experience];
                                    updated[index].company = e.target.value;
                                    setProfile({ ...profile, experience: updated });
                                  }}
                                  placeholder="Google"
                                />
                              </div>
                              <div className="flex flex-col">
                                <label className="text-xs font-bold text-[var(--color-ash)] uppercase tracking-wider block mb-1.5">Role Title</label>
                                <input
                                  type="text"
                                  className="w-full px-4 py-3 bg-[var(--color-surface-soft)] border border-[var(--color-hairline)] rounded-xl text-[var(--color-ink-soft)] text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                                  value={exp.role || ""}
                                  onChange={(e) => {
                                    const updated = [...profile.experience];
                                    updated[index].role = e.target.value;
                                    setProfile({ ...profile, experience: updated });
                                  }}
                                  placeholder="Software Engineer Intern"
                                />
                              </div>
                              <div className="flex flex-col">
                                <label className="text-xs font-bold text-[var(--color-ash)] uppercase tracking-wider block mb-1.5">Duration</label>
                                <input
                                  type="text"
                                  className="w-full px-4 py-3 bg-[var(--color-surface-soft)] border border-[var(--color-hairline)] rounded-xl text-[var(--color-ink-soft)] text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                                  value={exp.duration || ""}
                                  onChange={(e) => {
                                    const updated = [...profile.experience];
                                    updated[index].duration = e.target.value;
                                    setProfile({ ...profile, experience: updated });
                                  }}
                                  placeholder="May 2024 - August 2024"
                                />
                              </div>
                            </div>

                            <div className="flex flex-col">
                              <label className="text-xs font-bold text-[var(--color-ash)] uppercase tracking-wider block mb-1.5">Technologies Used (comma separated)</label>
                              <input
                                type="text"
                                className="w-full px-4 py-3 bg-[var(--color-surface-soft)] border border-[var(--color-hairline)] rounded-xl text-[var(--color-ink-soft)] text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                                value={exp.technologies ? exp.technologies.join(", ") : ""}
                                onChange={(e) => {
                                    const updated = [...profile.experience];
                                    updated[index].technologies = e.target.value.split(",").map((t) => t.trim()).filter(Boolean);
                                    setProfile({ ...profile, experience: updated });
                                }}
                                placeholder="React, Golang, Docker"
                              />
                            </div>

                            {/* Bullets List */}
                            <div className="flex flex-col gap-3">
                              <div className="flex justify-between items-center">
                                <label className="text-xs font-bold text-[var(--color-ash)] uppercase tracking-wider block">Job Bullet Points</label>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = [...profile.experience];
                                    updated[index].bullets = [...(updated[index].bullets || []), ""];
                                    setProfile({ ...profile, experience: updated });
                                  }}
                                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                                >
                                  <Plus className="w-3.5 h-3.5" /> Add Bullet
                                </button>
                              </div>

                              <div className="flex flex-col gap-2">
                                {(exp.bullets || []).map((bullet: string, bIndex: number) => (
                                  <div key={bIndex} className="flex gap-2">
                                    <input
                                      type="text"
                                      className="flex-1 px-4 py-2.5 bg-[var(--color-surface-soft)] border border-[var(--color-hairline)] rounded-xl text-[var(--color-ink-soft)] text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                                      value={bullet}
                                      onChange={(e) => {
                                        const updated = [...profile.experience];
                                        updated[index].bullets[bIndex] = e.target.value;
                                        setProfile({ ...profile, experience: updated });
                                      }}
                                      placeholder="Architected robust distributed APIs reducing latency by 12%..."
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updated = [...profile.experience];
                                        updated[index].bullets = updated[index].bullets.filter((_: any, idx: number) => idx !== bIndex);
                                        setProfile({ ...profile, experience: updated });
                                      }}
                                      className="p-2 text-red-500 hover:bg-red-50 rounded-xl shrink-0 transition-colors"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}

                        {profile.experience.length === 0 && (
                          <div className="text-center py-8 text-[var(--color-stone)] text-sm">
                            No experience entries added. Click Add to insert one.
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* PROJECTS Tab */}
                  {activeSection === "projects" && (
                    <div className="flex flex-col gap-5">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-[var(--color-ash)] uppercase">Independent Projects</span>
                        <button
                          onClick={addProject}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-100 bg-rose-50/50 hover:bg-rose-50 text-rose-700 text-xs font-semibold transition-all active:scale-95"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Project
                        </button>
                      </div>

                      <div className="flex flex-col gap-8 divide-y divide-[var(--color-hairline-soft)]">
                        {profile.projects.map((proj: any, index: number) => (
                          <div key={index} className="pt-6 first:pt-0 flex flex-col gap-4">
                            <div className="flex justify-between items-center">
                              <h3 className="text-xs font-bold text-[var(--color-stone)]">Project #{index + 1}</h3>
                              <button
                                onClick={() => removeProject(index)}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-red-50 text-red-600 hover:text-red-700 text-xs font-semibold transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Remove
                              </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="flex flex-col">
                                <label className="text-xs font-bold text-[var(--color-ash)] uppercase tracking-wider block mb-1.5">Project Name</label>
                                <input
                                  type="text"
                                  className="w-full px-4 py-3 bg-[var(--color-surface-soft)] border border-[var(--color-hairline)] rounded-xl text-[var(--color-ink-soft)] text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                                  value={proj.name || ""}
                                  onChange={(e) => {
                                    const updated = [...profile.projects];
                                    updated[index].name = e.target.value;
                                    setProfile({ ...profile, projects: updated });
                                  }}
                                  placeholder="ResumeFlow Parser"
                                />
                              </div>
                              <div className="flex flex-col">
                                <label className="text-xs font-bold text-[var(--color-ash)] uppercase tracking-wider block mb-1.5">Project Link (Optional)</label>
                                <input
                                  type="text"
                                  className="w-full px-4 py-3 bg-[var(--color-surface-soft)] border border-[var(--color-hairline)] rounded-xl text-[var(--color-ink-soft)] text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                                  value={proj.link || ""}
                                  onChange={(e) => {
                                    const updated = [...profile.projects];
                                    updated[index].link = e.target.value;
                                    setProfile({ ...profile, projects: updated });
                                  }}
                                  placeholder="github.com/user/project"
                                />
                              </div>
                            </div>

                            <div className="flex flex-col">
                              <label className="text-xs font-bold text-[var(--color-ash)] uppercase tracking-wider block mb-1.5">Short Description</label>
                              <input
                                type="text"
                                className="w-full px-4 py-3 bg-[var(--color-surface-soft)] border border-[var(--color-hairline)] rounded-xl text-[var(--color-ink-soft)] text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                                value={proj.description || ""}
                                onChange={(e) => {
                                  const updated = [...profile.projects];
                                  updated[index].description = e.target.value;
                                  setProfile({ ...profile, projects: updated });
                                }}
                                placeholder="Resume validation compiler utilizing Next.js..."
                              />
                            </div>

                            <div className="flex flex-col">
                              <label className="text-xs font-bold text-[var(--color-ash)] uppercase tracking-wider block mb-1.5">Technologies Used (comma separated)</label>
                              <input
                                type="text"
                                className="w-full px-4 py-3 bg-[var(--color-surface-soft)] border border-[var(--color-hairline)] rounded-xl text-[var(--color-ink-soft)] text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                                value={proj.technologies ? proj.technologies.join(", ") : ""}
                                onChange={(e) => {
                                  const updated = [...profile.projects];
                                  updated[index].technologies = e.target.value.split(",").map((t) => t.trim()).filter(Boolean);
                                  setProfile({ ...profile, projects: updated });
                                }}
                                placeholder="Next.js, Python, SQLite"
                              />
                            </div>

                            <div className="flex flex-col gap-3">
                              <div className="flex justify-between items-center">
                                <label className="text-xs font-bold text-[var(--color-ash)] uppercase tracking-wider block">Project Details / Bullets</label>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = [...profile.projects];
                                    updated[index].bullets = [...(updated[index].bullets || []), ""];
                                    setProfile({ ...profile, projects: updated });
                                  }}
                                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                                >
                                  <Plus className="w-3.5 h-3.5" /> Add Bullet
                                </button>
                              </div>

                              <div className="flex flex-col gap-2">
                                {(proj.bullets || []).map((bullet: string, bIndex: number) => (
                                  <div key={bIndex} className="flex gap-2">
                                    <input
                                      type="text"
                                      className="flex-1 px-4 py-2.5 bg-[var(--color-surface-soft)] border border-[var(--color-hairline)] rounded-xl text-[var(--color-ink-soft)] text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                                      value={bullet}
                                      onChange={(e) => {
                                        const updated = [...profile.projects];
                                        updated[index].bullets[bIndex] = e.target.value;
                                        setProfile({ ...profile, projects: updated });
                                      }}
                                      placeholder="Deployed custom serverless pipelines on GCP scaling to 1k active requests..."
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updated = [...profile.projects];
                                        updated[index].bullets = updated[index].bullets.filter((_: any, idx: number) => idx !== bIndex);
                                        setProfile({ ...profile, projects: updated });
                                      }}
                                      className="p-2 text-red-500 hover:bg-red-50 rounded-xl shrink-0 transition-colors"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}

                        {profile.projects.length === 0 && (
                          <div className="text-center py-8 text-[var(--color-stone)] text-sm">
                            No project entries added. Click Add to insert one.
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* SKILLS Tab */}
                  {activeSection === "skills" && (
                    <div className="flex flex-col gap-5">
                      <span className="text-xs font-bold text-[var(--color-ash)] uppercase block">Skills Matrix (comma-separated values)</span>
                      
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col">
                          <label className="text-xs font-bold text-[var(--color-ash)] uppercase tracking-wider block mb-1.5">Languages</label>
                          <input
                            type="text"
                            className="w-full px-4 py-3 bg-[var(--color-surface-soft)] border border-[var(--color-hairline)] rounded-xl text-[var(--color-ink-soft)] text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                            value={profile.skills.languages ? profile.skills.languages.join(", ") : ""}
                            onChange={(e) => handleSkillsChange("languages", e.target.value)}
                            placeholder="C++, Python, JavaScript, TypeScript"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-xs font-bold text-[var(--color-ash)] uppercase tracking-wider block mb-1.5">Frameworks & Libraries</label>
                          <input
                            type="text"
                            className="w-full px-4 py-3 bg-[var(--color-surface-soft)] border border-[var(--color-hairline)] rounded-xl text-[var(--color-ink-soft)] text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                            value={profile.skills.frameworks ? profile.skills.frameworks.join(", ") : ""}
                            onChange={(e) => handleSkillsChange("frameworks", e.target.value)}
                            placeholder="React, Next.js, PyTorch, Node.js"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-xs font-bold text-[var(--color-ash)] uppercase tracking-wider block mb-1.5">Tools & Clouds</label>
                          <input
                            type="text"
                            className="w-full px-4 py-3 bg-[var(--color-surface-soft)] border border-[var(--color-hairline)] rounded-xl text-[var(--color-ink-soft)] text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                            value={profile.skills.tools ? profile.skills.tools.join(", ") : ""}
                            onChange={(e) => handleSkillsChange("tools", e.target.value)}
                            placeholder="Git, Docker, Kubernetes, AWS"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-xs font-bold text-[var(--color-ash)] uppercase tracking-wider block mb-1.5">Databases & Cache (Optional)</label>
                          <input
                            type="text"
                            className="w-full px-4 py-3 bg-[var(--color-surface-soft)] border border-[var(--color-hairline)] rounded-xl text-[var(--color-ink-soft)] text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                            value={profile.skills.databases ? profile.skills.databases.join(", ") : ""}
                            onChange={(e) => handleSkillsChange("databases", e.target.value)}
                            placeholder="PostgreSQL, MongoDB, Redis"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-xs font-bold text-[var(--color-ash)] uppercase tracking-wider block mb-1.5">Soft Skills / Domains (Optional)</label>
                          <input
                            type="text"
                            className="w-full px-4 py-3 bg-[var(--color-surface-soft)] border border-[var(--color-hairline)] rounded-xl text-[var(--color-ink-soft)] text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                            value={profile.skills.soft ? profile.skills.soft.join(", ") : ""}
                            onChange={(e) => handleSkillsChange("soft", e.target.value)}
                            placeholder="System Design, Agile, Communication"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* EXTRAS Tab (Certifications & Achievements) */}
                  {activeSection === "extras" && (
                    <div className="flex flex-col gap-6">
                      
                      {/* Certifications Block */}
                      <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-[var(--color-ash)] uppercase">Certifications</span>
                          <button
                            onClick={addCertification}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-100 bg-rose-50/50 hover:bg-rose-50 text-rose-700 text-xs font-semibold transition-all active:scale-95"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add Cert
                          </button>
                        </div>

                        <div className="flex flex-col gap-4 divide-y divide-[var(--color-hairline-soft)]">
                          {(profile.certifications || []).map((cert: any, index: number) => (
                            <div key={index} className="pt-4 first:pt-0 grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="flex flex-col">
                                <label className="text-xs font-bold text-[var(--color-ash)] uppercase tracking-wider block mb-1.5">Name</label>
                                <input
                                  type="text"
                                  className="w-full px-4 py-3 bg-[var(--color-surface-soft)] border border-[var(--color-hairline)] rounded-xl text-[var(--color-ink-soft)] text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                                  value={cert.name || ""}
                                  onChange={(e) => {
                                    const updated = [...profile.certifications];
                                    updated[index].name = e.target.value;
                                    setProfile({ ...profile, certifications: updated });
                                  }}
                                  placeholder="AWS Certified Solutions Architect"
                                />
                              </div>
                              <div className="flex flex-col">
                                <label className="text-xs font-bold text-[var(--color-ash)] uppercase tracking-wider block mb-1.5">Issuer</label>
                                <input
                                  type="text"
                                  className="w-full px-4 py-3 bg-[var(--color-surface-soft)] border border-[var(--color-hairline)] rounded-xl text-[var(--color-ink-soft)] text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                                  value={cert.issuer || ""}
                                  onChange={(e) => {
                                    const updated = [...profile.certifications];
                                    updated[index].issuer = e.target.value;
                                    setProfile({ ...profile, certifications: updated });
                                  }}
                                  placeholder="Amazon Web Services"
                                />
                              </div>
                              <div className="flex flex-col">
                                <div className="flex justify-between items-center mb-1.5">
                                  <label className="text-xs font-bold text-[var(--color-ash)] uppercase tracking-wider block">Year</label>
                                  <button
                                    onClick={() => removeCertification(index)}
                                    className="text-red-500 hover:text-red-600 text-xs font-semibold"
                                  >
                                    Remove
                                  </button>
                                </div>
                                <input
                                  type="text"
                                  className="w-full px-4 py-3 bg-[var(--color-surface-soft)] border border-[var(--color-hairline)] rounded-xl text-[var(--color-ink-soft)] text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                                  value={cert.year || ""}
                                  onChange={(e) => {
                                    const updated = [...profile.certifications];
                                    updated[index].year = e.target.value;
                                    setProfile({ ...profile, certifications: updated });
                                  }}
                                  placeholder="2024"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Achievements Block */}
                      <div className="flex flex-col gap-4 border-t border-[var(--color-hairline-soft)] pt-6 mt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-[var(--color-ash)] uppercase">Achievements & Honors</span>
                          <button
                            onClick={addAchievement}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-100 bg-rose-50/50 hover:bg-rose-50 text-rose-700 text-xs font-semibold transition-all active:scale-95"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add Achievement
                          </button>
                        </div>

                        <div className="flex flex-col gap-4 divide-y divide-[var(--color-hairline-soft)]">
                          {(profile.achievements || []).map((ach: any, index: number) => (
                            <div key={index} className="pt-4 first:pt-0 grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="md:col-span-2 flex flex-col">
                                <label className="text-xs font-bold text-[var(--color-ash)] uppercase tracking-wider block mb-1.5">Description</label>
                                <input
                                  type="text"
                                  className="w-full px-4 py-3 bg-[var(--color-surface-soft)] border border-[var(--color-hairline)] rounded-xl text-[var(--color-ink-soft)] text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                                  value={ach.description || ""}
                                  onChange={(e) => {
                                    const updated = [...profile.achievements];
                                    updated[index].description = e.target.value;
                                    setProfile({ ...profile, achievements: updated });
                                  }}
                                  placeholder="Ranked top 1% in worldwide competitive coding platforms..."
                                />
                              </div>
                              <div className="flex flex-col">
                                <div className="flex justify-between items-center mb-1.5">
                                  <label className="text-xs font-bold text-[var(--color-ash)] uppercase tracking-wider block">Year (Optional)</label>
                                  <button
                                    onClick={() => removeAchievement(index)}
                                    className="text-red-500 hover:text-red-600 text-xs font-semibold"
                                  >
                                    Remove
                                  </button>
                                </div>
                                <input
                                  type="text"
                                  className="w-full px-4 py-3 bg-[var(--color-surface-soft)] border border-[var(--color-hairline)] rounded-xl text-[var(--color-ink-soft)] text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                                  value={ach.year || ""}
                                  onChange={(e) => {
                                    const updated = [...profile.achievements];
                                    updated[index].year = e.target.value;
                                    setProfile({ ...profile, achievements: updated });
                                  }}
                                  placeholder="2023"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Error display when saving fails */}
                {localError && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-xs">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{localError}</span>
                  </div>
                )}

                {/* Confirm and Save button */}
                <div className="border-t border-[var(--color-hairline-soft)] pt-6 mt-8 flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      router.push("/profile");
                    }}
                    className="px-5 py-2.5 text-xs font-semibold rounded-xl border border-[var(--color-hairline)] text-[var(--color-mute)] hover:bg-[var(--color-surface-soft)] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="px-6 py-2.5 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50 active:scale-95"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" /> Confirm & Save Profile
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Glassmorphic Education & Engine info card (40% Width) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-white/85 backdrop-blur-md border border-[var(--color-hairline-soft)] rounded-3xl p-6 shadow-sm flex flex-col gap-6 sticky top-24">
              <h3 className="text-lg font-bold text-[var(--color-ink-soft)] tracking-tight">AI Ingestion Details</h3>
              
              <div className="flex flex-col gap-6">
                <div className="flex gap-4 items-start">
                  <div className="p-2.5 bg-rose-50 text-rose-600 rounded-2xl shrink-0">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[var(--color-ink-soft)]">1. Deep Multimodal Ingestion</h4>
                    <p className="text-xs text-[var(--color-ash)] mt-1 leading-relaxed">
                      Our parsing pipeline processes PDF documents, Word files, and image screenshots, transforming complex formatting grids and text streams into structured, machine-readable JSON data using NVIDIA Qwen 3.5 NIM.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="p-2.5 bg-rose-50 text-rose-600 rounded-2xl shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[var(--color-ink-soft)]">2. Client-Side PII Masking</h4>
                    <p className="text-xs text-[var(--color-ash)] mt-1 leading-relaxed">
                      Security is built into our core. Contact details are automatically masked server-side using secure hashes before transferring documents to external AI pipelines, keeping your PII fully protected.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="p-2.5 bg-rose-50 text-rose-600 rounded-2xl shrink-0">
                    <ClipboardCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[var(--color-ink-soft)]">3. Mandatory Human Verification</h4>
                    <p className="text-xs text-[var(--color-ash)] mt-1 leading-relaxed">
                      AI parsing is highly accurate but not infallible. You must review the populated fields in the Tabbed verification form to ensure that formatting, names, and metrics are correct before finalized database writes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}
