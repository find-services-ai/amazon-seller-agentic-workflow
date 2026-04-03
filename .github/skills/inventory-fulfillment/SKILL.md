---
name: inventory-fulfillment
description: "Use when managing Amazon inventory, forecasting demand, calculating reorder points, managing FBA shipments, and optimizing storage costs. Covers replenishment planning, stranded inventory recovery, and aged inventory liquidation."
---
# Inventory & Fulfillment Skill

## Purpose
Minimize stockouts and overstock while maximizing inventory turnover and minimizing FBA storage fees.

## Inventory Planning

### Demand Forecasting
- Use trailing 30/60/90-day sales velocity
- Apply seasonal multipliers from year-over-year data
- Factor in planned promotions and PPC scaling
- Buffer: add 15% safety stock for new products, 10% for established

### Reorder Point Formula
```
Reorder Point = (Daily Sales × Lead Time Days) + Safety Stock

# Statistical formula (use when ≥90 days sales history):
Safety Stock = z × σ_d × √L
  z = service level z-score (1.65 for 95%, 1.28 for 90%)
  σ_d = standard deviation of daily demand
  L = lead time in days

# Simplified fallback (use for new products with <90 days data):
Safety Stock = Daily Sales × Lead Time Variance Days × 1.5
```

### Order Quantity
- First order: 50-100 units (test market response)
- Second order: 2-4 weeks of cover based on actual velocity
- Mature: 4-6 weeks of cover, order when hitting reorder point

## FBA Management

### Shipment Planning
- Create shipments 3 days before inventory hits reorder point
- Prefer sea freight for orders >500 units (60-70% cheaper)
- Use air freight only for emergency restocks (<100 units)
- Always ship to single fulfillment center when cost-effective (note: Amazon charges an Inventory Placement Service fee for this — compare against the cost/complexity of split shipments to decide)

### Storage Cost Optimization
- Monthly storage (2025 standard-size rates, verify annually):
  - Jan-Sep: ~$0.78/cubic ft
  - Oct-Dec (peak): ~$2.40/cubic ft
  - **Note:** Amazon updates storage fees annually. Always verify current rates at Seller Central → FBA Fee Schedule before planning.
- Aged inventory surcharge: extra fees starting at 181+ days, increasing at 271+ and 365+ days
- Target: sell through inventory within 90 days
- Liquidate or remove aged inventory before 181-day surcharge
- Low-inventory-level fee: Amazon may charge if inventory levels are too low relative to demand — balance between overstocking and understocking

### Stranded Inventory
- Check for stranded inventory weekly (no active listing)
- Common causes: listing suppressed, ASIN merge, hazmat flag
- Fix within 7 days to avoid long-term storage fees

## Metrics & Alerts

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Days of Supply | 30-45 | <14 days = urgent restock |
| Inventory Turnover | 6-8x/year | <4x = slow mover |
| Stockout Rate | <5% | >10% = fix supply chain |
| Sell-through Rate | >20%/month | <10% = consider liquidation |
| Storage Cost % | <3% of revenue | >5% = reduce inventory |

## Guardrails
- Never hold >$1,500 inventory per SKU (per margin guardrails)
- Never order >60 days of supply for unproven products
- Always have backup supplier identified before scaling
- Remove inventory before long-term storage fee deadline
