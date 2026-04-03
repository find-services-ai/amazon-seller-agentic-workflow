import { Router } from 'express'
import db from '../db.js'

const router = Router()

// ─── Products CRUD ───────────────────────────────────────────

// List products (with search, filter, pagination)
router.get('/products', (req, res) => {
  const { status, category, search, limit = 50, offset = 0 } = req.query
  let sql = `
    SELECT p.*, c.name as category_name
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    WHERE 1=1
  `
  const params = []

  if (status) {
    sql += ' AND p.status = ?'
    params.push(status)
  }
  if (category) {
    sql += ' AND c.name = ?'
    params.push(category)
  }
  if (search) {
    sql += ' AND (p.name LIKE ? OR p.slug LIKE ? OR p.tags LIKE ?)'
    const q = `%${search}%`
    params.push(q, q, q)
  }

  sql += ' ORDER BY p.updated_at DESC LIMIT ? OFFSET ?'
  params.push(Number(limit), Number(offset))

  const products = db.prepare(sql).all(...params)

  // Parse JSON fields
  const parsed = products.map(p => ({
    ...p,
    tags: safeJSON(p.tags, []),
    meta: safeJSON(p.meta, {})
  }))

  const total = db.prepare('SELECT COUNT(*) as c FROM products').get().c
  res.json({ products: parsed, total })
})

// Get single product
router.get('/products/:slug', (req, res) => {
  const product = db.prepare(`
    SELECT p.*, c.name as category_name
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    WHERE p.slug = ?
  `).get(req.params.slug)

  if (!product) return res.status(404).json({ error: 'Product not found' })

  product.tags = safeJSON(product.tags, [])
  product.meta = safeJSON(product.meta, {})

  // Attach suppliers
  const quotes = db.prepare(`
    SELECT sq.*, s.name as supplier_name, s.platform, s.country, s.rating as supplier_rating
    FROM supplier_quotes sq
    JOIN suppliers s ON s.id = sq.supplier_id
    WHERE sq.product_id = ?
    ORDER BY sq.landed_cost ASC
  `).all(product.id)

  // Attach research sessions
  const research = db.prepare(`
    SELECT * FROM research_sessions WHERE product_id = ? ORDER BY created_at DESC
  `).all(product.id)

  // Attach trends
  const trends = db.prepare(`
    SELECT * FROM product_trends WHERE product_id = ? ORDER BY date DESC LIMIT 30
  `).all(product.id)

  // Attach listings
  const listings = db.prepare(`
    SELECT * FROM listings WHERE product_id = ? ORDER BY created_at DESC
  `).all(product.id)

  res.json({ product, quotes, research, trends, listings })
})

// Create product
router.post('/products', (req, res) => {
  const { name, slug, category, description, targetPrice, unitCost, budgetLimit, tags } = req.body
  if (!name) return res.status(400).json({ error: 'name is required' })

  const productSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  // Check uniqueness
  const existing = db.prepare('SELECT id FROM products WHERE slug = ?').get(productSlug)
  if (existing) return res.status(409).json({ error: 'Product slug already exists' })

  // Resolve category
  let categoryId = null
  if (category) {
    const cat = db.prepare('SELECT id FROM categories WHERE name = ?').get(category)
    if (cat) categoryId = cat.id
    else {
      const result = db.prepare('INSERT INTO categories (name) VALUES (?)').run(category)
      categoryId = result.lastInsertRowid
    }
  }

  const result = db.prepare(`
    INSERT INTO products (slug, name, category_id, description, target_price, unit_cost, budget_limit, tags, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'idea')
  `).run(
    productSlug, name, categoryId, description || null,
    targetPrice || null, unitCost || null, budgetLimit || 1500,
    JSON.stringify(tags || [])
  )

  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid)
  product.tags = safeJSON(product.tags, [])
  product.meta = safeJSON(product.meta, {})

  res.status(201).json({ product })
})

// Update product
router.patch('/products/:slug', (req, res) => {
  const product = db.prepare('SELECT * FROM products WHERE slug = ?').get(req.params.slug)
  if (!product) return res.status(404).json({ error: 'Product not found' })

  const allowedFields = [
    'name', 'description', 'status', 'target_price', 'unit_cost',
    'expected_margin', 'validation_score', 'confidence', 'budget_limit',
    'image_url', 'tags', 'meta'
  ]

  // Map camelCase to snake_case
  const fieldMap = {
    targetPrice: 'target_price', unitCost: 'unit_cost',
    expectedMargin: 'expected_margin', validationScore: 'validation_score',
    budgetLimit: 'budget_limit', imageUrl: 'image_url'
  }

  const sets = []
  const params = []

  for (const [key, value] of Object.entries(req.body)) {
    const dbField = fieldMap[key] || key
    if (!allowedFields.includes(dbField)) continue
    sets.push(`${dbField} = ?`)
    params.push(typeof value === 'object' ? JSON.stringify(value) : value)
  }

  if (sets.length === 0) return res.status(400).json({ error: 'No valid fields to update' })

  sets.push("updated_at = datetime('now')")
  params.push(product.id)

  db.prepare(`UPDATE products SET ${sets.join(', ')} WHERE id = ?`).run(...params)

  const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(product.id)
  updated.tags = safeJSON(updated.tags, [])
  updated.meta = safeJSON(updated.meta, {})

  res.json({ product: updated })
})

// Delete product
router.delete('/products/:slug', (req, res) => {
  const product = db.prepare('SELECT id FROM products WHERE slug = ?').get(req.params.slug)
  if (!product) return res.status(404).json({ error: 'Product not found' })

  db.prepare('DELETE FROM products WHERE id = ?').run(product.id)
  res.json({ deleted: true })
})

