// [BSL] — AgentOS Amazon Seller Pack adapter
// Exposes the AgentOS pack REST interface on top of existing phase pipeline.
import express from 'express'
import { runPhase } from './phases.js'
import { isConfigured, getProviderInfo } from './llm.js'
import {
  generateOutreachEmail,
  generateCounterOffer,
  generateListingContent,
} from './operations.js'
import { incrementAgentRuns, enforceAgentRunLimit, getPlanForSeller } from './billing.js'

const router = express.Router()

// ─── Pack manifest ────────────────────────────────────────────

const MANIFEST = {
  pack_id: 'amazon-seller',
  name: 'Amazon Seller Pack',
  version: '1.0.0',
  description: 'Autonomous Amazon FBA product research, validation, supplier outreach, and listing generation.',
  billing_unit: 'agent_run',
  tier_required: 'STARTER',
  transport: 'rest',
  agents: ['demand-researcher', 'competition-analyst', 'pricing-strategist', 'supply-chain-analyst', 'risk-assessor'],
  keywords: ['amazon', 'fba', 'asin', 'seller', 'listing', 'supplier', 'bsr', 'product research', 'sourcing'],
  license: 'BSL-1.1',
}

router.get('/manifest', (_req, res) => res.json(MANIFEST))

// ─── Health ─────────────────────────────────────────────────
// Note: also exported for top-level /health mount in server.js

export function healthResponse() {
  const info = getProviderInfo()
  return {
    status: info.configured ? 'ok' : 'degraded',
    pack_id: 'amazon-seller',
    llm: info.configured ? `${info.provider}/${info.model}` : 'not configured',
    timestamp: new Date().toISOString(),
  }
}

router.get('/health', (_req, res) => res.json(healthResponse()))

// ─── Goal → phase mapping ───────────────────────────────────────

const PHASE_KEYWORDS = {
  demand: ['demand', 'market size', 'sales volume', 'bsr'],
  competition: ['competition', 'competitor', 'rival', 'listings'],
  pricing: ['pricing', 'price', 'margin', 'profit'],
  'supply-chain': ['supplier', 'sourcing', 'supply chain', 'manufacturer', 'alibaba'],
  risk: ['risk', 'downside', 'hazard'],
}

function detectPhase(goal) {
  const lower = goal.toLowerCase()
  for (const [phase, keywords] of Object.entries(PHASE_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) return phase
  }
  return null // null → run full validation
}

// ─── /pack/run ─────────────────────────────────────────────

router.post('/run', async (req, res) => {
  const { goal, context = {} } = req.body
  if (!goal) return res.status(400).json({ error: 'goal is required' })
  if (!isConfigured()) {
    return res.status(503).json({ error: 'LLM not configured', pack_id: 'amazon-seller' })
  }

  // Extract product name from goal if not in context
  const product = context.product || goal
  const orgId = context.org_id || null

  try {
    const phase = detectPhase(goal)

    // Specific operation shortcuts: email / listing / counter-offer
    if (/outreach email|supplier email/i.test(goal)) {
      const result = await generateOutreachEmail({ product, supplier: context.supplier || {}, emailType: 'initial', context })
      return res.json({ output: result, pack_id: 'amazon-seller', operation: 'outreach-email', org_id: orgId })
    }
    if (/counter.?offer|negotiat/i.test(goal)) {
      const result = await generateCounterOffer({ product, supplier: context.supplier || {}, theirOffer: context.theirOffer || {}, targetLandedCost: context.targetLandedCost || 3, budget: context.budget || 500, round: context.round || 1 })
      return res.json({ output: result, pack_id: 'amazon-seller', operation: 'counter-offer', org_id: orgId })
    }
    if (/listing|title|bullet/i.test(goal)) {
      const result = await generateListingContent({ product, category: context.category, pricePoint: context.pricePoint, features: context.features, keywords: context.keywords })
      return res.json({ output: result, pack_id: 'amazon-seller', operation: 'listing', org_id: orgId })
    }

    // Single phase or full validation
    if (phase) {
      const result = await runPhase(phase, { product, department: context.department, budget: context.budget || 500, targetMargin: context.targetMargin || 35, previousResults: context.dep_context || {} })
      return res.json({ output: result, pack_id: 'amazon-seller', operation: `phase:${phase}`, org_id: orgId })
    }

    // Full 5-phase validation
    const phaseIds = ['demand', 'competition', 'pricing', 'supply-chain', 'risk']
    const results = {}
    for (const phaseId of phaseIds) {
      results[phaseId] = await runPhase(phaseId, { product, department: context.department, budget: context.budget || 500, targetMargin: context.targetMargin || 35, previousResults: results })
    }
    const totalScore = Object.values(results).reduce((sum, r) => sum + (r.score || 0), 0)
    const verdict = totalScore >= 35 ? 'PASS' : totalScore >= 25 ? 'REVIEW' : 'FAIL'
    return res.json({
      output: { product, phases: results, totalScore, verdict },
      pack_id: 'amazon-seller',
      operation: 'full-validation',
      org_id: orgId,
    })
  } catch (err) {
    console.error('[Pack /run] Error:', err.message)
    return res.status(500).json({ error: err.message, pack_id: 'amazon-seller' })
  }
})

// ─── /pack/billing/consume ─────────────────────────────────
// Called by the AgentOS core to record usage; decoupled from the HTTP request.

router.post('/billing/consume', async (req, res) => {
  const { org_id, seller_id, units = 1, unit_type = 'agent_run', tokens_used = 0 } = req.body
  const id = seller_id || org_id
  if (!id) return res.status(400).json({ error: 'seller_id or org_id required' })
  try {
    incrementAgentRuns(id, tokens_used)
    res.json({ recorded: true, units, unit_type, seller_id: id })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
