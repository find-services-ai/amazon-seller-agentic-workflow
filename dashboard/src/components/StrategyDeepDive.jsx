import { useState } from 'react'
import { 
  CheckCircle, ExternalLink, ChevronDown, ChevronUp,
  TrendingUp, Shield, AlertTriangle, BookOpen, Database,
  Target, BarChart3, Lightbulb
} from 'lucide-react'

const phaseIcons = {
  'Product Selection': Target,
  'Validation — Demand': TrendingUp,
  'Validation — Competition': Shield,
  'Validation — Pricing': BarChart3,
  'Validation — Supply Chain': Database,
  'Validation — Risk': AlertTriangle
}

const outcomeColors = {
  success: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  error: 'bg-red-500/20 text-red-400 border-red-500/30'
}

function ConfidenceBar({ value }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-surface-overlay rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            value >= 85 ? 'bg-status-good' : value >= 70 ? 'bg-status-warn' : 'bg-status-bad'
          }`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-xs text-text-secondary w-10 text-right">{value}%</span>
    </div>
  )
}

function SourceTag({ source }) {
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface text-xs">
      <Database className="w-3 h-3 text-brand flex-shrink-0" />
      <span className="text-text-secondary font-medium">{source.name}</span>
      {source.url && source.url !== '#' && (
        <a 
          href={source.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-brand hover:text-brand-hover"
        >
          <ExternalLink className="w-3 h-3" />
        </a>
      )}
      <span className="text-text-muted ml-1">{source.dataPoint}</span>
    </div>
  )
}

function ReasoningStep({ step, isLast }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="relative">
      {/* Connector line */}
      {!isLast && (
        <div className="absolute left-5 top-12 bottom-0 w-px bg-border-subtle" />
      )}

      <div className="flex gap-4">
        {/* Step number */}
        <div className="w-10 h-10 rounded-full bg-brand/15 border border-brand/30 flex items-center justify-center flex-shrink-0 z-10">
          <span className="text-sm font-bold text-brand">{step.step}</span>
        </div>

        {/* Content */}
        <div className="flex-1 pb-6">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full text-left"
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-semibold">{step.title}</h4>
                <p className="text-xs text-status-good mt-0.5">{step.decision}</p>
              </div>
              <div className="flex items-center gap-2">
                <ConfidenceBar value={step.confidence} />
                {expanded ? (
                  <ChevronUp className="w-4 h-4 text-text-muted" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-text-muted" />
                )}
              </div>
            </div>
          </button>

          {expanded && (
            <div className="mt-3 space-y-3 animate-in">
              {/* Description */}
              <p className="text-sm text-text-secondary leading-relaxed">
                {step.description}
              </p>

              {/* Sources */}
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  Data Sources
                </p>
                <div className="flex flex-wrap gap-2">
                  {step.sources.map((source, idx) => (
                    <SourceTag key={idx} source={source} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function StrategyDeepDive({ strategies }) {
  const [expandedStrategy, setExpandedStrategy] = useState(null)

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="card p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Lightbulb className="w-5 h-5 text-brand" />
          <span className="text-sm text-text-secondary">
            <span className="text-text-primary font-semibold">{strategies.length} strategies</span> executed with{' '}
            <span className="text-text-primary font-semibold">
              {strategies.reduce((acc, s) => acc + s.reasoning.length, 0)} reasoning steps
            </span>{' '}
            and{' '}
            <span className="text-text-primary font-semibold">
              {strategies.reduce((acc, s) => acc + s.reasoning.reduce((a, r) => a + r.sources.length, 0), 0)} data sources
            </span>
          </span>
        </div>
      </div>

      {/* Strategy cards */}
      {strategies.map(strategy => {
        const Icon = phaseIcons[strategy.phase] || Target
        const isExpanded = expandedStrategy === strategy.id

        return (
          <div key={strategy.id} className="card p-0 overflow-hidden">
            {/* Header */}
            <button
              onClick={() => setExpandedStrategy(isExpanded ? null : strategy.id)}
              className="w-full p-5 text-left hover:bg-surface transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-brand/15 border border-brand/20">
                  <Icon className="w-5 h-5 text-brand" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-surface text-text-secondary">
                      {strategy.phase}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${outcomeColors[strategy.outcome.status]}`}>
                      {strategy.outcome.value}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold">{strategy.title}</h3>
                  <p className="text-sm text-text-secondary mt-1 line-clamp-2">{strategy.summary}</p>
                </div>
                <div className="flex-shrink-0">
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-text-muted" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-text-muted" />
                  )}
                </div>
              </div>
            </button>

            {/* Expanded content */}
            {isExpanded && (
              <div className="border-t border-border-subtle">
                {/* Key Insight Banner */}
                <div className="px-5 py-3 bg-brand/10 border-b border-border-subtle">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-brand mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-brand font-semibold uppercase tracking-wider">Key Insight</p>
                      <p className="text-sm text-text-secondary mt-1">{strategy.keyInsight}</p>
                    </div>
                  </div>
                </div>

                {/* Reasoning Chain */}
                <div className="p-5">
                  <p className="text-xs text-text-muted uppercase tracking-wider mb-4 flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    Reasoning Chain ({strategy.reasoning.length} steps)
                  </p>
                  <div className="space-y-0">
                    {strategy.reasoning.map((step, idx) => (
                      <ReasoningStep
                        key={step.step}
                        step={step}
                        isLast={idx === strategy.reasoning.length - 1}
                      />
                    ))}
                  </div>
                </div>

                {/* Outcome */}
                <div className="px-5 py-4 bg-surface border-t border-border-subtle flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-status-good" />
                    <span className="text-sm text-text-secondary">Outcome: <span className="text-text-primary font-medium">{strategy.outcome.label}</span></span>
                  </div>
                  <span className={`text-sm font-bold px-3 py-1 rounded-full border ${outcomeColors[strategy.outcome.status]}`}>
                    {strategy.outcome.value}
                  </span>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
