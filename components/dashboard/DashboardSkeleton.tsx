"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-pulse">
      {/* Hero skeleton */}
      <div className="relative rounded-3xl p-8 overflow-hidden bg-[var(--color-surface-card)]/70 border border-[var(--color-hairline)]/40 h-36 flex items-center justify-between" />

      {/* 6 Stats grid skeletons */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="border-[var(--color-hairline)]/60 shadow-sm bg-[var(--color-canvas)]">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-2 flex-1 pr-4">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-8 w-12" />
                <Skeleton className="h-3 w-28" />
              </div>
              <Skeleton className="w-9 h-9 rounded-xl shrink-0" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          {/* Company Drives Table skeleton */}
          <Card className="border-[var(--color-hairline)]/60 shadow-sm bg-[var(--color-canvas)] overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--color-hairline)]/60 flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-8 w-44 rounded-xl" />
            </div>
            <CardContent className="p-0 divide-y divide-[var(--color-hairline-soft)]">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Skeleton className="w-10 h-10 rounded-xl" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4.5 w-24" />
                      <Skeleton className="h-3.5 w-32" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="w-8 h-8 rounded-lg" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Kanban Section skeleton */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton className="w-8 h-8 rounded-lg" />
              <Skeleton className="h-6 w-44" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="rounded-2xl border border-[var(--color-hairline)]/60 bg-[var(--color-surface-soft)]/20 p-4 min-h-[300px] space-y-4">
                  <div className="flex justify-between items-center px-1">
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-5 w-8 rounded-lg" />
                  </div>
                  <div className="space-y-3">
                    {[...Array(2)].map((_, j) => (
                      <Card key={j} className="border-[var(--color-hairline)]/60 shadow-sm bg-[var(--color-canvas)]">
                        <CardContent className="p-4 space-y-3">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1.5 flex-1 pr-2">
                              <Skeleton className="h-3 w-12" />
                              <Skeleton className="h-4 w-32" />
                            </div>
                            <Skeleton className="w-4 h-4 rounded" />
                          </div>
                          <div className="flex justify-between items-center">
                            <Skeleton className="h-3.5 w-16" />
                            <Skeleton className="w-4 h-4 rounded-full" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right rail widgets skeleton */}
        <div className="space-y-6">
          <Card className="border-[var(--color-hairline)]/60 shadow-sm bg-[var(--color-canvas)]">
            <div className="p-4 border-b border-[var(--color-hairline-soft)] flex items-center justify-between">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4.5 w-6 rounded-full" />
            </div>
            <CardContent className="p-4 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-3 items-center">
                  <Skeleton className="w-4.5 h-4.5 rounded-full shrink-0" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="border-[var(--color-hairline)]/60 shadow-sm bg-[var(--color-canvas)]">
            <div className="p-4 border-b border-[var(--color-hairline-soft)]">
              <Skeleton className="h-4 w-24" />
            </div>
            <CardContent className="p-4 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-3 items-center">
                  <Skeleton className="w-6 h-6 rounded-full shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-full" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
