---
name: product-discovery
description: "Use when finding new product opportunities, running trend scans, scoring market opportunities, and managing the product discovery pipeline from idea to validation."
---

# Product Discovery Skill

## Overview

Systematic approach to finding profitable e-commerce products through trend analysis, demand signals, and competitive gap identification. All discoveries are stored in SQLite and flow into the product validation pipeline.

## Discovery Pipeline

```
Trend Scan → Score → Filter (≥7/10) → Graduate to Product → Validate (5 phases) → Source → Launch
```

## Scanning Methodology

### Daily Scan Checklist
1. **Amazon BSR Movers** — Check top movers in priority categories
2. **Google Trends** — Rising search queries in product categories
3. **Social Signals** — TikTok Made Me Buy It, Reddit product mentions
4. **Seasonal Calendar** — Upcoming events/holidays (2-3 month lead time)
5. **Competitor Gaps** — Low-quality listings in high-demand niches

### Weekly Deep Dive
1. **Category Analysis** — Pick 2-3 categories, deep-dive into top 100 products
2. **Review Mining** — Look for "I wish this product..." patterns in competitor reviews
3. **Price Gap Analysis** — Find products where market price >> supplier cost
4. **Bundle Opportunities** — Complementary products that sell together

## Opportunity Scoring (0-10)

| Factor | Weight | Score 8-10 | Score 5-7 | Score 1-4 |
|--------|--------|------------|-----------|-----------|
| Search Volume | 25% | >10K/mo, rising | 3-10K, stable | <3K or declining |
| Competition Gap | 20% | <50 reviews avg, poor listings | 50-200 reviews | >200 reviews, brand-dominant |
| Margin Potential | 25% | >50% gross | 35-50% gross | <35% gross |
| Procurement Ease | 15% | 5+ suppliers, MOQ <100 | 2-4 suppliers | Single source, high MOQ |
| Entry Cost | 15% | First order <$200 | $200-500 | >$500 |

### Threshold: Graduate at ≥7/10

## Data Storage

### trend_discoveries table
```sql
INSERT INTO trend_discoveries
  (category_id, keyword, search_volume, growth_rate, competition, opportunity_score, source, notes)
VALUES (?, ?, ?, ?, ?, ?, ?, ?);
```

### Graduation to products table
```sql
INSERT INTO products (slug, name, category_id, status, tags, meta)
VALUES (?, ?, ?, 'idea', ?, ?);
```

## API Endpoints

- `POST /api/trends/discoveries` — Log a new discovery
- `GET /api/trends/discoveries?category=X&competition=low` — Browse discoveries
- `GET /api/trends/trending` — See rising products + top opportunities
- `POST /api/catalog/products` — Graduate discovery to product (status: 'idea')

## Category Priority Matrix

### Tier 1 (Start Here)
- Pet Supplies — High repeat, emotional purchase, low returns
- Home & Kitchen — Huge TAM, year-round demand
- Beauty & Personal Care — High margins, repeat purchase

### Tier 2 (Expand)
- Health & Household — Growing online adoption
- Sports & Outdoors — Seasonal spikes, good margins
- Baby — Emotional purchase, brand loyalty buildable

### Tier 3 (Opportunistic)
- Office Products — Steady B2B demand
- Garden & Outdoor — Seasonal but high margin
- Arts & Crafts — Niche but loyal customer base

## Guardrails

- Never recommend products with <35% gross margin potential
- Skip categories with >15% return rate (electronics, apparel/sizing)
- Avoid products requiring certification (FDA, FCC) for first-time sellers
- Flag seasonal-only products (>70% of sales in one quarter)
- Maximum $1,500 inventory exposure per new product
