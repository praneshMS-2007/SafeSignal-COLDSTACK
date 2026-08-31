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
  classification: { classification: string; priority: number } | null;
}

function getStatusStyle(status: string) {
  switch (status) {
    case "TRIAGED": return { border: "border-l-error", badge: "bg-error-container text-on-error-container", label: "Priority 1" };
    case "ASSIGNED": return { border: "border-l-primary-fixed", badge: "bg-surface-variant text-on-surface-variant", label: "Under review" };
    case "FIXED": return { border: "border-l-outline", badge: "bg-surface-variant text-on-surface-variant", label: "Fixed" };
    case "VERIFIED_CLOSED": return { border: "border-l-tertiary", badge: "bg-tertiary-container text-on-tertiary-container", label: "Verified" };
    default: return { border: "border-l-outline", badge: "bg-surface-variant text-on-surface-variant", label: status };
  }
}

const TIMELINE_STEPS = ["PENDING", "TRIAGED", "ASSIGNED", "FIXED", "VERIFIED_CLOSED"];
const TIMELINE_LABELS = ["Reported", "Reviewed", "Repair assigned", "Fixed", "Verified closed"];

export default function MyReportsPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [filter, setFilter] = useState<"all" | "open" | "fixed">("all");
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const url = user?.role === "employee" ? `/api/reports?userId=${user.id}` : "/api/reports";
    fetch(url)
      .then((r) => r.json())
      .then(setReports)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const filtered = reports.filter((r) => {
    if (filter === "open") return ["PENDING", "TRIAGED", "ASSIGNED"].includes(r.status);
    if (filter === "fixed") return ["FIXED", "VERIFIED_CLOSED"].includes(r.status);
    return true;
  });

  return (
    <AppLayout>
      <div className="p-4 md:p-12 max-w-4xl mx-auto w-full">
        <h2 className="text-title-md font-semibold mb-4">My Reports</h2>

        {/* Segmented Control */}
        <div className="flex bg-surface-container-low border-2 border-outline-variant p-1 mb-6 h-[56px] items-center w-full rounded-lg">
          {(["all", "open", "fixed"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`flex-1 h-full text-label-caps font-bold rounded transition-colors ${filter === f ? "bg-primary-container text-on-primary-container" : "text-on-surface-variant hover:bg-surface-container-highest"}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-4">
          {loading ? (
            <div className="p-8 text-center text-on-surface-variant">
              <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span>Loading...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-on-surface-variant">
              No reports. <Link href="/report" className="text-primary underline">Submit one</Link>
            </div>
          ) : (
            filtered.map((r) => {
              const style = getStatusStyle(r.status);
              const isExpanded = expandedId === r.id;
              const currentStepIdx = TIMELINE_STEPS.indexOf(r.status);

              return (
                <div key={r.id}>
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : r.id)}
                    className={`bg-surface-container-lowest border-2 border-outline-variant border-l-[6px] ${style.border} p-4 flex flex-col gap-2 cursor-pointer hover:bg-surface-container-low transition-colors`}
                  >
                    <div className="flex justify-between items-start">
                      <Link href={`/reports/${r.id}`} onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-title-md font-semibold text-on-surface hover:underline">
                          {r.rawText.length > 50 ? r.rawText.substring(0, 50) + "..." : r.rawText}
                        </h3>
                      </Link>
                      <span className={`${style.badge} text-label-caps px-2 py-1 rounded whitespace-nowrap ml-2`}>{style.label}</span>
                    </div>
                    <div className="flex items-center gap-2 text-on-surface-variant text-sm">
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                        {r.status === "VERIFIED_CLOSED" ? "check_circle" : "history"}
                      </span>
                      <span>{r.status.replace(/_/g, " ").toLowerCase()}</span>
                      <span>·</span>
                      <span className="material-symbols-outlined text-xs">expand_more</span>
                      <span className="text-label-caps">{isExpanded ? "Hide" : "Show"} timeline</span>
                    </div>
                  </div>

                  {/* Timeline — from UI mockup */}
                  {isExpanded && (
                    <div className="bg-surface-container-lowest border-2 border-t-0 border-outline-variant px-6 py-4">
                      <div className="relative pl-6 flex flex-col gap-4 border-l-2 border-outline-variant ml-2">
                        {TIMELINE_LABELS.map((label, i) => {
                          const isComplete = i <= currentStepIdx;
                          const isCurrent = i === currentStepIdx;
                          const isLast = i === TIMELINE_LABELS.length - 1 && r.status === "VERIFIED_CLOSED";

                          return (
                            <div key={label} className="relative">
                              <div className={`absolute w-${isLast ? "4" : "3"} h-${isLast ? "4" : "3"} rounded-full -left-[${isLast ? "29" : "27"}px] top-1 border-2 border-surface-container-lowest ${
                                isLast ? "bg-tertiary flex items-center justify-center" :
                                isComplete ? "bg-primary" :
                                "bg-surface-variant"
                              }`} style={{ width: isLast ? 16 : 12, height: isLast ? 16 : 12, left: isLast ? -29 : -27 }}>
                                {isLast && <span className="material-symbols-outlined text-surface-container-lowest" style={{ fontSize: 10 }}>check</span>}
                              </div>
                              <p className={`text-body-md text-sm ${isCurrent ? "text-on-surface font-bold" : isComplete ? "text-on-surface-variant" : "text-outline"}`}>
                                {label}
                              </p>
                              {isLast && r.status === "VERIFIED_CLOSED" && (
                                <p className="text-label-caps text-on-surface-variant mt-1">Closure earned after 30-day watch</p>
                              )}
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
    </AppLayout>
  );
}
