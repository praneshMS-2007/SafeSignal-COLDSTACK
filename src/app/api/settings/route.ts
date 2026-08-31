import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/settings — Get all settings
export async function GET() {
  const settings = await prisma.setting.findMany();
  const map: Record<string, string> = {};
  settings.forEach((s) => { map[s.key] = s.value; });

  return NextResponse.json({
    autoStopWork: map["autoStopWork"] !== "false",
    notifyOfficerPsif: map["notifyOfficerPsif"] !== "false",
    failSafeEscalate: map["failSafeEscalate"] !== "false",
    watchDays: parseInt(map["watchDays"] || "30"),
  });
}

// PATCH /api/settings — Update settings
export async function PATCH(request: NextRequest) {
  const body = await request.json();

  for (const [key, value] of Object.entries(body)) {
    await prisma.setting.upsert({
      where: { key },
      create: { key, value: String(value) },
      update: { value: String(value) },
    });
  }

  return NextResponse.json({ success: true });
}
