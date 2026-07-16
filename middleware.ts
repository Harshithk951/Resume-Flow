import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/profile(.*)",
  "/company(.*)",
  "/resume(.*)",
  "/templates(.*)",
  "/api/compile-latex(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();

    const { userId, sessionClaims } = await auth();
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
    "/((?!_next|[^?]*\\.(?:html|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
