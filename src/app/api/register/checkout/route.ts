// src/app/api/register/checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

function baseUrlFrom(h: Headers): string {
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host  = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  return `${proto}://${host}`.replace(/\/+$/, "");
}

function getBaseUrl(req: NextRequest): string {
  const env = process.env.APP_BASE_URL?.replace(/\/+$/, "");
  return env || baseUrlFrom(req.headers);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const base = getBaseUrl(req);

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: body.email,
    line_items: [
      {
        price_data: {
          currency: body.currency ?? "usd",
          unit_amount: body.amountCents,
          product_data: { name: `AI & AX 2025 – ${body.ticketType}` },
        },
        quantity: 1,
      },
    ],
    success_url: `${base}/register/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/register/cancelled`,
    metadata: { email: body.email, ticketType: body.ticketType },
  });

  return NextResponse.json({ url: session.url });
}
