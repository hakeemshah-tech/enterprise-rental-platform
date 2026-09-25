# Enterprise Rental Platform

A production-grade vacation-rental system built as a **type-safe
Backend-for-Frontend (BFF)**: a Next.js 16 presentation layer talking to a
dedicated Node.js/Express API over a single, explicitly documented JSON
contract.

```
┌────────────────────────────┐        ┌────────────────────────────┐
│  client/  ·  Next.js 16    │        │  server/  ·  Express 4     │
│  React 19 · TypeScript 5   │        │  Node 20 · JavaScript      │
│                            │        │                            │
│  App Router                │  HTTPS │  /api/auth                 │
│  Server Components         │ ─────► │  /api/properties           │
│  generateMetadata / JSON-LD│  JSON  │  /api/bookings             │
│  sitemap.ts · robots.ts    │ ◄───── │  /api/enquiries            │
│                            │  Bearer│  /api/upload   (multipart) │
│  Client Components         │   JWT  │  /api/settings             │
│  AuthContext · useSettings │        │  /api/webhooks (raw body)  │
└────────────────────────────┘        └─────────────┬──────────────┘
         :3000                                      │ :5000
                                                    ▼
                                        ┌────────────────────────┐
                                        │ MongoDB   · Mongoose   │
                                        │ Disk      · /uploads   │
                                        │ Stripe    · payments   │
                                        │ Brevo     · email      │
                                        └────────────────────────┘
```

---

## 1. Architecture Overview

### Why two processes

The presentation layer and the domain API are deployed, scaled and reasoned
about separately:

- **The API is the product boundary.** Every consumer (this web client, the
  admin console inside it, and any future native app) sees the same REST
  surface with the same validation. No business rule lives in a React
  component.
- **The rendering layer is free to change.** Next.js owns routing, metadata,
  image optimisation and caching. Swapping rendering strategies per route
  requires no API change.
- **Independent failure and scale.** The Node service is stateful about uploads
  and MongoDB connections; the Next.js tier is stateless and edge-friendly.

### Rendering strategy per route

The App Router is used deliberately rather than uniformly. Anything a crawler
needs is rendered on the server; anything a signed-in user drives is a client
component.

| Route                       | Strategy                                    | Rationale                                                                                                                                                      |
| --------------------------- | ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                         | Server shell + client islands               | Hero and settings hydrate from `/api/settings`; the shell ships instantly                                                                                      |
| `/properties`               | Client-rendered (`'use client'`)            | Filter state lives in the URL and changes on every keystroke/slider                                                                                            |
| `/properties/[id]`          | **Server** `layout.tsx` + client `page.tsx` | `generateMetadata()` fetches the listing with `next: { revalidate: 60 }` - ISR for OG tags and canonical URLs; the interactive booking panel stays client-side |
| `/about`, `/contact`        | Static shell + CMS overrides                | Content is served from `GlobalSettings`, so copy changes need no rebuild                                                                                       |
| `/admin/**`                 | Client-rendered behind `ProtectedRoute`     | No SEO value; needs the JWT that only the browser holds                                                                                                        |
| `sitemap.xml`, `robots.txt` | Generated (`sitemap.ts`, `robots.ts`)       | The sitemap enumerates live listings from the API and degrades to static routes if the API is unreachable                                                      |

`app/layout.tsx` emits `Organization` JSON-LD and the full metadata graph
(`metadataBase`, OpenGraph, Twitter) from one frozen config object, so
structured data can never drift from what the footer renders.

### Repository layout

