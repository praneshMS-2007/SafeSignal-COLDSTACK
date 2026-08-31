import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { classifyReport } from "@/lib/ai/classifier";

// POST /api/sync — Bulk sync offline-queued reports
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { reports } = body; // Array of offline reports

  if (!Array.isArray(reports) || reports.length === 0) {
    return NextResponse.json({ error: "No reports to sync" }, { status: 400 });
  }

  const results = [];

  for (const offlineReport of reports) {
    try {
      // Create the report
      const report = await prisma.report.create({
        data: {
          rawText: offlineReport.rawText,
          hazardCategory: offlineReport.hazardCategory || null,
          inputMode: offlineReport.inputMode || "TEXT",
          location: offlineReport.location || null,
          site: offlineReport.site || null,
          crew: offlineReport.crew || null,
          timestamp: offlineReport.timestamp || null,
          offlineCreatedAt: offlineReport.offlineCreatedAt || null,
          status: "PENDING",
        },
      });

      // Classify
      const result = await classifyReport(offlineReport.rawText);

      await prisma.classification.create({
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

      await prisma.report.update({
        where: { id: report.id },
        data: { status: "TRIAGED" },
      });

      results.push({ offlineId: offlineReport.offlineId, synced: true, reportId: report.id });
    } catch (error) {
      results.push({ offlineId: offlineReport.offlineId, synced: false, error: String(error) });
    }
  }

  return NextResponse.json({ results, syncedCount: results.filter((r) => r.synced).length });
}
