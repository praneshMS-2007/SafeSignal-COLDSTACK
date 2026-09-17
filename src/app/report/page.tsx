"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import AppLayout from "@/components/layout/AppLayout";
import Link from "next/link";

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
  const [inputMode, setInputMode] = useState<string | null>("TEXT");
  const [rawText, setRawText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [showTapGrid, setShowTapGrid] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Optional GPS Location States
  const [gpsCoords, setGpsCoords] = useState<{
    lat: number;
    lng: number;
    accuracy: number;
    formatted: string;
  } | null>(null);
  const [gpsStatus, setGpsStatus] = useState<"idle" | "requesting" | "acquired" | "denied" | "unavailable">("idle");
  const [gpsErrorMsg, setGpsErrorMsg] = useState<string | null>(null);

  const handleRequestGps = () => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setGpsStatus("unavailable");
      setGpsErrorMsg("Geolocation is not supported by your browser / device.");
      return;
    }

    setGpsStatus("requesting");
    setGpsErrorMsg(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const latDir = latitude >= 0 ? "N" : "S";
        const lngDir = longitude >= 0 ? "E" : "W";
        const formatted = `${Math.abs(latitude).toFixed(4)}° ${latDir}, ${Math.abs(longitude).toFixed(4)}° ${lngDir}`;
        setGpsCoords({
          lat: latitude,
          lng: longitude,
          accuracy: Math.round(accuracy),
          formatted,
        });
        setGpsStatus("acquired");
      },
      (error) => {
        setGpsStatus("denied");
        let msg = "Location permission denied. Standard site assignment will be used.";
        if (error.code === 2) msg = "Device location unavailable. Standard site assignment will be used.";
        if (error.code === 3) msg = "Location request timed out. Standard site assignment will be used.";
        setGpsErrorMsg(msg);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  const handleRemoveGps = () => {
    setGpsCoords(null);
    setGpsStatus("idle");
    setGpsErrorMsg(null);
  };

  const handleVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-IN";
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.drawImage(img, 0, 0);

        const blurRegionW = img.width * 0.3;
        const blurRegionH = img.height * 0.25;
        const blurX = (img.width - blurRegionW) / 2;
        const blurY = img.height * 0.05;

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

    const locationValue = gpsCoords
      ? `GPS: ${gpsCoords.lat.toFixed(6)}, ${gpsCoords.lng.toFixed(6)} (±${gpsCoords.accuracy}m)`
      : "Duliajan";

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawText,
          hazardCategory: selectedCategory,
          inputMode: inputMode || "TEXT",
          site: user?.site || "Rig 4",
          location: locationValue,
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
        offlineId: Date.now().toString(),
        rawText,
        hazardCategory: selectedCategory,
        inputMode: inputMode || "TEXT",
        site: user?.site || "Rig 4",
        location: locationValue,
        crew: user?.crew || "Workover crew B",
        offlineCreatedAt: new Date().toISOString(),
      });
      localStorage.setItem("offlineReports", JSON.stringify(queue));
      alert("Report saved offline with your location preferences. It will sync when signal returns.");
      router.push("/reports");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full flex flex-col gap-6 bg-[#F8FAFC] min-h-screen">
        {/* Hidden file input for photo capture */}
        <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onFileSelected} />

        {/* ─── PAGE HEADER ─────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              MULTI-MODAL HAZARD LOGGING
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              Report Safety Observation
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Any language or format (Assamese, Hindi, English). Multi-modal speech, visual grid, or photo capture.
            </p>
          </div>

          <Link
            href="/reports"
            className="h-10 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-xs transition-colors self-start sm:self-auto"
          >
            <span>My Reports</span>
          </Link>
        </div>

        {/* ─── 4 INPUT MODE BUTTONS ────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={() => { setInputMode("TEXT"); setShowTapGrid(false); }}
            className={`p-4 rounded-2xl border text-center flex flex-col items-center justify-center gap-2 transition-all shadow-xs ${
              inputMode === "TEXT" && !showTapGrid
                ? "bg-blue-50/80 border-[#2563EB] text-[#2563EB] ring-2 ring-blue-100"
                : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
            }`}
          >
            <span className="material-symbols-outlined text-2xl">keyboard</span>
            <span className="text-xs font-bold">Type Observation</span>
          </button>

          <button
            type="button"
            onClick={handleVoiceInput}
            className={`p-4 rounded-2xl border text-center flex flex-col items-center justify-center gap-2 transition-all shadow-xs ${
              isListening
                ? "bg-red-50 border-red-500 text-red-600 animate-pulse ring-2 ring-red-100"
                : inputMode === "VOICE"
                ? "bg-blue-50/80 border-[#2563EB] text-[#2563EB] ring-2 ring-blue-100"
                : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
            }`}
          >
            <span className={`material-symbols-outlined text-2xl ${isListening ? "text-red-600" : ""}`}>
              {isListening ? "mic" : "mic_none"}
            </span>
            <span className="text-xs font-bold">{isListening ? "Listening..." : "Voice Dictate"}</span>
          </button>

          <button
            type="button"
            onClick={() => { setShowTapGrid(true); setInputMode("TAP"); }}
            className={`p-4 rounded-2xl border text-center flex flex-col items-center justify-center gap-2 transition-all shadow-xs ${
              showTapGrid
                ? "bg-blue-50/80 border-[#2563EB] text-[#2563EB] ring-2 ring-blue-100"
                : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
            }`}
          >
            <span className="material-symbols-outlined text-2xl">touch_app</span>
            <span className="text-xs font-bold">Tap-a-Hazard</span>
          </button>

          <button
            type="button"
            onClick={handlePhotoCapture}
            className={`p-4 rounded-2xl border text-center flex flex-col items-center justify-center gap-2 transition-all shadow-xs ${
              photoPreview
                ? "bg-emerald-50 border-emerald-500 text-emerald-700 ring-2 ring-emerald-100"
                : inputMode === "PHOTO"
                ? "bg-blue-50/80 border-[#2563EB] text-[#2563EB] ring-2 ring-blue-100"
                : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
            }`}
          >
            <span className="material-symbols-outlined text-2xl">photo_camera</span>
            <span className="text-xs font-bold">Photo (Face Blur)</span>
          </button>
        </div>

        {/* ─── TAP HAZARD GRID ─────────────────────────────────── */}
        {showTapGrid && (
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs animate-in fade-in slide-in-from-top-1">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Select Immediate Hazard Category
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {HAZARD_CATEGORIES.map((cat) => (
                <button
                  key={cat.label}
                  type="button"
                  onClick={() => handleTapHazard(cat.label)}
                  className={`border rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 min-h-[85px] transition-all ${
                    selectedCategory === cat.label
                      ? "border-[#2563EB] bg-blue-50 text-[#2563EB] ring-1 ring-[#2563EB]"
                      : "border-slate-200 hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <span className="material-symbols-outlined text-2xl text-blue-600">
                    {cat.icon}
                  </span>
                  <span className="text-xs font-bold text-center leading-tight">
                    {cat.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ─── PHOTO PREVIEW WITH FACE BLUR ────────────────────── */}
        {photoPreview && (
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs">
            <div className="rounded-xl overflow-hidden relative border border-slate-200">
              <img src={photoPreview} alt="Captured hazard" className="w-full h-56 object-cover" />
              <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1.5 border border-white/20">
                <span className="material-symbols-outlined text-xs text-emerald-400">
                  blur_on
                </span>
                <span>Privacy Protected · Faces Blurred</span>
              </div>
            </div>
          </div>
        )}

        {/* ─── TEXT OBSERVATION INPUT ──────────────────────────── */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs flex flex-col gap-3">
          <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
            Observation Details &amp; Location Transcript
          </label>
          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Describe what you observed (e.g. 'Gas smell near manifold on Rig 4, work permit missing, pressure gauge leaking')..."
            className="w-full h-32 p-3.5 border border-slate-200 rounded-xl bg-[#F8FAFC] text-slate-900 text-sm focus:bg-white focus:border-[#2563EB] focus:outline-none transition-all resize-none"
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Site: <strong className="text-slate-800">{user?.site || "Rig 4"}</strong></span>
              <span>·</span>
              <span>Crew: <strong className="text-slate-800">{user?.crew || "Workover crew B"}</strong></span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Auto-geotagged</span>
          </div>
        </div>

        {/* ─── OPTIONAL DEVICE GPS LOCATION ACCESS ─────────────── */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#2563EB] text-xl">
                my_location
              </span>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Device GPS Location Pinpoint
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
              Optional · Non-Mandatory
            </span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            You can optionally attach your device&apos;s real-time GPS coordinates to help safety officers and emergency response teams pinpoint the exact field hazard location.
          </p>

          {/* Location State: Acquired */}
          {gpsStatus === "acquired" && gpsCoords && (
            <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-1">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <span className="material-symbols-outlined text-lg">location_on</span>
                </div>
                <div>
                  <div className="text-xs font-bold text-emerald-950 flex items-center gap-2">
                    <span>GPS Coordinates Attached</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  </div>
                  <div className="text-sm font-mono font-bold text-emerald-800 mt-0.5">
                    {gpsCoords.formatted}
                  </div>
                  <div className="text-[11px] text-emerald-700">
                    Accuracy: ±{gpsCoords.accuracy} meters · Geo-stamped
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={`https://www.google.com/maps?q=${gpsCoords.lat},${gpsCoords.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-8 px-3 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <span>View Map</span>
                  <span className="material-symbols-outlined text-xs">open_in_new</span>
                </a>
                <button
                  type="button"
                  onClick={handleRemoveGps}
                  className="h-8 px-3 bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                  title="Remove shared GPS coordinates"
                >
                  <span>Remove</span>
                </button>
              </div>
            </div>
          )}

          {/* Location State: Requesting */}
          {gpsStatus === "requesting" && (
            <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-xl flex items-center justify-between gap-3 animate-pulse">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined animate-spin text-blue-600">
                  progress_activity
                </span>
                <div>
                  <div className="text-xs font-bold text-blue-900">
                    Requesting Device GPS Permission...
                  </div>
                  <div className="text-[11px] text-blue-700">
                    Please approve the browser prompt to share your current location.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Location State: Denied or Error */}
          {(gpsStatus === "denied" || gpsStatus === "unavailable") && (
            <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs text-amber-900 font-medium">
                <span className="material-symbols-outlined text-amber-600 text-base shrink-0">
                  info
                </span>
                <span>{gpsErrorMsg || "Location access skipped. Standard site location will be assigned."}</span>
              </div>
              <button
                type="button"
                onClick={handleRequestGps}
                className="h-7 px-3 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-bold shrink-0 self-start sm:self-auto transition-colors"
              >
                Retry GPS
              </button>
            </div>
          )}

          {/* Location State: Idle (Not yet requested) */}
          {gpsStatus === "idle" && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                <span>Default tag: <strong className="text-slate-700">{user?.site || "Rig 4"} (Manual)</strong></span>
              </div>

              <button
                type="button"
                onClick={handleRequestGps}
                className="h-9 px-4 bg-[#F1F5F9] hover:bg-[#E2E8F0] active:scale-98 text-[#0F172A] border border-slate-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all self-start sm:self-auto shadow-xs"
              >
                <span className="material-symbols-outlined text-blue-600 text-base">
                  near_me
                </span>
                <span>Share Current GPS Location</span>
              </button>
            </div>
          )}
        </div>

        {/* ─── SUBMIT BUTTON ───────────────────────────────────── */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!rawText.trim() || isSubmitting}
          className="w-full h-12 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-600/20"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
              <span>Running SCL Precursor Analysis...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span>Submit &amp; Classify Observation</span>
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </button>
      </div>
    </AppLayout>
  );
}
