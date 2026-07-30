# RestaurantPOS

A full-stack Restaurant Point-of-Sale system built with React, Express, and MongoDB.

## Stack

- **Frontend**: React 18 + TypeScript, Vite, Tailwind CSS, shadcn/ui components
- **Backend**: Express.js (TypeScript, ESM)
- **Database**: MongoDB (via `MONGODB_URI` secret)
- **Auth**: Passport.js (local strategy) + express-session

## How to run

The app starts automatically via the **Start application** workflow (`npm run dev`), which serves both the API and the React frontend on port 5000.

Demo login: **admin / admin123**

## Required secrets

| Secret | Description |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `SESSION_SECRET` | Express session secret (already set) |

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
  - `mongodb.ts` / `mongodbService.ts` — MongoDB connection
  - `digital-menu-sync.ts` — digital menu order sync
  - `external-orders-sync.ts` — external orders sync
- `shared/` — shared TypeScript schemas (Zod)

## User preferences

- Keep existing project structure and stack
