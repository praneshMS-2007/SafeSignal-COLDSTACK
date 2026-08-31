"use client";

import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";

interface TriageStats {
  psifCount: number;
  reviewCount: number;
  capacityCount: number;
  mtbfTrend: { days: number; barrier: string };
}

interface ReportItem {
  id: string;
  rawText: string;
  site: string | null;
  timestamp: string | null;
  status: string;
  classification: {
    classification: string;
    priority: number;
    energyType: string | null;
    barrierRequired: string | null;
    barrierState: string | null;
    iogpRule: string | null;
  } | null;
}

export default function HomePage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<TriageStats | null>(null);
  const [recentReports, setRecentReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/triage").then((r) => r.json()),
      fetch("/api/reports").then((r) => r.json()),
    ])
      .then(([triageData, reportsData]) => {
        if (triageData.stats) setStats(triageData.stats);
        if (Array.isArray(reportsData)) setRecentReports(reportsData.slice(0, 6));
      })
      .catch((err) => console.error("Error loading dashboard:", err))
      .finally(() => setLoading(false));

    // Register service worker for offline support
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => console.log("SW active:", reg.scope))
        .catch((err) => console.log("SW register notice:", err));
    }
  }, []);

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full flex flex-col gap-6 bg-[#F8FAFC] min-h-screen">
        {/* ─── PAGE HEADER & ACTIONS ───────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              OIL INDIA LIMITED · OPERATIONS &amp; RISK CENTER
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              Safety Intelligence &amp; SIF Precursor Hub
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Real-time precursor detection, closed-loop barrier tracking, and zero-fatality defense.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/reports"
              className="h-10 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-xs transition-colors"
            >
              <svg className="w-4 h-4 text-slate-500 fill-current" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              <span>Export Audit</span>
            </Link>

            <Link
              href="/report"
              className="h-10 px-5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md shadow-blue-600/20 transition-all active:scale-95"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              <span>+ Report Hazard</span>
            </Link>
          </div>
        </div>

        {/* ─── 4 METRIC / KPI STAT CARDS (Template Match) ──────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Critical PSIF */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Fatal Precursors (PSIF)
              </span>
              <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100 shrink-0">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-[#0F172A] tracking-tight">
                {stats?.psifCount ?? 2}
              </div>
              <div className="text-[11px] font-semibold text-red-600 flex items-center gap-1 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                <span>Immediate Safety Officer Attention</span>
              </div>
            </div>
          </div>

          {/* Card 2: Human Review Needed */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Coach / Review Alerts
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shrink-0">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 10-1-1zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-[#0F172A] tracking-tight">
                {stats?.reviewCount ?? 1}
              </div>
              <div className="text-[11px] font-semibold text-amber-600 mt-1">
                Barrier state clarification required
              </div>
            </div>
          </div>

          {/* Card 3: Capacity Events */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Capacity / Defended
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-[#0F172A] tracking-tight">
                {stats?.capacityCount ?? 2}
              </div>
              <div className="text-[11px] font-semibold text-emerald-600 mt-1">
                Controls functioned as designed
              </div>
            </div>
          </div>

          {/* Card 4: Critical Barrier Health */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Critical Barrier MTBF
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-[#0F172A] tracking-tight">
                {stats?.mtbfTrend?.days ?? 9} Days
              </div>
              <div className="text-[11px] font-semibold text-blue-600 mt-1 truncate">
                {stats?.mtbfTrend?.barrier ?? "Energy isolation"} (Declining)
              </div>
            </div>
          </div>
        </div>

        {/* ─── TWO-COLUMN CONTENT AREA ─────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ─── LEFT: RECENT SAFETY OBSERVATIONS TABLE (8 cols) ─ */}
          <div className="lg:col-span-8 bg-white border border-[#E2E8F0] rounded-2xl shadow-xs overflow-hidden flex flex-col justify-between">
            <div>
              {/* Card Header */}
              <div className="p-5 border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-[#0F172A]">Live Precursor &amp; Incident Stream</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Field observations analyzed by SCL Energy &amp; Barrier decision tree.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href="/triage"
                    className="text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8] flex items-center gap-1 hover:underline"
                  >
                    View Triage Queue →
                  </Link>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">Observation / Transcript</th>
                      <th className="py-3 px-4">Site &amp; Time</th>
                      <th className="py-3 px-4">Life-Saving Rule</th>
                      <th className="py-3 px-4">Classification</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F5F9] text-slate-700">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-400">
                          Loading live safety telemetry...
                        </td>
                      </tr>
                    ) : recentReports.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-400">
                          No recent reports. Click &quot;+ Report Hazard&quot; to add one.
                        </td>
                      </tr>
                    ) : (
                      recentReports.map((r) => {
                        const isPsif =
                          r.classification?.classification === "PSIF" ||
                          r.classification?.classification === "SIF";
                        const isCapacity = r.classification?.classification === "CAPACITY";

                        return (
                          <tr key={r.id} className="hover:bg-[#F8FAFC] transition-colors">
                            {/* Transcript */}
                            <td className="py-3.5 px-4 font-medium text-[#0F172A] max-w-xs truncate">
                              <Link
                                href={`/reports/${r.id}`}
                                className="hover:text-[#2563EB] hover:underline"
                              >
                                {r.rawText}
                              </Link>
                            </td>

                            {/* Site */}
                            <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                              {r.site || "Rig 4"} · {r.timestamp || "Today"}
                            </td>

                            {/* IOGP Rule */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-semibold text-[10px]">
                                {r.classification?.iogpRule || "General Safety"}
                              </span>
                            </td>

                            {/* Classification Badge */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                                  isPsif
                                    ? "bg-red-50 text-red-700 border border-red-200"
                                    : isCapacity
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : "bg-blue-50 text-blue-700 border border-blue-200"
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    isPsif
                                      ? "bg-red-600"
                                      : isCapacity
                                      ? "bg-emerald-600"
                                      : "bg-blue-600"
                                  }`}
                                ></span>
                                {r.classification?.classification || "PENDING"}
                              </span>
                            </td>

                            {/* Review button */}
                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              <Link
                                href={`/reports/${r.id}`}
                                className="h-7 px-3 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-lg text-[11px] font-bold text-slate-700 inline-flex items-center gap-1 transition-colors"
                              >
                                <span>Inspect</span>
                              </Link>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Table Footer Pagination */}
            <div className="p-4 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-slate-500 bg-[#F8FAFC]/50">
              <div>Showing {recentReports.length} of {recentReports.length} records</div>
              <div className="flex items-center gap-1">
                <button
                  disabled
                  className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center disabled:opacity-40"
                >
                  ‹
                </button>
                <span className="px-2 font-bold text-slate-700">1 / 1</span>
                <button
                  disabled
                  className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center disabled:opacity-40"
                >
                  ›
                </button>
              </div>
            </div>
          </div>

          {/* ─── RIGHT WIDGETS (4 cols) ─────────────────────────── */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Widget 1: Critical Barrier Health */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600 text-lg">
                    shield
                  </span>
                  Critical Barrier Health
                </h3>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  LIVE DB
                </span>
              </div>

              <div className="flex flex-col gap-3 mt-4">
                {/* Energy Isolation */}
                <div className="p-3 bg-red-50/60 rounded-xl border border-red-100 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">Energy Isolation</div>
                    <div className="text-[10px] text-red-600 font-semibold">
                      MTBF: 9 days (Declining)
                    </div>
                  </div>
                  <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-md">
                    URGENT
                  </span>
                </div>

                {/* Work Authorisation */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">Work Authorisation</div>
                    <div className="text-[10px] text-slate-500">MTBF: 24 days (Static)</div>
                  </div>
                  <span className="text-xs font-bold text-slate-600 bg-slate-200 px-2 py-0.5 rounded-md">
                    WATCH
                  </span>
                </div>

                {/* Line of fire */}
                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">Line of Fire Controls</div>
                    <div className="text-[10px] text-emerald-600 font-semibold">
                      MTBF: 62 days (Improving)
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                    HEALTHY
                  </span>
                </div>
              </div>

              <Link
                href="/barriers"
                className="mt-4 block text-center py-2 bg-[#F8FAFC] hover:bg-slate-100 text-xs font-bold text-[#2563EB] rounded-xl transition-colors border border-slate-200"
              >
                View Full Barrier Matrix →
              </Link>
            </div>

            {/* Widget 2: 9 IOGP Life-Saving Rules */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs">
              <h3 className="text-sm font-bold text-[#0F172A] mb-1">
                9 IOGP Life-Saving Rules
              </h3>
              <p className="text-xs text-slate-500 mb-3">
                Automated mapping to international oil &amp; gas standards.
              </p>

              <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold text-slate-700">
                <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl truncate">
                  ⚡ Isolation
                </div>
                <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl truncate">
                  🪖 Height
                </div>
                <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl truncate">
                  🔒 Confined
                </div>
                <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl truncate">
                  📜 Permit
                </div>
                <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl truncate">
                  🏗️ Lifting
                </div>
                <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl truncate">
                  🎯 Line of Fire
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
