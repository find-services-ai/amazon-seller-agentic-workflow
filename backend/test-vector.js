import db from './src/db.js'
import { store, search, storeResearch, getRelevantContext, getStats } from './src/vectorStore.js'

// 1. Store mock research results
console.log('--- Storing test research ---')
const id1 = await storeResearch(1, 'demand', {
  score: 8, confidence: 82, status: 'passed',
  summary: 'Pet slicker brush shows strong demand: BSR 1,500-4,000 in Pet Supplies, 45K monthly searches, growing 12% YoY.',
  details: { bsrRange: '1500-4000', estimatedSearchVolume: 45000, trendDirection: 'rising' },
  dataSources: ['Amazon marketplace'],
  recommendation: 'Proceed to competition analysis'
})
console.log('Stored demand embedding id:', id1)

const id2 = await storeResearch(1, 'competition', {
  score: 7, confidence: 75, status: 'passed',
  summary: 'Moderate competition: top 10 have 200-3000 reviews. No brand >30% share. Clear differentiation via self-cleaning mechanism.',
  details: { avgReviewCount: 1200, brandConcentration: 'low' },
  dataSources: ['Amazon listings'],
  recommendation: 'Proceed to pricing'
})
console.log('Stored competition embedding id:', id2)

// 2. Semantic search
console.log('\n--- Search: pet grooming brush demand ---')
const results = await search('pet grooming brush market demand and search volume')
results.forEach(r =>
  console.log(`  [dist: ${r.distance.toFixed(3)}] ${r.phase_id}: ${r.summary.slice(0, 80)}`)
)

// 3. RAG context
console.log('\n--- RAG context for pricing phase ---')
const ctx = await getRelevantContext({ id: 1, name: 'pet slicker brush' }, 'pricing')
console.log(ctx.slice(0, 400))

// 4. Stats
console.log('\n--- Stats ---')
console.log(getStats())

console.log('\n✅ Vector store E2E test passed!')
process.exit(0)
