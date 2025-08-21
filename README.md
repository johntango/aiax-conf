# AI & AX Design Conference Web App

Next.js 14 + Prisma (SQLite) + Stripe Checkout.
Two flows: Register Interest and Paid Registration ($500).

## Local Dev

```bash
npm i
cp .env.example .env.local
npx prisma migrate dev --name init
npm run dev
```

Visit http://localhost:3000

## Railway (SQLite via volume)

- Mount volume at `/data`
- Set `DATABASE_URL=file:/data/sqlite.db`
- Set `APP_BASE_URL=https://<your-railway-domain>`
- Set Stripe secrets and `ADMIN_EXPORT_KEY`
- Build: `npm run build` (runs migrations)
- Start: `npm run start`
