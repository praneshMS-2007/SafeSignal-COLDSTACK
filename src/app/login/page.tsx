"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "login",
          username,
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Invalid username or password. Check credentials.");
        return;
      }

      // Role-based automatic redirect
      if (data.user?.role === "officer") {
        router.push("/triage");
      } else {
        router.push("/");
      }
    } catch {
      setError("Unable to reach server. Please check network connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setError("");
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#031B3D] text-[#191C1E] selection:bg-[#2563EB] selection:text-white">
      {/* ─── LEFT COLUMN: LOGIN FORM (50%) ───────────────────────── */}
      <div className="w-full lg:w-1/2 bg-white flex flex-col justify-between p-6 sm:p-10 lg:p-14 xl:p-16 min-h-screen">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#03224D] flex items-center justify-center text-white shadow-md">
            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              oil_barrel
            </span>
          </div>
          <div>
            <div className="text-xl font-bold tracking-tight text-[#03224D] flex items-center gap-1.5">
              SafeSignal
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-[#EEF2F6] text-[#2E4673] rounded border border-[#C4C6D0]">
                OIL INDIA
              </span>
            </div>
            <div className="text-[11px] font-semibold tracking-wider text-[#747780] uppercase">
              Industrial Safety System
            </div>
          </div>
        </div>

        {/* Center Form Section */}
        <div className="max-w-md w-full mx-auto my-auto py-8">
          <div className="mb-6">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight mb-2">
              Welcome back
            </h1>
            <p className="text-sm sm:text-base text-[#64748B] leading-relaxed">
              Enter your credentials to access the operational safety dashboard.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-5 bg-[#FEF2F2] border-2 border-[#EF4444] text-[#991B1B] p-3.5 rounded-xl text-sm font-medium flex items-start gap-3 shadow-xs animate-in fade-in slide-in-from-top-1">
              <span className="material-symbols-outlined text-[#DC2626] text-xl shrink-0 mt-0.5">
                error
              </span>
              <div className="flex-1">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Username / Email */}
            <div>
              <label className="text-[11px] font-bold text-[#475569] uppercase tracking-wider block mb-1.5">
                Email or Username
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#94A3B8] text-xl pointer-events-none">
                  mail
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="admin@oilindia.in or officer1"
                  className="w-full h-12 pl-11 pr-4 border-2 border-[#E2E8F0] rounded-xl bg-[#F8FAFC] text-[#0F172A] text-sm font-medium focus:border-[#2563EB] focus:bg-white focus:outline-none transition-all placeholder:text-[#94A3B8]"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-[11px] font-bold text-[#475569] uppercase tracking-wider block mb-1.5">
                Secure Password
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#94A3B8] text-xl pointer-events-none">
                  lock
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full h-12 pl-11 pr-11 border-2 border-[#E2E8F0] rounded-xl bg-[#F8FAFC] text-[#0F172A] text-sm font-medium focus:border-[#2563EB] focus:bg-white focus:outline-none transition-all placeholder:text-[#94A3B8]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#475569] transition-colors focus:outline-none"
                  tabIndex={-1}
                >
                  <span className="material-symbols-outlined text-xl">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember & Forgot Password */}
            <div className="flex items-center justify-between text-xs sm:text-sm pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-[#64748B] hover:text-[#0F172A]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-[#CBD5E1] text-[#2563EB] focus:ring-[#2563EB]"
                />
                <span>Remember credentials</span>
              </label>
              <span className="text-[#2563EB] hover:text-[#1D4ED8] font-semibold cursor-pointer">
                Forgot password?
              </span>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading || !username || !password}
              className="w-full h-12 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-600/20 mt-2"
            >
              {loading ? (
                <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </>
              )}
            </button>

            {/* Quick-Fill Presets for Demo */}
            <div className="mt-4 pt-4 border-t border-[#E2E8F0]">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">badge</span>
                  Quick Demo Accounts
                </span>
                <span className="text-[11px] text-[#94A3B8]">Click to populate</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickFill("admin", "12345678")}
                  className="bg-[#F8FAFC] border-2 border-[#E2E8F0] hover:border-[#2563EB] hover:bg-[#EFF6FF] p-2 rounded-xl text-left transition-all group"
                >
                  <div className="text-xs font-bold text-[#0F172A] group-hover:text-[#2563EB] flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-[#2563EB]">admin_panel_settings</span>
                    HSE Admin
                  </div>
                  <div className="text-[10px] text-[#64748B] font-mono mt-0.5">admin</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickFill("officer1", "12345678")}
                  className="bg-[#F8FAFC] border-2 border-[#E2E8F0] hover:border-[#2563EB] hover:bg-[#EFF6FF] p-2 rounded-xl text-left transition-all group"
                >
                  <div className="text-xs font-bold text-[#0F172A] group-hover:text-[#2563EB] flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-[#2563EB]">shield_person</span>
                    Officer
                  </div>
                  <div className="text-[10px] text-[#64748B] font-mono mt-0.5">officer1</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickFill("worker1", "12345678")}
                  className="bg-[#F8FAFC] border-2 border-[#E2E8F0] hover:border-[#2563EB] hover:bg-[#EFF6FF] p-2 rounded-xl text-left transition-all group"
                >
                  <div className="text-xs font-bold text-[#0F172A] group-hover:text-[#2563EB] flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-[#03224D]">hard_hat</span>
                    Employee
                  </div>
                  <div className="text-[10px] text-[#64748B] font-mono mt-0.5">worker1</div>
                </button>
              </div>
              <div className="text-center text-[11px] text-[#64748B] mt-2 font-mono">
                Default demo password: <span className="font-bold text-[#0F172A]">12345678</span>
              </div>
            </div>

            {/* Need assistance */}
            <div className="text-center text-xs text-[#64748B] mt-2">
              Need assistance?{" "}
              <a href="#" className="text-[#2563EB] hover:underline font-semibold">
                Contact HSE Support
              </a>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-xs text-[#94A3B8] border-t border-[#F1F5F9] pt-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 Oil India Limited. All rights reserved.</span>
          <span className="font-mono text-[11px]">SafeSignal Engine v1.4</span>
        </div>
      </div>

      {/* ─── RIGHT COLUMN: OIL INDUSTRY HERO SHOWCASE (50%) ─────── */}
      <div className="w-full lg:w-1/2 bg-[#031B3D] text-white flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16 relative overflow-hidden">
        {/* Subtle background glow effect */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#2563EB]/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#38BDF8]/15 rounded-full blur-3xl pointer-events-none"></div>

        {/* Top Header info */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-widest text-[#93C5FD]">
              SIF Precursor Monitoring Active
            </span>
          </div>
          <div className="text-xs text-white/60 font-mono">OIL-HSE-GRID-2026</div>
        </div>

        {/* Center Showcase Card */}
        <div className="my-auto py-8 relative z-10 flex flex-col items-center">
          {/* Hero Banner Image Card */}
          <div className="w-full max-w-xl rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl shadow-black/60 bg-[#0B2447]/80 backdrop-blur-md group relative">
            <div className="relative aspect-video w-full">
              <Image
                src="/images/oil_safety_banner.jpg"
                alt="Oil India Limited Industrial Safety Ecosystem"
                fill
                priority
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Subtle gradient vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#031B3D] via-transparent to-transparent opacity-80"></div>

              {/* Floating Status Tag on Image */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-black/60 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15 text-xs">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#38BDF8] text-sm">sensors</span>
                  <span className="font-semibold text-white">Live Telemetry & Rig Barrier Watch</span>
                </div>
                <span className="text-[#10B981] font-bold">100% Guarded</span>
              </div>
            </div>
          </div>

          {/* Headline & Description under showcase */}
          <div className="mt-8 text-center max-w-lg">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-2.5">
              Industrial Safety &amp; SIF Precursor Intelligence
            </h2>
            <p className="text-xs sm:text-sm text-white/75 leading-relaxed">
              Empowering frontline oil &amp; gas operations with real-time hazard precursor detection, closed-loop barrier tracking, and fail-safe zero-fatality intelligence.
            </p>
          </div>

          {/* 4 Feature Badges */}
          <div className="grid grid-cols-2 gap-3 mt-6 w-full max-w-lg">
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-2.5 backdrop-blur-xs">
              <div className="w-8 h-8 rounded-lg bg-[#2563EB]/30 flex items-center justify-center text-[#93C5FD] shrink-0">
                <span className="material-symbols-outlined text-lg">bolt</span>
              </div>
              <div className="text-left min-w-0">
                <div className="text-xs font-bold text-white truncate">Energy &amp; Kill Threshold</div>
                <div className="text-[10px] text-white/60 truncate">SCL Model Rules</div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-2.5 backdrop-blur-xs">
              <div className="w-8 h-8 rounded-lg bg-[#10B981]/30 flex items-center justify-center text-[#6EE7B7] shrink-0">
                <span className="material-symbols-outlined text-lg">security</span>
              </div>
              <div className="text-left min-w-0">
                <div className="text-xs font-bold text-white truncate">9 IOGP Life-Saving Rules</div>
                <div className="text-[10px] text-white/60 truncate">Automated Mapping</div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-2.5 backdrop-blur-xs">
              <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/30 flex items-center justify-center text-[#FCD34D] shrink-0">
                <span className="material-symbols-outlined text-lg">sync_saved_locally</span>
              </div>
              <div className="text-left min-w-0">
                <div className="text-xs font-bold text-white truncate">Closed-Loop Verification</div>
                <div className="text-[10px] text-white/60 truncate">30-Day Watch Period</div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-2.5 backdrop-blur-xs">
              <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/30 flex items-center justify-center text-[#C4B5FD] shrink-0">
                <span className="material-symbols-outlined text-lg">wifi_off</span>
              </div>
              <div className="text-left min-w-0">
                <div className="text-xs font-bold text-white truncate">Offline-Ready Engine</div>
                <div className="text-[10px] text-white/60 truncate">Voice &amp; Photo with Blur</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Footer Social & Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/50 border-t border-white/10 pt-4 relative z-10">
          <div className="flex items-center gap-4">
            <span className="hover:text-white transition-colors cursor-pointer flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">lan</span> HSE Intranet
            </span>
            <span className="hover:text-white transition-colors cursor-pointer flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">menu_book</span> Standard Operating Procedures
            </span>
          </div>
          <span>© 2026 Oil India Limited. SafeSignal.</span>
        </div>
      </div>
    </div>
  );
}
