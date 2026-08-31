"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function TopBar() {
  const [isOnline, setIsOnline] = useState(true);

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

  return (
    <header className="lg:hidden flex justify-between items-center px-4 w-full bg-surface h-14 border-b-2 border-outline-variant sticky top-0 z-40">
      <Link href="/" className="flex items-center gap-2">
        <span className="material-symbols-outlined filled text-primary text-2xl">oil_barrel</span>
        <span className="text-headline-lg-mobile font-bold text-primary">SafeSignal</span>
      </Link>
      <div
        className={`text-label-caps px-3 py-1 rounded-full border-2 ${
          isOnline
            ? "text-on-tertiary-container bg-tertiary-fixed border-tertiary-fixed-dim"
            : "text-on-surface-variant bg-surface-container-highest border-outline-variant"
        }`}
      >
        {isOnline ? (
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">wifi</span> ONLINE
          </span>
        ) : (
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">wifi_off</span> OFFLINE
          </span>
        )}
      </div>
    </header>
  );
}
