"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { SignOutButton, UserButton, useAuth, useUser } from "@clerk/nextjs";
import { Menu, X, History, LogOut } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { CreditsBadge } from "@/components/CreditsBadge";
import { ChatHistoryPanel } from "@/components/ChatHistoryPanel";
import { DashboardThemeProvider } from "@/components/DashboardThemeProvider";
import { BrandLoadingScreen } from "@/components/BrandLoadingScreen";

const navItems = [
  { name: "Should I apply?", href: "/job-check" },
  { name: "Optimizer", href: "/optimize" },
  { name: "Saved resumes", href: "/resumes" },
  { name: "Job tracker", href: "/jobs" },
  { name: "History", href: "/history" },
  { name: "Pricing", href: "/pricing" },
];

function isItemActive(pathname: string, href: string) {
  if (pathname === href) return true;
  if (href !== "/" && pathname.startsWith(href + "/")) return true;
  return false;
}

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isChatHistoryOpen, setIsChatHistoryOpen] = useState(false);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || !isSignedIn) {
    return <BrandLoadingScreen />;
  }

  return (
    <DashboardThemeProvider>
      <div className="min-h-screen flex flex-col bg-[#fbfbf9] text-slate-900 antialiased">
        {/* ─── HORIZONTAL TOP NAVIGATION BAR ─────────────── */}
        <header className="sticky top-0 z-40 h-16 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
          <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
            {/* Left: BrandLogo */}
            <div className="flex items-center shrink-0">
              <BrandLogo href="/optimize" size="sm" showText={true} />
            </div>

            {/* Center-left: Navigation links */}
            <nav
              className="hidden md:flex items-center gap-1 lg:gap-2 flex-1 ml-6"
              aria-label="Main navigation"
            >
              {navItems.map((item) => {
                const active = isItemActive(pathname ?? "", item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`relative flex items-center px-3 py-1.5 text-sm transition-all rounded-lg select-none ${
                      active
                        ? "font-semibold text-purple-600"
                        : "font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                    }`}
                  >
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right utilities */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <CreditsBadge />

              <button
                type="button"
                onClick={() => setIsChatHistoryOpen(true)}
                title="Chat History"
                aria-label="Chat History"
                className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                <History className="w-4 h-4" />
              </button>

              <UserButton />

              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(true)}
                aria-label="Open menu"
                className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* ─── RESPONSIVE MOBILE DRAWER ─────────────────── */}
        {isMobileDrawerOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex justify-end">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300"
              onClick={() => setIsMobileDrawerOpen(false)}
              aria-hidden="true"
            />

            {/* Drawer panel */}
            <aside
              className="relative w-72 max-w-[85vw] h-full bg-white border-l border-slate-200 flex flex-col justify-between py-6 px-5 shadow-2xl z-50 animate-in slide-in-from-right duration-300"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation menu"
              onKeyDown={(e) => {
                if (e.key === "Escape") setIsMobileDrawerOpen(false);
              }}
            >
              <div className="space-y-6">
                {/* Header: BrandLogo + Close */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <BrandLogo href="/optimize" size="sm" showText={true} />
                  <button
                    onClick={() => setIsMobileDrawerOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
                    aria-label="Close navigation menu"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Credits Badge in Drawer */}
                <div className="pt-1">
                  <CreditsBadge onClick={() => setIsMobileDrawerOpen(false)} />
                </div>

                {/* Navigation links */}
                <nav className="space-y-1" aria-label="Mobile navigation links">
                  {navItems.map((item) => {
                    const active = isItemActive(pathname ?? "", item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileDrawerOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                          active
                            ? "bg-purple-50 text-purple-700 font-semibold border border-purple-100/70"
                            : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </nav>

                {/* Chat History button */}
                <div className="pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileDrawerOpen(false);
                      setIsChatHistoryOpen(true);
                    }}
                    className="flex items-center gap-2.5 w-full px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  >
                    <History className="w-4 h-4 text-slate-500" />
                    <span>Chat History</span>
                  </button>
                </div>
              </div>

              {/* Footer: User profile & Sign Out */}
              <div className="space-y-4 border-t border-slate-200 pt-4">
                <div className="flex items-center gap-3 px-1">
                  <UserButton />
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold text-slate-900 truncate">
                      {user?.fullName || "ResumeFlow User"}
                    </span>
                    {user?.primaryEmailAddress?.emailAddress && (
                      <span className="text-[10px] text-slate-500 truncate">
                        {user.primaryEmailAddress.emailAddress}
                      </span>
                    )}
                  </div>
                </div>

                <SignOutButton redirectUrl="/sign-in?from=logout">
                  <button
                    type="button"
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-purple-50 hover:text-purple-600"
                  >
                    <LogOut className="h-4 w-4 text-slate-400" />
                    <span>Log out</span>
                  </button>
                </SignOutButton>
              </div>
            </aside>
          </div>
        )}

        {/* ─── CHAT HISTORY SLIDE-OVER PANEL ─────────────── */}
        <ChatHistoryPanel
          isOpen={isChatHistoryOpen}
          onClose={() => setIsChatHistoryOpen(false)}
        />

        {/* ─── MAIN CONTAINER ────────────────────────────── */}
        <main className="flex-1 w-full bg-[#fbfbf9]">{children}</main>
      </div>
    </DashboardThemeProvider>
  );
}
