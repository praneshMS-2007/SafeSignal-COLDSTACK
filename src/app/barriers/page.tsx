"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";

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
  { name: "Driving", icon: "directions_car" },
  { name: "Confined Space", icon: "architecture" },
  { name: "Energy Isolation", icon: "electrical_services" },
  { name: "Work Authorisation", icon: "gavel" },
  { name: "Ground Disturbance", icon: "landscape" },
  { name: "Hot Work", icon: "local_fire_department" },
  { name: "Line of Fire", icon: "alt_route" },
  { name: "Lifting", icon: "type_specimen" },
  { name: "Working at Height", icon: "height" },
];

function getTrendIcon(trend: string) {
  if (trend === "DECLINING") return { icon: "trending_down", color: "text-error", label: "declining" };
  if (trend === "IMPROVING") return { icon: "trending_up", color: "text-emerald-600", label: "improving" };
  return { icon: "trending_flat", color: "text-yellow-600", label: "static" };
}

function getStatusClass(trend: string) {
  if (trend === "DECLINING") return "status-critical";
  if (trend === "IMPROVING") return "status-good";
  return "status-warning";
}

export default function BarriersPage() {
  const [barriers, setBarriers] = useState<BarrierData[]>([]);
  const [sites, setSites] = useState<SiteData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/barriers")
      .then((r) => r.json())
      .then((data) => {
        setBarriers(data.barriers);
        setSites(data.sites);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Determine blind-spot status for each rule
  const blindSpotMap = LIFE_SAVING_RULES.map((rule) => {
    const barrier = barriers.find(
      (b) => b.barrierName.toLowerCase().includes(rule.name.toLowerCase().split(" ")[0])
    );
    if (!barrier) return { ...rule, status: "no-data" };
    if (barrier.trend === "DECLINING") return { ...rule, status: "critical" };
    if (barrier.trend === "IMPROVING") return { ...rule, status: "good" };
    return { ...rule, status: "neutral" };
  });

  const maxRate = Math.max(...sites.map((s) => s.precursorRate), 15);

  if (loading) {
    return (
      <AppLayout>
        <div className="p-12 text-center text-on-surface-variant">
          <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span>
          Loading barrier health data...
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-4 md:p-12 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col gap-2 border-b-2 border-outline-variant pb-6">
          <h2 className="text-display-lg text-primary font-bold">Barrier health</h2>
          <p className="text-title-md text-on-surface-variant">Which control is failing, and is it getting worse?</p>
        </header>

        {/* Bento Grid */}
        <div className="bento-grid">
          {/* Sparkline Cards */}
          {barriers.map((b) => {
            const trend = getTrendIcon(b.trend);
            const statusClass = getStatusClass(b.trend);
            return (
              <div key={b.barrierName} className="bento-item-third">
                <div className={`bg-surface rounded-lg p-6 border-2 border-outline-variant ${statusClass} h-full flex flex-col justify-between`}>
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-title-md font-semibold text-on-surface">{b.barrierName}</h3>
                      <span className={`material-symbols-outlined ${trend.color} text-3xl`}>{trend.icon}</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-display-lg ${trend.color}`}>{b.mtbfDays}</span>
                      <span className="text-label-caps text-on-surface-variant">DAYS MTBF</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t-2 border-outline-variant">
                    <p className={`text-body-md ${trend.color} flex items-center gap-2`}>
                      <span className="material-symbols-outlined text-sm">
                        {b.trend === "DECLINING" ? "warning" : b.trend === "IMPROVING" ? "check_circle" : "horizontal_rule"}
                      </span>
                      {b.lastQuarterMtbf ? `was ${b.lastQuarterMtbf} days last quarter` : trend.label}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Precursor Rate Chart */}
          <div className="bento-item-half">
            <div className="bg-surface rounded-lg p-6 border-2 border-outline-variant h-full min-h-[400px] flex flex-col">
              <h3 className="text-title-md font-semibold text-on-surface mb-2">Precursors per 100 reports by site</h3>
              <p className="text-label-caps text-on-surface-variant mb-6">NORMALISED RATE (NOT RAW COUNTS)</p>
              <div className="flex-1 flex flex-col justify-around gap-3">
                {sites.map((s) => (
                  <div key={s.name} className="flex items-center gap-4">
                    <div className="w-24 text-body-md text-right text-on-surface">{s.name}</div>
                    <div className="flex-1 h-12 bg-surface-variant relative border-2 border-outline-variant">
                      <div
                        className={`absolute top-0 left-0 h-full transition-all duration-500 ${
                          s.precursorRate > 10 ? "bg-error" : "bg-primary"
                        }`}
                        style={{ width: `${(s.precursorRate / maxRate) * 100}%` }}
                      />
                    </div>
                    <div className={`w-12 text-title-md font-semibold ${s.precursorRate > 10 ? "text-error" : "text-on-surface"}`}>
                      {s.precursorRate}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Blind-spot Map */}
          <div className="bento-item-half">
            <div className="bg-surface rounded-lg p-6 border-2 border-outline-variant h-full min-h-[400px] flex flex-col">
              <h3 className="text-title-md font-semibold text-on-surface mb-2">Blind-spot map</h3>
              <p className="text-label-caps text-on-surface-variant mb-6">NINE LIFE-SAVING RULES</p>
              <div className="grid grid-cols-3 gap-2 flex-1">
                {blindSpotMap.map((rule) => {
                  const statusStyles =
                    rule.status === "critical"
                      ? "bg-error-container border-error text-on-error-container"
                      : rule.status === "good"
                      ? "bg-emerald-100 border-emerald-300 text-emerald-900"
                      : "bg-surface-variant border-outline-variant text-on-surface-variant";

                  return (
                    <div
                      key={rule.name}
                      className={`border-2 rounded p-3 flex flex-col items-center justify-center text-center relative group ${statusStyles}`}
                    >
                      <span className={`material-symbols-outlined mb-2 ${
                        rule.status === "critical" ? "text-error" : rule.status === "good" ? "text-emerald-800" : ""
                      }`}>
                        {rule.icon}
                      </span>
                      <span className="text-label-caps text-xs">{rule.name}</span>
                      {rule.status === "critical" && (
                        <div className="absolute inset-0 bg-error/90 text-on-error flex items-center justify-center p-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-center z-10 rounded">
                          Work happening, zero reports
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
