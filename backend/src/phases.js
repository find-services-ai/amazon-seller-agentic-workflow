import { callLLM } from './llm.js'
import { loadAgentPrompt, loadSkillContext } from './agents.js'

const MIN_SCORES = {
  demand: 6,
  competition: 5,
  pricing: 7,
  'supply-chain': 6,
  risk: 6
}

// ─── Phase-specific user prompts ─────────────────────────────

function buildUserPrompt(phaseId, params) {
  const { product, department, budget, targetMargin, previousResults } = params

  const prompts = {
    demand: `Validate demand for this Amazon US product opportunity.

Product: ${product}
Category: ${department || 'Not specified'}
Budget: $${budget}
Target Gross Margin: ≥${targetMargin}%

Analyze these demand signals with specific numbers and estimates:
1. Best Sellers Rank (BSR) — estimate range for top 10 competitors in this product type
2. Amazon search volume — estimate monthly searches for the 3 most relevant keywords
3. Google Trends — describe 12-month trajectory for this product type
4. Seasonality — year-round or seasonal? Peak months?
5. Review velocity — how fast are top competitors gaining reviews monthly?

Pass criteria: BSR < 10,000 in main category, search volume > 10,000/month, trends stable/growing.
Kill criteria: BSR > 50,000, trends declining > 20% YoY, purely seasonal and out-of-season.`,

    competition: `Analyze competition for this Amazon US product opportunity.

Product: ${product}
Category: ${department || 'Not specified'}

Provide specific competitive intelligence:
1. Top 10 listing audit — estimate typical prices, review counts, ratings, listing ages for top sellers
2. Brand landscape — name dominant brands, estimate market share, note Amazon Basics presence
3. Entry barriers — category gating status, patent/trademark risks, certifications needed
4. Differentiation opportunities — common customer complaints, missing features, bundle possibilities
5. Competitive intensity — average review depth, price range spread, ad intensity signals

Score HIGHER (closer to 10) when entry is EASIER. Score lower when competition is fierce.

Pass criteria: ≥3 of top 10 have <500 reviews, no single brand >50% share, clear differentiation path.
Kill criteria: Top 5 all >5,000 reviews, dominant brand, patent risks identified.`,

    pricing: `Validate pricing viability for this Amazon US product opportunity.

Product: ${product}
Category: ${department || 'Not specified'}
Budget: $${budget}
Target Gross Margin: ≥${targetMargin}%

Calculate with specific numbers:
1. Competitive price distribution — estimate price range for top 20 listings, median, mode cluster
2. Fee structure at recommended price — referral fee (typically 15%), estimated FBA fees, storage, return costs
3. Landed cost modeling — estimate product cost range from China suppliers (best/expected/worst case)
4. Margin analysis — calculate gross margin and contribution margin (assume 15-20% ad spend initially)
5. Break-even analysis — minimum profitable price, units needed per month
6. Price elasticity — room for promotional pricing, price war resilience

Pass criteria: Gross margin ≥ ${targetMargin}%, contribution margin ≥ 18%, price in $12-$50 range.
Kill criteria: Gross margin < 30%, landed cost > 50% of price, price < $10 or > $75.`,

    'supply-chain': `Assess supply chain viability for this Amazon US product opportunity.

Product: ${product}
Category: ${department || 'Not specified'}
Budget: $${budget}

Focus ONLY on supply chain feasibility with specifics:
1. Supplier availability — estimate how many suppliers on Alibaba/1688/Made-in-China offer this product type
2. MOQ — typical minimum order quantities, first-order size options
3. Dropship viability — can suppliers ship individual orders to US customers? Per-order cost?
4. Lead time — typical production lead time + shipping to US (air vs sea)
5. Quality verification — sample policies, inspection options, trade assurance availability

Pass criteria: ≥3 suppliers at target cost, first order < 30% of $${budget} budget, lead time < 30 days.
Kill criteria: No supplier at target cost, first order > 50% of budget, single-source only.`,

    risk: `Assess overall risk for this Amazon US product opportunity.

Product: ${product}
Category: ${department || 'Not specified'}
Budget: $${budget}
Target Gross Margin: ≥${targetMargin}%

Previous phase results:
${JSON.stringify(previousResults || {}, null, 2)}

Score each risk factor 1-5 (1=low risk, 5=high risk) with justification:
- Demand volatility (weight: 20%) — how stable is demand?
- Competition intensity (weight: 20%) — how fierce is the market?
- Margin pressure (weight: 20%) — how likely are margins to compress?
- Supply chain reliability (weight: 15%) — supplier risk, logistics disruption
- Compliance/regulatory (weight: 10%) — regulations, certifications, liability
- Return rate expectation (weight: 10%) — product-specific return risk
- Seasonality risk (weight: 5%) — revenue concentration in peak periods

Calculate weighted risk score. Convert to a 1-10 opportunity score where 10 = lowest risk.
Include the individual risk factor scores in details.

Pass: Weighted risk < 3.0 → score ≥ 7
Review: Risk 3.0-4.0 → score 4-6
Kill: Risk > 4.0 → score < 4`
  }

  return prompts[phaseId] || ''
}

