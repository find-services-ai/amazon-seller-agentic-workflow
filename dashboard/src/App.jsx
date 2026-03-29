import { useState } from 'react'
import {
  Package, BarChart3, Target, Zap,
  BookOpen, Cpu, Flag, LayoutDashboard
} from 'lucide-react'
import Header from './components/Header'
import KPICards from './components/KPICards'
import PipelineStatus from './components/PipelineStatus'
import ProductCards from './components/ProductCards'
import ApprovalGates from './components/ApprovalGates'
import ActivityFeed from './components/ActivityFeed'
import StrategyDeepDive from './components/StrategyDeepDive'
import WorkflowRunner from './components/WorkflowRunner'
import ActionItems from './components/ActionItems'
import { pipelineData, productsData, approvalsData, activityData, kpiData } from './data/dashboardData'
import { strategies, workflowDefinitions, actionItems } from './data/strategyData'

const tabs = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'strategies', label: 'Strategies', icon: BookOpen },
  { id: 'workflows', label: 'AI Workflows', icon: Cpu },
  { id: 'actions', label: 'Action Items', icon: Flag }
]

function App() {
  const [activeTab, setActiveTab] = useState('overview')
  const [products, setProducts] = useState(productsData)
  const [approvals, setApprovals] = useState(approvalsData)
  const [pipeline, setPipeline] = useState(pipelineData)
  const [actions, setActions] = useState(actionItems)

  const handleApproval = (id, decision) => {
    setApprovals(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, status: decision, decidedAt: new Date().toISOString() }
          : item
      )
    )
  }

  const handleProductVeto = (productId, decision) => {
    setProducts(prev =>
      prev.map(product =>
        product.id === productId
          ? { ...product, status: decision }
          : product
      )
    )
  }

  const handleActionComplete = (id, decision) => {
    setActions(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, status: 'completed', decision }
          : item
      )
    )
  }

  const handleRunWorkflow = (workflowId) => {
    console.log('Running workflow:', workflowId)
  }

  const pendingActionCount = actions.filter(a => a.status === 'pending' && a.priority === 'critical').length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header />

      {/* Tab Navigation */}
      <div className="sticky top-16 z-40 bg-slate-900/90 backdrop-blur-lg border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-1 py-2 overflow-x-auto">
            {tabs.map(tab => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              const showBadge = tab.id === 'actions' && pendingActionCount > 0

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all
                    ${isActive
                      ? 'bg-amazon-orange/20 text-amazon-orange border border-amazon-orange/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {showBadge && (
                    <span className="w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                      {pendingActionCount}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ===== OVERVIEW TAB ===== */}
        {activeTab === 'overview' && (
          <>
            <KPICards data={kpiData} />

            <section>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amazon-orange" />
                Autonomous Pipeline Status
              </h2>
              <PipelineStatus stages={pipeline} />
            </section>

            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-amazon-orange" />
                  Products in Pipeline
                </h2>
                <ProductCards products={products} onVeto={handleProductVeto} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-amazon-orange" />
                  Approval Gates
                </h2>
                <ApprovalGates approvals={approvals} onDecision={handleApproval} />
              </div>
            </div>

            <section>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-amazon-orange" />
                Recent Activity
              </h2>
              <ActivityFeed activities={activityData} />
            </section>
          </>
        )}

        {/* ===== STRATEGIES TAB ===== */}
        {activeTab === 'strategies' && (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-amazon-orange" />
                  Strategy Deep Dive
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Full reasoning chains with data sources for every decision the AI system made.
                  Click any strategy to explore the step-by-step logic, confidence levels, and source attribution.
                </p>
              </div>
            </div>
            <StrategyDeepDive strategies={strategies} />
          </>
        )}

        {/* ===== WORKFLOWS TAB ===== */}
        {activeTab === 'workflows' && (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-amazon-orange" />
                  AI Workflow Runner
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Trigger, monitor, and re-run autonomous AI workflows.
                  Each workflow shows its steps, approval gates, agents involved, and expected outputs.
                </p>
              </div>
            </div>
            <WorkflowRunner
              workflows={workflowDefinitions}
              onRunWorkflow={handleRunWorkflow}
            />
          </>
        )}

        {/* ===== ACTIONS TAB ===== */}
        {activeTab === 'actions' && (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Flag className="w-5 h-5 text-amazon-orange" />
                  Action Items
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Prioritized actions that need your decision. Each item shows impact analysis and reasoning
                  for why it matters to the business.
                </p>
              </div>
            </div>
            <ActionItems items={actions} onComplete={handleActionComplete} />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center text-slate-400 text-sm">
          <span>Amazon Seller Autonomous Operations &middot; Agentic Dashboard v2.0</span>
          <span>Contributor: cc-agent</span>
        </div>
      </footer>
    </div>
  )
}

export default App
