// Dashboard data - synced from autonomous operations
export const kpiData = {
  totalInvestment: 500,
  projectedRevenue: 2850,
  expectedRoi: 115,
  productsActive: 1,
  productsInPipeline: 1,
  avgMargin: 54
}

export const pipelineData = [
  {
    id: 1,
    name: 'Product Selection',
    status: 'completed',
    description: 'AI-powered product research and validation',
    completedAt: '2026-03-28T14:30:00Z'
  },
  {
    id: 2,
    name: 'Validation',
    status: 'completed',
    description: 'Market, competition, and pricing analysis',
    completedAt: '2026-03-29T10:15:00Z',
    score: '38/50'
  },
  {
    id: 3,
    name: 'Supplier Discovery',
    status: 'completed',
    description: 'Verified supplier sourcing from Made-in-China',
    completedAt: '2026-03-29T11:00:00Z',
    suppliers: 5
  },
  {
    id: 4,
    name: 'Supplier Outreach',
    status: 'awaiting-approval',
    description: 'Email outreach with quote requests',
    requiresApproval: true
  },
  {
    id: 5,
    name: 'Negotiation',
    status: 'pending',
    description: 'Autonomous price and terms negotiation'
  },
  {
    id: 6,
    name: 'Procurement',
    status: 'pending',
    description: 'Order placement and payment processing',
    requiresApproval: true
  },
  {
    id: 7,
    name: 'Launch',
    status: 'pending',
    description: 'Listing creation and PPC campaign start'
  }
]

export const productsData = [
  {
    id: 'pet-slicker-brush',
    name: 'Self-Cleaning Pet Slicker Brush',
    category: 'Pet Supplies',
    status: 'validated',
    validationScore: 38,
    maxScore: 50,
    confidence: 83,
    metrics: {
      expectedMargin: 54,
      worstCaseMargin: 42,
      firstOrderCost: '$50-100',
      targetPrice: '$12.99-14.99',
      unitCost: '$2.20',
      demandScore: 8,
      competitionScore: 6,
      pricingScore: 9,
      supplyChainScore: 8,
      riskScore: 7
    },
    marketData: {
      marketSize: '$14.69B',
      cagr: '6%',
      usMarketShare: '78.2%',
      onlineGrowth: '7.6%'
    },
    suppliers: [
      { name: 'Ningbo Movepeak Pet Supplies', price: '$0.30-0.90', moq: 1000 },
      { name: 'Yangzhou Factory', price: '$0.20-0.80', moq: 500 },
      { name: 'Huangyan District Supplier', price: '$0.50-1.50', moq: 300 },
      { name: 'Shenzhen Maker', price: '$0.47-1.00', moq: 100 },
      { name: 'Premium Yangzhou', price: '$0.90-2.20', moq: 50 }
    ],
    currentPhase: 'supplier-outreach'
  }
]

export const approvalsData = [
  {
    id: 'supplier-outreach-001',
    type: 'supplier-outreach',
    title: 'Send Supplier Inquiry Emails',
    description: 'Send quote requests to 5 verified suppliers for Pet Slicker Brush',
    product: 'Pet Slicker Brush',
    status: 'pending',
    requestedAt: '2026-03-29T12:00:00Z',
    impact: 'Low Risk - Information gathering only',
    details: {
      suppliers: 5,
      estimatedResponse: '24-48 hours',
      noFinancialCommitment: true
    }
  },
  {
    id: 'sample-order-001',
    type: 'payment',
    title: 'Sample Order Payment',
    description: 'Order samples from top 2 suppliers for quality verification',
    product: 'Pet Slicker Brush',
    status: 'upcoming',
    estimatedAmount: '$50',
    impact: 'Medium - First financial commitment'
  },
  {
    id: 'inventory-order-001',
    type: 'payment',
    title: 'Initial Inventory Order',
    description: 'First production order based on sample quality',
    product: 'Pet Slicker Brush',
    status: 'upcoming',
    estimatedAmount: '$250',
    impact: 'High - Main inventory investment'
  }
]

export const activityData = [
  {
    id: 1,
    type: 'validation',
    title: 'Product Validation Completed',
    description: 'Pet Slicker Brush passed validation with 38/50 score (83% confidence)',
    timestamp: '2026-03-29T10:15:00Z',
    status: 'success'
  },
  {
    id: 2,
    type: 'discovery',
    title: 'Supplier Discovery Complete',
    description: '5 verified suppliers found on Made-in-China.com with prices $0.30-$2.20/unit',
    timestamp: '2026-03-29T11:00:00Z',
    status: 'success'
  },
  {
    id: 3,
    type: 'research',
    title: 'Market Research Verified',
    description: 'Pet Grooming market: $14.69B (2024), 6% CAGR, online growing 7.6%',
    timestamp: '2026-03-29T09:30:00Z',
    status: 'info'
  },
  {
    id: 4,
    type: 'selection',
    title: 'Product Selection Complete',
    description: 'Self-Cleaning Pet Slicker Brush selected as top candidate',
    timestamp: '2026-03-28T14:30:00Z',
    status: 'success'
  },
  {
    id: 5,
    type: 'system',
    title: 'Autonomous System Initialized',
    description: 'CTO Agent configured with investor KPI guardrails',
    timestamp: '2026-03-28T10:00:00Z',
    status: 'info'
  }
]
