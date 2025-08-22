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
    if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    const { name, email, affiliation } = parsed.data;

    // Derive baseUrl robustly
    const hdrs = headers();
    const proto = hdrs.get("x-forwarded-proto") ?? "http";
    const host = hdrs.get("x-forwarded-host") ?? hdrs.get("host");
    const derived = host ? `${proto}://${host}` : undefined;
    const baseUrl = process.env.APP_BASE_URL || derived || "http://localhost:3000";

    // Validate Stripe env
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Server misconfigured: STRIPE_SECRET_KEY missing" }, { status: 500 });
    }

    const priceId = process.env.STRIPE_PRICE_ID || undefined;
    const currency = process.env.STRIPE_CURRENCY || "usd";
    const unit = Number(process.env.STRIPE_UNIT_AMOUNT ?? 50000);
    if (!Number.isFinite(unit) || unit <= 0) {
      return NextResponse.json({ error: "Server misconfigured: STRIPE_UNIT_AMOUNT invalid" }, { status: 500 });
    }

    // Create attendee as PENDING
    const attendee = await repos.attendees.create({ name, email, affiliation });

    // Success/cancel URLs now correct for Codespaces/Railway
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
    return NextResponse.json({ error: String(err?.message || "Unexpected server error") }, { status: 500 });
  }
}
