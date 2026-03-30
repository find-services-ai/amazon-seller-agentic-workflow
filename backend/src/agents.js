import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import config from './config.js'

const AGENT_FILES = {
  demand: 'market-research.agent.md',
  competition: 'competition-analysis.agent.md',
  pricing: 'pricing-strategy.agent.md',
  'supply-chain': 'amazon-seller-operator.agent.md',
  risk: 'amazon-seller-operator.agent.md'
}

const promptCache = {}
const skillCache = {}

export function loadAgentPrompt(phaseId) {
  if (promptCache[phaseId]) return promptCache[phaseId]

  const file = AGENT_FILES[phaseId]
  if (!file) return null

  const filePath = join(config.repoRoot, '.github', 'agents', file)
  if (!existsSync(filePath)) return null

  const content = readFileSync(filePath, 'utf-8')
  const match = content.match(/^---\n[\s\S]*?\n---\n([\s\S]*)/)
  const prompt = match ? match[1].trim() : content

  promptCache[phaseId] = prompt
  return prompt
}

export function loadSkillContext(skillName) {
  if (skillCache[skillName]) return skillCache[skillName]

  const filePath = join(config.repoRoot, '.github', 'skills', skillName, 'SKILL.md')
  if (!existsSync(filePath)) return null

  const content = readFileSync(filePath, 'utf-8')
  const match = content.match(/^---\n[\s\S]*?\n---\n([\s\S]*)/)
  const skill = match ? match[1].trim() : content

  skillCache[skillName] = skill
  return skill
}
