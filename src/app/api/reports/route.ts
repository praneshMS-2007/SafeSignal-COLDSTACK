import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { classifyReport } from "@/lib/ai/classifier";
import { getSession } from "@/lib/auth";

// GET /api/reports — List reports with optional filters
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const site = searchParams.get("site");
  const userId = searchParams.get("userId");

  const reports = await prisma.report.findMany({
    where: {
      ...(status && { status }),
      ...(site && { site }),
      ...(userId && { userId }),
    },
    include: { classification: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(reports);
}

// POST /api/reports — Submit a new hazard report
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rawText, hazardCategory, inputMode, location, site, crew, timestamp, mediaUrl } = body;

    if (!rawText || rawText.trim().length === 0) {
      return NextResponse.json({ error: "Report text is required" }, { status: 400 });
    }

    // Get current user session
    const session = await getSession();

    // 1. Create the report
    const report = await prisma.report.create({
      data: {
        rawText,
        hazardCategory: hazardCategory || null,
        inputMode: inputMode || "TEXT",
        location: location || null,
        site: site || null,
        crew: crew || null,
        timestamp: timestamp || new Date().toISOString(),
        mediaUrl: mediaUrl || null,
        userId: session?.id || null,
        status: "PENDING",
      },
    });

    // 2. Run AI classification
    const result = await classifyReport(rawText);

    // 3. Store classification
    const classification = await prisma.classification.create({
      data: {
        reportId: report.id,
        classification: result.classification,
        priority: result.priority,
        energyType: result.fields.energyType,
        killThreshold: result.fields.killThreshold,
        workerProximity: result.fields.workerProximity,
        barrierRequired: result.fields.barrierRequired,
        barrierState: result.fields.barrierState,
        iogpRule: result.fields.iogpRule,
        anyoneHurt: result.fields.anyoneHurt,
        ruleVerdict: result.ruleVerdict,
        aiVerdict: result.aiVerdict,
        finalVerdict: result.finalVerdict,
        evidenceQuotes: JSON.stringify(result.fields.evidenceQuotes),
        confidence: result.confidence,
        coachQuestion: result.coachQuestion,
      },
    });

    // 4. Update report status
    await prisma.report.update({
      where: { id: report.id },
      data: { status: "TRIAGED" },
    });

    // 5. CLOSED-LOOP: Notify the reporter about classification
    if (session?.id) {
      await prisma.notification.create({
        data: {
          userId: session.id,
          title: `Report classified: ${result.classification}`,
          body: result.finalVerdict,
          type: result.classification === "PSIF" ? "STOP_WORK" : "REPORT_TRIAGED",
          reportId: report.id,
        },
      });
    }

    // 6. CROSS-REPORT PATTERN: Check for similar barrier failures
    if (result.fields.barrierRequired && result.fields.barrierState === "ABSENT") {
      const similarReports = await prisma.classification.findMany({
        where: {
          barrierRequired: result.fields.barrierRequired,
          barrierState: "ABSENT",
          reportId: { not: report.id },
          report: { site: site || undefined },
        },
        include: { report: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      });

      // 7. CORRECTIVE-ACTION VERIFICATION: Auto-reopen matching tickets
      if (similarReports.length > 0) {
        const matchingTickets = await prisma.ticket.findMany({
          where: {
            barrier: result.fields.barrierRequired,
            site: site || undefined,
            status: { in: ["FIXED", "UNDER_WATCH"] },
          },
        });

        for (const ticket of matchingTickets) {
          // Auto-reopen and escalate
          await prisma.ticket.update({
            where: { id: ticket.id },
            data: { status: "OPEN", watchDaysElapsed: 0 },
          });

          // Link this report to the ticket
          await prisma.linkedReport.create({
            data: {
              ticketId: ticket.id,
              type: "FAILED_VERIFICATION",
              description: `Auto-reopened: Same barrier (${result.fields.barrierRequired}) failed again. Report: "${rawText.substring(0, 80)}"`,
              date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
              reportRef: report.id,
            },
          });

          // Notify all officers about the reopen
          const officers = await prisma.user.findMany({ where: { role: "officer" } });
          for (const officer of officers) {
            await prisma.notification.create({
              data: {
                userId: officer.id,
                title: `Ticket auto-reopened: ${ticket.barrier}`,
                body: `Same barrier failed again at ${site}. Repeat failure detected. Ticket #${ticket.id.slice(-4)} escalated.`,
                type: "TICKET_UPDATE",
                reportId: report.id,
              },
            });
          }
        }
      }
    }

    // 8. Notify all safety officers about the new report
    const officers = await prisma.user.findMany({ where: { role: "officer" } });
    for (const officer of officers) {
      if (result.classification === "PSIF" || result.classification === "SIF") {
        await prisma.notification.create({
          data: {
            userId: officer.id,
            title: `⚠️ ${result.classification} detected at ${site || "Rig 4"}`,
            body: `"${rawText.substring(0, 90)}" — ${result.finalVerdict}`,
            type: "STOP_WORK",
            reportId: report.id,
          },
        });
      } else {
        await prisma.notification.create({
          data: {
            userId: officer.id,
            title: `New Observation filed at ${site || "Rig 4"} (${result.classification})`,
            body: `"${rawText.substring(0, 90)}" — ${result.finalVerdict}`,
            type: "REPORT_TRIAGED",
            reportId: report.id,
          },
        });
      }
    }

    return NextResponse.json({
      report: { ...report, status: "TRIAGED" },
      classification,
      needsCoach: !!result.coachQuestion,
      coachQuestion: result.coachQuestion,
    }, { status: 201 });

  } catch (error) {
    console.error("Report submission error:", error);
    return NextResponse.json({ error: "Failed to process report" }, { status: 500 });
  }
}
