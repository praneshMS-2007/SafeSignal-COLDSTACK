"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";

interface BarrierData {
  barrierName: string;
  mtbfDays: number;
  lastQuarterMtbf: number | null;
  trend: string;
  icon: string | null;
}

interface SiteData {
  name: string;
  precursorRate: number;
}

const LIFE_SAVING_RULES = [
  { name: "Driving", icon: "directions_car", category: "Transport" },
  { name: "Confined Space", icon: "architecture", category: "Enclosed" },
  { name: "Energy Isolation", icon: "electrical_services", category: "Electrical/Pressure" },
  { name: "Work Authorisation", icon: "gavel", category: "Permits" },
  { name: "Ground Disturbance", icon: "landscape", category: "Excavation" },
  { name: "Hot Work", icon: "local_fire_department", category: "Thermal" },
  { name: "Line of Fire", icon: "alt_route", category: "Kinetic" },
  { name: "Lifting", icon: "type_specimen", category: "Mechanical" },
  { name: "Working at Height", icon: "height", category: "Gravity" },
];

export default function BarriersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [barriers, setBarriers] = useState<BarrierData[]>([]);
  const [sites, setSites] = useState<SiteData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role === "employee") {
      router.replace("/");
      return;
    }

    fetch("/api/barriers")
      .then((r) => r.json())
      .then((data) => {
        setBarriers(data.barriers || []);
        setSites(data.sites || []);
      })
      .catch((err) => console.error("Error loading barriers:", err))
      .finally(() => setLoading(false));
  }, [user, router]);

  const totalMonitored = barriers.length;
  const decliningCount = barriers.filter((b) => b.trend === "DECLINING").length;
  const improvingCount = barriers.filter((b) => b.trend === "IMPROVING").length;

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full flex flex-col gap-6 bg-[#F8FAFC] min-h-screen">
        {/* ─── PAGE HEADER & ACTIONS ───────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              OIL INDIA LIMITED · DEFENSE METRICS &amp; MTBF
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              Barrier Health &amp; MTBF Degradation
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Tracking Mean Time Between Failures (MTBF) across critical physical and operational barriers.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/tickets"
              className="h-10 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-xs transition-colors"
            >
              <span>View Repair Tickets</span>
            </Link>

            <Link
              href="/report"
              className="h-10 px-5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md shadow-blue-600/20 transition-all active:scale-95"
            >
              <span>+ Log Barrier Defect</span>
            </Link>
          </div>
        </div>

        {/* ─── 4 METRIC / KPI STAT CARDS (Template Match) ──────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Declining Barriers */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Declining Barriers
              </span>
              <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100 shrink-0">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-[#0F172A] tracking-tight">
                {decliningCount}
              </div>
              <div className="text-[11px] font-semibold text-red-600 mt-1">
                Shortening MTBF · High repeat failure risk
              </div>
            </div>
          </div>

          {/* Card 2: Improving Barriers */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Improving Health
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-[#0F172A] tracking-tight">
                {improvingCount}
              </div>
              <div className="text-[11px] font-semibold text-emerald-600 mt-1">
                Lengthening MTBF · Verified effective
              </div>
            </div>
          </div>

          {/* Card 3: Monitored Control Systems */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Monitored Barriers
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-[#0F172A] tracking-tight">
                {totalMonitored}
              </div>
              <div className="text-[11px] font-semibold text-blue-600 mt-1">
                Live integrity calculations
              </div>
            </div>
          </div>

          {/* Card 4: Top Precursor Site */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Highest Precursor Site
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shrink-0">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-[#0F172A] tracking-tight">
                12.4%
              </div>
              <div className="text-[11px] font-semibold text-amber-600 mt-1 truncate">
                Site Alpha (12.4 per 100 reports)
              </div>
            </div>
          </div>
        </div>

        {/* ─── TWO-COLUMN CONTENT AREA ─────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ─── LEFT: BARRIER HEALTH CATALOG (8 cols) ──────────── */}
          <div className="lg:col-span-8 bg-white border border-[#E2E8F0] rounded-2xl shadow-xs overflow-hidden flex flex-col justify-between">
            <div>
              <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-[#0F172A]">Barrier Degradation Matrix</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Mean Time Between Failures calculated from operational near-miss and precursor signals.
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  LIVE DB
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">Barrier System</th>
                      <th className="py-3 px-4">Current MTBF</th>
                      <th className="py-3 px-4">Last Quarter</th>
                      <th className="py-3 px-4">Health Trend</th>
                      <th className="py-3 px-4 text-right">Integrity Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F5F9] text-slate-700">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-400">
                          Loading barrier metrics...
                        </td>
                      </tr>
                    ) : (
                      barriers.map((b) => {
                        const isDeclining = b.trend === "DECLINING";
                        const isImproving = b.trend === "IMPROVING";

                        return (
                          <tr key={b.barrierName} className="hover:bg-[#F8FAFC] transition-colors">
                            {/* Barrier Name */}
                            <td className="py-4 px-4 font-bold text-[#0F172A]">
                              <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-blue-600 text-base">
                                  {b.icon || "security"}
                                </span>
                                <span>{b.barrierName}</span>
                              </div>
                            </td>

                            {/* Current MTBF */}
                            <td className="py-4 px-4 font-extrabold text-sm text-[#0F172A]">
                              {b.mtbfDays} days
                            </td>

                            {/* Last Quarter */}
                            <td className="py-4 px-4 text-slate-500">
                              {b.lastQuarterMtbf ? `${b.lastQuarterMtbf} days` : "—"}
                            </td>

                            {/* Health Trend Badge */}
                            <td className="py-4 px-4">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                                  isDeclining
                                    ? "bg-red-50 text-red-700 border border-red-200"
                                    : isImproving
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : "bg-amber-50 text-amber-700 border border-amber-200"
                                }`}
                              >
                                <span>{isDeclining ? "↓ Declining" : isImproving ? "↑ Improving" : "→ Static"}</span>
                              </span>
                            </td>

                            {/* Integrity Status */}
                            <td className="py-4 px-4 text-right font-semibold">
                              <span
                                className={
                                  isDeclining
                                    ? "text-red-600 font-bold"
                                    : isImproving
                                    ? "text-emerald-600 font-bold"
                                    : "text-amber-600"
                                }
                              >
                                {isDeclining ? "Action Required" : isImproving ? "Robust" : "Monitoring"}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-4 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-slate-500 bg-[#F8FAFC]/50">
              <div>Showing {barriers.length} of {barriers.length} monitored barriers</div>
              <div className="font-semibold text-slate-700">Calculated by SafeSignal SCL Engine</div>
            </div>
          </div>

          {/* ─── RIGHT WIDGETS: SITES RANKING & RULES (4 cols) ─── */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Site Risk Ranking */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs">
              <h3 className="text-sm font-bold text-[#0F172A] mb-1">
                Site Precursor Rate Ranking
              </h3>
              <p className="text-xs text-slate-500 mb-3">
                Precursors per 100 reports (True precursor frequency).
              </p>

              <div className="flex flex-col gap-2">
                {sites.map((site, index) => (
                  <div
                    key={site.name}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-[10px]">
                        #{index + 1}
                      </span>
                      <span className="text-xs font-bold text-[#0F172A]">{site.name}</span>
                    </div>
                    <span
                      className={`text-xs font-bold font-mono px-2 py-0.5 rounded-md ${
                        site.precursorRate > 8
                          ? "bg-red-50 text-red-700"
                          : site.precursorRate > 4
                          ? "bg-amber-50 text-amber-700"
                          : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {site.precursorRate} / 100
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 9 Life-Saving Rules Quick Reference */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs">
              <h3 className="text-sm font-bold text-[#0F172A] mb-1">
                9 IOGP Life-Saving Rules
              </h3>
              <p className="text-xs text-slate-500 mb-3">
                Standardized life-safety controls.
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {LIFE_SAVING_RULES.map((r) => (
                  <div
                    key={r.name}
                    className="p-2 bg-slate-50 border border-slate-200 rounded-xl truncate font-semibold text-slate-700 flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                    <span className="truncate">{r.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
