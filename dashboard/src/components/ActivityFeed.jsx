import { CheckCircle, Info, AlertTriangle, Package, Search, Zap } from 'lucide-react'

const typeIcons = {
  'validation': CheckCircle,
  'discovery': Search,
  'research': Info,
  'selection': Package,
  'system': Zap
}

const statusStyles = {
  'success': {
    icon: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20'
  },
  'info': {
    icon: 'text-blue-500',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20'
  },
  'warning': {
    icon: 'text-amber-500',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20'
  }
}

function formatTimestamp(timestamp) {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now - date
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffHours < 1) return 'Just now'
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return 'Yesterday'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function ActivityFeed({ activities }) {
  return (
    <div className="glass-card p-6">
      <div className="space-y-4">
        {activities.map((activity, index) => {
          const Icon = typeIcons[activity.type] || Info
          const style = statusStyles[activity.status] || statusStyles.info

          return (
            <div 
              key={activity.id}
              className={`
                flex items-start gap-4 p-4 rounded-xl border
                ${style.bg} ${style.border}
              `}
            >
              <div className={`p-2 rounded-lg ${style.bg}`}>
                <Icon className={`w-5 h-5 ${style.icon}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-medium text-white">{activity.title}</h4>
                  <span className="text-xs text-slate-500">{formatTimestamp(activity.timestamp)}</span>
                </div>
                <p className="text-sm text-slate-400">{activity.description}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Load More */}
      <button className="w-full mt-4 py-3 rounded-lg border border-slate-700 text-slate-400 text-sm hover:bg-slate-800/50 hover:text-white transition-colors">
        Load More Activity
      </button>
    </div>
  )
}
