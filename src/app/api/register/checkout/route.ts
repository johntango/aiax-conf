// src/app/api/register/checkout/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { createValidators } from "@/lib/validations";
import { db } from "@/lib/db";
import { createRepositories } from "@/lib/repositories";
import { stripe } from "@/lib/stripe";

const { attendeeSchema } = createValidators();
const repos = createRepositories(db);

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = attendeeSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    const { name, email, affiliation } = parsed.data;

    // derive base URL from headers if APP_BASE_URL not set
    const hdrs = headers();
    const proto = hdrs.get("x-forwarded-proto") ?? "https";
    const host = hdrs.get("x-forwarded-host") ?? hdrs.get("host");
    const derived = host ? `${proto}://${host}` : undefined;
    const baseUrl = process.env.APP_BASE_URL || derived || "http://localhost:3000";

    // validate env
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("Missing STRIPE_SECRET_KEY");
      return NextResponse.json({ error: "Server misconfigured (stripe key)" }, { status: 500 });
    }
    const priceId = process.env.STRIPE_PRICE_ID || undefined;
    const currency = process.env.STRIPE_CURRENCY || "usd";
    const unit = Number(process.env.STRIPE_UNIT_AMOUNT ?? 50000);
    if (!Number.isFinite(unit) || unit <= 0) {
      console.error("Invalid STRIPE_UNIT_AMOUNT:", process.env.STRIPE_UNIT_AMOUNT);
      return NextResponse.json({ error: "Server misconfigured (amount)" }, { status: 500 });
    }

    // create attendee (PENDING) and session
    const attendee = await repos.attendees.create({ name, email, affiliation });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cancel`,
      line_items: priceId
        ? [{ price: priceId, quantity: 1 }]
        : [{
          quantity: 1,
          price_data: {
            currency,
            unit_amount: unit,
            product_data: { name: "AI & AX Design Conference Registration" }
          }
        }],
      metadata: { attendeeId: attendee.id, email }
    });

    await repos.attendees.linkCheckout(attendee.id, session.id);
    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (err: any) {
    console.error("POST /api/register/checkout failed:", err?.message || err);
    return NextResponse.json({ error: String(err?.message || "Unexpected server error") }, { status: 500 });
  }
}
