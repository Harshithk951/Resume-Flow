import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/profile(.*)",
  "/company(.*)",
  "/resume(.*)",
  "/api/compile-latex(.*)",
]);

const isAuthRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();

  // If user is already authenticated and visits sign-in/sign-up, redirect immediately
  if (isAuthRoute(req) && userId) {
    const onboardingComplete =
      ((sessionClaims?.metadata as { onboardingComplete?: boolean })
        ?.onboardingComplete) ||
      req.cookies.get(`onboarding_complete_${userId}`)?.value === "true";

    const destination = onboardingComplete ? "/dashboard" : "/onboarding";
    return NextResponse.redirect(new URL(destination, req.url));
  }

  if (isProtectedRoute(req)) {
    await auth.protect();

    const onboardingComplete =
      ((sessionClaims?.metadata as { onboardingComplete?: boolean })
        ?.onboardingComplete) ||
      (userId ? req.cookies.get(`onboarding_complete_${userId}`)?.value === "true" : false);

    if (!onboardingComplete) {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }
  }
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|xml)).*)",
    "/(api|trpc)(.*)",
  ],
};
