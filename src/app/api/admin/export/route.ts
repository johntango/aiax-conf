import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createRepositories } from "@/lib/repositories";
import { toCSV } from "@/lib/csv";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const key = url.searchParams.get("key");
  if (!key || key !== process.env.ADMIN_EXPORT_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const repos = createRepositories(db);
  const [interests, attendees] = await Promise.all([
    repos.interest.listAll(),
    repos.attendees.listAll()
  ]);
  const csv = [
    "# Interests",
    toCSV(interests),
    "\n# Attendees",
    toCSV(attendees)
  ].join("\n");
  return new NextResponse(csv, {
    status: 200,
    headers: { "Content-Type": "text/csv; charset=utf-8" }
  });
}
