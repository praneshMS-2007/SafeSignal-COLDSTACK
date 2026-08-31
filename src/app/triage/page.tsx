"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";

interface TriageReport {
  id: string;
  rawText: string;
  site: string;
  createdAt: string;
  status: string;
  classification: {
    classification: string;
    priority: number;
    barrierRequired: string;
    barrierState: string;
    finalVerdict: string;
    iogpRule: string | null;
  } | null;
}

interface TriageStats {
  psifCount: number;
  reviewCount: number;
  capacityCount: number;
  mtbfTrend: { days: number; barrier: string };
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function TriagePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState<TriageReport[]>([]);
  const [stats, setStats] = useState<TriageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [siteFilter, setSiteFilter] = useState("ALL");

  useEffect(() => {
    if (user && user.role === "employee") {
      router.replace("/");
      return;
    }

    fetch("/api/triage")
      .then((r) => r.json())
      .then((data) => {
        setReports(data.reports || []);
        setStats(data.stats || null);
      })
      .catch((err) => console.error("Error loading triage:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleConfirm = async (id: string) => {
    await fetch(`/api/reports/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "ASSIGNED" }),
    });
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "ASSIGNED" } : r))
    );
  };

  const filteredReports = reports.filter((r) => {
    const cls = r.classification?.classification || "ROUTINE";
    const matchesFilter =
      filter === "ALL" ||
      (filter === "PSIF" && (cls === "PSIF" || cls === "SIF")) ||
      (filter === "CAPACITY" && cls === "CAPACITY") ||
      (filter === "REVIEW" && r.classification?.barrierState === "UNKNOWN");

    const matchesSite = siteFilter === "ALL" || r.site === siteFilter;
    const matchesSearch =
      r.rawText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.site && r.site.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.classification?.barrierRequired &&
        r.classification.barrierRequired.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesFilter && matchesSite && matchesSearch;
  });

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full flex flex-col gap-6 bg-[#F8FAFC] min-h-screen">
        {/* ─── PAGE HEADER & ACTIONS ───────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
              PRIORITY RISK ASSESSMENT &amp; HUMAN VERIFICATION
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              Precursor Triage Queue
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Observations ranked by fatal potential. Lethal energy + absent barrier = immediate PSIF stop-work.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/reports"
              className="h-10 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-xs transition-colors"
            >
              <span>Audit History</span>
            </Link>

            <Link
              href="/report"
              className="h-10 px-5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md shadow-blue-600/20 transition-all active:scale-95"
            >
              <span>+ Log Hazard</span>
            </Link>
          </div>
        </div>

        {/* ─── 4 KPI SUMMARY CARDS (Template Match) ────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total PSIF */}
          <div
            onClick={() => setFilter(filter === "PSIF" ? "ALL" : "PSIF")}
            className={`bg-white border rounded-2xl p-5 shadow-xs cursor-pointer transition-all ${
              filter === "PSIF" ? "border-red-500 ring-2 ring-red-100" : "border-[#E2E8F0] hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Critical PSIF Precursors
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
              <div className="text-[11px] font-semibold text-red-600 mt-1">
                Priority 1 · Immediate escalation
              </div>
            </div>
          </div>

          {/* Review Required */}
          <div
            onClick={() => setFilter(filter === "REVIEW" ? "ALL" : "REVIEW")}
            className={`bg-white border rounded-2xl p-5 shadow-xs cursor-pointer transition-all ${
              filter === "REVIEW" ? "border-amber-500 ring-2 ring-amber-100" : "border-[#E2E8F0] hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Needs Clarification
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
                One-question coach active
              </div>
            </div>
          </div>

          {/* Capacity Events */}
          <div
            onClick={() => setFilter(filter === "CAPACITY" ? "ALL" : "CAPACITY")}
            className={`bg-white border rounded-2xl p-5 shadow-xs cursor-pointer transition-all ${
              filter === "CAPACITY" ? "border-emerald-500 ring-2 ring-emerald-100" : "border-[#E2E8F0] hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Barrier Defended
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
                Capacity event verified
              </div>
            </div>
          </div>

          {/* Total In Queue */}
          <div
            onClick={() => setFilter("ALL")}
            className={`bg-white border rounded-2xl p-5 shadow-xs cursor-pointer transition-all ${
              filter === "ALL" ? "border-blue-500 ring-2 ring-blue-100" : "border-[#E2E8F0] hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Total Triaged Reports
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-[#0F172A] tracking-tight">
                {reports.length}
              </div>
              <div className="text-[11px] font-semibold text-blue-600 mt-1">
                Showing all active items
              </div>
            </div>
          </div>
        </div>

        {/* ─── MAIN CATALOG CARD (Template Match) ──────────────── */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            {/* Filter & Search Bar */}
            <div className="p-5 border-b border-[#E2E8F0] flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-[#0F172A] mr-2">Precursor Queue</h2>
                <div className="flex bg-[#F1F5F9] p-1 rounded-xl border border-slate-200">
                  {[
                    { key: "ALL", label: "All Items" },
                    { key: "PSIF", label: "Critical PSIF" },
                    { key: "REVIEW", label: "Needs Review" },
                    { key: "CAPACITY", label: "Capacity Safe" },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setFilter(tab.key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        filter === tab.key
                          ? "bg-white text-[#2563EB] shadow-xs"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Search */}
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
                    placeholder="Filter records..."
                    className="w-full h-9 pl-9 pr-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-[#2563EB] focus:outline-none"
                  />
                </div>

                {/* Site Dropdown */}
                <select
                  value={siteFilter}
                  onChange={(e) => setSiteFilter(e.target.value)}
                  className="h-9 px-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:border-[#2563EB] focus:outline-none"
                >
                  <option value="ALL">All Sites</option>
                  <option value="Rig 4">Rig 4</option>
                  <option value="Bay 3">Bay 3</option>
                  <option value="Rig 7">Rig 7</option>
                  <option value="Bay 1">Bay 1</option>
                  <option value="Platform 2">Platform 2</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Observation / Field Transcript</th>
                    <th className="py-3 px-4">Site Location</th>
                    <th className="py-3 px-4">Required Barrier</th>
                    <th className="py-3 px-4">Barrier State</th>
                    <th className="py-3 px-4">SIF Classification</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9] text-slate-700">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        Loading triage items...
                      </td>
                    </tr>
                  ) : filteredReports.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        No reports matching this filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredReports.map((r) => {
                      const isCritical =
                        r.classification?.classification === "PSIF" ||
                        r.classification?.classification === "SIF";
                      const isUnknown = r.classification?.barrierState === "UNKNOWN";
                      const isAssigned = r.status === "ASSIGNED";

                      return (
                        <tr key={r.id} className="hover:bg-[#F8FAFC] transition-colors">
                          {/* Transcript */}
                          <td className="py-3.5 px-4 font-medium text-[#0F172A] max-w-sm">
                            <Link
                              href={`/reports/${r.id}`}
                              className="hover:text-[#2563EB] hover:underline line-clamp-2"
                            >
                              {r.rawText}
                            </Link>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {timeAgo(r.createdAt)} · {r.classification?.iogpRule || "IOGP Rule"}
                            </div>
                          </td>

                          {/* Site */}
                          <td className="py-3.5 px-4 text-slate-600 font-semibold whitespace-nowrap">
                            {r.site || "Rig 4"}
                          </td>

                          {/* Barrier */}
                          <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                            {r.classification?.barrierRequired || "—"}
                          </td>

                          {/* Barrier State */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                                r.classification?.barrierState === "ABSENT"
                                  ? "bg-red-50 text-red-700 border border-red-200"
                                  : r.classification?.barrierState === "UNKNOWN"
                                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              }`}
                            >
                              {r.classification?.barrierState || "UNKNOWN"}
                            </span>
                          </td>

                          {/* SIF Potential Badge */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                isCritical
                                  ? "bg-red-50 text-red-700 border border-red-200"
                                  : isUnknown
                                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isCritical
                                    ? "bg-red-600 animate-pulse"
                                    : isUnknown
                                    ? "bg-amber-500"
                                    : "bg-emerald-500"
                                }`}
                              ></span>
                              {r.classification?.classification || "ROUTINE"}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2">
                              {!isAssigned && (
                                <button
                                  onClick={() => handleConfirm(r.id)}
                                  className="h-7 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-[11px] font-bold transition-colors"
                                >
                                  Confirm
                                </button>
                              )}
                              <Link
                                href={`/reports/${r.id}`}
                                className="h-7 px-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-bold transition-colors inline-flex items-center"
                              >
                                Inspect →
                              </Link>
                            </div>
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
            <div>
              Showing {filteredReports.length} of {reports.length} records
            </div>
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
      </div>
    </AppLayout>
  );
}
