---
name: ppc-campaign-management
description: "Use when planning, launching, optimizing, or auditing Amazon PPC campaigns. Covers Sponsored Products, Sponsored Brands, bid strategies, ACoS targets, keyword harvesting, and budget allocation for maximum ROAS."
---
# PPC Campaign Management Skill

## Purpose
Manage Amazon advertising from launch through scale, optimizing for Return on Ad Spend (ROAS) and Total Advertising Cost of Sale (TACoS).

## Campaign Architecture

### Launch Phase (Days 1-14)
1. **Auto Campaign** — broad discovery, $15-25/day
   - Let Amazon's algorithm find converting keywords
   - Set default bid at $0.50-0.75 (category dependent)
2. **Manual Broad** — top 10 keywords from research, $10-15/day
   - Bid 10-20% above suggested bid to win impressions
3. **Manual Exact** — top 5 high-intent keywords, $10/day
   - These are your money keywords — bid aggressively

**Launch Budget Split:** Auto 40% | Broad 25% | Exact 25% | Product Targeting 10%

### Optimization Phase (Days 15-60)
1. Harvest converting search terms from Auto → Manual Exact
2. Negate non-converting terms (>20 clicks, 0 sales)
3. Adjust bids: increase on ACoS < target, decrease on ACoS > 2x target
4. Add negative exact matches for irrelevant terms

**Growth Budget Split:** Auto 20% | Broad 20% | Exact 40% | Product Targeting 15% | Sponsored Brands 5%

### Scale Phase (Day 61+)
1. Sponsored Brands — brand awareness, top-of-search placement
2. Sponsored Display — retargeting, competitor targeting
3. Product Targeting — target specific competitor ASINs
4. Dayparting — increase bids during peak conversion hours

**Mature Budget Split:** Auto 10% | Broad 15% | Exact 45% | Product Targeting 15% | Sponsored Brands 10% | Sponsored Display 5%

## KPI Targets

| Metric | Launch Target | Mature Target |
|--------|---------------|---------------|
| ACoS | <35% | <20% |
| TACoS | <15% | <8% |
| CTR | >0.4% | >0.5% |
| CVR | >10% | >15% |
| Impressions/day | >1000 | >5000 |

## Budget Rules
- Never exceed 15% of estimated monthly revenue on ads
- Kill keywords with spend > 1.5× product selling price and 0 conversions (e.g., $37.50 for a $25 product)
- Scale keywords with ACoS <15% — double their budget
- Reserve 20% of ad budget for testing new keywords weekly

## Bid Strategy
- **Down Only** for Auto campaigns (limit overspend)
- **Up and Down** for Manual Exact (maximize winning keywords)
- **Fixed Bids** for Product Targeting (control costs)
- Increase Top of Search modifier by 25-50% for hero keywords

## Reporting Cadence
- Daily: check spend vs budget, pause runaways
- Weekly: harvest search terms, negate losers, adjust bids
- Monthly: TACoS trend, organic rank improvement, keyword portfolio review
