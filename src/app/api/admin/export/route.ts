// src/app/api/admin/export/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createHash, timingSafeEqual } from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ---------- unified admin key handling ---------- */
function getConfiguredKeys(): string[] {
  const candidates = [
    process.env.ADMIN_EXPORT_KEY,   // canonical
    process.env.ADMIN_EXPORTS_KEY,  // legacy
    process.env.ADMIIN_EXPORTS_KEY, // common typo
  ].filter((v): v is string => !!v);

  return candidates
    .flatMap(v => v.split(","))
    .map(s => s.trim())
    .filter(Boolean);
}

const KEY_HASHES = getConfiguredKeys().map(k =>
  createHash("sha256").update(k, "utf8").digest()
);

function verifyToken(token: string | null): boolean {
  if (!token || KEY_HASHES.length === 0) return false;
  const probe = createHash("sha256").update(token, "utf8").digest();
  return KEY_HASHES.some(h => h.length === probe.length && timingSafeEqual(h, probe));
}

function extractToken(req: Request): string | null {
  const h = new Headers(req.headers);
  const auth = h.get("authorization") || "";
  if (auth.startsWith("Bearer ")) return auth.slice(7);
  // Optional legacy: ?key=
  try { return new URL(req.url).searchParams.get("key"); } catch { return null; }
}

function assertAdminAuth(req: Request) {
  if (KEY_HASHES.length === 0) throw new Error("admin_key_not_configured");
  const token = extractToken(req);
  if (!verifyToken(token)) throw new Error("unauthorized");
}

/* ---------------- CSV helpers ----------------- */
function csvEscape(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function toISO(d: unknown): string {
  if (!d) return "";
  try {
    if (d instanceof Date) return d.toISOString();
    const maybe = new Date(d as any);
    return isNaN(+maybe) ? "" : maybe.toISOString();
  } catch { return ""; }
}

/* ---------------- Handlers -------------------- */
export async function HEAD(req: Request) {
  try {
    assertAdminAuth(req);
    return new NextResponse(null, { status: 204, headers: { "Cache-Control": "no-store" } });
  } catch (e: any) {
    const status = e?.message === "admin_key_not_configured" ? 500 : 401;
    return NextResponse.json({ error: e?.message ?? "Unauthorized" }, { status });
  }
}

export async function GET(req: Request) {
  try {
    assertAdminAuth(req);

    // Fetch rows (no schema assumptions beyond table existence)
    const [interests, attendees] = await Promise.all([
      db.interest.findMany(),
      db.attendee.findMany(),
    ]);

    // Stable, superset header. Unknown fields are populated via runtime lookups.
    const header = [
      "type",
      "id",
      "email",
      "fullName",     // optional (fallbacks to name/first+last)
      "affiliation",  // optional (fallbacks to organization)
      "ticketType",
      "amountCents",
      "currency",
      "paidAt",
      "createdAt",
    ];

    const interestRows = interests.map((i) => {
      const anyI = i as any;
      const name =
        anyI.fullName ??
        anyI.name ??
        (anyI.firstName ? `${anyI.firstName} ${anyI.lastName ?? ""}`.trim() : "");
      const affiliation = anyI.affiliation ?? anyI.organization ?? "";

      const row = [
        "interest",
        anyI.id,
        anyI.email,
        name,
        affiliation,
        "", // ticketType
        "", // amountCents
        "", // currency
        "", // paidAt
        toISO(anyI.createdAt),
      ];
      return row.map(csvEscape).join(",");
    });

    const attendeeRows = attendees.map((a) => {
      const anyA = a as any;
      const name =
        anyA.fullName ??
        anyA.name ??
        (anyA.firstName ? `${anyA.firstName} ${anyA.lastName ?? ""}`.trim() : "");
      const affiliation = anyA.affiliation ?? anyA.organization ?? "";

      const row = [
        "attendee",
        anyA.id,
        anyA.email,
        name,
        affiliation,
        anyA.ticketType ?? "",
        anyA.amountCents ?? "",
        anyA.currency ?? "",
        toISO(anyA.paidAt),
        toISO(anyA.createdAt),
      ];
      return row.map(csvEscape).join(",");
    });

    const body = [header.join(","), ...interestRows, ...attendeeRows].join("\n");

    return new NextResponse(body, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="export-${new Date().toISOString().slice(0, 10)}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e: any) {
    const status = e?.message === "admin_key_not_configured" ? 500 : 401;
    return NextResponse.json({ error: e?.message ?? "Unauthorized" }, { status });
  }
}
