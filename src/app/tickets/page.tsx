"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";

interface Ticket {
  id: string;
  barrier: string;
  failureMode: string | null;
  owner: string | null;
  site: string | null;
  status: string;
  watchDaysElapsed: number;
  watchDaysTotal: number;
  createdAt: string;
  report: {
    rawText: string;
    classification: { classification: string; priority: number } | null;
  };
}

export default function TicketsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (user && user.role === "employee") {
      router.replace("/");
      return;
    }

    fetch("/api/tickets")
      .then((r) => r.json())
      .then((data) => (Array.isArray(data) ? setTickets(data) : setTickets([])))
      .catch((err) => console.error("Error loading tickets:", err))
      .finally(() => setLoading(false));
  }, [user, router]);

  const openCount = tickets.filter((t) => t.status === "OPEN" || t.status === "ASSIGNED").length;
  const watchCount = tickets.filter((t) => t.status === "UNDER_WATCH" || t.status === "FIXED").length;
  const closedCount = tickets.filter((t) => t.status === "VERIFIED_CLOSED").length;

  const filteredTickets = tickets.filter((t) => {
    const matchesFilter = filter === "all" || t.status === filter;
    const matchesSearch =
      t.barrier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.site && t.site.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.owner && t.owner.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.report?.rawText && t.report.rawText.toLowerCase().includes(searchQuery.toLowerCase()));
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
              CLOSED-LOOP CORRECTIVE ACTION SYSTEM
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              Corrective Action &amp; Repair Tickets
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Track repairs from initial field report through the 30-day verification watch period to prevent recurring barrier failure.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/reports"
              className="h-10 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-xs transition-colors"
            >
              <span>View Source Reports</span>
            </Link>

            <Link
              href="/triage"
              className="h-10 px-5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md shadow-blue-600/20 transition-all active:scale-95"
            >
              <span>+ Create from Triage</span>
            </Link>
          </div>
        </div>

        {/* ─── 4 METRIC / KPI STAT CARDS (Template Match) ──────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Open Actions */}
          <div
            onClick={() => setFilter(filter === "OPEN" ? "all" : "OPEN")}
            className={`bg-white border rounded-2xl p-5 shadow-xs cursor-pointer transition-all ${
              filter === "OPEN" ? "border-red-500 ring-2 ring-red-100" : "border-[#E2E8F0] hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Open Repair Actions
              </span>
              <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100 shrink-0">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-[#0F172A] tracking-tight">
                {openCount}
              </div>
              <div className="text-[11px] font-semibold text-red-600 mt-1">
                Awaiting fix / crew assigned
              </div>
            </div>
          </div>

          {/* Card 2: Under 30-Day Watch */}
          <div
            onClick={() => setFilter(filter === "UNDER_WATCH" ? "all" : "UNDER_WATCH")}
            className={`bg-white border rounded-2xl p-5 shadow-xs cursor-pointer transition-all ${
              filter === "UNDER_WATCH" ? "border-amber-500 ring-2 ring-amber-100" : "border-[#E2E8F0] hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Under Watch Period
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shrink-0">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-[#0F172A] tracking-tight">
                {watchCount}
              </div>
              <div className="text-[11px] font-semibold text-amber-600 mt-1">
                Monitoring for repeat barrier failure
              </div>
            </div>
          </div>

          {/* Card 3: Verified Closed */}
          <div
            onClick={() => setFilter(filter === "VERIFIED_CLOSED" ? "all" : "VERIFIED_CLOSED")}
            className={`bg-white border rounded-2xl p-5 shadow-xs cursor-pointer transition-all ${
              filter === "VERIFIED_CLOSED" ? "border-emerald-500 ring-2 ring-emerald-100" : "border-[#E2E8F0] hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Verified &amp; Closed
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-[#0F172A] tracking-tight">
                {closedCount}
              </div>
              <div className="text-[11px] font-semibold text-emerald-600 mt-1">
                Completed 30 days without failure
              </div>
            </div>
          </div>

          {/* Card 4: Total Tracked */}
          <div
            onClick={() => setFilter("all")}
            className={`bg-white border rounded-2xl p-5 shadow-xs cursor-pointer transition-all ${
              filter === "all" ? "border-blue-500 ring-2 ring-blue-100" : "border-[#E2E8F0] hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Total Action Tickets
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-[#0F172A] tracking-tight">
                {tickets.length}
              </div>
              <div className="text-[11px] font-semibold text-blue-600 mt-1">
                Active tracking lifecycle
              </div>
            </div>
          </div>
        </div>

        {/* ─── MAIN TICKET CATALOG CARD ────────────────────────── */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            {/* Filter Bar */}
            <div className="p-5 border-b border-[#E2E8F0] flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-[#0F172A] mr-2">Repair Actions</h2>
                <div className="flex bg-[#F1F5F9] p-1 rounded-xl border border-slate-200">
                  {[
                    { key: "all", label: "All Tickets" },
                    { key: "OPEN", label: "Open" },
                    { key: "ASSIGNED", label: "Assigned" },
                    { key: "UNDER_WATCH", label: "Under Watch" },
                    { key: "VERIFIED_CLOSED", label: "Closed" },
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
                  placeholder="Search tickets, sites, owners..."
                  className="w-full h-9 pl-9 pr-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-[#2563EB] focus:outline-none"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Barrier &amp; Failure Mode</th>
                    <th className="py-3 px-4">Site Location</th>
                    <th className="py-3 px-4">Assigned Owner</th>
                    <th className="py-3 px-4">30-Day Watch Progress</th>
                    <th className="py-3 px-4">Ticket Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9] text-slate-700">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        Loading repair tickets...
                      </td>
                    </tr>
                  ) : filteredTickets.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        No repair tickets found matching this query.
                      </td>
                    </tr>
                  ) : (
                    filteredTickets.map((t) => {
                      const watchPct = Math.min(
                        100,
                        Math.round((t.watchDaysElapsed / (t.watchDaysTotal || 30)) * 100)
                      );
                      const isClosed = t.status === "VERIFIED_CLOSED";
                      const isOpen = t.status === "OPEN" || t.status === "ASSIGNED";

                      return (
                        <tr key={t.id} className="hover:bg-[#F8FAFC] transition-colors">
                          {/* Barrier & Mode */}
                          <td className="py-4 px-4 font-bold text-[#0F172A] max-w-xs">
                            <Link href={`/tickets/${t.id}`} className="hover:text-[#2563EB] hover:underline">
                              {t.barrier}
                            </Link>
                            <div className="text-[10px] text-slate-400 font-normal mt-0.5 truncate">
                              {t.failureMode || "Physical defect / missing control"}
                            </div>
                          </td>

                          {/* Site */}
                          <td className="py-4 px-4 font-semibold text-slate-700 whitespace-nowrap">
                            {t.site || "Rig 4"}
                          </td>

                          {/* Owner */}
                          <td className="py-4 px-4 text-slate-600 whitespace-nowrap">
                            {t.owner || "Unassigned"}
                          </td>

                          {/* Watch Progress */}
                          <td className="py-4 px-4 max-w-xs">
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                                <div
                                  className={`h-full rounded-full ${
                                    isClosed
                                      ? "bg-emerald-500"
                                      : isOpen
                                      ? "bg-red-500"
                                      : "bg-amber-500"
                                  }`}
                                  style={{ width: `${watchPct}%` }}
                                ></div>
                              </div>
                              <span className="text-[10px] font-bold text-slate-600 font-mono">
                                {t.watchDaysElapsed}/{t.watchDaysTotal || 30}d
                              </span>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                isOpen
                                  ? "bg-red-50 text-red-700 border border-red-200"
                                  : isClosed
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-amber-50 text-amber-700 border border-amber-200"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isOpen ? "bg-red-600" : isClosed ? "bg-emerald-600" : "bg-amber-500"
                                }`}
                              ></span>
                              {t.status.replace("_", " ")}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-4 text-right whitespace-nowrap">
                            <Link
                              href={`/tickets/${t.id}`}
                              className="h-7 px-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 transition-colors"
                            >
                              Manage →
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

          {/* Table Footer */}
          <div className="p-4 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-slate-500 bg-[#F8FAFC]/50">
            <div>Showing {filteredTickets.length} of {tickets.length} tickets</div>
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
