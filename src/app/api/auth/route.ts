import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { setSession, clearSession, getSession } from "@/lib/auth";

// POST /api/auth — Login and Logout
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, username, password } = body;

    if (action === "login") {
      if (!username || !password) {
        return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
      }

      const cleanUsername = username.trim().toLowerCase();

      // Find user
      const user = await prisma.user.findUnique({
        where: { username: cleanUsername },
      });

      if (!user) {
        return NextResponse.json({ error: "Invalid username or password. Check credentials." }, { status: 401 });
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        return NextResponse.json({ error: "Invalid username or password. Check credentials." }, { status: 401 });
      }

      setSession(user.id);

      return NextResponse.json({
        user: {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          role: user.role,
          site: user.site,
          crew: user.crew,
        },
      });
    }

    if (action === "logout") {
      clearSession();
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action. Use 'login' or 'logout'." }, { status: 400 });
  } catch (error) {
    console.error("Auth API error:", error);
    return NextResponse.json({ error: "Authentication service error" }, { status: 500 });
  }
}

// GET /api/auth — Get current session
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ user: null });
  }
  return NextResponse.json({ user: session });
}
