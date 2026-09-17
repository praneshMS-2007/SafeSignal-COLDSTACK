"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";

export interface User {
  id: string;
  username: string;
  displayName: string;
  role: "employee" | "officer";
  site: string | null;
  crew: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  unreadCount: number;
  loginUser: (user: User) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  setUnreadCount: (count: number | ((prev: number) => number)) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  unreadCount: 0,
  loginUser: () => {},
  logout: async () => {},
  refreshUser: async () => {},
  refreshNotifications: async () => {},
  setUnreadCount: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();
  const pathname = usePathname();

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user || null);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(typeof data.unreadCount === "number" ? data.unreadCount : 0);
      }
    } catch {
      // Ignore notification fetch errors
    }
  }, [user]);

  const loginUser = (newUser: User) => {
    setUser(newUser);
    setLoading(false);
  };

  const logout = async () => {
    try {
      await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" }),
      });
    } catch {
      // Ignore network errors on logout
    } finally {
      setUser(null);
      window.location.href = "/login";
    }
  };

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    if (user) {
      refreshNotifications();
    }
  }, [user, pathname, refreshNotifications]);

  // Redirect unauthenticated users to /login
  useEffect(() => {
    if (!loading && !user && pathname !== "/login") {
      router.push("/login");
    }
  }, [loading, user, pathname, router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        unreadCount,
        loginUser,
        logout,
        refreshUser,
        refreshNotifications,
        setUnreadCount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
