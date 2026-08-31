"use client";

import React from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "card" | "plain" | "iconOnly" | "darkCard";
  showSubtitle?: boolean;
}

export function SafeSignalIcon({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Background Squircle Gradient */}
        <linearGradient id="bgGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0B1E3B" />
          <stop offset="50%" stopColor="#031329" />
          <stop offset="100%" stopColor="#020B18" />
        </linearGradient>

        {/* Shield Outer Border Glow */}
        <linearGradient id="shieldBorder" x1="8" y1="6" x2="40" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="50%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#1E40AF" />
        </linearGradient>

        {/* Signal Radar Waves */}
        <linearGradient id="signalWave" x1="16" y1="12" x2="32" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#38BDF8" />
        </linearGradient>

        {/* Oil Drop & Flame Core */}
        <linearGradient id="oilFlame" x1="24" y1="14" x2="24" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="40%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#EA580C" />
        </linearGradient>

        {/* Gloss highlight */}
        <linearGradient id="gloss" x1="12" y1="8" x2="36" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Outer Squircle Container */}
      <rect width="48" height="48" rx="14" fill="url(#bgGrad)" />
      <rect
        x="0.75"
        y="0.75"
        width="46.5"
        height="46.5"
        rx="13.25"
        stroke="url(#shieldBorder)"
        strokeWidth="1.5"
        strokeOpacity="0.6"
      />

      {/* Dynamic Signal Pulse Arcs (Left & Right) */}
      {/* Outer Signal Arc */}
      <path
        d="M10 24C10 16.268 16.268 10 24 10C31.732 10 38 16.268 38 24"
        stroke="url(#signalWave)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="2 6"
        opacity="0.6"
      />
      {/* Mid Signal Arc */}
      <path
        d="M14 24C14 18.477 18.477 14 24 14C29.523 14 34 18.477 34 24"
        stroke="url(#signalWave)"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.85"
      />

      {/* Safety Shield Contour (Base Defense) */}
      <path
        d="M24 12L34 16.5V25C34 31.5 29.5 37.2 24 39C18.5 37.2 14 31.5 14 25V16.5L24 12Z"
        fill="#0B254A"
        fillOpacity="0.8"
        stroke="url(#shieldBorder)"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Oil Drop + Flame Energy Core in Center */}
      <path
        d="M24 18C24 18 19 25 19 28.5C19 31.26 21.24 33.5 24 33.5C26.76 33.5 29 31.26 29 28.5C29 25 24 18 24 18Z"
        fill="url(#oilFlame)"
      />

      {/* Inner White Radiant Spark (AI Telemetry Signal) */}
      <path
        d="M24 23C24 23 21.5 26.5 21.5 28.5C21.5 29.88 22.62 31 24 31C25.38 31 26.5 29.88 26.5 28.5C26.5 26.5 24 23 24 23Z"
        fill="#FFFFFF"
        fillOpacity="0.85"
      />

      {/* Shield Top Specular Gloss */}
      <path
        d="M24 13L32.5 16.8V23C29.5 22 26 21.5 24 21.5C20.5 21.5 17 22.5 15.5 23.5V16.8L24 13Z"
        fill="url(#gloss)"
      />
    </svg>
  );
}

export default function Logo({
  size = "md",
  variant = "card",
  showSubtitle = true,
}: LogoProps) {
  if (variant === "iconOnly") {
    const iconSize =
      size === "sm" ? "w-8 h-8" : size === "lg" ? "w-14 h-14" : "w-10 h-10";
    return <SafeSignalIcon className={iconSize} />;
  }

  if (variant === "card") {
    return (
      <div className="bg-white rounded-2xl p-3 flex items-center gap-3 shadow-md shadow-black/10 border border-slate-200 hover:border-slate-300 transition-all">
        <SafeSignalIcon className="w-10 h-10 shrink-0 drop-shadow-sm" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <div className="text-[15px] font-extrabold tracking-tight text-[#0F172A] flex items-center">
              <span>Safe</span>
              <span className="text-[#2563EB]">Signal</span>
            </div>
            <span className="text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 bg-[#EEF4FF] text-[#2563EB] rounded-md border border-[#BFDBFE]">
              OIL INDIA
            </span>
          </div>
          {showSubtitle && (
            <div className="text-[10px] font-bold tracking-wider text-slate-500 uppercase truncate mt-0.5">
              SIF Precursor AI
            </div>
          )}
        </div>
      </div>
    );
  }

  if (variant === "darkCard") {
    return (
      <div className="bg-[#0B1E3B]/90 backdrop-blur-md rounded-2xl p-3.5 flex items-center gap-3 shadow-lg shadow-black/30 border border-blue-900/50 hover:border-blue-700/60 transition-all">
        <SafeSignalIcon className="w-11 h-11 shrink-0 drop-shadow-md" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <div className="text-base font-extrabold tracking-tight text-white flex items-center">
              <span>Safe</span>
              <span className="text-[#60A5FA]">Signal</span>
            </div>
            <span className="text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 bg-[#2563EB]/30 text-[#93C5FD] rounded-md border border-blue-400/30">
              OIL INDIA
            </span>
          </div>
          {showSubtitle && (
            <div className="text-[10px] font-semibold tracking-wider text-blue-200/70 uppercase truncate mt-0.5">
              Industrial Safety ERP
            </div>
          )}
        </div>
      </div>
    );
  }

  // Plain variant (for TopBar or minimal headers)
  return (
    <div className="flex items-center gap-2.5">
      <SafeSignalIcon
        className={size === "sm" ? "w-8 h-8" : size === "lg" ? "w-12 h-12" : "w-9 h-9"}
      />
      <div>
        <div className="flex items-center gap-1.5">
          <span className="text-base font-extrabold tracking-tight text-[#0F172A]">
            Safe<span className="text-[#2563EB]">Signal</span>
          </span>
          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 bg-[#EEF4FF] text-[#2563EB] rounded border border-[#BFDBFE]">
            OIL INDIA
          </span>
        </div>
        {showSubtitle && (
          <div className="text-[9px] font-semibold tracking-wider text-slate-500 uppercase">
            Industrial Safety System
          </div>
        )}
      </div>
    </div>
  );
}
