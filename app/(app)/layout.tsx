"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { SignOutButton, UserButton, useAuth, useUser } from "@clerk/nextjs";
import { LayoutDashboard, User, FileText, LogOut, Loader2, Settings, Menu, X, History } from "lucide-react";
import { AppBackButton } from "@/components/AppBackButton";
import { BrandLogo } from "@/components/BrandLogo";
import { ChatHistoryPanel } from "@/components/ChatHistoryPanel";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DashboardThemeProvider } from "@/components/DashboardThemeProvider";

const navigationItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    isActive: (pathname: string) => pathname === "/dashboard",
  },
  {
    name: "Master Profile",
    href: "/resume/builder",
    icon: User,
    isActive: (pathname: string) => pathname === "/resume/builder",
  },
  {
    name: "Templates",
    href: "/templates",
    icon: FileText,
    isActive: (pathname: string) => pathname === "/templates",
  },
  {
    name: "Settings",
    href: "/ops/dead-letter",
    icon: Settings,
    isActive: (pathname: string) => pathname.startsWith("/ops"),
  },
];

function getBackLabel(pathname: string): string {
  if (pathname.startsWith("/company/")) return "Dashboard";
  if (pathname === "/profile") return "Dashboard";
  if (pathname === "/resume/builder") return "Dashboard";
  if (pathname === "/templates") return "Dashboard";
  return "Back";
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
  const showBack = pathname !== "/dashboard";

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[var(--color-surface-soft)]">
        <Loader2 className="h-6 w-6 animate-spin text-rose-500" />
      </div>
    );
  }

  return (
    <DashboardThemeProvider>
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--color-surface-soft)] text-[var(--color-ink)]">
      {/* ─── COLLAPSIBLE SIDEBAR ───────────────────────
           Pure CSS hover mechanism: collapsed w-[72px] by default,
           expands to w-64 on hover. All labels fade in with opacity.
           Uses group/sidebar naming for scoped hover children. */}
      <aside className="group/sidebar relative z-10 hidden md:flex w-[72px] hover:w-64 border-r border-white/40 glass-panel flex flex-col justify-between py-6 shrink-0 transition-all duration-500"
        style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
      >
        <div className="space-y-8 overflow-hidden">
          {/* Brand — always shows icon, text appears on hover */}
          <BrandLogo
            href="/dashboard"
            size="sm"
            showText={false}
            className="px-4"
          />
          {/* Hover label for brand name */}
          <span className="absolute top-[22px] left-14 text-xs font-bold text-[var(--color-ash)] whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-all duration-500 delay-200 pointer-events-none"
            style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
          >
            ResumeFlow
          </span>

          <nav className="space-y-1.5 px-2" aria-label="Main navigation">
            {navigationItems.map((item) => {
              const isActive = item.isActive(pathname ?? "");
              const Icon = item.icon;
              const isSettings = item.name === "Settings";
              
              return (
                <div key={item.name} className="space-y-1.5">
                  {isSettings && (
                    <button
                      type="button"
                      onClick={() => setIsChatHistoryOpen(true)}
                      title="Chat History"
                      className="group/nav relative flex items-center gap-3 px-3 py-3 rounded-2xl text-sm font-medium transition-all duration-300 text-[var(--color-mute)] hover:bg-white/60 hover:text-[var(--color-ink)] w-full"
                      style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
                    >
                      <div className="relative flex items-center justify-center w-5 h-5 shrink-0">
                        <History className="h-4 w-4 transition-all duration-300 group-hover/nav:scale-110 text-[var(--color-stone)] group-hover/nav:text-[var(--color-mute)]" style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }} />
                      </div>
                      <span className="whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-all duration-500 delay-100" style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}>
                        Chat History
                      </span>
                    </button>
                  )}
                  <Link
                    href={item.href}
                    title={item.name}
                    aria-current={isActive ? "page" : undefined}
                    className={`group/nav relative flex items-center gap-3 px-3 py-3 rounded-2xl text-sm font-medium transition-all duration-300 ${
                      isActive
                        ? "bg-[var(--color-canvas)] text-rose-600 shadow-[0_2px_12px_-2px_rgba(225,29,72,0.08)] border border-rose-100/60 font-semibold"
                        : "text-[var(--color-mute)] hover:bg-white/60 hover:text-[var(--color-ink)]"
                    }`}
                    style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
                  >
                    {isActive && (
                      <span className="nav-item-active-indicator" />
                    )}
                    <div className="relative flex items-center justify-center w-5 h-5 shrink-0">
                      <Icon
                        className={`h-4 w-4 transition-all duration-300 group-hover/nav:scale-110 ${
                          isActive ? "text-rose-600" : "text-[var(--color-stone)] group-hover/nav:text-[var(--color-mute)]"
                        }`}
                        style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
                      />
                      {/* Active dot below icon when collapsed */}
                      {isActive && (
                        <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-rose-500 group-hover/sidebar:hidden" />
                      )}
                    </div>
                    {/* Nav label — hidden on collapse, fades in on hover */}
                    <span className="whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-all duration-500 delay-100"
                      style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
                    >
                      {item.name}
                    </span>
                  </Link>
                </div>
              );
            })}
          </nav>
        </div>

        <div className="space-y-3 border-t border-[var(--color-hairline)]/60 pt-4 px-3 overflow-hidden">
          {/* ── Theme Toggle ── */}
          <ThemeToggle />

          <div className="flex items-center gap-3">
            <UserButton />
            <div className="flex flex-col min-w-0 opacity-0 group-hover/sidebar:opacity-100 transition-all duration-500 delay-100"
              style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
            >
              <span className="text-xs font-semibold text-[var(--color-charcoal)] truncate">
                {user?.fullName || "Placement Sync"}
              </span>
            </div>
          </div>

          <SignOutButton redirectUrl="/sign-in?from=logout">
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-[var(--color-mute)] transition-all duration-200 hover:bg-rose-50 hover:text-rose-600 active:scale-[0.98]"
            >
              <LogOut className="h-4 w-4 shrink-0 text-[var(--color-stone)]" />
              <span className="whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-all duration-500 delay-100"
                style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
              >
                Log out
              </span>
            </button>
          </SignOutButton>
        </div>
      </aside>

      {/* ─── MOBILE Navigation Drawer ────────────────── */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-[var(--color-surface-dark)]/40 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
            onClick={() => setIsMobileDrawerOpen(false)}
            aria-hidden="true"
          />
          {/* Drawer panel */}
          <aside
            className="relative w-64 max-w-xs bg-[var(--color-canvas)] border-r border-[var(--color-hairline)]/60 flex flex-col justify-between py-6 px-4 shadow-xl z-50 animate-in slide-in-from-left duration-300"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            onKeyDown={(e) => {
              if (e.key === "Escape") setIsMobileDrawerOpen(false);
            }}
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <BrandLogo href="/dashboard" size="sm" showText={true} />
                <button
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="p-1 rounded-lg hover:bg-[var(--color-surface-card)] text-[var(--color-ash)] transition-colors"
                  aria-label="Close navigation menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <nav className="space-y-1.5" aria-label="Mobile navigation">
                {navigationItems.map((item) => {
                  const isActive = item.isActive(pathname ?? "");
                  const Icon = item.icon;
                  const isSettings = item.name === "Settings";
                  
                  return (
                    <div key={item.name} className="space-y-1.5">
                      {isSettings && (
                        <button
                          type="button"
                          onClick={() => { setIsChatHistoryOpen(true); setIsMobileDrawerOpen(false); }}
                          className="flex items-center gap-3 px-3 py-3 rounded-2xl text-sm font-medium transition-all duration-200 text-[var(--color-mute)] hover:bg-[var(--color-surface-soft)] hover:text-[var(--color-ink)] w-full"
                        >
                          <History className="h-4.5 w-4.5 text-[var(--color-stone)]" />
                          <span>Chat History</span>
                        </button>
                      )}
                      <Link
                        href={item.href}
                        onClick={() => setIsMobileDrawerOpen(false)}
                        aria-current={isActive ? "page" : undefined}
                        className={`flex items-center gap-3 px-3 py-3 rounded-2xl text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? "bg-rose-50 text-rose-600 border border-rose-100/60 font-semibold"
                            : "text-[var(--color-mute)] hover:bg-[var(--color-surface-soft)] hover:text-[var(--color-ink)]"
                        }`}
                      >
                        <Icon className={`h-4.5 w-4.5 ${isActive ? "text-rose-600" : "text-[var(--color-stone)]"}`} />
                        <span>{item.name}</span>
                      </Link>
                    </div>
                  );
                })}
              </nav>
            </div>

            <div className="space-y-4 border-t border-[var(--color-hairline)]/60 pt-4">
              {/* ── Theme Toggle (mobile) ── */}
              <ThemeToggle />
              
              <div className="flex items-center gap-3">
                <UserButton />
                <span className="text-xs font-semibold text-[var(--color-charcoal)] truncate">
                  {user?.fullName || "Placement Sync"}
                </span>
              </div>
              <SignOutButton redirectUrl="/sign-in?from=logout">
                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-[var(--color-mute)] transition-all hover:bg-rose-50 hover:text-rose-600"
                >
                  <LogOut className="h-4 w-4 text-[var(--color-stone)]" />
                  <span>Log out</span>
                </button>
              </SignOutButton>
            </div>
          </aside>
        </div>
      )}

      {/* Chat History slide-over panel */}
      <ChatHistoryPanel
        isOpen={isChatHistoryOpen}
        onClose={() => setIsChatHistoryOpen(false)}
      />

      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="h-14 border-b border-white/40 glass-panel flex items-center justify-between px-6 md:px-8 shadow-sm shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileDrawerOpen(true)}
              className="md:hidden p-2 -ml-2 rounded-lg hover:bg-[var(--color-surface-card)]/80 text-[var(--color-mute)] transition-colors"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            {showBack && (
              <AppBackButton
                fallbackHref="/dashboard"
                label={getBackLabel(pathname ?? "")}
              />
            )}
          </div>
          <div className="text-[10px] font-bold px-3 py-1.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100/60">
            Placement Active
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-6 md:p-8 focus:outline-none">
          {children}
        </div>
      </main>
    </div>
    </DashboardThemeProvider>
  );
}
