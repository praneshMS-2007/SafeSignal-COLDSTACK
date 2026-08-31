"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";

interface ReportDetail {
  id: string;
  rawText: string;
  site: string;
  crew: string;
  timestamp: string;
  mediaUrl: string | null;
  classification: {
    classification: string;
    priority: number;
    energyType: string;
    killThreshold: string;
    workerProximity: string;
    barrierRequired: string;
    barrierState: string;
    iogpRule: string;
    anyoneHurt: string;
    ruleVersion: string;
    modelVersion: string;
    finalVerdict: string;
    evidenceQuotes: string;
    confidence: number;
    ruleVerdict: string;
    aiVerdict: string;
  } | null;
}

interface SimilarReport {
  id: string;
  rawText: string;
  site: string;
  createdAt: string;
  classification: { classification: string; barrierState: string } | null;
}

export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCorrectModal, setShowCorrectModal] = useState(false);
  const [correctedClass, setCorrectedClass] = useState("");
  const [correctionNote, setCorrectionNote] = useState("");
  const [similarReports, setSimilarReports] = useState<SimilarReport[]>([]);

  useEffect(() => {
    fetch(`/api/reports/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        setReport(data);
        // Fetch similar reports (same barrier)
        if (data.classification?.barrierRequired) {
          fetch(`/api/reports?site=${encodeURIComponent(data.site || "")}`)
            .then((r) => r.json())
            .then((reports: SimilarReport[]) => {
              const similar = reports.filter(
                (r: SimilarReport) =>
                  r.id !== data.id &&
                  r.classification?.barrierState === "ABSENT"
              );
              setSimilarReports(similar.slice(0, 3));
            })
            .catch(() => {});
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleConfirm = async () => {
    await fetch(`/api/reports/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "ASSIGNED" }),
    });
    router.push("/triage");
  };

  const handleCorrection = async () => {
    if (!correctedClass) return;
    await fetch(`/api/reports/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "TRIAGED",
        correctedClassification: correctedClass,
        correctionNote,
      }),
    });
    setShowCorrectModal(false);
    window.location.reload();
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="p-12 text-center text-on-surface-variant">
          <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span>
          Loading report analysis...
        </div>
      </AppLayout>
    );
  }

  if (!report) {
    return (
      <AppLayout>
        <div className="p-12 text-center text-on-surface-variant">Report not found</div>
      </AppLayout>
    );
  }

  const c = report.classification;
  const quotes: string[] = c?.evidenceQuotes ? JSON.parse(c.evidenceQuotes) : [];
  const isCritical = c?.classification === "PSIF" || c?.classification === "SIF";

  const extractionRows = [
    { field: "Energy type", value: c?.energyType || "—", quote: quotes[0] || "—" },
    { field: "Above kill threshold", value: c?.killThreshold || "—", quote: "—" },
    { field: "Worker proximity", value: c?.workerProximity || "—", quote: quotes[1] || "—" },
    { field: "Barrier required", value: c?.barrierRequired || "—", quote: "—" },
    { field: "Barrier state", value: c?.barrierState || "—", quote: quotes[2] || "—", highlight: c?.barrierState === "ABSENT" },
    { field: "Anyone hurt", value: c?.anyoneHurt || "—", quote: "—" },
  ];

  return (
    <AppLayout>
      <div className="p-4 md:p-12 flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-display-lg text-on-surface mb-2">Report Detail</h2>
              <p className="text-body-lg text-on-surface-variant">
                Reviewing extracted safety data against field worker input.
              </p>
            </div>
            <button
              onClick={() => router.back()}
              className="h-[56px] px-6 border-2 border-outline-variant rounded text-on-surface hover:bg-surface-container-highest text-title-md flex items-center gap-2 transition-colors"
            >
              <span className="material-symbols-outlined">arrow_back</span>
              <span>Back</span>
            </button>
          </div>

          {/* Verdict Bar */}
          <div className={`w-full ${isCritical ? "bg-[#A02D2D]" : "bg-primary-container"} ${isCritical ? "text-white" : "text-on-primary-container"} p-6 rounded-lg mb-8 border-l-[6px] ${isCritical ? "border-error" : "border-primary"} flex flex-col md:flex-row md:items-center justify-between gap-4`}>
            <div>
              <div className="text-title-md font-bold mb-1 flex items-center">
                <span className="material-symbols-outlined mr-2">warning</span>
                {c?.classification} — Priority {c?.priority} · IOGP: {c?.iogpRule || "N/A"}
              </div>
              <div className="text-body-md opacity-90">
                {c?.finalVerdict}. Rule {c?.ruleVersion}, model {c?.modelVersion}.
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <button
                onClick={handleConfirm}
                className="h-[56px] px-6 bg-[#1E5023] text-white rounded text-title-md font-semibold border-2 border-[#153818] hover:opacity-90 transition-colors flex items-center justify-center"
              >
                <span className="material-symbols-outlined mr-2">check_circle</span> Confirm
              </button>
              <button
                onClick={() => setShowCorrectModal(true)}
                className={`h-[56px] px-6 border-2 rounded text-title-md font-semibold hover:opacity-90 transition-colors flex items-center justify-center ${isCritical ? "bg-transparent border-white text-white" : "bg-transparent border-primary text-primary"}`}
              >
                <span className="material-symbols-outlined mr-2">edit</span> Correct this
              </button>
            </div>
          </div>

          {/* Dual Check Audit Trail */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-surface-container-lowest border-2 border-outline-variant rounded-lg p-4">
              <div className="text-label-caps text-on-surface-variant mb-2 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">gavel</span> RULE ENGINE
              </div>
              <p className="font-mono text-mono-code text-on-surface">{c?.ruleVerdict || "—"}</p>
            </div>
            <div className="bg-surface-container-lowest border-2 border-outline-variant rounded-lg p-4">
              <div className="text-label-caps text-on-surface-variant mb-2 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">memory</span> AI MODEL
              </div>
              <p className="font-mono text-mono-code text-on-surface">{c?.aiVerdict || "—"}</p>
            </div>
          </div>

          {/* Split View */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
            {/* Worker Input */}
            <div className="bg-surface-container-lowest border-2 border-outline-variant rounded-lg p-6 flex flex-col">
              <div className="border-b-2 border-outline-variant pb-4 mb-4 flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-3xl">record_voice_over</span>
                <h3 className="text-title-md font-semibold text-primary">Worker Input</h3>
              </div>
              <div className="flex-1 flex flex-col gap-6">
                <div>
                  <div className="text-label-caps text-on-surface-variant mb-2">RAW TRANSCRIPT</div>
                  <div className="bg-surface-container-low border-2 border-outline-variant p-4 rounded font-mono text-mono-code text-on-surface break-words leading-relaxed">
                    &quot;{report.rawText}&quot;
                  </div>
                </div>
                <div>
                  <div className="text-label-caps text-on-surface-variant mb-2">METADATA</div>
                  <div className="bg-surface-container-low border-2 border-outline-variant p-4 rounded font-mono text-mono-code text-on-surface">
                    <p>Site: {report.site || "—"} · Crew: {report.crew || "—"} · Time: {report.timestamp || "—"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Extraction */}
            <div className="bg-surface-container-lowest border-2 border-outline-variant rounded-lg p-6 flex flex-col">
              <div className="border-b-2 border-outline-variant pb-4 mb-4 flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary text-3xl">memory</span>
                <h3 className="text-title-md font-semibold text-secondary">AI Extraction</h3>
              </div>
              <div className="flex-1 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-outline-variant">
                      <th className="py-3 px-4 text-label-caps text-on-surface-variant w-1/3">Field</th>
                      <th className="py-3 px-4 text-label-caps text-on-surface-variant w-1/3">Value</th>
                      <th className="py-3 px-4 text-label-caps text-on-surface-variant w-1/3">Evidence</th>
                    </tr>
                  </thead>
                  <tbody className="text-body-md text-on-surface divide-y-2 divide-surface-container-highest">
                    {extractionRows.map((row, i) => (
                      <tr key={i}
                        className={row.highlight
                          ? "bg-error-container/30 border-l-[6px] border-error hover:bg-error-container transition-colors"
                          : "hover:bg-surface-container-low transition-colors"
                        }>
                        <td className={`py-4 px-4 font-semibold ${row.highlight ? "text-error" : ""}`}>{row.field}</td>
                        <td className={`py-4 px-4 ${row.highlight ? "font-bold text-error" : ""}`}>{row.value}</td>
                        <td className="py-4 px-4 font-mono text-sm text-on-surface-variant">{row.quote}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Cross-Report Pattern — Similar Reports */}
          {similarReports.length > 0 && (
            <div className="bg-surface-container-lowest border-2 border-outline-variant rounded-lg p-6 mb-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-secondary">hub</span>
                <h3 className="text-title-md font-semibold">Related Reports — Same Site</h3>
                <span className="bg-secondary-container text-on-secondary-container text-label-caps px-2 py-0.5 rounded-full ml-2">
                  Pattern detected
                </span>
              </div>
              <p className="text-body-md text-on-surface-variant mb-4">
                These reports involve barrier failures at the same location, suggesting a recurring hazard.
              </p>
              <div className="flex flex-col gap-3">
                {similarReports.map((sr) => (
                  <a
                    key={sr.id}
                    href={`/reports/${sr.id}`}
                    className="flex items-center justify-between p-3 border-2 border-outline-variant rounded hover:bg-surface-container-low transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-body-md text-on-surface truncate">{sr.rawText}</p>
                      <p className="text-label-caps text-on-surface-variant">{sr.site}</p>
                    </div>
                    <span className="bg-error-container text-on-error-container text-label-caps px-2 py-1 rounded ml-2 whitespace-nowrap">
                      {sr.classification?.classification}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Correction Modal */}
      {showCorrectModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
          <div className="bg-surface w-full max-w-md rounded-lg border-2 border-outline-variant overflow-hidden">
            <div className="p-6 border-b-2 border-outline-variant">
              <h2 className="text-title-md font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">edit_note</span>
                Correct Classification
              </h2>
              <p className="text-body-md text-on-surface-variant mt-1">
                Override the AI&apos;s decision. This correction will be logged for model improvement.
              </p>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div>
                <label className="text-label-caps text-on-surface-variant block mb-2">CORRECT CLASSIFICATION</label>
                <div className="grid grid-cols-2 gap-3">
                  {["PSIF", "SIF", "CAPACITY", "ROUTINE"].map((cls) => (
                    <button key={cls}
                      onClick={() => setCorrectedClass(cls)}
                      className={`h-[48px] rounded border-2 text-label-caps font-bold transition-colors ${
                        correctedClass === cls
                          ? "border-primary bg-primary-container text-on-primary-container"
                          : "border-outline-variant text-on-surface-variant hover:bg-surface-container-low"
                      }`}>
                      {cls}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-label-caps text-on-surface-variant block mb-2">NOTE (optional)</label>
                <textarea
                  value={correctionNote}
                  onChange={(e) => setCorrectionNote(e.target.value)}
                  placeholder="Why is the AI wrong?"
                  className="w-full h-20 p-3 border-2 border-outline-variant rounded bg-surface-container-lowest text-body-md resize-none focus:border-primary focus:outline-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCorrectModal(false)}
                  className="flex-1 h-[48px] border-2 border-outline-variant rounded text-label-caps hover:bg-surface-container-low transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCorrection}
                  disabled={!correctedClass}
                  className="flex-1 h-[48px] bg-primary text-on-primary rounded text-label-caps font-bold disabled:opacity-50"
                >
                  Submit Correction
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
