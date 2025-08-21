import { NextRequest, NextResponse } from "next/server";
import { createValidators } from "@/lib/validations";
import { createRepositories } from "@/lib/repositories";
import { db } from "@/lib/db";

const { interestSchema } = createValidators();
const repos = createRepositories(db);

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = interestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { name, email, affiliation, notes } = parsed.data;
  await repos.interest.create({ name, email, affiliation, notes });
  return NextResponse.json({ ok: true });
}
