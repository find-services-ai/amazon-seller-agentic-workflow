# Dropship / Direct-from-Supplier Fulfillment SOP

## Model Overview
- **You:** Mediate sales, own listing, control margin, handle customer service
- **Supplier:** Holds inventory, ships direct to customer, follows your specs
- **Profit:** Selling Price - Supplier Cost - Per-Order Fee - Shipping - Amazon Fees = Your Margin

## Economics Template

| Component | Amount | Notes |
|---|---:|---|
| Selling Price | $29.99 |  |
| Amazon Referral Fee (15%) | -$4.50 |  |
| Supplier Unit Cost | -$8.00 |  |
| Supplier Fulfillment Fee | -$2.00 |  |
| Shipping to US Customer | -$4.00 |  |
| **Gross Profit** | **$11.49** | **38.3% margin** |
| PPC / Marketing (est.) | -$3.00 |  |
| Returns (est. 3%) | -$0.90 |  |
| **Contribution Margin** | **$7.59** | **25.3%** |

## Daily Order Workflow

### Autonomous Steps (No Human Needed)

```
[Amazon Order Received]
        ↓
[Extract: Customer Name, Address, Product, Qty]
        ↓
[Format order for supplier]
        ↓
[Send order to supplier via agreed channel (email/API/sheet)]
        ↓
[Supplier confirms receipt]
        ↓
[Supplier ships + provides tracking]
        ↓
[Update Amazon with tracking]
        ↓
[Monitor delivery status]
        ↓
[Order complete]
```

### Order Transmission Template

**To:** [Supplier Email]
**Subject:** Order #[Amazon Order ID] - Ship Direct

---

**Order Details:**
- Order ID: [Amazon Order ID]
- Order Date: [Date]
- Product: [SKU / Product Name]
- Quantity: [X]

**Ship To:**
```
[Customer Name]
[Address Line 1]
[Address Line 2]
[City, State ZIP]
United States
```

**Requirements:**
- Ship within 48 hours
- Use trackable shipping
- Reply with tracking number
- Neutral packaging (no supplier branding)

Thank you,
[Your System]

---

## Supplier Performance Tracking

| Metric | Target | Current | Status |
|---|---:|---:|---|
| Order Confirmation Rate | 100% | | |
| Ship Within 48hrs Rate | ≥95% | | |
| Tracking Provided Rate | 100% | | |
| On-Time Delivery Rate | ≥90% | | |
| Defect/Return Rate | ≤2% | | |
| Customer Complaint Rate | ≤1% | | |

## Exception Handling

### Supplier Doesn't Confirm Within 24 Hours
1. Send follow-up email
2. If no response in 48 hours, escalate to backup supplier
3. Log incident for supplier scorecard

### Tracking Not Provided
1. Request tracking immediately
2. If not provided in 24 hours, contact supplier by phone/WhatsApp
3. Update customer proactively if delay expected

### Customer Complaint (Quality/Damage)
1. Apologize and offer replacement or refund (autonomous for <$30 value)
2. Document issue with photos
3. Charge back to supplier per defect policy
4. If pattern emerges (>2% rate), escalate to renegotiation

### Delivery Delayed Beyond Promised Window
1. Proactively message customer with update
2. Offer partial refund or future discount if >7 days late
3. Log against supplier performance

## Inventory Sync (For Hybrid Model)

If supplier provides inventory levels:
- Sync daily to avoid overselling
- Set buffer (e.g., if supplier says 50 units, list 40)
- Auto-pause listing if stock <10 units

## Cost Optimization Levers

| Lever | Action |
|---|---|
| Negotiate lower unit cost | As volume grows, renegotiate pricing |
| Batch orders | If multiple orders/day, batch for lower shipping |
| Upgrade shipping tier | Negotiate better rates at volume |
| Switch supplier | If better option found, migrate |
| Move to FBA | When volume justifies bulk import |

## Margin Triggers to FBA/3PL

| Condition | Action |
|---|---|
| >100 orders/month on SKU | Evaluate FBA bulk import |
| Supplier ship cost >20% of selling price | Find US-based 3PL |
| Delivery time >14 days consistently | Require air ship or switch model |

## Human Checkpoints
- [ ] Approve any refund >$30
- [ ] Approve supplier payment (weekly/monthly settlement)
- [ ] Approve switching suppliers
- [ ] Approve FBA bulk order if triggered

## Autonomous Actions
1. Process daily orders and send to supplier
2. Track and update Amazon with shipment status
3. Monitor supplier performance metrics
4. Handle routine customer inquiries
5. Escalate to human only for money, supplier changes, or policy exceptions
