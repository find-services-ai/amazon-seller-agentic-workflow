---
name: buyer-storefront
description: "Use when building or managing the buyer-facing storefront, handling orders, setting up seller stores, managing listings across channels (Amazon + direct), and designing the purchase experience."
---

# Buyer Storefront Skill

## Overview

Every seller on the platform gets a hosted storefront where buyers can browse and purchase directly. Products are simultaneously listed on Amazon and the seller's own store, creating a dual-channel revenue stream.

## Architecture

```
Seller Dashboard → Create Listing → Choose Channel(s)
                                         ├── Amazon (via Seller Central)
                                         └── Storefront (hosted, /store/:slug)

Buyer → Browse Store → Product Page → Checkout → Order → Fulfillment
```

## Storefront URL Structure

- Store home: `/store/:sellerSlug`
- Product page: `/store/:sellerSlug/product/:productSlug`
- Cart: `/store/:sellerSlug/cart`
- Checkout: `/store/:sellerSlug/checkout`
- Order status: `/store/:sellerSlug/order/:orderNumber`

## Listing Channels

| Channel | How Listed | Fulfillment | Fee Structure |
|---------|-----------|-------------|---------------|
| Amazon | Via Seller Central API or manual | FBA or FBM | 15% referral + FBA fees |
| Storefront | Via platform dashboard | Seller ships direct | 0% (platform free tier) |
| Both | Dual-listed automatically | Mixed | Varies by channel |

## Data Model Usage

### Seller Setup
```
sellers.store_name → Display name
sellers.store_slug → URL path  
sellers.bio → About the seller
sellers.logo_url → Brand image
sellers.settings → { theme, currency, shippingPolicy, returnPolicy }
```

### Listing ↔ Channel
```
listings.channel = 'amazon' | 'storefront' | 'both'
listings.status = 'draft' | 'active' | 'paused' | 'suppressed'
```

### Order Flow
```
Order placed → status: 'pending'
Payment confirmed → status: 'confirmed'  
Shipped → status: 'shipped' (tracking_number set)
Delivered → status: 'delivered'
```

## API Endpoints

### Public (no auth)
- `GET /api/store/public/:storeSlug` — Store info + active listings

### Seller (auth required)
- `GET /api/store/profile` — Get/create seller profile
- `PATCH /api/store/profile` — Update store branding
- `GET /api/store/listings` — Manage listings
- `POST /api/store/listings` — Create listing
- `PATCH /api/store/listings/:id` — Update listing
- `GET /api/store/orders` — View orders

### Buyer
- `POST /api/store/orders` — Place an order (email required, no account needed)

## Checkout Flow (V1 — Manual)

1. Buyer selects product + quantity
2. Enters email + shipping address
3. Order created with status `pending`
4. Seller receives notification (email/Slack)
5. Seller confirms and arranges payment off-platform
6. Seller ships and enters tracking number
7. Buyer checks order status via order number

## V2 Roadmap (Stripe Integration)
- Add Stripe Connect for seller payouts
- Card payment at checkout
- Automatic payment splitting (platform fee)
- Refund handling

## Design Guidelines

### Product Page Must Have
- Hero image (minimum 500px wide)
- Clear price with currency
- "Add to Cart" button (primary CTA, 44px+ height)
- Product description (expandable for detail)
- Shipping info
- Seller trust badge

### Checkout Must Have  
- Email field (required)
- Shipping address (required)
- Order summary (items, quantities, total)
- Clear "Place Order" button
- No forced account creation

## Metrics to Track
- Storefront visits per seller
- Conversion rate (visits → orders)
- Average order value
- Channel split (Amazon vs storefront)
- Return rate by channel