```
.
├── client/                     # Next.js 16 · TypeScript · Tailwind 4
│   ├── src/app/                #   App Router: routes, layouts, metadata
│   ├── src/components/         #   ui / forms / cards / layout / seo / admin
│   ├── src/context/            #   AuthContext: session state
│   ├── src/hooks/              #   useSettings: CMS-driven content
│   ├── src/lib/                #   api.ts (axios) · validations · companyConfig
│   └── src/types/index.ts      #   ◄ the client/server contract (SSOT)
├── server/                     # Express 4 · Mongoose 8 · Zod 3
│   ├── src/config/             #   db · stripe · email · defaults
│   ├── src/controllers/        #   one module per resource
│   ├── src/middleware/         #   auth (JWT + RBAC) · validate · errorHandler
│   ├── src/models/             #   Mongoose schemas: persisted shape
│   ├── src/routes/             #   thin routers, guards applied here
│   ├── src/validations/        #   Zod schemas: accepted shape
│   ├── test/                   #   node:test contract suite
│   └── uploads/                #   runtime asset store (git-ignored)
├── docs/ASSET_PIPELINE.md      # multipart upload deep-dive
└── .github/workflows/          # nextjs-api-pipeline.yml
```

---

## 2. Type Safety Across the Client/Server Boundary

The API is JavaScript; the client is strict TypeScript. The contract between
them is therefore **declared in one file and enforced at three checkpoints**.

### Where the contract is maintained

**[`client/src/types/index.ts`](client/src/types/index.ts)** is the single
source of truth for every shape that crosses the wire: `User`, `Property`,
`Booking`, `Enquiry`, `PaginationInfo`, and the envelope every controller
returns:

```ts
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: PaginationInfo;
  errors?: { field: string; message: string }[];
}
```

Its server counterparts (the files that must change in the same commit) are
listed in the header comment of that file:

| Contract   | Runtime validation (accepted)                   | Persistence (stored)            |
| ---------- | ----------------------------------------------- | ------------------------------- |
| `User`     | `server/src/validations/auth.validation.js`     | `server/src/models/User.js`     |
| `Property` | `server/src/validations/property.validation.js` | `server/src/models/Property.js` |
| `Booking`  | `server/src/validations/booking.validation.js`  | `server/src/models/Booking.js`  |
| `Enquiry`  | `server/src/validations/enquiry.validation.js`  | `server/src/models/Enquiry.js`  |

`client/src/lib/validations.ts` holds the browser-side Zod schemas that back
the react-hook-form resolvers. They mirror the server schemas so a user sees a
field error before a request is made; the server still re-validates, because
client-side validation is a UX feature, never a security control.

Two deliberate differences between the two schema sets are worth knowing before
touching either:

- **Shape.** Form schemas are _flat_ (`pricePerNight`, `address`, `city`) to
  match the DOM; API schemas are _nested_ (`price.perNight`,
  `location.city`). `PropertyForm` owns the mapping, which is also why the API
  accepts both a nested `capacity` object and flat `bedrooms`/`bathrooms`/
  `maxGuests` and normalises them in a Zod `.transform()`.
- **Zod major version.** The client is on Zod 4 (`{ error: … }`), the server on
  Zod 3 (`{ required_error: … }`). Aligning the versions is a prerequisite for
  the shared-contracts package described below, not an afterthought.

### The three checkpoints

1. **Inbound: `validate(schema)`.** A single generic middleware parses every
   mutating request body and **reassigns `req.body` to the parsed result**, so
   controllers receive defaulted and transformed data, never raw input:

   ```js
   req.body = schema.parse(req.body); // middleware/validate.js
   ```

   Failures short-circuit with `400` and a `{ field, message }[]` list whose
   dot-notation paths (`location.city`) bind directly to form inputs.

2. **Persistence: Mongoose schemas.** Types, enums and required fields are
   asserted a second time at the storage layer, with `runValidators: true` on
   updates.

3. **Outbound: TypeScript.** Every `api.*` call site is typed through
   `ApiResponse<T>`, and `npm run typecheck` (`tsc --noEmit`) runs in CI on
   every push. `client/tsconfig.json` enables `strict` plus
   `noImplicitOverride`, `noFallthroughCasesInSwitch` and
   `forceConsistentCasingInFileNames`.

### Honest limitation, and the migration path

