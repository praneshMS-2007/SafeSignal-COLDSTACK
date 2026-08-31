"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/triage", icon: "fact_check", label: "Triage", roles: ["officer"] },
  { href: "/reports", icon: "analytics", label: "My Reports", roles: ["employee", "officer"] },
  { href: "/barriers", icon: "health_and_safety", label: "Barrier Health", roles: ["officer"] },
  { href: "/tickets", icon: "confirmation_number", label: "Tickets", roles: ["officer"] },
  { href: "/users", icon: "manage_accounts", label: "User Management", roles: ["officer"] },
  { href: "/notifications", icon: "notifications", label: "Notifications", roles: ["employee", "officer"] },
  { href: "/settings", icon: "settings", label: "Settings", roles: ["officer"] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data) => setUnreadCount(data.unreadCount || 0))
      .catch(() => {});
  }, [pathname]);

  const visibleItems = navItems.filter(
    (item) => user && item.roles.includes(user.role)
  );

  return (
    <nav className="hidden lg:flex flex-col h-screen w-80 border-r-2 border-outline-variant bg-surface-container-low p-gutter sticky top-0 shrink-0">
      {/* Brand */}
      <div className="mb-8">
        <Link href="/">
          <h1 className="text-headline-lg font-bold text-primary flex items-center gap-3">
            <span className="material-symbols-outlined filled text-4xl">oil_barrel</span>
            SafeSignal
          </h1>
        </Link>
      </div>

      {/* User card */}
      {user && (
        <div className="flex items-center gap-4 mb-8 p-4 bg-surface rounded-lg border-2 border-outline-variant">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-title-md font-semibold ${
            user.role === "officer"
              ? "bg-secondary-container text-on-secondary-container"
              : "bg-primary-container text-on-primary-container"
          }`}>
            {user.displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-title-md font-semibold text-on-surface truncate">{user.displayName}</div>
            <div className="text-body-md text-on-surface-variant truncate">{user.site || "No site"}</div>
            <div className={`text-label-caps flex items-center gap-1 mt-1 ${
              user.role === "officer" ? "text-secondary" : "text-on-tertiary-container"
            }`}>
              <span className="material-symbols-outlined" style={{ fontSize: 12 }}>
                {user.role === "officer" ? "shield_person" : "hard_hat"}
              </span>
              {user.role === "officer" ? "SAFETY OFFICER" : "EMPLOYEE"}
            </div>
          </div>
        </div>
      )}

      {/* Navigation links */}
      <ul className="flex flex-col gap-2 flex-grow">
        {visibleItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const showBadge = item.href === "/notifications" && unreadCount > 0;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 relative ${
                  isActive
                    ? "bg-secondary-container text-on-secondary-container border-l-4 border-secondary font-bold"
                    : "text-on-surface-variant hover:bg-surface-container-highest border-l-4 border-transparent"
                }`}
              >
                <span className={`material-symbols-outlined ${isActive ? "filled" : ""}`}>
                  {item.icon}
                </span>
                <span className="text-title-md">{item.label}</span>
                {showBadge && (
                  <span className="ml-auto bg-error text-on-error text-xs font-bold px-2 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Logout */}
      <button
        onClick={logout}
        className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-error-container hover:text-on-error-container transition-colors mt-4"
      >
        <span className="material-symbols-outlined">logout</span>
        <span className="text-title-md">Sign Out</span>
      </button>
    </nav>
  );
}
