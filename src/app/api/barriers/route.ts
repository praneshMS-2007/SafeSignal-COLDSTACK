import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/barriers — Barrier health dashboard data
export async function GET() {
  const barriers = await prisma.barrierHealth.findMany({
    orderBy: { mtbfDays: "asc" },
  });

  const sites = await prisma.site.findMany({
    orderBy: { precursorRate: "desc" },
  });

  return NextResponse.json({
    barriers,
    sites,
  });
}
