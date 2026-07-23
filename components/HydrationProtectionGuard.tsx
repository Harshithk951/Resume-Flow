"use client";

import { useQuery, useMutation } from "convex/react";
import { useAuth } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, ReactNode, Suspense } from "react";
import dynamic from "next/dynamic";

// Lazy-load heavy components with next/dynamic for App Router compatibility
const GlobalSilentCompiler = dynamic(
  () => import("./GlobalSilentCompiler").then((m) => m.GlobalSilentCompiler),
  { ssr: false }
);
const ChatBot = dynamic(() => import("./ChatBot"), { ssr: false });

export function HydrationProtectionGuard({ children }: { children: ReactNode }) {
  const { isLoaded: isClerkLoaded, isSignedIn } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const createOrGetUser = useMutation(api.users.createOrGetUser);

  // Sync user record and credits on initial page load if authenticated
  useEffect(() => {
    if (isClerkLoaded && isSignedIn) {
      createOrGetUser().catch((err) => {
        console.error("Failed to sync user:", err);
      });
    }
  }, [isClerkLoaded, isSignedIn, createOrGetUser]);

  const isPublicRoute =
    pathname === "/" ||
    pathname?.startsWith("/sign-in") ||
    pathname?.startsWith("/sign-up") ||
    pathname?.startsWith("/legal") ||
    pathname?.startsWith("/info") ||
    pathname?.startsWith("/resources") ||
    pathname?.startsWith("/pricing") ||
    pathname?.startsWith("/features") ||
    pathname?.startsWith("/about") ||
    pathname?.startsWith("/free-resume-builder");

  const shouldFetch =
    isClerkLoaded && isSignedIn && !isPublicRoute;

  // Fetch user record to check onboarding completion status.
  // This is the authoratative check — NOT profile.extractionStatus.
  const user = useQuery(
    api.users.getUser,
    shouldFetch ? {} : "skip"
  );

  // Also fetch profile for authenticated-tool rendering (ChatBot, compiler).
  const profile = useQuery(
    api.profiles.getMyProfile,
    shouldFetch ? {} : "skip"
  );

  const jobPathMatch = pathname?.match(/^\/company\/([^/]+)/);
  const activeJobId = jobPathMatch ? jobPathMatch[1] : undefined;

  // ──────────────────────────────────────────────────────────
  // Routing: use onboardingComplete, NOT extractionStatus
  // ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isClerkLoaded) return;

    if (!isPublicRoute && !isSignedIn) {
      router.replace("/sign-in");
      return;
    }

    if (user === undefined || isPublicRoute) return;

    const onboardingComplete = user?.onboardingComplete ?? false;

    if (!onboardingComplete) {
      // User has NOT completed onboarding → send them there
      if (pathname !== "/onboarding") {
        router.replace("/onboarding");
      }
    } else {
      // User HAS completed onboarding → never show /onboarding
      if (pathname === "/onboarding") {
        router.replace("/dashboard");
      } else if (pathname === "/profile") {
        const searchParams = new URLSearchParams(window.location.search);
        if (searchParams.get("mode") !== "edit") {
          router.replace("/dashboard");
        }
      }
    }
  }, [user, pathname, router, isClerkLoaded, isSignedIn, isPublicRoute]);

  // ──────────────────────────────────────────────────────────
  // Loading skeletons while auth / data is pending
  // ──────────────────────────────────────────────────────────
  if (!isClerkLoaded) {
    if (!isPublicRoute) {
      return <GlobalAppLoadingSkeleton />;
    }
  } else if (!isPublicRoute && !isSignedIn) {
    return <GlobalAppLoadingSkeleton />;
  }

  if (user === undefined && isSignedIn && !isPublicRoute) {
    return <GlobalAppLoadingSkeleton />;
  }

  // ──────────────────────────────────────────────────────────
  // Authenticated tools — still driven by profile extraction
  // status since these tools need a parsed resume to work.
  // ──────────────────────────────────────────────────────────
  const showAuthenticatedTools =
    !isPublicRoute && profile?.extractionStatus === "success";

  return (
    <>
      {children}

      {isPublicRoute && (
        <Suspense fallback={null}>
          <ChatBot guestMode />
        </Suspense>
      )}

      {showAuthenticatedTools && (
        <>
          <Suspense fallback={null}>
            <GlobalSilentCompiler />
          </Suspense>
          <Suspense fallback={null}>
            <ChatBot jobId={activeJobId} />
          </Suspense>
        </>
      )}

      {!isPublicRoute && !showAuthenticatedTools && profile !== undefined && (
        <Suspense fallback={null}>
          <ChatBot jobId={activeJobId} />
        </Suspense>
      )}
    </>
  );
}

function GlobalAppLoadingSkeleton() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--color-surface-soft)] px-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="mx-auto h-12 w-12 rounded-xl bg-rose-100 flex items-center justify-center animate-pulse">
          <div className="h-6 w-6 rounded bg-rose-500 opacity-75" />
        </div>

        <div className="space-y-3">
          <div className="mx-auto h-5 w-48 rounded bg-[var(--color-secondary-bg)] animate-pulse" />
          <div className="mx-auto h-4 w-64 rounded bg-[var(--color-secondary-bg)]/70 animate-pulse" />
        </div>

        <div className="mt-8 grid grid-cols-3 gap-3 opacity-40">
          <div className="h-20 rounded-xl bg-[var(--color-secondary-bg)] animate-pulse" />
          <div className="h-20 rounded-xl bg-[var(--color-secondary-bg)] animate-pulse col-span-2" />
          <div className="h-28 rounded-xl bg-[var(--color-secondary-bg)] animate-pulse col-span-2" />
          <div className="h-28 rounded-xl bg-[var(--color-secondary-bg)] animate-pulse" />
        </div>
      </div>
    </div>
  );
}
