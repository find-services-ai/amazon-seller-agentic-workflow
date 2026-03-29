# Amazon Seller Investor Dashboard

Real-time visibility into autonomous Amazon seller operations with investor approval gates.

## 🔗 Live Dashboard

**URL:** `https://[your-github-username].github.io/amazon-seller-agentic-workflow/`

## Features

### 📊 KPI Overview
- Total investment tracking
- Projected 90-day revenue
- Expected gross margin
- Products in pipeline

### 🚀 Autonomous Pipeline Status
Visual pipeline showing all 7 phases:
1. **Product Selection** - AI-powered research
2. **Validation** - Market, competition, pricing analysis
3. **Supplier Discovery** - Verified supplier sourcing
4. **Supplier Outreach** - Email quote requests
5. **Negotiation** - Autonomous price negotiation
6. **Procurement** - Order placement (requires approval)
7. **Launch** - Listing and PPC activation

### 📦 Product Cards
- Validation scorecards with component scores
- Market intelligence data
- Supplier comparison
- **GO/NO-GO** veto buttons for each product

### 🔐 Approval Gates
Human-in-the-loop checkpoints for:
- Supplier outreach (before contacting suppliers)
- Payment transactions (samples, inventory)
- Major business decisions

### 📜 Activity Feed
Real-time log of all autonomous actions taken by the system.

## Local Development

```bash
cd dashboard
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Deployment

The dashboard automatically deploys to GitHub Pages when changes are pushed to the `main` branch.

### Manual Deployment
```bash
cd dashboard
npm run deploy
```

### Enable GitHub Pages
1. Go to repo Settings → Pages
2. Set Source to "GitHub Actions"
3. The workflow will deploy automatically

## Data Sync

The dashboard data is synced from `active-deals/` files:
- Product validation scorecards
- Supplier comparison matrices
- Deal status tracking

Run sync manually:
```bash
node scripts/sync-dashboard-data.js
```

## Tech Stack
- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **GitHub Pages** - Hosting

## Contributing

Contributor: **cc-agent**

When updating the dashboard:
1. Modify components in `src/components/`
2. Update data structure in `src/data/dashboardData.js`
3. Push to `main` branch
4. Wait for GitHub Actions deployment

## License

MIT
