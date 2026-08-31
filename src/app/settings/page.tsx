"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    autoStopWork: true,
    notifyOfficerPsif: true,
    failSafeEscalate: true,
    watchDays: 30,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then(setSettings)
      .catch(() => {});
  }, []);

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
      <div className="p-4 md:p-12 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-display-lg text-on-surface">Settings</h1>
          {(saving || saved) && (
            <span className={`text-label-caps px-3 py-1 rounded-full ${saved ? "bg-tertiary-container text-on-tertiary-container" : "bg-surface-variant text-on-surface-variant"}`}>
              {saving ? "Saving..." : "✓ Saved"}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-6">
          {/* AI Configuration */}
          <div className="bg-surface border-2 border-outline-variant rounded-lg p-6">
            <h2 className="text-title-md font-semibold mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">memory</span>
              AI Classification
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-label-caps text-on-surface-variant block mb-2">RULE VERSION</label>
                <div className="bg-surface-container-low border-2 border-outline-variant rounded p-3 font-mono text-mono-code">v1.4</div>
              </div>
              <div>
                <label className="text-label-caps text-on-surface-variant block mb-2">AI MODEL</label>
                <div className="bg-surface-container-low border-2 border-outline-variant rounded p-3 font-mono text-mono-code">gemini-2.0-flash-lite</div>
              </div>
            </div>
          </div>

          {/* Alert Thresholds — NOW FUNCTIONAL */}
          <div className="bg-surface border-2 border-outline-variant rounded-lg p-6">
            <h2 className="text-title-md font-semibold mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-error">notifications_active</span>
              Alert Thresholds
            </h2>
            <p className="text-body-md text-on-surface-variant mb-4">
              Officers can adjust what counts as &quot;urgent&quot; over time, so alerts respect their attention instead of overwhelming it.
            </p>
            <div className="flex flex-col gap-3">
              {[
                { key: "autoStopWork", label: "Auto-trigger Stop Work alert for PSIF" },
                { key: "notifyOfficerPsif", label: "Notify safety officer on PSIF detection" },
                { key: "failSafeEscalate", label: "Fail-safe: Uncertainty always escalates" },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => toggle(item.key)}
                  className="flex items-center justify-between p-4 bg-surface-container-low rounded border-2 border-outline-variant hover:bg-surface-container transition-colors"
                >
                  <span className="text-body-md text-on-surface">{item.label}</span>
                  <div className={`w-12 h-7 rounded-full relative transition-colors ${(settings as Record<string, boolean | number>)[item.key] ? "bg-primary" : "bg-outline-variant"}`}>
                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${(settings as Record<string, boolean | number>)[item.key] ? "right-1" : "left-1"}`}></div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Watch Period — NOW FUNCTIONAL */}
          <div className="bg-surface border-2 border-outline-variant rounded-lg p-6">
            <h2 className="text-title-md font-semibold mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-warning">visibility</span>
              Watch Period
            </h2>
            <div>
              <label className="text-label-caps text-on-surface-variant block mb-2">DEFAULT WATCH DAYS</label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={7}
                  max={90}
                  value={settings.watchDays}
                  onChange={(e) => updateWatchDays(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-surface-variant rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <span className="font-mono text-mono-code text-on-surface w-16 text-right font-bold">{settings.watchDays} days</span>
              </div>
              <p className="text-body-md text-on-surface-variant mt-3">
                Tickets remain under watch for this period after being fixed. If the same barrier fails again, the ticket reopens and escalates automatically.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
