# Amazon Seller Agentic Workflow — Workspace Instructions

## Quick Reference

| Component | Command | URL |
|-----------|---------|-----|
| Backend | `cd backend && npm run dev` | http://localhost:3001 |
| Dashboard | `cd dashboard && npm run dev` | http://localhost:5173/amazon-seller-agentic-workflow/ |
| MCP (optional) | `uvx workspace-mcp --tool-tier core --single-user --tools gmail sheets drive` | http://localhost:8000 |
| Tunnel | `cloudflared tunnel --url http://localhost:5173` | *.trycloudflare.com |

## Architecture

- **backend/** — Express API (port 3001). LLM-powered research phases + operational endpoints (email gen, counter-offers, listings, KPI reports). JWT auth required for `/api/research/*` and `/api/ops/*`. Config via `backend/.env` (copy from `.env.example`).
- **dashboard/** — React 18 + Vite 5 + Tailwind CSS. Login page guards all routes. Vite proxies `/api` → backend:3001 and `/mcp` → workspace-mcp:8000.
- **active-deals/** — Per-product deal files (scorecards, outreach logs, supplier matrices).
- **.github/agents/** — VS Code agent definitions (seller operator, market research, competition, pricing, supplier management, listing optimization, PPC campaigns, inventory management).
- **.github/skills/** — Domain skill templates (`amazon-ops-system`, `product-validation`, `supplier-management`, `listing-optimization`, `ppc-campaign-management`, `inventory-fulfillment`).
- **.github/instructions/** — Guardrails and MCP routing rules.
- **.github/prompts/** — Pre-built workflow prompts (launch, daily ops, validation, investor review).

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
- **API pattern** — `POST /api/research/phase` (validation), `POST /api/ops/*` (operations). All ops endpoints require LLM via `requireLLM` middleware.
- **Dashboard base path** — Vite `base: '/amazon-seller-agentic-workflow/'` for GitHub Pages. Local dev serves at this path.
- **Agent prompts** — Loaded from `.github/agents/*.agent.md` at runtime by `backend/src/agents.js`.

## Business Guardrails (always enforced)

- ≥35% gross margin on all products
- ≥18% contribution margin after ads/returns
- ≤$1,500 inventory exposure per product
- All payments require human approval
- See [amazon-margin-guardrails.instructions.md](.github/instructions/amazon-margin-guardrails.instructions.md)

## MCP Server Routing

- **Google Workspace** (gmail, sheets, drive) → `workspace-mcp` on port 8000
- **Slack** → `slack/*` tools for notifications/approvals
- **Web Research** → `fetch/*` tools
- **Amazon Ads** → `@marketplaceadpros/amazon-ads-mcp-server`
- See [mcp-routing.instructions.md](.github/instructions/mcp-routing.instructions.md)

## Existing Documentation

- [README.md](../README.md) — Project overview, 7-phase pipeline, repo structure
- [dashboard/README.md](../dashboard/README.md) — Dashboard setup and deployment
- `.github/skills/amazon-ops-system/SKILL.md` — Operational templates
- `.github/skills/product-validation/SKILL.md` — Validation methodology
