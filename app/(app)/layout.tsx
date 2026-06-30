"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { SignOutButton, UserButton, useAuth, useUser } from "@clerk/nextjs";
import { LayoutDashboard, User, FileText, LogOut, Loader2, Settings } from "lucide-react";
import { AppBackButton } from "@/components/AppBackButton";
import { BrandLogo } from "@/components/BrandLogo";

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
    name: "Operations",
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
  const showBack = pathname !== "/dashboard";

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-6 w-6 animate-spin text-rose-500" />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900">
      <aside className="w-64 border-r border-slate-200/80 bg-slate-100/40 flex flex-col justify-between p-6 backdrop-blur-md shrink-0">
        <div className="space-y-8">
          <BrandLogo href="/dashboard" size="sm" className="px-2" />

          <nav className="space-y-1.5">
            {navigationItems.map((item) => {
              const isActive = item.isActive(pathname ?? "");
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-white text-rose-600 shadow-sm border border-slate-200/40 font-semibold"
                      : "text-slate-600 hover:bg-slate-200/50 hover:text-slate-900"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 ${isActive ? "text-rose-600" : "text-slate-400"}`}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="space-y-3 border-t border-slate-200/60 pt-4 px-2">
          <div className="flex items-center space-x-3">
            <UserButton />
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-slate-700 truncate">
                {user?.fullName || "Placement Sync"}
              </span>
            </div>
          </div>

          <SignOutButton redirectUrl="/sign-in?from=logout">
            <button
              type="button"
              className="flex w-full items-center space-x-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-rose-50 hover:text-rose-600"
            >
              <LogOut className="h-4 w-4 text-slate-400" />
              <span>Log out</span>
            </button>
          </SignOutButton>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="h-14 border-b border-slate-200/60 bg-white flex items-center justify-between px-6 md:px-8 shadow-sm shadow-slate-100/40 shrink-0">
          <div className="flex items-center gap-3">
            {showBack && (
              <AppBackButton
                fallbackHref="/dashboard"
                label={getBackLabel(pathname ?? "")}
              />
            )}
          </div>
          <div className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200/40">
            Active Session Verified
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-6 md:p-8 focus:outline-none">
          {children}
        </div>
      </main>
    </div>
  );
}
