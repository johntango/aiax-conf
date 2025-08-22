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

function computeBaseUrl(): string {
  // Prefer explicit configuration in production
  const explicit = process.env.APP_BASE_URL?.trim();
  if (process.env.NODE_ENV === "production") {
    if (!explicit) {
      throw new Error("APP_BASE_URL must be set in production");
    }
    return explicit.replace(/\/+$/, ""); // strip trailing slash
  }

  // In dev, derive from forwarded headers or fallback to localhost
  const hdrs = headers();
  const proto = hdrs.get("x-forwarded-proto") ?? "http";
  const host = hdrs.get("x-forwarded-host") ?? hdrs.get("host") ?? "localhost:3000";
  return `${proto}://${host}`.replace(/\/+$/, "");
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = attendeeSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    const { name, email, affiliation } = parsed.data;

    const baseUrl = computeBaseUrl();
    console.log("Creating Checkout Session with baseUrl:", baseUrl);

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Server misconfigured: STRIPE_SECRET_KEY missing" }, { status: 500 });
    }

    const priceId = process.env.STRIPE_PRICE_ID || undefined;
    const currency = process.env.STRIPE_CURRENCY || "usd";
    const unit = Number(process.env.STRIPE_UNIT_AMOUNT ?? 50000);
    if (!Number.isFinite(unit) || unit <= 0) {
      return NextResponse.json({ error: "Server misconfigured: STRIPE_UNIT_AMOUNT invalid" }, { status: 500 });
    }

    const attendee = await repos.attendees.create({ name, email, affiliation });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      // Include session_id for debugging if you want
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
