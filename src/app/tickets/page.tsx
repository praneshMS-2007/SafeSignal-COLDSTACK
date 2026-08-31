"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import Link from "next/link";

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

function getStatusStyle(status: string) {
  switch (status) {
    case "OPEN": return { bg: "bg-error-container", text: "text-on-error-container", border: "border-l-error" };
    case "ASSIGNED": return { bg: "bg-orange-100", text: "text-orange-800", border: "border-l-orange-500" };
    case "FIXED": return { bg: "bg-primary-fixed", text: "text-on-primary-fixed", border: "border-l-primary" };
    case "UNDER_WATCH": return { bg: "bg-amber-100", text: "text-amber-800", border: "border-l-amber-500" };
    case "VERIFIED_CLOSED": return { bg: "bg-emerald-100", text: "text-emerald-800", border: "border-l-emerald-500" };
    default: return { bg: "bg-surface-variant", text: "text-on-surface-variant", border: "border-l-outline" };
  }
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetch("/api/tickets")
      .then((r) => r.json())
      .then(setTickets)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? tickets : tickets.filter((t) => t.status === filter);

  return (
    <AppLayout>
      <div className="p-4 md:p-12 max-w-7xl mx-auto w-full">
        <header className="mb-8">
          <h1 className="text-display-lg text-on-surface mb-2">Repair Tickets</h1>
          <p className="text-body-lg text-on-surface-variant">Track corrective actions from report to verified closure</p>
        </header>

        {/* Filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {["all", "OPEN", "ASSIGNED", "FIXED", "UNDER_WATCH", "VERIFIED_CLOSED"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-label-caps border-2 transition-colors ${
                filter === f
                  ? "bg-primary-container text-on-primary-container border-primary"
                  : "bg-surface-container-lowest border-outline-variant text-on-surface-variant hover:bg-surface-container-low"
              }`}
            >
              {f === "all" ? "All" : f.replace("_", " ")}
            </button>
          ))}
        </div>

        {/* Tickets list */}
        <div className="flex flex-col gap-4">
          {loading ? (
            <div className="p-8 text-center text-on-surface-variant">
              <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span>
              Loading tickets...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-on-surface-variant">No tickets found.</div>
          ) : (
            filtered.map((t) => {
              const style = getStatusStyle(t.status);
              return (
                <Link key={t.id} href={`/tickets/${t.id}`}>
                  <div className={`bg-surface border-2 border-outline-variant border-l-[6px] ${style.border} rounded-lg p-6 hover:bg-surface-container-low transition-colors cursor-pointer`}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-title-md font-semibold text-on-surface">{t.barrier}</h3>
                        <p className="text-body-md text-on-surface-variant mt-1">{t.failureMode || t.report.rawText.substring(0, 60)}</p>
                      </div>
                      <span className={`${style.bg} ${style.text} text-label-caps px-3 py-1 rounded whitespace-nowrap`}>
                        {t.status.replace("_", " ")}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-on-surface-variant text-sm">
                      {t.owner && (
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">person</span>
                          {t.owner}
                        </span>
                      )}
                      {t.site && (
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">location_on</span>
                          {t.site}
                        </span>
                      )}
                      {t.status === "UNDER_WATCH" && (
                        <span className="flex items-center gap-1 text-amber-700">
                          <span className="material-symbols-outlined text-xs">visibility</span>
                          {t.watchDaysTotal - t.watchDaysElapsed} days remaining
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </AppLayout>
  );
}
