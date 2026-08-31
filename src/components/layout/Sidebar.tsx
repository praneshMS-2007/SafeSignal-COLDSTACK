"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { useEffect, useState } from "react";
import Logo from "@/components/Logo";

interface NavItem {
  href: string;
  icon: string;
  label: string;
  roles: ("employee" | "officer")[];
  badge?: number;
}

const navItems: NavItem[] = [
  { href: "/", icon: "dashboard", label: "Dashboard", roles: ["employee", "officer"] },
  { href: "/triage", icon: "fact_check", label: "Triage Queue", roles: ["officer"] },
  { href: "/report", icon: "add_alert", label: "Report Hazard", roles: ["employee", "officer"] },
  { href: "/reports", icon: "analytics", label: "Safety Reports", roles: ["employee", "officer"] },
  { href: "/barriers", icon: "health_and_safety", label: "Barrier Health", roles: ["officer"] },
  { href: "/tickets", icon: "confirmation_number", label: "Repair Tickets", roles: ["officer"] },
  { href: "/users", icon: "manage_accounts", label: "User Management", roles: ["officer"] },
  { href: "/notifications", icon: "notifications", label: "Notifications", roles: ["employee", "officer"] },
  { href: "/settings", icon: "settings", label: "System Settings", roles: ["officer"] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data) => setUnreadCount(data.unreadCount || 0))
      .catch(() => {});
  }, [pathname, user]);

  const visibleItems = navItems.filter(
    (item) => user && item.roles.includes(user.role)
  );

  return (
    <aside className="hidden lg:flex flex-col h-screen w-72 bg-[#0B1727] text-white p-5 sticky top-0 shrink-0 border-r border-[#1E293B] shadow-xl z-30 select-none justify-between">
      {/* ─── TOP SECTION: BRAND BADGE ─────────────────────────── */}
      <div className="flex flex-col gap-6">
        {/* Brand Card matching Template */}
        <Link href="/" className="group block transition-transform group-hover:scale-[1.02]">
          <Logo variant="card" />
        </Link>

        {/* Navigation Items */}
        <div className="flex flex-col gap-1.5">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-1">
            Core Modules
          </div>

          <nav className="flex flex-col gap-1">
            {visibleItems.map((item) => {
              const isActive =
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              const showBadge = item.href === "/notifications" && unreadCount > 0;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 relative ${
                    isActive
                      ? "bg-[#2563EB] text-white shadow-lg shadow-blue-600/30"
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px] shrink-0">
                    {item.icon}
                  </span>
                  <span className="flex-1 truncate">{item.label}</span>

                  {showBadge && (
                    <span className="bg-[#EF4444] text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* ─── BOTTOM SECTION: USER PROFILE PILL ─────────────────── */}
      {user && (
        <div className="pt-4 border-t border-slate-800/80">
          <div className="flex items-center justify-between bg-slate-900/90 rounded-xl p-2.5 border border-slate-800 shadow-inner">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#2563EB] to-[#60A5FA] flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm uppercase">
                {user.displayName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-slate-100 truncate">
                  {user.displayName}
                </div>
                <div className="text-[10px] text-blue-400 uppercase font-semibold tracking-wider truncate">
                  {user.role === "officer" ? "SUPER_ADMIN" : "FIELD_STAFF"}
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
