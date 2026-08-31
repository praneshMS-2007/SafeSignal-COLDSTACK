"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import Link from "next/link";

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
  report: { rawText: string; classification: { classification: string } | null };
  linkedReports: { id: string; type: string; description: string; date: string; reportRef: string | null }[];
  evidences?: { id: string; fileName: string; fileUrl: string; createdAt: string }[];
}

const STEPS = ["OPEN", "ASSIGNED", "FIXED", "UNDER_WATCH", "VERIFIED_CLOSED"];
const STEP_LABELS = ["Open", "Assigned", "Fixed", "Under Watch", "Verified Closed"];

function getLinkedReportStyle(type: string) {
  if (type === "FAILED_VERIFICATION") return "text-error bg-error-container";
  if (type === "INCIDENT_NEAR_MISS") return "text-amber-800 bg-amber-100";
  return "text-on-surface-variant bg-surface-container-highest";
}

export default function TicketDetailPage() {
  const params = useParams();
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showExtensionModal, setShowExtensionModal] = useState(false);
  const [extensionDays, setExtensionDays] = useState(15);
  const [extensionReason, setExtensionReason] = useState("");
  const [extensionSubmitted, setExtensionSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`/api/tickets/${params.id}`)
      .then((r) => r.json())
      .then(setTicket)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params.id]);

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
    }, 1500);
  };

  const handleEvidenceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !ticket) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const dataUrl = evt.target?.result as string;
      // Save evidence via API
      await fetch(`/api/tickets/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          addEvidence: {
            fileName: file.name,
            fileUrl: dataUrl.substring(0, 200) + "...", // Truncate for SQLite
            uploadedBy: "Current user",
          },
        }),
      });
      window.location.reload();
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="p-12 text-center text-on-surface-variant">
          <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span>
          Loading ticket...
        </div>
      </AppLayout>
    );
  }

  if (!ticket) {
    return <AppLayout><div className="p-12 text-center text-on-surface-variant">Ticket not found</div></AppLayout>;
  }

  const currentStepIdx = STEPS.indexOf(ticket.status);
  const watchProgress = ticket.watchDaysTotal > 0 ? (ticket.watchDaysElapsed / ticket.watchDaysTotal) * 100 : 0;

  return (
    <AppLayout>
      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept="image/*,.pdf,.doc,.docx" className="hidden" onChange={handleEvidenceUpload} />

      <div className="p-4 md:p-12 max-w-7xl mx-auto flex flex-col gap-8">
        {/* Breadcrumbs & Header */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-on-surface-variant text-label-caps">
            <Link href="/tickets" className="hover:text-primary transition-colors">TICKETS</Link>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span>REPAIR TICKET</span>
          </div>
          <div className="flex justify-between items-start flex-wrap gap-4">
            <h1 className="text-display-lg text-on-surface">Repair ticket #{ticket.id.slice(-4)}</h1>
            <div className="flex gap-4">
              <button
                onClick={() => setShowExtensionModal(true)}
                className="h-[56px] px-6 border-2 border-outline-variant text-on-surface text-title-md rounded hover:bg-surface-container transition-colors flex items-center gap-2 bg-surface"
              >
                <span className="material-symbols-outlined">edit_calendar</span>
                Request extension
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="h-[56px] px-6 bg-primary text-on-primary text-title-md rounded hover:bg-primary-container hover:text-on-primary-container transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined filled">upload_file</span>
                Add evidence
              </button>
            </div>
          </div>
        </div>

        {/* Stepper */}
        <div className="bg-surface-container-lowest border-2 border-outline-variant rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            {STEP_LABELS.map((label, i) => {
              const isComplete = i <= currentStepIdx;
              const isCurrent = i === currentStepIdx;
              return (
                <div key={label} className="flex flex-col items-center gap-2 flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-label-caps font-bold border-2 ${
                    isCurrent
                      ? "bg-primary text-on-primary border-primary"
                      : isComplete
                        ? "bg-tertiary-container text-on-tertiary-container border-tertiary"
                        : "bg-surface-container text-on-surface-variant border-outline-variant"
                  }`}>
                    {isComplete && !isCurrent ? (
                      <span className="material-symbols-outlined" style={{ fontSize: 20 }}>check</span>
                    ) : (
                      i + 1
                    )}
                  </div>
                  <span className={`text-label-caps text-center ${isCurrent ? "text-primary font-bold" : "text-on-surface-variant"}`}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Left: Ticket Info */}
          <div className="flex flex-col gap-6">
            {/* Details Card */}
            <div className="bg-surface-container-lowest border-2 border-outline-variant rounded-lg p-6">
              <h2 className="text-title-md font-semibold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">info</span>
                Details
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "BARRIER", value: ticket.barrier },
                  { label: "FAILURE MODE", value: ticket.failureMode },
                  { label: "OWNER", value: ticket.owner },
                  { label: "SITE", value: ticket.site },
                  { label: "DUE DATE", value: ticket.dueDate },
                  { label: "SOURCE REPORT", value: ticket.report?.rawText?.substring(0, 50) + "..." },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="text-label-caps text-on-surface-variant mb-1">{item.label}</div>
                    <div className="text-body-md text-on-surface font-semibold">{item.value || "—"}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Watch Period */}
            {(ticket.status === "UNDER_WATCH" || ticket.status === "FIXED") && (
              <div className="bg-surface-container-lowest border-2 border-outline-variant rounded-lg p-6">
                <h2 className="text-title-md font-semibold mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-600">visibility</span>
                  Watch Period
                </h2>
                <div className="flex justify-between text-body-md text-on-surface-variant mb-2">
                  <span>Day {ticket.watchDaysElapsed} of {ticket.watchDaysTotal}</span>
                  <span>{Math.round(watchProgress)}%</span>
                </div>
                <div className="h-3 bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${watchProgress}%` }}></div>
                </div>
                <p className="text-body-md text-on-surface-variant mt-3">
                  If the same barrier fails again during this period, the ticket reopens and escalates automatically.
                </p>
              </div>
            )}

            {/* Evidence */}
            {ticket.evidences && ticket.evidences.length > 0 && (
              <div className="bg-surface-container-lowest border-2 border-outline-variant rounded-lg p-6">
                <h2 className="text-title-md font-semibold mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">attach_file</span>
                  Evidence ({ticket.evidences.length})
                </h2>
                <div className="flex flex-col gap-2">
                  {ticket.evidences.map((ev) => (
                    <div key={ev.id} className="flex items-center gap-3 p-3 border-2 border-outline-variant rounded">
                      <span className="material-symbols-outlined text-on-surface-variant">description</span>
                      <div>
                        <p className="text-body-md font-semibold text-on-surface">{ev.fileName}</p>
                        <p className="text-label-caps text-on-surface-variant">{new Date(ev.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Linked Reports */}
          <div className="bg-surface-container-lowest border-2 border-outline-variant rounded-lg p-6">
            <h2 className="text-title-md font-semibold mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">link</span>
              Linked Reports ({ticket.linkedReports.length})
            </h2>
            {ticket.linkedReports.length === 0 ? (
              <p className="text-on-surface-variant text-body-md">No linked reports yet.</p>
            ) : (
              <div className="flex flex-col gap-4 relative pl-6 border-l-2 border-outline-variant ml-2">
                {ticket.linkedReports.map((lr) => (
                  <div key={lr.id} className="relative">
                    <div className="absolute w-3 h-3 rounded-full bg-surface-variant border-2 border-surface -left-[27px] top-2"></div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className={`${getLinkedReportStyle(lr.type)} text-label-caps px-2 py-0.5 rounded`}>
                          {lr.type.replace(/_/g, " ")}
                        </span>
                        <span className="text-label-caps text-on-surface-variant">{lr.date}</span>
                      </div>
                      <p className="text-body-md text-on-surface">{lr.description}</p>
                      {lr.reportRef && (
                        <p className="font-mono text-mono-code text-on-surface-variant">{lr.reportRef}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Extension Request Modal */}
      {showExtensionModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
          <div className="bg-surface w-full max-w-md rounded-lg border-2 border-outline-variant overflow-hidden">
            <div className="p-6 border-b-2 border-outline-variant">
              <h2 className="text-title-md font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">edit_calendar</span>
                Request Extension
              </h2>
            </div>
            <div className="p-6 flex flex-col gap-4">
              {extensionSubmitted ? (
                <div className="text-center py-4">
                  <span className="material-symbols-outlined text-tertiary text-5xl mb-2">check_circle</span>
                  <p className="text-title-md text-on-surface">Extension approved!</p>
                  <p className="text-body-md text-on-surface-variant mt-1">Watch period extended by {extensionDays} days.</p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="text-label-caps text-on-surface-variant block mb-2">EXTEND BY (DAYS)</label>
                    <div className="flex items-center gap-4">
                      {[7, 15, 30].map((d) => (
                        <button key={d}
                          onClick={() => setExtensionDays(d)}
                          className={`flex-1 h-[48px] rounded border-2 text-label-caps font-bold transition-colors ${
                            extensionDays === d
                              ? "border-primary bg-primary-container text-on-primary-container"
                              : "border-outline-variant text-on-surface-variant"
                          }`}>
                          {d} days
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-label-caps text-on-surface-variant block mb-2">REASON</label>
                    <textarea
                      value={extensionReason}
                      onChange={(e) => setExtensionReason(e.target.value)}
                      placeholder="Why is more time needed?"
                      className="w-full h-20 p-3 border-2 border-outline-variant rounded bg-surface-container-lowest text-body-md resize-none focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowExtensionModal(false)}
                      className="flex-1 h-[48px] border-2 border-outline-variant rounded text-label-caps hover:bg-surface-container-low transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleExtension}
                      className="flex-1 h-[48px] bg-primary text-on-primary rounded text-label-caps font-bold"
                    >
                      Submit
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
