import { NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ---------- unified admin key handling (same as auth/verify) ---------- */

function getConfiguredKeys(): string[] {
    const candidates = [
        process.env.ADMIN_EXPORT_KEY,   // canonical
        process.env.ADMIN_EXPORTS_KEY,  // legacy
        process.env.ADMIIN_EXPORTS_KEY, // common typo
    ].filter((v): v is string => !!v);

    return candidates
        .flatMap(v => v.split(",")) // allow rotation: "new,old"
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

// Transitional token extraction: prefer Authorization: Bearer,
// optionally accept ?key= for backward compatibility.
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
    if (KEY_HASHES.length === 0) {
        const err: any = new Error("admin_key_not_configured");
        throw err;
    }
    const token = extractToken(req);
    if (!verifyToken(token)) throw new Error("unauthorized");
}


export async function HEAD(req: Request) {
    try {
        assertAdminAuth(req);
        return new NextResponse(null, {
            status: 204,
            headers: { "Cache-Control": "no-store" },
        });
    } catch (e: any) {
        const status = e?.message === "admin_key_not_configured" ? 500 : 401;
        return NextResponse.json({ error: e?.message ?? "Unauthorized" }, { status });
    }
}

export async function GET(req: Request) {
    try {
        assertAdminAuth(req);
        const resp = {
            secretKeyConfigured: !!process.env.STRIPE_SECRET_KEY,
            publishableKeyConfigured: !!process.env.STRIPE_PUBLISHABLE_KEY,
            webhookSecretConfigured: !!process.env.STRIPE_WEBHOOK_SECRET,
        };
        return NextResponse.json(resp);
    } catch {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}
