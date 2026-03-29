# Autonomous Product Selection Workflow

## Objective
Identify high-gross-profit products with easy procurement, low entry cost, high volume potential, and dropship viability.

## Data Sources to Scan
1. Amazon Best Sellers Rank (BSR) by category
2. Amazon Movers & Shakers (velocity signals)
3. Google Trends (demand trajectory)
4. Jungle Scout / Helium10 estimates (if available)
5. Alibaba supplier density (procurement ease proxy)
6. Competitor listing age and review velocity

## Scoring Criteria (1-10 each)

| Criterion | Weight | How to Score |
|---|---:|---|
| Gross Profit Potential | 25% | (Selling Price - Est. Landed Cost - Fees) × Volume |
| Procurement Ease | 20% | Supplier count, MOQ flexibility, sample availability |
| Entry Cost | 15% | First order cash requirement (lower = better) |
| Demand Volume | 15% | Monthly search volume, BSR, unit velocity |
| Competition Intensity | 15% | Review count, listing age, brand dominance (inverse) |
| Dropship Viability | 10% | Supplier ships direct, lightweight, low damage risk |

## Filters (Must Pass All)
- [ ] Estimated gross margin ≥ 35%
- [ ] Estimated gross profit per unit ≥ $8
- [ ] MOQ ≤ 100 units OR supplier offers dropship
- [ ] At least 3 suppliers found on Alibaba/1688
- [ ] No restricted category or gated brand
- [ ] Shipping weight ≤ 3 lbs (for lowest fulfillment cost)
- [ ] Return rate estimate ≤ 5%

## Output: Product Shortlist

| Rank | Product | Category | Est. Selling Price | Est. Landed Cost | Est. Gross Profit | Composite Score | Dropship Ready | Next Step |
|---:|---|---|---:|---:|---:|---:|---|---|
| 1 |  |  |  |  |  |  |  | Supplier outreach |
| 2 |  |  |  |  |  |  |  |  |
| 3 |  |  |  |  |  |  |  |  |

## Autonomous Actions
1. Run web searches for category trends and BSR data
2. Query Alibaba for supplier counts and MOQ ranges
3. Build economics model per candidate
4. Rank and filter to top 5-10 candidates
5. Proceed to Supplier Discovery phase

## Human Checkpoint
None required until procurement commitment.
