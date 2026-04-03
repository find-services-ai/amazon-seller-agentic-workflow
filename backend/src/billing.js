import db from './db.js'

// ─── Plan Limits ─────────────────────────────────────────────

export function getPlanForSeller(sellerEmail) {
  const seller = db.prepare('SELECT plan FROM sellers WHERE user_email = ?').get(sellerEmail)
  const planId = seller?.plan || 'free'
  const plan = db.prepare('SELECT * FROM plan_definitions WHERE id = ?').get(planId)
  if (!plan) {
    return { id: 'free', name: 'Free', max_products: 3, max_agent_runs_monthly: 20, revenue_share_pct: 0, features: ['deal_scoring', 'basic_research', 'storefront'], price_monthly: 0 }
  }
  plan.features = safeJSON(plan.features, [])
  return plan
}

export function getCurrentPeriod() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function getUsage(sellerId, period) {
  let usage = db.prepare('SELECT * FROM seller_usage WHERE seller_id = ? AND period = ?').get(sellerId, period)
  if (!usage) {
    db.prepare('INSERT OR IGNORE INTO seller_usage (seller_id, period) VALUES (?, ?)').run(sellerId, period)
    usage = db.prepare('SELECT * FROM seller_usage WHERE seller_id = ? AND period = ?').get(sellerId, period)
  }
  return usage
}

export function incrementAgentRuns(sellerId, tokensUsed = 0) {
  const period = getCurrentPeriod()
  getUsage(sellerId, period) // ensure row exists
  db.prepare(`
    UPDATE seller_usage
    SET agent_runs_used = agent_runs_used + 1,
        tokens_consumed = tokens_consumed + ?
    WHERE seller_id = ? AND period = ?
  `).run(tokensUsed, sellerId, period)
}

export function updateGMV(sellerId, orderTotal) {
  const period = getCurrentPeriod()
  const plan = getPlanForSeller(
    db.prepare('SELECT user_email FROM sellers WHERE id = ?').get(sellerId)?.user_email
  )
  const platformFee = orderTotal * (plan.revenue_share_pct / 100)

  getUsage(sellerId, period)
  db.prepare(`
    UPDATE seller_usage
    SET gmv = gmv + ?,
        revenue_share_owed = revenue_share_owed + ?
    WHERE seller_id = ? AND period = ?
  `).run(orderTotal, platformFee, sellerId, period)

  return platformFee
}

export function recordRevShareEntry(sellerId, orderId, orderTotal, sharePct) {
  const platformFee = orderTotal * (sharePct / 100)
  const period = getCurrentPeriod()

  db.prepare(`
    INSERT INTO revenue_share_ledger (seller_id, order_id, order_total, share_pct, platform_fee, period)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(sellerId, orderId, orderTotal, sharePct, platformFee, period)

  return platformFee
}

// ─── Plan Enforcement Middleware ──────────────────────────────

export function requirePlan(...requiredFeatures) {
  return (req, res, next) => {
    const plan = getPlanForSeller(req.user.email)
    for (const feature of requiredFeatures) {
      if (!plan.features.includes(feature)) {
        return res.status(403).json({
          error: 'Plan upgrade required',
          feature,
          currentPlan: plan.id,
          message: `Your ${plan.name} plan does not include ${feature}. Upgrade to access this feature.`
        })
      }
    }
    req.plan = plan
    next()
  }
}

export function enforceAgentRunLimit(req, res, next) {
  const seller = db.prepare('SELECT * FROM sellers WHERE user_email = ?').get(req.user.email)
  if (!seller) return next()

  const plan = getPlanForSeller(req.user.email)
  if (plan.max_agent_runs_monthly === -1) return next() // unlimited

  const period = getCurrentPeriod()
  const usage = getUsage(seller.id, period)

  if (usage.agent_runs_used >= plan.max_agent_runs_monthly) {
    return res.status(429).json({
      error: 'Agent run limit reached',
      used: usage.agent_runs_used,
      limit: plan.max_agent_runs_monthly,
      plan: plan.id,
      period,
      message: `You've used ${usage.agent_runs_used}/${plan.max_agent_runs_monthly} agent runs this month. Upgrade your plan for more.`
    })
  }

  req.seller = seller
  req.usage = usage
  next()
}

export function enforceProductLimit(req, res, next) {
  const seller = db.prepare('SELECT * FROM sellers WHERE user_email = ?').get(req.user.email)
  if (!seller) return next()

  const plan = getPlanForSeller(req.user.email)
  if (plan.max_products === -1) return next() // unlimited

  const activeProducts = db.prepare(
    "SELECT COUNT(*) as c FROM products p JOIN listings l ON l.product_id = p.id WHERE l.seller_id = ? AND p.status NOT IN ('discontinued','paused')"
  ).get(seller.id)?.c || 0

  if (activeProducts >= plan.max_products) {
    return res.status(403).json({
      error: 'Product limit reached',
      active: activeProducts,
      limit: plan.max_products,
      plan: plan.id,
      message: `You have ${activeProducts}/${plan.max_products} active products. Upgrade to add more.`
    })
  }

  next()
}

// ─── Helpers ─────────────────────────────────────────────────

function safeJSON(str, fallback) {
  if (!str) return fallback
  try { return JSON.parse(str) } catch { return fallback }
}