This contract is **convention-enforced, not compiler-enforced**: nothing today
fails the build if a controller adds a field the interface omits. The
`server/test/api.contract.test.js` suite closes part of that gap by asserting
the exact accept/reject behaviour of every request schema.

The natural next step (in priority order) is to move the Zod schemas into a
shared `packages/contracts` workspace, derive the server's validation and the
client's types from the same definition with `z.infer<>`, and delete the
hand-maintained interfaces. The npm-workspace layout in this repository is
already shaped for that change.

---

## 3. Core Workflows

### 3.1 Authentication & session persistence

`AuthContext` (`client/src/context/AuthContext.tsx`) is the only component that
touches session storage.

```
POST /api/auth/login
  ├─ role = user   → 200 { token, user }          → persisted, authenticated
  └─ role = admin  → 200 { requiresOtp: true }     → six-digit code e-mailed
                        POST /api/auth/verify-otp  → 200 { token, user }
```

- **Issue.** `getSignedJwtToken()` signs `{ id }` with `JWT_SECRET` for
  `JWT_EXPIRE` (default 30 days).
- **Persist.** `token` and a serialised `user` are written to `localStorage`;
  React state is the working copy.
- **Rehydrate.** A mount-time effect restores both and flips `isLoading`, the
  flag `ProtectedRoute` waits on, so a refresh on an admin page does not
  bounce the user to `/login` before storage is read. Corrupt JSON is cleared
  rather than thrown.
- **Attach.** An axios request interceptor adds
  `Authorization: Bearer <token>` to every call, so no component handles
  credentials.
- **Expire.** A response interceptor catches any `401`, clears storage and
  redirects to `/login` (guarding against a redirect loop when already there).
- **Step-up for admins.** When `ENABLE_EMAIL_VERIFICATION=true`, an admin
  password success issues no token. A six-digit OTP is **bcrypt-hashed** before
  storage, expires in five minutes, and is destroyed after five failed attempts
  (`429`). Only `verify-otp` mints the JWT.

Authorisation is a separate concern from authentication: `protect` resolves the
user, `authorize('admin')` gates the route, and both run before any controller.

> **Trade-off, stated plainly.** `localStorage` is readable by script, so this
> design trades XSS resistance for a stateless API and simple multi-tab
> behaviour. Moving to an `httpOnly`, `SameSite=Strict` refresh cookie with an
> in-memory access token is the upgrade path; it requires CORS credentials and
> a CSRF strategy, which is why it is called out rather than half-implemented.

### 3.2 Secure file uploading

Uploads are a **two-phase commit**: `POST /api/upload` returns durable URLs,
then the listing is saved as pure JSON referencing them. That keeps the JSON
contract clean, makes a failed form submission cheap to retry, and confines all
storage knowledge to one module.

Defence in depth on the route: rate limit → JWT → admin role → MIME allowlist
(SVG deliberately excluded) → 5 MB/file → 10 files/request. Stored names are
**generated, not borrowed** (`Date.now()` plus 64 bits of entropy plus the
lower-cased extension), which defeats path traversal, collisions and gallery
enumeration in one step. Orphaned files are collected by diffing the URL set
before and after every property or settings write.

**→ Full walkthrough, including the known limitations:
[`docs/ASSET_PIPELINE.md`](docs/ASSET_PIPELINE.md)**

### 3.3 Complex property filtering

Filter state lives in the **URL**, not component state, so every result set is
shareable, bookmarkable and survives a refresh. `/properties` reads
`searchParams` for its initial values, and each change is pushed back to the
querystring before being forwarded to the API as typed params.

`GET /api/properties` composes one MongoDB query from independent, optional
dimensions:

