import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

// PATCH /api/users/[id] — Update user details or reset password (Officers only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session || session.role !== "officer") {
    return NextResponse.json({ error: "Unauthorized: Officer access required" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { displayName, role, site, crew, newPassword } = body;

    const updateData: Record<string, unknown> = {};

    if (displayName) updateData.displayName = displayName.trim();
    if (role && (role === "employee" || role === "officer")) updateData.role = role;
    if (site !== undefined) updateData.site = site || null;
    if (crew !== undefined) updateData.crew = crew || null;

    if (newPassword && newPassword.trim().length > 0) {
      updateData.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
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

    return NextResponse.json({ user: updatedUser, message: "User updated successfully" });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Failed to update user account" }, { status: 500 });
  }
}

// DELETE /api/users/[id] — Delete user account (Officers only)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session || session.role !== "officer") {
    return NextResponse.json({ error: "Unauthorized: Officer access required" }, { status: 403 });
  }

  // Prevent user from deleting their own active session
  if (session.id === params.id) {
    return NextResponse.json({ error: "Cannot delete your own active officer account" }, { status: 400 });
  }

  try {
    await prisma.user.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "User account deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
