"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
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
  Loader2,
  CheckCircle,
  FileText,
  Palette,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { exportToHtml } from "@/lib/html/exporter";
import { LiveSandboxPreview } from "@/components/LiveSandboxPreview";
import TemplateSelectTab from "./TemplateSelectTab";

type MainMode = "edit" | "customize";
type Section = "contact" | "education" | "experience" | "projects" | "skills" | "extras";

export default function TemplateBrowser() {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();

  const myProfile = useQuery(api.profiles.getMyProfile, isAuthenticated ? {} : "skip");
  const createOrUpdateProfile = useMutation(api.profiles.createOrUpdateProfile);

  const [mainMode, setMainMode] = useState<MainMode>("customize");
  const [activeSection, setActiveSection] = useState<Section>("contact");
  const [activeTemplate, setActiveTemplate] = useState<string>("ats_strict");

  const searchParams = useSearchParams();

  useEffect(() => {
    const templateParam = searchParams.get("template");
    if (
      templateParam &&
      ["ats_strict", "modern_professional", "modern_executive", "tech_innovator"].includes(
        templateParam
      )
    ) {
      setActiveTemplate(templateParam);
    }
  }, [searchParams]);

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Local state for editing form
  const [profile, setProfile] = useState<any>({
    personalInfo: { name: "", email: "", phone: "", linkedin: "", github: "", portfolio: "" },
    summary: "",
    education: [],
    experience: [],
    projects: [],
    skills: { languages: [], frameworks: [], tools: [], databases: [], soft: [] },
    certifications: [],
    achievements: [],
  });

  // Sync profile from Convex once loaded
  useEffect(() => {
    if (myProfile) {
      setProfile({
        personalInfo: myProfile.personalInfo || { name: "", email: "", phone: "", linkedin: "", github: "", portfolio: "" },
        summary: (myProfile as any).summary || "",
        education: myProfile.education || [],
        experience: myProfile.experience || [],
        projects: myProfile.projects || [],
        skills: {
          languages: myProfile.skills?.languages || [],
          frameworks: myProfile.skills?.frameworks || [],
          tools: myProfile.skills?.tools || [],
          databases: myProfile.skills?.databases || [],
          soft: myProfile.skills?.soft || [],
        },
        certifications: myProfile.certifications || [],
        achievements: myProfile.achievements || [],
      });
    }
  }, [myProfile]);

  // Compute live compiled HTML dynamically on form changes
  const compiledHtml = useMemo(() => {
    try {
      return exportToHtml(profile, activeTemplate, "compact");
    } catch (err) {
      console.error("Failed to compile HTML preview:", err);
      return "<h1>Preview compilation failed</h1>";
    }
  }, [profile, activeTemplate]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      await createOrUpdateProfile({
        personalInfo: profile.personalInfo,
        education: profile.education.map((edu: any) => ({
          institution: edu.institution || "",
          degree: edu.degree || "",
          gpa: edu.gpa || "",
          year: edu.year || "",
          relevantCourses: edu.relevantCourses || [],
        })),
        experience: profile.experience.map((exp: any) => ({
          company: exp.company || "",
          role: exp.role || "",
          duration: exp.duration || "",
          bullets: exp.bullets || [],
          location: exp.location || "",
          technologies: exp.technologies || [],
        })),
        projects: profile.projects.map((proj: any) => ({
          name: proj.name || "",
          description: proj.description || "",
          technologies: proj.technologies || [],
          link: proj.link || "",
          bullets: proj.bullets || [],
        })),
        skills: profile.skills,
        certifications: profile.certifications,
        achievements: profile.achievements,
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error(err);
      setSaveError(err.message || "Failed to save profile changes.");
    } finally {
      setIsSaving(false);
    }
  };

  // State manipulation handlers
  const updatePersonalInfo = (field: string, value: string) => {
    setProfile((prev: any) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value },
    }));
  };

  const addEducation = () => {
    setProfile((prev: any) => ({
      ...prev,
      education: [...prev.education, { institution: "", degree: "", gpa: "", year: "", relevantCourses: [] }],
    }));
  };

  const updateEducation = (index: number, field: string, value: any) => {
    setProfile((prev: any) => {
      const copy = [...prev.education];
      copy[index] = { ...copy[index], [field]: value };
      return { ...prev, education: copy };
    });
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
      experience: [...prev.experience, { company: "", role: "", duration: "", bullets: [""], location: "", technologies: [] }],
    }));
  };

  const updateExperience = (index: number, field: string, value: any) => {
    setProfile((prev: any) => {
      const copy = [...prev.experience];
      copy[index] = { ...copy[index], [field]: value };
      return { ...prev, experience: copy };
    });
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
      projects: [...prev.projects, { name: "", description: "", technologies: [], link: "", bullets: [""] }],
    }));
  };

  const updateProject = (index: number, field: string, value: any) => {
    setProfile((prev: any) => {
      const copy = [...prev.projects];
      copy[index] = { ...copy[index], [field]: value };
      return { ...prev, projects: copy };
    });
  };

  const removeProject = (index: number) => {
    setProfile((prev: any) => ({
      ...prev,
      projects: prev.projects.filter((_: any, i: number) => i !== index),
    }));
  };

  const updateSkillsList = (listKey: string, value: string) => {
    const list = value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    setProfile((prev: any) => ({
      ...prev,
      skills: { ...prev.skills, [listKey]: list },
    }));
  };

  const addCertification = () => {
    setProfile((prev: any) => ({
      ...prev,
      certifications: [...(prev.certifications || []), { name: "", issuer: "", year: "" }],
    }));
  };

  const updateCertification = (index: number, field: string, value: string) => {
    setProfile((prev: any) => {
      const copy = [...(prev.certifications || [])];
      copy[index] = { ...copy[index], [field]: value };
      return { ...prev, certifications: copy };
    });
  };

  const removeCertification = (index: number) => {
    setProfile((prev: any) => ({
      ...prev,
      certifications: prev.certifications.filter((_: any, i: number) => i !== index),
    }));
  };

  if (authLoading || (isAuthenticated && myProfile === undefined)) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[var(--color-canvas)] min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col bg-[var(--color-surface-soft)] -m-6 md:-m-8">
      {/* Header Pill Selector */}
      <header className="z-20 flex h-14 shrink-0 items-center justify-center border-b border-[var(--color-hairline)] bg-[var(--color-canvas)] px-4 md:px-6 shadow-sm">
        <div className="flex rounded-xl border border-[var(--color-hairline)]/60 bg-[var(--color-surface-soft)] p-0.5">
          <button
            type="button"
            onClick={() => setMainMode("customize")}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${
              mainMode === "customize"
                ? "bg-[var(--color-canvas)] text-[var(--color-ink)] shadow-sm border border-[var(--color-hairline)]/35"
                : "text-[var(--color-ash)] hover:text-[var(--color-charcoal)]"
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            Customize Design
          </button>
          <button
            type="button"
            onClick={() => setMainMode("edit")}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${
              mainMode === "edit"
                ? "bg-[var(--color-canvas)] text-[var(--color-ink)] shadow-sm border border-[var(--color-hairline)]/35"
                : "text-[var(--color-ash)] hover:text-[var(--color-charcoal)]"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Edit Content
          </button>
        </div>
      </header>

      {/* Main Sandbox Workspace */}
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row overflow-hidden">
        {/* SIDEBAR EDIT PANEL */}
        <aside className="flex w-full shrink-0 flex-col border-b border-[var(--color-hairline)] bg-[var(--color-canvas)] lg:w-[380px] lg:border-b-0 lg:border-r xl:w-[420px] h-full overflow-hidden">
          
          {/* Sub-navigation for Editing Form Sections */}
          {mainMode === "edit" && (
            <div className="flex gap-1 border-b border-[var(--color-hairline-soft)] px-4 pt-3 overflow-x-auto scrollbar-none shrink-0">
              {([
                { id: "contact", label: "Basics" },
                { id: "education", label: "Education" },
                { id: "experience", label: "Experience" },
                { id: "projects", label: "Projects" },
                { id: "skills", label: "Skills" },
                { id: "extras", label: "Certs" },
              ] as const).map((sec) => {
                const active = activeSection === sec.id;
                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => setActiveSection(sec.id)}
                    className={`border-b-2 px-2 pb-2.5 text-xs font-bold transition-colors whitespace-nowrap ${
                      active
                        ? "border-rose-500 text-[var(--color-ink)]"
                        : "border-transparent text-[var(--color-ash)] hover:text-[var(--color-charcoal)]"
                    }`}
                  >
                    {sec.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Sidebar scrollable form content */}
          <div className="min-h-0 flex-1 overflow-y-auto p-5 scrollbar-thin">
            {mainMode === "customize" ? (
              <TemplateSelectTab
                selectedTemplate={activeTemplate}
                onSelectTemplate={setActiveTemplate}
              />
            ) : (
              <AnimatePresence mode="wait">
                {/* BASICS SECTION */}
                {activeSection === "contact" && (
                  <motion.div
                    key="contact"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <h3 className="text-xs font-bold text-[var(--color-ink-soft)] uppercase tracking-wider mb-2">Personal Information</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-[var(--color-ash)]">Full Name</label>
                        <input
                          type="text"
                          value={profile.personalInfo.name}
                          onChange={(e) => updatePersonalInfo("name", e.target.value)}
                          className="px-4 py-2.5 rounded-xl border border-[var(--color-hairline)] focus:outline-none focus:border-rose-500 transition-all text-sm bg-[var(--color-surface-soft)]/50"
                          placeholder="John Doe"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-[var(--color-ash)]">Email Address</label>
                        <input
                          type="email"
                          value={profile.personalInfo.email}
                          onChange={(e) => updatePersonalInfo("email", e.target.value)}
                          className="px-4 py-2.5 rounded-xl border border-[var(--color-hairline)] focus:outline-none focus:border-rose-500 transition-all text-sm bg-[var(--color-surface-soft)]/50"
                          placeholder="john@doe.com"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-[var(--color-ash)]">Phone Number</label>
                        <input
                          type="text"
                          value={profile.personalInfo.phone}
                          onChange={(e) => updatePersonalInfo("phone", e.target.value)}
                          className="px-4 py-2.5 rounded-xl border border-[var(--color-hairline)] focus:outline-none focus:border-rose-500 transition-all text-sm bg-[var(--color-surface-soft)]/50"
                          placeholder="+91 99999 88888"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-[var(--color-ash)]">Portfolio Website</label>
                        <input
                          type="url"
                          value={profile.personalInfo.portfolio}
                          onChange={(e) => updatePersonalInfo("portfolio", e.target.value)}
                          className="px-4 py-2.5 rounded-xl border border-[var(--color-hairline)] focus:outline-none focus:border-rose-500 transition-all text-sm bg-[var(--color-surface-soft)]/50"
                          placeholder="https://johndoe.dev"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-[var(--color-ash)]">LinkedIn URL</label>
                        <input
                          type="url"
                          value={profile.personalInfo.linkedin}
                          onChange={(e) => updatePersonalInfo("linkedin", e.target.value)}
                          className="px-4 py-2.5 rounded-xl border border-[var(--color-hairline)] focus:outline-none focus:border-rose-500 transition-all text-sm bg-[var(--color-surface-soft)]/50"
                          placeholder="https://linkedin.com/in/username"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-[var(--color-ash)]">GitHub URL</label>
                        <input
                          type="url"
                          value={profile.personalInfo.github}
                          onChange={(e) => updatePersonalInfo("github", e.target.value)}
                          className="px-4 py-2.5 rounded-xl border border-[var(--color-hairline)] focus:outline-none focus:border-rose-500 transition-all text-sm bg-[var(--color-surface-soft)]/50"
                          placeholder="https://github.com/username"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5 mt-2">
                      <label className="text-xs font-semibold text-[var(--color-ash)]">Professional Summary</label>
                      <textarea
                        rows={5}
                        value={profile.summary}
                        onChange={(e) => setProfile((prev: any) => ({ ...prev, summary: e.target.value }))}
                        className="px-4 py-2.5 rounded-xl border border-[var(--color-hairline)] focus:outline-none focus:border-rose-500 transition-all text-sm bg-[var(--color-surface-soft)]/50 resize-none"
                        placeholder="Brief professional profile summary..."
                      />
                    </div>
                  </motion.div>
                )}

                {/* EDUCATION SECTION */}
                {activeSection === "education" && (
                  <motion.div
                    key="education"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-xs font-bold text-[var(--color-ink-soft)] uppercase tracking-wider">Education Records</h3>
                      <button
                        type="button"
                        onClick={addEducation}
                        className="px-3 py-1.5 rounded-xl bg-[var(--color-surface-card)] hover:bg-[var(--color-secondary-bg)] text-[10px] font-bold text-[var(--color-charcoal)] transition-colors flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add New
                      </button>
                    </div>
                    {profile.education.map((edu: any, index: number) => (
                      <div key={index} className="p-4 border border-[var(--color-hairline)]/80 rounded-2xl space-y-3.5 relative bg-[var(--color-surface-soft)]/20 shadow-sm">
                        <button
                          type="button"
                          onClick={() => removeEducation(index)}
                          className="absolute top-4 right-4 text-[var(--color-stone)] hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-[var(--color-stone)] uppercase">Institution</label>
                          <input
                            type="text"
                            value={edu.institution}
                            onChange={(e) => updateEducation(index, "institution", e.target.value)}
                            className="px-3 py-2 rounded-lg border border-[var(--color-hairline)] bg-[var(--color-canvas)] text-xs focus:outline-none focus:border-rose-500"
                            placeholder="University Name"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-[var(--color-stone)] uppercase">Degree</label>
                          <input
                            type="text"
                            value={edu.degree}
                            onChange={(e) => updateEducation(index, "degree", e.target.value)}
                            className="px-3 py-2 rounded-lg border border-[var(--color-hairline)] bg-[var(--color-canvas)] text-xs focus:outline-none focus:border-rose-500"
                            placeholder="B.Tech Computer Science"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-[var(--color-stone)] uppercase">CGPA / GPA</label>
                            <input
                              type="text"
                              value={edu.gpa}
                              onChange={(e) => updateEducation(index, "gpa", e.target.value)}
                              className="px-3 py-2 rounded-lg border border-[var(--color-hairline)] bg-[var(--color-canvas)] text-xs focus:outline-none focus:border-rose-500"
                              placeholder="e.g. 9.15"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-[var(--color-stone)] uppercase">Graduation Year</label>
                            <input
                              type="text"
                              value={edu.year}
                              onChange={(e) => updateEducation(index, "year", e.target.value)}
                              className="px-3 py-2 rounded-lg border border-[var(--color-hairline)] bg-[var(--color-canvas)] text-xs focus:outline-none focus:border-rose-500"
                              placeholder="2025"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    {profile.education.length === 0 && (
                      <p className="text-center py-8 text-xs text-[var(--color-stone)]">No education records added yet.</p>
                    )}
                  </motion.div>
                )}

                {/* EXPERIENCE SECTION */}
                {activeSection === "experience" && (
                  <motion.div
                    key="experience"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-xs font-bold text-[var(--color-ink-soft)] uppercase tracking-wider">Work Experience</h3>
                      <button
                        type="button"
                        onClick={addExperience}
                        className="px-3 py-1.5 rounded-xl bg-[var(--color-surface-card)] hover:bg-[var(--color-secondary-bg)] text-[10px] font-bold text-[var(--color-charcoal)] transition-colors flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add New
                      </button>
                    </div>
                    {profile.experience.map((exp: any, index: number) => (
                      <div key={index} className="p-4 border border-[var(--color-hairline)]/80 rounded-2xl space-y-3.5 relative bg-[var(--color-surface-soft)]/20 shadow-sm">
                        <button
                          type="button"
                          onClick={() => removeExperience(index)}
                          className="absolute top-4 right-4 text-[var(--color-stone)] hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-[var(--color-stone)] uppercase">Company</label>
                          <input
                            type="text"
                            value={exp.company}
                            onChange={(e) => updateExperience(index, "company", e.target.value)}
                            className="px-3 py-2 rounded-lg border border-[var(--color-hairline)] bg-[var(--color-canvas)] text-xs focus:outline-none focus:border-rose-500"
                            placeholder="e.g. Google"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-[var(--color-stone)] uppercase">Role</label>
                          <input
                            type="text"
                            value={exp.role}
                            onChange={(e) => updateExperience(index, "role", e.target.value)}
                            className="px-3 py-2 rounded-lg border border-[var(--color-hairline)] bg-[var(--color-canvas)] text-xs focus:outline-none focus:border-rose-500"
                            placeholder="e.g. Software Engineer Intern"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-[var(--color-stone)] uppercase">Duration</label>
                            <input
                              type="text"
                              value={exp.duration}
                              onChange={(e) => updateExperience(index, "duration", e.target.value)}
                              className="px-3 py-2 rounded-lg border border-[var(--color-hairline)] bg-[var(--color-canvas)] text-xs focus:outline-none focus:border-rose-500"
                              placeholder="May 2024 - Aug 2024"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-[var(--color-stone)] uppercase">Location</label>
                            <input
                              type="text"
                              value={exp.location}
                              onChange={(e) => updateExperience(index, "location", e.target.value)}
                              className="px-3 py-2 rounded-lg border border-[var(--color-hairline)] bg-[var(--color-canvas)] text-xs focus:outline-none focus:border-rose-500"
                              placeholder="Remote / Bangalore"
                            />
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-[var(--color-stone)] uppercase">Bullet Points (New line separated)</label>
                          <textarea
                            rows={4}
                            value={exp.bullets?.join("\n")}
                            onChange={(e) => updateExperience(index, "bullets", e.target.value.split("\n"))}
                            className="px-3 py-2 rounded-lg border border-[var(--color-hairline)] bg-[var(--color-canvas)] text-xs focus:outline-none focus:border-rose-500 resize-none leading-relaxed"
                            placeholder="Developed features...&#10;Optimized queries..."
                          />
                        </div>
                      </div>
                    ))}
                    {profile.experience.length === 0 && (
                      <p className="text-center py-8 text-xs text-[var(--color-stone)]">No work experience added yet.</p>
                    )}
                  </motion.div>
                )}

                {/* PROJECTS SECTION */}
                {activeSection === "projects" && (
                  <motion.div
                    key="projects"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-xs font-bold text-[var(--color-ink-soft)] uppercase tracking-wider">Personal & Group Projects</h3>
                      <button
                        type="button"
                        onClick={addProject}
                        className="px-3 py-1.5 rounded-xl bg-[var(--color-surface-card)] hover:bg-[var(--color-secondary-bg)] text-[10px] font-bold text-[var(--color-charcoal)] transition-colors flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add New
                      </button>
                    </div>
                    {profile.projects.map((proj: any, index: number) => (
                      <div key={index} className="p-4 border border-[var(--color-hairline)]/80 rounded-2xl space-y-3.5 relative bg-[var(--color-surface-soft)]/20 shadow-sm">
                        <button
                          type="button"
                          onClick={() => removeProject(index)}
                          className="absolute top-4 right-4 text-[var(--color-stone)] hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-[var(--color-stone)] uppercase">Project Name</label>
                          <input
                            type="text"
                            value={proj.name}
                            onChange={(e) => updateProject(index, "name", e.target.value)}
                            className="px-3 py-2 rounded-lg border border-[var(--color-hairline)] bg-[var(--color-canvas)] text-xs focus:outline-none focus:border-rose-500"
                            placeholder="Project title"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-[var(--color-stone)] uppercase">Github / Live Link</label>
                          <input
                            type="url"
                            value={proj.link}
                            onChange={(e) => updateProject(index, "link", e.target.value)}
                            className="px-3 py-2 rounded-lg border border-[var(--color-hairline)] bg-[var(--color-canvas)] text-xs focus:outline-none focus:border-rose-500"
                            placeholder="https://github.com/..."
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-[var(--color-stone)] uppercase">Technologies Used (Comma separated)</label>
                          <input
                            type="text"
                            value={proj.technologies?.join(", ")}
                            onChange={(e) => updateProject(index, "technologies", e.target.value.split(",").map((t: string) => t.trim()))}
                            className="px-3 py-2 rounded-lg border border-[var(--color-hairline)] bg-[var(--color-canvas)] text-xs focus:outline-none focus:border-rose-500"
                            placeholder="React, Node.js, Convex"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-[var(--color-stone)] uppercase">Bullet Points (New line separated)</label>
                          <textarea
                            rows={4}
                            value={proj.bullets?.join("\n")}
                            onChange={(e) => updateProject(index, "bullets", e.target.value.split("\n"))}
                            className="px-3 py-2 rounded-lg border border-[var(--color-hairline)] bg-[var(--color-canvas)] text-xs focus:outline-none focus:border-rose-500 resize-none leading-relaxed"
                            placeholder="Detail 1...&#10;Detail 2..."
                          />
                        </div>
                      </div>
                    ))}
                    {profile.projects.length === 0 && (
                      <p className="text-center py-8 text-xs text-[var(--color-stone)]">No projects added yet.</p>
                    )}
                  </motion.div>
                )}

                {/* SKILLS SECTION */}
                {activeSection === "skills" && (
                  <motion.div
                    key="skills"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <h3 className="text-xs font-bold text-[var(--color-ink-soft)] uppercase tracking-wider mb-2">Technical Skills</h3>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-[var(--color-ash)]">Programming Languages (Comma separated)</label>
                      <input
                        type="text"
                        value={profile.skills.languages?.join(", ")}
                        onChange={(e) => updateSkillsList("languages", e.target.value)}
                        className="px-4 py-2.5 rounded-xl border border-[var(--color-hairline)] focus:outline-none focus:border-rose-500 transition-all text-sm bg-[var(--color-surface-soft)]/50"
                        placeholder="Typescript, Rust, Python, Go"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-[var(--color-ash)]">Frameworks & Libraries (Comma separated)</label>
                      <input
                        type="text"
                        value={profile.skills.frameworks?.join(", ")}
                        onChange={(e) => updateSkillsList("frameworks", e.target.value)}
                        className="px-4 py-2.5 rounded-xl border border-[var(--color-hairline)] focus:outline-none focus:border-rose-500 transition-all text-sm bg-[var(--color-surface-soft)]/50"
                        placeholder="React, Next.js, FastAPI, Actix"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-[var(--color-ash)]">Tools, Cloud & DevOps (Comma separated)</label>
                      <input
                        type="text"
                        value={profile.skills.tools?.join(", ")}
                        onChange={(e) => updateSkillsList("tools", e.target.value)}
                        className="px-4 py-2.5 rounded-xl border border-[var(--color-hairline)] focus:outline-none focus:border-rose-500 transition-all text-sm bg-[var(--color-surface-soft)]/50"
                        placeholder="Docker, Kubernetes, AWS, Git"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-[var(--color-ash)]">Databases (Comma separated)</label>
                      <input
                        type="text"
                        value={profile.skills.databases?.join(", ")}
                        onChange={(e) => updateSkillsList("databases", e.target.value)}
                        className="px-4 py-2.5 rounded-xl border border-[var(--color-hairline)] focus:outline-none focus:border-rose-500 transition-all text-sm bg-[var(--color-surface-soft)]/50"
                        placeholder="PostgreSQL, Redis, MongoDB"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-[var(--color-ash)]">Core CS Concepts (Comma separated)</label>
                      <input
                        type="text"
                        value={profile.skills.soft?.join(", ")}
                        onChange={(e) => updateSkillsList("soft", e.target.value)}
                        className="px-4 py-2.5 rounded-xl border border-[var(--color-hairline)] focus:outline-none focus:border-rose-500 transition-all text-sm bg-[var(--color-surface-soft)]/50"
                        placeholder="Data Structures, OOP, DBMS"
                      />
                    </div>
                  </motion.div>
                )}

                {/* EXTRAS SECTION */}
                {activeSection === "extras" && (
                  <motion.div
                    key="extras"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-xs font-bold text-[var(--color-ink-soft)] uppercase tracking-wider">Certifications</h3>
                      <button
                        type="button"
                        onClick={addCertification}
                        className="px-3 py-1.5 rounded-xl bg-[var(--color-surface-card)] hover:bg-[var(--color-secondary-bg)] text-[10px] font-bold text-[var(--color-charcoal)] transition-colors flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add New
                      </button>
                    </div>
                    {(profile.certifications || []).map((cert: any, index: number) => (
                      <div key={index} className="p-4 border border-[var(--color-hairline)]/80 rounded-2xl space-y-3 relative bg-[var(--color-surface-soft)]/20 shadow-sm">
                        <button
                          type="button"
                          onClick={() => removeCertification(index)}
                          className="absolute top-4 right-4 text-[var(--color-stone)] hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-[var(--color-stone)] uppercase">Certification Name</label>
                          <input
                            type="text"
                            value={cert.name}
                            onChange={(e) => updateCertification(index, "name", e.target.value)}
                            className="px-3 py-2 rounded-lg border border-[var(--color-hairline)] bg-[var(--color-canvas)] text-xs focus:outline-none focus:border-rose-500"
                            placeholder="AWS Solutions Architect"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-1">
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-[var(--color-stone)] uppercase">Issuer</label>
                            <input
                              type="text"
                              value={cert.issuer}
                              onChange={(e) => updateCertification(index, "issuer", e.target.value)}
                              className="px-3 py-2 rounded-lg border border-[var(--color-hairline)] bg-[var(--color-canvas)] text-xs focus:outline-none focus:border-rose-500"
                              placeholder="Amazon Web Services"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-[var(--color-stone)] uppercase">Year</label>
                            <input
                              type="text"
                              value={cert.year}
                              onChange={(e) => updateCertification(index, "year", e.target.value)}
                              className="px-3 py-2 rounded-lg border border-[var(--color-hairline)] bg-[var(--color-canvas)] text-xs focus:outline-none focus:border-rose-500"
                              placeholder="2024"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    {(profile.certifications || []).length === 0 && (
                      <p className="text-center py-8 text-xs text-[var(--color-stone)]">No certifications added yet.</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>

          {/* Action Footer for Saving to Database */}
          <div className="border-t border-[var(--color-hairline)]/80 p-4 shrink-0 flex flex-col gap-2.5 bg-[var(--color-surface-soft)]/40">
            <div className="flex items-center justify-between text-xs text-[var(--color-ash)]">
              {saveSuccess ? (
                <span className="flex items-center gap-1 text-emerald-600 font-semibold animate-pulse">
                  <CheckCircle className="w-4 h-4" /> Sync Completed
                </span>
              ) : isSaving ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-500" /> Syncing data...
                </span>
              ) : (
                <span>Updates compile locally.</span>
              )}
            </div>
            
            <button
              type="button"
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="w-full flex items-center justify-center gap-2 h-11 px-4 rounded-2xl text-sm font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-500/10 hover:shadow-lg hover:shadow-rose-500/15 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              <Save className="w-4 h-4" />
              <span>Save to Master Profile</span>
            </button>
          </div>
        </aside>

        {/* PREVIEW CANVAS */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[var(--color-surface-card)]/50 p-4 md:p-6 lg:p-8 min-h-0">

          {/* Sandboxed visual preview */}
          <div className="flex-1 min-h-0 relative rounded-2xl shadow-lg bg-[var(--color-canvas)] overflow-hidden border border-[var(--color-hairline)]/80">
            <LiveSandboxPreview compiledHtml={compiledHtml} />
          </div>
        </main>
      </div>
    </div>
  );
}
