// src/app/api/admin/backup/sqlite/route.ts
import { NextResponse } from "next/server";
import { createReadStream, statSync } from "fs";
import { Readable } from "stream";
import path from "path";
import { createHash, timingSafeEqual } from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* auth */
function getKeys(): string[] {
  const c = [process.env.ADMIN_EXPORTS_KEY]
    .filter((v): v is string => !!v)
    .flatMap(v => v.split(",").map(s => s.trim()).filter(Boolean));
  return c;
}
const KEY_HASHES = getKeys().map(k => createHash("sha256").update(k, "utf8").digest());
function verify(token: string | null): boolean {
  if (!token || KEY_HASHES.length === 0) return false;
  const probe = createHash("sha256").update(token, "utf8").digest();
  return KEY_HASHES.some(h => h.length === probe.length && timingSafeEqual(h, probe));
}
function tokenFrom(req: Request): string | null {
  const h = new Headers(req.headers);
  const a = h.get("authorization") || "";
  if (a.startsWith("Bearer ")) return a.slice(7);
  const qp = new URL(req.url).searchParams.get("key");
  return qp || null;
}
function assertAuth(req: Request) {
  if (KEY_HASHES.length === 0) throw new Error("admin_key_not_configured");
  if (!verify(tokenFrom(req))) throw new Error("unauthorized");
}

/* db path */
function dbPath(): string {
  const url = process.env.DATABASE_URL || "file:/data/sqlite.db";
  if (url.startsWith("file:")) {
    let p = url.slice(5);
    if (!path.isAbsolute(p)) p = path.resolve(process.cwd(), p);
    return p;
  }
  return url;
}

export async function HEAD(req: Request) {
  try { assertAuth(req); return new NextResponse(null, { status: 204, headers: { "Cache-Control": "no-store" } }); }
  catch (e: any) { return NextResponse.json({ error: e?.message ?? "Unauthorized" }, { status: e?.message === "admin_key_not_configured" ? 500 : 401 }); }
}

export async function GET(req: Request) {
  try {
    assertAuth(req);
    const p = dbPath();
    let size = 0;
    try { size = statSync(p).size; }
    catch { return NextResponse.json({ error: `Database file not found at ${p}` }, { status: 404 }); }

    const stream = createReadStream(p);
    return new NextResponse(Readable.toWeb(stream) as any, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Length": String(size),
        "Content-Disposition": `attachment; filename="sqlite-${new Date().toISOString().slice(0,10)}.db"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unauthorized" }, { status: e?.message === "admin_key_not_configured" ? 500 : 401 });
  }
}
