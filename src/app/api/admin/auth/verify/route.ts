// src/app/api/admin/auth/verify/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";
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

export async function GET(req: Request) {
    try {
        assertAuth(new Headers(req.headers));
        return new NextResponse(null, { status: 204, headers: { "Cache-Control": "no-store" } });
    } catch {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}
