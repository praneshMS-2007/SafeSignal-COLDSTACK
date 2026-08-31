import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/triage — Triage queue sorted by fatal potential
export async function GET() {
  // Get all triaged reports with classifications, sorted by priority (1=highest)
  const reports = await prisma.report.findMany({
    where: {
      status: { in: ["TRIAGED", "PENDING"] },
    },
    include: { classification: true },
    orderBy: { createdAt: "desc" },
  });

  // Sort by priority (fatal potential), not date
  const sorted = reports.sort((a, b) => {
    const pa = a.classification?.priority ?? 4;
    const pb = b.classification?.priority ?? 4;
    if (pa !== pb) return pa - pb; // Lower priority number = higher urgency
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Compute stats
  const psifCount = sorted.filter(
    (r) => r.classification?.classification === "PSIF"
  ).length;
  const reviewCount = sorted.filter(
    (r) => r.classification?.barrierState === "UNKNOWN" || r.classification?.finalVerdict?.includes("disagree")
  ).length;
  const capacityCount = sorted.filter(
    (r) => r.classification?.classification === "CAPACITY"
  ).length;

  // Get barrier health for MTBF trend
  const barrierHealth = await prisma.barrierHealth.findMany({
    orderBy: { mtbfDays: "asc" },
    take: 1,
  });

  const mtbfTrend = barrierHealth[0]
    ? { days: barrierHealth[0].mtbfDays, barrier: barrierHealth[0].barrierName }
    : { days: 0, barrier: "N/A" };

  return NextResponse.json({
    reports: sorted,
    stats: {
      psifCount,
      reviewCount,
      capacityCount,
      mtbfTrend,
    },
  });
}
