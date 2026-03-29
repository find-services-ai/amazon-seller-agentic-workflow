import { CheckCircle, XCircle, Clock, AlertTriangle, Mail, CreditCard, Send } from 'lucide-react'

const typeIcons = {
  'supplier-outreach': Mail,
  'payment': CreditCard,
  'shipping': Send
}

const statusStyles = {
  'pending': {
    bg: 'bg-amber-500/20',
    text: 'text-amber-400',
    border: 'border-amber-500/30'
  },
  'approved': {
    bg: 'bg-emerald-500/20',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30'
  },
  'rejected': {
    bg: 'bg-red-500/20',
    text: 'text-red-400',
    border: 'border-red-500/30'
  },
  'upcoming': {
    bg: 'bg-slate-500/20',
    text: 'text-slate-400',
    border: 'border-slate-500/30'
  }
}

export default function ApprovalGates({ approvals, onDecision }) {
  return (
    <div className="space-y-4">
      {approvals.map(approval => {
        const Icon = typeIcons[approval.type] || AlertTriangle
        const style = statusStyles[approval.status] || statusStyles.upcoming

        return (
          <div 
            key={approval.id} 
            className={`glass-card p-4 border ${style.border}`}
          >
            {/* Header */}
            <div className="flex items-start gap-3 mb-3">
              <div className={`p-2 rounded-lg ${style.bg}`}>
                <Icon className={`w-4 h-4 ${style.text}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-white truncate">{approval.title}</h4>
                <p className="text-xs text-slate-400 mt-0.5">{approval.product}</p>
              </div>
              <span className={`
                status-badge ${style.bg} ${style.text}
              `}>
                {approval.status}
              </span>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-300 mb-3">{approval.description}</p>

            {/* Details */}
            {approval.details && (
              <div className="p-2 rounded-lg bg-slate-800/50 mb-3 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Suppliers to contact:</span>
                  <span className="text-white">{approval.details.suppliers}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400 mt-1">
                  <span>Expected response:</span>
                  <span className="text-white">{approval.details.estimatedResponse}</span>
                </div>
              </div>
            )}

            {approval.estimatedAmount && (
              <div className="p-2 rounded-lg bg-slate-800/50 mb-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Amount:</span>
                  <span className="text-white font-semibold">{approval.estimatedAmount}</span>
                </div>
              </div>
            )}

            {/* Impact Badge */}
            <div className={`
              text-xs px-2 py-1 rounded mb-3
              ${approval.impact?.includes('Low') ? 'bg-emerald-500/10 text-emerald-400' : ''}
              ${approval.impact?.includes('Medium') ? 'bg-amber-500/10 text-amber-400' : ''}
              ${approval.impact?.includes('High') ? 'bg-red-500/10 text-red-400' : ''}
            `}>
              {approval.impact}
            </div>

            {/* Actions */}
            {approval.status === 'pending' && (
              <div className="flex gap-2">
                <button
                  onClick={() => onDecision(approval.id, 'rejected')}
                  className="flex-1 py-2 px-3 rounded-lg bg-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/30 transition-colors flex items-center justify-center gap-1"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
                <button
                  onClick={() => onDecision(approval.id, 'approved')}
                  className="flex-1 py-2 px-3 rounded-lg bg-emerald-500/20 text-emerald-400 text-sm font-medium hover:bg-emerald-500/30 transition-colors flex items-center justify-center gap-1"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve
                </button>
              </div>
            )}

            {approval.status === 'upcoming' && (
              <div className="flex items-center justify-center gap-2 py-2 text-slate-500 text-xs">
                <Clock className="w-3 h-3" />
                Coming after current phase completes
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
