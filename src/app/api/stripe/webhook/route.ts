import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createRepositories } from "@/lib/repositories";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !whSecret) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  const rawBody = await req.text();
  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, whSecret);
  } catch (err: any) {
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const repos = createRepositories(db);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
    const attendeeId = session.metadata?.attendeeId as string | undefined;
    const paymentIntentId = session.payment_intent as string | undefined;
    if (attendeeId) await repos.attendees.markPaid(attendeeId, paymentIntentId || null);
  }

  return NextResponse.json({ received: true });
}
