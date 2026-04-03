import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import config from './config.js'

const AGENT_FILES = {
  demand: 'market-research.agent.md',
  competition: 'competition-analysis.agent.md',
  pricing: 'pricing-strategy.agent.md',
  'supply-chain': 'supplier-management.agent.md',
  risk: 'risk-assessment.agent.md'
}

// Phase-specific skills to inject alongside product-validation
const PHASE_SKILLS = {
  demand: ['product-validation', 'product-discovery'],
  competition: ['product-validation'],
  pricing: ['product-validation', 'listing-optimization'],
  'supply-chain': ['product-validation', 'supplier-management'],
  risk: ['product-validation', 'amazon-ops-system']
}

// Phase-dependent max_tokens — detailed phases get more room
const PHASE_MAX_TOKENS = {
  demand: 3000,
  competition: 4000,
  pricing: 4000,
  'supply-chain': 3000,
  risk: 4000
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

export function getPhaseSkills(phaseId) {
  return PHASE_SKILLS[phaseId] || ['product-validation']
}

export function getPhaseMaxTokens(phaseId) {
  return PHASE_MAX_TOKENS[phaseId] || 3000
}
