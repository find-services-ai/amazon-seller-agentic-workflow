# Amazon Seller Agentic Workflow

Autonomous Amazon seller operations system with investor KPI accountability and human-in-the-loop approval gates.

## 🎯 System Overview

This system operates as your **CTO + Product Lead**, optimizing for:
- **Highest gross profit** across products
- **Easy procurement** with verified suppliers
- **Low entry cost** testing ($50-100 first orders)
- **High volume demand** markets
- **Scalable** across categories
- **Efficient supply chain** with dropship capability

## 📊 Investor Dashboard

**Live Dashboard:** `https://[your-github-username].github.io/amazon-seller-agentic-workflow/`

Features:
- Real-time pipeline status (7 autonomous phases)
- Product validation scorecards
- Supplier comparison matrices
- **GO/NO-GO approval gates** at each phase
- KPI tracking and activity feed

See [dashboard/README.md](dashboard/README.md) for setup instructions.

## 🤖 Autonomous Workflow

### 7-Phase Pipeline

| Phase | Autonomous | Human Approval |
|-------|------------|----------------|
| 1. Product Selection | ✅ AI research & scoring | ❌ |
| 2. Validation | ✅ Market, competition, pricing | ⚡ Optional veto |
| 3. Supplier Discovery | ✅ Verified sourcing | ❌ |
| 4. Supplier Outreach | ✅ Email drafting | ⚡ Send approval |
| 5. Negotiation | ✅ Price negotiation | ❌ |
| 6. Procurement | ✅ Order preparation | ✅ **Payment required** |
| 7. Launch | ✅ Listing & PPC | ⚡ Budget approval |

### Guardrails

- **≥35% gross margin** on all products
- **≥18% contribution margin** after all costs
- **≤$1,500** inventory exposure per product
- **All payments** require human approval
- **Automatic pause** if margin drops below threshold

## 📁 Repository Structure

```
.github/
├── agents/                    # VS Code agent configurations
│   ├── amazon-seller-operator.agent.md
│   ├── market-research.agent.md
│   ├── competition-analysis.agent.md
│   └── pricing-strategy.agent.md
├── instructions/              # Instruction files
│   ├── amazon-margin-guardrails.instructions.md
│   └── mcp-routing.instructions.md
├── prompts/                   # Workflow prompts
│   ├── autonomous-launch-product.prompt.md
│   ├── autonomous-daily-operations.prompt.md
│   ├── investor-weekly-review.prompt.md
│   └── product-validation-loop.prompt.md
├── skills/                    # Domain skills
│   ├── amazon-ops-system/     # 8 operational templates
│   └── product-validation/    # Validation methodology
└── workflows/
    └── deploy-dashboard.yml   # GitHub Pages deployment

active-deals/                  # Current product deals
├── [product-name]/
│   ├── PRODUCT-VALIDATION-SCORECARD.md
│   ├── outreach-messages.md
│   └── supplier-comparison-matrix.csv

dashboard/                     # Investor dashboard (React)
├── src/
│   ├── components/
│   └── data/
└── README.md

scripts/
└── sync-dashboard-data.js     # Data sync for dashboard
```

## 🚀 Getting Started

### 1. Enable GitHub Pages

1. Go to repo **Settings → Pages**
2. Set Source to **GitHub Actions**
3. Push changes to deploy dashboard

### 2. Configure MCP Servers

See `.vscode/mcp.json` for Gmail, Google Sheets, and Slack integration.

### 3. Run Autonomous Workflow

Use the **Amazon Seller Operator** agent in VS Code:
```
@amazon-seller-operator Launch new product from selection through supplier outreach
```

## 📋 Current Status

**Active Product:** Self-Cleaning Pet Slicker Brush
- Validation Score: 38/50 (83% confidence) ✅
- Expected Margin: 54% (42% worst-case)
- Verified Suppliers: 5
- First Order Cost: $50-100
- Current Phase: Awaiting supplier outreach approval

## 👤 Contributors

- **cc-agent** - Primary contributor

## 📄 License

MIT
