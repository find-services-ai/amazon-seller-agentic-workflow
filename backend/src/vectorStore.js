import db from './db.js'
import { getEmbedding, EMBEDDING_DIM } from './llm.js'

// ─── Prepared statements ─────────────────────────────────────

const insertMeta = db.prepare(`
  INSERT INTO embeddings_meta (type, ref_id, product_id, phase_id, summary, metadata)
  VALUES (?, ?, ?, ?, ?, ?)
`)

const insertVec = db.prepare(`
  INSERT INTO embeddings_vec (id, embedding)
  VALUES (?, ?)
`)

const storeTransaction = db.transaction((meta, embeddingBuf) => {
  const { lastInsertRowid } = insertMeta.run(
    meta.type, meta.refId, meta.productId, meta.phaseId, meta.summary, meta.metadata
  )
  const id = Number(lastInsertRowid)
  insertVec.run(id, embeddingBuf)
  return id
})

// ─── Store an embedding ──────────────────────────────────────

export async function store({ type, refId = null, productId = null, phaseId = null, text, summary = '', metadata = {} }) {
  const embedding = await getEmbedding(text)
  const buf = Buffer.from(new Float32Array(embedding).buffer)
  const id = storeTransaction(
    { type, refId, productId, phaseId, summary, metadata: JSON.stringify(metadata) },
    buf
  )
  return id
}

// ─── Semantic search ─────────────────────────────────────────

export async function search(query, { limit = 5, type = null, productId = null, phaseId = null, excludeProductId = null } = {}) {
  const embedding = await getEmbedding(query)
  const buf = Buffer.from(new Float32Array(embedding).buffer)

  // vec0 KNN query — fetch more than needed so we can filter
  const fetchLimit = limit * 4
  const vecRows = db.prepare(`
    SELECT id, distance
    FROM embeddings_vec
    WHERE embedding MATCH ?
    ORDER BY distance
    LIMIT ?
  `).all(buf, fetchLimit)

  if (vecRows.length === 0) return []

  const ids = vecRows.map(r => r.id)
  const distMap = Object.fromEntries(vecRows.map(r => [r.id, r.distance]))

  // Fetch metadata and apply filters
  const placeholders = ids.map(() => '?').join(',')
  let filterClauses = []
  let filterParams = []

  if (type) { filterClauses.push('type = ?'); filterParams.push(type) }
  if (productId) { filterClauses.push('product_id = ?'); filterParams.push(productId) }
  if (phaseId) { filterClauses.push('phase_id = ?'); filterParams.push(phaseId) }
  if (excludeProductId) { filterClauses.push('product_id != ?'); filterParams.push(excludeProductId) }

  const where = filterClauses.length > 0
    ? `AND ${filterClauses.join(' AND ')}`
    : ''

  const metaRows = db.prepare(`
    SELECT id, type, ref_id, product_id, phase_id, summary, metadata, created_at
    FROM embeddings_meta
    WHERE id IN (${placeholders}) ${where}
    ORDER BY id
  `).all(...ids, ...filterParams)

  // Merge distance + metadata, sort by distance, limit
  return metaRows
    .map(row => ({
      ...row,
      metadata: row.metadata ? JSON.parse(row.metadata) : {},
      distance: distMap[row.id],
      similarity: 1 - distMap[row.id] // cosine distance → similarity
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit)
}

// ─── Store research phase result ─────────────────────────────

export async function storeResearch(productId, phaseId, result) {
  const text = buildResearchText(phaseId, result)
  return store({
    type: 'research',
    productId,
    phaseId,
    text,
    summary: result.summary || '',
    metadata: {
      score: result.score,
      confidence: result.confidence,
      status: result.status,
      recommendation: result.recommendation
    }
  })
}

// ─── Store agent run output ──────────────────────────────────

export async function storeAgentRun(agentRunId, productId, agentName, output) {
  const text = typeof output === 'string' ? output : JSON.stringify(output)
  return store({
    type: 'agent_run',
    refId: agentRunId,
    productId,
    summary: `${agentName} run for product ${productId}`,
    text: text.slice(0, 32000),
    metadata: { agentName }
  })
}

// ─── Get relevant context for a phase (RAG) ─────────────────

export async function getRelevantContext(product, phaseId, { limit = 3 } = {}) {
  const query = `${product} ${phaseId} Amazon product research`

  // Get similar research from OTHER products (cross-product learning)
  const crossProduct = await search(query, {
    limit,
    type: 'research',
    phaseId,
    excludeProductId: null // include all
  })

  // Get same-product prior phases (pipeline context)
  const sameProduct = product.id
    ? await search(query, {
        limit: 3,
        type: 'research',
        productId: product.id
      })
    : []

  // Deduplicate by id
  const seen = new Set()
  const all = [...sameProduct, ...crossProduct].filter(r => {
    if (seen.has(r.id)) return false
    seen.add(r.id)
    return true
  })

  if (all.length === 0) return ''

  const contextBlocks = all.map(r =>
    `[${r.phase_id || 'research'}] (score: ${r.metadata.score}/10, confidence: ${r.metadata.confidence}%)\n${r.summary}`
  )

  return `## Relevant Past Research\n${contextBlocks.join('\n\n')}`
}

// ─── Helper: build searchable text from research result ──────

function buildResearchText(phaseId, result) {
  const parts = [
    `Phase: ${phaseId}`,
    `Score: ${result.score}/10`,
    `Confidence: ${result.confidence}%`,
    `Summary: ${result.summary || ''}`,
    `Recommendation: ${result.recommendation || ''}`
  ]

  if (result.details) {
    parts.push(`Details: ${JSON.stringify(result.details)}`)
  }

  if (result.dataSources) {
    parts.push(`Sources: ${result.dataSources.join(', ')}`)
  }

  return parts.join('\n')
}

// ─── Stats ───────────────────────────────────────────────────

export function getStats() {
  const total = db.prepare('SELECT COUNT(*) as c FROM embeddings_meta').get().c
  const byType = db.prepare('SELECT type, COUNT(*) as c FROM embeddings_meta GROUP BY type').all()
  return { total, byType }
}
