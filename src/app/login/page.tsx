"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/components/AuthProvider";
import Logo from "@/components/Logo";

export default function LoginPage() {
  const router = useRouter();
  const { loginUser } = useAuth();
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
      if (!res.ok || !data.user) {
        setError(data.error || "Invalid username or password. Check credentials.");
        return;
      }

      // Synchronize in-memory auth state
      loginUser(data.user);

      // Navigate to destination
      const targetUrl = data.user.role === "officer" ? "/triage" : "/";
      window.location.href = targetUrl;
    } catch {
      setError("Unable to reach server. Please check your network connection.");
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
          <Logo size="md" variant="plain" />
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
              <svg className="w-5 h-5 text-[#DC2626] shrink-0 mt-0.5 fill-current" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
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
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="admin, officer1, or worker1"
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
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
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
                  {showPassword ? (
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.064 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  )}
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
                <svg className="w-5 h-5 animate-spin fill-current" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <>
                  <span>Sign In</span>
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </>
              )}
            </button>

            {/* Quick-Fill Presets for Demo */}
            <div className="mt-4 pt-4 border-t border-[#E2E8F0]">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 fill-current text-[#2563EB]" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a3 3 0 006 0h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45 4a2.5 2.5 0 00-4.9 0h4.9zM12 9a1 1 0 100 2h3a1 1 0 100-2h-3zm0 4a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                  Quick Demo Accounts
                </span>
                <span className="text-[11px] text-[#94A3B8]">Click to populate</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {/* Admin */}
                <button
                  type="button"
                  onClick={() => handleQuickFill("admin", "12345678")}
                  className="bg-[#F8FAFC] border-2 border-[#E2E8F0] hover:border-[#2563EB] hover:bg-[#EFF6FF] p-2 rounded-xl text-left transition-all group"
                >
                  <div className="text-xs font-bold text-[#0F172A] group-hover:text-[#2563EB] flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-[#2563EB] fill-current shrink-0" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    HSE Admin
                  </div>
                  <div className="text-[10px] text-[#64748B] font-mono mt-0.5">admin</div>
                </button>

                {/* Officer */}
                <button
                  type="button"
                  onClick={() => handleQuickFill("officer1", "12345678")}
                  className="bg-[#F8FAFC] border-2 border-[#E2E8F0] hover:border-[#2563EB] hover:bg-[#EFF6FF] p-2 rounded-xl text-left transition-all group"
                >
                  <div className="text-xs font-bold text-[#0F172A] group-hover:text-[#2563EB] flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-[#2563EB] fill-current shrink-0" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    Officer
                  </div>
                  <div className="text-[10px] text-[#64748B] font-mono mt-0.5">officer1</div>
                </button>

                {/* Employee */}
                <button
                  type="button"
                  onClick={() => handleQuickFill("worker1", "12345678")}
                  className="bg-[#F8FAFC] border-2 border-[#E2E8F0] hover:border-[#2563EB] hover:bg-[#EFF6FF] p-2 rounded-xl text-left transition-all group"
                >
                  <div className="text-xs font-bold text-[#0F172A] group-hover:text-[#2563EB] flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-[#03224D] fill-current shrink-0" viewBox="0 0 24 24">
                      <path d="M12 3a9 9 0 00-9 9v1a2 2 0 002 2h14a2 2 0 002-2v-1a9 9 0 00-9-9zm-1 3h2v4h-2V6zm-5 8c.36-2.83 2.5-5.11 5.3-5.69.17-.03.35-.05.53-.06.18.01.36.03.53.06 2.8 1.58 4.94 3.86 5.3 5.69H6z" />
                    </svg>
                    Employee
                  </div>
                  <div className="text-[10px] text-[#64748B] font-mono mt-0.5">worker1</div>
                </button>
              </div>
              <div className="text-center text-[11px] text-[#64748B] mt-2 font-mono">
                Password: <span className="font-bold text-[#0F172A]">12345678</span>
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
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Subtle gradient vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#031B3D] via-transparent to-transparent opacity-80"></div>

              {/* Floating Status Tag on Image */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-black/60 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15 text-xs">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#38BDF8] text-sm">sensors</span>
                  <span className="font-semibold text-white">Live Telemetry &amp; Rig Barrier Watch</span>
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
