import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

// GET /api/users — List all users (Officers only)
export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "officer") {
    return NextResponse.json({ error: "Unauthorized: Officer access required" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      displayName: true,
      role: true,
      site: true,
      crew: true,
      createdAt: true,
      _count: {
        select: {
          reports: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ users });
}

// POST /api/users — Create a new employee or officer account (Officers only)
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "officer") {
    return NextResponse.json({ error: "Unauthorized: Officer access required" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { username, password, displayName, role, site, crew } = body;

    if (!username || !password || !displayName) {
      return NextResponse.json({ error: "Username, password, and full name are required" }, { status: 400 });
    }

    // Check if username is already taken
    const existing = await prisma.user.findUnique({
      where: { username: username.trim().toLowerCase() },
    });

    if (existing) {
      return NextResponse.json({ error: "Username already exists. Please choose another." }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        username: username.trim().toLowerCase(),
        passwordHash,
        displayName: displayName.trim(),
        role: role === "officer" ? "officer" : "employee",
        site: site || null,
        crew: crew || null,
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        role: true,
        site: true,
        crew: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user: newUser, message: "User account created successfully" }, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "Failed to create user account" }, { status: 500 });
  }
}
