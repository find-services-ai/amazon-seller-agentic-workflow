import { callLLM } from './llm.js'
import { loadAgentPrompt, loadSkillContext, getPhaseSkills, getPhaseMaxTokens } from './agents.js'
import { getRelevantContext, storeResearch } from './vectorStore.js'

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

Evaluate using a 10-factor competitive analysis framework:

1. **Review Barrier** — Top-10 median reviews and monthly review velocity
   - PASS: median ≤300 reviews AND ≤30 new/month
   - FAIL: >800 reviews OR >80/month

2. **Revenue Concentration** — Do top 3 ASINs capture most revenue?
   - PASS: top 3 ≤45% of niche revenue; FAIL: >65%

3. **Brand Concentration** — Do top 3 brands dominate?
   - PASS: top 3 brands ≤55% of revenue; FAIL: >75%; check Amazon Basics

4. **Listing Quality Gap** — How many top-10 listings are weak (missing 7+ images, A+, video, or rating <4.3)?
   - PASS: ≥4 of top 10 have quality gaps

5. **Price-Band Viability** — Median price, discount behavior
   - PASS: $18-$60 median, no race-to-bottom; FAIL: <$15 with heavy discounting

6. **BSR Stability** — 60-90 day BSR trend across top sellers
   - PASS: stable demand; FAIL: high volatility not tied to seasonality

7. **Ad Spend Intensity** — Sponsored results percentage on page 1
   - PASS: ≤25% sponsored; FAIL: >40% sponsored density

8. **Entry Barriers** — Gating, patents, certifications
   - PASS: no gating, no IP risks; FAIL: gated/restricted or IP conflict

9. **Differentiation Opportunity** — Common customer complaints, unmet needs
   - Analyze negative reviews for recurring pain points

10. **Supply-Side Replaceability** — Can competitors trivially copy differentiation?
    - PASS: defendable angle exists; FAIL: commodity with no differentiation path

Score each factor PASS (2), REVIEW (1), or FAIL (0). Report total out of 20.
Higher OVERALL score = easier entry. Convert to 1-10 scale for the main score.

DECISION RULES:
- PASS niche: ≥7 factors PASS, no FAIL on Entry Barriers, no dual concentration FAIL
- FAIL niche: ≤3 factors PASS, or any hard-barrier FAIL
- REVIEW: everything else`,

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

Evaluate supply chain feasibility with specifics:
1. Supplier availability — estimate how many suppliers exist on Alibaba/1688/Made-in-China AND domestic sources (ThomasNet, Wholesale Central)
2. MOQ — typical minimum order quantities, first-order size options for small sellers
3. Dropship viability — can suppliers ship individual orders to US customers? Cost per order?
4. Lead time — typical production + shipping to US (air: ~7-14 days, sea: ~30-45 days)
5. Quality verification — sample policies, third-party inspection (SGS/Bureau Veritas), trade assurance
6. First-order economics — can first order fit within ${Math.round(budget * 0.3)} (30% of $${budget} budget)?
7. Backup sourcing — are there enough alternatives to avoid single-source dependency?

Pass criteria: ≥3 suppliers at target cost, first order < 30% of $${budget} budget, lead time < 30 days, quality verification available.
Kill criteria: No supplier at target cost, first order > 50% of budget, single-source only, no quality checks possible.`,

    risk: `Assess overall risk for this Amazon US product opportunity.

Product: ${product}
Category: ${department || 'Not specified'}
Budget: $${budget}
Target Gross Margin: ≥${targetMargin}%

Previous phase results (use these as evidence — do NOT make up new data):
${JSON.stringify(previousResults || {}, null, 2)}

Score each risk factor 1-5 (1=low risk, 5=high risk) with evidence from prior phases:

| Factor | Weight | Score Guidance |
|--------|--------|---------------|
| Demand volatility | 20% | Use prior demand phase BSR stability, trend direction, seasonality data |
| Competition intensity | 20% | Use prior competition phase review barriers, brand concentration, ad intensity |
| Margin pressure | 20% | Use prior pricing phase margin analysis, price war resilience |
| Supply chain reliability | 15% | Use prior supply-chain phase supplier count, lead time variance, quality options |
| Compliance/regulatory | 10% | Category certifications, IP risks, Amazon gating status |
| Return rate expectation | 10% | Product complexity, fragility, sizing issues |
| Seasonality risk | 5% | Revenue concentration in peak months |

IMPORTANT calibration rules:
- Cross-reference your scores against prior phase scores. If demand phase scored 8/10 but you rate demand volatility at 4/5, explain the discrepancy.
- If all prior phases scored 7+, be MORE skeptical — check if anything was overlooked.
- Calculate weighted risk precisely: Σ(factor_score × weight)
- Convert to opportunity score: risk <2.5 → score 8-10, risk 2.5-3.0 → score 6-7, risk 3.0-3.5 → score 4-5, risk 3.5-4.0 → score 2-3, risk >4.0 → score 1

Kill triggers (immediate fail):
- Any single factor at 5 AND another at 4+
- Compliance/IP factor at 5
- Weighted risk > 4.0`
  }

  return prompts[phaseId] || ''
}

