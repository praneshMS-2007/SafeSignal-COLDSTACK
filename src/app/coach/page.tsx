"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";

function CoachContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reportId = searchParams.get("reportId");
  const question = searchParams.get("question") || "Was the safety barrier in place before work started?";
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAnswer = async (answer: "Yes" | "No" | "Unknown") => {
    if (!reportId) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, answer }),
      });
      const data = await res.json();

      if (data.isStopWork) {
        router.push(`/alert/${reportId}`);
      } else {
        router.push(`/reports/${reportId}`);
      }
    } catch {
      router.push("/reports");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-background min-h-screen w-full overflow-hidden flex flex-col relative">
      {/* Dimmed background */}
      <div className="absolute inset-0 bg-surface-variant/80 backdrop-blur-sm z-0 flex flex-col pointer-events-none">
        <header className="w-full h-14 border-b-2 border-outline-variant bg-surface flex justify-between items-center px-4 opacity-50">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">menu</span>
            <span className="text-headline-lg-mobile font-bold text-primary">SafeSignal</span>
          </div>
          <span className="text-label-caps text-primary">OFFLINE</span>
        </header>
        <main className="flex-1 p-4 opacity-50 space-y-4">
          <div className="h-24 bg-surface-container rounded border-2 border-outline-variant"></div>
          <div className="h-48 bg-surface-container rounded border-2 border-outline-variant"></div>
        </main>
      </div>

      {/* Modal */}
      <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
        <div className="bg-surface w-full max-w-sm rounded-lg border-2 border-outline-variant flex flex-col overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="p-6 pb-2 border-b-2 border-surface-container-high bg-surface-container-lowest">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined filled" style={{ color: "#8A5A00" }}>help</span>
              <span className="text-label-caps uppercase" style={{ color: "#8A5A00" }}>One quick question</span>
            </div>
            <h2 className="text-title-md font-semibold text-on-surface mb-2">
              {decodeURIComponent(question)}
            </h2>
          </div>

          {/* Actions */}
          <div className="p-6 flex flex-col gap-3 bg-surface">
            <button
              onClick={() => handleAnswer("Yes")}
              disabled={isSubmitting}
              className="w-full h-[56px] flex items-center justify-center text-title-md font-semibold rounded border-2 text-white disabled:opacity-50"
              style={{ backgroundColor: "#1E5023", borderColor: "#153818" }}
            >
              Yes
            </button>
            <button
              onClick={() => handleAnswer("No")}
              disabled={isSubmitting}
              className="w-full h-[56px] flex items-center justify-center text-title-md font-semibold rounded border-2 text-white disabled:opacity-50"
              style={{ backgroundColor: "#A02D2D", borderColor: "#732020" }}
            >
              No
            </button>
            <button
              onClick={() => handleAnswer("Unknown")}
              disabled={isSubmitting}
              className="w-full h-[56px] flex items-center justify-center text-title-md font-semibold rounded border-2 border-outline-variant bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest transition-colors disabled:opacity-50"
            >
              Don&apos;t know
            </button>
          </div>

          {/* Footer */}
          <div className="p-6 pt-2 bg-surface-container-low border-t-2 border-surface-container-highest flex flex-col gap-4">
            <p className="text-body-md text-on-surface-variant text-center">
              This is the only fact we&apos;re missing. <span className="font-bold">3 seconds.</span>
            </p>
            <div className="bg-surface-container rounded p-3 border-l-4 border-outline">
              <p className="font-mono text-mono-code text-outline text-sm italic">
                &quot;Report submitted for analysis&quot;
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CoachPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <CoachContent />
    </Suspense>
  );
}