| Parameter               | Query built                                    | Notes                                                                 |
| ----------------------- | ---------------------------------------------- | --------------------------------------------------------------------- |
| `search`                | `$or` across title, description, city, country | Case-insensitive regex                                                |
| `type`                  | exact match                                    | Constrained to the six-value enum                                     |
| `city`                  | case-insensitive regex                         |                                                                       |
| `minPrice` / `maxPrice` | `price.perNight: { $gte, $lte }`               | Either bound may stand alone                                          |
| `bedrooms`, `guests`    | `$gte`                                         | "at least", never exact                                               |
| `amenities`             | `amenities: { $all: [...] }`                   | Comma-separated; **conjunctive**                                      |
| `featured`              | `featured: true`                               | Home-page rail                                                        |
| `status`                | exact match, **defaults to `active`**          | Draft and maintenance listings are invisible to the public by default |
| `sort`                  | Mongoose sort string                           | `-createdAt`, `price.perNight`, …                                     |
| `page`, `limit`         | `skip`/`limit` + `countDocuments`              | Returns `{ page, limit, total, pages }`                               |

Availability is a second, orthogonal axis. `checkAvailability()` treats a
confirmed booking and an admin "blocked" range identically (both are conflicts),
using half-open interval logic (`checkIn < end && checkOut > start`) so a
same-day checkout/check-in does not falsely collide. Blocking a date range that
already contains a booking returns `409` with the conflicting ranges attached.

> **Scaling note.** The filters above assume MongoDB indexes on
> `location.city`, `price.perNight`, `status` and `featured`. Regex `search` is
> the first thing to outgrow: it cannot use an index for unanchored patterns
> and should become an Atlas Search or text index before the corpus is large.

---

## 4. Local Setup

**Prerequisites:** Node.js ≥ 20, npm ≥ 10, and a MongoDB instance (local
`mongod` or an Atlas connection string).

```bash
# 1. Clone the repository.
git clone https://github.com/hakeemshah-tech/enterprise-rental-platform.git
cd enterprise-rental-platform

# 2. Install every workspace from the repository root (once).
npm install

# 3. Create the two environment files from their templates.
cp client/.env.example client/.env.local
cp server/.env.example server/.env
#    …then set MONGODB_URI and JWT_SECRET in server/.env.
#    Windows PowerShell: Copy-Item client\.env.example client\.env.local

# 4. Seed an administrator (reads SEED_ADMIN_* from server/.env).
npm run seed

# 5. Boot the API and the web client together.
npm run dev
```

| Service        | URL                              |
| -------------- | -------------------------------- |
| Next.js client | http://localhost:3000            |
| Property API   | http://localhost:5000/api        |
| Health check   | http://localhost:5000/api/health |

`npm run dev` uses `npm-run-all` (`run-p`) to run both workspaces in one
terminal with labelled, interleaved output. Stopping it stops both. To run just
one: `npm run dev:server` or `npm run dev:client`.

Payments and e-mail are **optional**: leave `STRIPE_SECRET_KEY` empty and the
booking flow uses its simulated-payment path; leave `BREVO_API_KEY` empty and
notification e-mails are skipped. Neither blocks local development.

### Root scripts

| Script              | Effect                                            |
| ------------------- | ------------------------------------------------- |
| `npm run dev`       | Both services, concurrently (`run-p`)             |
| `npm run build`     | Production Next.js build                          |
| `npm start`         | Both services in production mode                  |
| `npm run lint`      | ESLint 9 flat config (`client/eslint.config.mjs`) |
| `npm run typecheck` | `tsc --noEmit` against the strict client config   |
| `npm test`          | `node:test` contract suite for the API            |
| `npm run verify`    | lint → typecheck → test, in sequence              |
| `npm run seed`      | Seed the administrator account                    |
| `npm run format`    | Prettier across the workspace                     |

---

## 5. CI/CD & Governance

**`.github/workflows/nextjs-api-pipeline.yml`** runs on every push and pull
request to `main`, with in-progress runs cancelled on a new push.

1. **`governance`** - fails fast, blocks the other jobs. Asserts no `.env` file
   is tracked (templates excepted), no tenant asset is tracked under
   `server/uploads/`, and no credential-shaped literal (`sk_live_…`,
   `whsec_…`, `AKIA…`, a `mongodb+srv://` URI with inline credentials) appears
   in application source.
