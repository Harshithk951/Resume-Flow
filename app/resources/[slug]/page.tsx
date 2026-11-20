import { redirect } from "next/navigation";

const SLUG_REDIRECT_MAP: Record<string, string> = {
  handbook: "/blog/software-engineer-resume-guide",
  "ats-best-practices": "/blog/how-to-beat-ats-resume-screening-2025",
  "interview-prep": "/blog/cover-letter-mistakes",
  "api-docs": "/blog",
};

export default async function ResourceSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const destination = SLUG_REDIRECT_MAP[slug] || "/blog";
  redirect(destination);
}
