import { Router } from 'express'
import db from '../db.js'
import { isConfigured } from '../llm.js'
import { generateInstagramContent } from '../operations.js'
import { publishImagePost } from '../integrations/instagram.js'

const router = Router()

function requireLLM(req, res, next) {
  if (!isConfigured()) {
    return res.status(503).json({ error: 'LLM not configured. Copy .env.example to .env and add your API key.' })
  }
  next()
}

function getSeller(req) {
  return db.prepare('SELECT id FROM sellers WHERE user_email = ?').get(req.user.email)
}

// ─── Instagram Accounts (one per category — "a page per category") ──

// List this seller's category -> Instagram account mappings (token withheld)
router.get('/instagram/accounts', (req, res) => {
  const seller = getSeller(req)
  if (!seller) return res.json({ accounts: [] })

  const accounts = db.prepare(`
    SELECT ia.id, ia.category_id, c.name as category_name, ia.ig_business_account_id, ia.page_id, ia.token_expires_at, ia.created_at
    FROM instagram_accounts ia
    LEFT JOIN categories c ON c.id = ia.category_id
    WHERE ia.seller_id = ?
    ORDER BY ia.created_at DESC
  `).all(seller.id)

  res.json({ accounts })
})

// Connect/replace an Instagram Business Account for a category.
// accessToken must be a real long-lived Graph API token from the seller's own Meta
// Business Suite / developer app — this endpoint cannot create Instagram accounts or tokens.
router.post('/instagram/accounts', (req, res) => {
  let seller = getSeller(req)
  if (!seller) return res.status(400).json({ error: 'Seller profile required' })

  const { categoryId, igBusinessAccountId, pageId, accessToken, tokenExpiresAt } = req.body
  if (!igBusinessAccountId || !accessToken) {
    return res.status(400).json({ error: 'igBusinessAccountId and accessToken are required' })
  }

  db.prepare(`
    INSERT INTO instagram_accounts (seller_id, category_id, ig_business_account_id, page_id, access_token, token_expires_at)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(seller_id, category_id) DO UPDATE SET
      ig_business_account_id = excluded.ig_business_account_id,
      page_id = excluded.page_id,
      access_token = excluded.access_token,
      token_expires_at = excluded.token_expires_at
  `).run(seller.id, categoryId || null, igBusinessAccountId, pageId || null, accessToken, tokenExpiresAt || null)

  const account = db.prepare(`
    SELECT id, category_id, ig_business_account_id, page_id, token_expires_at, created_at
    FROM instagram_accounts WHERE seller_id = ? AND (category_id = ? OR (category_id IS NULL AND ? IS NULL))
  `).get(seller.id, categoryId || null, categoryId || null)

  res.status(201).json({ account })
})

// ─── Instagram Content ────────────────────────────────────────

// List generated content for this seller
router.get('/instagram/content', (req, res) => {
  const seller = getSeller(req)
  if (!seller) return res.json({ content: [] })

  const { productId, status } = req.query
  let sql = 'SELECT * FROM instagram_content WHERE seller_id = ?'
  const params = [seller.id]
  if (productId) { sql += ' AND product_id = ?'; params.push(Number(productId)) }
  if (status) { sql += ' AND status = ?'; params.push(status) }
  sql += ' ORDER BY created_at DESC'

  const content = db.prepare(sql).all(...params)
  content.forEach(c => { c.hashtags = safeJSON(c.hashtags, []) })

  res.json({ content })
})