// ─── Build full system prompt with JSON output format ────────

function buildSystemPrompt(phaseId, agentPrompt) {
  const validationSkill = loadSkillContext('product-validation')
  const skillExcerpt = validationSkill ? validationSkill.slice(0, 1500) : ''

  const phaseDetails = {
    demand: 'demand-specific data: bsrRange, estimatedSearchVolume, trendDirection, seasonality, reviewVelocity, topKeywords',
    competition: 'competition-specific data: topCompetitors (array), avgReviewCount, brandConcentration, entryBarriers, differentiationOpportunities',
    pricing: 'pricing-specific data: priceRange, medianPrice, recommendedPrice, estimatedLandedCost, grossMarginPercent, contributionMarginPercent, breakEvenUnits',
    'supply-chain': 'supply-chain-specific data: estimatedSupplierCount, typicalMOQ, dropshipAvailable, estimatedLeadTimeDays, qualityVerificationOptions',
    risk: 'risk-specific data: demandVolatility, competitionIntensity, marginPressure, supplyChainRisk, complianceRisk, returnRateRisk, seasonalityRisk, weightedRiskScore'
  }

  return `${agentPrompt}

${skillExcerpt ? `\n## Validation Framework\n${skillExcerpt}\n` : ''}
## CRITICAL: Output Format

You MUST respond with ONLY a valid JSON object. No markdown fences, no explanation outside JSON.

Required JSON structure:
{
  "score": <integer 1-10>,
  "confidence": <integer 50-100, how confident you are in this analysis>,
  "summary": "<2-3 sentence findings summary with SPECIFIC numbers and data points>",
  "details": {
    ${phaseDetails[phaseId] || '<4-6 specific data points as key-value pairs>'}
  },
  "dataSources": ["<list what informed your analysis, e.g. Amazon marketplace knowledge, category data, pricing models>"],
  "recommendation": "<one sentence: proceed to next phase / fail with reason / review with caveats>"
}`
}

// ─── Execute a single validation phase ───────────────────────

export async function runPhase(phaseId, params) {
  const agentPrompt = loadAgentPrompt(phaseId)
  if (!agentPrompt) {
    throw new Error(`No agent prompt found for phase: ${phaseId}. Check .github/agents/ directory.`)
  }

  const systemPrompt = buildSystemPrompt(phaseId, agentPrompt)
  const userMessage = buildUserPrompt(phaseId, params)

  const result = await callLLM(systemPrompt, userMessage)

  // Normalize and clamp values
  const score = Math.max(1, Math.min(10, Math.round(result.score || 5)))
  const confidence = Math.max(50, Math.min(100, Math.round(result.confidence || 70)))
  const minScore = MIN_SCORES[phaseId] || 6
  const status = score >= minScore ? 'passed'
    : score >= minScore - 1 ? 'review'
    : 'failed'

  return {
    score,
    confidence,
    status,
    summary: result.summary || 'Analysis complete.',
    details: result.details || {},
    dataSources: result.dataSources || ['LLM analysis'],
    recommendation: result.recommendation || '',
    phaseId
  }
}
