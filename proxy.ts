import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/profile(.*)",
  "/company(.*)",
  "/resume/(.*)",
  "/resumes(.*)",
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
    await auth.protect();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|xml)).*)",
    "/(api|trpc)(.*)",
  ],
};
