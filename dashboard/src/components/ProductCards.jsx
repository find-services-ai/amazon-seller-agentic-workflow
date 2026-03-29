import { CheckCircle, XCircle, TrendingUp, AlertTriangle, Package, DollarSign, BarChart3 } from 'lucide-react'

export default function ProductCards({ products, onVeto }) {
  return (
    <div className="space-y-4">
      {products.map(product => (
        <div key={product.id} className="glass-card overflow-hidden">
          {/* Header */}
          <div className="p-5 border-b border-slate-700/50">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amazon-orange to-orange-600 flex items-center justify-center">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{product.name}</h3>
                  <p className="text-sm text-slate-400">{product.category}</p>
                </div>
              </div>
              
              {/* Status Badge */}
              <div className={`
                status-badge flex items-center gap-1
                ${product.status === 'validated' ? 'bg-emerald-500/20 text-emerald-400' : ''}
                ${product.status === 'rejected' ? 'bg-red-500/20 text-red-400' : ''}
                ${product.status === 'pending' ? 'bg-amber-500/20 text-amber-400' : ''}
              `}>
                {product.status === 'validated' && <CheckCircle className="w-3 h-3" />}
                {product.status === 'rejected' && <XCircle className="w-3 h-3" />}
                {product.status}
              </div>
            </div>
          </div>

          {/* Validation Scores Grid */}
          <div className="p-5 border-b border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-slate-300">Validation Score</h4>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-white">{product.validationScore}</span>
                <span className="text-slate-400">/ {product.maxScore}</span>
                <span className={`
                  ml-2 px-2 py-0.5 rounded text-xs font-medium
                  ${product.confidence >= 80 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}
                `}>
                  {product.confidence}% confidence
                </span>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-3">
              {[
                { label: 'Demand', score: product.metrics.demandScore, max: 10 },
                { label: 'Competition', score: product.metrics.competitionScore, max: 10 },
                { label: 'Pricing', score: product.metrics.pricingScore, max: 10 },
                { label: 'Supply Chain', score: product.metrics.supplyChainScore, max: 10 },
                { label: 'Risk', score: product.metrics.riskScore, max: 10 }
              ].map(item => (
                <div key={item.label} className="text-center">
                  <div className="relative w-full h-2 bg-slate-700 rounded-full mb-2">
                    <div 
                      className={`
                        absolute h-full rounded-full
                        ${item.score >= 8 ? 'bg-emerald-500' : ''}
                        ${item.score >= 6 && item.score < 8 ? 'bg-amber-500' : ''}
                        ${item.score < 6 ? 'bg-red-500' : ''}
                      `}
                      style={{ width: `${(item.score / item.max) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-400">{item.label}</p>
                  <p className="text-sm font-semibold text-white">{item.score}/{item.max}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="p-5 border-b border-slate-700/50 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-slate-400 mb-1">Expected Margin</p>
              <p className="text-lg font-bold text-emerald-400">{product.metrics.expectedMargin}%</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Unit Cost</p>
              <p className="text-lg font-bold text-white">{product.metrics.unitCost}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Target Price</p>
              <p className="text-lg font-bold text-white">{product.metrics.targetPrice}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">First Order</p>
              <p className="text-lg font-bold text-white">{product.metrics.firstOrderCost}</p>
            </div>
          </div>

          {/* Market Data */}
          <div className="p-5 border-b border-slate-700/50 bg-slate-800/30">
            <h4 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Market Intelligence
            </h4>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-lg font-bold text-white">{product.marketData.marketSize}</p>
                <p className="text-xs text-slate-400">Market Size</p>
              </div>
              <div>
                <p className="text-lg font-bold text-emerald-400">{product.marketData.cagr}</p>
                <p className="text-xs text-slate-400">CAGR</p>
              </div>
              <div>
                <p className="text-lg font-bold text-white">{product.marketData.usMarketShare}</p>
                <p className="text-xs text-slate-400">US Share</p>
              </div>
              <div>
                <p className="text-lg font-bold text-blue-400">{product.marketData.onlineGrowth}</p>
                <p className="text-xs text-slate-400">Online Growth</p>
              </div>
            </div>
          </div>

          {/* Suppliers Preview */}
          <div className="p-5 border-b border-slate-700/50">
            <h4 className="text-sm font-medium text-slate-300 mb-3">Verified Suppliers ({product.suppliers.length})</h4>
            <div className="space-y-2">
              {product.suppliers.slice(0, 3).map((supplier, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-800/50">
                  <span className="text-sm text-slate-300">{supplier.name}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-emerald-400">{supplier.price}/unit</span>
                    <span className="text-xs text-slate-500">MOQ: {supplier.moq}</span>
                  </div>
                </div>
              ))}
              {product.suppliers.length > 3 && (
                <p className="text-xs text-slate-500 text-center">+{product.suppliers.length - 3} more suppliers</p>
              )}
            </div>
          </div>

          {/* Veto Actions */}
          <div className="p-5 flex items-center justify-between bg-slate-800/30">
            <p className="text-sm text-slate-400">
              Ready for supplier outreach. Make your decision:
            </p>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => onVeto(product.id, 'rejected')}
                className="approval-button bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                NO GO
              </button>
              <button 
                onClick={() => onVeto(product.id, 'approved')}
                className="approval-button bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                GO
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
