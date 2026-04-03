import { config as loadEnv } from 'dotenv'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
loadEnv({ path: join(__dirname, '..', '.env') })

export default {
  port: parseInt(process.env.PORT || '3001'),
  llm: {
    provider: process.env.LLM_PROVIDER || 'github',
    github: {
      token: process.env.GITHUB_TOKEN,
      model: process.env.GITHUB_MODEL || 'gpt-4o-mini'
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || 'gpt-4o'
    },
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY,
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514'
    },
    gemini: {
      apiKey: process.env.GEMINI_API_KEY,
      model: process.env.GEMINI_MODEL || 'gemini-2.5-pro-preview-05-06',
      thinkingModel: process.env.GEMINI_THINKING_MODEL || 'gemini-2.5-pro-preview-05-06'
    }
  },
  github: {
    token: process.env.GITHUB_TOKEN,
    owner: process.env.GITHUB_OWNER || '',
    repo: process.env.GITHUB_REPO || ''
  },
  mcpServerUrl: process.env.MCP_SERVER_URL || 'http://localhost:8000',
  repoRoot: join(__dirname, '..', '..'),
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'amazon-seller-ops-2026',
    sessionHours: parseInt(process.env.SESSION_HOURS || '72')
  }
}
