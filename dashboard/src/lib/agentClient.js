// Agent client — tries local backend first, provides GitHub Actions as cloud alternative
// Local backend: instant results via /api endpoints
// GitHub Actions: free cloud execution, triggers workflow + polls for artifacts

import {
  isGitHubConfigured,
  triggerValidation,
  triggerOperation,
  pollRunUntilDone,
  getRunArtifacts,
  listAllAgentRuns
} from './githubActionsClient.js'

const API_BASE = '/api'

// ─── Backend Detection ───────────────────────────────────────

export async function checkAgentBackend() {
  try {
    const res = await fetch(`${API_BASE}/health`, {
      signal: AbortSignal.timeout(3000)
    })
    if (!res.ok) return null
    const data = await res.json()
    return { ...data, mode: 'local' }
  } catch {
    // No local backend — check GitHub Actions
    if (isGitHubConfigured()) {
      return { status: 'ok', provider: 'github-actions', model: 'gpt-4o-mini (Actions)', configured: true, mode: 'actions' }
    }
    return null
  }
}

export function getAvailableMode() {
  if (isGitHubConfigured()) return 'actions'
  return 'simulated'
}

export async function runResearchPhase({
  phaseId,
  product,
  department,
  budget,
  targetMargin,
  previousResults
}) {
  const res = await fetch(`${API_BASE}/research/phase`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phaseId,
      product,
      department,
      budget,
      targetMargin,
      previousResults
    })
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Backend error' }))
    throw new Error(err.error || `Phase ${phaseId} failed`)
  }

  return await res.json()
}

export async function runFullValidation({ product, department, budget, targetMargin }) {
  const res = await fetch(`${API_BASE}/research/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ product, department, budget, targetMargin })
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Backend error' }))
    throw new Error(err.error || 'Validation failed')
  }

  return await res.json()
}

// ─── Operational Endpoints ───────────────────────────────────

export async function generateEmail({ product, supplier, emailType, context }) {
  const res = await fetch(`${API_BASE}/ops/generate-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ product, supplier, emailType, context })
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Backend error' }))
    throw new Error(err.error || 'Email generation failed')
  }
  return await res.json()
}

export async function generateCounterOffer({ product, supplier, theirOffer, targetLandedCost, budget, round }) {
  const res = await fetch(`${API_BASE}/ops/counter-offer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ product, supplier, theirOffer, targetLandedCost, budget, round })
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Backend error' }))
    throw new Error(err.error || 'Counter-offer generation failed')
  }
  return await res.json()
}

export async function generateListing({ product, category, pricePoint, features, keywords }) {
  const res = await fetch(`${API_BASE}/ops/generate-listing`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ product, category, pricePoint, features, keywords })
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Backend error' }))
    throw new Error(err.error || 'Listing generation failed')
  }
  return await res.json()
}

export async function generateKPIReport({ portfolio, period, metrics, recentActions }) {
  const res = await fetch(`${API_BASE}/ops/kpi-report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ portfolio, period, metrics, recentActions })
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Backend error' }))
    throw new Error(err.error || 'Report generation failed')
  }
  return await res.json()
}
