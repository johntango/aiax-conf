# AI & AX Design Conference Web App

Working with Stripe Test and Prisma Studio for viewing DB

If you need a CNAME configured for your domain, you are welcome to set an ALIAS for @ instead of the current CNAME record. Please change the CNAME record to ALIAS.

- Having logged into the Namecheap account, go to your Domain List -> click "Manage" next to the bathparade.com domain -> the "Advanced DNS" tab -> the "Host Records" section.

- Then click on your CNAME record with the host name "@"and change it to following :

Type: ALIAS Record | Host: @ | Value:scji18iq.up.railway.app. | TTL: 1/5 minutes

Use prisma studio to view data. make sure prisma and @Client.prisma are same version No.s

DATABASE_URL="file:./sqlite01.db" npx prisma studio

Here’s your **updated `README.md`** with example **Stripe configuration values** for both **Codespaces** (development) and **Railway** (production):

---

# **AI and AX Design Conference Website**

> Conference Management Website for the **AI and AX Design Conference**, sponsored by the **International Conference on Axiomatic Design** (June 24–25, 2025).

---

## **Table of Contents**

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Layout](#project-layout)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Development](#development)
- [Deployment on Railway](#deployment-on-railway)
- [Database Management](#database-management)
- [Backup Strategy](#backup-strategy)
- [License](#license)

---

## **Overview**

This project provides a responsive, full-stack website for managing conference activities, including:

- User registration (interest & paid)
- Secure payment processing via **Stripe**
- Admin capabilities for data management and exports
- Deployed for **100+ concurrent users**

---

## **Tech Stack**

- **Frontend**: [Next.js 14](https://nextjs.org/) with [React 18](https://react.dev/)
- **Database**: [SQLite3](https://www.sqlite.org/index.html) with [Prisma ORM](https://www.prisma.io/)
- **Styling**: [Bootstrap 5](https://getbootstrap.com/)
- **Hosting**: [Railway](https://railway.app/)
- **Payments**: [Stripe](https://stripe.com/)

---

## **Project Layout**

```
project-root/
├── prisma/                 # Prisma schema and migration files
├── public/                 # Static assets (images, splash, footer)
├── src/
│   ├── app/                # Application routes (Next.js App Router)
│   │   ├── (public)/       # Public routes (landing, register-interest)
│   │   ├── api/            # API routes
│   │   │   ├── interest/   # Interest registration endpoint
│   │   │   ├── register/   # Paid registration + Stripe checkout
│   │   │   ├── health/     # Health check
│   │   │   └── admin/      # Admin export and backup endpoints
│   └── lib/                # Shared libraries and helpers
│       ├── db.ts           # Prisma client instance
│       ├── repositories.ts # Data access logic
│       ├── validations.ts  # Input validation
│       └── csv.ts          # CSV export helpers
├── .env.local              # Local environment variables (not committed)
├── next.config.mjs         # Next.js configuration
├── tsconfig.json           # TypeScript configuration with @/ alias
├── package.json
└── README.md
```

---

## **Getting Started**

### **Clone the Repository**

```bash
git clone https://github.com/YOUR_ORG/ai-ax-conf.git
cd ai-ax-conf
```

### **Install Dependencies**

```bash
npm install
```

### **Configure Environment Variables**

Copy example file:

```bash
cp .env.example .env.local
```

---

## **Environment Variables**

| Variable                 | Description                                    | Codespaces Example                         | Railway Example         |
| ------------------------ | ---------------------------------------------- | ------------------------------------------ | ----------------------- |
| `DATABASE_URL`           | Path to SQLite DB                              | `file:./dev.db`                            | `file:/data/sqlite.db`  |
| `STRIPE_SECRET_KEY`      | Stripe secret key                              | `sk_test_51NCJXhE3xXX...`                  | `sk_live_51Pax...`      |
| `STRIPE_PUBLISHABLE_KEY` | Stripe public key                              | `pk_test_51NCJXhE3xXX...`                  | `pk_live_51Pax...`      |
| `STRIPE_WEBHOOK_SECRET`  | Webhook secret for local dev or hosted testing | `whsec_abc123...`                          | `whsec_prod123...`      |
| `APP_BASE_URL`           | Base URL for building links and redirects      | `https://YOUR-USER-NAME.githubpreview.dev` | `https://icadai.design` |
| `ADMIN_EXPORT_KEY`       | Secure admin key for backups and exports       | `devkey123`                                | `prodkey123`            |

**Important:**

- Codespaces URLs look like `https://<port>-<codespace-id>.githubpreview.dev`.
  Use that full URL as `APP_BASE_URL` in `.env.local`.
- On Railway, this should be your production domain such as `https://icadai.design`.

---

## **Development**

### **Run Locally**

```bash
npm run dev
```

Visit the development URL output in the terminal, typically:

```
http://localhost:3000
```

---

## **Deployment on Railway**

1. **Connect GitHub Repository** to your Railway project.
2. **Set environment variables** in the Railway Dashboard (use production keys).
3. **Enable a persistent volume** for SQLite:

   - Volume path: `/data`

4. **Deploy**

   ```bash
   npm run build
   npm start
   ```

5. Check logs in Railway Dashboard for errors:

   ```
   railway logs
   ```

---

## **Database Management**

### **Run Migrations**

```bash
npx prisma migrate dev --name init
```

### **View Prisma Studio**

```bash
npx prisma studio
```

---

## **Backup Strategy**

### **Option A: CSV Export**

Secure endpoint:

```
https://YOUR_DOMAIN/api/admin/export?key=ADMIN_EXPORT_KEY
```

Downloads a CSV of `interest` and `attendee` records.

---

### **Option B: Full SQLite Snapshot**

Secure endpoint:

```
https://YOUR_DOMAIN/api/admin/backup/sqlite?key=ADMIN_EXPORT_KEY
```

Streams a complete copy of `/data/sqlite.db`.

---

### **GitHub Action for Automated Backups**

Add `.github/workflows/backup.yml`:

```yaml
name: Nightly Backup
on:
  schedule:
    - cron: "0 3 * * *"
jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Download SQLite snapshot
        env:
          ADMIN_EXPORT_KEY: ${{ secrets.ADMIN_EXPORT_KEY }}
          APP_BASE_URL: ${{ secrets.APP_BASE_URL }}
        run: |
          mkdir -p backups/sqlite
          ts=$(date -u +"%Y%m%d")
          curl -fSL "$APP_BASE_URL/api/admin/backup/sqlite?key=$ADMIN_EXPORT_KEY" \
            -o "backups/sqlite/sqlite-$ts.db"
      - name: Commit & push backup
        run: |
          git config user.name "gh-actions"
          git config user.email "actions@github.com"
          git add backups/sqlite/
          git commit -m "Backup $(date -u +"%F %T UTC")" || echo "No changes"
          git push
```

> **Tip:** Keep your repo private or use Git LFS for large `.db` files.

---

## **License**

Proprietary — for internal use by the **AI and AX Design Conference** organizing team.

---

Awesome—here’s a tight, copy-pasteable guide to test **Stripe webhooks in GitHub Codespaces** with your Next.js (App Router) app.

---

# Stripe webhook testing in Codespaces

## 0) Prereqs (once)

- Make sure your webhook route exists at: `src/app/api/stripe/webhook/route.ts` and runs on **Node** runtime.
- Your Codespace dev server is running on **port 3000** and **publicly accessible** (Ports tab → 3000 → Visibility = Public).
- `APP_BASE_URL` in your `.env.local` (or Codespaces secrets) is your **public Codespaces URL** (e.g., `https://3000-<id>-<org>.githubpreview.dev`).

---

## 1) Install & auth Stripe CLI (in Codespaces terminal)

```bash
# One-time install
curl -fsSL https://stripe.dev/install.sh | bash

# Login (opens a device flow link)
stripe login
```

---

## 2) Start a live listener that forwards to your webhook route

Replace `<YOUR-CODESPACES-URL>` with your actual public URL.

```bash
stripe listen --forward-to https://3000-<id>-<org>.githubpreview.dev/api/stripe/webhook
```

You’ll see output like:

```
Ready! Your webhook signing secret is whsec_12345...
```

**Copy the `whsec_...` value**—that’s your **`STRIPE_WEBHOOK_SECRET`**.

---

## 3) Set env vars in Codespaces

Either set **Codespaces Secrets** or use `.env.local` while developing:

**.env.local**

```env
STRIPE_SECRET_KEY=sk_test_...              # from Stripe Dashboard
STRIPE_PUBLISHABLE_KEY=pk_test_...         # optional if you use it on client
STRIPE_WEBHOOK_SECRET=whsec_...            # from `stripe listen` output
APP_BASE_URL=https://3000-<id>-<org>.githubpreview.dev
STRIPE_CURRENCY=usd
STRIPE_UNIT_AMOUNT=50000                   # $500 in cents
ADMIN_EXPORT_KEY=devkey123
DATABASE_URL=file:./dev.db
```

Restart dev server after editing env:

```bash
npm run dev
```

---

## 4) Webhook route (reference implementation)

Make sure your route verifies the signature using the **raw body**. This version is safe for Next 14 App Router.

`src/app/api/stripe/webhook/route.ts`

```ts
export const runtime = "nodejs"; // Stripe SDK requires Node
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { createRepositories } from "@/lib/repositories";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Missing signature or secret" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;
  try {
    // IMPORTANT: use raw text, not JSON
    const raw = await req.text();
    event = stripe.webhooks.constructEvent(
      raw,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    console.error("[webhook] signature verify failed:", err?.message || err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    const repos = createRepositories(db);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const sessionId = session.id;
        const paymentIntentId =
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id ?? null;
        // mark attendee as PAID by session id (your repo function)
        await repos.attendees.markPaidBySession(sessionId, paymentIntentId);
        break;
      }
      // Add more events if needed (payment_intent.succeeded, etc.)
      default:
        // no-op
        break;
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err: any) {
    console.error("[webhook] handler error:", err?.message || err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
```

> Notes
> • `req.text()` is required so Stripe signature validation works.
> • `export const runtime = "nodejs";` is mandatory—Stripe SDK won’t run on Edge.
> • Your repo helpers like `repos.attendees.markPaidBySession` should already exist.

---

## 5) Trigger test events from Stripe CLI

With your listener running, open a **second** terminal and send some test events:

```bash
# Simulate a successful checkout flow
stripe trigger checkout.session.completed
```

You should see the event hit your server in the listener terminal and your app logs show the webhook handled.

You can also open **Stripe Dashboard → Developers → Events** to confirm the webhook delivery and your 2xx response.

---

## 6) Test a full end-to-end checkout (optional)

- In your UI, click “Proceed to Payment”.
- Pay with a test card (e.g., `4242 4242 4242 4242`, any future expiry, any CVC).
- After redirect back to your **Codespaces** success page, your CLI will forward the webhook to `/api/stripe/webhook`.
- Confirm your DB status flips to `PAID`.

---

## 7) Common gotchas & fixes

- **Wrong APP_BASE_URL** → Redirects to `localhost`. Fix `APP_BASE_URL` to your public Codespaces URL.
- **Missing STRIPE_WEBHOOK_SECRET** → Signature validation fails (400). Use the secret printed by `stripe listen`.
- **Port not public** → CLI can still deliver to your URL, but your browser might not reach the app. Set port 3000 to **Public**.
- **Edge runtime crash** → Ensure `export const runtime = "nodejs";` at top of webhook & any Prisma/Stripe routes.
- **Database errors** → If using SQLite in dev (`file:./dev.db`), it lives in your workspace. Run `npx prisma migrate dev` once.

---

## 8) Production (Railway) webhook setup

- Set a live (or test) webhook endpoint in the Stripe Dashboard pointing to:

  ```
  https://icadai.design/api/stripe/webhook
  ```

- Stripe will give you a **production** `whsec_...` secret. Put it in **Railway → Variables** as `STRIPE_WEBHOOK_SECRET`.
- Keep `runtime="nodejs"` in the production webhook route too.

---

That’s it—this setup mirrors real Stripe behavior in Codespaces and guarantees your webhook verification is correct before you push to Railway. If you want, I can add a short **admin /webhook-test** page that displays the last event received to make manual verification trivial.
Checkpoint WorkingRev001-Restore Point
