import { CheckCircle, Clock, Play, AlertCircle, Lock } from 'lucide-react'

const statusConfig = {
  'completed': {
    icon: CheckCircle,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500',
    label: 'Completed'
  },
  'in-progress': {
    icon: Play,
    color: 'text-blue-500',
    bg: 'bg-blue-500',
    label: 'In Progress'
  },
  'awaiting-approval': {
    icon: AlertCircle,
    color: 'text-amber-500',
    bg: 'bg-amber-500',
    label: 'Awaiting Approval'
  },
  'pending': {
    icon: Clock,
    color: 'text-slate-500',
    bg: 'bg-slate-500',
    label: 'Pending'
  }
}

export default function PipelineStatus({ stages }) {
  const completed = stages.filter(s => s.status === 'completed').length
  const percent = Math.round((completed / stages.length) * 100)

  return (
    <div className="card space-y-5">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-caption text-text-secondary">Progress</p>
          <p className="text-caption text-text-secondary">{completed}/{stages.length} complete</p>
        </div>
        <div className="h-2 bg-surface-overlay rounded-full overflow-hidden">
          <div className="h-full bg-brand transition-all duration-300" style={{ width: `${percent}%` }} />
        </div>
      </div>

      <div className="space-y-2">
        {stages.map(stage => {
          const config = statusConfig[stage.status]
          const Icon = config.icon

          return (
            <div key={stage.id} className="flex items-center gap-3 p-3 rounded-xl bg-surface">
              <div className="w-8 h-8 rounded-lg bg-surface-overlay flex items-center justify-center">
                {stage.requiresApproval && stage.status !== 'completed' ? (
                  <Lock className="w-4 h-4 text-status-warn" />
                ) : (
                  <Icon className={`w-4 h-4 ${config.color}`} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{stage.name}</p>
                <p className="text-caption text-text-muted truncate">{stage.description}</p>
              </div>
              <span className={`text-micro px-2 py-1 rounded-lg ${stage.status === 'completed' ? 'bg-status-good/15 text-status-good' : stage.status === 'awaiting-approval' ? 'bg-status-warn/15 text-status-warn' : stage.status === 'in-progress' ? 'bg-brand/15 text-brand' : 'bg-surface-overlay text-text-muted'}`}>
                {config.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
