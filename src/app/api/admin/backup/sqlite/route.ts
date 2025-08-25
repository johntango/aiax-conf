// src/app/api/admin/backup/sqlite/route.ts
import { NextResponse } from "next/server";
import { createReadStream, statSync } from "fs";
import { Readable } from "stream";
import path from "path";
import { createHash, timingSafeEqual } from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ---------- unified admin key handling (same as other routes) ---------- */
function getConfiguredKeys(): string[] {
    const candidates = [
        process.env.ADMIN_EXPORT_KEY,   // canonical
        process.env.ADMIN_EXPORTS_KEY,  // legacy
    ].filter((v): v is string => !!v);

    return candidates
        .flatMap((v) => v.split(","))
        .map((s) => s.trim())
        .filter(Boolean);
}

const KEY_HASHES = getConfiguredKeys().map((k) =>
    createHash("sha256").update(k, "utf8").digest()
);

function verifyToken(token: string | null): boolean {
    if (!token || KEY_HASHES.length === 0) return false;
    const probe = createHash("sha256").update(token, "utf8").digest();
    return KEY_HASHES.some((h) => h.length === probe.length && timingSafeEqual(h, probe));
}

function extractToken(req: Request): string | null {
    const h = new Headers(req.headers);
    const auth = h.get("authorization") || "";
    if (auth.startsWith("Bearer ")) return auth.slice(7);
    try {
        const url = new URL(req.url);
        const qp = url.searchParams.get("key");
        if (qp) return qp;
    } catch { /* ignore */ }
    return null;
}

function assertAdminAuth(req: Request) {
    if (KEY_HASHES.length === 0) throw new Error("admin_key_not_configured");
    const token = extractToken(req);
    if (!verifyToken(token)) throw new Error("unauthorized");
}

/* ---------------- SQLite path resolution ---------------- */
function resolveSqlitePath(): string {
    const dbUrl = process.env.DATABASE_URL || "file:/data/sqlite.db";
    if (dbUrl.startsWith("file:")) {
        let p = dbUrl.slice(5); // strip "file:"
        if (p.startsWith("./") || !p.startsWith("/")) {
            // normalize relative paths like ./dev.db
            p = path.resolve(process.cwd(), p);
        }
        return p;
    }
    // If someone supplied a bare path in DATABASE_URL, allow it.
    return dbUrl;
}

/* ------------------------------ HANDLERS ------------------------------ */

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

        const dbPath = resolveSqlitePath();
        let size = 0;
        try {
            size = statSync(dbPath).size;
        } catch {
            return NextResponse.json({ error: `Database file not found at ${dbPath}` }, { status: 404 });
        }

        const stream = createReadStream(dbPath);
        return new NextResponse(Readable.toWeb(stream) as any, {
            headers: {
                "Content-Type": "application/octet-stream",
                "Content-Length": String(size),
                "Content-Disposition": `attachment; filename="sqlite-${new Date().toISOString().slice(0, 10)}.db"`,
                "Cache-Control": "no-store",
            },
        });
    } catch (e: any) {
        const status = e?.message === "admin_key_not_configured" ? 500 : 401;
        return NextResponse.json({ error: e?.message ?? "Unauthorized" }, { status });
    }
}
