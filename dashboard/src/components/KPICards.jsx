import { TrendingUp, DollarSign, Package, Percent } from 'lucide-react'

export default function KPICards({ data }) {
  const kpis = [
    {
      label: 'Invested',
      value: `$${data.totalInvestment}`,
      icon: DollarSign,
      tone: 'text-text-secondary',
      change: 'Budget set'
    },
    {
      label: 'Projected Revenue (90d)',
      value: `$${data.projectedRevenue.toLocaleString()}`,
      icon: TrendingUp,
      tone: 'text-status-good',
      change: '+115% ROI'
    },
    {
      label: 'Gross Margin',
      value: `${data.avgMargin}%`,
      icon: Percent,
      tone: 'text-status-good',
      change: 'Target above 35%'
    },
    {
      label: 'Products',
      value: data.productsInPipeline,
      icon: Package,
      tone: 'text-text-secondary',
      change: 'In pipeline'
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {kpis.map((kpi, index) => (
        <div 
          key={index}
          className="card"
        >
          <div className="flex items-center justify-between mb-6">
            <p className="text-caption text-text-secondary">{kpi.label}</p>
            <div className="w-8 h-8 rounded-lg bg-surface-overlay flex items-center justify-center">
              <kpi.icon className={`w-4 h-4 ${kpi.tone}`} />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-semibold tracking-tight">{kpi.value}</p>
            <p className="text-caption text-text-muted">{kpi.change}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
