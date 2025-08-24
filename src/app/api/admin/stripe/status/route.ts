import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function assertAuth(headers: Headers) {
    const auth = headers.get("authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token || token !== process.env.ADMIN_EXPORT_KEY) {
        throw new Error("unauthorized");
    }
}

export async function GET(req: Request) {
    try {
        assertAuth(new Headers(req.headers));
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
