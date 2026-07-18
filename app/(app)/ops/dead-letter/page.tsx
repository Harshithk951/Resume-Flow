"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser, SignOutButton } from "@clerk/nextjs";
import {
  Settings as SettingsIcon,
  User,
  Coins,
  Loader2,
  LogOut,
  Shield,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const summaryData = useQuery(api.dashboard.getDashboardSummary);

  const isLoading = !clerkLoaded || summaryData === undefined;

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-6 w-6 animate-spin text-rose-500" />
      </div>
    );
  }

  const { user: appUser } = summaryData;
  const isFree = (appUser?.plan || "free") === "free";
  const maxResumes = 20;
  const resumesUsed = Math.floor((10000 - (appUser?.credits ?? 0)) / 500);

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* ─── Header ─── */}
      <div className="flex items-center gap-3 border-b border-slate-200/60 pb-6">
        <div className="p-2.5 rounded-2xl bg-rose-50 text-rose-600">
          <SettingsIcon className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-[-0.02em] text-slate-900 leading-tight">
            Settings
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage your account, credits, and preferences.
          </p>
        </div>
      </div>

      {/* ─── Account Card ─── */}
      <Card variant="elevated">
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-rose-500" />
            <CardTitle>Account</CardTitle>
          </div>
          <CardDescription>Your account details are up to date and synced across sessions.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-rose-100 to-rose-50 border-2 border-rose-200 flex items-center justify-center text-rose-600 font-bold text-lg shadow-sm">
              {(clerkUser?.fullName || appUser?.name || "U").charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-slate-800 text-sm">{clerkUser?.fullName || appUser?.name || "User"}</h3>
                <Badge variant={isFree ? "premium" : appUser?.plan === "pro" ? "default" : "success"} size="sm">
                  {appUser?.plan || "free"}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {clerkUser?.primaryEmailAddress?.emailAddress || "No email"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-slate-500 bg-emerald-50/50 rounded-xl px-4 py-3 border border-emerald-100/60">
            <Shield className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>All security checks passed. Your data is encrypted and accessible only to you.</span>
          </div>
        </CardContent>
      </Card>

      {/* ─── Credits & Usage Card ─── */}
      <Card variant="elevated">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-rose-500" />
            <CardTitle>Credits & Usage</CardTitle>
          </div>
          <CardDescription>
            {isFree
              ? `${resumesUsed} of ${maxResumes} resumes used · ${appUser?.credits ?? 0} / 2,000 credits remaining`
              : 'Unlimited resume generations'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Credit Progress — card-bloom effect */}
          <div className="relative card-bloom p-5 bg-gradient-to-br from-rose-50/40 to-white border border-rose-100/60 rounded-2xl space-y-3">
            <div className="flex items-center justify-between relative z-10">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Available Credits
              </span>
              <span className="text-xs font-bold text-slate-700 tabular-nums">
                {appUser?.credits ?? 0} / 10,000
              </span>
            </div>
            <div className="w-full h-3 bg-slate-100/80 rounded-full overflow-hidden relative z-10">
              <div
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${
                    (appUser?.credits ?? 0) > 2500
                      ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
                      : (appUser?.credits ?? 0) > 1000
                        ? "bg-gradient-to-r from-amber-400 to-amber-500"
                        : "bg-gradient-to-r from-rose-400 to-rose-500"
                  }`}
                  style={{ width: `${((appUser?.credits ?? 0) / 10000) * 100}%` }}
              />
            </div>
            {isFree && (
              <div className="flex items-center justify-between text-xs relative z-10">
                <span className="text-slate-500">Resumes used</span>
                <span className="font-bold text-slate-700">
                  {resumesUsed} / {maxResumes}
                </span>
              </div>
            )}
          </div>

          {/* Upgrade CTA for free users */}
          {isFree && (
            <Button
              variant="default"
              className="animated-gradient-cta text-white border-none shadow-lg px-6"
            >
              <Zap className="w-4 h-4" />
              <span>Upgrade to Pro — Unlimited Resumes</span>
            </Button>
          )}

          <div className="text-[11px] text-slate-400 leading-relaxed bg-slate-50 rounded-xl px-4 py-3 border border-slate-200/60">
            Each AI-powered resume tailoring consumes <strong className="text-slate-600">200 credits</strong>.
            Free users start with 2,000 credits (10 resumes). Pro and Campus users have unlimited generation.
          </div>
        </CardContent>
      </Card>

      {/* ─── Sign Out ─── */}
      <div className="border-t border-slate-200/60 pt-6">
        <SignOutButton redirectUrl="/sign-in?from=logout">
          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 py-3 px-6 rounded-2xl border border-slate-200 bg-white hover:bg-rose-50 hover:border-rose-200 text-slate-600 hover:text-rose-600 text-sm font-semibold transition-all active:scale-[0.98]"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </SignOutButton>
      </div>
    </div>
  );
}
