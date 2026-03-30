import { callLLM } from './llm.js'
import { loadAgentPrompt } from './agents.js'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import config from './config.js'

// ─── Template loader ─────────────────────────────────────────

function loadTemplate(filename) {
  const filePath = join(config.repoRoot, '.github', 'skills', 'amazon-ops-system', 'templates', filename)
  if (!existsSync(filePath)) return ''
  return readFileSync(filePath, 'utf-8')
}

// ─── Supplier Outreach Email Generation ──────────────────────

export async function generateOutreachEmail({ product, supplier, emailType, context }) {
  const agentPrompt = loadAgentPrompt('supply-chain')
  const templates = loadTemplate('supplier-outreach-email-templates.md')

  const systemPrompt = `${agentPrompt}

${templates ? `\n## Email Templates Reference\n${templates.slice(0, 3000)}\n` : ''}

You are composing a professional supplier outreach email for an Amazon US seller.
Personalize the email using the supplier details and product specifics.

RESPOND WITH ONLY a valid JSON object:
{
  "subject": "<email subject line>",
  "body": "<full email body — plain text, use line breaks>",
  "keyAskPoints": ["<list 3-5 specific information requests in the email>"],
  "followUpDays": <days to wait before follow-up>
}`

  const userMessage = `Generate a ${emailType || 'initial'} outreach email:

Product: ${product}
Supplier: ${supplier?.name || 'Unknown'}
Platform: ${supplier?.platform || 'Made-in-China.com'}
${supplier?.specialization ? `Specialization: ${supplier.specialization}` : ''}
${supplier?.years ? `Years in business: ${supplier.years}+` : ''}
${context?.budget ? `Budget: $${context.budget}` : ''}
${context?.targetMargin ? `Target Margin: ≥${context.targetMargin}%` : ''}
${context?.quantity ? `Target Quantity: ${context.quantity} units` : ''}
${context?.previousQuote ? `Previous Quote: $${context.previousQuote}/unit` : ''}

Email type: ${emailType || 'initial'}
${emailType === 'follow-up' ? 'No response received from initial inquiry — polite follow-up needed.' : ''}
${emailType === 'counter-offer' ? 'We have their initial quote and need to counter-offer.' : ''}
${emailType === 'comparison' ? 'We are comparing multiple suppliers and want their best/final offer.' : ''}`

  return callLLM(systemPrompt, userMessage)
}

// ─── Negotiation Counter-Offer ───────────────────────────────

export async function generateCounterOffer({ product, supplier, theirOffer, targetLandedCost, budget, round }) {
  const agentPrompt = loadAgentPrompt('supply-chain')
  const playbook = loadTemplate('negotiation-playbook.md')

  const systemPrompt = `${agentPrompt}

${playbook ? `\n## Negotiation Playbook\n${playbook}\n` : ''}

Generate a strategic counter-offer using the playbook tactics.

RESPOND WITH ONLY a valid JSON object:
{
  "counterPrice": "<counter-offer price per unit as string>",
  "strategy": "<which tactics from the playbook you are applying>",
  "emailSubject": "<counter-offer email subject>",
  "emailBody": "<full counter-offer email — plain text>",
  "concessions": ["<what you are willing to give up>"],
  "firmPoints": ["<what you will not budge on>"],
  "walkAwayPrice": "<absolute maximum acceptable price>",
  "nextSteps": "<recommended next action>"
}`

  const userMessage = `Generate counter-offer for negotiation round ${round || 1}:

Product: ${product}
Supplier: ${supplier?.name || 'Unknown'}
Their Offer: ${JSON.stringify(theirOffer)}
Target Landed Cost: $${targetLandedCost}
Total Budget: $${budget}

Apply negotiation playbook — maximize value while maintaining supplier relationship.`

  return callLLM(systemPrompt, userMessage)
}

// ─── Amazon Listing Content Generation ───────────────────────

export async function generateListingContent({ product, category, pricePoint, features, keywords }) {
  const agentPrompt = loadAgentPrompt('pricing')
  const listingGuide = loadTemplate('supplier-ai-listing-prompt.md')

  const systemPrompt = `${agentPrompt}

${listingGuide ? `\n## Amazon Listing Guide\n${listingGuide.slice(0, 3000)}\n` : ''}

Generate optimized Amazon US listing content — maximize conversion and search ranking.

RESPOND WITH ONLY a valid JSON object:
{
  "title": "<optimized product title, 150-200 characters>",
  "bulletPoints": ["<5 benefit-first bullet points, 200-250 chars each>"],
  "description": "<1000-2000 char product description>",
  "searchTerms": "<250 chars of backend search terms, space-separated, no brand names>",
  "suggestedPrice": "<recommended price point>",
  "pricingRationale": "<1-2 sentence price justification>",
  "imageGuidance": ["<7 image recommendations matching Amazon requirements>"]
}`

  const userMessage = `Generate Amazon listing content:

Product: ${product}
Category: ${category || 'Not specified'}
Target Price: $${pricePoint || 'TBD'}
${features ? `Key Features: ${features}` : ''}
${keywords ? `Target Keywords: ${keywords}` : ''}

Requirements:
- Title: [Brand] + [Product] + [Key Feature] + [Size/Qty] + [Use Case]
- Bullets: Start with CAPITAL BENEFIT PHRASE, include keywords naturally
- Description: Address top customer concerns, include care instructions
- Search terms: No commas, no brand names, include misspellings and synonyms`

  return callLLM(systemPrompt, userMessage)
}

// ─── Investor KPI Report ─────────────────────────────────────

export async function generateKPIReport({ portfolio, period, metrics, recentActions }) {
  const agentPrompt = loadAgentPrompt('supply-chain')
  const kpiTemplate = loadTemplate('investor-kpi-dashboard-template.md')
  const scorecardTemplate = loadTemplate('product-bet-scorecard-template.md')

  const systemPrompt = `${agentPrompt}

${kpiTemplate ? `\n## KPI Template\n${kpiTemplate}\n` : ''}
${scorecardTemplate ? `\n## Scorecard Template\n${scorecardTemplate}\n` : ''}

Generate a structured investor KPI report. Lead with numbers and variance to target.
Use the investor KPI lens: gross profit first, then margin, then operational efficiency.

RESPOND WITH ONLY a valid JSON object:
{
  "period": "<reporting period>",
  "executiveSummary": "<3-4 sentence overview with key numbers>",
  "kpis": [
    { "name": "<KPI>", "current": "<value>", "target": "<target>", "variance": "<+/-X%>", "trend": "up|down|flat" }
  ],
  "portfolioHeatmap": [
    { "product": "<name>", "status": "Keep|Fix|Scale|Exit", "grossProfit": "<est.>", "action": "<next step>" }
  ],
  "topLeaks": ["<top 3 gross profit leak root causes>"],
  "weekActions": [
    { "action": "<task>", "owner": "AI|Human", "impact": "<expected KPI impact>", "confidence": "<High|Med|Low>" }
  ],
  "expansionBets": [
    { "category": "<category>", "product": "<opportunity>", "estimatedMargin": "<X%>", "entryBudget": "<$X>" }
  ],
  "approvalsNeeded": ["<money-impacting decisions awaiting human approval>"],
  "risks": ["<key risks with kill criteria>"]
}`

  const userMessage = `Generate investor KPI report:

Period: ${period || 'Current Week'}
Portfolio: ${JSON.stringify(portfolio || {
    products: ['Self-Cleaning Pet Slicker Brush'],
    stage: 'Pre-launch — validation complete, supplier outreach phase'
  })}
Metrics: ${JSON.stringify(metrics || {
    stage: 'pre-revenue',
    validationScore: '38/50 (83% confidence)',
    suppliersIdentified: 5,
    outreachStatus: 'pending approval'
  })}
Recent Actions: ${JSON.stringify(recentActions || [
    'Product validated — Pet Slicker Brush scored 38/50',
    '5 suppliers identified on Made-in-China.com',
    'Supplier comparison matrix built',
    'Outreach emails drafted — awaiting investor approval'
  ])}

Report for investor audience — be specific about numbers, timelines, and risks.`

  return callLLM(systemPrompt, userMessage)
}
