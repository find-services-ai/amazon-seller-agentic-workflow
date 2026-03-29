import { TrendingUp, DollarSign, Package, Percent, Target, BarChart3 } from 'lucide-react'

export default function KPICards({ data }) {
  const kpis = [
    {
      label: 'Total Investment',
      value: `$${data.totalInvestment}`,
      icon: DollarSign,
      color: 'from-blue-500 to-cyan-500',
      change: 'Budget allocated'
    },
    {
      label: 'Projected Revenue (90d)',
      value: `$${data.projectedRevenue.toLocaleString()}`,
      icon: TrendingUp,
      color: 'from-emerald-500 to-green-500',
      change: '+115% ROI expected'
    },
    {
      label: 'Expected Gross Margin',
      value: `${data.avgMargin}%`,
      icon: Percent,
      color: 'from-amber-500 to-orange-500',
      change: '42% worst-case'
    },
    {
      label: 'Products Pipeline',
      value: data.productsInPipeline,
      icon: Package,
      color: 'from-purple-500 to-pink-500',
      change: '1 validated, ready'
    }
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, index) => (
        <div 
          key={index}
          className="glass-card p-5 hover:border-slate-600/50 transition-all duration-200"
        >
          <div className="flex items-start justify-between mb-3">
            <div className={`p-2 rounded-lg bg-gradient-to-br ${kpi.color}`}>
              <kpi.icon className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-white">{kpi.value}</p>
            <p className="text-sm text-slate-400">{kpi.label}</p>
            <p className="text-xs text-slate-500">{kpi.change}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
