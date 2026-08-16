# Content Engine Integration — Amazon Seller Vertical

This repo is a **vertical** component of the AgentOS Content Engine
(hub: `mcp-idea-publisher`). Its sourcing research feeds three
product-storytelling Instagram pages:

| Channel | Category | Cadence |
|---|---|---|
| @find.ai.beddings | Bedding | every 6h |
| @find.ai.bats | Bats | every 8h |
| @find.ai.sports | Sports | every 6h |

The manifest is [`content.component.yaml`](./content.component.yaml); the hub
mirrors it in `channels.yaml`. Content pillars pull from real research in this
repo (`active-deals/`, `supplier-comparison-matrix.csv`) so origin stories stay
honest — the engine's brand-voice contract forbids invented suppliers or facts.

Generate a post for one of these pages from the hub:

```bash
curl -s -X POST localhost:8000/channels/find.ai.beddings/generate \
  -H "Content-Type: application/json" -d '{}'
```

Full architecture and licensing: `mcp-idea-publisher/docs/CONTENT_ENGINE.md`.
