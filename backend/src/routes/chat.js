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

const SYSTEM_PROMPT = `You are a seller platform assistant powered by specialized AI agents. The user interacts with you in natural language to manage their Amazon seller business.

You have access to 12 specialized agents for research, supplier management, listing optimization, PPC campaigns, and inventory management. When the user asks about researching a product, you should route to the full 5-phase validation pipeline.

Your job: understand the user's intent and return a structured JSON response.

## Available Actions

1. **add_product** — User wants to add a new product idea to their catalog
   Extract: name (required), category, targetPrice, description

2. **search_products** — User wants to find/list existing products
   Extract: query, status filter

3. **discover_trends** — User wants to find new product opportunities or trends
   Extract: category, keywords

4. **research_product** — User wants to validate/research a product through the 5-phase pipeline (demand → competition → pricing → supply-chain → risk). Each phase uses a specialized agent.
   Extract: product (required — product name), phase (optional: "demand"|"competition"|"pricing"|"supply-chain"|"risk"|"all"). Default to "all" for full validation.
   Also extract: budget (default 500), targetMargin (default 35), category (optional)

5. **add_supplier** — User wants to add a supplier
   Extract: name, platform, contactEmail, website, specialization

6. **list_suppliers** — User wants to see suppliers
   Extract: productSlug filter (optional)

7. **get_stats** — User wants to see dashboard stats/KPIs

8. **generate_email** — User wants to draft a supplier outreach email
   Extract: product (required), supplierName, emailType (initial|follow-up|counter-offer|comparison)

9. **create_listing** — User wants to create a store listing
   Extract: productSlug, channel (storefront|amazon|both), title, price

10. **generate_listing** — User wants AI to generate optimized Amazon listing content
    Extract: product (required), category, pricePoint, features, keywords

11. **kpi_report** — User wants an investor KPI report
    Extract: period (optional)

12. **help** — User needs guidance on what they can do

13. **general** — General conversation, advice, or questions about selling

## Research Pipeline Detail
The 5-phase validation uses these specialized agents:
- Phase 1 (Demand): Market Research Agent — BSR, search volume, Google Trends, seasonality
- Phase 2 (Competition): Competition Analysis Agent — top 10 audit, brand dominance, barriers
- Phase 3 (Pricing): Pricing Strategy Agent — margins, fees, landed cost, break-even
- Phase 4 (Supply Chain): Amazon Seller Operator — suppliers, MOQ, lead time, quality
- Phase 5 (Risk): Amazon Seller Operator — weighted risk across all factors

Each phase scores 1-10. Total validation: X/50. Pass ≥ 35, Review 25-34, Fail < 25.

RESPOND WITH ONLY a valid JSON object:
{
  "intent": "<action name from above>",
  "params": { <extracted parameters> },
  "reply": "<friendly natural language response to show the user — explain what you're doing>",
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

// ─── Research Product (5-Phase Agent Pipeline) ───────────────

const PHASE_ORDER = ['demand', 'competition', 'pricing', 'supply-chain', 'risk']
const PHASE_AGENTS = {
  demand: 'Market Research Agent',
  competition: 'Competition Analysis Agent',
  pricing: 'Pricing Strategy Agent',
  'supply-chain': 'Amazon Seller Operator',
  risk: 'Amazon Seller Operator'
}
const PHASE_LABELS = {
  demand: 'Demand Validation',
  competition: 'Competition Analysis',
  pricing: 'Pricing Viability',
  'supply-chain': 'Supply Chain Check',
  risk: 'Risk Assessment'
}

async function handleResearchProduct(params) {
  if (!params.product) return { error: 'Product name is required for research' }
  if (!isConfigured()) return { error: 'LLM not configured. Set up your API key in backend/.env' }

  const productName = params.product
  const budget = params.budget || 500
  const targetMargin = params.targetMargin || 35
  const department = params.category || null

  // Find or create the product in catalog
  const slug = productName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  let product = db.prepare('SELECT id, slug, name, status FROM products WHERE slug = ?').get(slug)

  if (!product) {
    // Auto-create the product as an idea
    let categoryId = null
    if (department) {
      const cat = db.prepare('SELECT id FROM categories WHERE name = ? COLLATE NOCASE').get(department)
      if (cat) categoryId = cat.id
    }
    db.prepare(`
      INSERT INTO products (name, slug, category_id, status, budget_limit)
      VALUES (?, ?, ?, 'idea', ?)
    `).run(productName, slug, categoryId, budget)
    product = db.prepare('SELECT id, slug, name, status FROM products WHERE slug = ?').get(slug)
  }

  // Update product status to researching
  db.prepare("UPDATE products SET status = 'researching', updated_at = datetime('now') WHERE id = ?").run(product.id)

  // Determine which phases to run
  const phasesToRun = params.phase && params.phase !== 'all'
    ? [params.phase]
    : PHASE_ORDER

  const results = {}
  const phaseResults = []
  let failedAt = null

  for (const phaseId of phasesToRun) {
    const startTime = Date.now()
    try {
      const result = await runPhase(phaseId, {
        product: productName,
        productId: product.id,
        department,
        budget,
        targetMargin,
        previousResults: results
      })

      results[phaseId] = result
      const durationMs = Date.now() - startTime

      // Log to research_sessions
      db.prepare(`
        INSERT INTO research_sessions (product_id, phase_id, score, confidence, verdict, result_data)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        product.id,
        phaseId,
        result.score,
        result.confidence,
        result.status.toUpperCase(),
        JSON.stringify(result)
      )

      // Log agent run (map phase status to agent_runs status)
      const agentRunStatus = result.status === 'passed' ? 'completed'
        : result.status === 'review' ? 'completed'
        : 'failed'
      db.prepare(`
        INSERT INTO agent_runs (agent_name, product_id, phase, input, output, score, confidence, duration_ms, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        PHASE_AGENTS[phaseId],
        product.id,
        phaseId,
        JSON.stringify({ product: productName, budget, targetMargin }),
        JSON.stringify(result),
        result.score,
        result.confidence,
        durationMs,
        agentRunStatus
      )

      phaseResults.push({
        phaseId,
        name: PHASE_LABELS[phaseId],
        agent: PHASE_AGENTS[phaseId],
        score: result.score,
        confidence: result.confidence,
        status: result.status,
        summary: result.summary,
        recommendation: result.recommendation,
        details: result.details,
        durationMs
      })

      // If a phase fails hard, note it but continue all phases for complete picture
      if (result.status === 'failed') {
        failedAt = failedAt || phaseId
      }
    } catch (err) {
      console.error(`[Chat Research] Phase ${phaseId} error:`, err.message)
      phaseResults.push({
        phaseId,
        name: PHASE_LABELS[phaseId],
        agent: PHASE_AGENTS[phaseId],
        score: 0,
        confidence: 0,
        status: 'error',
        summary: `Error: ${err.message}`,
        recommendation: 'Retry this phase',
        details: {},
        durationMs: Date.now() - startTime
      })
    }
  }

  // Calculate totals
  const totalScore = phaseResults.reduce((sum, r) => sum + r.score, 0)
  const maxScore = phasesToRun.length * 10
  const avgConfidence = Math.round(
    phaseResults.reduce((sum, r) => sum + r.confidence, 0) / phaseResults.length
  )
  const verdict = totalScore >= (phasesToRun.length * 7) ? 'PASS'
    : totalScore >= (phasesToRun.length * 5) ? 'REVIEW'
    : 'FAIL'

  // Update product with validation results
  db.prepare(`
    UPDATE products
    SET validation_score = ?, confidence = ?, status = ?,
        updated_at = datetime('now')
    WHERE id = ?
  `).run(
    totalScore,
    avgConfidence,
    verdict === 'PASS' ? 'validated' : verdict === 'REVIEW' ? 'researching' : 'idea',
    product.id
  )

  const scorecard = {
    product: productName,
    productId: product.id,
    slug: product.slug,
    totalScore,
    maxScore,
    avgConfidence,
    verdict,
    phases: phaseResults
  }

  const phasesSummary = phaseResults.map(p =>
    `${p.status === 'passed' ? '✅' : p.status === 'review' ? '⚠️' : '❌'} ${p.name}: ${p.score}/10 (${p.confidence}%)`
  ).join('\n')

  const verdictEmoji = verdict === 'PASS' ? '🟢' : verdict === 'REVIEW' ? '🟡' : '🔴'
  const message = `Research complete for "${productName}"\n\n${verdictEmoji} Verdict: ${verdict} — ${totalScore}/${maxScore} (${avgConfidence}% confidence)\n\n${phasesSummary}`

  return { data: scorecard, message }
}

// ─── Generate Supplier Email (uses Supplier Management Agent) ─

async function handleGenerateEmail(params) {
  if (!params.product) return { error: 'Product name is required' }
  if (!isConfigured()) return { error: 'LLM not configured' }

  const result = await generateOutreachEmail({
    product: params.product,
    supplier: { name: params.supplierName || 'Supplier', platform: params.platform || 'Made-in-China.com' },
    emailType: params.emailType || 'initial',
    context: { budget: params.budget || 500, targetMargin: params.targetMargin || 35 }
  })

  return {
    data: result,
    message: `Generated ${params.emailType || 'initial'} outreach email for "${params.product}".`
  }
}

// ─── Generate Amazon Listing (uses Listing Optimization Agent) ─

async function handleGenerateListing(params) {
  if (!params.product) return { error: 'Product name is required' }
  if (!isConfigured()) return { error: 'LLM not configured' }

  const result = await generateListingContent({
    product: params.product,
    category: params.category,
    pricePoint: params.pricePoint,
    features: params.features,
    keywords: params.keywords
  })

  return {
    data: result,
    message: `Generated optimized Amazon listing for "${params.product}".`
  }
}

// ─── Generate KPI Report (uses Amazon Seller Operator Agent) ─

async function handleKPIReport(params) {
  if (!isConfigured()) return { error: 'LLM not configured' }

  const products = db.prepare("SELECT name, status, validation_score FROM products ORDER BY created_at DESC LIMIT 10").all()

  const result = await generateKPIReport({
    portfolio: { products: products.map(p => p.name), stages: products.map(p => `${p.name}: ${p.status}`) },
    period: params.period || 'Current Week',
    metrics: {
      totalProducts: products.length,
      validated: products.filter(p => p.validation_score >= 35).length,
      inResearch: products.filter(p => p.status === 'researching').length
    },
    recentActions: []
  })

  return {
    data: result,
    message: 'Generated investor KPI report.'
  }
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
      case 'research_product':
        actionResult = await handleResearchProduct(params)
        break
      case 'generate_email':
        actionResult = await handleGenerateEmail(params)
        break
      case 'generate_listing':
        actionResult = await handleGenerateListing(params)
        break
      case 'kpi_report':
        actionResult = await handleKPIReport(params)
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
    // Find a product that could be researched
    const unresearched = db.prepare(
      "SELECT name FROM products WHERE status IN ('idea', 'researching') ORDER BY created_at DESC LIMIT 1"
    ).get()

    suggestions.push(
      { text: 'Show my products', example: 'List all my products' },
      { text: 'Add a new product', example: 'Add a product called "Silicone Kitchen Utensils" priced at $24.99' },
      {
        text: 'Run full product research',
        example: unresearched
          ? `Research "${unresearched.name}" — run all 5 validation phases`
          : 'Research "Bamboo Cutting Board" — run full validation'
      },
      { text: 'Generate supplier email', example: 'Draft an outreach email for my pet slicker brush suppliers' },
      { text: 'View my stats', example: 'How is my store doing?' }
    )
  }

  res.json({ suggestions })
})

export default router
