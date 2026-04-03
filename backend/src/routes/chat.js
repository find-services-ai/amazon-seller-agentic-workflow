import { Router } from 'express'
import { callLLM, isConfigured } from '../llm.js'
import { loadAgentPrompt, loadSkillContext } from '../agents.js'
import { runPhase } from '../phases.js'
import {
  generateOutreachEmail,
  generateCounterOffer,
  generateListingContent,
  generateKPIReport
} from '../operations.js'
import db from '../db.js'

const router = Router()

// ─── Intent Classification + Execution ───────────────────────

const SYSTEM_PROMPT = `You are a seller platform assistant. The user interacts with you in natural language to manage their Amazon seller business.

Your job: understand the user's intent and return a structured JSON response.

## Available Actions

1. **add_product** — User wants to add a new product idea to their catalog
   Extract: name (required), category, targetPrice, description
   
2. **search_products** — User wants to find/list existing products
   Extract: query, status filter
   
3. **discover_trends** — User wants to find new product opportunities or trends
   Extract: category, keywords
   
4. **research_product** — User wants to validate/research a product
   Extract: product name, phase (demand|competition|pricing|supply-chain|risk)
   
5. **add_supplier** — User wants to add a supplier
   Extract: name, platform, contactEmail, website, specialization
   
6. **list_suppliers** — User wants to see suppliers
   Extract: productSlug filter (optional)
   
7. **get_stats** — User wants to see dashboard stats/KPIs
   
8. **generate_email** — User wants to draft a supplier outreach email
   Extract: product, supplier name, emailType (initial|follow-up|counter-offer)
   
9. **create_listing** — User wants to create a store listing
   Extract: productSlug, channel (storefront|amazon|both), title, price
   
10. **help** — User needs guidance on what they can do

11. **general** — General conversation, advice, or questions about selling

RESPOND WITH ONLY a valid JSON object:
{
  "intent": "<action name from above>",
  "params": { <extracted parameters> },
  "reply": "<friendly natural language response to show the user — explain what you're doing or what you found>",
  "suggestions": ["<2-3 follow-up actions the user might want to take>"]
}`

// ─── Action Handlers ─────────────────────────────────────────

async function handleAddProduct(params) {
  if (!params.name) return { error: 'Product name is required' }

  const slug = params.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  // Check category
  let categoryId = null
  if (params.category) {
    const cat = db.prepare('SELECT id FROM categories WHERE name = ? COLLATE NOCASE').get(params.category)
    if (cat) categoryId = cat.id
  }

  // Check if product already exists
  const existing = db.prepare('SELECT id, name FROM products WHERE slug = ?').get(slug)
  if (existing) {
    return { data: existing, message: `Product "${existing.name}" already exists in your catalog.` }
  }

  const result = db.prepare(`
    INSERT INTO products (name, slug, category_id, target_price, description, status)
    VALUES (?, ?, ?, ?, ?, 'idea')
  `).run(
    params.name,
    slug,
    categoryId,
    params.targetPrice || null,
    params.description || null
  )

  const product = db.prepare(`
    SELECT p.*, c.name as category_name FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.id = ?
  `).get(result.lastInsertRowid)

  return { data: product, message: `Added "${params.name}" to your catalog as an idea.` }
}

async function handleSearchProducts(params) {
  let query = `
    SELECT p.*, c.name as category_name FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE 1=1
  `
  const binds = []

  if (params.query) {
    query += ` AND (p.name LIKE ? OR p.description LIKE ?)`
    binds.push(`%${params.query}%`, `%${params.query}%`)
  }
  if (params.status) {
    query += ` AND p.status = ?`
    binds.push(params.status)
  }

  query += ` ORDER BY p.created_at DESC LIMIT 20`

  const products = db.prepare(query).all(...binds)
  return { data: products, message: `Found ${products.length} product(s).` }
}

async function handleDiscoverTrends(params) {
  let query = `
    SELECT td.*, c.name as category_name FROM trend_discoveries td
    LEFT JOIN categories c ON td.category_id = c.id
    WHERE 1=1
  `
  const binds = []

  if (params.category) {
    query += ` AND c.name LIKE ?`
    binds.push(`%${params.category}%`)
  }
  if (params.keywords) {
    query += ` AND td.keyword LIKE ?`
    binds.push(`%${params.keywords}%`)
  }

  query += ` ORDER BY td.opportunity_score DESC LIMIT 15`

  const discoveries = db.prepare(query).all(...binds)

  // Also get hot categories
  const hotCategories = db.prepare(`
    SELECT c.name, COUNT(p.id) as product_count,
           ROUND(AVG(p.validation_score), 1) as avg_score
    FROM categories c
    JOIN products p ON p.category_id = c.id
    GROUP BY c.id
    ORDER BY product_count DESC
    LIMIT 5
  `).all()

  return {
    data: { discoveries, hotCategories },
    message: discoveries.length > 0
      ? `Found ${discoveries.length} trend discoveries.`
      : 'No trend discoveries yet. I can help you add products and run research to find opportunities.'
  }
}

