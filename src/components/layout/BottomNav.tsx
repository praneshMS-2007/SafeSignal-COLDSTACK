"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { useEffect, useState } from "react";

export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) return;
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((d) => setUnread(d.unreadCount || 0))
      .catch(() => {});
  }, [pathname, user]);

  const items =
    user?.role === "officer"
      ? [
          { href: "/", icon: "dashboard", label: "Overview" },
          { href: "/triage", icon: "fact_check", label: "Triage" },
          { href: "/barriers", icon: "health_and_safety", label: "Barriers" },
          { href: "/users", icon: "manage_accounts", label: "Users" },
          { href: "/notifications", icon: "notifications", label: "Alerts", badge: unread },
        ]
      : [
          { href: "/", icon: "dashboard", label: "Overview" },
          { href: "/report", icon: "add_circle", label: "Report" },
          { href: "/reports", icon: "analytics", label: "My Log" },
          { href: "/notifications", icon: "notifications", label: "Alerts", badge: unread },
        ];

  return (
    <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center bg-[#0B1727] border-t border-slate-800 z-50 h-16 lg:hidden px-2 shadow-2xl">
      {items.map((item) => {
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname === item.href || pathname.startsWith(item.href + "/");

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center flex-1 h-12 rounded-xl transition-all relative ${
              isActive
                ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <span className="material-symbols-outlined text-[20px] mb-0.5">
              {item.icon}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
            {item.badge && item.badge > 0 ? (
              <span className="absolute top-1 right-3 bg-[#EF4444] text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-xs">
                {item.badge > 9 ? "9+" : item.badge}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