// ─── Categories ──────────────────────────────────────────────

router.get('/categories', (_req, res) => {
  const categories = db.prepare(`
    SELECT c.*, COUNT(p.id) as product_count
    FROM categories c
    LEFT JOIN products p ON p.category_id = c.id
    GROUP BY c.id
    ORDER BY c.name
  `).all()
  res.json({ categories })
})

// ─── Suppliers ───────────────────────────────────────────────

router.get('/suppliers', (req, res) => {
  const { platform, search } = req.query
  let sql = 'SELECT * FROM suppliers WHERE 1=1'
  const params = []

  if (platform) { sql += ' AND platform = ?'; params.push(platform) }
  if (search) { sql += ' AND (name LIKE ? OR contact_email LIKE ?)'; params.push(`%${search}%`, `%${search}%`) }

  sql += ' ORDER BY rating DESC, name'
  const suppliers = db.prepare(sql).all(...params)
  res.json({ suppliers })
})

router.post('/suppliers', (req, res) => {
  const { name, platform, country, contactEmail, contactName, website, rating, notes } = req.body
  if (!name) return res.status(400).json({ error: 'name is required' })

  const result = db.prepare(`
    INSERT INTO suppliers (name, platform, country, contact_email, contact_name, website, rating, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(name, platform || null, country || 'CN', contactEmail || null, contactName || null, website || null, rating || null, notes || null)

  const supplier = db.prepare('SELECT * FROM suppliers WHERE id = ?').get(result.lastInsertRowid)
  res.status(201).json({ supplier })
})

// ─── Supplier Quotes ─────────────────────────────────────────

router.post('/products/:slug/quotes', (req, res) => {
  const product = db.prepare('SELECT id FROM products WHERE slug = ?').get(req.params.slug)
  if (!product) return res.status(404).json({ error: 'Product not found' })

  const { supplierId, priceLow, priceHigh, moq, leadTimeDays, shippingCost, landedCost, sampleCost, notes } = req.body
  if (!supplierId) return res.status(400).json({ error: 'supplierId is required' })

  const result = db.prepare(`
    INSERT OR REPLACE INTO supplier_quotes
    (product_id, supplier_id, price_low, price_high, moq, lead_time_days, shipping_cost, landed_cost, sample_cost, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(product.id, supplierId, priceLow || null, priceHigh || null, moq || null, leadTimeDays || null, shippingCost || null, landedCost || null, sampleCost || null, notes || null)

  const quote = db.prepare('SELECT * FROM supplier_quotes WHERE id = ?').get(result.lastInsertRowid)
  res.status(201).json({ quote })
})

// ─── Research Sessions ───────────────────────────────────────

router.post('/products/:slug/research', (req, res) => {
  const product = db.prepare('SELECT id FROM products WHERE slug = ?').get(req.params.slug)
  if (!product) return res.status(404).json({ error: 'Product not found' })

  const { phaseId, score, confidence, verdict, resultData } = req.body

  const result = db.prepare(`
    INSERT INTO research_sessions (product_id, phase_id, score, confidence, verdict, result_data)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(product.id, phaseId, score || null, confidence || null, verdict || null, JSON.stringify(resultData || {}))

  res.status(201).json({ sessionId: result.lastInsertRowid })
})

// ─── Agent Runs ──────────────────────────────────────────────

router.get('/agent-runs', (req, res) => {
  const { agentName, productId, limit = 50 } = req.query
  let sql = 'SELECT * FROM agent_runs WHERE 1=1'
  const params = []

  if (agentName) { sql += ' AND agent_name = ?'; params.push(agentName) }
  if (productId) { sql += ' AND product_id = ?'; params.push(Number(productId)) }

  sql += ' ORDER BY created_at DESC LIMIT ?'
  params.push(Number(limit))

  const runs = db.prepare(sql).all(...params)
  res.json({ runs })
})

router.post('/agent-runs', (req, res) => {
  const { agentName, productId, phase, input, output, score, confidence, tokensUsed, durationMs, status, error } = req.body

  const result = db.prepare(`
    INSERT INTO agent_runs (agent_name, product_id, phase, input, output, score, confidence, tokens_used, duration_ms, status, error)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    agentName, productId || null, phase || null,
    JSON.stringify(input || {}), JSON.stringify(output || {}),
    score || null, confidence || null, tokensUsed || null, durationMs || null,
    status || 'completed', error || null
  )

  res.status(201).json({ runId: result.lastInsertRowid })
})

// ─── Dashboard Stats ─────────────────────────────────────────

router.get('/stats', (_req, res) => {
  const products = db.prepare('SELECT COUNT(*) as c FROM products').get().c
  const active = db.prepare("SELECT COUNT(*) as c FROM products WHERE status IN ('active','launching','sourcing')").get().c
  const ideas = db.prepare("SELECT COUNT(*) as c FROM products WHERE status = 'idea'").get().c
  const validated = db.prepare("SELECT COUNT(*) as c FROM products WHERE validation_score IS NOT NULL").get().c
  const suppliers = db.prepare('SELECT COUNT(*) as c FROM suppliers').get().c
  const agentRuns = db.prepare('SELECT COUNT(*) as c FROM agent_runs').get().c
  const orders = db.prepare('SELECT COUNT(*) as c FROM orders').get().c
  const revenue = db.prepare('SELECT COALESCE(SUM(total), 0) as r FROM orders WHERE status != ?').get('cancelled').r

  res.json({
    products, active, ideas, validated,
    suppliers, agentRuns, orders, revenue
  })
})

// ─── Helpers ─────────────────────────────────────────────────

function safeJSON(str, fallback) {
  if (!str) return fallback
  try { return JSON.parse(str) } catch { return fallback }
}

export default router
