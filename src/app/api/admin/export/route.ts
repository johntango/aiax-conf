// src/app/api/admin/export/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
export const dynamic = "force-dynamic";


function assertAuth(headers: Headers) {
  const auth = headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token || token !== process.env.ADMIN_EXPORT_KEY) throw new Error("unauthorized");
}

export async function HEAD(req: Request) {
  try {
    assertAuth(new Headers(req.headers));
    return new NextResponse(null, { status: 204, headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

// (keep your existing GET handler unchanged)




function csvEscape(v: any) {
  const s = v == null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
function toCSV(rows: Record<string, any>[]) {
  if (!rows.length) return "";
  const cols = Array.from(new Set(rows.flatMap(r => Object.keys(r))));
  const header = cols.map(csvEscape).join(",");
  const lines = rows.map(r => cols.map(c => csvEscape(r[c])).join(","));
  return [header, ...lines].join("\n");
}

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  if (!process.env.ADMIN_EXPORT_KEY || key !== process.env.ADMIN_EXPORT_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Pull data
  const interests = await db.interest.findMany({ orderBy: { createdAt: "desc" } });
  const attendees = await db.attendee.findMany({ orderBy: { createdAt: "desc" } });

  // Shape rows
  const interestRows = interests.map(i => ({
    id: i.id, name: i.name, email: i.email,
    affiliation: i.affiliation ?? "",
    notes: i.notes ?? "",
    createdAt: i.createdAt.toISOString(),
  }));
  const attendeeRows = attendees.map(a => ({
    id: a.id, name: a.name, email: a.email,
    affiliation: a.affiliation ?? "",
    status: a.status,
    stripeSessionId: a.stripeSessionId ?? "",
    stripePaymentIntentId: a.stripePaymentIntentId ?? "",
    createdAt: a.createdAt.toISOString(),
  }));

  const out =
    `## Interests
${toCSV(interestRows)}

## Attendees
${toCSV(attendeeRows)}
`;

  return new NextResponse(out, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="export-${new Date().toISOString().slice(0, 10)}.csv"`
    }
  });
}
