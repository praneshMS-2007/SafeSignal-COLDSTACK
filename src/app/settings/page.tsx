"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [settings, setSettings] = useState({
    autoStopWork: true,
    notifyOfficerPsif: true,
    failSafeEscalate: true,
    watchDays: 30,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user && user.role === "employee") {
      router.replace("/");
      return;
    }

    fetch("/api/settings")
      .then((r) => r.json())
      .then(setSettings)
      .catch((err) => console.error("Error loading settings:", err));
  }, [user, router]);

  const toggle = async (key: string) => {
    const newValue = !(settings as Record<string, boolean | number>)[key];
    const updated = { ...settings, [key]: newValue };
    setSettings(updated);
    setSaving(true);
    setSaved(false);
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [key]: String(newValue) }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateWatchDays = async (days: number) => {
    setSettings({ ...settings, watchDays: days });
    setSaving(true);
    setSaved(false);
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ watchDays: String(days) }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full flex flex-col gap-6 bg-[#F8FAFC] min-h-screen">
        {/* ─── PAGE HEADER ─────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              SYSTEM CONFIGURATION &amp; THRESHOLDS
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              Safety Rules &amp; Alert Engine Settings
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Configure automated SIF threshold sensitivities, verification watch cycles, and fail-safe escalations.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {(saving || saved) && (
              <span
                className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
                  saved
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-slate-100 text-slate-700 border-slate-300"
                }`}
              >
                {saving ? "Saving Changes..." : "✓ Saved to Database"}
              </span>
            )}
          </div>
        </div>

        {/* ─── SETTINGS CARDS ──────────────────────────────────── */}
        <div className="flex flex-col gap-6">
          {/* Card 1: AI Engine Model */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs">
            <h2 className="text-base font-bold text-[#0F172A] mb-1 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600 text-xl">
                memory
              </span>
              AI &amp; NLP Classification Engine
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Dual-pass consensus architecture combining deterministic energy rules with Google Gemini.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-[#F8FAFC] border border-slate-200 rounded-xl">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Rule Version
                </div>
                <div className="text-sm font-extrabold font-mono text-[#0F172A]">
                  SCL-IOGP-v1.4 (Active)
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  9 Life-Saving Rules mapped
                </div>
              </div>

              <div className="p-4 bg-[#F8FAFC] border border-slate-200 rounded-xl">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  NLP Intelligence Tier
                </div>
                <div className="text-sm font-extrabold font-mono text-[#0F172A]">
                  gemini-2.0-flash-lite
                </div>
                <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                  Connected &amp; Active
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Alert Thresholds */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs">
            <h2 className="text-base font-bold text-[#0F172A] mb-1 flex items-center gap-2">
              <span className="material-symbols-outlined text-red-600 text-xl">
                notifications_active
              </span>
              Alert Escalation Thresholds
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Adjust automated stop-work triggers and officer notification policies.
            </p>

            <div className="flex flex-col gap-3">
              {[
                {
                  key: "autoStopWork",
                  label: "Auto-trigger Stop Work alert on critical PSIF detection",
                  desc: "Forces a red stop-work modal immediately upon employee report submission.",
                },
                {
                  key: "notifyOfficerPsif",
                  label: "Notify HSE safety officers on fatal precursor discovery",
                  desc: "Broadcasts high-priority push notifications to on-duty safety managers.",
                },
                {
                  key: "failSafeEscalate",
                  label: "Fail-Safe Default: Uncertainty always escalates to Officer",
                  desc: "If rules and AI diverge, the event is immediately elevated for human verification.",
                },
              ].map((item) => {
                const isChecked = (settings as Record<string, boolean | number>)[item.key];

                return (
                  <div
                    key={item.key}
                    onClick={() => toggle(item.key)}
                    className="flex items-center justify-between p-4 bg-[#F8FAFC] border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <div className="pr-4">
                      <div className="text-sm font-bold text-[#0F172A]">{item.label}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{item.desc}</div>
                    </div>

                    <div
                      className={`w-12 h-6 rounded-full relative transition-colors shrink-0 ${
                        isChecked ? "bg-[#2563EB]" : "bg-slate-300"
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-xs ${
                          isChecked ? "translate-x-6" : "translate-x-0.5"
                        }`}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 3: 30-Day Watch Period */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs">
            <h2 className="text-base font-bold text-[#0F172A] mb-1 flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-600 text-xl">
                visibility
              </span>
              Corrective Action Watch Cycle
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Defines how long a repair ticket stays under surveillance before being certified permanently closed.
            </p>

            <div className="p-4 bg-[#F8FAFC] border border-slate-200 rounded-xl flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Default Verification Watch
                </span>
                <span className="text-base font-extrabold text-[#2563EB] font-mono">
                  {settings.watchDays} Days
                </span>
              </div>

              <input
                type="range"
                min={7}
                max={90}
                value={settings.watchDays}
                onChange={(e) => updateWatchDays(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#2563EB]"
              />

              <div className="flex justify-between text-[11px] text-slate-400 font-semibold">
                <span>7 days (Minimal)</span>
                <span>30 days (Recommended Standard)</span>
                <span>90 days (High Consequence)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
