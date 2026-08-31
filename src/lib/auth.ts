/**
 * Simple session-based auth using cookies.
 * No external auth service needed — works with SQLite.
 */

import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

const SESSION_COOKIE = "safesignal_session";

export interface SessionUser {
  id: string;
  username: string;
  displayName: string;
  role: "employee" | "officer";
  site: string | null;
  crew: string | null;
}

/**
 * Get the current logged-in user from the session cookie.
 * Returns null if not logged in.
 */
export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionId) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: sessionId },
      select: {
        id: true,
        username: true,
        displayName: true,
        role: true,
        site: true,
        crew: true,
      },
    });
    return user as SessionUser | null;
  } catch {
    return null;
  }
}

/**
 * Set the session cookie after successful login.
 */
export function setSession(userId: string) {
  const cookieStore = cookies();
  cookieStore.set(SESSION_COOKIE, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });
}

/**
 * Clear the session cookie (logout).
 */
export function clearSession() {
  const cookieStore = cookies();
  cookieStore.delete(SESSION_COOKIE);
}