// Generate Instagram content (caption, hashtags, origin story, image brief) for a product
router.post('/instagram/generate', requireLLM, async (req, res) => {
  let seller = getSeller(req)
  if (!seller) return res.status(400).json({ error: 'Seller profile required' })

  const { productSlug, originStory } = req.body
  if (!productSlug) return res.status(400).json({ error: 'productSlug is required' })

  const product = db.prepare(`
    SELECT p.*, c.id as category_id, c.name as category_name
    FROM products p LEFT JOIN categories c ON c.id = p.category_id
    WHERE p.slug = ?
  `).get(productSlug)
  if (!product) return res.status(404).json({ error: 'Product not found' })

  const supplier = db.prepare(`
    SELECT s.name, s.country, s.platform FROM supplier_quotes sq
    JOIN suppliers s ON s.id = sq.supplier_id
    WHERE sq.product_id = ? ORDER BY sq.landed_cost ASC LIMIT 1
  `).get(product.id)

  try {
    const result = await generateInstagramContent({
      product: product.name,
      category: product.category_name,
      originStory,
      supplier: supplier || {}
    })

    const insert = db.prepare(`
      INSERT INTO instagram_content (product_id, seller_id, category_id, origin_story, caption, hashtags, image_brief, cta)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      product.id, seller.id, product.category_id || null,
      result.origin_story_refined || originStory || null,
      result.caption || null,
      JSON.stringify(result.hashtags || []),
      result.image_brief || null,
      result.cta || null
    )

    const content = db.prepare('SELECT * FROM instagram_content WHERE id = ?').get(insert.lastInsertRowid)
    content.hashtags = safeJSON(content.hashtags, [])

    res.status(201).json({ content })
  } catch (err) {
    console.error('[Generate Instagram Content] Error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// Approve generated content before it can be published
router.patch('/instagram/content/:id/approve', (req, res) => {
  const seller = getSeller(req)
  if (!seller) return res.status(403).json({ error: 'Not authorized' })

  const content = db.prepare('SELECT * FROM instagram_content WHERE id = ? AND seller_id = ?').get(Number(req.params.id), seller.id)
  if (!content) return res.status(404).json({ error: 'Content not found' })

  db.prepare("UPDATE instagram_content SET status = 'approved', updated_at = datetime('now') WHERE id = ?").run(content.id)
  res.json({ content: db.prepare('SELECT * FROM instagram_content WHERE id = ?').get(content.id) })
})

// Publish approved content to the category's Instagram Business Account via the Graph API.
// Requires a real access token to already be connected via POST /instagram/accounts.
router.post('/instagram/content/:id/publish', async (req, res) => {
  const seller = getSeller(req)
  if (!seller) return res.status(403).json({ error: 'Not authorized' })

  const content = db.prepare('SELECT * FROM instagram_content WHERE id = ? AND seller_id = ?').get(Number(req.params.id), seller.id)
  if (!content) return res.status(404).json({ error: 'Content not found' })
  if (content.status !== 'approved') {
    return res.status(400).json({ error: `Content must be approved before publishing (current status: ${content.status})` })
  }

  const { imageUrl } = req.body
  if (!imageUrl) return res.status(400).json({ error: 'imageUrl is required (Instagram requires a hosted image URL to publish)' })

  const account = db.prepare(`
    SELECT * FROM instagram_accounts WHERE seller_id = ? AND (category_id = ? OR category_id IS NULL)
    ORDER BY category_id IS NULL ASC LIMIT 1
  `).get(seller.id, content.category_id)
  if (!account) return res.status(400).json({ error: 'No Instagram Business Account connected for this category — connect one via POST /api/social/instagram/accounts' })

  const caption = content.cta ? `${content.caption}\n\n${content.cta}` : content.caption

  db.prepare("UPDATE instagram_content SET status = 'publishing', updated_at = datetime('now') WHERE id = ?").run(content.id)

  try {
    const { creationId, mediaId } = await publishImagePost({
      igBusinessAccountId: account.ig_business_account_id,
      accessToken: account.access_token,
      imageUrl,
      caption
    })

    db.prepare(`
      UPDATE instagram_content
      SET status = 'published', graph_media_id = ?, graph_post_id = ?, published_at = datetime('now'), error = NULL, updated_at = datetime('now')
      WHERE id = ?
    `).run(creationId, mediaId, content.id)

    res.json({ content: db.prepare('SELECT * FROM instagram_content WHERE id = ?').get(content.id) })
  } catch (err) {
    console.error('[Publish Instagram Content] Error:', err.message)
    db.prepare("UPDATE instagram_content SET status = 'failed', error = ?, updated_at = datetime('now') WHERE id = ?").run(err.message, content.id)
    res.status(502).json({ error: err.message })
  }
})

// ─── Helpers ─────────────────────────────────────────────────

function safeJSON(str, fallback) {
  if (!str) return fallback
  try { return JSON.parse(str) } catch { return fallback }
}

export default router
