# AgentOS Amazon Seller Pack — Agent Registry

This pack implements a 7-phase autonomous Amazon FBA pipeline.

| Agent | Phase | Role |
|-------|-------|------|
| demand-researcher | 1 | Market demand, search volume, BSR analysis |
| competition-analyst | 2 | Competitor listings, reviews, market saturation |
| pricing-strategist | 3 | Landed cost, margin, and price positioning |
| supply-chain-analyst | 4 | Verified supplier discovery (Alibaba, domestic) |
| risk-assessor | 5 | Regulatory, IP, and inventory exposure risks |
| outreach-writer | — | Supplier outreach email generation |
| listing-writer | — | Amazon listing title, bullets, description |

## Pack interface

- `GET /health` — LLM connectivity check
- `GET /pack/manifest` — AgentOS manifest JSON
- `POST /pack/run` — accepts `{goal, context}`, routes to appropriate agent/phase
- `POST /pack/billing/consume` — records agent run usage

## Human-in-the-loop gates

- Supplier outreach: agent drafts email, human approves send
- Procurement: human must approve payment
