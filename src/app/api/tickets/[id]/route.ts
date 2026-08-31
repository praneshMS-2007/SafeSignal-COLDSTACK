import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/tickets/[id] — Single ticket with linked reports and evidence
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const ticket = await prisma.ticket.findUnique({
    where: { id: params.id },
    include: {
      report: { include: { classification: true } },
      linkedReports: { orderBy: { date: "desc" } },
      evidences: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!ticket) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }

  return NextResponse.json(ticket);
}

// PATCH /api/tickets/[id] — Update ticket or add evidence
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();

  // Handle evidence upload
  if (body.addEvidence) {
    await prisma.evidence.create({
      data: {
        ticketId: params.id,
        fileName: body.addEvidence.fileName,
        fileUrl: body.addEvidence.fileUrl,
        uploadedBy: body.addEvidence.uploadedBy,
      },
    });
    const ticket = await prisma.ticket.findUnique({
      where: { id: params.id },
      include: { evidences: true },
    });
    return NextResponse.json(ticket);
  }

  // Regular field updates
  const { addEvidence, ...updateData } = body;
  const ticket = await prisma.ticket.update({
    where: { id: params.id },
    data: updateData,
  });

  return NextResponse.json(ticket);
}
