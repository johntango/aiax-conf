// src/app/api/admin/auth/verify/route.ts
import { NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ---- Admin key handling (works in Railway & Codespaces) ---- */

function getConfiguredKeys(): string[] {
    // Accept canonical, legacy, and a common typo
    const candidates = [
        process.env.ADMIN_EXPORTS_KEY,
    ].filter((v): v is string => !!v);

    // Allow comma-separated rotation lists in any var
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

function assertAuth(headers: Headers) {
    if (KEY_HASHES.length === 0) {
        // No key configured anywhere -> configuration error
        const err: any = new Error("admin_key_not_configured");
        throw err;
    }
    const auth = headers.get("authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!verifyToken(token)) {
        throw new Error("unauthorized");
    }
}

/* ---- Handlers ---- */

export async function HEAD(req: Request) {
    try {
        assertAuth(new Headers(req.headers));
        return new NextResponse(null, { status: 204, headers: { "Cache-Control": "no-store" } });
    } catch (e: any) {
        const status = e?.message === "admin_key_not_configured" ? 500 : 401;
        return NextResponse.json({ error: e?.message ?? "Unauthorized" }, { status });
    }
}

export async function GET(req: Request) {
    try {
        assertAuth(new Headers(req.headers));
        return new NextResponse(null, { status: 204, headers: { "Cache-Control": "no-store" } });
    } catch (e: any) {
        const status = e?.message === "admin_key_not_configured" ? 500 : 401;
        return NextResponse.json({ error: e?.message ?? "Unauthorized" }, { status });
    }
}