"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { usePathname } from "next/navigation";

import Logo from "@/components/Logo";

export default function TopBar() {
  const [isOnline, setIsOnline] = useState(true);
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data) => setUnreadCount(data.unreadCount || 0))
      .catch(() => {});
  }, [pathname, user]);

  return (
    <header className="w-full bg-white border-b border-[#E2E8F0] px-4 lg:px-8 py-3.5 sticky top-0 z-40 flex items-center justify-between gap-4 shadow-xs">
      {/* ─── MOBILE BRAND HEADER ───────────────────────────────── */}
      <div className="flex items-center gap-2 lg:hidden">
        <Link href="/" className="flex items-center gap-2">
          <Logo size="sm" variant="plain" showSubtitle={false} />
        </Link>
      </div>

      {/* ─── DESKTOP GLOBAL SEARCH BAR ─────────────────────────── */}
      <div className="hidden lg:flex items-center flex-1 max-w-xl">
        <div className="relative w-full">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Global Search (Reports, Workers, Rig Sites, Barriers, Tickets...)"
            className="w-full h-10 pl-10 pr-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#0F172A] placeholder:text-slate-400 focus:bg-white focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* ─── RIGHT HEADER CONTROLS ─────────────────────────────── */}
      <div className="flex items-center gap-3">
        {/* Live DB / Online status pill */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
            isOnline
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-slate-100 text-slate-600 border-slate-300"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isOnline ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
            }`}
          ></span>
          <span>{isOnline ? "Live DB" : "Offline"}</span>
        </div>

        {/* Notifications Icon Button */}
        <Link
          href="/notifications"
          className="w-9 h-9 rounded-xl border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors relative"
          title="Notifications"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#EF4444] text-white text-[9px] font-bold flex items-center justify-center rounded-full shadow-xs">
              {unreadCount}
            </span>
          )}
        </Link>

        {/* Settings Button */}
        {user?.role === "officer" && (
          <Link
            href="/settings"
            className="w-9 h-9 rounded-xl border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors"
            title="Settings"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
          </Link>
        )}

        {/* User Pill Badge matching Template */}
        {user && (
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
            <div className="hidden sm:block text-right leading-tight">
              <div className="text-xs font-bold text-[#0F172A] truncate max-w-[130px]">
                {user.displayName}
              </div>
              <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider truncate">
                {user.role === "officer" ? "SUPER_ADMIN" : "FIELD_STAFF"}
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#2563EB] to-[#60A5FA] text-white flex items-center justify-center text-xs font-bold shadow-xs uppercase">
              {user.displayName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
