import OpenAI from 'openai'
import config from './config.js'

let client = null

export function isConfigured() {
  const { provider, github, openai, anthropic } = config.llm
  if (provider === 'github') return !!github.token && github.token !== 'ghp_...'
  if (provider === 'openai') return !!openai.apiKey && openai.apiKey !== 'sk-...'
  if (provider === 'anthropic') return !!anthropic.apiKey && anthropic.apiKey !== 'sk-ant-...'
  return false
}

export function getProviderInfo() {
  const { provider, github, openai, anthropic } = config.llm
  const models = { github: github.model, openai: openai.model, anthropic: anthropic.model }
  return {
    provider,
    model: models[provider] || 'unknown',
    configured: isConfigured()
  }
}

function getClient() {
  if (client) return client
  const { provider, github: gh, openai: oai } = config.llm

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

  throw new Error(
    `LLM not configured. Check backend/.env — provider is "${provider}".`
  )
}

export async function callLLM(systemPrompt, userMessage) {
  const { provider, github: gh, openai: oai } = config.llm
  let model = provider === 'github' ? gh.model : oai.model
  // GitHub Models requires vendor prefix
  if (provider === 'github' && !model.includes('/')) {
    model = `openai/${model}`
  }
  const llmClient = getClient()

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
}
