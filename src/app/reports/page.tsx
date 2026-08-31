"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

interface Report {
  id: string;
  rawText: string;
  status: string;
  createdAt: string;
  site: string | null;
  classification: {
    classification: string;
    priority: number;
    iogpRule: string | null;
    barrierRequired: string | null;
  } | null;
}

const TIMELINE_STEPS = ["PENDING", "TRIAGED", "ASSIGNED", "FIXED", "VERIFIED_CLOSED"];
const TIMELINE_LABELS = ["Reported", "Triaged", "Repair Assigned", "Fixed", "Verified Closed"];

export default function MyReportsPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [filter, setFilter] = useState<"all" | "open" | "fixed">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const url =
      user?.role === "employee" ? `/api/reports?userId=${user.id}` : "/api/reports";
    fetch(url)
      .then((r) => r.json())
      .then((data) => (Array.isArray(data) ? setReports(data) : setReports([])))
      .catch((err) => console.error("Error loading reports:", err))
      .finally(() => setLoading(false));
  }, [user]);

  const openCount = reports.filter((r) =>
    ["PENDING", "TRIAGED", "ASSIGNED"].includes(r.status)
  ).length;
  const fixedCount = reports.filter((r) =>
    ["FIXED", "VERIFIED_CLOSED"].includes(r.status)
  ).length;

  const filtered = reports.filter((r) => {
    const matchesFilter =
      filter === "all"
        ? true
        : filter === "open"
        ? ["PENDING", "TRIAGED", "ASSIGNED"].includes(r.status)
        : ["FIXED", "VERIFIED_CLOSED"].includes(r.status);

    const matchesSearch =
      r.rawText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.site && r.site.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.classification?.iogpRule &&
        r.classification.iogpRule.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full flex flex-col gap-6 bg-[#F8FAFC] min-h-screen">
        {/* ─── PAGE HEADER & ACTIONS ───────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              {user?.role === "employee" ? "MY FIELD OBSERVATIONS" : "ENTERPRISE AUDIT TRAIL"}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              Safety Reports &amp; Lifecycle
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Complete closed-loop verification timeline from frontline report to permanent closure.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/report"
              className="h-10 px-5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md shadow-blue-600/20 transition-all active:scale-95"
            >
              <span>+ Log New Hazard</span>
            </Link>
          </div>
        </div>

        {/* ─── 3 SUMMARY STAT CARDS ────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div
            onClick={() => setFilter("all")}
            className={`bg-white border rounded-2xl p-5 shadow-xs cursor-pointer transition-all ${
              filter === "all" ? "border-blue-500 ring-2 ring-blue-100" : "border-[#E2E8F0] hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Total Submissions
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-[#0F172A] tracking-tight">
                {reports.length}
              </div>
              <div className="text-[11px] font-semibold text-blue-600 mt-1">
                Recorded in database
              </div>
            </div>
          </div>

          <div
            onClick={() => setFilter("open")}
            className={`bg-white border rounded-2xl p-5 shadow-xs cursor-pointer transition-all ${
              filter === "open" ? "border-amber-500 ring-2 ring-amber-100" : "border-[#E2E8F0] hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Active / In-Progress
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shrink-0">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-[#0F172A] tracking-tight">
                {openCount}
              </div>
              <div className="text-[11px] font-semibold text-amber-600 mt-1">
                Pending triage or repair
              </div>
            </div>
          </div>

          <div
            onClick={() => setFilter("fixed")}
            className={`bg-white border rounded-2xl p-5 shadow-xs cursor-pointer transition-all ${
              filter === "fixed" ? "border-emerald-500 ring-2 ring-emerald-100" : "border-[#E2E8F0] hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Repaired &amp; Verified
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-[#0F172A] tracking-tight">
                {fixedCount}
              </div>
              <div className="text-[11px] font-semibold text-emerald-600 mt-1">
                Hazard permanently removed
              </div>
            </div>
          </div>
        </div>

        {/* ─── MAIN REPORT CATALOG ─────────────────────────────── */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            {/* Filter Bar */}
            <div className="p-5 border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#0F172A] mr-2">Report Stream</h2>
                <div className="flex bg-[#F1F5F9] p-1 rounded-xl border border-slate-200">
                  {(["all", "open", "fixed"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                        filter === f
                          ? "bg-white text-[#2563EB] shadow-xs"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {f === "all" ? "All Submissions" : f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative w-full sm:w-64">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search observation text..."
                  className="w-full h-9 pl-9 pr-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-[#2563EB] focus:outline-none"
                />
              </div>
            </div>

            {/* List */}
            <div className="divide-y divide-[#F1F5F9]">
              {loading ? (
                <div className="p-12 text-center text-slate-400 text-xs">
                  Loading safety reports...
                </div>
              ) : filtered.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs">
                  No reports found matching this criteria.
                </div>
              ) : (
                filtered.map((r) => {
                  const isExpanded = expandedId === r.id;
                  const currentStepIdx = TIMELINE_STEPS.indexOf(r.status);
                  const isPsif =
                    r.classification?.classification === "PSIF" ||
                    r.classification?.classification === "SIF";

                  return (
                    <div
                      key={r.id}
                      className="p-5 hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : r.id)}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                isPsif
                                  ? "bg-red-50 text-red-700 border border-red-200"
                                  : "bg-blue-50 text-blue-700 border border-blue-200"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isPsif ? "bg-red-600" : "bg-blue-600"
                                }`}
                              ></span>
                              {r.classification?.classification || "ROUTINE"}
                            </span>

                            <span className="text-xs font-semibold text-slate-500">
                              {r.site || "Rig 4"}
                            </span>

                            {r.classification?.iogpRule && (
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] font-semibold">
                                {r.classification.iogpRule}
                              </span>
                            )}
                          </div>

                          <h3 className="text-sm font-bold text-[#0F172A] leading-snug">
                            {r.rawText}
                          </h3>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${
                              r.status === "VERIFIED_CLOSED"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : r.status === "FIXED"
                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            {r.status.replace("_", " ")}
                          </span>

                          <Link
                            href={`/reports/${r.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="h-8 px-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold inline-flex items-center gap-1 shadow-xs"
                          >
                            Analysis →
                          </Link>
                        </div>
                      </div>

                      {/* Expandable 5-Step Lifecycle Timeline */}
                      {isExpanded && (
                        <div className="mt-5 pt-5 border-t border-slate-200 animate-in fade-in slide-in-from-top-1">
                          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">
                            Verification Lifecycle Progress
                          </div>
                          <div className="flex items-center justify-between relative">
                            <div className="absolute top-3 left-0 right-0 h-0.5 bg-slate-200 z-0"></div>
                            {TIMELINE_STEPS.map((step, idx) => {
                              const isCompleted = idx <= currentStepIdx;
                              const isCurrent = idx === currentStepIdx;

                              return (
                                <div
                                  key={step}
                                  className="flex flex-col items-center relative z-10 text-center"
                                >
                                  <div
                                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                                      isCompleted
                                        ? "bg-[#2563EB] text-white ring-4 ring-blue-100"
                                        : "bg-white border-2 border-slate-300 text-slate-400"
                                    }`}
                                  >
                                    {isCompleted ? "✓" : idx + 1}
                                  </div>
                                  <span
                                    className={`text-[10px] mt-1.5 max-w-[70px] ${
                                      isCurrent
                                        ? "font-bold text-[#2563EB]"
                                        : isCompleted
                                        ? "font-semibold text-slate-800"
                                        : "text-slate-400"
                                    }`}
                                  >
                                    {TIMELINE_LABELS[idx]}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Table Footer */}
          <div className="p-4 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-slate-500 bg-[#F8FAFC]/50">
            <div>Showing {filtered.length} of {reports.length} reports</div>
            <div className="flex items-center gap-1">
              <button disabled className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center disabled:opacity-40">
                ‹
              </button>
              <span className="px-2 font-bold text-slate-700">1 / 1</span>
              <button disabled className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center disabled:opacity-40">
                ›
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
