import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding SafeSignal database...");

  // ─── Clear all data ───────────────────────────────────────────
  await prisma.notification.deleteMany();
  await prisma.evidence.deleteMany();
  await prisma.linkedReport.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.classification.deleteMany();
  await prisma.report.deleteMany();
  await prisma.barrierHealth.deleteMany();
  await prisma.site.deleteMany();
  await prisma.setting.deleteMany();
  await prisma.user.deleteMany();

  // ─── Demo Users ───────────────────────────────────────────────
  const passwordHash = await bcrypt.hash("password", 10);

  const admin = await prisma.user.create({
    data: { username: "admin", passwordHash, displayName: "H.S. Bora (HSE Admin)", role: "officer", site: "Duliajan HQ", crew: "HSE Inspection Team" },
  });
  const officer1 = await prisma.user.create({
    data: { username: "officer1", passwordHash, displayName: "A.K. Sharma", role: "officer", site: "Duliajan HQ", crew: "HSE Inspection Team" },
  });
  const worker1 = await prisma.user.create({
    data: { username: "worker1", passwordHash, displayName: "Ramesh Bora", role: "employee", site: "Rig 4", crew: "Workover crew B" },
  });
  const worker2 = await prisma.user.create({
    data: { username: "worker2", passwordHash, displayName: "Suresh Kalita", role: "employee", site: "Bay 3", crew: "Maintenance A" },
  });
  const worker3 = await prisma.user.create({
    data: { username: "worker3", passwordHash, displayName: "Pranab Gogoi", role: "employee", site: "Platform 2", crew: "Scaffolding team" },
  });
  const worker4 = await prisma.user.create({
    data: { username: "worker4", passwordHash, displayName: "Bipul Saikia", role: "employee", site: "Rig 7", crew: "Wellhead crew" },
  });
  console.log(`  ✓ 6 demo users created (admin, officer1, worker1, worker2, worker3, worker4 — password: "password")`);

  // ─── Sites ────────────────────────────────────────────────────
  await Promise.all([
    prisma.site.create({ data: { name: "Site Alpha", precursorRate: 12.4 } }),
    prisma.site.create({ data: { name: "Site Beta", precursorRate: 8.2 } }),
    prisma.site.create({ data: { name: "Site Gamma", precursorRate: 5.1 } }),
    prisma.site.create({ data: { name: "Site Delta", precursorRate: 3.8 } }),
    prisma.site.create({ data: { name: "Site Echo", precursorRate: 2.1 } }),
  ]);
  console.log(`  ✓ 5 sites created`);

  // ─── Barrier Health ───────────────────────────────────────────
  await Promise.all([
    prisma.barrierHealth.create({ data: { barrierName: "Energy isolation", mtbfDays: 9, lastQuarterMtbf: 31, trend: "DECLINING", icon: "electrical_services" } }),
    prisma.barrierHealth.create({ data: { barrierName: "Work authorisation", mtbfDays: 24, lastQuarterMtbf: 22, trend: "STATIC", icon: "gavel" } }),
    prisma.barrierHealth.create({ data: { barrierName: "Line of fire", mtbfDays: 62, lastQuarterMtbf: 45, trend: "IMPROVING", icon: "alt_route" } }),
  ]);
  console.log(`  ✓ 3 barrier health records`);

  // ─── Reports ──────────────────────────────────────────────────
  const r1 = await prisma.report.create({
    data: { rawText: "changed valve on line 4, gas smell present, no permit taken", inputMode: "VOICE", site: "Rig 4", location: "Duliajan", crew: "Workover crew B", timestamp: "14:32", status: "TRIAGED", hazardCategory: "Gas", userId: worker1.id },
  });
  await prisma.classification.create({
    data: { reportId: r1.id, classification: "PSIF", priority: 1, energyType: "Pressurised gas", killThreshold: "Yes", workerProximity: "Hands-on", barrierRequired: "Work permit", barrierState: "ABSENT", iogpRule: "Work Authorisation", anyoneHurt: "No", ruleVerdict: "Lethal energy present, barrier ABSENT — PSIF", aiVerdict: "AI: energy=Pressurised gas, barrier=ABSENT, rule=Work Authorisation", finalVerdict: "Rules and AI agreed: PSIF", evidenceQuotes: JSON.stringify(["line 4", "gas smell", "no permit taken"]), confidence: 0.95 },
  });

  const r2 = await prisma.report.create({
    data: { rawText: "Worker spotted standing directly under suspended load during crane operation, no barricade tape", inputMode: "TEXT", site: "Bay 3", location: "Duliajan", crew: "Maintenance A", timestamp: "14:10", status: "TRIAGED", hazardCategory: "Falling object", userId: worker2.id },
  });
  await prisma.classification.create({
    data: { reportId: r2.id, classification: "PSIF", priority: 1, energyType: "Gravity", killThreshold: "Yes", workerProximity: "Hands-on", barrierRequired: "Line of Fire controls", barrierState: "ABSENT", iogpRule: "Line of Fire", anyoneHurt: "No", ruleVerdict: "Lethal energy present, barrier ABSENT — PSIF", aiVerdict: "AI: energy=Gravity, barrier=ABSENT, rule=Line of Fire", finalVerdict: "Rules and AI agreed: PSIF", evidenceQuotes: JSON.stringify(["suspended load", "no barricade tape"]), confidence: 0.92 },
  });

  const r3 = await prisma.report.create({
    data: { rawText: "pipe fitting replaced near wellhead, seemed okay but not sure if isolation was done", inputMode: "TEXT", site: "Rig 7", location: "Moran", crew: "Wellhead crew", timestamp: "13:45", status: "TRIAGED", hazardCategory: "Gas", userId: worker1.id },
  });
  await prisma.classification.create({
    data: { reportId: r3.id, classification: "CAPACITY", priority: 2, energyType: "Pressurised gas", killThreshold: "Yes", workerProximity: "Hands-on", barrierRequired: "Energy isolation", barrierState: "UNKNOWN", iogpRule: "Energy Isolation", anyoneHurt: "No", ruleVerdict: "Barrier state unknown — escalate", aiVerdict: "AI: energy=Pressurised gas, barrier=UNKNOWN", finalVerdict: "Barrier state unknown — one-question coach triggered", evidenceQuotes: JSON.stringify(["pipe fitting replaced", "not sure if isolation"]), confidence: 0.5, coachQuestion: "Was the line isolated and locked out before you started?" },
  });

  const r4 = await prisma.report.create({
    data: { rawText: "Heavy load lifted over bay 1, area was barricaded and all personnel cleared before lift", inputMode: "TEXT", site: "Bay 1", location: "Duliajan", crew: "Crane crew C", timestamp: "10:15", status: "TRIAGED", hazardCategory: "Falling object", userId: worker2.id },
  });
  await prisma.classification.create({
    data: { reportId: r4.id, classification: "CAPACITY", priority: 3, energyType: "Gravity", killThreshold: "Yes", workerProximity: "Remote", barrierRequired: "Line of Fire controls", barrierState: "PRESENT", iogpRule: "Lifting Operations", anyoneHurt: "No", ruleVerdict: "Lethal energy present, barrier held — capacity event", aiVerdict: "AI: energy=Gravity, barrier=PRESENT", finalVerdict: "Rules and AI agreed: CAPACITY", evidenceQuotes: JSON.stringify(["barricaded", "all personnel cleared"]), confidence: 0.95 },
  });

  const r5 = await prisma.report.create({
    data: { rawText: "Missing handrail on platform 2, workers accessing without fall protection", inputMode: "TEXT", site: "Platform 2", location: "Duliajan", crew: "Scaffolding team", timestamp: "09:30", status: "VERIFIED_CLOSED", hazardCategory: "Height", userId: worker1.id },
  });
  await prisma.classification.create({
    data: { reportId: r5.id, classification: "PSIF", priority: 1, energyType: "Gravity", killThreshold: "Yes", workerProximity: "Hands-on", barrierRequired: "Fall protection", barrierState: "ABSENT", iogpRule: "Working at Height", anyoneHurt: "No", ruleVerdict: "Lethal energy present, barrier ABSENT — PSIF", aiVerdict: "AI: energy=Gravity, barrier=ABSENT", finalVerdict: "Rules and AI agreed: PSIF", evidenceQuotes: JSON.stringify(["missing handrail", "without fall protection"]), confidence: 0.93 },
  });

  const r6 = await prisma.report.create({
    data: { rawText: "Small oil spill observed near the store shed, approximately 2 liters, contained by existing bunding", inputMode: "TEXT", site: "Store shed", location: "Duliajan", crew: "Logistics team", timestamp: "11:45", status: "TRIAGED", hazardCategory: "Vehicle", userId: worker2.id },
  });
  await prisma.classification.create({
    data: { reportId: r6.id, classification: "ROUTINE", priority: 4, energyType: "Chemical", killThreshold: "No", workerProximity: "Adjacent", barrierRequired: "Spill containment", barrierState: "PRESENT", iogpRule: null, anyoneHurt: "No", ruleVerdict: "Energy below kill threshold — routine", aiVerdict: "AI: energy=Chemical, barrier=PRESENT", finalVerdict: "Rules and AI agreed: ROUTINE", evidenceQuotes: JSON.stringify(["small oil spill", "contained by bunding"]), confidence: 0.97 },
  });

  console.log(`  ✓ 6 reports with classifications`);

  // ─── Tickets ──────────────────────────────────────────────────
  const t1 = await prisma.ticket.create({
    data: { reportId: r1.id, barrier: "Energy isolation", failureMode: "Installed but not verified", owner: "R. Bora, Maintenance", site: "Rig 4", dueDate: "3 Sept", status: "UNDER_WATCH", watchStartDate: "2026-08-15", watchDaysTotal: 30, watchDaysElapsed: 12 },
  });
  await prisma.linkedReport.createMany({
    data: [
      { ticketId: t1.id, type: "FAILED_VERIFICATION", description: "Report #8892 - Isolation tagged but lock missing during audit.", date: "12 Aug", reportRef: "#8892" },
      { ticketId: t1.id, type: "MAINTENANCE_LOG", description: "Log #334 - Valve replaced, energy isolation procedure initiated.", date: "05 Aug", reportRef: "#334" },
      { ticketId: t1.id, type: "INCIDENT_NEAR_MISS", description: "Report #8710 - Pressure buildup detected near isolation point.", date: "22 Jul", reportRef: "#8710" },
    ],
  });

  await prisma.ticket.create({
    data: { reportId: r5.id, barrier: "Fall protection", failureMode: "Handrail missing from platform", owner: "S. Kalita, Scaffolding", site: "Platform 2", dueDate: "10 Sept", status: "FIXED", watchDaysTotal: 30, watchDaysElapsed: 0 },
  });
  console.log(`  ✓ 2 tickets with linked reports`);

  // ─── Notifications (closed-loop demos) ────────────────────────
  await prisma.notification.createMany({
    data: [
      { userId: worker1.id, title: "Report classified: PSIF", body: "Your valve report at Rig 4 has been flagged as critical. Safety officer alerted.", type: "STOP_WORK", reportId: r1.id },
      { userId: worker1.id, title: "Hazard fixed: Missing handrail", body: "The handrail on Platform 2 has been repaired and verified. Ticket closed after 30-day watch.", type: "REPORT_FIXED", reportId: r5.id },
      { userId: worker1.id, title: "Coach question needed", body: "We need one quick answer about your pipe fitting report at Rig 7.", type: "COACH_NEEDED", reportId: r3.id },
      { userId: worker2.id, title: "Report classified: PSIF", body: "Your suspended load report at Bay 3 has been flagged as critical.", type: "STOP_WORK", reportId: r2.id },
      { userId: officer1.id, title: "⚠️ PSIF detected at Rig 4", body: "\"changed valve on line 4, gas smell present, no permit taken\" — Rules and AI agreed: PSIF", type: "STOP_WORK", reportId: r1.id },
      { userId: officer1.id, title: "⚠️ PSIF detected at Bay 3", body: "\"Worker spotted standing directly under suspended load\" — Rules and AI agreed: PSIF", type: "STOP_WORK", reportId: r2.id },
      { userId: officer1.id, title: "Ticket auto-reopened: Energy isolation", body: "Same barrier failed again at Rig 4. Repeat failure detected. Ticket escalated.", type: "TICKET_UPDATE", reportId: r1.id },
    ],
  });
  console.log(`  ✓ 7 demo notifications`);

  // ─── Default Settings ─────────────────────────────────────────
  await prisma.setting.createMany({
    data: [
      { key: "autoStopWork", value: "true" },
      { key: "notifyOfficerPsif", value: "true" },
      { key: "failSafeEscalate", value: "true" },
      { key: "watchDays", value: "30" },
    ],
  });
  console.log(`  ✓ Default settings`);

  console.log("\n✅ Seed complete! SafeSignal database is ready.");
  console.log("   Demo accounts: worker1/password, worker2/password, officer1/password");
}

main()
  .catch((e) => { console.error("❌ Seed failed:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
