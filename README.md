# Alien Miniapp Boilerplate

Boilerplate for building miniapps on the Alien platform with **authentication** and **payments** out of the box. Next.js 16, PostgreSQL, Drizzle ORM, JWT auth, crypto payments (USDC on Solana, ALIEN token).

## Quick Start

```bash
bun install
docker compose up -d
bun run db:migrate
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `WEBHOOK_PUBLIC_KEY` | Ed25519 public key (hex, 64 chars) for verifying payment webhook signatures |
| `ALIEN_AUDIENCE` | Expected JWT `aud` claim. This is your provider address from the Dev Portal |
| `ALIEN_JWKS_URL` | JWKS endpoint for JWT verification. Optional, defaults to `https://sso.alien-api.com/oauth/jwks` |
| `RUN_MIGRATIONS` | Set to `true` to run DB migrations automatically on server start. Optional, off by default |
| `NEXT_PUBLIC_RECIPIENT_ADDRESS` | Solana wallet address that receives USDC/SOL payments |
| `NEXT_PUBLIC_ALIEN_RECIPIENT_ADDRESS` | Alien provider address that receives ALIEN token payments |

### Where to get the values

- **`NEXT_PUBLIC_RECIPIENT_ADDRESS`** — any Solana wallet address you want to receive payments to (e.g. your personal wallet, or even the wallet address shown in your Alien app).
- **`NEXT_PUBLIC_ALIEN_RECIPIENT_ADDRESS`** — your **provider address** from the Alien Dev Portal. You can find it on the [Webhooks](https://dev.alien.org/dashboard/webhooks) or [Mini Apps](https://dev.develop.alien.org/dashboard/miniapps) pages. For ALIEN token payments, your provider address is used automatically.
- **`WEBHOOK_PUBLIC_KEY`** — the Ed25519 public key provided by the Alien Dev Portal when you register a webhook.
- **`ALIEN_AUDIENCE`** — the expected `aud` claim of incoming auth tokens; this is your **provider address** from the Dev Portal (same place as above).

## Setting Up Payments

Register a webhook in the [Alien Dev Portal](https://dev.alien.org/dashboard) pointing to:

```
https://<your-website>/api/webhooks/payment
```

Copy the **webhook public key** shown on creation into your `WEBHOOK_PUBLIC_KEY` env var, fill in the recipient addresses, and you're ready to accept payments.

The step-by-step registration guide, payload schema, versioning, and signature verification are documented in the [payments docs](https://docs.alien.org/react-sdk/payments#webhook-setup). This boilerplate implements that contract in `app/api/webhooks/payment/route.ts`.

## Payment Flow

1. User picks a product in the store and initiates a purchase
2. Frontend calls `POST /api/invoices` to create a payment intent in the database
3. Backend returns an `invoice` ID
4. Frontend opens the Alien payment interface via the `usePayment()` hook
5. After the user pays, the Alien platform sends a webhook to `POST /api/webhooks/payment`
6. Backend verifies the Ed25519 signature, updates the payment intent, and records a transaction

### Supported Tokens

| Token | Network | Recipient env var |
|---|---|---|
| USDC | Solana | `NEXT_PUBLIC_RECIPIENT_ADDRESS` |
| ALIEN | Alien | `NEXT_PUBLIC_ALIEN_RECIPIENT_ADDRESS` |

You can specify any Solana wallet for USDC/SOL tokens. For ALIEN token payments, your provider address is used automatically. See the [supported tokens reference](https://docs.alien.org/react-sdk/payments#supported-tokens).

### Test Payments

The store includes a **Test** tab with pre-configured test products. Test transactions are marked with a `test` badge and don't involve real funds.

| Test product | What it simulates |
|---|---|
| Test USDC purchase | Successful USDC payment |
| Test ALIEN purchase | Successful ALIEN payment |
| Test cancelled | User cancels the payment |
| Test failed | Payment succeeds on-chain but webhook reports failure |

The full list of test scenarios (including error simulations) and their frontend/webhook behavior is documented in the [test mode docs](https://docs.alien.org/react-sdk/payments#test-mode).

## Project Structure

```
app/
├── api/
│   ├── me/route.ts                    # Authenticated user endpoint
│   ├── invoices/route.ts              # Create payment intents
│   ├── transactions/route.ts          # Fetch transaction history
│   └── webhooks/payment/route.ts      # Payment webhook handler
├── store/page.tsx                     # Store page (diamond shop)
├── explore/page.tsx                   # SDK showcase (haptics, clipboard, capabilities, ...)
├── layout.tsx                         # Root layout with AlienProvider
├── page.tsx                           # Home page
├── providers.tsx                      # Client-side providers
├── error.tsx                          # Error boundary
└── global-error.tsx                   # Global error boundary
components/
└── ui/card.tsx                        # Shared card primitives
features/
├── auth/
│   ├── components/
│   │   └── connection-status.tsx      # Bridge, token & contract version status
│   └── lib.ts                         # Token verification (JWKS)
├── navigation/
│   └── components/
│       ├── tab-bar.tsx                # Bottom tab navigation
│       └── native-back-button.tsx     # Host back button wiring (useBackButton)
├── sdk-showcase/
│   └── components/                    # Live demos: launch params, callability,
│                                      # haptics, clipboard, host actions
├── user/
│   ├── components/
│   │   └── user-info.tsx              # User info display (copyable Alien ID)
│   ├── dto.ts                         # Zod schemas for user data
│   ├── hooks/
│   │   └── use-current-user.ts        # Hook to fetch current user
│   └── queries.ts                     # Database queries (upsert user)
└── payments/
    ├── components/
    │   └── diamond-store.tsx           # Store UI with product grid & history
    ├── hooks/
    │   └── use-diamond-purchase.ts     # Purchase hook (invoice + pay)
    ├── constants.ts                    # Products, tokens, test scenarios
    ├── dto.ts                          # Zod schemas for payments
    └── queries.ts                      # Database queries for payments
lib/
├── api/
│   ├── with-auth.ts                   # Bearer-auth route wrapper (server)
│   └── client.ts                      # Authorized JSON fetcher (client)
├── db/
│   ├── index.ts                       # Database connection & migrations
│   └── schema.ts                      # Drizzle schema (users, payment_intents, transactions)
└── env.ts                             # Environment variable validation
```

## Auth

Authentication is handled automatically by the Alien platform:

1. Alien app injects an auth token when loading your miniapp
2. `useAlien()` hook from `@alien-id/miniapps-react` provides the token on the client
3. Frontend sends the token as `Authorization: Bearer <token>` to your API routes
4. API verifies the token against Alien's JWKS using `@alien-id/miniapps-auth-client`
5. The `sub` claim from the JWT is the user's unique Alien ID

**Registration is implicit** — on first API call, the user is automatically created in the database via a find-or-create pattern. No signup flow needed.

When running outside the Alien app, the bridge won't be available. The connection status component helps with debugging.

## Database

PostgreSQL with Drizzle ORM. Local setup uses Docker (`docker-compose.yml`).

**Users** (`users`):

| Column | Type | Description |
|---|---|---|
| `id` | UUID | Auto-generated primary key |
| `alienId` | TEXT (unique) | User's Alien ID from JWT `sub` claim |
| `createdAt` | TIMESTAMP | Set on first auth |
| `updatedAt` | TIMESTAMP | Updated on each auth |

**Payment Intents** (`payment_intents`):

| Column | Type | Description |
|---|---|---|
| `id` | UUID | Auto-generated primary key |
| `invoice` | TEXT (unique) | Invoice identifier (`inv-<uuid>`) |
| `senderAlienId` | TEXT | Payer's Alien ID |
| `recipientAddress` | TEXT | Recipient wallet/provider address |
| `amount` | TEXT | Payment amount in smallest units |
| `token` | TEXT | Token type (USDC / ALIEN) |
| `network` | TEXT | Network (solana / alien) |
| `productId` | TEXT | Product identifier |
| `status` | TEXT | `pending` / `completed` / `failed` |

**Transactions** (`transactions`):

| Column | Type | Description |
|---|---|---|
| `id` | UUID | Auto-generated primary key |
| `senderAlienId` | TEXT | Payer's Alien ID |
| `recipientAddress` | TEXT | Recipient wallet/provider address |
| `txHash` | TEXT | On-chain transaction hash |
| `status` | TEXT | `paid` / `failed` |
| `amount` | TEXT | Payment amount |
| `token` | TEXT | Token type |
| `network` | TEXT | Network |
| `invoice` | TEXT | Associated invoice |
| `test` | TEXT | `"true"` for test payments; `NULL` for real ones |
| `payload` | JSONB | Full webhook payload for audit |

**Commands:**

```bash
bun run db:generate   # Generate migration from schema changes
bun run db:migrate    # Apply pending migrations
bun run db:push       # Push schema directly (dev only)
bun run db:studio     # Open Drizzle Studio GUI
```

To run migrations automatically on server start, set `RUN_MIGRATIONS=true`. Disabled by default.

## API

### `GET /api/me`

Returns the authenticated user. Requires Bearer token.

```json
{
  "id": "uuid",
  "alienId": "user-alien-id",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### `POST /api/invoices`

Creates a payment intent. Requires Bearer token.

**Request body:**

```json
{
  "productId": "usdc-diamonds-10"
}
```

Amounts, tokens, and recipient addresses are always resolved server-side
from the product catalog — the client only names the product.

**Response:**

```json
{
  "invoice": "inv-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "id": "uuid",
  "recipient": "wallet-or-provider-address",
  "amount": "10000",
  "token": "USDC",
  "network": "solana",
  "item": { "title": "Small Pouch", "iconUrl": "https://...", "quantity": 10 }
}
```

### `GET /api/transactions`

Returns the authenticated user's transaction history. Requires Bearer token.

### `POST /api/webhooks/payment`

Receives payment status updates from the Alien platform, implementing the [webhook contract](https://docs.alien.org/react-sdk/payments#webhook-setup) (schema version 3): Ed25519 signature verification, version check, and payload cross-validation against the stored payment intent. Processes idempotently — re-delivered webhooks for settled intents respond with `{ "success": true, "processed": false }` without reprocessing.

## Deployment

This app is designed to run on **Vercel**. Setup takes just a few clicks:

1. Push your code to GitHub
2. Import the repository on [vercel.com](https://vercel.com)
3. Add a PostgreSQL database (Vercel Postgres, Neon, Supabase, or any external provider)
4. Set the environment variables: `DATABASE_URL`, `WEBHOOK_PUBLIC_KEY`, `ALIEN_AUDIENCE`, `NEXT_PUBLIC_RECIPIENT_ADDRESS`, `NEXT_PUBLIC_ALIEN_RECIPIENT_ADDRESS`
5. Deploy

Vercel auto-detects Next.js and handles the build. For auto-migrations on deploy, set `RUN_MIGRATIONS=true`.

Once deployed, register your webhook in the [Alien Dev Portal](https://dev.alien.org/dashboard) pointing to `https://<your-vercel-domain>/api/webhooks/payment`.
