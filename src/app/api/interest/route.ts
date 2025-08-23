export const runtime = "nodejs"; // Prisma requires Node runtime

import { NextRequest, NextResponse } from "next/server";
import { createValidators } from "@/lib/validations";
import { createRepositories } from "@/lib/repositories";
import { db } from "@/lib/db";

const { interestSchema } = createValidators();

export async function POST(req: NextRequest) {
  try {
    // Tolerate empty/invalid JSON
    const body = await req.json().catch(() => ({}));
    const parsed = interestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    const { name, email, affiliation, notes } = parsed.data;

    const repos = createRepositories(db);
    await repos.interest.create({ name, email, affiliation, notes });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: any) {
    console.error("[interest] POST failed:", err?.message || err);
    return NextResponse.json({ error: "Server error while recording interest" }, { status: 500 });
  }
}
