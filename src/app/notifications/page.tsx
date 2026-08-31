"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import Link from "next/link";

interface NotificationData {
  id: string;
  title: string;
  body: string;
  type: string;
  reportId: string | null;
  read: boolean;
  createdAt: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function getTypeIcon(type: string) {
  switch (type) {
    case "STOP_WORK":
      return {
        bg: "bg-red-50 text-red-600 border border-red-100",
        icon: "warning",
      };
    case "REPORT_TRIAGED":
      return {
        bg: "bg-blue-50 text-blue-600 border border-blue-100",
        icon: "fact_check",
      };
    case "REPORT_FIXED":
      return {
        bg: "bg-emerald-50 text-emerald-600 border border-emerald-100",
        icon: "check_circle",
      };
    case "COACH_NEEDED":
      return {
        bg: "bg-amber-50 text-amber-600 border border-amber-100",
        icon: "help",
      };
    default:
      return {
        bg: "bg-slate-50 text-slate-600 border border-slate-200",
        icon: "notifications",
      };
  }
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data) => setNotifications(data.notifications || []))
      .catch((err) => console.error("Error loading notifications:", err))
      .finally(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = async (id: string) => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationId: id }),
    });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full flex flex-col gap-6 bg-[#F8FAFC] min-h-screen">
        {/* ─── PAGE HEADER & ACTIONS ───────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              CLOSED-LOOP SAFETY NOTIFICATIONS
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              Safety Alerts &amp; Status Feed
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Real-time closed-loop notifications keeping reporters and HSE officers in sync on hazard resolutions.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="h-10 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold uppercase tracking-wider shadow-xs transition-colors"
              >
                Mark All as Read
              </button>
            )}
          </div>
        </div>

        {/* ─── MAIN FEED CARD ──────────────────────────────────── */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-xs overflow-hidden">
          <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between">
            <h2 className="text-base font-bold text-[#0F172A]">Notification Activity</h2>
            <span className="text-xs font-semibold text-slate-500">
              {unreadCount} unread
            </span>
          </div>

          <div className="divide-y divide-[#F1F5F9]">
            {loading ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                <span className="material-symbols-outlined text-4xl block mb-2 opacity-50">
                  notifications_none
                </span>
                No notifications right now. You&apos;re completely up to date.
              </div>
            ) : (
              notifications.map((n) => {
                const style = getTypeIcon(n.type);

                return (
                  <div
                    key={n.id}
                    onClick={() => !n.read && markRead(n.id)}
                    className={`p-5 flex items-start gap-4 transition-colors ${
                      n.read ? "bg-white hover:bg-[#F8FAFC]" : "bg-blue-50/40 hover:bg-blue-50/70"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${style.bg}`}
                    >
                      <span className="material-symbols-outlined text-xl">
                        {style.icon}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <h3
                            className={`text-sm ${
                              n.read ? "font-semibold text-slate-800" : "font-bold text-[#0F172A]"
                            }`}
                          >
                            {n.title}
                          </h3>
                          {!n.read && (
                            <span className="w-2 h-2 rounded-full bg-[#2563EB]"></span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">
                          {timeAgo(n.createdAt)}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed mb-2">
                        {n.body}
                      </p>

                      {n.reportId && (
                        <Link
                          href={`/reports/${n.reportId}`}
                          className="text-xs font-bold text-[#2563EB] hover:underline inline-flex items-center gap-1"
                        >
                          View Source Report →
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
