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
            className="card space-y-3"
          >
            {/* Header */}
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${style.bg} shrink-0`}>
                <Icon className={`w-4 h-4 ${style.text}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium truncate">{approval.title}</h4>
                <p className="text-micro text-text-muted mt-0.5">{approval.product}</p>
              </div>
              <span className={`
                text-micro px-2 py-1 rounded-lg ${style.bg} ${style.text}
              `}>
                {approval.status}
              </span>
            </div>

            {/* Description */}
            <p className="text-caption text-text-secondary">{approval.description}</p>

            {/* Details */}
            {approval.details && (
              <div className="p-3 rounded-xl bg-surface text-caption">
                <div className="flex items-center justify-between text-text-muted">
                  <span>Suppliers to contact:</span>
                  <span className="text-text-primary">{approval.details.suppliers}</span>
                </div>
                <div className="flex items-center justify-between text-text-muted mt-1">
                  <span>Expected response:</span>
                  <span className="text-text-primary">{approval.details.estimatedResponse}</span>
                </div>
              </div>
            )}

            {approval.estimatedAmount && (
              <div className="p-3 rounded-xl bg-surface">
                <div className="flex items-center justify-between text-caption">
                  <span className="text-text-muted">Amount:</span>
                  <span className="text-text-primary font-semibold">{approval.estimatedAmount}</span>
                </div>
              </div>
            )}

            {/* Impact Badge */}
            <div className={`
              text-micro px-2 py-1 rounded-lg inline-block
              ${approval.impact?.includes('Low') ? 'bg-status-good/15 text-status-good' : ''}
              ${approval.impact?.includes('Medium') ? 'bg-status-warn/15 text-status-warn' : ''}
              ${approval.impact?.includes('High') ? 'bg-status-bad/15 text-status-bad' : ''}
            `}>
              {approval.impact}
            </div>

            {/* Actions */}
            {approval.status === 'pending' && (
              <div className="flex gap-2">
                <button
                  onClick={() => onDecision(approval.id, 'rejected')}
                  className="btn-danger flex-1 text-sm"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
                <button
                  onClick={() => onDecision(approval.id, 'approved')}
                  className="btn-success flex-1 text-sm"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve
                </button>
              </div>
            )}

            {approval.status === 'upcoming' && (
              <div className="flex items-center justify-center gap-2 py-2 text-text-muted text-caption">
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
