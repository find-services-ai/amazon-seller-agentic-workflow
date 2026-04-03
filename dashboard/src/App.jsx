import { useState, useEffect } from 'react'
import {
  Package, BarChart3, Target, Zap,
  BookOpen, Cpu, Flag, LayoutDashboard, Plug, Send, Search
} from 'lucide-react'
import Header from './components/Header'
import LoginPage from './components/LoginPage'
import KPICards from './components/KPICards'
import PipelineStatus from './components/PipelineStatus'
import ProductCards from './components/ProductCards'
import ApprovalGates from './components/ApprovalGates'
import ActivityFeed from './components/ActivityFeed'
import StrategyDeepDive from './components/StrategyDeepDive'
import WorkflowRunner from './components/WorkflowRunner'
import ActionItems from './components/ActionItems'
import IntegrationHub from './components/IntegrationHub'
import SupplierOutreach from './components/SupplierOutreach'
import ProductResearchHub from './components/ProductResearchHub'
import ResearchLog from './components/ResearchLog'
import { pipelineData, productsData, approvalsData, activityData, kpiData } from './data/dashboardData'
import { strategies, workflowDefinitions, actionItems } from './data/strategyData'
import { integrations } from './data/integrationsData'

const tabs = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'research', label: 'Research', icon: Search },
  { id: 'strategies', label: 'Strategies', icon: BookOpen },
  { id: 'workflows', label: 'Workflows', icon: Cpu },
  { id: 'actions', label: 'Actions', icon: Flag },
  { id: 'outreach', label: 'Outreach', icon: Send },
  { id: 'integrations', label: 'Integrations', icon: Plug }
]

function App() {
  const [user, setUser] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [products, setProducts] = useState(productsData)
  const [approvals, setApprovals] = useState(approvalsData)
  const [pipeline, setPipeline] = useState(pipelineData)
  const [actions, setActions] = useState(actionItems)

  // Check for existing session on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    const savedUser = localStorage.getItem('auth_user')
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch { /* invalid stored data */ }
    }
    setAuthChecked(true)
  }, [])

  const handleLogin = (userData, token) => {
    localStorage.setItem('auth_token', token)
    localStorage.setItem('auth_user', JSON.stringify(userData))
    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    setUser(null)
  }

  // Show loading while checking auth
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="skeleton h-10 w-32" />
      </div>
    )
  }

  // Show login page if not authenticated
  if (!user) {
    return <LoginPage onLogin={handleLogin} />
  }

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
    <div className="min-h-screen bg-[#0a0a0a] text-text-primary">
      <Header user={user} onLogout={handleLogout} />

      {/* Tab Navigation */}
      <div className="sticky top-14 z-40 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-border-subtle">
        <div className="max-w-5xl mx-auto px-4">
          <nav className="flex gap-1 py-2 overflow-x-auto no-scrollbar">
            {tabs.map(tab => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              const showBadge = tab.id === 'actions' && pendingActionCount > 0

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all min-h-[44px]
                    ${isActive
                      ? 'bg-brand/15 text-brand'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-overlay'
                    }
                  `}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                  {showBadge && (
                    <span className="w-5 h-5 rounded-full bg-status-bad text-white text-xs flex items-center justify-center font-bold">
                      {pendingActionCount}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">

        {/* Page Intro */}
        <section className="space-y-3">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Run your seller business with less effort</h1>
          <p className="text-text-secondary max-w-2xl text-sm sm:text-body">
            Clear steps, clear numbers, and clear decisions. Built so anyone can use it.
          </p>
        </section>

        {/* ===== OVERVIEW TAB ===== */}
        {activeTab === 'overview' && (
          <>
            <KPICards data={kpiData} />

            <section>
              <h2 className="text-title mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-brand" />
                Pipeline status
              </h2>
              <PipelineStatus stages={pipeline} />
            </section>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <h2 className="text-title flex items-center gap-2">
                  <Package className="w-4 h-4 text-brand" />
                  Products
                </h2>
                <ProductCards products={products} onVeto={handleProductVeto} />
              </div>
              <div className="space-y-4">
                <h2 className="text-title flex items-center gap-2">
                  <Target className="w-4 h-4 text-brand" />
                  Approvals
                </h2>
                <ApprovalGates approvals={approvals} onDecision={handleApproval} />
              </div>
            </div>

            <section>
              <h2 className="text-title mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-brand" />
                Activity
              </h2>
              <ActivityFeed activities={activityData} />
            </section>
          </>
        )}

        {/* ===== RESEARCH TAB ===== */}
        {activeTab === 'research' && (
          <>
            <div className="space-y-2">
              <div>
                <h2 className="text-title flex items-center gap-2">
                  <Search className="w-4 h-4 text-brand" />
                  Research
                </h2>
                <p className="text-caption text-text-secondary mt-1">
                  Find good products fast. Validate in 5 phases.
                </p>
              </div>
            </div>
            <ProductResearchHub />
            <ResearchLog />
          </>
        )}

        {/* ===== STRATEGIES TAB ===== */}
        {activeTab === 'strategies' && (
          <>
            <div className="space-y-2">
              <div>
                <h2 className="text-title flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-brand" />
                  Strategy
                </h2>
                <p className="text-caption text-text-secondary mt-1">
                  Why each decision was made.
                </p>
              </div>
            </div>
            <StrategyDeepDive strategies={strategies} />
          </>
        )}

        {/* ===== WORKFLOWS TAB ===== */}
        {activeTab === 'workflows' && (
          <>
            <div className="space-y-2">
              <div>
                <h2 className="text-title flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-brand" />
                  Workflows
                </h2>
                <p className="text-caption text-text-secondary mt-1">
                  Run and monitor repeatable AI tasks.
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
            <div className="space-y-2">
              <div>
                <h2 className="text-title flex items-center gap-2">
                  <Flag className="w-4 h-4 text-brand" />
                  Actions
                </h2>
                <p className="text-caption text-text-secondary mt-1">
                  What needs your attention now.
                </p>
              </div>
            </div>
            <ActionItems items={actions} onComplete={handleActionComplete} />
          </>
        )}

        {/* ===== OUTREACH TAB ===== */}
        {activeTab === 'outreach' && (
          <>
            <div className="space-y-2">
              <div>
                <h2 className="text-title flex items-center gap-2">
                  <Send className="w-4 h-4 text-brand" />
                  Outreach
                </h2>
                <p className="text-caption text-text-secondary mt-1">
                  Contact suppliers with one click.
                </p>
              </div>
            </div>
            <SupplierOutreach />
          </>
        )}

        {/* ===== INTEGRATIONS TAB ===== */}
        {activeTab === 'integrations' && (
          <>
            <div className="space-y-2">
              <div>
                <h2 className="text-title flex items-center gap-2">
                  <Plug className="w-4 h-4 text-brand" />
                  Integrations
                </h2>
                <p className="text-caption text-text-secondary mt-1">
                  Connect Gmail, Sheets, Slack, and more.
                </p>
              </div>
            </div>
            <IntegrationHub integrations={integrations} />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border-subtle mt-12 py-6">
        <div className="max-w-5xl mx-auto px-4 flex justify-between items-center text-text-muted text-caption">
          <span>Seller Platform</span>
          <span>Built for clear decisions</span>
        </div>
      </footer>
    </div>
  )
}

export default App
