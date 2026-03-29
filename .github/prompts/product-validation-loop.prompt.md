---
mode: "agent"
description: "Run complete product validation loop with market research, competition analysis, and pricing strategy. Self-inferencing fact-check until confidence threshold met. Finds best product winner within budget for maximum margin."
argument-hint: "Provide product candidate(s), budget ($500-1000), and target margin (e.g., 35%+)."
agents: [Market Research Agent, Competition Analysis Agent, Pricing Strategy Agent]
---
Use Amazon Seller Operator mode with specialized research agents.

## Objective
Validate product opportunities through rigorous multi-phase analysis until we find a proven winner that maximizes margin within budget constraints.

## Validation Loop

```
START
   ↓
[Product Candidate Pool]
   ↓
┌─────────────────────────────────────────┐
│ VALIDATION LOOP (for each candidate)    │
│                                         │
│ 1. Market Research Agent → Demand Score │
│    - If score < 6/10 → REJECT           │
│    - If confidence < 70% → Gather more  │
│                                         │
│ 2. Competition Agent → Competition Score│
│    - If score < 5/10 → REJECT           │
│    - If confidence < 70% → Gather more  │
│                                         │
│ 3. Pricing Agent → Pricing Score        │
│    - If margin < 35% → REJECT           │
│    - If confidence < 70% → Gather more  │
│                                         │
│ 4. Supply Chain Check → Supplier Score  │
│    - If no viable supplier → REJECT     │
│                                         │
│ 5. Risk Assessment → Risk Score         │
│    - If risk > 4/5 → REJECT             │
│                                         │
│ FACT-CHECK LOOP:                        │
│ - Cross-reference all data              │
│ - If discrepancy found → Re-research    │
│ - Until confidence ≥ 75%                │
│                                         │
└─────────────────────────────────────────┘
   ↓
[Rank validated candidates by profit potential]
   ↓
[Select WINNER with highest score]
   ↓
[Allocate budget for maximum margin]
   ↓
END → Ready for supplier outreach
```

## Inputs Required
1. **Product candidates** (1-5 products to evaluate)
   - Or "find opportunities" to discover from scratch
2. **Budget:** $500-1000 total
3. **Target margin:** Minimum gross margin %
4. **Risk tolerance:** Low/Medium/High

## Validation Phases

### Phase 1: Market Research (via Market Research Agent)
Gather:
- Amazon BSR and sales velocity
- Search volume estimates
- Google Trends trajectory
- Seasonal patterns
- Review velocity

Score: /10 | Minimum to pass: 6/10

### Phase 2: Competition Analysis (via Competition Analysis Agent)
Gather:
- Top 10 listing audit
- Review depth distribution
- Brand concentration
- Entry barriers
- Differentiation opportunities

Score: /10 | Minimum to pass: 5/10

### Phase 3: Pricing Strategy (via Pricing Strategy Agent)
Calculate:
- Optimal price point
- All fee components
- Landed cost scenarios
- Margin projections
- Break-even analysis

Pass: Gross margin ≥ 35%, Contribution margin ≥ 18%

### Phase 4: Supply Chain Verification
Check:
- Supplier availability at target cost
- MOQ within budget
- Dropship viability
- Quality verification path

Pass: At least 2 suppliers meet criteria

### Phase 5: Risk Assessment
Score:
- Demand volatility
- Competition intensity
- Margin pressure
- Supply chain risk
- Compliance risk

Pass: Weighted risk score < 3.5/5

## Fact-Check Protocol

After each phase:
1. List all data points collected
2. Identify sources for each
3. Cross-reference with second source
4. Flag any discrepancies > 20%
5. Re-research flagged items
6. Calculate confidence score
7. If confidence < 75%, repeat phase

## Output Format

### VALIDATION REPORT

```
===========================================
PRODUCT VALIDATION COMPLETE
===========================================
Date: [Date]
Budget: $[X]
Products Evaluated: [X]

WINNER: [Product Name]
Total Score: [X]/50
Confidence: [X]%

SCORECARD SUMMARY:
| Phase | Score | Confidence | Status |
|-------|-------|------------|--------|
| Demand | /10 | % | ✅/❌ |
| Competition | /10 | % | ✅/❌ |
| Pricing | /10 | % | ✅/❌ |
| Supply Chain | /10 | % | ✅/❌ |
| Risk | /10 | % | ✅/❌ |

KEY METRICS:
- Estimated monthly demand: [X] units
- Target selling price: $[X]
- Target landed cost: $[X]
- Projected gross margin: [X]%
- Projected contribution margin: [X]%
- First order investment: $[X]
- Expected ROI (90 days): [X]%

BUDGET ALLOCATION:
| Category | Amount |
|----------|--------|
| Samples | $[X] |
| Inventory | $[X] |
| Shipping | $[X] |
| PPC | $[X] |
| Reserve | $[X] |

REJECTED CANDIDATES:
1. [Product] - Reason: [X]
2. [Product] - Reason: [X]

NEXT STEPS:
1. [Action]
2. [Action]
3. [Action]

HUMAN CHECKPOINT: Approve winner before supplier outreach
===========================================
```

## Rules
- Never skip a validation phase
- Never proceed with confidence < 70%
- Re-run fact-check if data is > 7 days old
- Document all assumptions
- Present multiple candidates if close scores
- Human approval required before budget commitment
