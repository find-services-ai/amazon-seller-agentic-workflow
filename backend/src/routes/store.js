import { Router } from 'express'
import db from '../db.js'
import { updateGMV, recordRevShareEntry, getPlanForSeller } from '../billing.js'

const router = Router()

// ─── Seller Profile ──────────────────────────────────────────

// Get or create seller profile for authenticated user
router.get('/profile', (req, res) => {
  let seller = db.prepare('SELECT * FROM sellers WHERE user_email = ?').get(req.user.email)

  if (!seller) {
    // Auto-create seller profile
    const storeName = req.user.name || req.user.email.split('@')[0]
    const storeSlug = storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    db.prepare(`
      INSERT INTO sellers (user_email, store_name, store_slug, settings)
      VALUES (?, ?, ?, ?)
    `).run(req.user.email, storeName, storeSlug, JSON.stringify({ theme: 'dark', currency: 'USD' }))

    seller = db.prepare('SELECT * FROM sellers WHERE user_email = ?').get(req.user.email)
  }

  seller.settings = safeJSON(seller.settings, {})
  res.json({ seller })
})

// Update seller profile
router.patch('/profile', (req, res) => {
  const seller = db.prepare('SELECT * FROM sellers WHERE user_email = ?').get(req.user.email)
  if (!seller) return res.status(404).json({ error: 'Seller profile not found' })

  const { storeName, bio, logoUrl, amazonSellerId, settings } = req.body
  const sets = []
  const params = []

  if (storeName !== undefined) { sets.push('store_name = ?'); params.push(storeName) }
  if (bio !== undefined) { sets.push('bio = ?'); params.push(bio) }
  if (logoUrl !== undefined) { sets.push('logo_url = ?'); params.push(logoUrl) }
  if (amazonSellerId !== undefined) { sets.push('amazon_seller_id = ?'); params.push(amazonSellerId) }
  if (settings !== undefined) { sets.push('settings = ?'); params.push(JSON.stringify(settings)) }

  if (sets.length === 0) return res.status(400).json({ error: 'No fields to update' })
  params.push(seller.id)

  db.prepare(`UPDATE sellers SET ${sets.join(', ')} WHERE id = ?`).run(...params)
  const updated = db.prepare('SELECT * FROM sellers WHERE id = ?').get(seller.id)
  updated.settings = safeJSON(updated.settings, {})

  res.json({ seller: updated })
})

// ─── Listings Management ─────────────────────────────────────

// List all listings for seller
router.get('/listings', (req, res) => {
  const seller = db.prepare('SELECT id FROM sellers WHERE user_email = ?').get(req.user.email)
  if (!seller) return res.json({ listings: [] })

  const { channel, status } = req.query
  let sql = `
    SELECT l.*, p.name as product_name, p.slug as product_slug
    FROM listings l
    JOIN products p ON p.id = l.product_id
    WHERE l.seller_id = ?
  `
  const params = [seller.id]

  if (channel) { sql += ' AND l.channel = ?'; params.push(channel) }
  if (status) { sql += ' AND l.status = ?'; params.push(status) }

  sql += ' ORDER BY l.updated_at DESC'
  const listings = db.prepare(sql).all(...params)

  listings.forEach(l => {
    l.bullets = safeJSON(l.bullets, [])
    l.images = safeJSON(l.images, [])
    l.keywords = safeJSON(l.keywords, [])
  })

  res.json({ listings })
})

