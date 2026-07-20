"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Plus,
  Trash2,
  Save,
  Loader2,
} from "lucide-react";
import { toast } from "@/lib/toast";
import { CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { exportToHtml } from "@/lib/html/exporter";
import { LiveSandboxPreview } from "@/components/LiveSandboxPreview";

type Section = "contact" | "education" | "experience" | "projects" | "skills" | "extras";

function ResumeBuilderPageContent() {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();

  const myProfile = useQuery(api.profiles.getMyProfile, isAuthenticated ? {} : "skip");
  const createOrUpdateProfile = useMutation(api.profiles.createOrUpdateProfile);

  const [activeSection, setActiveSection] = useState<Section>("contact");
  const [activeTemplate, setActiveTemplate] = useState<string>("ats_strict");
  const spacingPreset = "compact";

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
  const [_saveError, setSaveError] = useState<string | null>(null);
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
      return exportToHtml(profile, activeTemplate, spacingPreset);
    } catch (err) {
      console.error("Failed to compile HTML preview:", err);
      return "<h1>Preview compilation failed</h1>";
    }
  }, [profile, activeTemplate, spacingPreset]);

  if (authLoading || (isAuthenticated && myProfile === undefined)) {
    return (
      <div className="h-[50vh] w-full flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-rose-600" />
      </div>
    );
  }

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

      toast.success("Profile saved!");
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error(err);
      const msg = err.message || "Failed to save profile changes.";
      setSaveError(msg);
      toast.error(msg);
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 h-[calc(100vh-8rem)] w-full gap-8 bg-[var(--color-surface-soft)]">
      {/* LEFT COLUMN: EDITING FORM (5 columns) */}
      <div className="lg:col-span-6 bg-[var(--color-canvas)] border border-[var(--color-hairline)]/85 rounded-3xl p-6 flex flex-col h-full overflow-hidden shadow-sm">
        {/* Section tabs */}
        <div className="flex gap-1.5 border-b border-[var(--color-hairline-soft)] pb-3 mb-6 overflow-x-auto shrink-0 scrollbar-none">
          {(["contact", "education", "experience", "projects", "skills", "extras"] as const).map((sec) => {
            const active = activeSection === sec;
            return (
              <button
                key={sec}
                type="button"
                onClick={() => setActiveSection(sec)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap ${
                  active
                    ? "bg-rose-50 text-rose-600"
                    : "text-[var(--color-ash)] hover:bg-[var(--color-surface-soft)] hover:text-[var(--color-charcoal)]"
                }`}
              >
                {sec === "contact" ? "Basics" : sec === "extras" ? "Certs & Awards" : sec}
              </button>
            );
          })}
        </div>

        {/* Form content scrollable area */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-1">
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
                <h3 className="text-sm font-bold text-[var(--color-ink-soft)] uppercase tracking-tight mb-2">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[var(--color-ash)]">Professional Summary</label>
                  <textarea
                    rows={4}
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
                  <h3 className="text-sm font-bold text-[var(--color-ink-soft)] uppercase tracking-tight">Education Records</h3>
                  <button
                    type="button"
                    onClick={addEducation}
                    className="px-3 py-1 rounded-xl bg-[var(--color-surface-card)] hover:bg-[var(--color-secondary-bg)] text-[11px] font-bold text-[var(--color-charcoal)] transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>
                {profile.education.map((edu: any, index: number) => (
                  <div key={index} className="p-4 border border-[var(--color-hairline)]/60 rounded-2xl space-y-3 relative bg-[var(--color-surface-soft)]/20">
                    <button
                      type="button"
                      onClick={() => removeEducation(index)}
                      className="absolute top-4 right-4 text-[var(--color-stone)] hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <h3 className="text-sm font-bold text-[var(--color-ink-soft)] uppercase tracking-tight">Work Experience</h3>
                  <button
                    type="button"
                    onClick={addExperience}
                    className="px-3 py-1 rounded-xl bg-[var(--color-surface-card)] hover:bg-[var(--color-secondary-bg)] text-[11px] font-bold text-[var(--color-charcoal)] transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>
                {profile.experience.map((exp: any, index: number) => (
                  <div key={index} className="p-4 border border-[var(--color-hairline)]/60 rounded-2xl space-y-3 relative bg-[var(--color-surface-soft)]/20">
                    <button
                      type="button"
                      onClick={() => removeExperience(index)}
                      className="absolute top-4 right-4 text-[var(--color-stone)] hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <label className="text-[10px] font-bold text-[var(--color-stone)] uppercase">Bullet Points (Comma separated)</label>
                      <textarea
                        rows={3}
                        value={exp.bullets?.join("\n")}
                        onChange={(e) => updateExperience(index, "bullets", e.target.value.split("\n"))}
                        className="px-3 py-2 rounded-lg border border-[var(--color-hairline)] bg-[var(--color-canvas)] text-xs focus:outline-none focus:border-rose-500 resize-none leading-relaxed"
                        placeholder="Bullet point 1&#10;Bullet point 2..."
                      />
                    </div>
                  </div>
                ))}
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
                  <h3 className="text-sm font-bold text-[var(--color-ink-soft)] uppercase tracking-tight">Personal & Group Projects</h3>
                  <button
                    type="button"
                    onClick={addProject}
                    className="px-3 py-1 rounded-xl bg-[var(--color-surface-card)] hover:bg-[var(--color-secondary-bg)] text-[11px] font-bold text-[var(--color-charcoal)] transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>
                {profile.projects.map((proj: any, index: number) => (
                  <div key={index} className="p-4 border border-[var(--color-hairline)]/60 rounded-2xl space-y-3 relative bg-[var(--color-surface-soft)]/20">
                    <button
                      type="button"
                      onClick={() => removeProject(index)}
                      className="absolute top-4 right-4 text-[var(--color-stone)] hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-[var(--color-stone)] uppercase">Technologies Used (Comma separated)</label>
                      <input
                        type="text"
                        value={proj.technologies?.join(", ")}
                        onChange={(e) => updateProject(index, "technologies", e.target.value.split(",").map(t => t.trim()))}
                        className="px-3 py-2 rounded-lg border border-[var(--color-hairline)] bg-[var(--color-canvas)] text-xs focus:outline-none focus:border-rose-500"
                        placeholder="React, Node.js, Convex"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-[var(--color-stone)] uppercase">Bullet Points (New line separated)</label>
                      <textarea
                        rows={3}
                        value={proj.bullets?.join("\n")}
                        onChange={(e) => updateProject(index, "bullets", e.target.value.split("\n"))}
                        className="px-3 py-2 rounded-lg border border-[var(--color-hairline)] bg-[var(--color-canvas)] text-xs focus:outline-none focus:border-rose-500 resize-none leading-relaxed"
                        placeholder="Detail 1&#10;Detail 2..."
                      />
                    </div>
                  </div>
                ))}
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
                <h3 className="text-sm font-bold text-[var(--color-ink-soft)] uppercase tracking-tight mb-2">Technical Skills</h3>
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
                  <h3 className="text-sm font-bold text-[var(--color-ink-soft)] uppercase tracking-tight">Certifications</h3>
                  <button
                    type="button"
                    onClick={addCertification}
                    className="px-3 py-1 rounded-xl bg-[var(--color-surface-card)] hover:bg-[var(--color-secondary-bg)] text-[11px] font-bold text-[var(--color-charcoal)] transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>
                {(profile.certifications || []).map((cert: any, index: number) => (
                  <div key={index} className="p-4 border border-[var(--color-hairline)]/60 rounded-2xl space-y-3 relative bg-[var(--color-surface-soft)]/20">
                    <button
                      type="button"
                      onClick={() => removeCertification(index)}
                      className="absolute top-4 right-4 text-[var(--color-stone)] hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="flex flex-col gap-1 md:col-span-2">
                        <label className="text-[10px] font-bold text-[var(--color-stone)] uppercase">Certification Name</label>
                        <input
                          type="text"
                          value={cert.name}
                          onChange={(e) => updateCertification(index, "name", e.target.value)}
                          className="px-3 py-2 rounded-lg border border-[var(--color-hairline)] bg-[var(--color-canvas)] text-xs focus:outline-none focus:border-rose-500"
                          placeholder="AWS Solutions Architect"
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
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action Footer */}
        <div className="border-t border-[var(--color-hairline-soft)] pt-4 mt-6 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-[var(--color-ash)]">
            {saveSuccess ? (
              <span className="flex items-center gap-1 text-emerald-600 font-semibold animate-pulse">
                <CheckCircle className="w-4 h-4" /> Changes Saved
              </span>
            ) : isSaving ? (
              <span className="flex items-center gap-1.5 text-[var(--color-ash)]">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving changes...
              </span>
            ) : (
              <span>Draft updates are compiled locally.</span>
            )}
          </div>
          <button
            type="button"
            onClick={handleSaveProfile}
            disabled={isSaving}
            className="btn-primary flex items-center gap-2 h-10 px-5"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile</span>
          </button>
        </div>
      </div>

      {/* RIGHT COLUMN: VISUAL PREVIEW & WORKSPACE (7 columns) */}
      <div className="lg:col-span-6 flex flex-col h-full bg-[var(--color-canvas)] border border-[var(--color-hairline)]/85 rounded-3xl p-6 shadow-sm overflow-hidden">
        {/* Workspace Toolbar */}
        <div className="flex justify-between items-center border-b border-[var(--color-hairline-soft)] pb-4 mb-6 shrink-0 gap-4">
          <div className="flex items-center gap-3">
            <select
              value={activeTemplate}
              onChange={(e) => setActiveTemplate(e.target.value)}
              className="text-xs border border-[var(--color-hairline)] p-2.5 rounded-xl font-bold bg-[var(--color-canvas)] text-[var(--color-charcoal)] focus:outline-none focus:border-rose-500 cursor-pointer"
            >
              <option value="ats_strict">ATS Strict (Classic)</option>
              <option value="modern_professional">Startup Accent</option>
              <option value="modern_executive">Finance Classic</option>
              <option value="tech_innovator">Tech Modern</option>
            </select>

            <div className="bg-[var(--color-surface-card)] rounded-xl px-3 py-1.5 border border-[var(--color-hairline)]/40">
              <span className="text-[10px] font-bold text-[var(--color-mute)]">Compact</span>
            </div>
          </div>

        </div>

        {/* Interactive sandboxed visual preview */}
        <div className="flex-1 min-h-0">
          <LiveSandboxPreview compiledHtml={compiledHtml} />
        </div>
      </div>
    </div>
  );
}

export default function ResumeBuilderPage() {
  return (
    <Suspense
      fallback={
        <div className="h-[50vh] w-full flex items-center justify-center bg-[var(--color-surface-soft)]">
          <Loader2 className="h-6 w-6 animate-spin text-rose-600" />
        </div>
      }
    >
      <ResumeBuilderPageContent />
    </Suspense>
  );
}
