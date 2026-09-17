import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

let cacheData: { data: any; expiry: number } | null = null;

// GET /api/barriers — Barrier health dashboard data
export async function GET() {
  const now = Date.now();
  if (cacheData && cacheData.expiry > now) {
    return NextResponse.json(cacheData.data);
  }

  const [barriers, sites] = await Promise.all([
    prisma.barrierHealth.findMany({
      orderBy: { mtbfDays: "asc" },
    }),
    prisma.site.findMany({
      orderBy: { precursorRate: "desc" },
    }),
  ]);

  const payload = { barriers, sites };
  cacheData = { data: payload, expiry: now + 10000 }; // 10s cache

  return NextResponse.json(payload);
}
