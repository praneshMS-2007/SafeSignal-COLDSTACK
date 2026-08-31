"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface ReportData {
  id: string;
  rawText: string;
  site: string;
  classification: {
    classification: string;
    iogpRule: string;
    finalVerdict: string;
  };
}

export default function StopWorkAlertPage() {
  const params = useParams();
  const [report, setReport] = useState<ReportData | null>(null);

  useEffect(() => {
    fetch(`/api/reports/${params.id}`)
      .then((r) => r.json())
      .then(setReport)
      .catch(() => {});
  }, [params.id]);

  const riskDescription = report?.classification?.finalVerdict
    || "Pressurised gas line opened with no work permit. Credible outcome: fatal exposure.";

  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col">
      {/* Red Banner */}
      <div className="w-full bg-critical-red text-white pt-12 pb-8 px-4 flex flex-col items-center justify-center border-b-4 border-on-error-container relative">
        <div className="mb-4">
          <span className="material-symbols-outlined filled text-[64px]">warning</span>
        </div>
        <h1 className="text-display-lg text-center mb-2 uppercase tracking-tighter font-bold">
          STOP WORK IN THIS AREA
        </h1>
        <p className="text-body-lg text-center text-white/90">
          This report has been flagged as high risk.
        </p>
      </div>

      <main className="flex-1 flex flex-col px-4 py-3 gap-8 mt-4 mb-24 max-w-lg mx-auto w-full">
        {/* Risk Detail Card */}
        <section className="bg-surface-container-lowest border-2 border-outline-variant rounded overflow-hidden relative">
          <div className="absolute left-0 top-0 bottom-0 w-[6px] bg-amber-warning"></div>
          <div className="p-6 pl-8">
            <h2 className="text-title-md font-semibold text-on-surface mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-warning">policy</span>
              What could have happened
            </h2>
            <div className="bg-surface p-4 border-2 border-outline-variant rounded mt-4">
              <p className="text-body-md text-on-surface-variant font-medium">{riskDescription}</p>
            </div>
          </div>
        </section>

        {/* Action List Card */}
        <section className="bg-surface-container-lowest border-2 border-outline-variant rounded overflow-hidden relative">
          <div className="absolute left-0 top-0 bottom-0 w-[6px] bg-primary"></div>
          <div className="p-6 pl-8">
            <h2 className="text-title-md font-semibold text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">assignment_late</span>
              Do this now
            </h2>
            <ol className="flex flex-col gap-0 border-t-2 border-outline-variant">
              {[
                "Stop work in this area",
                "Inform your supervisor immediately",
                "Do not resume until cleared",
              ].map((step, i) => (
                <li key={i} className="min-h-[64px] flex items-center gap-4 py-3 border-b-2 border-outline-variant">
                  <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold flex-shrink-0">
                    {i + 1}
                  </div>
                  <span className="text-body-md font-bold text-on-surface">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Status Strip */}
        <div className="bg-safe-green text-white p-4 rounded flex items-center gap-3 border-2 border-[#153818]">
          <span className="material-symbols-outlined filled">check_circle</span>
          <p className="text-body-md font-bold">
            Your site safety officer has been alerted — {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      </main>

      {/* Fixed Bottom Action */}
      <div className="fixed bottom-0 left-0 w-full bg-surface-container-lowest border-t-2 border-outline-variant p-4 pb-safe z-50">
        <Link
          href={report ? `/reports/${report.id}` : "/triage"}
          className="w-full h-[56px] bg-primary text-on-primary rounded flex items-center justify-center gap-2 text-label-caps uppercase active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined">description</span>
          View full analysis
        </Link>
      </div>
    </div>
  );
}
