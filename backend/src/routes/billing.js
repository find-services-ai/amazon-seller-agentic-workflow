import { Router } from 'express'
import db from '../db.js'
import {
  getPlanForSeller,
  getCurrentPeriod,
  getUsage,
  requirePlan
} from '../billing.js'

const router = Router()

// ─── Plan & Usage ────────────────────────────────────────────

// Get current plan, usage, and limits
router.get('/plan', (req, res) => {
  const seller = db.prepare('SELECT * FROM sellers WHERE user_email = ?').get(req.user.email)
  if (!seller) return res.json({ plan: getPlanForSeller(req.user.email), usage: null })

  const plan = getPlanForSeller(req.user.email)
  const period = getCurrentPeriod()
  const usage = getUsage(seller.id, period)

  const activeProducts = db.prepare(
    "SELECT COUNT(*) as c FROM products p JOIN listings l ON l.product_id = p.id WHERE l.seller_id = ? AND p.status NOT IN ('discontinued','paused')"
  ).get(seller.id)?.c || 0

  res.json({
    plan,
    usage: {
      period,
      agentRunsUsed: usage.agent_runs_used,
      agentRunsLimit: plan.max_agent_runs_monthly,
      productsActive: activeProducts,
      productsLimit: plan.max_products,
      gmv: usage.gmv,
      revenueShareOwed: usage.revenue_share_owed,
      tokensConsumed: usage.tokens_consumed
    }
  })
})

// List all plans
router.get('/plans', (_req, res) => {
  const plans = db.prepare('SELECT * FROM plan_definitions ORDER BY price_monthly').all()
  plans.forEach(p => { p.features = safeJSON(p.features, []) })
  res.json({ plans })
})

// Upgrade plan (in production: integrate Stripe/payment gateway)
router.post('/upgrade', (req, res) => {
  const { planId } = req.body
  if (!planId) return res.status(400).json({ error: 'planId required' })

  const plan = db.prepare('SELECT * FROM plan_definitions WHERE id = ?').get(planId)
  if (!plan) return res.status(404).json({ error: 'Plan not found' })

  db.prepare('UPDATE sellers SET plan = ? WHERE user_email = ?').run(planId, req.user.email)
  const seller = db.prepare('SELECT * FROM sellers WHERE user_email = ?').get(req.user.email)

  res.json({
    message: `Upgraded to ${plan.name} plan`,
    seller: { id: seller.id, plan: seller.plan },
    note: 'Payment integration pending — revenue share model applies on GMV'
  })
})

// ─── Revenue Share Ledger ────────────────────────────────────

router.get('/revenue-share', (req, res) => {
  const seller = db.prepare('SELECT id FROM sellers WHERE user_email = ?').get(req.user.email)
  if (!seller) return res.json({ ledger: [], totals: {} })

  const { period } = req.query
  let sql = 'SELECT * FROM revenue_share_ledger WHERE seller_id = ?'
  const params = [seller.id]

  if (period) { sql += ' AND period = ?'; params.push(period) }
  sql += ' ORDER BY created_at DESC LIMIT 100'

  const ledger = db.prepare(sql).all(...params)

  const totals = db.prepare(`
    SELECT period, SUM(order_total) as total_gmv, SUM(platform_fee) as total_fees, COUNT(*) as order_count
    FROM revenue_share_ledger WHERE seller_id = ?
    GROUP BY period ORDER BY period DESC LIMIT 12
  `).all(seller.id)

  res.json({ ledger, totals })
})

// ─── Deal Scoring as a Service ───────────────────────────────

// Get scoring history
router.get('/deal-scores', (req, res) => {
  const seller = db.prepare('SELECT id FROM sellers WHERE user_email = ?').get(req.user.email)
  if (!seller) return res.json({ scores: [] })

  const scores = db.prepare(
    'SELECT * FROM deal_scores WHERE seller_id = ? ORDER BY created_at DESC LIMIT 50'
  ).all(seller.id)

  scores.forEach(s => { s.report = safeJSON(s.report, {}) })
  res.json({ scores })
})

// Submit ASIN/keyword for scoring (placeholder — LLM integration via ops)
router.post('/deal-scores', (req, res) => {
  const seller = db.prepare('SELECT id FROM sellers WHERE user_email = ?').get(req.user.email)
  if (!seller) return res.status(400).json({ error: 'Seller profile required' })

  const { asin, keyword } = req.body
  if (!asin && !keyword) return res.status(400).json({ error: 'asin or keyword required' })

  const result = db.prepare(`
    INSERT INTO deal_scores (seller_id, asin, keyword, input_data)
    VALUES (?, ?, ?, ?)
  `).run(seller.id, asin || null, keyword || null, JSON.stringify(req.body))

  const score = db.prepare('SELECT * FROM deal_scores WHERE id = ?').get(result.lastInsertRowid)
  res.status(201).json({ score, message: 'Deal scoring queued — agent will process and update' })
})

// ─── Agent Marketplace ───────────────────────────────────────

// Browse public workflow templates
router.get('/marketplace', (req, res) => {
  const { category, sort = 'installs' } = req.query
  let sql = 'SELECT wt.*, s.store_name as author_name FROM workflow_templates wt LEFT JOIN sellers s ON s.id = wt.author_seller_id WHERE wt.is_public = 1'
  const params = []

  if (category) { sql += ' AND wt.category = ?'; params.push(category) }

  const sortMap = { installs: 'wt.installs DESC', rating: 'wt.rating DESC', newest: 'wt.created_at DESC', price: 'wt.price ASC' }
  sql += ` ORDER BY ${sortMap[sort] || sortMap.installs} LIMIT 50`

  const templates = db.prepare(sql).all(...params)
  templates.forEach(t => {
    t.phases = safeJSON(t.phases, [])
    t.tags = safeJSON(t.tags, [])
  })

  res.json({ templates })
})

