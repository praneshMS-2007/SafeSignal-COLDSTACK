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

  const items = user?.role === "officer"
    ? [
        { href: "/", icon: "home", label: "Home" },
        { href: "/triage", icon: "fact_check", label: "Triage" },
        { href: "/notifications", icon: "notifications", label: "Alerts", badge: unread },
      ]
    : [
        { href: "/", icon: "home", label: "Home" },
        { href: "/report", icon: "add_circle", label: "Report" },
        { href: "/notifications", icon: "notifications", label: "Alerts", badge: unread },
      ];

  return (
    <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center bg-surface border-t-2 border-outline-variant z-50 h-[56px] lg:hidden">
      {items.map((item) => {
        const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link key={item.href} href={item.href}
            className={`flex flex-col items-center justify-center w-16 h-full transition-all relative ${
              isActive
                ? "text-on-primary-container"
                : "text-on-surface-variant hover:bg-surface-container"
            }`}>
            {isActive && (
              <div className="absolute top-1 bg-primary-container rounded-full px-4 py-0.5"></div>
            )}
            <span className={`material-symbols-outlined mb-0.5 ${isActive ? "filled" : ""}`}>
              {item.icon}
            </span>
            <span className="text-label-caps text-[10px]">{item.label}</span>
            {item.badge && item.badge > 0 ? (
              <span className="absolute top-0 right-2 bg-error text-on-error text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {item.badge > 9 ? "9+" : item.badge}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
