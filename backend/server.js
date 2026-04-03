import express from 'express'
import cors from 'cors'
import config from './src/config.js'
import { isConfigured, getProviderInfo } from './src/llm.js'
import { runPhase } from './src/phases.js'
import {
  generateOutreachEmail,
  generateCounterOffer,
  generateListingContent,
  generateKPIReport
} from './src/operations.js'
import { registerUser, loginUser, generateToken, requireAuth } from './src/auth.js'

const app = express()
app.use(cors())
app.use(express.json())

// ─── Health Check ────────────────────────────────────────────

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    ...getProviderInfo(),
    timestamp: new Date().toISOString()
  })
})

// ─── Auth Routes (public) ────────────────────────────────────

app.post('/api/auth/register', async (req, res) => {
  const { email, password, name } = req.body
  if (!email || !password) return res.status(400).json({ error: 'email and password required' })
  if (password.length < 6) return res.status(400).json({ error: 'password must be at least 6 characters' })
  try {
    const user = await registerUser(email, password, name)
    const token = generateToken(user)
    res.json({ user, token })
  } catch (err) {
    res.status(409).json({ error: err.message })
  }
})

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'email and password required' })
  try {
    const user = await loginUser(email, password)
    const token = generateToken(user)
    res.json({ user, token })
  } catch (err) {
    res.status(401).json({ error: err.message })
  }
})

app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({ user: req.user })
})

// ─── Protected routes below ──────────────────────────────────
app.use('/api/research', requireAuth)
app.use('/api/ops', requireAuth)

// ─── Run Single Validation Phase ─────────────────────────────

app.post('/api/research/phase', async (req, res) => {
  const { phaseId, product, department, budget, targetMargin, previousResults } = req.body

  if (!product) return res.status(400).json({ error: 'product is required' })
  if (!phaseId) return res.status(400).json({ error: 'phaseId is required' })

  if (!isConfigured()) {
    return res.status(503).json({
      error: 'LLM not configured. Copy backend/.env.example to backend/.env and add your API key.'
    })
  }

  try {
    const result = await runPhase(phaseId, {
      product,
      department,
      budget: budget || 500,
      targetMargin: targetMargin || 35,
      previousResults
    })
    res.json(result)
  } catch (err) {
    console.error(`[Phase ${phaseId}] Error:`, err.message)
    res.status(500).json({ error: err.message })
  }
})

// ─── Run Full Validation (all 5 phases) ──────────────────────

app.post('/api/research/validate', async (req, res) => {
  const { product, department, budget, targetMargin } = req.body

  if (!product) return res.status(400).json({ error: 'product is required' })
  if (!isConfigured()) {
    return res.status(503).json({ error: 'LLM not configured' })
  }

  const phaseIds = ['demand', 'competition', 'pricing', 'supply-chain', 'risk']
  const results = {}

  try {
    for (const phaseId of phaseIds) {
      results[phaseId] = await runPhase(phaseId, {
        product,
        department,
        budget: budget || 500,
        targetMargin: targetMargin || 35,
        previousResults: results
      })
    }

    const totalScore = Object.values(results).reduce((sum, r) => sum + r.score, 0)
    const avgConfidence = Math.round(
      Object.values(results).reduce((sum, r) => sum + r.confidence, 0) / phaseIds.length
    )

    res.json({
      product,
      department,
      totalScore,
      maxScore: 50,
      avgConfidence,
      verdict: totalScore >= 35 ? 'PASS' : totalScore >= 25 ? 'REVIEW' : 'FAIL',
      phases: results
    })
  } catch (err) {
    console.error('[Validate] Error:', err.message)
    res.status(500).json({ error: err.message, completedPhases: results })
  }
})

// ─── Start Server ────────────────────────────────────────────

// Guard: LLM required for operational endpoints
function requireLLM(req, res, next) {
  if (!isConfigured()) {
    return res.status(503).json({ error: 'LLM not configured. Copy .env.example to .env and add your API key.' })
  }
  next()
}

// ─── Operational Endpoints ───────────────────────────────────

// Generate supplier outreach email
app.post('/api/ops/generate-email', requireLLM, async (req, res) => {
  const { product, supplier, emailType, context } = req.body
  if (!product) return res.status(400).json({ error: 'product is required' })

  try {
    const result = await generateOutreachEmail({
      product,
      supplier: supplier || {},
      emailType: emailType || 'initial',
      context: context || {}
    })
    res.json(result)
  } catch (err) {
    console.error('[Generate Email] Error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// Generate negotiation counter-offer
app.post('/api/ops/counter-offer', requireLLM, async (req, res) => {
  const { product, supplier, theirOffer, targetLandedCost, budget, round } = req.body
  if (!product || !theirOffer) return res.status(400).json({ error: 'product and theirOffer are required' })

  try {
    const result = await generateCounterOffer({
      product,
      supplier: supplier || {},
      theirOffer,
      targetLandedCost: targetLandedCost || 3,
      budget: budget || 500,
      round: round || 1
    })
    res.json(result)
  } catch (err) {
    console.error('[Counter Offer] Error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// Generate Amazon listing content
app.post('/api/ops/generate-listing', requireLLM, async (req, res) => {
  const { product, category, pricePoint, features, keywords } = req.body
  if (!product) return res.status(400).json({ error: 'product is required' })

  try {
    const result = await generateListingContent({
      product,
      category,
      pricePoint,
      features,
      keywords
    })
    res.json(result)
  } catch (err) {
    console.error('[Generate Listing] Error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// Generate investor KPI report
app.post('/api/ops/kpi-report', requireLLM, async (req, res) => {
  const { portfolio, period, metrics, recentActions } = req.body

  try {
    const result = await generateKPIReport({
      portfolio,
      period,
      metrics,
      recentActions
    })
    res.json(result)
  } catch (err) {
    console.error('[KPI Report] Error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// ─── Boot ────────────────────────────────────────────────────

app.listen(config.port, () => {
  const info = getProviderInfo()
  console.log(`\n🚀 Agent backend running on http://localhost:${config.port}`)
  console.log(`   LLM: ${info.configured ? `✅ ${info.provider} (${info.model})` : '❌ NOT CONFIGURED — copy .env.example to .env'}`)
  console.log(`   Health: http://localhost:${config.port}/api/health\n`)
})
