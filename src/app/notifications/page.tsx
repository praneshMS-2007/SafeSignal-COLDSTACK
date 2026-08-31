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
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function getTypeIcon(type: string) {
  switch (type) {
    case "STOP_WORK": return { icon: "warning", color: "text-error", bg: "bg-error-container" };
    case "REPORT_TRIAGED": return { icon: "fact_check", color: "text-primary", bg: "bg-primary-fixed" };
    case "REPORT_FIXED": return { icon: "check_circle", color: "text-emerald-600", bg: "bg-emerald-100" };
    case "COACH_NEEDED": return { icon: "help", color: "text-amber-600", bg: "bg-amber-100" };
    case "TICKET_UPDATE": return { icon: "confirmation_number", color: "text-secondary", bg: "bg-secondary-fixed" };
    default: return { icon: "notifications", color: "text-on-surface-variant", bg: "bg-surface-variant" };
  }
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data) => setNotifications(data.notifications || []))
      .catch(() => {})
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
      <div className="p-4 md:p-12 max-w-4xl mx-auto w-full">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-display-lg text-on-surface">Notifications</h1>
            <p className="text-body-md text-on-surface-variant mt-1">
              {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="h-[48px] px-4 border-2 border-outline-variant rounded text-label-caps hover:bg-surface-container-low transition-colors"
            >
              Mark all read
            </button>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {loading ? (
            <div className="p-8 text-center text-on-surface-variant">
              <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span>
              Loading...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-6xl mb-4 block">notifications_none</span>
              <p className="text-title-md">No notifications yet</p>
              <p className="text-body-md mt-2">When your reports are triaged or hazards are fixed, you&apos;ll see updates here.</p>
            </div>
          ) : (
            notifications.map((n) => {
              const style = getTypeIcon(n.type);
              return (
                <div
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className={`flex items-start gap-4 p-4 rounded-lg border-2 transition-colors cursor-pointer ${
                    n.read
                      ? "border-outline-variant bg-surface opacity-70"
                      : "border-primary bg-surface-container-lowest shadow-sm"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full ${style.bg} flex items-center justify-center shrink-0`}>
                    <span className={`material-symbols-outlined ${style.color}`}>{style.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className={`text-body-md ${n.read ? "" : "font-bold"} text-on-surface`}>
                        {n.title}
                      </h3>
                      <span className="text-label-caps text-on-surface-variant whitespace-nowrap">
                        {timeAgo(n.createdAt)}
                      </span>
                    </div>
                    <p className="text-body-md text-on-surface-variant mt-1 line-clamp-2">{n.body}</p>
                    {n.reportId && (
                      <Link
                        href={`/reports/${n.reportId}`}
                        className="text-label-caps text-primary mt-2 inline-flex items-center gap-1 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View report <span className="material-symbols-outlined text-xs">arrow_forward</span>
                      </Link>
                    )}
                  </div>
                  {!n.read && (
                    <div className="w-3 h-3 rounded-full bg-primary shrink-0 mt-1"></div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </AppLayout>
  );
}
