# Backend — Seller Platform API

Node/Express + SQLite service backing the seller platform: product catalog,
supplier quotes, listings, billing, and the social content pipeline
(Instagram caption/origin-story generation + Meta Graph API publishing).

## Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and set at least one LLM provider (`LLM_PROVIDER=gemini|github|openai|anthropic`
plus its API key — see the comments in `.env.example`). Everything below except
publishing to Instagram works with only an LLM key configured.

```bash
npm run dev   # node --watch server.js, http://localhost:3001
```

The SQLite database (`backend/data/seller-platform.db`) and its schema
migrations run automatically on startup — there is nothing to migrate by hand.
To start from a clean database, stop the server and delete `backend/data/`.

```bash
curl http://localhost:3001/api/health
```

## Auth flow

Every route except `/api/health`, `/api/auth/*`, and the public storefront
requires a bearer token:

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"a-real-password"}'
# -> { "user": {...}, "token": "..." }
```

A seller profile (`sellers` table row) is created lazily the first time you
call `GET /api/store/profile` with that token — call it once before using any
`/api/store/*` or `/api/social/*` routes:

```bash
TOKEN="<paste the token from register/login>"
curl http://localhost:3001/api/store/profile -H "Authorization: Bearer $TOKEN"
```

## Instagram / social content

Two layers, matching the pattern used by the other `/api/ops/*` endpoints
(stateless LLM call) vs. `/api/store/*` (persisted, seller-scoped):

**Stateless preview** — no seller profile or Instagram account needed, just an LLM key:
```bash
curl -X POST http://localhost:3001/api/ops/generate-instagram-content \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"product":"Self-Cleaning Pet Slicker Brush","category":"Pet Supplies","originStory":"Hand-assembled in a small Ningbo workshop, 8 years in pet tooling."}'
```

**Persisted, per-category pipeline** — generate → approve → publish, tied to a
product and one Instagram Business Account per category:
```bash
# 1. Generate content for a product (persists a draft row)
curl -X POST http://localhost:3001/api/social/instagram/generate \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"productSlug":"pet-slicker-brush","originStory":"Hand-assembled in a small Ningbo workshop, 8 years in pet tooling."}'

# 2. Approve it (note the returned content.id)
curl -X PATCH http://localhost:3001/api/social/instagram/content/1/approve \
  -H "Authorization: Bearer $TOKEN"

# 3. Connect a real Instagram Business Account for the product's category
#    (igBusinessAccountId/accessToken must be real Meta Graph API credentials —
#    see "Instagram credentials" below. categoryId comes from GET /api/catalog/products)
curl -X POST http://localhost:3001/api/social/instagram/accounts \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"categoryId":1,"igBusinessAccountId":"<real ig business account id>","accessToken":"<real long-lived token>"}'

# 4. Publish (requires a real, reachable image URL and the account above)
curl -X POST http://localhost:3001/api/social/instagram/content/1/publish \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"imageUrl":"https://example.com/product-photo.jpg"}'
```

Without real Graph credentials, step 4 fails with a clear error
(`"Instagram access token missing..."` or a Graph API error) — that's expected,
not a bug. There's no dry-run/fake-success path by design.

### Instagram credentials

Create a Meta app at https://developers.facebook.com/apps, link an Instagram
Business Account to a Facebook Page, and generate a long-lived access token.
Set `META_APP_ID`/`META_APP_SECRET` in `.env` (only needed if you use the
token-exchange helper in `src/integrations/instagram.js`); the per-category
`igBusinessAccountId`/`accessToken` are supplied directly via step 3 above and
stored in the `instagram_accounts` table, not in `.env`.

## Smoke test

`scripts/smoke-test-instagram.sh` runs the full flow above end-to-end against
a running server (register → profile → generate → approve → connect a fake
account → attempt publish, which is expected to fail without real credentials):

```bash
./scripts/smoke-test-instagram.sh
```

## Tests

No automated test suite exists yet for this backend (`npm test` is not
configured) — verification is via the smoke-test script above and manual curl.
