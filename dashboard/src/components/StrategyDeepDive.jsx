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
      <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            value >= 85 ? 'bg-emerald-500' : value >= 70 ? 'bg-amber-500' : 'bg-red-500'
          }`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-xs text-slate-400 w-10 text-right">{value}%</span>
    </div>
  )
}

function SourceTag({ source }) {
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-700/50 border border-slate-600/50 text-xs">
      <Database className="w-3 h-3 text-blue-400 flex-shrink-0" />
      <span className="text-slate-300 font-medium">{source.name}</span>
      {source.url && source.url !== '#' && (
        <a 
          href={source.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300"
        >
          <ExternalLink className="w-3 h-3" />
        </a>
      )}
      <span className="text-slate-500 ml-1">{source.dataPoint}</span>
    </div>
  )
}

function ReasoningStep({ step, isLast }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="relative">
      {/* Connector line */}
      {!isLast && (
        <div className="absolute left-5 top-12 bottom-0 w-px bg-slate-700" />
      )}

      <div className="flex gap-4">
        {/* Step number */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amazon-orange/20 to-orange-600/20 border border-amazon-orange/30 flex items-center justify-center flex-shrink-0 z-10">
          <span className="text-sm font-bold text-amazon-orange">{step.step}</span>
        </div>

        {/* Content */}
        <div className="flex-1 pb-6">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full text-left"
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-semibold text-white">{step.title}</h4>
                <p className="text-xs text-emerald-400 mt-0.5">{step.decision}</p>
              </div>
              <div className="flex items-center gap-2">
                <ConfidenceBar value={step.confidence} />
                {expanded ? (
                  <ChevronUp className="w-4 h-4 text-slate-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                )}
              </div>
            </div>
          </button>

          {expanded && (
            <div className="mt-3 space-y-3 animate-in">
              {/* Description */}
              <p className="text-sm text-slate-300 leading-relaxed">
                {step.description}
              </p>

              {/* Sources */}
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
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
      <div className="glass-card p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Lightbulb className="w-5 h-5 text-amazon-orange" />
          <span className="text-sm text-slate-300">
            <span className="text-white font-semibold">{strategies.length} strategies</span> executed with{' '}
            <span className="text-white font-semibold">
              {strategies.reduce((acc, s) => acc + s.reasoning.length, 0)} reasoning steps
            </span>{' '}
            and{' '}
            <span className="text-white font-semibold">
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
          <div key={strategy.id} className="glass-card overflow-hidden">
            {/* Header */}
            <button
              onClick={() => setExpandedStrategy(isExpanded ? null : strategy.id)}
              className="w-full p-5 text-left hover:bg-slate-700/20 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-amazon-orange/20 to-orange-600/20 border border-amazon-orange/20">
                  <Icon className="w-5 h-5 text-amazon-orange" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-400">
                      {strategy.phase}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${outcomeColors[strategy.outcome.status]}`}>
                      {strategy.outcome.value}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-white">{strategy.title}</h3>
                  <p className="text-sm text-slate-400 mt-1 line-clamp-2">{strategy.summary}</p>
                </div>
                <div className="flex-shrink-0">
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-slate-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-500" />
                  )}
                </div>
              </div>
            </button>

            {/* Expanded content */}
            {isExpanded && (
              <div className="border-t border-slate-700/50">
                {/* Key Insight Banner */}
                <div className="px-5 py-3 bg-gradient-to-r from-amazon-orange/10 to-transparent border-b border-slate-700/50">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-amazon-orange mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-amazon-orange font-semibold uppercase tracking-wider">Key Insight</p>
                      <p className="text-sm text-slate-200 mt-1">{strategy.keyInsight}</p>
                    </div>
                  </div>
                </div>

                {/* Reasoning Chain */}
                <div className="p-5">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-1">
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
                <div className="px-5 py-4 bg-slate-800/30 border-t border-slate-700/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm text-slate-300">Outcome: <span className="text-white font-medium">{strategy.outcome.label}</span></span>
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
