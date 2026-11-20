"use client";

import { useQuery, useMutation } from "convex/react";
import { useAuth } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, ReactNode, Suspense } from "react";
import dynamic from "next/dynamic";
import { BrandLoadingScreen } from "@/components/BrandLoadingScreen";

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
    pathname?.startsWith("/blog") ||
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
  // Routing: Direct new & existing authenticated users to /optimize
  // ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isClerkLoaded) return;

    if (!isPublicRoute && !isSignedIn) {
      router.replace("/sign-in");
      return;
    }

    if (isPublicRoute) return;

    // Never show obsolete /onboarding screen — redirect directly to /optimize
    if (pathname === "/onboarding") {
      router.replace("/optimize");
      return;
    }

    if (pathname === "/profile") {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get("mode") !== "edit") {
        router.replace("/optimize");
      }
    }
  }, [user, pathname, router, isClerkLoaded, isSignedIn, isPublicRoute]);

  // ──────────────────────────────────────────────────────────
  // Loading skeletons while auth / data is pending
  // ──────────────────────────────────────────────────────────
  if (!isClerkLoaded) {
    if (!isPublicRoute) {
      return <BrandLoadingScreen />;
    }
  } else if (!isPublicRoute && !isSignedIn) {
    return <BrandLoadingScreen />;
  }

  if (user === undefined && isSignedIn && !isPublicRoute) {
    return <BrandLoadingScreen />;
  }

  // ──────────────────────────────────────────────────────────
  // Authenticated tools — still driven by profile extraction
  // status since these tools need a parsed resume to work.
  // ──────────────────────────────────────────────────────────
  const showAuthenticatedTools =
    isClerkLoaded && isSignedIn && !isPublicRoute;

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
