import { config as loadEnv } from 'dotenv'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

loadEnv()

const __dirname = dirname(fileURLToPath(import.meta.url))

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
    }
  },
  github: {
    token: process.env.GITHUB_TOKEN,
    owner: process.env.GITHUB_OWNER || '',
    repo: process.env.GITHUB_REPO || ''
  },
  mcpServerUrl: process.env.MCP_SERVER_URL || 'http://localhost:8000',
  repoRoot: join(__dirname, '..', '..')
}
