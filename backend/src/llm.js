import OpenAI from 'openai'
import config from './config.js'

let client = null

export function isConfigured() {
  const { provider, github, openai, anthropic, gemini } = config.llm
  if (provider === 'github') return !!github.token && github.token !== 'ghp_...'
  if (provider === 'openai') return !!openai.apiKey && openai.apiKey !== 'sk-...'
  if (provider === 'anthropic') return !!anthropic.apiKey && anthropic.apiKey !== 'sk-ant-...'
  if (provider === 'gemini') return !!gemini.apiKey && gemini.apiKey !== 'AIza...'
  return false
}

export function getProviderInfo() {
  const { provider, github, openai, anthropic, gemini } = config.llm
  const models = { github: github.model, openai: openai.model, anthropic: anthropic.model, gemini: gemini.model }
  return {
    provider,
    model: models[provider] || 'unknown',
    configured: isConfigured()
  }
}

function getClient() {
  if (client) return client
  const { provider, github: gh, openai: oai, gemini: gem } = config.llm

  if (provider === 'github' && gh.token) {
    // GitHub Models — free, OpenAI-compatible API
    client = new OpenAI({
      baseURL: 'https://models.github.ai/inference',
      apiKey: gh.token
    })
    return client
  }

  if (provider === 'openai' && oai.apiKey) {
    client = new OpenAI({ apiKey: oai.apiKey })
    return client
  }

  if (provider === 'gemini' && gem.apiKey) {
    // Gemini — Google AI, OpenAI-compatible endpoint
    client = new OpenAI({
      baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
      apiKey: gem.apiKey
    })
    return client
  }

  throw new Error(
    `LLM not configured. Check backend/.env — provider is "${provider}".`
  )
}

export async function callLLM(systemPrompt, userMessage, { useThinking = false } = {}) {
  const { provider, github: gh, openai: oai, gemini: gem } = config.llm
  let model
  if (provider === 'gemini') {
    model = useThinking ? gem.thinkingModel : gem.model
  } else if (provider === 'github') {
    model = gh.model
  } else {
    model = oai.model
  }
  // GitHub Models requires vendor prefix
  if (provider === 'github' && !model.includes('/')) {
    model = `openai/${model}`
  }
  const llmClient = getClient()

  const maxRetries = 4
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await llmClient.chat.completions.create({
        model,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.3,
        max_tokens: 2500
      })

      const text = response.choices[0].message.content
      const cleaned = text.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim()
      return JSON.parse(cleaned)
    } catch (err) {
      const status = err?.status || err?.response?.status
      if (status === 429 && attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500
        console.log(`[LLM] Rate limited (429), retrying in ${Math.round(delay)}ms (attempt ${attempt + 1}/${maxRetries})`)
        await new Promise(r => setTimeout(r, delay))
        continue
      }
      throw err
    }
  }
}

// ─── Embedding generation ────────────────────────────────────

const EMBEDDING_MODELS = {
  gemini: 'gemini-embedding-001',        // 3072 native, supports dimension reduction
  github: 'openai/text-embedding-3-small',
  openai: 'text-embedding-3-small',
  anthropic: 'text-embedding-3-small'    // falls back to OpenAI-compat
}

const EMBEDDING_DIM = 768

export async function getEmbedding(text) {
  const llmClient = getClient()
  const { provider } = config.llm
  const model = EMBEDDING_MODELS[provider] || EMBEDDING_MODELS.openai

  // Truncate to ~8k tokens worth of text (~32k chars) to stay within limits
  const truncated = text.length > 32000 ? text.slice(0, 32000) : text

  const response = await llmClient.embeddings.create({
    model,
    input: truncated,
    dimensions: EMBEDDING_DIM
  })
  return response.data[0].embedding
}

export { EMBEDDING_DIM }