// Create listing
router.post('/listings', (req, res) => {
  let seller = db.prepare('SELECT id FROM sellers WHERE user_email = ?').get(req.user.email)
  if (!seller) return res.status(400).json({ error: 'Seller profile required' })

  const { productSlug, channel, title, price, bullets, description, images, keywords, asin } = req.body
  if (!productSlug || !channel) return res.status(400).json({ error: 'productSlug and channel required' })

  const product = db.prepare('SELECT id FROM products WHERE slug = ?').get(productSlug)
  if (!product) return res.status(404).json({ error: 'Product not found' })

  const result = db.prepare(`
    INSERT INTO listings (product_id, seller_id, channel, title, price, bullets, description, images, keywords, asin)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    product.id, seller.id, channel,
    title || null, price || null,
    JSON.stringify(bullets || []), description || null,
    JSON.stringify(images || []), JSON.stringify(keywords || []),
    asin || null
  )

  const listing = db.prepare('SELECT * FROM listings WHERE id = ?').get(result.lastInsertRowid)
  listing.bullets = safeJSON(listing.bullets, [])
  listing.images = safeJSON(listing.images, [])
  listing.keywords = safeJSON(listing.keywords, [])

  res.status(201).json({ listing })
})

// Update listing
router.patch('/listings/:id', (req, res) => {
  const seller = db.prepare('SELECT id FROM sellers WHERE user_email = ?').get(req.user.email)
  if (!seller) return res.status(403).json({ error: 'Not authorized' })

  const listing = db.prepare('SELECT * FROM listings WHERE id = ? AND seller_id = ?').get(
    Number(req.params.id), seller.id
  )
  if (!listing) return res.status(404).json({ error: 'Listing not found' })

  const { title, price, status, bullets, description, images, keywords, asin } = req.body
  const sets = []
  const params = []

  if (title !== undefined) { sets.push('title = ?'); params.push(title) }
  if (price !== undefined) { sets.push('price = ?'); params.push(price) }
  if (status !== undefined) { sets.push('status = ?'); params.push(status) }
  if (bullets !== undefined) { sets.push('bullets = ?'); params.push(JSON.stringify(bullets)) }
  if (description !== undefined) { sets.push('description = ?'); params.push(description) }
  if (images !== undefined) { sets.push('images = ?'); params.push(JSON.stringify(images)) }
  if (keywords !== undefined) { sets.push('keywords = ?'); params.push(JSON.stringify(keywords)) }
  if (asin !== undefined) { sets.push('asin = ?'); params.push(asin) }

  if (sets.length === 0) return res.status(400).json({ error: 'No fields to update' })

  sets.push("updated_at = datetime('now')")
  params.push(listing.id)

  db.prepare(`UPDATE listings SET ${sets.join(', ')} WHERE id = ?`).run(...params)

  const updated = db.prepare('SELECT * FROM listings WHERE id = ?').get(listing.id)
  updated.bullets = safeJSON(updated.bullets, [])
  updated.images = safeJSON(updated.images, [])
  updated.keywords = safeJSON(updated.keywords, [])

  res.json({ listing: updated })
})

// ─── Orders ──────────────────────────────────────────────────

// List orders for seller
router.get('/orders', (req, res) => {
  const seller = db.prepare('SELECT id FROM sellers WHERE user_email = ?').get(req.user.email)
  if (!seller) return res.json({ orders: [] })

  const { status, channel, limit = 50 } = req.query
  let sql = `
    SELECT o.*, l.title as listing_title, p.name as product_name
    FROM orders o
    JOIN listings l ON l.id = o.listing_id
    JOIN products p ON p.id = l.product_id
    WHERE o.seller_id = ?
  `
  const params = [seller.id]

  if (status) { sql += ' AND o.status = ?'; params.push(status) }
  if (channel) { sql += ' AND o.channel = ?'; params.push(channel) }

  sql += ' ORDER BY o.ordered_at DESC LIMIT ?'
  params.push(Number(limit))

  const orders = db.prepare(sql).all(...params)
  res.json({ orders })
})

// Create order (for storefront purchases)
router.post('/orders', (req, res) => {
  const { listingId, buyerEmail, buyerName, quantity, shippingAddress } = req.body
  if (!listingId || !buyerEmail) return res.status(400).json({ error: 'listingId and buyerEmail required' })

  const listing = db.prepare(`
    SELECT l.*, s.id as seller_id FROM listings l
    JOIN sellers s ON s.id = l.seller_id
    WHERE l.id = ? AND l.status = 'active'
  `).get(Number(listingId))
  if (!listing) return res.status(404).json({ error: 'Active listing not found' })

  const qty = quantity || 1
  const total = (listing.price || 0) * qty
  const orderNumber = `SF-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`

  const result = db.prepare(`
    INSERT INTO orders (order_number, listing_id, seller_id, buyer_email, buyer_name, channel, quantity, unit_price, total, shipping_address)
    VALUES (?, ?, ?, ?, ?, 'storefront', ?, ?, ?, ?)
  `).run(orderNumber, listing.id, listing.seller_id, buyerEmail, buyerName || null, qty, listing.price, total, shippingAddress || null)

  // Track revenue share
  const sellerEmail = db.prepare('SELECT user_email FROM sellers WHERE id = ?').get(listing.seller_id)?.user_email
  if (sellerEmail && total > 0) {
    const plan = getPlanForSeller(sellerEmail)
    if (plan.revenue_share_pct > 0) {
      updateGMV(listing.seller_id, total)
      recordRevShareEntry(listing.seller_id, result.lastInsertRowid, total, plan.revenue_share_pct)
    }
  }

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(result.lastInsertRowid)
  res.status(201).json({ order })
})

// ─── Public Storefront ───────────────────────────────────────

// Public: Get store info by slug (no auth required)
router.get('/public/:storeSlug', (_req, res) => {
  const seller = db.prepare(`
    SELECT store_name, store_slug, bio, logo_url FROM sellers WHERE store_slug = ?
  `).get(_req.params.storeSlug)
  if (!seller) return res.status(404).json({ error: 'Store not found' })

  const listings = db.prepare(`
    SELECT l.id, l.title, l.price, l.images, l.channel, p.name as product_name, p.slug as product_slug
    FROM listings l
    JOIN sellers s ON s.id = l.seller_id
    JOIN products p ON p.id = l.product_id
    WHERE s.store_slug = ? AND l.status = 'active'
    ORDER BY l.created_at DESC
  `).all(_req.params.storeSlug)

  listings.forEach(l => { l.images = safeJSON(l.images, []) })

  res.json({ store: seller, listings })
})

// ─── Helpers ─────────────────────────────────────────────────

function safeJSON(str, fallback) {
  if (!str) return fallback
  try { return JSON.parse(str) } catch { return fallback }
}

export default router
