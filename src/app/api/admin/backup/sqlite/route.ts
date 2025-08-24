import { NextResponse } from "next/server";
import { createReadStream, statSync } from "fs";
import { Readable } from "stream";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorized(h: Headers) {
    const auth = h.get("authorization") || "";
    return auth.startsWith("Bearer ") && auth.slice(7) === process.env.ADMIN_EXPORT_KEY;
}

export async function HEAD(req: Request) {
    if (!authorized(new Headers(req.headers))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return new NextResponse(null, { status: 204 });
}

export async function GET(req: Request) {
    if (!authorized(new Headers(req.headers))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const path = process.env.DATABASE_URL?.replace("file:", "") || "/data/sqlite.db";
    const size = statSync(path).size;
    const stream = createReadStream(path);
    return new NextResponse(Readable.toWeb(stream) as any, {
        headers: {
            "Content-Type": "application/octet-stream",
            "Content-Length": String(size),
            "Content-Disposition": `attachment; filename="sqlite-${new Date().toISOString().slice(0, 10)}.db"`,
        },
    });
}
