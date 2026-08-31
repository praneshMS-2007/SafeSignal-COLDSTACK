"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

interface TicketDetail {
  id: string;
  barrier: string;
  failureMode: string | null;
  owner: string | null;
  site: string | null;
  dueDate: string | null;
  status: string;
  watchDaysElapsed: number;
  watchDaysTotal: number;
  report: { id?: string; rawText: string; classification: { classification: string } | null };
  linkedReports: { id: string; type: string; description: string; date: string; reportRef: string | null }[];
  evidences?: { id: string; fileName: string; fileUrl: string; createdAt: string }[];
}

const STEPS = ["OPEN", "ASSIGNED", "FIXED", "UNDER_WATCH", "VERIFIED_CLOSED"];
const STEP_LABELS = ["Open", "Assigned", "Fixed", "Under Watch", "Verified Closed"];

export default function TicketDetailPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showExtensionModal, setShowExtensionModal] = useState(false);
  const [extensionDays, setExtensionDays] = useState(15);
  const [extensionReason, setExtensionReason] = useState("");
  const [extensionSubmitted, setExtensionSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user && user.role === "employee") {
      router.replace("/");
      return;
    }

    fetch(`/api/tickets/${params.id}`)
      .then((r) => r.json())
      .then((data) => setTicket(data))
      .catch((err) => console.error("Error loading ticket detail:", err))
      .finally(() => setLoading(false));
  }, [user, router, params.id]);

  const handleExtension = async () => {
    await fetch(`/api/tickets/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        watchDaysTotal: (ticket?.watchDaysTotal || 30) + extensionDays,
        dueDate: extensionReason ? `Extended: ${extensionReason}` : ticket?.dueDate,
      }),
    });
    setExtensionSubmitted(true);
    setTimeout(() => {
      setShowExtensionModal(false);
      setExtensionSubmitted(false);
      window.location.reload();
    }, 1200);
  };

  const handleEvidenceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const dataUrl = evt.target?.result as string;
      await fetch(`/api/tickets/${params.id}/evidence`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileUrl: dataUrl,
        }),
      });
      window.location.reload();
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="p-12 text-center text-slate-400 text-xs">
          Loading ticket details...
        </div>
      </AppLayout>
    );
  }

  if (!ticket) {
    return (
      <AppLayout>
        <div className="p-12 text-center text-slate-500 font-bold">Ticket not found</div>
      </AppLayout>
    );
  }

  const currentStepIdx = STEPS.indexOf(ticket.status);
  const watchProgress =
    ticket.watchDaysTotal > 0 ? (ticket.watchDaysElapsed / ticket.watchDaysTotal) * 100 : 0;

  return (
    <AppLayout>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf,.doc,.docx"
        className="hidden"
        onChange={handleEvidenceUpload}
      />

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full flex flex-col gap-6 bg-[#F8FAFC] min-h-screen">
        {/* ─── HEADER & ACTIONS ───────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              <Link href="/tickets" className="hover:text-[#2563EB]">
                REPAIR TICKETS
              </Link>
              <span>/</span>
              <span className="text-[#2563EB]">ACTION VERIFICATION</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              Ticket #{ticket.id.slice(-6).toUpperCase()} · {ticket.barrier}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Corrective action tracking with 30-day verification watch and automated fail-safe re-escalation.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => router.back()}
              className="h-10 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold uppercase tracking-wider shadow-xs transition-colors"
            >
              ← Back
            </button>
            <button
              onClick={() => setShowExtensionModal(true)}
              className="h-10 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold uppercase tracking-wider shadow-xs transition-colors"
            >
              Extend Watch
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="h-10 px-5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md shadow-blue-600/20 transition-all active:scale-95"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              <span>+ Add Evidence</span>
            </button>
          </div>
        </div>

        {/* ─── 5-STEP LIFECYCLE STEPPER CARD ───────────────────── */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-4">
            Corrective Action Lifecycle
          </div>

          <div className="flex items-center justify-between relative">
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-slate-200 z-0"></div>
            {STEP_LABELS.map((label, idx) => {
              const isCompleted = idx < currentStepIdx;
              const isCurrent = idx === currentStepIdx;

              return (
                <div key={label} className="flex flex-col items-center relative z-10 text-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isCurrent
                        ? "bg-[#2563EB] text-white ring-4 ring-blue-100 shadow-md"
                        : isCompleted
                        ? "bg-emerald-500 text-white"
                        : "bg-white border-2 border-slate-300 text-slate-400"
                    }`}
                  >
                    {isCompleted ? "✓" : idx + 1}
                  </div>
                  <span
                    className={`text-xs mt-2 ${
                      isCurrent
                        ? "font-bold text-[#2563EB]"
                        : isCompleted
                        ? "font-semibold text-slate-800"
                        : "text-slate-400"
                    }`}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── TWO COLUMN SPLIT VIEW ───────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: TICKET SPECS & REPAIR DETAILS (6 cols) */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            {/* Details Card */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs">
              <h2 className="text-base font-bold text-[#0F172A] mb-4 pb-3 border-b border-[#E2E8F0] flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-lg">
                  engineering
                </span>
                Repair Specifications
              </h2>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Barrier System
                  </span>
                  <span className="font-bold text-slate-900 text-sm">{ticket.barrier}</span>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Site Location
                  </span>
                  <span className="font-bold text-slate-900 text-sm">{ticket.site || "Rig 4"}</span>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Assigned Owner
                  </span>
                  <span className="font-bold text-slate-900">{ticket.owner || "Unassigned"}</span>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Target Due Date
                  </span>
                  <span className="font-bold text-slate-900">{ticket.dueDate || "30 Days standard"}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Identified Failure Mode
                </span>
                <p className="text-xs text-slate-700 bg-[#F8FAFC] p-3 rounded-xl border border-slate-200">
                  {ticket.failureMode || "Physical defect / missing barrier controls"}
                </p>
              </div>

              {ticket.report?.rawText && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Source Field Transcript
                  </span>
                  <p className="text-xs text-slate-700 italic bg-[#F8FAFC] p-3 rounded-xl border border-slate-200">
                    &ldquo;{ticket.report.rawText}&rdquo;
                  </p>
                </div>
              )}
            </div>

            {/* Watch Period Card */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-600 text-lg">
                    visibility
                  </span>
                  30-Day Verification Watch
                </h3>
                <span className="text-xs font-mono font-bold text-slate-700">
                  {ticket.watchDaysElapsed} / {ticket.watchDaysTotal} Days ({Math.round(watchProgress)}%)
                </span>
              </div>

              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200 mb-3">
                <div
                  className="h-full bg-[#2563EB] rounded-full transition-all"
                  style={{ width: `${Math.min(100, watchProgress)}%` }}
                ></div>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                If the same barrier fails again during this period, SafeSignal re-opens this ticket and notifies the HSE Safety Officer automatically.
              </p>
            </div>
          </div>

          {/* RIGHT: EVIDENCE & LINKED INCIDENT LOG (6 cols) */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            {/* Evidence Card */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] mb-4">
                <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600 text-lg">
                    attach_file
                  </span>
                  Closure Verification Evidence
                </h3>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-bold text-[#2563EB] hover:underline"
                >
                  + Upload Document
                </button>
              </div>

              {ticket.evidences && ticket.evidences.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {ticket.evidences.map((ev) => (
                    <div
                      key={ev.id}
                      className="p-3 rounded-xl border border-slate-200 bg-[#F8FAFC] flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="material-symbols-outlined text-slate-500 text-base">
                          description
                        </span>
                        <span className="text-xs font-bold text-slate-800 truncate">
                          {ev.fileName}
                        </span>
                      </div>
                      <a
                        href={ev.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-[#2563EB] hover:underline whitespace-nowrap"
                      >
                        View ↗
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No photographic or work order evidence uploaded yet.
                </div>
              )}
            </div>

            {/* Linked Reports Card */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs">
              <h3 className="text-sm font-bold text-[#0F172A] pb-3 border-b border-[#E2E8F0] mb-4">
                Cross-Linked Barrier Observations
              </h3>

              {ticket.linkedReports && ticket.linkedReports.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {ticket.linkedReports.map((lr) => (
                    <div
                      key={lr.id}
                      className="p-3 rounded-xl border border-amber-200 bg-amber-50/60 flex flex-col gap-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase text-amber-800">
                          {lr.type.replace("_", " ")}
                        </span>
                        <span className="text-[10px] text-slate-500">{lr.date}</span>
                      </div>
                      <p className="text-xs text-slate-800 font-medium">{lr.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No recurring precursor violations linked to this ticket.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── EXTENSION MODAL ─────────────────────────────────── */}
      {showExtensionModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-2xl p-6 flex flex-col gap-4 animate-in fade-in zoom-in-95">
            <h2 className="text-base font-bold text-[#0F172A]">Request Watch Extension</h2>
            <p className="text-xs text-slate-500">
              Lengthen the verification surveillance period if heavy site activity requires extra validation.
            </p>

            {extensionSubmitted ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold text-center">
                ✓ Extension approved and logged to audit trail.
              </div>
            ) : (
              <>
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
                    Additional Watch Days
                  </label>
                  <select
                    value={extensionDays}
                    onChange={(e) => setExtensionDays(parseInt(e.target.value))}
                    className="w-full h-10 px-3 border border-slate-200 rounded-xl text-xs focus:border-[#2563EB] focus:outline-none"
                  >
                    <option value={7}>+7 Days</option>
                    <option value={15}>+15 Days</option>
                    <option value={30}>+30 Days</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
                    Extension Justification
                  </label>
                  <textarea
                    value={extensionReason}
                    onChange={(e) => setExtensionReason(e.target.value)}
                    placeholder="Reason for surveillance extension..."
                    className="w-full h-20 p-2.5 border border-slate-200 rounded-xl text-xs focus:border-[#2563EB] focus:outline-none resize-none"
                  />
                </div>

                <div className="flex gap-2 pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowExtensionModal(false)}
                    className="flex-1 h-9 border border-slate-200 rounded-xl text-xs font-bold uppercase hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleExtension}
                    className="flex-1 h-9 bg-[#2563EB] text-white rounded-xl text-xs font-bold uppercase hover:bg-[#1D4ED8]"
                  >
                    Confirm Extension
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </AppLayout>
  );
}
