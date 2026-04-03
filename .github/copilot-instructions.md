# Agentic E-Commerce Seller Platform — Workspace Instructions

## Quick Reference

| Component | Command | URL |
|-----------|---------|-----|
| Backend | `cd backend && npm run dev` | http://localhost:3001 |
| Dashboard | `cd dashboard && npm run dev` | http://localhost:5173/amazon-seller-agentic-workflow/ |
| MCP (optional) | `uvx workspace-mcp --tool-tier core --single-user --tools gmail sheets drive` | http://localhost:8000 |
| Tunnel | `cloudflared tunnel --url http://localhost:5173` | *.trycloudflare.com |

## Platform Vision

An AI-agent-driven end-to-end e-commerce platform where:
- **Every seller can sell** — Chat your way into selling products. Discover trends, validate ideas, source suppliers, create listings, and manage orders.
- **Every buyer can buy** — Browse seller storefronts or purchase through Amazon. Zero-friction checkout.
- **Agents do the heavy lifting** — 12 specialized AI agents handle research, negotiation, listing optimization, PPC, inventory, and more.

## Architecture

- **backend/** — Express API (port 3001). SQLite database (better-sqlite3, WAL mode). LLM-powered research + operational endpoints. JWT auth. Routes:
  - `/api/auth/*` — Authentication (register, login, me)
  - `/api/catalog/*` — Product catalog CRUD, categories, suppliers, quotes, agent runs, stats
  - `/api/trends/*` — Trend discoveries, product time-series, trending aggregates
  - `/api/store/*` — Seller profiles, listings, orders, public storefront
  - `/api/research/*` — 5-phase product validation pipeline
  - `/api/ops/*` — LLM operations (email gen, counter-offers, listings, KPI reports)
- **backend/data/** — SQLite database file (`seller-platform.db`, gitignored)
- **dashboard/** — React 18 + Vite 5 + Tailwind CSS. Login page guards all routes. Tabs: Overview, Catalog, Trends, Research, Store, Strategies, Workflows, Actions, Outreach, Integrations.
- **active-deals/** — Per-product deal files (scorecards, outreach logs, supplier matrices).
- **.github/agents/** — 12 VS Code agent definitions (seller operator, market research, competition, pricing, supplier management, listing optimization, PPC campaigns, inventory management, minimalist frontend, software architect, product discovery, buyer experience).
- **.github/skills/** — 9 domain skill templates (amazon-ops-system, product-validation, supplier-management, listing-optimization, ppc-campaign-management, inventory-fulfillment, data-architecture, product-discovery, buyer-storefront).
- **.github/instructions/** — Guardrails and MCP routing rules.
- **.github/prompts/** — Pre-built workflow prompts.

## Data Layer

- **Database**: SQLite via better-sqlite3 (WAL mode, foreign keys, 64MB cache)
- **Schema**: 13 tables — categories, products, product_trends, trend_discoveries, suppliers, supplier_quotes, sellers, listings, orders, agent_runs, research_sessions, schema_version
- **Migrations**: Version-tracked, auto-applied on startup in `backend/src/db.js`
- **Seed data**: 13 categories + pet-slicker-brush product seeded on first run

## Local Development Setup

1. **Backend**: `cd backend && cp .env.example .env` → set `GEMINI_API_KEY` (or other LLM key) → `npm install && npm run dev`
2. **Dashboard**: `cd dashboard && npm install && npm run dev`
3. **Tunnel**: `cloudflared tunnel --url http://localhost:5173` (share the trycloudflare.com URL)
4. **MCP** (optional, for Gmail/Sheets): `uvx workspace-mcp --tool-tier core --single-user --tools gmail sheets drive`

### LLM Providers (pick one in `.env`)

| Provider | Env var | Models | Cost |
|----------|---------|--------|------|
| Gemini | `GEMINI_API_KEY` | gemini-2.0-flash, gemini-2.5-pro-preview-05-06 | Free tier |
| GitHub Models | `GITHUB_TOKEN` | gpt-4o-mini | Free |
| OpenAI | `OPENAI_API_KEY` | gpt-4o | Paid |
| Anthropic | `ANTHROPIC_API_KEY` | claude-sonnet-4-20250514 | Paid |

### Authentication
- First registered user gets `admin` role automatically
- JWT tokens valid for 72 hours (configurable via `SESSION_HOURS`)
- Auth routes: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`

## Key Conventions

- **ESM only** — All backend/dashboard code uses ES modules (`"type": "module"`).
- **No TypeScript** — Plain JS throughout. Dashboard uses JSX via `@vitejs/plugin-react`.
- **SQLite first** — All persistent data in SQLite. JSON columns for flexible fields. Parameterized queries only.
- **Multi-product** — Every UI and API supports multiple products. Never hardcode to single product.
- **API pattern** — `GET/POST/PATCH/DELETE` on `/api/catalog/*`, `/api/trends/*`, `/api/store/*`. Research: `POST /api/research/phase`. Ops: `POST /api/ops/*`.
- **Dashboard base path** — Vite `base: '/amazon-seller-agentic-workflow/'` for GitHub Pages.
- **Agent prompts** — Loaded from `.github/agents/*.agent.md` at runtime by `backend/src/agents.js`.

## Business Guardrails (always enforced)

- ≥35% gross margin on all products
- ≥18% contribution margin after ads/returns
- ≤$1,500 inventory exposure per product
- All payments require human approval
- See [amazon-margin-guardrails.instructions.md](instructions/amazon-margin-guardrails.instructions.md)

## MCP Server Routing

- **Google Workspace** (gmail, sheets, drive) → `workspace-mcp` on port 8000
- **Slack** → `slack/*` tools for notifications/approvals
- **Web Research** → `fetch/*` tools
- **Amazon Ads** → `@marketplaceadpros/amazon-ads-mcp-server`
- See [mcp-routing.instructions.md](instructions/mcp-routing.instructions.md)

## Monetization Model

Revenue share model with tiered plans and value-added services.

### Plan Tiers
| Plan | Products | Agent Runs/Mo | Revenue Share | Key Features |
|------|----------|---------------|---------------|-------------|
| Free | 3 | 20 | 0% | Deal scoring, basic research, storefront |
| Starter | 15 | 100 | 3.5% of GMV | + supplier intel, PPC basic, marketplace browse |
| Pro | Unlimited | Unlimited | 5.0% of GMV | + white-label, autopilot, API access, full marketplace |

### Revenue Streams
1. **Revenue Share** — Platform takes X% of GMV on all storefront orders (tracked per-order in `revenue_share_ledger`)
2. **Agent Marketplace** — Sellers create/sell workflow templates (stored in `workflow_templates`; installs tracked in `template_installs`)
3. **AI Deal Scoring** — ASIN/keyword instant validation scorecards (stored in `deal_scores`)
4. **Shared Supplier Intelligence** — Anonymized supplier ratings pool (stored in `supplier_intelligence`)
5. **White-Label Storefront** — Pro sellers get branded .com storefront

### Billing API Routes (`/api/billing/*`)
- `GET /plan` — Current plan + usage + limits
- `GET /plans` — All available plans
- `POST /upgrade` — Upgrade plan
- `GET /revenue-share` — Revenue share ledger
- `GET /deal-scores` — Scoring history
- `POST /deal-scores` — Request ASIN/keyword scoring
- `GET /marketplace` — Browse workflow templates
- `POST /marketplace` — Publish a template
- `POST /marketplace/:slug/install` — Install a template
- `GET /supplier-intel/:supplierId` — Aggregated supplier ratings
- `POST /supplier-intel` — Submit supplier rating
- `GET /usage-history` — Monthly usage history

### Enforcement
- Agent run limits enforced via `enforceAgentRunLimit` middleware on `/api/research/phase`
- Product limits enforced via `enforceProductLimit` middleware
- Feature gates enforced via `requirePlan('feature_name')` middleware
- Revenue share recorded automatically on every storefront order

## Existing Documentation

- [README.md](../README.md) — Project overview, 7-phase pipeline, repo structure
- [dashboard/README.md](../dashboard/README.md) — Dashboard setup and deployment
- `.github/skills/amazon-ops-system/SKILL.md` — Operational templates
- `.github/skills/product-validation/SKILL.md` — Validation methodology
- `.github/skills/data-architecture/SKILL.md` — Database schema and API reference
- `.github/skills/product-discovery/SKILL.md` — Trend scanning methodology
- `.github/skills/buyer-storefront/SKILL.md` — Storefront and checkout architecture