// Get single template
router.get('/marketplace/:slug', (req, res) => {
  const template = db.prepare(
    'SELECT wt.*, s.store_name as author_name FROM workflow_templates wt LEFT JOIN sellers s ON s.id = wt.author_seller_id WHERE wt.slug = ?'
  ).get(req.params.slug)

  if (!template) return res.status(404).json({ error: 'Template not found' })
  template.phases = safeJSON(template.phases, [])
  template.tags = safeJSON(template.tags, [])

  res.json({ template })
})

// Publish a workflow template
router.post('/marketplace', (req, res) => {
  const seller = db.prepare('SELECT id FROM sellers WHERE user_email = ?').get(req.user.email)
  if (!seller) return res.status(400).json({ error: 'Seller profile required' })

  const { name, description, category, phases, price, tags } = req.body
  if (!name || !phases) return res.status(400).json({ error: 'name and phases required' })

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  const result = db.prepare(`
    INSERT INTO workflow_templates (slug, name, description, author_seller_id, category, phases, is_public, price, tags)
    VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)
  `).run(slug, name, description || null, seller.id, category || 'general', JSON.stringify(phases), price || 0, JSON.stringify(tags || []))

  const template = db.prepare('SELECT * FROM workflow_templates WHERE id = ?').get(result.lastInsertRowid)
  template.phases = safeJSON(template.phases, [])
  template.tags = safeJSON(template.tags, [])

  res.status(201).json({ template })
})

// Install a template
router.post('/marketplace/:slug/install', (req, res) => {
  const seller = db.prepare('SELECT id FROM sellers WHERE user_email = ?').get(req.user.email)
  if (!seller) return res.status(400).json({ error: 'Seller profile required' })

  const template = db.prepare('SELECT * FROM workflow_templates WHERE slug = ? AND is_public = 1').get(req.params.slug)
  if (!template) return res.status(404).json({ error: 'Template not found' })

  const existing = db.prepare('SELECT id FROM template_installs WHERE template_id = ? AND seller_id = ?').get(template.id, seller.id)
  if (existing) return res.json({ message: 'Already installed', template_id: template.id })

  db.prepare('INSERT INTO template_installs (template_id, seller_id, price_paid) VALUES (?, ?, ?)').run(template.id, seller.id, template.price)
  db.prepare('UPDATE workflow_templates SET installs = installs + 1 WHERE id = ?').run(template.id)

  res.status(201).json({ message: 'Template installed', template_id: template.id, price_paid: template.price })
})

// ─── Supplier Intelligence (anonymized pool) ─────────────────

// Get aggregated supplier ratings
router.get('/supplier-intel/:supplierId', (req, res) => {
  const supplierId = Number(req.params.supplierId)

  const agg = db.prepare(`
    SELECT
      COUNT(*) as review_count,
      ROUND(AVG(quality_score), 1) as avg_quality,
      ROUND(AVG(communication_score), 1) as avg_communication,
      ROUND(AVG(reliability_score), 1) as avg_reliability,
      ROUND(AVG(lead_time_actual), 0) as avg_lead_time_days,
      ROUND(AVG(defect_rate_pct), 2) as avg_defect_rate
    FROM supplier_intelligence WHERE supplier_id = ?
  `).get(supplierId)

  const supplier = db.prepare('SELECT name, platform, country, verified FROM suppliers WHERE id = ?').get(supplierId)

  res.json({ supplier, intelligence: agg })
})

// Submit supplier rating
router.post('/supplier-intel', (req, res) => {
  const seller = db.prepare('SELECT id FROM sellers WHERE user_email = ?').get(req.user.email)
  if (!seller) return res.status(400).json({ error: 'Seller profile required' })

  const { supplierId, qualityScore, communicationScore, reliabilityScore, leadTimeActual, defectRatePct, notes } = req.body
  if (!supplierId) return res.status(400).json({ error: 'supplierId required' })

  const supplier = db.prepare('SELECT id FROM suppliers WHERE id = ?').get(Number(supplierId))
  if (!supplier) return res.status(404).json({ error: 'Supplier not found' })

  try {
    db.prepare(`
      INSERT INTO supplier_intelligence (supplier_id, seller_id, quality_score, communication_score, reliability_score, lead_time_actual, defect_rate_pct, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(supplier_id, seller_id) DO UPDATE SET
        quality_score = excluded.quality_score,
        communication_score = excluded.communication_score,
        reliability_score = excluded.reliability_score,
        lead_time_actual = excluded.lead_time_actual,
        defect_rate_pct = excluded.defect_rate_pct,
        notes = excluded.notes,
        created_at = datetime('now')
    `).run(supplierId, seller.id, qualityScore || null, communicationScore || null, reliabilityScore || null, leadTimeActual || null, defectRatePct || null, notes || null)

    res.json({ message: 'Supplier intelligence recorded' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ─── Usage History ───────────────────────────────────────────

router.get('/usage-history', (req, res) => {
  const seller = db.prepare('SELECT id FROM sellers WHERE user_email = ?').get(req.user.email)
  if (!seller) return res.json({ history: [] })

  const history = db.prepare(
    'SELECT * FROM seller_usage WHERE seller_id = ? ORDER BY period DESC LIMIT 12'
  ).all(seller.id)

  res.json({ history })
})

// ─── Helpers ─────────────────────────────────────────────────

function safeJSON(str, fallback) {
  if (!str) return fallback
  try { return JSON.parse(str) } catch { return fallback }
}

export default router
