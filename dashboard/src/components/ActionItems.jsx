import { AlertCircle, CheckCircle, Clock, Flag } from 'lucide-react'

const priorityTone = {
  critical: 'text-status-bad bg-status-bad/15',
  high: 'text-status-warn bg-status-warn/15',
  medium: 'text-brand bg-brand/15',
  low: 'text-text-muted bg-surface-overlay'
}

export default function ActionItems({ items, onComplete }) {
  const pendingItems = items.filter(i => i.status === 'pending')
  const upcomingItems = items.filter(i => i.status === 'upcoming')

  return (
    <div className="space-y-6">
      <div className="card grid grid-cols-3 gap-3 text-center">
        <div>
          <p className="text-xl font-semibold text-status-bad">{items.filter(i => i.priority === 'critical').length}</p>
          <p className="text-caption text-text-muted">Critical</p>
        </div>
        <div>
          <p className="text-xl font-semibold text-status-warn">{items.filter(i => i.priority === 'high').length}</p>
          <p className="text-caption text-text-muted">High</p>
        </div>
        <div>
          <p className="text-xl font-semibold">{pendingItems.length}</p>
          <p className="text-caption text-text-muted">Pending</p>
        </div>
      </div>

      {pendingItems.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2"><Flag className="w-4 h-4 text-brand" />Action required</h3>
          {pendingItems.map(item => (
            <article key={item.id} className="card space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-sm font-semibold">{item.title}</h4>
                  <p className="text-caption text-text-secondary mt-1">{item.description}</p>
                </div>
                <span className={`text-micro px-2 py-1 rounded-lg ${priorityTone[item.priority] || priorityTone.low}`}>
                  {item.priority}
                </span>
              </div>

              <div className="text-caption text-text-muted">
                Impact: <span className="text-text-primary">{item.estimatedImpact}</span> · Effort: <span className="text-text-primary">{item.effort}</span>
              </div>

              <p className="text-caption text-text-secondary">{item.impact}</p>

              <div className="flex flex-wrap gap-2">
                {item.type === 'approval' && (
                  <>
                    <button onClick={() => onComplete && onComplete(item.id, 'rejected')} className="btn-danger text-sm">Reject</button>
                    <button onClick={() => onComplete && onComplete(item.id, 'approved')} className="btn-success text-sm"><CheckCircle className="w-4 h-4" />Approve</button>
                  </>
                )}
                {item.type !== 'approval' && (
                  <button onClick={() => onComplete && onComplete(item.id, 'done')} className="btn-secondary text-sm"><CheckCircle className="w-4 h-4" />Mark done</button>
                )}
              </div>
            </article>
          ))}
        </section>
      )}

      {upcomingItems.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-text-secondary flex items-center gap-2"><Clock className="w-4 h-4" />Coming up</h3>
          {upcomingItems.map(item => (
            <div key={item.id} className="card opacity-75 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm">{item.title}</p>
                <p className="text-caption text-text-muted">{item.description}</p>
              </div>
              <AlertCircle className="w-4 h-4 text-text-muted" />
            </div>
          ))}
        </section>
      )}
    </div>
  )
}
