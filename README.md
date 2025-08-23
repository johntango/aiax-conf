# AI & AX Design Conference Web App 
Working with Stripe Test and Prisma Studio for viewing DB

If you need a CNAME configured for your domain, you are welcome to set an ALIAS for @ instead of the current CNAME record. Please change the CNAME record to ALIAS.
- Having logged into the Namecheap account, go to your Domain List -> click "Manage" next to the bathparade.com domain -> the "Advanced DNS" tab -> the "Host Records" section.

- Then click on your CNAME record with the host name "@"and change it to following :

Type: ALIAS Record | Host: @ | Value:scji18iq.up.railway.app. | TTL: 1/5 minutes

Use prisma studio to view data
npx prisma studio

Here’s your **updated `README.md`** with example **Stripe configuration values** for both **Codespaces** (development) and **Railway** (production):

---

# **AI and AX Design Conference Website**

> Conference Management Website for the **AI and AX Design Conference**, sponsored by the **International Conference on Axiomatic Design** (June 24–25, 2025).

---

## **Table of Contents**

* [Overview](#overview)
* [Tech Stack](#tech-stack)
* [Project Layout](#project-layout)
* [Getting Started](#getting-started)
* [Environment Variables](#environment-variables)
* [Development](#development)
* [Deployment on Railway](#deployment-on-railway)
* [Database Management](#database-management)
* [Backup Strategy](#backup-strategy)
* [License](#license)

---

## **Overview**

This project provides a responsive, full-stack website for managing conference activities, including:

* User registration (interest & paid)
* Secure payment processing via **Stripe**
* Admin capabilities for data management and exports
* Deployed for **100+ concurrent users**

---

## **Tech Stack**

* **Frontend**: [Next.js 14](https://nextjs.org/) with [React 18](https://react.dev/)
* **Database**: [SQLite3](https://www.sqlite.org/index.html) with [Prisma ORM](https://www.prisma.io/)
* **Styling**: [Bootstrap 5](https://getbootstrap.com/)
* **Hosting**: [Railway](https://railway.app/)
* **Payments**: [Stripe](https://stripe.com/)

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

* Codespaces URLs look like `https://<port>-<codespace-id>.githubpreview.dev`.
  Use that full URL as `APP_BASE_URL` in `.env.local`.
* On Railway, this should be your production domain such as `https://icadai.design`.

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

   * Volume path: `/data`
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

Would you like me to also include a step-by-step guide for setting up **Stripe webhook testing in Codespaces**?
