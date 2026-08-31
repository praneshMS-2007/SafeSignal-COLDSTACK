"use client";

import React from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "card" | "plain" | "iconOnly" | "darkCard" | "sidebar";
  showSubtitle?: boolean;
}

export function SafeSignalIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Background Squircle Gradient */}
        <linearGradient id="sigBgGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1E3A8A" />
          <stop offset="50%" stopColor="#0F244A" />
          <stop offset="100%" stopColor="#0A162B" />
        </linearGradient>

        {/* Shield Outer Border Glow */}
        <linearGradient id="sigShieldBorder" x1="6" y1="6" x2="34" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="50%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>

        {/* Signal Radar Waves */}
        <linearGradient id="sigWave" x1="12" y1="10" x2="28" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#60A5FA" />
        </linearGradient>

        {/* Oil Drop & Flame Core */}
        <linearGradient id="sigFlame" x1="20" y1="12" x2="20" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="40%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#EA580C" />
        </linearGradient>
      </defs>

      {/* Outer Squircle Container with subtle glow */}
      <rect width="40" height="40" rx="10" fill="url(#sigBgGrad)" />
      <rect
        x="0.6"
        y="0.6"
        width="38.8"
        height="38.8"
        rx="9.4"
        stroke="url(#sigShieldBorder)"
        strokeWidth="1.2"
        strokeOpacity="0.8"
      />

      {/* Signal Telemetry Radar Waves (Left & Right) */}
      <path
        d="M9 20C9 13.925 13.925 9 20 9C26.075 9 31 13.925 31 20"
        stroke="url(#sigWave)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeDasharray="1.5 4"
        opacity="0.75"
      />
      <path
        d="M12 20C12 15.582 15.582 12 20 12C24.418 12 28 15.582 28 20"
        stroke="url(#sigWave)"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.9"
      />

      {/* Safety Shield Contour */}
      <path
        d="M20 11L28 14.5V21C28 26.2 24.5 30.8 20 32.2C15.5 30.8 12 26.2 12 21V14.5L20 11Z"
        fill="#0C2346"
        fillOpacity="0.9"
        stroke="url(#sigShieldBorder)"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />

      {/* Oil Drop & Energy Flame Core */}
      <path
        d="M20 15.5C20 15.5 16 21 16 23.8C16 26.12 17.79 28 20 28C22.21 28 24 26.12 24 23.8C24 21 20 15.5 20 15.5Z"
        fill="url(#sigFlame)"
      />

      {/* Inner White Radiant Spark (AI Telemetry) */}
      <path
        d="M20 19.5C20 19.5 18 22.2 18 23.8C18 24.9 18.9 25.8 20 25.8C21.1 25.8 22 24.9 22 23.8C22 22.2 20 19.5 20 19.5Z"
        fill="#FFFFFF"
        fillOpacity="0.9"
      />
    </svg>
  );
}

export default function Logo({
  size = "md",
  variant = "sidebar",
  showSubtitle = true,
}: LogoProps) {
  if (variant === "iconOnly") {
    const iconSize =
      size === "sm" ? "w-6 h-6" : size === "lg" ? "w-10 h-10" : "w-8 h-8";
    return <SafeSignalIcon className={iconSize} />;
  }

  // Sidebar / Dark Card variant: Sleek navy background matching the dark sidebar
  if (variant === "sidebar" || variant === "darkCard") {
    return (
      <div className="bg-[#0E2038] hover:bg-[#122846] rounded-xl p-2.5 flex items-center gap-2.5 border border-[#1E3A60] shadow-md shadow-black/25 transition-all">
        <SafeSignalIcon className="w-8 h-8 shrink-0 drop-shadow-sm" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <div className="text-sm font-extrabold tracking-tight text-white flex items-center">
              <span>Safe</span>
              <span className="text-[#38BDF8]">Signal</span>
            </div>
            <span className="text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 bg-[#2563EB]/25 text-[#93C5FD] rounded border border-[#3B82F6]/40">
              OIL INDIA
            </span>
          </div>
          {showSubtitle && (
            <div className="text-[9px] font-semibold tracking-wider text-slate-400 uppercase truncate mt-0.5">
              SIF Precursor AI
            </div>
          )}
        </div>
      </div>
    );
  }

  // Compact White Card variant
  if (variant === "card") {
    return (
      <div className="bg-white rounded-xl p-2.5 flex items-center gap-2.5 shadow-xs border border-slate-200 hover:border-slate-300 transition-all">
        <SafeSignalIcon className="w-8 h-8 shrink-0 drop-shadow-xs" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <div className="text-sm font-extrabold tracking-tight text-[#0F172A] flex items-center">
              <span>Safe</span>
              <span className="text-[#2563EB]">Signal</span>
            </div>
            <span className="text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 bg-[#EEF4FF] text-[#2563EB] rounded border border-[#BFDBFE]">
              OIL INDIA
            </span>
          </div>
          {showSubtitle && (
            <div className="text-[9px] font-bold tracking-wider text-slate-500 uppercase truncate mt-0.5">
              SIF Precursor AI
            </div>
          )}
        </div>
      </div>
    );
  }

  // Plain variant (for TopBar or login form)
  return (
    <div className="flex items-center gap-2.5">
      <SafeSignalIcon
        className={size === "sm" ? "w-7 h-7" : size === "lg" ? "w-10 h-10" : "w-8 h-8"}
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
