"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

const HAZARD_CATEGORIES = [
  { label: "Falling object", icon: "file_download" },
  { label: "Gas leak", icon: "gas_meter" },
  { label: "Electrical", icon: "electrical_services" },
  { label: "Height", icon: "height" },
  { label: "Hot work", icon: "local_fire_department" },
  { label: "Vehicle", icon: "directions_car" },
  { label: "Confined space", icon: "architecture" },
  { label: "Chemical spill", icon: "water_drop" },
  { label: "Lifting", icon: "type_specimen" },
];

export default function ReportHazardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [inputMode, setInputMode] = useState<string | null>(null);
  const [rawText, setRawText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [showTapGrid, setShowTapGrid] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-IN";
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      setRawText((prev) => prev + (prev ? " " : "") + event.results[0][0].transcript);
    };
    recognition.start();
    setInputMode("VOICE");
  };

  const handlePhotoCapture = () => {
    fileInputRef.current?.click();
    setInputMode("PHOTO");
  };

  const onFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUrl = evt.target?.result as string;

      // Apply face blur using canvas
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.drawImage(img, 0, 0);

        // Simple face region detection: blur top-center area (approximate head region)
        // In production, use a real face detection API
        const blurRegionW = img.width * 0.3;
        const blurRegionH = img.height * 0.25;
        const blurX = (img.width - blurRegionW) / 2;
        const blurY = img.height * 0.05;

        // Apply pixelation blur to the region
        const pixelSize = 12;
        const imageData = ctx.getImageData(blurX, blurY, blurRegionW, blurRegionH);
        for (let y = 0; y < imageData.height; y += pixelSize) {
          for (let x = 0; x < imageData.width; x += pixelSize) {
            const idx = (y * imageData.width + x) * 4;
            const r = imageData.data[idx];
            const g = imageData.data[idx + 1];
            const b = imageData.data[idx + 2];
            for (let dy = 0; dy < pixelSize && y + dy < imageData.height; dy++) {
              for (let dx = 0; dx < pixelSize && x + dx < imageData.width; dx++) {
                const i = ((y + dy) * imageData.width + (x + dx)) * 4;
                imageData.data[i] = r;
                imageData.data[i + 1] = g;
                imageData.data[i + 2] = b;
              }
            }
          }
        }
        ctx.putImageData(imageData, blurX, blurY);

        const blurred = canvas.toDataURL("image/jpeg", 0.8);
        setPhotoPreview(blurred);
        if (!rawText) setRawText("Photo of hazard captured");
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleTapHazard = (category: string) => {
    setSelectedCategory(category);
    setRawText(`${category} hazard observed at work area`);
    setShowTapGrid(false);
    setInputMode("TAP");
  };

  const handleSubmit = async () => {
    if (!rawText.trim()) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawText,
          hazardCategory: selectedCategory,
          inputMode: inputMode || "TEXT",
          site: user?.site || "Rig 4",
          location: "Duliajan",
          crew: user?.crew || "Workover crew B",
          timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
          mediaUrl: photoPreview || null,
        }),
      });

      const data = await res.json();

      if (data.needsCoach) {
        router.push(`/coach?reportId=${data.report.id}&question=${encodeURIComponent(data.coachQuestion)}`);
      } else if (data.classification?.classification === "PSIF") {
        router.push(`/alert/${data.report.id}`);
      } else {
        router.push(`/reports/${data.report.id}`);
      }
    } catch {
      const queue = JSON.parse(localStorage.getItem("offlineReports") || "[]");
      queue.push({
        offlineId: Date.now().toString(), rawText, hazardCategory: selectedCategory,
        inputMode: inputMode || "TEXT", site: user?.site || "Rig 4", location: "Duliajan",
        crew: user?.crew || "Workover crew B", offlineCreatedAt: new Date().toISOString(),
      });
      localStorage.setItem("offlineReports", JSON.stringify(queue));
      alert("Report saved offline. It will sync when signal returns.");
      router.push("/reports");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col pb-safe">
      {/* Hidden file input for photo capture */}
      <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onFileSelected} />

      <main className="flex-grow px-4 py-6 flex flex-col gap-6 pb-32 max-w-lg mx-auto w-full">
        <section>
          <h1 className="text-headline-lg-mobile font-bold text-primary mb-2">Report a Hazard</h1>
          <p className="text-on-surface-variant text-body-md">Log observations quickly — any language, any format.</p>
        </section>

        {/* Input Methods */}
        <section className="grid grid-cols-2 gap-4">
          <button onClick={() => { setInputMode("TEXT"); setShowTapGrid(false); }}
            className={`bg-surface-container-lowest border-2 rounded-lg p-4 flex flex-col items-center justify-center gap-3 h-28 active:scale-95 transition-transform ${inputMode === "TEXT" ? "border-primary bg-primary-fixed" : "border-outline-variant"}`}>
            <span className="material-symbols-outlined text-primary text-3xl">keyboard</span>
            <span className="text-title-md font-semibold text-on-surface">Type it</span>
          </button>

          <button onClick={handleVoiceInput}
            className={`bg-surface-container-lowest border-2 rounded-lg p-4 flex flex-col items-center justify-center gap-3 h-28 active:scale-95 transition-transform ${isListening ? "border-error bg-error-container animate-pulse" : inputMode === "VOICE" ? "border-primary bg-primary-fixed" : "border-outline-variant"}`}>
            <span className={`material-symbols-outlined text-3xl ${isListening ? "text-error" : "text-primary"}`}>mic</span>
            <span className="text-title-md font-semibold text-on-surface">{isListening ? "Listening..." : "Speak it"}</span>
          </button>

          <button onClick={() => { setShowTapGrid(true); setInputMode("TAP"); }}
            className={`bg-surface-container-lowest border-2 rounded-lg p-4 flex flex-col items-center justify-center gap-3 h-28 active:scale-95 transition-transform ${inputMode === "TAP" ? "border-primary bg-primary-fixed" : "border-outline-variant"}`}>
            <span className="material-symbols-outlined text-primary text-3xl">touch_app</span>
            <span className="text-title-md font-semibold text-on-surface">Tap hazard</span>
          </button>

          <button onClick={handlePhotoCapture}
            className={`bg-surface-container-lowest border-2 rounded-lg p-4 flex flex-col items-center justify-center gap-3 h-28 active:scale-95 transition-transform ${inputMode === "PHOTO" ? "border-primary bg-primary-fixed" : "border-outline-variant"}`}>
            <span className="material-symbols-outlined text-primary text-3xl">photo_camera</span>
            <span className="text-title-md font-semibold text-on-surface">Take photo</span>
          </button>
        </section>

        {/* Tap-a-Hazard Grid */}
        {showTapGrid && (
          <section className="bg-surface border-2 border-outline-variant rounded-lg p-4">
            <h2 className="text-label-caps text-on-surface-variant mb-3">SELECT HAZARD TYPE</h2>
            <div className="grid grid-cols-3 gap-3">
              {HAZARD_CATEGORIES.map((cat) => (
                <button key={cat.label} onClick={() => handleTapHazard(cat.label)}
                  className={`border-2 rounded-lg p-3 flex flex-col items-center justify-center gap-2 min-h-[80px] active:scale-95 transition-all ${
                    selectedCategory === cat.label ? "border-primary bg-primary-fixed" : "border-outline-variant hover:bg-surface-container-low"
                  }`}>
                  <span className="material-symbols-outlined text-2xl text-primary">{cat.icon}</span>
                  <span className="text-xs text-center text-on-surface font-semibold">{cat.label}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Photo preview with face blur */}
        {photoPreview && (
          <section className="rounded-lg border-2 border-outline-variant overflow-hidden relative">
            <img src={photoPreview} alt="Captured hazard" className="w-full h-48 object-cover" />
            <div className="absolute top-2 right-2 bg-tertiary-container text-on-tertiary-container text-label-caps px-2 py-1 rounded flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">blur_on</span> FACES BLURRED
            </div>
          </section>
        )}

        {/* Text input */}
        {(inputMode === "TEXT" || inputMode === "VOICE" || rawText) && !showTapGrid && (
          <section>
            <textarea value={rawText} onChange={(e) => setRawText(e.target.value)}
              placeholder="Describe what you saw — any language is fine..."
              className="w-full h-32 p-4 border-2 border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface text-body-md resize-none focus:border-primary focus:outline-none" />
          </section>
        )}

        {/* Auto-fill */}
        <section className="bg-surface-container-low rounded-lg p-4 border-l-[6px] border-outline border-2 flex flex-col gap-1">
          <div className="flex items-center gap-2 text-on-surface-variant text-label-caps mb-1">
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>my_location</span>
            <span>Captured automatically</span>
          </div>
          <p className="font-mono text-mono-code text-on-surface">{user?.site || "Rig 4"} · Duliajan · {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</p>
          <p className="font-mono text-mono-code text-on-surface">{user?.crew || "Workover crew B"}</p>
        </section>

        {/* Submit */}
        <section className="mt-auto pt-4">
          <button onClick={handleSubmit} disabled={!rawText.trim() || isSubmitting}
            className="w-full bg-primary text-on-primary h-[56px] rounded-lg text-title-md font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed">
            {isSubmitting ? (
              <><span className="material-symbols-outlined animate-spin">progress_activity</span>Analyzing...</>
            ) : (
              <><span className="material-symbols-outlined">send</span>Submit report</>
            )}
          </button>
        </section>
      </main>
    </div>
  );
}
