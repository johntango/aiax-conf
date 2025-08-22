# AI & AX Design Conference Web App
f you need a CNAME configured for your domain, you are welcome to set an ALIAS for @ instead of the current CNAME record. Please change the CNAME record to ALIAS.
- Having logged into the Namecheap account, go to your Domain List -> click "Manage" next to the bathparade.com domain -> the "Advanced DNS" tab -> the "Host Records" section.

- Then click on your CNAME record with the host name "@"and change it to following :

Type: ALIAS Record | Host: @ | Value:scji18iq.up.railway.app. | TTL: 1/5 minutes

Use prisma studio to view data
npx prisma studio


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
