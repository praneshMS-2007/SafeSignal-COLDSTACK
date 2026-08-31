"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import Link from "next/link";

interface TriageReport {
  id: string;
  rawText: string;
  site: string;
  createdAt: string;
  classification: {
    classification: string;
    priority: number;
    barrierRequired: string;
    barrierState: string;
    finalVerdict: string;
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
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? "s" : ""}`;
  return `${Math.floor(hrs / 24)} days`;
}

function getPriorityStyle(classification: string) {
  switch (classification) {
    case "PSIF": return { bg: "bg-error-container", text: "text-on-error-container", border: "border-error" };
    case "SIF": return { bg: "bg-error-container", text: "text-on-error-container", border: "border-error" };
    case "CAPACITY": return { bg: "bg-surface-container-high", text: "text-on-surface-variant", border: "border-outline-variant" };
    default: return { bg: "bg-orange-100", text: "text-orange-800", border: "border-orange-500" };
  }
}

function getClassificationLabel(c: string, barrierState: string) {
  if (c === "PSIF") return { label: "CRITICAL", cls: "border-error text-error" };
  if (barrierState === "UNKNOWN") return { label: "WARNING", cls: "border-orange-500 text-orange-600" };
  if (c === "CAPACITY") return { label: "SAFE", cls: "border-emerald-600 text-emerald-600" };
  return { label: "WARNING", cls: "border-orange-500 text-orange-600" };
}

export default function TriagePage() {
  const [reports, setReports] = useState<TriageReport[]>([]);
  const [stats, setStats] = useState<TriageStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/triage")
      .then((r) => r.json())
      .then((data) => {
        setReports(data.reports);
        setStats(data.stats);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppLayout>
      <div className="p-4 md:p-12 flex-grow flex flex-col gap-8 max-w-7xl mx-auto w-full">
        {/* Header */}
        <header>
          <h1 className="text-display-lg text-on-surface mb-2">Triage queue</h1>
          <p className="text-body-lg text-on-surface-variant">Ranked by fatal potential — not by date</p>
        </header>

        {/* Stat Tiles */}
        {stats && (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
          </section>
        )}

        {/* Data Table */}
        <section className="bg-surface rounded-lg border-2 border-outline-variant overflow-hidden flex-grow flex flex-col">
          <div className="overflow-x-auto flex-grow">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-surface-container-low border-b-2 border-outline-variant">
                  <th className="p-4 text-label-caps text-on-surface-variant uppercase w-32">Priority</th>
                  <th className="p-4 text-label-caps text-on-surface-variant uppercase">Report</th>
                  <th className="p-4 text-label-caps text-on-surface-variant uppercase w-32">Site</th>
                  <th className="p-4 text-label-caps text-on-surface-variant uppercase">Barrier</th>
                  <th className="p-4 text-label-caps text-on-surface-variant uppercase w-48">Classification</th>
                  <th className="p-4 text-label-caps text-on-surface-variant uppercase w-24 text-right">Age</th>
                </tr>
              </thead>
              <tbody className="font-mono text-mono-code divide-y-2 divide-outline-variant">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-on-surface-variant">
                      <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span>
                      Loading triage queue...
                    </td>
                  </tr>
                ) : reports.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-on-surface-variant">
                      No reports in the queue. <Link href="/report" className="text-primary underline">Submit one</Link>
                    </td>
                  </tr>
                ) : (
                  reports.map((r) => {
                    const c = r.classification;
                    const style = getPriorityStyle(c?.classification || "");
                    const clsLabel = getClassificationLabel(c?.classification || "", c?.barrierState || "");
                    const isUrgent = c?.classification === "PSIF";

                    return (
                      <tr key={r.id} className="hover:bg-surface-container transition-colors min-h-[64px]">
                        <td className="p-4 align-middle">
                          <span className={`inline-flex items-center px-2 py-1 rounded ${style.bg} ${style.text} text-label-caps`}>
                            {c?.classification || "PENDING"}
                          </span>
                        </td>
                        <td className="p-4 align-middle">
                          <Link href={`/reports/${r.id}`} className="text-on-surface text-title-md font-semibold hover:underline">
                            {r.rawText.length > 50 ? r.rawText.substring(0, 50) + "..." : r.rawText}
                          </Link>
                        </td>
                        <td className="p-4 align-middle text-on-surface-variant">{r.site || "—"}</td>
                        <td className="p-4 align-middle text-on-surface-variant">{c?.barrierRequired || "—"}</td>
                        <td className="p-4 align-middle">
                          <span className={`inline-block w-full text-center px-2 py-1 border rounded text-label-caps ${clsLabel.cls}`}>
                            {clsLabel.label}
                          </span>
                        </td>
                        <td className={`p-4 align-middle text-right ${isUrgent ? "text-error font-bold" : "text-on-surface-variant"}`}>
                          {timeAgo(r.createdAt)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
