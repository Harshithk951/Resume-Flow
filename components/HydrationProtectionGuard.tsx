"use client";

import { useQuery, useMutation } from "convex/react";
import { useAuth } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, ReactNode } from "react";
import { GlobalSilentCompiler } from "./GlobalSilentCompiler";
import ChatBot from "./ChatBot";

export function HydrationProtectionGuard({ children }: { children: ReactNode }) {
  const { isLoaded: isClerkLoaded, isSignedIn } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const syncUserCredits = useMutation(api.users.syncUserCredits);

  // Sync user credits on initial page load if authenticated
  useEffect(() => {
    if (isClerkLoaded && isSignedIn) {
      syncUserCredits().catch((err) => {
        console.error("Failed to sync user credits:", err);
      });
    }
  }, [isClerkLoaded, isSignedIn, syncUserCredits]);



  const isPublicRoute =
    pathname === "/" ||
    pathname?.startsWith("/sign-in") ||
    pathname?.startsWith("/sign-up") ||
    pathname?.startsWith("/legal") ||
    pathname?.startsWith("/info") ||
    pathname?.startsWith("/resources");

  // Only sync Convex profile on authenticated app routes (avoids token refresh
  // conflicts when browsing the public landing page via LAN / alternate hosts).
  const profile = useQuery(
    api.profiles.getMyProfile,
    isClerkLoaded && isSignedIn && !isPublicRoute ? {} : "skip"
  );

  const jobPathMatch = pathname?.match(/^\/company\/([^/]+)/);
  const activeJobId = jobPathMatch ? jobPathMatch[1] : undefined;

  useEffect(() => {
    if (!isClerkLoaded) return;

    if (!isPublicRoute && !isSignedIn) {
      router.replace("/sign-in");
      return;
    }

    if (profile === undefined || isPublicRoute) return;

    if (
      profile === null ||
      profile.extractionStatus === "failed" ||
      profile.extractionStatus === "extracting"
    ) {
      if (pathname !== "/onboarding") {
        router.replace("/onboarding");
      }
    } else if (profile.extractionStatus === "success") {
      if (pathname === "/onboarding") {
        router.replace("/dashboard");
      } else if (pathname === "/profile") {
        const searchParams = new URLSearchParams(window.location.search);
        if (searchParams.get("mode") !== "edit") {
          router.replace("/dashboard");
        }
      }
    }
  }, [profile, pathname, router, isClerkLoaded, isSignedIn, isPublicRoute]);

  if (!isClerkLoaded) {
    if (!isPublicRoute) {
      return <GlobalAppLoadingSkeleton />;
    }
  } else if (!isPublicRoute && !isSignedIn) {
    return <GlobalAppLoadingSkeleton />;
  }

  if (profile === undefined && isSignedIn && !isPublicRoute) {
    return <GlobalAppLoadingSkeleton />;
  }

  const showAuthenticatedTools =
    !isPublicRoute && profile?.extractionStatus === "success";

  return (
    <>
      {children}

      {isPublicRoute && <ChatBot guestMode />}

      {showAuthenticatedTools && (
        <>
          <GlobalSilentCompiler />
          <ChatBot jobId={activeJobId} />
        </>
      )}

      {!isPublicRoute && !showAuthenticatedTools && profile !== undefined && (
        <ChatBot jobId={activeJobId} />
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
