import { useState } from 'react'
import { 
  TrendingUp, Package, DollarSign, AlertTriangle, 
  CheckCircle, XCircle, Clock, Play, Pause,
  ChevronRight, BarChart3, Users, Target, Zap
} from 'lucide-react'
import Header from './components/Header'
import KPICards from './components/KPICards'
import PipelineStatus from './components/PipelineStatus'
import ProductCards from './components/ProductCards'
import ApprovalGates from './components/ApprovalGates'
import ActivityFeed from './components/ActivityFeed'
import { pipelineData, productsData, approvalsData, activityData, kpiData } from './data/dashboardData'

function App() {
  const [products, setProducts] = useState(productsData)
  const [approvals, setApprovals] = useState(approvalsData)
  const [pipeline, setPipeline] = useState(pipelineData)

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* KPI Summary */}
        <KPICards data={kpiData} />

        {/* Pipeline Status */}
        <section>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amazon-orange" />
            Autonomous Pipeline Status
          </h2>
          <PipelineStatus stages={pipeline} />
        </section>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Products In Pipeline */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-amazon-orange" />
              Products in Pipeline
            </h2>
            <ProductCards 
              products={products} 
              onVeto={handleProductVeto} 
            />
          </div>

          {/* Approval Gates */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-amazon-orange" />
              Approval Gates
            </h2>
            <ApprovalGates 
              approvals={approvals}
              onDecision={handleApproval}
            />
          </div>
        </div>

        {/* Activity Feed */}
        <section>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amazon-orange" />
            Recent Activity
          </h2>
          <ActivityFeed activities={activityData} />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center text-slate-400 text-sm">
          <span>Amazon Seller Autonomous Operations</span>
          <span>Contributor: cc-agent</span>
        </div>
      </footer>
    </div>
  )
}

export default App
