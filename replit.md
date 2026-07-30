# RestaurantPOS

A full-stack Restaurant Point-of-Sale system built with React, Express, and MongoDB.

## Stack

- **Frontend**: React 18 + TypeScript, Vite, Tailwind CSS, shadcn/ui components
- **Backend**: Express.js (TypeScript, ESM)
- **Database**: MongoDB (via `MONGODB_URI` secret — connects to a database named `POS` on the cluster)
- **Auth**: Passport.js (local strategy) + express-session

## How to run

1. Ensure both secrets are set (see **Required secrets** below).
2. The **Start application** workflow runs `npm run dev` automatically and serves the app on port 5000.
3. Open the preview and log in with the demo credentials below.

Demo login: **admin / admin123**

## Required secrets

| Secret | Description |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string (e.g. `mongodb+srv://user:pass@cluster.mongodb.net/`) |
| `SESSION_SECRET` | Express session secret — any long random string |

Both secrets must be set before starting the app. The server will throw on startup if `MONGODB_URI` is missing.

## Verifying startup

A healthy start produces these log lines (visible in the workflow console):

```
5:xx:xx AM [express] serving on port 5000
✅ Connected to MongoDB database: POS
✅ [ExternalOrders] Connected to "Orders" database (via MONGODB_URI (shared cluster))
✅ Digital menu sync service started (polling every 5s)
```

If you see `❌ MongoDB connection error`, check that `MONGODB_URI` is correctly set and the Atlas cluster allows connections from any IP (0.0.0.0/0).

## Key features

- Table management (multi-floor layout)
- Kitchen Display System (KDS)
- Billing & invoicing (PDF export)
- Digital menu integration — syncs customer orders from a separate digital menu app via a shared MongoDB collection (`digital_menu_customer_orders`) every 5 seconds
- External orders sync from an "Orders" database on the same MongoDB cluster
- QZ Tray printer support

## Project structure

- `client/` — React frontend (Vite)
- `server/` — Express backend
  - `index.ts` — app entry point
  - `routes.ts` — API routes
  - `mongodb.ts` / `mongodbService.ts` — MongoDB connection (database name hardcoded to `POS`)
  - `digital-menu-sync.ts` — digital menu order sync (polls every 5s)
  - `external-orders-sync.ts` — external orders sync (polls every 1s)
  - `auth.ts` / `auth-middleware.ts` — Passport local auth + session handling
  - `seed.ts` — seeds initial admin user and menu data on first run
- `shared/` — shared TypeScript schemas (Zod)

## User preferences

- Keep existing project structure and stack
