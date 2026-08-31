"use client";

import React from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "card" | "plain" | "iconOnly" | "darkCard" | "sidebar";
  showSubtitle?: boolean;
}

export function SafeSignalIcon({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Main Shield Dynamic Gradient */}
        <linearGradient id="shieldMain" x1="6" y1="4" x2="38" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="35%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#1E3A8A" />
        </linearGradient>

        {/* Shield Right Facet Shadow */}
        <linearGradient id="shieldFacet" x1="22" y1="4" x2="38" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#0F2042" />
        </linearGradient>

        {/* Central Luminous Oil Flame Beacon */}
        <linearGradient id="flameGrad" x1="22" y1="14" x2="22" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFBEB" />
          <stop offset="30%" stopColor="#FBBF24" />
          <stop offset="70%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#DC2626" />
        </linearGradient>

        {/* Outer Telemetry Signal Arc Glow */}
        <linearGradient id="pulseGlow" x1="4" y1="8" x2="40" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00E5FF" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>

        <filter id="glowEffect" x="0" y="0" width="44" height="44" filterUnits="userSpaceOnUse">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Hexagonal / Aerodynamic Safety Shield Background */}
      <rect width="44" height="44" rx="12" fill="#0B1B36" />
      <rect
        x="0.75"
        y="0.75"
        width="42.5"
        height="42.5"
        rx="11.25"
        stroke="url(#pulseGlow)"
        strokeWidth="1.5"
        strokeOpacity="0.4"
      />

      {/* Dynamic Telemetry Radar Pulse Arcs */}
      <path
        d="M8 22C8 14.268 14.268 8 22 8C29.732 8 36 14.268 36 22"
        stroke="url(#pulseGlow)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="2 4"
        opacity="0.8"
      />
      <path
        d="M12 22C12 16.477 16.477 12 22 12C27.523 12 32 16.477 32 22"
        stroke="url(#pulseGlow)"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.95"
      />

      {/* Left Shield Wing (Luminous Royal Blue) */}
      <path
        d="M22 11L12 16V25.5C12 32.2 16.2 36.8 22 38.5V11Z"
        fill="url(#shieldMain)"
      />

      {/* Right Shield Wing (Deep Royal Blue Shadow Facet) */}
      <path
        d="M22 11L32 16V25.5C32 32.2 27.8 36.8 22 38.5V11Z"
        fill="url(#shieldFacet)"
      />

      {/* Shield Border Contour */}
      <path
        d="M22 11L32 16V25.5C32 32.2 27.8 36.8 22 38.5C16.2 36.8 12 32.2 12 25.5V16L22 11Z"
        stroke="#60A5FA"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Central Radiant Oil Flame / Energy Spark */}
      <path
        d="M22 16C22 16 17.5 22.5 17.5 26C17.5 28.48 19.52 30.5 22 30.5C24.48 30.5 26.5 28.48 26.5 26C26.5 22.5 22 16 22 16Z"
        fill="url(#flameGrad)"
      />

      {/* Core Pure White Spark (Zero-Fatality SIF Sensor) */}
      <circle cx="22" cy="25.5" r="2" fill="#FFFFFF" />
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
      size === "sm" ? "w-7 h-7" : size === "lg" ? "w-12 h-12" : "w-9 h-9";
    return <SafeSignalIcon className={iconSize} />;
  }

  // Premium High-Contrast White Card (Matches Template Design System)
  if (variant === "card" || variant === "sidebar") {
    return (
      <div className="bg-white rounded-2xl p-3 flex items-center gap-3 shadow-lg shadow-black/20 border border-slate-200/90 transition-all group-hover:border-slate-300">
        <SafeSignalIcon className="w-10 h-10 shrink-0 drop-shadow-sm" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1.5">
            <div className="text-[15px] font-extrabold tracking-tight text-[#0F172A] flex items-center">
              <span>Safe</span>
              <span className="text-[#2563EB]">Signal</span>
            </div>
            <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 bg-[#EFF6FF] text-[#1D4ED8] rounded-md border border-[#BFDBFE] shrink-0">
              OIL INDIA
            </span>
          </div>
          {showSubtitle && (
            <div className="text-[9.5px] font-bold tracking-wider text-slate-500 uppercase truncate mt-0.5">
              SIF Precursor AI
            </div>
          )}
        </div>
      </div>
    );
  }

  // Dark Card variant (Alternative translucent navy card)
  if (variant === "darkCard") {
    return (
      <div className="bg-[#0B1E38] rounded-2xl p-3 flex items-center gap-3 shadow-lg border border-[#1E3A60]">
        <SafeSignalIcon className="w-10 h-10 shrink-0 drop-shadow-md" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1.5">
            <div className="text-[15px] font-extrabold tracking-tight text-white flex items-center">
              <span>Safe</span>
              <span className="text-[#38BDF8]">Signal</span>
            </div>
            <span className="text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 bg-[#2563EB]/30 text-[#93C5FD] rounded-md border border-blue-400/40 shrink-0">
              OIL INDIA
            </span>
          </div>
          {showSubtitle && (
            <div className="text-[9.5px] font-semibold tracking-wider text-slate-400 uppercase truncate mt-0.5">
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
        className={size === "sm" ? "w-8 h-8" : size === "lg" ? "w-11 h-11" : "w-9 h-9"}
      />
      <div>
        <div className="flex items-center gap-1.5">
          <span className="text-base font-extrabold tracking-tight text-[#0F172A]">
            Safe<span className="text-[#2563EB]">Signal</span>
          </span>
          <span className="text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 bg-[#EFF6FF] text-[#1D4ED8] rounded-md border border-[#BFDBFE]">
            OIL INDIA
          </span>
        </div>
        {showSubtitle && (
          <div className="text-[9.5px] font-bold tracking-wider text-slate-500 uppercase">
            Industrial Safety System
          </div>
        )}
      </div>
    </div>
  );
}