async function handleGetStats() {
  const products = db.prepare('SELECT COUNT(*) as count FROM products').get().count
  const active = db.prepare("SELECT COUNT(*) as count FROM products WHERE status = 'active'").get().count
  const ideas = db.prepare("SELECT COUNT(*) as count FROM products WHERE status = 'idea'").get().count
  const suppliers = db.prepare('SELECT COUNT(*) as count FROM suppliers').get().count
  const listings = db.prepare('SELECT COUNT(*) as count FROM listings').get().count
  const orders = db.prepare('SELECT COUNT(*) as count FROM orders').get().count

  const recentProducts = db.prepare(`
    SELECT name, status, validation_score FROM products
    ORDER BY created_at DESC LIMIT 5
  `).all()

  return {
    data: { products, active, ideas, suppliers, listings, orders, recentProducts },
    message: `You have ${products} products (${active} active, ${ideas} ideas), ${suppliers} suppliers, ${listings} listings, and ${orders} orders.`
  }
}

async function handleAddSupplier(params) {
  if (!params.name) return { error: 'Supplier name is required' }

  const result = db.prepare(`
    INSERT INTO suppliers (name, platform, contact_email, website, specialization)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    params.name,
    params.platform || 'alibaba',
    params.contactEmail || null,
    params.website || null,
    params.specialization || null
  )

  const supplier = db.prepare('SELECT * FROM suppliers WHERE id = ?').get(result.lastInsertRowid)
  return { data: supplier, message: `Added supplier "${params.name}".` }
}

async function handleListSuppliers(params) {
  let query = 'SELECT * FROM suppliers'
  const binds = []

  if (params.productSlug) {
    query = `
      SELECT s.*, sq.price_low, sq.price_high, sq.moq
      FROM suppliers s
      JOIN supplier_quotes sq ON s.id = sq.supplier_id
      JOIN products p ON sq.product_id = p.id
      WHERE p.slug = ?
    `
    binds.push(params.productSlug)
  }

  query += ' ORDER BY created_at DESC LIMIT 20'
  const suppliers = db.prepare(query).all(...binds)
  return { data: suppliers, message: `Found ${suppliers.length} supplier(s).` }
}

async function handleListCategories() {
  const categories = db.prepare('SELECT id, name, description FROM categories ORDER BY name').all()
  return { data: categories }
}

// ─── Main Chat Endpoint ──────────────────────────────────────

router.post('/', async (req, res) => {
  const { message, history } = req.body
  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'message is required' })
  }

  try {
    // Get current context for the LLM
    const stats = db.prepare('SELECT COUNT(*) as count FROM products').get()
    const recentProducts = db.prepare(`
      SELECT name, status FROM products ORDER BY created_at DESC LIMIT 5
    `).all()
    const categories = db.prepare('SELECT name FROM categories ORDER BY name').all()

    const contextInfo = `
Current catalog: ${stats.count} products
Recent products: ${recentProducts.map(p => `${p.name} (${p.status})`).join(', ') || 'none'}
Available categories: ${categories.map(c => c.name).join(', ')}
`

    // Build user message with conversation history context
    let userMessage = ''
    if (history && Array.isArray(history) && history.length > 0) {
      const recentHistory = history.slice(-6)
      userMessage += 'Previous conversation:\n'
      for (const msg of recentHistory) {
        userMessage += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`
      }
      userMessage += '\n'
    }
    userMessage += `User: ${message}\n\n[Context: ${contextInfo}]`

    // Call LLM to classify intent
    const llmResult = await callLLM(SYSTEM_PROMPT, userMessage)

    const { intent, params = {}, reply, suggestions = [] } = llmResult

    // Execute the action
    let actionResult = null
    switch (intent) {
      case 'add_product':
        actionResult = await handleAddProduct(params)
        break
      case 'search_products':
        actionResult = await handleSearchProducts(params)
        break
      case 'discover_trends':
        actionResult = await handleDiscoverTrends(params)
        break
      case 'get_stats':
        actionResult = await handleGetStats()
        break
      case 'add_supplier':
        actionResult = await handleAddSupplier(params)
        break
      case 'list_suppliers':
        actionResult = await handleListSuppliers(params)
        break
      default:
        // general / help — just return the LLM reply
        break
    }

    res.json({
      reply: actionResult?.error
        ? `Sorry, there was an issue: ${actionResult.error}`
        : actionResult?.message
          ? `${reply}\n\n${actionResult.message}`
          : reply,
      intent,
      params,
      data: actionResult?.data || null,
      suggestions,
      timestamp: new Date().toISOString()
    })
  } catch (err) {
    console.error('[Chat] Error:', err.message)
    // Fallback: try to be helpful without LLM
    res.status(500).json({
      error: err.message,
      reply: 'I had trouble processing that. Try something like "add a product called bamboo cutting board" or "show me my products".',
      suggestions: ['Add a product', 'Show my stats', 'Find trending products']
    })
  }
})

// ─── Quick actions (no LLM needed) ──────────────────────────

router.get('/suggestions', (_req, res) => {
  const productCount = db.prepare('SELECT COUNT(*) as c FROM products').get().c
  const suggestions = []

  if (productCount === 0) {
    suggestions.push(
      { text: 'Add my first product', example: 'Add a product called "Bamboo Cutting Board" in Kitchen' },
      { text: 'What can you help me with?', example: 'help' },
      { text: 'Show trending products', example: 'What products are trending right now?' }
    )
  } else {
    suggestions.push(
      { text: 'Show my products', example: 'List all my products' },
      { text: 'Add a new product', example: 'Add a product called "Silicone Kitchen Utensils" priced at $24.99' },
      { text: 'View my stats', example: 'How is my store doing?' },
      { text: 'Find new opportunities', example: 'What product categories are trending?' },
      { text: 'Research a product', example: 'Research demand for pet grooming gloves' }
    )
  }

  res.json({ suggestions })
})

export default router
