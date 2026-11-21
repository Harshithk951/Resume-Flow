"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  FileText,
  Plus,
  Upload,
  Trash2,
  Edit3,
  Star,
  LayoutTemplate,
  Loader2,
  X,
} from "lucide-react";
import { toast } from "@/lib/toast";

interface SavedResumeDoc {
  _id: Id<"savedResumes">;
  title: string;
  targetRole?: string;
  template?: string;
  rawText?: string;
  sections?: Record<string, unknown>;
  isDefault?: boolean;
}

const TEMPLATE_OPTIONS = [
  { id: "classic", name: "Classic Professional", desc: "Traditional Harvard ATS layout (Default)" },
  { id: "modern", name: "Modern", desc: "Clean accent header band & bullet formatting" },
  { id: "minimal", name: "Minimal", desc: "Distraction-free layout with em-dash bullets" },
  { id: "two-column", name: "Two-column", desc: "Best for sharing directly with recruiters" },
];

export default function SavedResumesPage() {
  const router = useRouter();

  // ─── Convex Data ────────────────────────────────────────────
  const resumesData = useQuery(api.savedResumes.getMySavedResumes);
  const creditsStatus = useQuery(api.users.getCreditsStatus);
  const createResumeMutation = useMutation(api.savedResumes.createSavedResume);
  const updateResumeMutation = useMutation(api.savedResumes.updateSavedResume);
  const deleteResumeMutation = useMutation(api.savedResumes.deleteSavedResume);

  // ─── Modal State ────────────────────────────────────────────
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResumeId, setEditingResumeId] = useState<Id<"savedResumes"> | null>(null);

  // Form Fields
  const [modalTitle, setModalTitle] = useState("");
  const [modalRole, setModalRole] = useState("");
  const [modalTemplate, setModalTemplate] = useState("classic");
  const [modalRawText, setModalRawText] = useState("");
  const [modalIsDefault, setModalIsDefault] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<Id<"savedResumes"> | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── Quota Calculations ─────────────────────────────────────
  const count = resumesData?.count ?? 0;
  const slotLimit = resumesData?.slotLimit ?? 3;
  const isSlotFull = count >= slotLimit;
  const slotPercent = Math.min(100, Math.round((count / Math.max(1, slotLimit)) * 100));

  // ─── Open Create Modal ──────────────────────────────────────
  const handleOpenCreate = () => {
    if (isSlotFull) {
      toast.error(
        `Slot quota reached (${count}/${slotLimit}). Please upgrade your plan or remove a resume to add another.`
      );
      return;
    }
    setEditingResumeId(null);
    setModalTitle("");
    setModalRole("");
    setModalTemplate("modern_clean");
    setModalRawText("");
    setModalIsDefault(count === 0);
    setIsModalOpen(true);
  };

  // ─── Open Edit Modal ────────────────────────────────────────
  const handleOpenEdit = (resume: SavedResumeDoc) => {
    setEditingResumeId(resume._id);
    setModalTitle(resume.title);
    setModalRole(resume.targetRole || "");
    setModalTemplate(resume.template || "classic");
    setModalRawText(resume.rawText || "");
    setModalIsDefault(resume.isDefault ?? false);
    setIsModalOpen(true);
  };

  // ─── File Upload Handler inside Modal ───────────────────────
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      let extracted = "";
      if (file.name.endsWith(".txt") || file.name.endsWith(".md") || file.name.endsWith(".json")) {
        extracted = await file.text();
      } else {
        const buffer = await file.arrayBuffer();
        const decoder = new TextDecoder("utf-8", { fatal: false });
        const raw = decoder.decode(buffer);
        const matches = raw.match(/\(([^()]{3,})\)/g);
        if (matches && matches.length > 10) {
          extracted = matches
            .map((m) => m.slice(1, -1))
            .filter((s) => !/[^\x20-\x7E\s]/.test(s) && s.length > 2)
            .join(" ");
        } else {
          extracted = raw
            .replace(/[^\x20-\x7E\n\r\t]/g, " ")
            .replace(/\s{2,}/g, " ")
            .trim();
        }
      }

      if (extracted.trim().length > 30) {
        setModalRawText(extracted.trim());
        if (!modalTitle) {
          setModalTitle(file.name.replace(/\.[^/.]+$/, ""));
        }
        toast.success(`Imported text from ${file.name}`);
      } else {
        toast.error("Could not extract readable text from this file. Please paste text directly.");
      }
    } catch (err) {
      console.error("File upload error:", err);
      toast.error("Failed to read file.");
    }
  };

  // ─── Submit Create or Update ────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalTitle.trim()) {
      toast.error("Please provide a title for this resume.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingResumeId) {
        await updateResumeMutation({
          id: editingResumeId,
          title: modalTitle.trim(),
          targetRole: modalRole.trim() || undefined,
          template: modalTemplate,
          rawText: modalRawText.trim() || undefined,
          isDefault: modalIsDefault,
        });
        toast.success("Resume updated successfully!");
      } else {
        await createResumeMutation({
          title: modalTitle.trim(),
          targetRole: modalRole.trim() || undefined,
          template: modalTemplate,
          rawText: modalRawText.trim() || undefined,
          isDefault: modalIsDefault,
        });
        toast.success("Saved new resume!");
      }
      setIsModalOpen(false);
    } catch (err: unknown) {
      console.error("Save resume error:", err);
      toast.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Delete Handler ─────────────────────────────────────────
  const handleDelete = async (id: Id<"savedResumes">) => {
    try {
      await deleteResumeMutation({ id });
      toast.success("Resume deleted.");
      setDeleteConfirmId(null);
    } catch (err: unknown) {
      console.error("Delete resume error:", err);
      toast.error(err);
    }
  };

  // ─── Set as Default ─────────────────────────────────────────
  const handleSetDefault = async (id: Id<"savedResumes">) => {
    try {
      await updateResumeMutation({ id, isDefault: true });
      toast.success("Set as default resume.");
    } catch (err: unknown) {
      console.error("Set default error:", err);
      toast.error(err);
    }
  };

  // ─── Optimize this Resume ───────────────────────────────────
  const handleOptimizeResume = (resume: SavedResumeDoc) => {
    try {
      if (resume.rawText) {
        sessionStorage.setItem("resumeflow_prefill_resume", resume.rawText);
      }
      if (resume.targetRole) {
        sessionStorage.setItem("resumeflow_prefill_role", resume.targetRole);
      }
    } catch {
      // ignore
    }
    router.push("/optimize");
  };

  return (
    <div className="min-h-screen bg-[#fbfbf9] text-slate-900 pb-28">
      {/* ─── PAGE HEADER ─────────────────────────────────────── */}
      <div className="border-b border-slate-200/80 bg-white/60 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                Saved resumes
              </h1>
              <p className="text-sm text-slate-600 mt-1 max-w-xl">
                Store multiple baseline resumes tailored for different roles, industries, or seniority
                levels. Easily load any saved resume in the Optimizer.
              </p>
            </div>

            {/* Quota & Action Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {/* Slot Indicator */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-3 px-4 shadow-2xs min-w-[210px]">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-500 font-medium">Slot usage</span>
                  <span className="font-bold text-slate-900">
                    {count} of {slotLimit >= 1000 ? "Unlimited" : `${slotLimit} slots used`}
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isSlotFull ? "bg-amber-500" : "bg-purple-600"
                    }`}
                    style={{ width: `${slotPercent}%` }}
                  />
                </div>
                {creditsStatus?.plan === "free" && (
                  <Link
                    href="/pricing"
                    className="text-[11px] font-semibold text-purple-600 hover:underline block mt-1.5 text-right"
                  >
                    Upgrade for 20 slots →
                  </Link>
                )}
              </div>

              {/* Build Button */}
              <button
                type="button"
                onClick={handleOpenCreate}
                className="py-3 px-4 rounded-xl bg-purple-700 hover:bg-purple-800 active:scale-[0.99] text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Build new resume</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── RESUMES LIST OR EMPTY STATE ─────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {resumesData === undefined ? (
          /* ─── SKELETON LOADING STATE (MATCHING BRAND DESIGN) ─── */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-52 rounded-2xl bg-[#F6F5FB] animate-pulse border border-slate-200/40"
              />
            ))}
          </div>
        ) : resumesData.resumes.length === 0 ? (
          /* EMPTY STATE */
          <div className="max-w-xl mx-auto my-12 text-center bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-xs space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto shadow-2xs border border-purple-100">
              <FileText className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-slate-900">
                No resumes yet
              </h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Save baseline versions of your resume here to tailor for different jobs, or use our
                free ATS-friendly templates to start from scratch.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleOpenCreate}
                className="w-full sm:w-auto py-3 px-5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Start from scratch</span>
              </button>

              <Link
                href="/templates"
                className="w-full sm:w-auto py-3 px-5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-2xs"
              >
                <LayoutTemplate className="w-4 h-4 text-slate-500" />
                <span>Browse free templates</span>
              </Link>
            </div>
          </div>
        ) : (
          /* RESUME CARDS GRID */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumesData.resumes.map((resume: SavedResumeDoc) => (
              <div
                key={resume._id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Top Bar: Title & Default Pill */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-purple-600 transition-colors line-clamp-1">
                      {resume.title}
                    </h3>
                    {resume.isDefault ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold shrink-0">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        <span>Default</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSetDefault(resume._id)}
                        className="text-[10px] text-slate-400 hover:text-amber-600 transition-colors opacity-0 group-hover:opacity-100"
                        title="Set as default"
                      >
                        Make default
                      </button>
                    )}
                  </div>

                  {/* Metadata tags */}
                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 mb-3">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                      {resume.targetRole || "General Profile"}
                    </span>
                    <span>·</span>
                    <span className="capitalize text-slate-500">
                      {resume.template === "two-column"
                        ? "Two-column"
                        : resume.template
                        ? resume.template.replace(/[-_]/g, " ")
                        : "Classic"}
                    </span>
                  </div>

                  {/* Text preview */}
                  {resume.rawText ? (
                    <p className="text-xs text-slate-500 line-clamp-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-mono leading-relaxed mb-4">
                      {resume.rawText.slice(0, 180)}...
                    </p>
                  ) : (
                    <div className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4">
                      Standard sections structured
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOptimizeResume(resume)}
                      className="px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                    >
                      <span>Optimize</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(resume)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                      title="Edit resume"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Delete trigger */}
                  {deleteConfirmId === resume._id ? (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleDelete(resume._id)}
                        className="px-2 py-1 rounded bg-red-600 text-white text-[10px] font-bold"
                      >
                        Confirm
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(null)}
                        className="p-1 text-slate-400 hover:text-slate-600 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(resume._id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete resume"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── CREATE / EDIT MODAL ──────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                {editingResumeId ? "Edit Saved Resume" : "Save New Resume"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Resume Title <span className="text-purple-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={modalTitle}
                  onChange={(e) => setModalTitle(e.target.value)}
                  placeholder="e.g. Senior Backend Engineer - 2026"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Role / Domain
                </label>
                <input
                  type="text"
                  value={modalRole}
                  onChange={(e) => setModalRole(e.target.value)}
                  placeholder="e.g. Full Stack Developer, Product Manager"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Template Style
                </label>
                <select
                  value={modalTemplate}
                  onChange={(e) => setModalTemplate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                >
                  {TEMPLATE_OPTIONS.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} — {t.desc}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Resume Content
                  </label>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-bold text-purple-600 hover:underline flex items-center gap-1"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Import file</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.txt,.md"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
                <textarea
                  rows={6}
                  value={modalRawText}
                  onChange={(e) => setModalRawText(e.target.value)}
                  placeholder="Paste or import your resume text..."
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={modalIsDefault}
                  onChange={(e) => setModalIsDefault(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-xs font-medium text-slate-700">
                  Set as my primary default resume
                </span>
              </label>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs flex items-center gap-1.5 disabled:opacity-60 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingResumeId ? "Update Resume" : "Save Resume"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