// ─── Build full system prompt with JSON output format ────────

function buildSystemPrompt(phaseId, agentPrompt) {
  // Load all phase-specific skills (not just product-validation)
  const skills = getPhaseSkills(phaseId)
  const skillBlocks = skills
    .map(name => {
      const content = loadSkillContext(name)
      if (!content) return ''
      // Primary skill gets more context, secondary skills get condensed
      const limit = name === skills[0] ? 2000 : 1000
      return `### ${name}\n${content.slice(0, limit)}`
    })
    .filter(Boolean)
    .join('\n\n')

  const phaseDetails = {
    demand: 'demand-specific data: bsrRange, estimatedSearchVolume, trendDirection, seasonality, reviewVelocity, topKeywords (array of {keyword, estMonthlyVolume}), marketMaturity',
    competition: 'competition-specific data: topCompetitors (array of {name, price, reviews, rating, quality}), avgReviewCount, reviewBarrier (median/velocity), revenueConcentrationTop3Pct, brandConcentrationTop3Pct, listingQualityGapCount, adSpendIntensityPct, entryBarriers, differentiationOpportunities',
    pricing: 'pricing-specific data: priceRange, medianPrice, recommendedPrice, referralFeePct (looked up for category), estimatedFbaFee, estimatedLandedCost (best/expected/worst), grossMarginPercent, contributionMarginPercent, breakEvenUnits, priceWarResilience',
    'supply-chain': 'supply-chain-specific data: estimatedSupplierCount, domesticSupplierCount, typicalMOQ, dropshipAvailable, estimatedLeadTimeDays (air/sea), qualityVerificationOptions, sampleCostRange, firstOrderBudgetPct',
    risk: 'risk-specific data: demandVolatility (score 1-5), competitionIntensity (1-5), marginPressure (1-5), supplyChainRisk (1-5), complianceRisk (1-5), returnRateRisk (1-5), seasonalityRisk (1-5), weightedRiskScore, killTriggered (boolean), topRisks (array of {risk, mitigation})'
  }

  return `${agentPrompt}

${skillBlocks ? `\n## Domain Knowledge\n${skillBlocks}\n` : ''}

## CRITICAL: Output Format

You MUST respond with ONLY a valid JSON object. No markdown fences, no explanation outside JSON.

Required JSON structure:
{
  "score": <integer 1-10>,
  "confidence": <integer 50-100, how confident you are in this analysis — be HONEST, don't inflate>,
  "summary": "<2-3 sentence findings summary with SPECIFIC numbers and data points>",
  "details": {
    ${phaseDetails[phaseId] || '<4-6 specific data points as key-value pairs>'}
  },
  "dataSources": ["<list what informed your analysis, e.g. Amazon marketplace knowledge, category data, pricing models>"],
  "assumptions": ["<list 2-3 key assumptions you made — these will be fact-checked>"],
  "recommendation": "<one sentence: proceed to next phase / fail with reason / review with caveats>"
}

## Confidence Calibration Rules
- 90-100%: You have direct data or very strong category-specific knowledge
- 75-89%: Reasonable estimates based on similar products/categories
- 60-74%: Educated guesses with significant uncertainty
- 50-59%: Speculative — flag this clearly in summary`
}

// ─── Verification prompt — challenges the initial analysis ───

async function verifyAnalysis(phaseId, initialResult, params) {
  const verifyPrompt = `You are a skeptical reviewer auditing an Amazon product research analysis. Your job is to find errors, challenge optimistic assumptions, and calibrate confidence accurately.

Review this ${phaseId} analysis for "${params.product}":

Score: ${initialResult.score}/10
Confidence: ${initialResult.confidence}%
Summary: ${initialResult.summary}
Assumptions: ${JSON.stringify(initialResult.assumptions || [])}
Details: ${JSON.stringify(initialResult.details || {})}

Check for these issues:
1. Is the score justified by the evidence, or inflated/deflated?
2. Are the confidence levels honest? (Most LLM analyses should be 65-80%, rarely 90%+)
3. Are there assumptions stated as facts?
4. Is any data point suspicious or inconsistent with others?
5. Were important risk factors overlooked?

RESPOND WITH ONLY a valid JSON object:
{
  "adjustedScore": <integer 1-10, your corrected score — explain if different>,
  "adjustedConfidence": <integer 50-100, your corrected confidence — typically lower than initial>,
  "issues": ["<specific problems found>"],
  "overlooked": ["<risks or factors the analysis missed>"],
  "verdictChange": "<'confirmed' if analysis holds, 'downgraded' if too optimistic, 'upgraded' if too conservative>"
}`

  try {
    const verification = await callLLM(verifyPrompt, 'Verify the analysis above.', { maxTokens: 1500 })
    return verification
  } catch (e) {
    console.log(`[Phases] Verification skipped: ${e.message}`)
    return null
  }
}

// ─── Execute a single validation phase ───────────────────────

export async function runPhase(phaseId, params) {
  const agentPrompt = loadAgentPrompt(phaseId)
  if (!agentPrompt) {
    throw new Error(`No agent prompt found for phase: ${phaseId}. Check .github/agents/ directory.`)
  }

  // RAG: inject relevant past research into the system prompt
  let ragContext = ''
  try {
    ragContext = await getRelevantContext(
      { id: params.productId, name: params.product },
      phaseId
    )
  } catch (e) {
    console.log(`[Phases] RAG context skipped: ${e.message}`)
  }

  const systemPrompt = buildSystemPrompt(phaseId, agentPrompt) + (ragContext ? `\n\n${ragContext}` : '')
  const userMessage = buildUserPrompt(phaseId, params)
  const maxTokens = getPhaseMaxTokens(phaseId)

  const result = await callLLM(systemPrompt, userMessage, { maxTokens })

  // Run verification step — challenges the initial analysis
  const verification = await verifyAnalysis(phaseId, result, params)

  // Apply verification adjustments
  let finalScore = result.score || 5
  let finalConfidence = result.confidence || 70

  if (verification) {
    // If verifier found issues, use the adjusted values
    if (verification.verdictChange === 'downgraded') {
      finalScore = verification.adjustedScore ?? finalScore
      finalConfidence = verification.adjustedConfidence ?? finalConfidence
    } else if (verification.verdictChange === 'upgraded') {
      finalScore = verification.adjustedScore ?? finalScore
      finalConfidence = verification.adjustedConfidence ?? finalConfidence
    } else {
      // Confirmed — still apply confidence correction (LLMs overestimate)
      finalConfidence = Math.min(finalConfidence, verification.adjustedConfidence ?? finalConfidence)
    }
  }

  // Normalize and clamp values
  const score = Math.max(1, Math.min(10, Math.round(finalScore)))
  const confidence = Math.max(50, Math.min(100, Math.round(finalConfidence)))
  const minScore = MIN_SCORES[phaseId] || 6
  const status = score >= minScore ? 'passed'
    : score >= minScore - 1 ? 'review'
    : 'failed'

  const phaseResult = {
    score,
    confidence,
    status,
    summary: result.summary || 'Analysis complete.',
    details: result.details || {},
    dataSources: result.dataSources || ['LLM analysis'],
    assumptions: result.assumptions || [],
    recommendation: result.recommendation || '',
    phaseId,
    verification: verification ? {
      verdict: verification.verdictChange,
      issues: verification.issues || [],
      overlooked: verification.overlooked || []
    } : null
  }

  // Store result in vector store for future RAG (fire-and-forget)
  if (params.productId) {
    storeResearch(params.productId, phaseId, phaseResult).catch(e =>
      console.log(`[Phases] Vector store skipped: ${e.message}`)
    )
  }

  return phaseResult
}
