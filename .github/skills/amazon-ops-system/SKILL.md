---
name: amazon-ops-system
description: "Use when building or operating an Amazon seller system for highest gross profit, low inventory risk, easy procurement, low entry cost testing, category scaling, and efficient supply chain workflows with investor KPI reporting."
---
# Amazon Ops System

This skill creates repeatable operating artifacts for running Amazon seller growth as CTO + Product Lead under investor KPI accountability.

## Use Cases
- Weekly investor KPI reviews
- SKU gross profit leak diagnosis
- Product selection and category expansion scoring
- Replenishment and supply chain cost-down workflows
- SOP and tracker generation for repeatable execution

## Workflow
1. Collect inputs
- SKU and category performance data
- Landed cost and supply chain details
- Ad and conversion metrics
- Inventory and lead time profile

2. Diagnose and prioritize
- Rank products by gross profit pool and capital efficiency
- Identify top margin and cost leakage points
- Segment portfolio into Keep, Fix, Scale, Exit

3. Build execution artifacts
- Investor KPI dashboard spec
- 7-day and 30-90 day action plans
- Supply chain cost-down roadmap
- Human approval checkpoints for money-impacting steps

4. Run weekly cadence
- Compare current KPI vs target
- Track variance, owners, blockers
- Decide continue, adjust, or kill by defined criteria

## Assets
Use the templates in this folder:

### Investor Reporting
- templates/investor-kpi-dashboard-template.md
- templates/product-bet-scorecard-template.md
- templates/supply-chain-costdown-plan-template.md

### Autonomous Workflows
- templates/product-selection-automation.md (Phase 1: Find products)
- templates/supplier-outreach-email-templates.md (Phase 2-3: Discover and contact suppliers)
- templates/negotiation-playbook.md (Phase 4: Negotiate terms autonomously)
- templates/supplier-ai-listing-prompt.md (Phase 6: Enable supplier to create listing content)
- templates/dropship-fulfillment-sop.md (Ongoing: Direct-from-supplier operations)

## Autonomous Execution Model

```
[Product Selection] → [Supplier Discovery] → [Outreach] → [Negotiation]
        ↓ autonomous            ↓ autonomous      ↓ autonomous    ↓ autonomous until terms
                                                                          ↓
                                                            [HUMAN: Approve Terms]
                                                                          ↓
[Procurement Prep] → [HUMAN: Approve Payment] → [Supplier Listing] → [Launch]
        ↓ autonomous                                    ↓ autonomous        ↓ autonomous until ads
                                                                          ↓
[Daily Fulfillment] ← [HUMAN: Approve Ad Budget]
        ↓ autonomous (orders, tracking, customer service)
        ↓
[HUMAN: Weekly payment settlement to supplier]
```

## Constraints
- No direct money transaction execution.
- No unapproved spend, order finalization, or contractual commitment.
- Any financial exposure change requires human approval.
- Supplier contracts require human signature.
- PPC budget activation requires human approval.
