import { NextRequest, NextResponse } from "next/server";
import { createValidators } from "@/lib/validations";
import { db } from "@/lib/db";
import { createRepositories } from "@/lib/repositories";
import { stripe } from "@/lib/stripe";

const { attendeeSchema } = createValidators();
const repos = createRepositories(db);

export async function POST(req: NextRequest) {
  const json = await req.json();
  const parsed = attendeeSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { name, email, affiliation } = parsed.data;

  // create attendee as PENDING
  const attendee = await repos.attendees.create({ name, email, affiliation });

  const baseUrl = process.env.APP_BASE_URL || "http://localhost:3000";
  const priceId = process.env.STRIPE_PRICE_ID;
  const currency = process.env.STRIPE_CURRENCY || "usd";
  const amount = Number(process.env.STRIPE_UNIT_AMOUNT || 50000);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${baseUrl}/success`,
    cancel_url: `${baseUrl}/cancel`,
    line_items: priceId ? [{ price: priceId, quantity: 1 }] : [{
      quantity: 1,
      price_data: {
        currency,
        unit_amount: amount,
        product_data: { name: "AI & AX Design Conference Registration" }
      }
    }],
    metadata: { attendeeId: attendee.id, email }
  });

  await repos.attendees.linkCheckout(attendee.id, session.id);

  return NextResponse.json({ url: session.url });
}
