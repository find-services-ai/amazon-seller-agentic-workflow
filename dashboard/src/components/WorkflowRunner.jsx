import { useState } from 'react'
import {
  Play, CheckCircle, Clock, Lock, AlertCircle,
  ChevronDown, ChevronUp, Cpu,
  RotateCcw
} from 'lucide-react'

const statusConfig = {
  completed: { icon: CheckCircle, color: 'text-status-good', bg: 'bg-status-good/15', label: 'Completed' },
  'in-progress': { icon: Play, color: 'text-brand', bg: 'bg-brand/15', label: 'Running' },
  'awaiting-approval': { icon: Lock, color: 'text-status-warn', bg: 'bg-status-warn/15', label: 'Needs approval' },
  pending: { icon: Clock, color: 'text-text-muted', bg: 'bg-surface-overlay', label: 'Pending' },
  failed: { icon: AlertCircle, color: 'text-status-bad', bg: 'bg-status-bad/15', label: 'Failed' }
}

function WorkflowStep({ text, index, total, hasGate }) {
  const isGate = text.startsWith('⚡')
  return (
    <div className="flex items-start gap-3 text-sm">
      <div className="flex flex-col items-center">
        <div className={`
          w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
          ${isGate ? 'bg-status-warn/15 text-status-warn border border-status-warn/30' : 'bg-surface-overlay text-text-secondary'}
        `}>
          {isGate ? '🔒' : index + 1}
        </div>
        {index < total - 1 && <div className="w-px h-4 bg-border-subtle mt-1" />}
      </div>
      <p className={`pt-1 ${isGate ? 'text-status-warn font-medium' : 'text-text-secondary'}`}>
        {text}
      </p>
    </div>
  )
}

export default function WorkflowRunner({ workflows, onRunWorkflow }) {
  const [expandedWf, setExpandedWf] = useState(null)
  const [runningWorkflows, setRunningWorkflows] = useState({})

  const handleRun = (workflowId) => {
    setRunningWorkflows(prev => ({ ...prev, [workflowId]: 'running' }))
    // Simulate workflow execution
    setTimeout(() => {
      setRunningWorkflows(prev => ({ ...prev, [workflowId]: 'complete' }))
    }, 3000)
    if (onRunWorkflow) onRunWorkflow(workflowId)
  }

  return (
    <div className="space-y-4">
      {/* Runner header */}
      <div className="card flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-brand/15">
            <Cpu className="w-5 h-5 text-brand" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Workflow engine</h3>
            <p className="text-caption text-text-secondary">{workflows.length} configured · {workflows.filter(w => w.status === 'completed').length} completed</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-status-good/15 border border-status-good/30">
          <span className="w-2 h-2 rounded-full bg-status-good animate-pulse" />
          <span className="text-xs text-status-good font-medium">Ready</span>
        </div>
      </div>

      {/* Workflow cards */}
      {workflows.map(workflow => {
        const config = statusConfig[workflow.status]
        const StatusIcon = config.icon
        const isExpanded = expandedWf === workflow.id
        const isRunning = runningWorkflows[workflow.id] === 'running'
        const isComplete = runningWorkflows[workflow.id] === 'complete'

        return (
          <div key={workflow.id} className="card p-0 overflow-hidden">
            {/* Header */}
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${config.bg}`}>
                  <StatusIcon className={`w-4 h-4 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-semibold">{workflow.name}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>
                      {config.label}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary">{workflow.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-text-muted">
                    <span className="flex items-center gap-1">
                      <Cpu className="w-3 h-3" />
                      {workflow.agent}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {workflow.estimatedDuration}
                    </span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {workflow.status === 'pending' || workflow.status === 'awaiting-approval' ? (
                    <button
                      onClick={() => handleRun(workflow.id)}
                      disabled={isRunning || workflow.status === 'awaiting-approval'}
                      className={`
                        flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all min-h-[44px]
                        ${workflow.status === 'awaiting-approval'
                          ? 'bg-status-warn/15 text-status-warn border border-status-warn/30 cursor-not-allowed'
                          : isRunning
                            ? 'bg-brand/15 text-brand border border-brand/30'
                            : 'bg-status-good/15 text-status-good border border-status-good/30 hover:bg-status-good/25'
                        }
                      `}
                    >
                      {isRunning ? (
                        <>
                          <div className="w-3 h-3 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                          Running...
                        </>
                      ) : workflow.status === 'awaiting-approval' ? (
                        <>
                          <Lock className="w-3 h-3" />
                          Approve First
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3" />
                          Run
                        </>
                      )}
                    </button>
                  ) : workflow.status === 'completed' ? (
                    <button
                      onClick={() => handleRun(workflow.id)}
                      className="btn-secondary text-sm"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Re-run
                    </button>
                  ) : null}

                  <button
                    onClick={() => setExpandedWf(isExpanded ? null : workflow.id)}
                    className="p-2 rounded-lg hover:bg-surface-overlay text-text-secondary transition-colors"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Running progress bar */}
              {isRunning && (
                <div className="mt-3">
                  <div className="h-1.5 bg-surface-overlay rounded-full overflow-hidden">
                    <div className="h-full bg-brand rounded-full animate-pulse" style={{ width: '60%' }} />
                  </div>
                  <p className="text-xs text-brand mt-1">Executing workflow steps...</p>
                </div>
              )}
            </div>

            {/* Expanded details */}
            {isExpanded && (
              <div className="border-t border-border-subtle">
                {/* Steps */}
                <div className="p-4">
                  <p className="text-xs text-text-muted uppercase tracking-wider mb-3">
                    Workflow Steps ({workflow.steps.length})
                  </p>
                  <div className="space-y-1">
                    {workflow.steps.map((step, idx) => (
                      <WorkflowStep
                        key={idx}
                        text={step}
                        index={idx}
                        total={workflow.steps.length}
                      />
                    ))}
                  </div>
                </div>

                {/* Triggers & Outputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 border-t border-border-subtle bg-surface">
                  <div>
                    <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Triggers</p>
                    <div className="space-y-1">
                      {workflow.triggers.map((trigger, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-xs text-text-secondary">
                          <Play className="w-3 h-3 text-brand" />
                          {trigger}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Outputs</p>
                    <div className="space-y-1">
                      {workflow.outputs.map((output, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-xs text-text-secondary">
                          <CheckCircle className="w-3 h-3 text-status-good" />
                          {output}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
