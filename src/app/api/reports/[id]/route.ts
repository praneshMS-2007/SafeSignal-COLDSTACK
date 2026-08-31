import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/reports/[id] — Get a single report with full classification
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const report = await prisma.report.findUnique({
    where: { id: params.id },
    include: { classification: true, tickets: true },
  });

  if (!report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  return NextResponse.json(report);
}

// PATCH /api/reports/[id] — Update status, confirm/correct classification
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const { status, correctedClassification, correctionNote } = body;

  const updates: Record<string, unknown> = {};
  if (status) updates.status = status;

  const report = await prisma.report.update({
    where: { id: params.id },
    data: updates,
    include: { user: true },
  });

  // If correcting classification
  if (correctedClassification) {
    const priorityMap: Record<string, number> = { PSIF: 1, SIF: 1, CAPACITY: 2, ROUTINE: 4 };
    await prisma.classification.update({
      where: { reportId: params.id },
      data: {
        classification: correctedClassification,
        priority: priorityMap[correctedClassification] || 3,
        finalVerdict: `Manually corrected by safety officer${correctionNote ? `: ${correctionNote}` : ""}`,
      },
    });
  }

  // CLOSED-LOOP: Notify reporter about status change
  if (status && report.userId) {
    const messages: Record<string, { title: string; body: string; type: string }> = {
      ASSIGNED: {
        title: "Your report is being addressed",
        body: "A repair team has been assigned to fix the hazard you reported.",
        type: "REPORT_TRIAGED",
      },
      FIXED: {
        title: "Hazard has been repaired",
        body: "The hazard you reported has been fixed. The repair is now entering a verification watch period.",
        type: "REPORT_FIXED",
      },
      VERIFIED_CLOSED: {
        title: "✓ Report verified & closed",
        body: "Your reported hazard has been fixed and verified over the watch period. Thank you for keeping everyone safe.",
        type: "REPORT_FIXED",
      },
    };

    const msg = messages[status];
    if (msg) {
      await prisma.notification.create({
        data: {
          userId: report.userId,
          title: msg.title,
          body: msg.body,
          type: msg.type,
          reportId: params.id,
        },
      });
    }
  }

  return NextResponse.json(report);
}