2. **`client`** - restores the **`client/.next/cache`** compiler cache keyed on
   the lockfile and source tree, then runs ESLint (flat config), a production
   `next build` with placeholder public env vars, and `tsc --noEmit`. The type
   check runs _after_ the build deliberately: `next build` regenerates
   `next-env.d.ts` and `.next/types/**`, neither of which is committed, so
   checking afterwards also validates the generated route types.
3. **`api`** - runs the `node:test` suite: request-contract tests for every Zod
   schema, the upload allowlist and filename generator, and the validation
   middleware. No database or test framework required, so it runs identically
   on a laptop.

**Pre-commit (`.husky/pre-commit`)** applies the same rules locally:

- **Blocks** any staged file matching `.env` or `.env.*` (allowing
  `*.example`), with the exact `git restore --staged` command to recover.
- **Formats** staged files through `lint-staged` → Prettier, so formatting is
  adopted incrementally rather than in one repository-wide rewrite.

Hooks install automatically via the root `prepare` script on `npm install`.

**Known lint debt.** `eslint-config-next` 16 promotes the React Compiler rules
to errors. This codebase predates them and uses the classic
"fetch in `useEffect`, then `setState`" pattern in about ten places, so
`react-hooks/set-state-in-effect` and `react-hooks/purity` are downgraded to
**warnings** in `client/eslint.config.mjs`, visible in every lint run, with
the rationale and the intended fix recorded next to the override. Every other
rule remains an error and blocks the build.

---

## 6. Security Posture

| Control           | Implementation                                                                                                                        |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Transport headers | `helmet` (CORP relaxed only for `/uploads`, so `next/image` can load)                                                                 |
| CORS              | Single origin from `CORS_ORIGIN`, credentials enabled                                                                                 |
| Rate limiting     | 500 requests / 15 min per IP across `/api`                                                                                            |
| Passwords         | `bcryptjs`, salted, never selected by default (`select: false`)                                                                       |
| Admin step-up     | Six-digit OTP, bcrypt-hashed, 5-minute TTL, 5-attempt lockout                                                                         |
| Input validation  | Zod at the edge, Mongoose at the store                                                                                                |
| Webhook integrity | `stripe.webhooks.constructEvent` over the **raw** body; the webhook router is mounted before `express.json()` for exactly this reason |
| Idempotency       | Webhook handler no-ops on a booking already marked `paid`                                                                             |
| Secrets           | `process.env` only; no credential literal exists in `client/src` or `server/src`, and CI re-checks this on every push                 |
| Uploads           | See §3.2 and `docs/ASSET_PIPELINE.md`                                                                                                 |

**Configuration note.** The Stripe webhook handler falls back to parsing an
_unverified_ payload when `STRIPE_WEBHOOK_SECRET` is unset. That is a
convenience for local development against the simulated-payment path; setting
the secret in any deployed environment is mandatory, and a production hardening
pass should make the fallback conditional on `NODE_ENV !== 'production'`.

---

## 7. License

Proprietary. Copyright (c) 2026 Hakeem Shah, all rights reserved. This
repository is published for portfolio review and technical evaluation only:
redistribution, modification, and commercial use are not permitted. See
[LICENSE](LICENSE) for the full terms.

---

## 🔐 Governance & NDA Compliance

This repository represents a sanitized, standalone snapshot of a production-grade enterprise application.

To strictly comply with Non-Disclosure Agreements (NDA) and corporate security policies, the original Git history, proprietary business logic, client-specific configurations, and infrastructure-as-code (IaC) pipelines have been completely stripped from this public release.

As a result, this repository is published as a single-commit snapshot for portfolio demonstration purposes. It highlights architectural decisions, component structure, state management, and API design patterns while protecting the intellectual property of the original stakeholders.
