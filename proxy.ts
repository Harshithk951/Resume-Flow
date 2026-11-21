import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/profile(.*)",
  "/company(.*)",
  "/resume/(.*)",
  "/resumes(.*)",
  "/api/compile-(.*)",
]);

const isAuthRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // If user is already authenticated and visits sign-in/sign-up, redirect directly to /optimize
  if (isAuthRoute(req) && userId) {
    return NextResponse.redirect(new URL("/optimize", req.url));
  }

  // If route is /onboarding, redirect directly to /optimize
  if (req.nextUrl.pathname === "/onboarding") {
    return NextResponse.redirect(new URL("/optimize", req.url));
  }

  if (isProtectedRoute(req)) {
    // Test-only auth bypass: active strictly when NODE_ENV=test and bypass header is supplied
    const isTestBypass =
      process.env.NODE_ENV === "test" &&
      req.headers.get("x-test-auth-bypass") === "1";

    if (!isTestBypass) {
      await auth.protect();
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
