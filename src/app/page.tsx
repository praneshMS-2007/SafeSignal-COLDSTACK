"use client";

import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import { useEffect, useState } from "react";

interface TriageStats {
  psifCount: number;
  reviewCount: number;
  capacityCount: number;
  mtbfTrend: { days: number; barrier: string };
}

export default function HomePage() {
  const [stats, setStats] = useState<TriageStats | null>(null);

  useEffect(() => {
    fetch("/api/triage")
      .then((r) => r.json())
      .then((data) => setStats(data.stats))
      .catch(() => {});

    // Register service worker for offline support
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").then((reg) => {
        console.log("SW registered:", reg.scope);
      }).catch((err) => {
        console.log("SW registration failed:", err);
      });

      // When back online, sync queued reports
      window.addEventListener("online", () => {
        navigator.serviceWorker.controller?.postMessage({ type: "SYNC_OFFLINE_REPORTS" });
      });
    }
  }, []);

  return (
    <AppLayout>
      <div className="p-4 md:p-12 max-w-7xl mx-auto w-full">
        {/* Hero */}
        <header className="mb-10">
          <h1 className="text-display-lg text-primary mb-2">SafeSignal</h1>
          <p className="text-body-lg text-on-surface-variant">
            AI-powered SIF precursor detection for Oil India Limited
          </p>
        </header>

        {/* Quick Actions */}
        <section className="mb-10">
          <h2 className="text-title-md font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/report"
              className="bg-primary-container text-on-primary border-2 border-primary rounded-lg p-6 flex flex-col items-center gap-3 min-h-[140px] justify-center hover:bg-surface-tint transition-colors active:scale-95"
            >
              <span className="material-symbols-outlined text-4xl">add_circle</span>
              <span className="text-title-md font-semibold">Report a Hazard</span>
            </Link>
            <Link
              href="/triage"
              className="bg-surface border-2 border-outline-variant rounded-lg p-6 flex flex-col items-center gap-3 min-h-[140px] justify-center hover:bg-surface-container transition-colors active:scale-95 status-critical"
            >
              <span className="material-symbols-outlined text-4xl text-error">fact_check</span>
              <span className="text-title-md font-semibold">Triage Queue</span>
              {stats && (
                <span className="text-label-caps text-error">{stats.psifCount} CRITICAL</span>
              )}
            </Link>
            <Link
              href="/barriers"
              className="bg-surface border-2 border-outline-variant rounded-lg p-6 flex flex-col items-center gap-3 min-h-[140px] justify-center hover:bg-surface-container transition-colors active:scale-95"
            >
              <span className="material-symbols-outlined text-4xl text-secondary">health_and_safety</span>
              <span className="text-title-md font-semibold">Barrier Health</span>
            </Link>
            <Link
              href="/tickets"
              className="bg-surface border-2 border-outline-variant rounded-lg p-6 flex flex-col items-center gap-3 min-h-[140px] justify-center hover:bg-surface-container transition-colors active:scale-95"
            >
              <span className="material-symbols-outlined text-4xl text-on-surface-variant">confirmation_number</span>
              <span className="text-title-md font-semibold">Repair Tickets</span>
            </Link>
          </div>
        </section>

        {/* Overview Stats */}
        {stats && (
          <section>
            <h2 className="text-title-md font-semibold mb-4">Today&apos;s Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-surface rounded-lg p-6 border-2 border-outline-variant status-critical flex flex-col justify-between min-h-[120px]">
                <div className="flex justify-between items-start">
                  <span className="text-label-caps text-error">CRITICAL</span>
                  <span className="material-symbols-outlined text-error">warning</span>
                </div>
                <div className="mt-4">
                  <div className="text-headline-lg text-error">{stats.psifCount}</div>
                  <div className="text-body-md text-on-surface-variant">PSIF today</div>
                </div>
              </div>

              <div className="bg-surface rounded-lg p-6 border-2 border-outline-variant status-warning flex flex-col justify-between min-h-[120px]">
                <div className="flex justify-between items-start">
                  <span className="text-label-caps text-orange-600">ACTION REQUIRED</span>
                  <span className="material-symbols-outlined text-orange-500">pending_actions</span>
                </div>
                <div className="mt-4">
                  <div className="text-headline-lg text-orange-600">{stats.reviewCount}</div>
                  <div className="text-body-md text-on-surface-variant">Needs review</div>
                </div>
              </div>

              <div className="bg-surface rounded-lg p-6 border-2 border-outline-variant status-good flex flex-col justify-between min-h-[120px]">
                <div className="flex justify-between items-start">
                  <span className="text-label-caps text-emerald-600">NORMAL</span>
                  <span className="material-symbols-outlined text-emerald-600">check_circle</span>
                </div>
                <div className="mt-4">
                  <div className="text-headline-lg text-emerald-600">{stats.capacityCount}</div>
                  <div className="text-body-md text-on-surface-variant">Capacity events</div>
                </div>
              </div>

              <div className="bg-surface rounded-lg p-6 border-2 border-outline-variant status-warning flex flex-col justify-between min-h-[120px]">
                <div className="flex justify-between items-start">
                  <span className="text-label-caps text-orange-600">TREND</span>
                  <span className="material-symbols-outlined text-orange-500">trending_down</span>
                </div>
                <div className="mt-4">
                  <div className="text-headline-lg text-orange-600">{stats.mtbfTrend.days} days</div>
                  <div className="text-body-md text-on-surface-variant">{stats.mtbfTrend.barrier} MTBF</div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* System info */}
        <section className="mt-10 bg-surface-container-low rounded-lg p-6 border-2 border-outline-variant">
          <h2 className="text-title-md font-semibold mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">memory</span>
            System Classification Logic
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-outline-variant">
                  <th className="p-3 text-label-caps text-on-surface-variant">ENERGY?</th>
                  <th className="p-3 text-label-caps text-on-surface-variant">HURT?</th>
                  <th className="p-3 text-label-caps text-on-surface-variant">BARRIER?</th>
                  <th className="p-3 text-label-caps text-on-surface-variant">VERDICT</th>
                </tr>
              </thead>
              <tbody className="text-body-md divide-y-2 divide-surface-container-highest">
                <tr className="hover:bg-surface-container-low">
                  <td className="p-3">Yes</td><td className="p-3">Yes</td><td className="p-3">No</td>
                  <td className="p-3"><span className="px-2 py-1 rounded bg-error-container text-on-error-container text-label-caps">PSIF — Priority 1</span></td>
                </tr>
                <tr className="hover:bg-surface-container-low">
                  <td className="p-3">Yes</td><td className="p-3">No</td><td className="p-3">No</td>
                  <td className="p-3"><span className="px-2 py-1 rounded bg-error-container text-on-error-container text-label-caps">PSIF — Priority 1</span></td>
                </tr>
                <tr className="hover:bg-surface-container-low">
                  <td className="p-3">Yes</td><td className="p-3">Yes</td><td className="p-3">Yes</td>
                  <td className="p-3"><span className="px-2 py-1 rounded bg-orange-100 text-orange-800 text-label-caps">SIF</span></td>
                </tr>
                <tr className="hover:bg-surface-container-low">
                  <td className="p-3">Any</td><td className="p-3">Any</td><td className="p-3">Unknown</td>
                  <td className="p-3"><span className="px-2 py-1 rounded bg-amber-100 text-amber-800 text-label-caps">ESCALATE — ask 1Q</span></td>
                </tr>
                <tr className="hover:bg-surface-container-low">
                  <td className="p-3">Yes</td><td className="p-3">No</td><td className="p-3">Yes</td>
                  <td className="p-3"><span className="px-2 py-1 rounded bg-emerald-100 text-emerald-800 text-label-caps">CAPACITY — barrier held</span></td>
                </tr>
                <tr className="hover:bg-surface-container-low">
                  <td className="p-3">No</td><td className="p-3">Any</td><td className="p-3">Any</td>
                  <td className="p-3"><span className="px-2 py-1 rounded bg-surface-container-high text-on-surface-variant text-label-caps">ROUTINE</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
