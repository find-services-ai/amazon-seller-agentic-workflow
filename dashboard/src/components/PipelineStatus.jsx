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
  return (
    <div className="glass-card p-6">
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-6 left-6 right-6 h-1 bg-slate-700 rounded-full">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-slate-700 rounded-full transition-all duration-500"
            style={{ width: `${(stages.filter(s => s.status === 'completed').length / stages.length) * 100}%` }}
          />
        </div>

        {/* Stages */}
        <div className="relative flex justify-between">
          {stages.map((stage, index) => {
            const config = statusConfig[stage.status]
            const Icon = config.icon

            return (
              <div 
                key={stage.id}
                className="flex flex-col items-center text-center group"
                style={{ width: `${100 / stages.length}%` }}
              >
                {/* Icon Circle */}
                <div 
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center
                    border-4 border-slate-800 transition-all duration-200
                    ${stage.status === 'completed' ? 'bg-emerald-500' : ''}
                    ${stage.status === 'in-progress' ? 'bg-blue-500 animate-pulse' : ''}
                    ${stage.status === 'awaiting-approval' ? 'bg-amber-500' : ''}
                    ${stage.status === 'pending' ? 'bg-slate-700' : ''}
                    group-hover:scale-110
                  `}
                >
                  {stage.requiresApproval && stage.status !== 'completed' ? (
                    <Lock className="w-5 h-5 text-white" />
                  ) : (
                    <Icon className="w-5 h-5 text-white" />
                  )}
                </div>

                {/* Label */}
                <div className="mt-3 space-y-1">
                  <p className="text-sm font-medium text-white">{stage.name}</p>
                  <p className="text-xs text-slate-400 hidden lg:block max-w-[120px]">
                    {stage.description}
                  </p>
                  {stage.score && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                      {stage.score}
                    </span>
                  )}
                  {stage.suppliers && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
                      {stage.suppliers} suppliers
                    </span>
                  )}
                  {stage.requiresApproval && stage.status !== 'completed' && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">
                      Needs Approval
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
