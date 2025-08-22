// src/app/api/health/route.ts
export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
    try {
        await db.$queryRawUnsafe("SELECT 1");
        await db.interest.findFirst().catch(() => null);
        return NextResponse.json({ status: "ok" }, { status: 200 });
    } catch (e: any) {
        console.error("[health] fail:", e?.message || e);
        return NextResponse.json({ status: "fail", error: e?.message || "unknown" }, { status: 500 });
    }
}
