---
mode: "agent"
description: "Autonomously launch a new Amazon product from scratch: product selection, supplier outreach, negotiation, procurement prep, listing creation, and go-live. Stops only for human approval on money transactions."
argument-hint: "Provide target category, budget constraints, margin targets, and any product preferences."
---
Use Amazon Seller Operator mode. Execute the full autonomous product launch workflow.

## Your Mission
Take a new product from idea to live listing with supplier-direct fulfillment, stopping only when payment authorization is required.

## Inputs Needed
1. Target category or product type (or "find best opportunity")
2. Maximum first-order budget: $[X]
3. Target gross margin: ≥[Y]%
4. Preferred fulfillment: Dropship / Direct-from-supplier / FBA bulk
5. Timeline: Launch within [Z] weeks

## Execution Phases

### Phase 1: Product Selection (Autonomous)
- Scan Amazon Best Sellers, Movers & Shakers, Alibaba trending
- Score candidates: gross profit, procurement ease, entry cost, volume, scalability
- Filter for dropship viability and margin targets
- Output: Top 5 product candidates with economics

### Phase 2: Supplier Discovery (Autonomous)
- Search Alibaba, 1688, domestic wholesalers
- Filter by MOQ, dropship capability, response rate
- Score and shortlist suppliers per product
- Output: Supplier capability matrix

### Phase 3: Supplier Outreach (Autonomous)
- Send initial inquiry emails to top suppliers
- Track responses, follow up automatically
- Build quote comparison matrix
- Output: Best quotes for top products

### Phase 4: Negotiation (Autonomous Until Commitment)
- Counter-offer based on target landed cost
- Negotiate: price, MOQ, payment terms, shipping, quality policy
- When acceptable terms reached, draft term sheet
- Output: Negotiated term sheet for human approval

### Phase 5: Procurement Prep (Autonomous Until Payment)
- Calculate optimal order quantity
- Draft purchase order with negotiated terms
- Select cheapest fulfillment option
- Output: PO draft + approval request

**>>> HUMAN CHECKPOINT: Approve payment <<<**

### Phase 6: Supplier Listing Enablement (Autonomous)
- Send supplier AI prompts for images and content
- Review submissions, request revisions
- Prepare listing in draft mode
- Output: Draft listing ready for review

### Phase 7: Launch (Autonomous Until Ad Spend)
- Publish listing
- Set up PPC campaign structure (budget requires approval)
- Monitor Day 1-7 metrics
- Output: Launch report + first week KPIs

**>>> HUMAN CHECKPOINT: Approve PPC budget <<<**

## Output at Each Phase
Provide:
1. What was done
2. Key data and decisions
3. What's next
4. Any human approvals needed

## Rules
- Never execute payments without human approval
- Never commit to contracts without human approval
- Always show economics before recommendations
- Optimize for highest gross profit at lowest entry cost

Begin execution now. Start with Phase 1 unless inputs specify otherwise.
