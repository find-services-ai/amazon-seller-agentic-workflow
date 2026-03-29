# Autonomous Negotiation Playbook

## Objective
Negotiate best landed cost, payment terms, quality guarantees, and dropship terms—automatically until human approval is needed for commitment.

## Target Economics
Before negotiating, calculate:
- Target selling price on Amazon: $[X]
- Amazon fees (referral + FBA or shipping): ~[Y]%
- Target gross margin: ≥35%
- Target contribution margin (post-ads): ≥18%
- **Maximum acceptable landed cost:** $[Z]

## Negotiation Levers (In Priority Order)

### 1. Unit Price
| Their Quote | Your Counter | Rationale |
|---:|---:|---|
| $10.00 | $8.50 | Start 15-20% below their ask |
| $9.00 | $8.00 | Meet in middle only if other terms improve |
| $8.50 | $8.00 | Final offer, walk away if no movement |

**Script:**
> "Based on my volume projections and competitive landed costs, I need to hit $[Target] per unit to make this work. Can you meet this price at [Quantity] units?"

### 2. MOQ Reduction
| Their MOQ | Your Target | Rationale |
|---:|---:|---|
| 500 | 100 | First order test; scale after proof |
| 200 | 50 | Dropship test batch |

**Script:**
> "I'd like to start with [Lower MOQ] units to test quality and market fit. Once I validate demand, I'll scale to [Higher Volume] monthly. Can you accommodate a smaller first order?"

### 3. Payment Terms
| Their Terms | Your Counter | Rationale |
|---|---|---|
| 100% upfront | 30% deposit, 70% before ship | Reduce cash exposure |
| 50/50 | 30/70 or Net 15 after delivery | Better cash flow |

**Script:**
> "For new supplier relationships, I typically start with 30% deposit and 70% before shipment. Once we establish trust over 2-3 orders, I'm open to discussing prepayment."

### 4. Shipping Terms
| Option | When to Push |
|---|---|
| FOB (you arrange freight) | Large volume, you have forwarder |
| DDP (supplier delivers) | Simplicity, include in landed cost |
| Dropship per-order | Low entry, test phase |

**Script:**
> "What's your best DDP price to [US Zip]? If you can handle shipping, I can commit to larger volumes faster."

### 5. Quality and Returns
| Term | Target |
|---|---|
| Defect allowance | ≤2% accepted, refund/replace above |
| Inspection | Pre-ship photos or third-party QC |
| Returns | Supplier covers defective returns |

**Script:**
> "What's your defect rate policy? I need assurance that if defect rate exceeds 2%, you'll cover replacement or refund."

### 6. Dropship Terms
| Term | Target |
|---|---|
| Per-order fulfillment fee | ≤$3 |
| Shipping speed to US | ≤10 days |
| Branding/packaging | Neutral or custom |
| Tracking | Provided per order |

**Script:**
> "I want to test dropship before committing to bulk inventory. Can you ship individual orders to US customers with tracking? What's the per-order fee?"

## Negotiation Flow (Autonomous)

```
[Initial Quote Received]
        ↓
[Calculate vs Target Landed Cost]
        ↓
[If gap > 15%] → Counter-offer email
        ↓
[If gap 5-15%] → Negotiate secondary terms (MOQ, payment, shipping)
        ↓
[If gap < 5%] → Request final best offer
        ↓
[Supplier responds]
        ↓
[Update comparison matrix]
        ↓
[If acceptable terms] → Draft term sheet for human approval
        ↓
[HUMAN CHECKPOINT: Approve terms before commitment]
```

## Negotiated Term Sheet Template

| Term | Agreed Value |
|---|---|
| Supplier |  |
| Product |  |
| Unit Price |  |
| MOQ |  |
| Lead Time |  |
| Shipping Method |  |
| Shipping Cost to US |  |
| Dropship Fee (if applicable) |  |
| Payment Terms |  |
| Defect Policy |  |
| Sample Order (qty/cost) |  |
| **Total Landed Cost Per Unit** |  |
| **Estimated Gross Margin** |  |

## Human Approval Required
- [ ] Approve term sheet
- [ ] Authorize sample payment
- [ ] Authorize bulk order payment
- [ ] Sign supplier agreement (if any)

## Autonomous Actions
1. Calculate target landed cost from selling price and margin goals
2. Send counter-offers based on playbook
3. Track all negotiations in matrix
4. Escalate to human when terms are acceptable or impasse reached
5. Never commit money without explicit human approval
