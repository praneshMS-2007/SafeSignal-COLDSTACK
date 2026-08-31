import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/tickets — List all tickets
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const tickets = await prisma.ticket.findMany({
    where: status ? { status } : undefined,
    include: { report: { include: { classification: true } }, linkedReports: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(tickets);
}

// POST /api/tickets — Create a repair ticket from a report
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { reportId, barrier, failureMode, owner, site, dueDate } = body;

  const ticket = await prisma.ticket.create({
    data: {
      reportId,
      barrier,
      failureMode: failureMode || null,
      owner: owner || null,
      site: site || null,
      dueDate: dueDate || null,
      status: "OPEN",
    },
  });

  // Update report status
  await prisma.report.update({
    where: { id: reportId },
    data: { status: "ASSIGNED" },
  });

  return NextResponse.json(ticket, { status: 201 });
}
