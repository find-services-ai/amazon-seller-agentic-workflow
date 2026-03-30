import { useState } from 'react'
import {
  Search, ChevronDown, ChevronUp, ExternalLink, TrendingUp,
  AlertTriangle, CheckCircle, Play, RotateCcw, Zap, Shield,
  BarChart3, Target, Package, Truck, Star, Clock, ArrowRight,
  Filter, SortAsc, XCircle, Loader2, Eye, Lock, Info
} from 'lucide-react'
import { amazonDepartments, scoringWeights, validationPhases, validationCriteria } from '../data/departmentData'

// ─── Scoring Functions ───

function computeWeightedScore(scores) {
  let total = 0
  for (const [key, val] of Object.entries(scores)) {
    const w = scoringWeights[key]
    if (w) total += val * w.weight
  }
  return Math.round(total * 10) / 10
}

function getOpportunityColor(level) {
  return {
    high: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
    medium: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
    low: { bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500/30' }
  }[level] || { bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500/30' }
}

function getCompetitionColor(level) {
  return {
    low: 'text-emerald-400',
    moderate: 'text-amber-400',
    high: 'text-red-400'
  }[level] || 'text-slate-400'
}

// ─── Score Bar ───

function ScoreBar({ value, max = 10, label, size = 'sm' }) {
  const pct = (value / max) * 100
  const color = pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-amber-500' : 'bg-red-500'
  return (
    <div className="flex items-center gap-2">
      {label && <span className={`${size === 'sm' ? 'text-xs' : 'text-sm'} text-slate-400 w-28 flex-shrink-0`}>{label}</span>}
      <div className={`flex-1 ${size === 'sm' ? 'h-1.5' : 'h-2'} bg-slate-700 rounded-full overflow-hidden`}>
        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`${size === 'sm' ? 'text-xs' : 'text-sm'} text-slate-300 w-8 text-right font-medium`}>{value}/{max}</span>
    </div>
  )
}

// ─── Validation Phase Card ───

function ValidationPhaseCard({ phase, result, isActive, onRun }) {
  const status = result?.status || 'pending'
  const statusConfig = {
    pending: { icon: Clock, color: 'text-slate-400', label: 'Pending', bg: 'bg-slate-500/20' },
    running: { icon: Loader2, color: 'text-blue-400', label: 'Running...', bg: 'bg-blue-500/20' },
    passed: { icon: CheckCircle, color: 'text-emerald-400', label: 'Passed', bg: 'bg-emerald-500/20' },
    failed: { icon: XCircle, color: 'text-red-400', label: 'Failed', bg: 'bg-red-500/20' },
    review: { icon: AlertTriangle, color: 'text-amber-400', label: 'Needs Review', bg: 'bg-amber-500/20' }
  }
  const sc = statusConfig[status]
  const StatusIcon = sc.icon

  return (
    <div className={`p-3 rounded-lg border transition-all ${
      isActive ? 'border-blue-500/50 bg-blue-500/5' : 'border-slate-700/50 bg-slate-800/30'
    }`}>
      <div className="flex items-center gap-3">
        <span className="text-lg">{phase.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium text-white">{phase.name}</h4>
            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] ${sc.bg} ${sc.color}`}>
              <StatusIcon className={`w-2.5 h-2.5 ${status === 'running' ? 'animate-spin' : ''}`} />
              {sc.label}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{phase.agent} &middot; Min score: {phase.minScore}/10</p>
        </div>
        {result?.score !== undefined && (
          <div className="text-right">
            <span className={`text-lg font-bold ${result.score >= phase.minScore ? 'text-emerald-400' : 'text-red-400'}`}>
              {result.score}/10
            </span>
            <p className="text-xs text-slate-500">{result.confidence}% confidence</p>
          </div>
        )}
      </div>
      {result?.summary && (
        <p className="text-xs text-slate-400 mt-2 pl-8">{result.summary}</p>
      )}
    </div>
  )
}

// ─── Department Card ───

function DepartmentCard({ dept, isExpanded, onToggle, onResearch }) {
  const opp = getOpportunityColor(dept.composite >= 7.5 ? 'high' : dept.composite >= 6.5 ? 'medium' : 'low')
  const hasActive = dept.activeProducts.length > 0

  return (
    <div className={`glass-card overflow-hidden border ${hasActive ? 'border-emerald-500/30' : 'border-slate-700/50'}`}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">{dept.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="text-sm font-semibold text-white">{dept.name}</h3>
              {hasActive && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle className="w-2.5 h-2.5" /> Active
                </span>
              )}
              <span className={`px-1.5 py-0.5 rounded text-[10px] ${opp.bg} ${opp.text}`}>
                Score: {dept.composite}
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
              <span>Market: <span className="text-white">{dept.marketSize}</span></span>
              <span>CAGR: <span className="text-emerald-400">{dept.cagr}</span></span>
              <span>{dept.subcategories.length} subcategories</span>
              <span>{dept.subcategories.filter(s => s.opportunity === 'high').length} high-opportunity niches</span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => onResearch(dept)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amazon-orange/20 text-amazon-orange border border-amazon-orange/30 hover:bg-amazon-orange/30 transition-colors"
            >
              <Play className="w-3 h-3" />
              Research
            </button>
            <button
              onClick={onToggle}
              className="p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-400 transition-colors"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Score bars */}
        <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5">
          {Object.entries(dept.scores).map(([key, val]) => (
            <ScoreBar key={key} value={val} label={scoringWeights[key]?.label?.split(' ')[0]} />
          ))}
        </div>
      </div>

      {/* Expanded */}
      {isExpanded && (
        <div className="border-t border-slate-700/50">
          {/* Subcategories */}
          <div className="p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Subcategory Opportunities</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {dept.subcategories.map((sub, idx) => {
                const subOpp = getOpportunityColor(sub.opportunity)
                return (
                  <div key={idx} className={`flex items-center justify-between p-2.5 rounded-lg border ${subOpp.border} ${subOpp.bg}`}>
                    <div>
                      <p className="text-xs font-medium text-white">{sub.name}</p>
                      <p className="text-[10px] text-slate-400">BSR ~{sub.avgBSR.toLocaleString()} &middot; {sub.avgMargin}% margin</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${subOpp.bg} ${subOpp.text} capitalize`}>
                        {sub.opportunity}
                      </span>
                      <p className={`text-[10px] mt-0.5 ${getCompetitionColor(sub.competition)}`}>{sub.competition} comp.</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Highlights & Risks */}
          <div className="grid grid-cols-2 gap-4 p-4 border-t border-slate-700/50 bg-slate-800/20">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Highlights</p>
              {dept.highlights.map((h, i) => (
                <div key={i} className="flex items-start gap-1.5 text-xs text-emerald-400 mb-1">
                  <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span>{h}</span>
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Risks</p>
              {dept.risks.map((r, i) => (
                <div key={i} className="flex items-start gap-1.5 text-xs text-amber-400 mb-1">
                  <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span>{r}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Active products */}
          {hasActive && (
            <div className="p-4 border-t border-slate-700/50">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Active Products</p>
              {dept.activeProducts.map((p, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mr-2">
                  <Package className="w-3 h-3" /> {p}
                </span>
              ))}
            </div>
          )}

          {/* BSR Link */}
          <div className="p-3 border-t border-slate-700/50 bg-slate-800/30">
            <a
              href={dept.bsrUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              View Amazon Best Sellers — {dept.name}
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Research Flow Modal ───

function ResearchFlow({ department, onClose, existingProduct }) {
  const [productName, setProductName] = useState(existingProduct || '')
  const [budget, setBudget] = useState('500')
  const [targetMargin, setTargetMargin] = useState('35')
  const [flowState, setFlowState] = useState('setup') // setup | running | complete
  const [currentPhase, setCurrentPhase] = useState(0)
  const [phaseResults, setPhaseResults] = useState({})
  const [overallResult, setOverallResult] = useState(null)

  const isRerun = !!existingProduct

  const runValidationFlow = async () => {
    setFlowState('running')
    setCurrentPhase(0)
    setPhaseResults({})
    setOverallResult(null)

    // Simulate sequential validation phases (in production, these call the MCP agents)
    for (let i = 0; i < validationPhases.length; i++) {
      setCurrentPhase(i)
      const phase = validationPhases[i]

      // Mark running
      setPhaseResults(prev => ({
        ...prev,
        [phase.id]: { status: 'running' }
      }))

      // Simulate agent execution time
      await new Promise(r => setTimeout(r, 1500 + Math.random() * 1000))

      // Generate simulated result
      const score = Math.floor(Math.random() * 4) + 5 // 5-9
      const confidence = Math.floor(Math.random() * 20) + 72 // 72-92
      const passed = score >= phase.minScore
      const summaries = {
        demand: `${productName || 'Product'} shows ${score >= 7 ? 'strong' : 'moderate'} demand signals. Estimated monthly search volume ${score >= 7 ? '>20K' : '10-20K'}. Google Trends ${score >= 7 ? 'growing' : 'stable'}.`,
        competition: `Top 10 analysis shows ${score >= 6 ? 'viable entry opportunity' : 'challenging landscape'}. ${score >= 6 ? '4+' : '2'} listings with <500 reviews. Brand concentration ${score >= 6 ? 'low' : 'moderate'}.`,
        pricing: `Target price $${12 + Math.floor(Math.random() * 8)}.99 achievable. Gross margin ${28 + score * 3}% at expected landed cost. ${passed ? 'All scenarios pass 35% guardrail.' : 'Worst-case scenario below 35% threshold.'}`,
        'supply-chain': `${score >= 6 ? '3+' : '1-2'} suppliers found at target price. MOQ ${score >= 7 ? 'within' : 'near limit of'} budget. ${score >= 7 ? 'Dropship option available.' : 'Bulk only.'}`,
        risk: `Weighted risk score: ${(5 - score * 0.4).toFixed(1)}/5. ${score >= 7 ? 'Low' : score >= 5 ? 'Moderate' : 'High'} overall risk. ${passed ? 'Within acceptable bounds.' : 'Recommend mitigation plan.'}`
      }

      setPhaseResults(prev => ({
        ...prev,
        [phase.id]: {
          status: passed ? 'passed' : score >= phase.minScore - 1 ? 'review' : 'failed',
          score,
          confidence,
          summary: summaries[phase.id]
        }
      }))

      // If a phase hard-fails, we can still show all results but note the failure
    }

    // Calculate overall
    const allResults = {}
    setPhaseResults(prev => {
      Object.assign(allResults, prev)
      return prev
    })

    // Need a small delay to get final state
    await new Promise(r => setTimeout(r, 200))

    setFlowState('complete')
  }

  // Calculate totals from results
  const totalScore = Object.values(phaseResults).reduce((sum, r) => sum + (r.score || 0), 0)
  const avgConfidence = Object.values(phaseResults).filter(r => r.confidence).length > 0
    ? Math.round(Object.values(phaseResults).reduce((sum, r) => sum + (r.confidence || 0), 0) / Object.values(phaseResults).filter(r => r.confidence).length)
    : 0
  const allPassed = Object.values(phaseResults).every(r => r.status === 'passed' || r.status === 'review')
  const failedPhases = Object.values(phaseResults).filter(r => r.status === 'failed').length

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900 border-b border-slate-700/50 p-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{department?.icon || '🔬'}</span>
            <div>
              <h3 className="text-sm font-semibold text-white">
                {isRerun ? 'Re-run Product Validation' : 'New Product Research'}
              </h3>
              <p className="text-xs text-slate-400">
                {department?.name || 'All Departments'} &middot; 5-Phase Validation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 transition-colors"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Setup form */}
          {flowState === 'setup' && (
            <div className="space-y-4">
              <div className="glass-card p-4 space-y-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Product Name or Search Term</label>
                  <input
                    type="text"
                    value={productName}
                    onChange={e => setProductName(e.target.value)}
                    placeholder={`e.g., Self-Cleaning Slicker Brush, Silicone Kitchen Utensils...`}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white text-sm focus:border-amazon-orange focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Budget ($)</label>
                    <select
                      value={budget}
                      onChange={e => setBudget(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white text-sm focus:border-amazon-orange focus:outline-none"
                    >
                      <option value="500">$500</option>
                      <option value="750">$750</option>
                      <option value="1000">$1,000</option>
                      <option value="2000">$2,000</option>
                      <option value="5000">$5,000</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Min Gross Margin (%)</label>
                    <select
                      value={targetMargin}
                      onChange={e => setTargetMargin(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white text-sm focus:border-amazon-orange focus:outline-none"
                    >
                      <option value="25">25%</option>
                      <option value="30">30%</option>
                      <option value="35">35% (recommended)</option>
                      <option value="40">40%</option>
                      <option value="50">50%</option>
                    </select>
                  </div>
                </div>

                {department && (
                  <div className="p-2 rounded-lg bg-slate-800/50 text-xs text-slate-400">
                    <span className="text-amazon-orange font-medium">Category:</span> {department.name} ({department.marketSize}, {department.cagr} CAGR)
                  </div>
                )}
              </div>

              {/* Validation criteria info */}
              <div className="glass-card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Info className="w-4 h-4 text-blue-400" />
                  <h4 className="text-xs font-semibold text-white">Validation Guardrails</h4>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Shield className="w-3 h-3 text-emerald-400" />
                    Overall score ≥ {validationCriteria.overallThreshold}/{validationCriteria.maxScore}
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Shield className="w-3 h-3 text-emerald-400" />
                    Confidence ≥ {validationCriteria.minConfidence}%
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Shield className="w-3 h-3 text-emerald-400" />
                    Gross margin ≥ {validationCriteria.minGrossMargin}%
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Shield className="w-3 h-3 text-emerald-400" />
                    Contribution margin ≥ {validationCriteria.minContributionMargin}%
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Lock className="w-3 h-3 text-amber-400" />
                    Human approval for payments
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Lock className="w-3 h-3 text-amber-400" />
                    First order &lt; {validationCriteria.maxBudgetExposure * 100}% of budget
                  </div>
                </div>
              </div>

              {/* Phases preview */}
              <div className="glass-card p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Validation Phases (5 Agents)</p>
                <div className="space-y-1">
                  {validationPhases.map((phase, idx) => (
                    <div key={phase.id} className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/30">
                      <span className="text-sm">{phase.icon}</span>
                      <span className="text-xs text-white flex-1">{phase.name}</span>
                      <span className="text-[10px] text-slate-500">{phase.agent}</span>
                      <span className="text-[10px] text-slate-500">min: {phase.minScore}/10</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={runValidationFlow}
                disabled={!productName.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold bg-amazon-orange/20 text-amazon-orange border border-amazon-orange/30 hover:bg-amazon-orange/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Play className="w-4 h-4" />
                {isRerun ? 'Re-run Validation Flow' : 'Start Product Research'}
              </button>
            </div>
          )}

          {/* Running / Complete state */}
          {(flowState === 'running' || flowState === 'complete') && (
            <div className="space-y-3">
              {/* Product info */}
              <div className="glass-card p-3 flex items-center gap-3">
                <Package className="w-5 h-5 text-amazon-orange" />
                <div>
                  <p className="text-sm font-medium text-white">{productName}</p>
                  <p className="text-xs text-slate-400">{department?.name || 'All Categories'} &middot; Budget: ${budget} &middot; Min margin: {targetMargin}%</p>
                </div>
                {flowState === 'running' && (
                  <div className="ml-auto flex items-center gap-1.5 px-2 py-1 rounded-full bg-blue-500/20 border border-blue-500/30">
                    <Loader2 className="w-3 h-3 text-blue-400 animate-spin" />
                    <span className="text-xs text-blue-400">Running...</span>
                  </div>
                )}
              </div>

              {/* Phase cards */}
              {validationPhases.map((phase, idx) => (
                <ValidationPhaseCard
                  key={phase.id}
                  phase={phase}
                  result={phaseResults[phase.id]}
                  isActive={flowState === 'running' && currentPhase === idx}
                  onRun={() => {}}
                />
              ))}

              {/* Overall result */}
              {flowState === 'complete' && (
                <div className={`glass-card p-4 border ${
                  totalScore >= validationCriteria.overallThreshold && failedPhases === 0
                    ? 'border-emerald-500/50'
                    : failedPhases > 0
                      ? 'border-red-500/50'
                      : 'border-amber-500/50'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-amazon-orange" />
                      Validation Result
                    </h4>
                    <span className={`text-2xl font-bold ${
                      totalScore >= validationCriteria.overallThreshold ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {totalScore}/{validationCriteria.maxScore}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="text-center p-2 rounded-lg bg-slate-800/50">
                      <p className={`text-lg font-bold ${avgConfidence >= validationCriteria.minConfidence ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {avgConfidence}%
                      </p>
                      <p className="text-xs text-slate-400">Confidence</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-slate-800/50">
                      <p className={`text-lg font-bold ${failedPhases === 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {validationPhases.length - failedPhases}/{validationPhases.length}
                      </p>
                      <p className="text-xs text-slate-400">Phases Passed</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-slate-800/50">
                      <p className={`text-lg font-bold ${
                        totalScore >= validationCriteria.overallThreshold && failedPhases === 0
                          ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {totalScore >= validationCriteria.overallThreshold && failedPhases === 0 ? 'PASS' : failedPhases > 0 ? 'FAIL' : 'REVIEW'}
                      </p>
                      <p className="text-xs text-slate-400">Verdict</p>
                    </div>
                  </div>

                  {totalScore >= validationCriteria.overallThreshold && failedPhases === 0 ? (
                    <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
                      <span className="font-semibold">VALIDATED WINNER</span> — Score {totalScore}/{validationCriteria.maxScore} (threshold: {validationCriteria.overallThreshold}), confidence {avgConfidence}%. Ready for supplier discovery.
                    </div>
                  ) : failedPhases > 0 ? (
                    <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-300">
                      <span className="font-semibold">DID NOT PASS</span> — {failedPhases} phase(s) below minimum threshold. Consider adjusting product criteria or exploring alternative products in this category.
                    </div>
                  ) : (
                    <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                      <span className="font-semibold">NEEDS REVIEW</span> — Score close to threshold. Gather more data or re-run specific phases to increase confidence.
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => { setFlowState('setup'); setPhaseResults({}); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-700/50 text-slate-300 hover:bg-slate-700 transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Re-run
                    </button>
                    {totalScore >= validationCriteria.overallThreshold && failedPhases === 0 && (
                      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors">
                        <ArrowRight className="w-3 h-3" />
                        Proceed to Supplier Discovery
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───

export default function ProductResearchHub() {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('composite')
  const [filterOpp, setFilterOpp] = useState('all')
  const [expandedDept, setExpandedDept] = useState(null)
  const [researchTarget, setResearchTarget] = useState(null) // { department, product? }
  const [showRerun, setShowRerun] = useState(false)

  // Filter and sort departments
  const filteredDepts = amazonDepartments
    .filter(d => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        return d.name.toLowerCase().includes(q) ||
          d.subcategories.some(s => s.name.toLowerCase().includes(q))
      }
      return true
    })
    .filter(d => {
      if (filterOpp === 'high') return d.composite >= 7.5
      if (filterOpp === 'medium') return d.composite >= 6.5 && d.composite < 7.5
      if (filterOpp === 'active') return d.activeProducts.length > 0
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'composite') return b.composite - a.composite
      if (sortBy === 'market') return parseFloat(b.marketSize.replace(/[^0-9.]/g, '')) - parseFloat(a.marketSize.replace(/[^0-9.]/g, ''))
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      return 0
    })

  const highOppCount = amazonDepartments.filter(d => d.composite >= 7.5).length
  const activeCount = amazonDepartments.filter(d => d.activeProducts.length > 0).length

  return (
    <div className="space-y-6">
      {/* Header stats */}
      <div className="glass-card p-4">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-white">{amazonDepartments.length}</p>
            <p className="text-xs text-slate-400">Departments</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-emerald-400">{highOppCount}</p>
            <p className="text-xs text-slate-400">High Opportunity</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-amazon-orange">{activeCount}</p>
            <p className="text-xs text-slate-400">Active</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-400">{amazonDepartments.reduce((sum, d) => sum + d.subcategories.length, 0)}</p>
            <p className="text-xs text-slate-400">Subcategories</p>
          </div>
        </div>
      </div>

      {/* Controls: Search + Filter + Sort + Re-run button */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search departments or subcategories..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white text-sm focus:border-amazon-orange focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 border border-slate-600">
          <Filter className="w-3 h-3 text-slate-400" />
          <select
            value={filterOpp}
            onChange={e => setFilterOpp(e.target.value)}
            className="bg-transparent text-sm text-white focus:outline-none"
          >
            <option value="all">All Departments</option>
            <option value="high">High Opportunity</option>
            <option value="medium">Medium Opportunity</option>
            <option value="active">Active Products</option>
          </select>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 border border-slate-600">
          <SortAsc className="w-3 h-3 text-slate-400" />
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="bg-transparent text-sm text-white focus:outline-none"
          >
            <option value="composite">Score (High → Low)</option>
            <option value="market">Market Size</option>
            <option value="name">Alphabetical</option>
          </select>
        </div>

        <button
          onClick={() => setShowRerun(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-amazon-orange/20 text-amazon-orange border border-amazon-orange/30 hover:bg-amazon-orange/30 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Re-run Existing Product
        </button>
      </div>

      {/* Scoring criteria legend */}
      <div className="glass-card p-3">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-3 h-3 text-amazon-orange" />
          <span className="text-xs text-slate-400 font-medium">Scoring Criteria (weighted)</span>
        </div>
        <div className="flex flex-wrap gap-3">
          {Object.entries(scoringWeights).map(([key, w]) => (
            <span key={key} className="text-[10px] text-slate-500">
              {w.label} <span className="text-slate-400 font-medium">{(w.weight * 100)}%</span>
            </span>
          ))}
        </div>
      </div>

      {/* Department cards */}
      <div className="space-y-3">
        {filteredDepts.map(dept => (
          <DepartmentCard
            key={dept.id}
            dept={dept}
            isExpanded={expandedDept === dept.id}
            onToggle={() => setExpandedDept(expandedDept === dept.id ? null : dept.id)}
            onResearch={(d) => setResearchTarget({ department: d })}
          />
        ))}
      </div>

      {filteredDepts.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-8 h-8 text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-400">No departments match your search.</p>
        </div>
      )}

      {/* Research flow modal */}
      {researchTarget && (
        <ResearchFlow
          department={researchTarget.department}
          existingProduct={researchTarget.product}
          onClose={() => setResearchTarget(null)}
        />
      )}

      {/* Re-run existing product modal */}
      {showRerun && (
        <ResearchFlow
          department={amazonDepartments.find(d => d.id === 'pet-supplies')}
          existingProduct="Self-Cleaning Pet Slicker Brush"
          onClose={() => setShowRerun(false)}
        />
      )}
    </div>
  )
}
