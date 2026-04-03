---
name: data-architecture
description: "Use when designing database schemas, planning data migrations, optimizing queries, or making storage technology decisions for the e-commerce platform."
---

# Data Architecture Skill

## Stack

- **Primary DB**: SQLite via better-sqlite3 (WAL mode, foreign keys, 64MB cache)
- **Location**: `backend/data/seller-platform.db`
- **Migrations**: Version-tracked in `schema_version` table, applied on startup in `backend/src/db.js`

## Schema (v1 — 13 tables)

### Core Catalog
| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `categories` | Product categories/niches | name, parent_id, amazon_node |
| `products` | Multi-product catalog | slug, name, status, target_price, unit_cost, expected_margin, validation_score, tags (JSON), meta (JSON) |
| `product_trends` | Time-series trend data | product_id, period, date, bsr_rank, search_volume, demand_score, trend_direction |
| `trend_discoveries` | Category-level opportunities | keyword, search_volume, growth_rate, competition, opportunity_score |

### Supply Chain
| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `suppliers` | Supplier directory | name, platform, country, contact_email, rating, verified |
| `supplier_quotes` | Per-product per-supplier quotes | product_id, supplier_id, price_low/high, moq, landed_cost |

### E-Commerce
| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `sellers` | Seller profiles (extends auth) | user_email, store_name, store_slug, plan |
| `listings` | Amazon + storefront listings | product_id, seller_id, channel, asin, title, price, status |
| `orders` | Buyer purchases | order_number, listing_id, seller_id, channel, quantity, total, status |

### Platform
| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `agent_runs` | AI execution audit log | agent_name, product_id, phase, tokens_used, duration_ms |
| `research_sessions` | Validation pipeline results | product_id, phase_id, score, confidence, verdict |
| `schema_version` | Migration tracking | version, name, applied_at |

## Conventions

1. **IDs**: Integer autoincrement (internal), slugs (public URLs)
2. **Timestamps**: ISO 8601 strings via `datetime('now')`
3. **JSON columns**: `tags`, `meta`, `bullets`, `images`, `keywords`, `settings`, `input`, `output`, `raw_data`
4. **Status enums**: Enforced via CHECK constraints
5. **Soft constraints**: Budget limits in application code, not DB triggers
6. **Indexes**: On foreign keys, status columns, date columns, and slug lookups

## API Routes

### Catalog (`/api/catalog/*`)
- `GET /products` — List with search/filter/pagination
- `GET /products/:slug` — Full detail with quotes, research, trends, listings
- `POST /products` — Create new product idea
- `PATCH /products/:slug` — Update product fields
- `DELETE /products/:slug` — Remove product
- `GET /categories` — All categories with product counts
- `GET /suppliers` — Supplier directory
- `POST /suppliers` — Add supplier
- `POST /products/:slug/quotes` — Add supplier quote
- `POST /products/:slug/research` — Log research session
- `GET /agent-runs` — Query agent execution history
- `POST /agent-runs` — Log agent execution
- `GET /stats` — Dashboard aggregate stats

### Trends (`/api/trends/*`)
- `GET /discoveries` — List trend discoveries
- `POST /discoveries` — Add discovery
- `GET /products/:slug/trends` — Time-series data
- `POST /products/:slug/trends` — Add data point
- `GET /trending` — Aggregate trending view

### Store (`/api/store/*`)
- `GET /profile` — Seller profile (auto-creates)
- `PATCH /profile` — Update seller branding
- `GET /listings` — Seller's listings
- `POST /listings` — Create listing
- `PATCH /listings/:id` — Update listing
- `GET /orders` — Seller's orders
- `POST /orders` — Place order (buyers)
- `GET /public/:storeSlug` — Public storefront (no auth)

## Migration Guide

To add new tables:
1. Add a new entry to `MIGRATIONS` array in `backend/src/db.js` with `version: N+1`
2. Write the `up` SQL (CREATE TABLE + indexes)
3. Restart backend — migration runs automatically

## Scaling Path

| Stage | Trigger | Action |
|-------|---------|--------|
| Current | <10 sellers, <1K products | SQLite, single server |
| Growth | >100 concurrent writers | Migrate to PostgreSQL (schema is compatible) |
| Scale | >10K orders/day | Add Redis cache, connection pooling |
| Enterprise | Multi-region | PostgreSQL with read replicas |
