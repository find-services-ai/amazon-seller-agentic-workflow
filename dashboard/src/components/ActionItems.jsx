import {
  AlertCircle, CheckCircle, Clock, ArrowUp, ArrowRight,
  Zap, Eye, CreditCard, Settings, ChevronRight, Flag
} from 'lucide-react'

const priorityConfig = {
  critical: { color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30', icon: AlertCircle, label: 'Critical' },
  high: { color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/30', icon: ArrowUp, label: 'High' },
  medium: { color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/30', icon: ArrowRight, label: 'Medium' },
  low: { color: 'text-slate-400', bg: 'bg-slate-500/20', border: 'border-slate-500/30', icon: Clock, label: 'Low' }
}

const typeIcons = {
  approval: Zap,
  review: Eye,
  action: CreditCard,
  workflow: Settings,
  setup: Settings
}

export default function ActionItems({ items, onComplete }) {
  const pendingItems = items.filter(i => i.status === 'pending')
  const upcomingItems = items.filter(i => i.status === 'upcoming')

  return (
    <div className="space-y-6">
      {/* Impact summary */}
      <div className="glass-card p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-red-400">{items.filter(i => i.priority === 'critical').length}</p>
            <p className="text-xs text-slate-400">Critical</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-400">{items.filter(i => i.priority === 'high').length}</p>
            <p className="text-xs text-slate-400">High Priority</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-400">{pendingItems.length}</p>
            <p className="text-xs text-slate-400">Pending Actions</p>
          </div>
        </div>
      </div>

      {/* Action Now */}
      {pendingItems.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Flag className="w-4 h-4 text-red-400" />
            Action Required
          </h3>
          <div className="space-y-3">
            {pendingItems.map(item => {
              const pConfig = priorityConfig[item.priority]
              const PIcon = pConfig.icon
              const TypeIcon = typeIcons[item.type] || Zap

              return (
                <div key={item.id} className={`glass-card p-4 border ${pConfig.border}`}>
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${pConfig.bg}`}>
                      <TypeIcon className={`w-4 h-4 ${pConfig.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-white">{item.title}</h4>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${pConfig.bg} ${pConfig.color}`}>
                          {pConfig.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mb-2">{item.description}</p>

                      {/* Impact & Effort */}
                      <div className="flex items-center gap-4 text-xs mb-3">
                        <span className="text-slate-500">
                          Impact: <span className="text-white">{item.estimatedImpact}</span>
                        </span>
                        <span className="text-slate-500">
                          Effort: <span className="text-white">{item.effort}</span>
                        </span>
                      </div>

                      {/* Why it matters */}
                      <div className="p-2 rounded-lg bg-slate-800/50 mb-3">
                        <p className="text-xs text-slate-300">
                          <span className="text-amazon-orange font-semibold">Why: </span>
                          {item.impact}
                        </p>
                      </div>

                      {/* Action button */}
                      <div className="flex items-center gap-2">
                        {item.type === 'approval' && (
                          <>
                            <button
                              onClick={() => onComplete && onComplete(item.id, 'rejected')}
                              className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/30 transition-colors"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => onComplete && onComplete(item.id, 'approved')}
                              className="px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-medium hover:bg-emerald-500/30 transition-colors flex items-center gap-1"
                            >
                              <CheckCircle className="w-3 h-3" />
                              Approve
                            </button>
                          </>
                        )}
                        {item.type === 'review' && (
                          <button className="px-4 py-2 rounded-lg bg-blue-500/20 text-blue-400 text-xs font-medium hover:bg-blue-500/30 transition-colors flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            Review Now
                          </button>
                        )}
                        {(item.type === 'action' || item.type === 'workflow' || item.type === 'setup') && (
                          <button
                            onClick={() => onComplete && onComplete(item.id, 'done')}
                            className="px-4 py-2 rounded-lg bg-slate-700/50 text-slate-300 text-xs font-medium hover:bg-slate-700 transition-colors flex items-center gap-1"
                          >
                            <CheckCircle className="w-3 h-3" />
                            Mark Done
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Upcoming */}
      {upcomingItems.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Coming Up
          </h3>
          <div className="space-y-2">
            {upcomingItems.map(item => {
              const pConfig = priorityConfig[item.priority]

              return (
                <div key={item.id} className="glass-card p-3 opacity-60">
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg ${pConfig.bg}`}>
                      <Clock className={`w-3 h-3 ${pConfig.color}`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xs font-medium text-white">{item.title}</h4>
                      <p className="text-xs text-slate-500">{item.description}</p>
                    </div>
                    <span className="text-xs text-slate-600">{item.effort}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
