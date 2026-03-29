---
name: product-validation
description: "Use when validating a product opportunity before committing budget. Runs market research, competition analysis, pricing strategy, and demand verification with fact-checking loops until confidence threshold met."
---
# Product Validation System

Validates product opportunities through multi-phase research before committing capital.

## Validation Phases

```
[Product Candidate]
        ↓
[Phase 1: Demand Validation] → Fail? → Next candidate
        ↓ Pass
[Phase 2: Competition Analysis] → Too crowded? → Next candidate
        ↓ Pass
[Phase 3: Pricing Viability] → Margin too thin? → Next candidate
        ↓ Pass
[Phase 4: Supply Chain Check] → No good supplier? → Next candidate
        ↓ Pass
[Phase 5: Risk Assessment] → Risk too high? → Next candidate
        ↓ Pass
✅ VALIDATED WINNER
```

## Phase 1: Demand Validation

**Data Sources:**
- Amazon Best Sellers Rank (BSR) and velocity
- Amazon search volume estimates
- Google Trends (12-month trajectory)
- Seasonal patterns
- Review velocity on top listings

**Pass Criteria:**
- [ ] BSR < 10,000 in main category OR BSR < 1,000 in subcategory
- [ ] Search volume > 10,000 monthly (estimated)
- [ ] Google Trends stable or growing (not declining)
- [ ] Not purely seasonal (or we're in-season)
- [ ] Review velocity on competitors > 50/month (indicates demand)

**Kill Criteria:**
- BSR > 50,000 (low demand)
- Google Trends declining > 20% YoY
- Category is seasonal and we're out of season
- Total reviews on top 10 listings < 1,000 (immature market)

## Phase 2: Competition Analysis

**Data Sources:**
- Top 10 listings in search results
- Review counts and ratings
- Listing age
- Brand presence (big brands vs. generic)
- Price distribution
- Listing quality scores

**Pass Criteria:**
- [ ] At least 3 listings in top 10 have < 500 reviews
- [ ] No dominant brand with > 50% market share signals
- [ ] Average listing age < 3 years
- [ ] Opportunity for differentiation exists
- [ ] Not gated category / no IP barriers

**Kill Criteria:**
- Top 5 all have > 5,000 reviews (too entrenched)
- Single brand dominates (Amazon Basics, major brand)
- Patent/trademark risks identified
- Category requires certifications we can't get

## Phase 3: Pricing Viability

**Calculate:**
```
Target Selling Price = Competitor median price × 0.95
Amazon Referral Fee = Selling Price × 15%
FBA Fee (if applicable) = Based on size/weight tier
Maximum Acceptable Landed Cost = Selling Price - Referral Fee - FBA Fee - Target Profit

Target Profit = Selling Price × 25% minimum
```

**Pass Criteria:**
- [ ] Landed cost achievable at < 40% of selling price
- [ ] Gross margin ≥ 35%
- [ ] Contribution margin (post-ads) ≥ 18%
- [ ] Price point sustainable ($12-50 sweet spot)
- [ ] Room for 20% price drop if needed

**Kill Criteria:**
- Landed cost > 50% of selling price
- Gross margin < 30%
- Price point < $10 (fee-squeezed) or > $75 (conversion risk)
- Race-to-bottom pricing pattern visible

## Phase 4: Supply Chain Check

**Verify:**
- [ ] At least 3 suppliers found with target price
- [ ] MOQ within budget (first order < 30% of total budget)
- [ ] Lead time acceptable (< 30 days)
- [ ] Dropship or low-MOQ option exists
- [ ] Quality verifiable (samples, audits, reviews)

**Kill Criteria:**
- No supplier meets target landed cost
- Minimum viable order > 50% of budget
- Lead time > 45 days
- Single-source dependency (only 1 supplier)

## Phase 5: Risk Assessment

**Risk Factors (score 1-5 each):**

| Risk | Score | Weight |
|---|---|---|
| Demand volatility | | 20% |
| Competition intensity | | 20% |
| Margin pressure | | 20% |
| Supply chain reliability | | 15% |
| Compliance/regulatory | | 10% |
| Return rate expectation | | 10% |
| Seasonality | | 5% |

**Weighted Risk Score = Σ(score × weight)**

**Pass:** Risk score < 3.0
**Kill:** Risk score > 4.0
**Review:** Risk score 3.0-4.0 (needs mitigation plan)

## Fact-Check Loop

After each phase, verify data:
1. Cross-reference 2+ data sources
2. Check data freshness (< 30 days old)
3. Validate assumptions with real listings
4. Re-run if confidence < 80%

## Output: Product Validation Scorecard

| Dimension | Score | Confidence | Pass/Fail |
|---|---|---|---|
| Demand | /10 | % | |
| Competition | /10 | % | |
| Pricing | /10 | % | |
| Supply Chain | /10 | % | |
| Risk | /10 | % | |
| **OVERALL** | /50 | % | |

**Threshold:** Score ≥ 35/50 with confidence ≥ 75% = VALIDATED WINNER

## Budget Allocation ($500-1000)

Once validated, allocate budget:

| Phase | % of Budget | $500 Budget | $1000 Budget |
|---|---|---|---|
| Samples | 10% | $50 | $100 |
| First inventory | 50% | $250 | $500 |
| Shipping/duties | 20% | $100 | $200 |
| PPC seed | 15% | $75 | $150 |
| Reserve | 5% | $25 | $50 |

## Assets
- templates/product-validation-scorecard.md
- templates/competition-analysis-matrix.md
- templates/pricing-calculator.md
- templates/risk-assessment-matrix.md
