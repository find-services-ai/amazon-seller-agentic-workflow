import { Router } from 'express'
import db from '../db.js'

const router = Router()

// ─── Trend Discoveries ───────────────────────────────────────

// List trend discoveries (sorted by opportunity score)
router.get('/discoveries', (req, res) => {
  const { category, competition, limit = 50 } = req.query
  let sql = `
    SELECT td.*, c.name as category_name
    FROM trend_discoveries td
    LEFT JOIN categories c ON c.id = td.category_id
    WHERE 1=1
  `
  const params = []

  if (category) { sql += ' AND c.name = ?'; params.push(category) }
  if (competition) { sql += ' AND td.competition = ?'; params.push(competition) }

  sql += ' ORDER BY td.opportunity_score DESC, td.discovered_at DESC LIMIT ?'
  params.push(Number(limit))

  const discoveries = db.prepare(sql).all(...params)
  res.json({ discoveries })
})

// Add a trend discovery
router.post('/discoveries', (req, res) => {
  const { categoryId, keyword, searchVolume, growthRate, competition, opportunityScore, source, notes } = req.body
  if (!keyword) return res.status(400).json({ error: 'keyword is required' })

  const result = db.prepare(`
    INSERT INTO trend_discoveries (category_id, keyword, search_volume, growth_rate, competition, opportunity_score, source, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(categoryId || null, keyword, searchVolume || null, growthRate || null, competition || null, opportunityScore || null, source || null, notes || null)

  const discovery = db.prepare('SELECT * FROM trend_discoveries WHERE id = ?').get(result.lastInsertRowid)
  res.status(201).json({ discovery })
})

// ─── Product Trends (time-series) ────────────────────────────

// Get trends for a product
router.get('/products/:slug/trends', (req, res) => {
  const { period = 'daily', limit = 90 } = req.query
  const product = db.prepare('SELECT id FROM products WHERE slug = ?').get(req.params.slug)
  if (!product) return res.status(404).json({ error: 'Product not found' })

  const trends = db.prepare(`
    SELECT * FROM product_trends
    WHERE product_id = ? AND period = ?
    ORDER BY date DESC LIMIT ?
  `).all(product.id, period, Number(limit))

  res.json({ trends })
})

// Add a trend data point
router.post('/products/:slug/trends', (req, res) => {
  const product = db.prepare('SELECT id FROM products WHERE slug = ?').get(req.params.slug)
  if (!product) return res.status(404).json({ error: 'Product not found' })

  const {
    period = 'daily', date, bsrRank, searchVolume, priceAvg,
    priceLow, priceHigh, reviewCount, ratingAvg,
    demandScore, competitionScore, trendDirection, source, rawData
  } = req.body

  const trendDate = date || new Date().toISOString().split('T')[0]

  const result = db.prepare(`
    INSERT OR REPLACE INTO product_trends
    (product_id, period, date, bsr_rank, search_volume, price_avg, price_low, price_high,
     review_count, rating_avg, demand_score, competition_score, trend_direction, source, raw_data)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    product.id, period, trendDate, bsrRank || null, searchVolume || null,
    priceAvg || null, priceLow || null, priceHigh || null,
    reviewCount || null, ratingAvg || null, demandScore || null,
    competitionScore || null, trendDirection || null, source || null,
    JSON.stringify(rawData || {})
  )

  res.status(201).json({ trendId: result.lastInsertRowid })
})

// ─── Trending Products (aggregate view) ──────────────────────

router.get('/trending', (_req, res) => {
  // Products with recent rising trends
  const rising = db.prepare(`
    SELECT p.slug, p.name, p.status, pt.demand_score, pt.competition_score,
           pt.search_volume, pt.trend_direction, pt.date
    FROM product_trends pt
    JOIN products p ON p.id = pt.product_id
    WHERE pt.trend_direction = 'rising'
      AND pt.date >= date('now', '-7 days')
    ORDER BY pt.demand_score DESC
    LIMIT 20
  `).all()

  // Top opportunity trend discoveries
  const opportunities = db.prepare(`
    SELECT td.*, c.name as category_name
    FROM trend_discoveries td
    LEFT JOIN categories c ON c.id = td.category_id
    WHERE td.opportunity_score >= 7
    ORDER BY td.opportunity_score DESC, td.growth_rate DESC
    LIMIT 20
  `).all()

  // Categories with most activity
  const hotCategories = db.prepare(`
    SELECT c.name, COUNT(p.id) as product_count,
           AVG(p.validation_score) as avg_score
    FROM categories c
    JOIN products p ON p.category_id = c.id
    GROUP BY c.id
    ORDER BY product_count DESC
    LIMIT 10
  `).all()

  res.json({ rising, opportunities, hotCategories })
})

export default router
