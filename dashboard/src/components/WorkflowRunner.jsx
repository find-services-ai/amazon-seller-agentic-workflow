import { useState } from 'react'
import {
  Play, Pause, CheckCircle, Clock, Lock, AlertCircle,
  ChevronDown, ChevronUp, Cpu, Zap, ArrowRight,
  RotateCcw, ExternalLink
} from 'lucide-react'

const statusConfig = {
  completed: { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/20', label: 'Completed' },
  'in-progress': { icon: Play, color: 'text-blue-500', bg: 'bg-blue-500/20', label: 'Running' },
  'awaiting-approval': { icon: Lock, color: 'text-amber-500', bg: 'bg-amber-500/20', label: 'Needs Approval' },
  pending: { icon: Clock, color: 'text-slate-500', bg: 'bg-slate-500/20', label: 'Pending' },
  failed: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/20', label: 'Failed' }
}

function WorkflowStep({ text, index, total, hasGate }) {
  const isGate = text.startsWith('⚡')
  return (
    <div className="flex items-start gap-3">
      <div className="flex flex-col items-center">
        <div className={`
          w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
          ${isGate ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-700 text-slate-400'}
        `}>
          {isGate ? '🔒' : index + 1}
        </div>
        {index < total - 1 && <div className="w-px h-4 bg-slate-700 mt-1" />}
      </div>
      <p className={`text-sm pt-1 ${isGate ? 'text-amber-400 font-medium' : 'text-slate-300'}`}>
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
      <div className="glass-card p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500/20">
            <Cpu className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">AI Workflow Engine</h3>
            <p className="text-xs text-slate-400">{workflows.length} workflows configured &middot; {workflows.filter(w => w.status === 'completed').length} completed</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-emerald-400 font-medium">Engine Ready</span>
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
          <div key={workflow.id} className="glass-card overflow-hidden">
            {/* Header */}
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${config.bg}`}>
                  <StatusIcon className={`w-4 h-4 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-semibold text-white">{workflow.name}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>
                      {config.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{workflow.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
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
                        flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all
                        ${workflow.status === 'awaiting-approval'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 cursor-not-allowed'
                          : isRunning
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 hover:scale-105 transform'
                        }
                      `}
                    >
                      {isRunning ? (
                        <>
                          <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
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
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-slate-700/50 text-slate-300 hover:bg-slate-700 transition-all"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Re-run
                    </button>
                  ) : null}

                  <button
                    onClick={() => setExpandedWf(isExpanded ? null : workflow.id)}
                    className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 transition-colors"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Running progress bar */}
              {isRunning && (
                <div className="mt-3">
                  <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full animate-pulse" style={{ width: '60%' }} />
                  </div>
                  <p className="text-xs text-blue-400 mt-1">Executing workflow steps...</p>
                </div>
              )}
            </div>

            {/* Expanded details */}
            {isExpanded && (
              <div className="border-t border-slate-700/50">
                {/* Steps */}
                <div className="p-4">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">
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
                <div className="grid grid-cols-2 gap-4 p-4 border-t border-slate-700/50 bg-slate-800/30">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Triggers</p>
                    <div className="space-y-1">
                      {workflow.triggers.map((trigger, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-300">
                          <Zap className="w-3 h-3 text-amazon-orange" />
                          {trigger}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Outputs</p>
                    <div className="space-y-1">
                      {workflow.outputs.map((output, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-300">
                          <ArrowRight className="w-3 h-3 text-emerald-500" />
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
