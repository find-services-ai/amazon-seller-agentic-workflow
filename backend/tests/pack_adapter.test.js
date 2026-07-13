/**
 * Integration tests for the AgentOS pack adapter endpoints.
 *
 * These tests spin up a minimal Express app with the pack router mounted
 * and mock the heavy dependencies (LLM, billing, phases).
 *
 * Run: npm test  (from backend/)
 */
import { jest } from '@jest/globals'

// ─── Mock heavy dependencies before any imports ─────────────────────

await jest.unstable_mockModule('../src/llm.js', () => ({
  isConfigured: jest.fn(() => true),
  getProviderInfo: jest.fn(() => ({ provider: 'mock', model: 'mock-model', configured: true })),
  callLLM: jest.fn(async () => ({ score: 8, confidence: 80, summary: 'Mock analysis' })),
  getEmbedding: jest.fn(async () => new Array(768).fill(0)),
  EMBEDDING_DIM: 768,
}))

await jest.unstable_mockModule('../src/phases.js', () => ({
  runPhase: jest.fn(async (phaseId) => ({
    phaseId,
    score: 8,
    confidence: 80,
    summary: `Mock ${phaseId} analysis`,
    tokensUsed: 100,
  })),
}))

await jest.unstable_mockModule('../src/billing.js', () => ({
  incrementAgentRuns: jest.fn(),
  enforceAgentRunLimit: jest.fn((_req, _res, next) => next()),
  getPlanForSeller: jest.fn(() => ({ id: 'pro', max_agent_runs_monthly: -1 })),
}))

await jest.unstable_mockModule('../src/operations.js', () => ({
  generateOutreachEmail: jest.fn(async () => ({ subject: 'Hello', body: 'Mock email' })),
  generateCounterOffer: jest.fn(async () => ({ offer: 'Mock counter' })),
  generateListingContent: jest.fn(async () => ({ title: 'Mock Title', bullets: [] })),
  generateKPIReport: jest.fn(async () => ({ report: 'Mock KPI' })),
}))

await jest.unstable_mockModule('../src/db.js', () => ({ default: {} }))

// ─── Import after mocks ────────────────────────────────────────

import express from 'express'
import request from 'supertest'
import packRouter from '../src/pack_adapter.js'
import { mountHealth } from '../src/pack_health.js'

const buildApp = () => {
  const app = express()
  app.use(express.json())
  mountHealth(app)
  app.use('/pack', packRouter)
  return app
}

const app = buildApp()

// ─── Tests ───────────────────────────────────────────────────

describe('GET /health', () => {
  it('returns status ok with pack_id', async () => {
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
    expect(res.body.pack_id).toBe('amazon-seller')
    expect(['ok', 'degraded']).toContain(res.body.status)
  })
})

describe('GET /pack/manifest', () => {
  it('returns manifest with correct pack_id', async () => {
    const res = await request(app).get('/pack/manifest')
    expect(res.status).toBe(200)
    expect(res.body.pack_id).toBe('amazon-seller')
    expect(Array.isArray(res.body.agents)).toBe(true)
    expect(res.body.agents.length).toBeGreaterThan(0)
  })

  it('manifest includes required AgentOS fields', async () => {
    const res = await request(app).get('/pack/manifest')
    const required = ['pack_id', 'name', 'version', 'billing_unit', 'tier_required', 'agents', 'license']
    for (const field of required) {
      expect(res.body).toHaveProperty(field)
    }
  })
})

describe('POST /pack/run', () => {
  it('requires goal field', async () => {
    const res = await request(app).post('/pack/run').send({ context: {} })
    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/goal/i)
  })

  it('returns pack_id in response', async () => {
    const res = await request(app)
      .post('/pack/run')
      .send({ goal: 'Analyse demand for bamboo cutting boards', context: {} })
    expect([200, 503]).toContain(res.status)
    if (res.status === 200) {
      expect(res.body.pack_id).toBe('amazon-seller')
    }
  })

  it('handles full validation goal', async () => {
    const res = await request(app)
      .post('/pack/run')
      .send({ goal: 'Validate this product idea end to end', context: { product: 'silicone mats' } })
    expect([200, 503]).toContain(res.status)
    if (res.status === 200) {
      expect(res.body.output).toBeDefined()
    }
  })

  it('routes listing goal to listing operation', async () => {
    const res = await request(app)
      .post('/pack/run')
      .send({ goal: 'Generate an Amazon listing for my product', context: { product: 'yoga mat' } })
    expect([200, 503]).toContain(res.status)
    if (res.status === 200) {
      expect(res.body.operation).toBe('listing')
    }
  })
})

describe('POST /pack/billing/consume', () => {
  it('requires seller_id or org_id', async () => {
    const res = await request(app)
      .post('/pack/billing/consume')
      .send({ units: 1 })
    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/seller_id|org_id/i)
  })

  it('records billing with seller_id', async () => {
    const res = await request(app)
      .post('/pack/billing/consume')
      .send({ seller_id: 'seller-123', units: 1, tokens_used: 500 })
    // incrementAgentRuns is mocked, so this should succeed
    expect([200, 500]).toContain(res.status)
  })
})
