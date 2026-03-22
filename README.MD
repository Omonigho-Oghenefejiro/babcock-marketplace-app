
# 🛒 Babcock Campus Marketplace

A full-stack marketplace platform built for Babcock University students and staff to buy/sell products safely within a campus-focused ecosystem.

This repository contains:
- A React + TypeScript frontend (Vite)
- A Node.js + Express backend
- MongoDB data layer (Mongoose)
- Payment flow integration (Paystack + simulation fallback)
- In-app messaging and AI assistant features

---

## Table of Contents

1. [Core Capabilities](#core-capabilities)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Prerequisites](#prerequisites)
5. [Environment Variables](#environment-variables)
6. [Install & Run](#install--run)
7. [Scripts Reference](#scripts-reference)
8. [Testing (Vitest)](#testing-vitest)
9. [Feature Behavior Notes](#feature-behavior-notes)
10. [API Route Groups](#api-route-groups)
11. [Troubleshooting](#troubleshooting)
12. [Deployment Notes](#deployment-notes)
13. [License](#license)

---

## Core Capabilities

### User & Auth
- Registration/login with token-based auth and refresh-token support
- User dashboard and profile update flows

### Marketplace
- Product listing by students/sellers
- Product moderation support (admin)
- Stock-aware cart and checkout safeguards

### Orders & Purchases
- Order creation with payment confirmation handling
- Purchased Items page for buyers
- Automatic quantity deduction after successful purchase

### Reviews & Ratings
- Ratings shown on product pages
- Only users who purchased a product can review it
- Sellers cannot review their own listings
- Buyers can still view all reviews even when review form is hidden

### Messaging
- Buyer/seller conversation threads
- Auto-refreshing messages (adaptive polling)
- Read-state updates by conversation

### AI Assistant
- In-app assistant powered by Gemini (`gemini-1.5-flash`)
- Route-aware floating position to avoid overlapping chat send controls

---

## Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- Framer Motion
- Tailwind CSS
- Lucide icons

### Backend
- Node.js
- Express
- Mongoose
- JSON Web Tokens
- Nodemailer

### Testing
- Vitest
- V8 coverage provider (`@vitest/coverage-v8`)

---

## Project Structure

```text
.
├─ components/         # Shared UI and feature components
├─ contexts/           # Global state providers (store, toast)
├─ lib/                # Utility and testable domain helpers
├─ pages/              # Route-level pages
├─ services/           # API client + AI service wrappers
├─ scripts/            # Root orchestration scripts (dev startup)
├─ server/
│  ├─ middleware/
│  ├─ models/
│  ├─ routes/
│  ├─ scripts/
│  └─ utils/
└─ README.MD
```

---

## Prerequisites

- Node.js 18+ (Node 20+ recommended)
- npm 9+
- MongoDB instance (local or Atlas)
- Paystack secret key (for live payment verify/initialize)

Optional:
- SMTP credentials for email notifications
- Gemini API key for AI assistant responses

---

## Environment Variables

This project uses both root and backend environment variables.

### Root `.env` (frontend + startup orchestration)

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_GEMINI_API_KEY=your_gemini_api_key
```

Notes:
- `VITE_API_BASE_URL` is used by the frontend API client and the dev startup health-check script.
- If `VITE_GEMINI_API_KEY` is not set, the assistant UI still opens but will show key-missing behavior.

### `server/.env` (backend)

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PAYSTACK_SECRET_KEY=your_paystack_secret

# Optional / recommended
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
REFRESH_TOKEN_EXPIRES_DAYS=30
MAX_REFRESH_TOKENS_PER_USER=5
NODE_ENV=development
LOG_HTTP=true

# Optional SMTP for emails
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
SMTP_FROM=no-reply@babcock-marketplace.local
```

---

## Install & Run

### 1) Clone

```bash
git clone https://github.com/Omonigho-Oghenefejiro/babcock-marketplace-app.git
cd babcock-marketplace-app
```

### 2) Install dependencies (root + server)

```bash
npm run install-all
```

### 3) Start development environment

```bash
npm run dev
```

What this does:
- Checks whether backend is already healthy
- Starts backend if needed (`server`)
- Starts frontend Vite dev server

Frontend runs at `http://localhost:3000` by default.

---

## Scripts Reference

### Root scripts

- `npm run dev` → orchestrated startup (backend health check + frontend)
- `npm run frontend:dev` → frontend only
- `npm run server:dev` → backend only (via `cd server && npm run dev`)
- `npm run start:all` → alias to `npm run dev`
- `npm run build` → TypeScript build + Vite production build
- `npm run preview` → preview production frontend build
- `npm run test` → run Vitest once
- `npm run test:watch` → run Vitest in watch mode
- `npm run seed` → run backend seeding script

### Server scripts

- `npm run dev` (inside `server/`) → nodemon backend
- `npm run start` (inside `server/`) → node backend
- `npm run data:import` (inside `server/`) → seed/import data

---

## Testing (Vitest)

### Run tests

```bash
npm test
```

### Watch mode

```bash
npm run test:watch
```

### Coverage

```bash
npx vitest run --coverage
```

Current test setup focuses on core helper logic in `lib/` and is intended to be expanded with component/API tests over time.

---

## Feature Behavior Notes

### Checkout & Stock
- Checkout blocks when cart contains out-of-stock or over-limit quantities.
- Product quantity is reduced when purchase is confirmed successfully.

### Purchased Items & Reviews
- Buyers can see purchased items and submit ratings there.
- Ratings appear on product pages when products remain live.
- Review eligibility is restricted:
	- Must have purchased item
	- Cannot be listing owner

### Messaging UX
- Messages refresh automatically without manual browser refresh.
- Polling is adaptive (faster during active chat, slower otherwise, paused when tab hidden).

---

## API Route Groups

Mounted in backend under `/api`:

- `/users` and `/auth` (auth alias for frontend compatibility)
- `/products`
- `/cart`
- `/messages`
- `/orders`
- `/payments`
- `/admin`
- `/support`
- `/health` (service health endpoint)

---

## Troubleshooting

### `EADDRINUSE: address already in use :::5000`
- Cause: another process is already using backend port.
- Current setup avoids duplicate backend launch in `start:all`, but if it occurs:
	- stop existing backend process, or
	- change `PORT` in `server/.env` and update `VITE_API_BASE_URL` accordingly.

### Frontend cannot reach backend
- Verify backend is running and healthy at `http://localhost:5000/api/health`.
- Ensure `VITE_API_BASE_URL` points to correct backend URL.
- Check `CORS_ALLOWED_ORIGINS` includes frontend origin.

### Payment verification fails
- Ensure `PAYSTACK_SECRET_KEY` is set correctly in `server/.env`.
- Confirm callback/verification reference is valid.

### AI assistant returns key errors
- Add `VITE_GEMINI_API_KEY` to root `.env`.

### Tests pass but coverage appears low
- Coverage includes many untested files by default.
- Expand tests gradually for `pages/`, `components/`, `server/routes/`.

---

## Deployment Notes

- Build frontend with `npm run build`.
- Deploy backend with required `server/.env` variables.
- Serve frontend static output from `dist/` using your preferred host.
- Configure CORS allowlist for production domains.

---

## License

ISC
