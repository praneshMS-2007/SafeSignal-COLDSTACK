import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { reclassifyWithCoachAnswer } from "@/lib/ai/classifier";

// POST /api/coach — Answer coach question, reclassify report
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { reportId, answer } = body; // answer: "Yes" | "No" | "Unknown"

  const classification = await prisma.classification.findUnique({
    where: { reportId },
  });

  if (!classification) {
    return NextResponse.json({ error: "Classification not found" }, { status: 404 });
  }

  // Parse existing fields
  const fields = {
    energyType: classification.energyType,
    killThreshold: classification.killThreshold as "Yes" | "No" | null,
    workerProximity: classification.workerProximity as "Hands-on" | "Adjacent" | "Remote" | null,
    barrierRequired: classification.barrierRequired,
    barrierState: classification.barrierState as "PRESENT" | "ABSENT" | "UNKNOWN",
    iogpRule: classification.iogpRule,
    anyoneHurt: classification.anyoneHurt as "Yes" | "No" | null,
    evidenceQuotes: JSON.parse(classification.evidenceQuotes || "[]"),
  };

  // Reclassify with the coach answer
  const newResult = reclassifyWithCoachAnswer(fields, answer);

  // Update classification
  const updated = await prisma.classification.update({
    where: { reportId },
    data: {
      classification: newResult.classification,
      priority: newResult.priority,
      barrierState: answer === "Yes" ? "PRESENT" : answer === "No" ? "ABSENT" : "UNKNOWN",
      coachAnswer: answer,
      finalVerdict: newResult.verdict,
      confidence: answer === "Unknown" ? 0.3 : 0.95,
    },
  });

  return NextResponse.json({
    classification: updated,
    isStopWork: newResult.classification === "PSIF",
  });
}
