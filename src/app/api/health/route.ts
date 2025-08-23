// src/app/api/health/route.ts
// No Prisma import here on purpose.
import { NextResponse } from "next/server";

// This endpoint is safe for platform health checks.
export async function GET() {
    return NextResponse.json({ status: "ok" }, { status: 200 });
}