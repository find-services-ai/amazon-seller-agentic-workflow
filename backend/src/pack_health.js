// [BSL] — top-level /health endpoint for AgentOS core health checks
import { healthResponse } from './pack_adapter.js'

export function mountHealth(app) {
  app.get('/health', (_req, res) => res.json(healthResponse()))
  app.get('/pack/manifest', (_req, res) => {
    // Convenience redirect to the router's manifest endpoint
    res.json({
      pack_id: 'amazon-seller',
      name: 'Amazon Seller Pack',
      version: '1.0.0',
      description: 'Autonomous Amazon FBA product research, validation, supplier outreach, and listing generation.',
      billing_unit: 'agent_run',
      tier_required: 'STARTER',
      transport: 'rest',
      agents: ['demand-researcher', 'competition-analyst', 'pricing-strategist', 'supply-chain-analyst', 'risk-assessor'],
      license: 'BSL-1.1',
    })
  })
}
