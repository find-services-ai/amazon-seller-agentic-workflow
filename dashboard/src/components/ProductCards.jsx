import { CheckCircle, XCircle, Package, BarChart3 } from 'lucide-react'

export default function ProductCards({ products, onVeto }) {
  return (
    <div className="space-y-4">
      {products.map(product => (
        <div key={product.id} className="card space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-brand/15 flex items-center justify-center shrink-0">
                <Package className="w-5 h-5 text-brand" />
              </div>
              <div className="flex items-center gap-3">
                <div>
                  <h3 className="text-title truncate">{product.name}</h3>
                  <p className="text-caption text-text-secondary">{product.category}</p>
                </div>
              </div>
            </div>
            <span className={`text-micro px-2 py-1 rounded-lg ${product.status === 'validated' ? 'bg-status-good/15 text-status-good' : product.status === 'rejected' ? 'bg-status-bad/15 text-status-bad' : 'bg-status-warn/15 text-status-warn'}`}>
              {product.status}
            </span>
          </div>

          {/* Validation Scores Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-caption text-text-secondary">Validation score</h4>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-semibold">{product.validationScore}</span>
                <span className="text-text-secondary">/ {product.maxScore}</span>
                <span className={`
                  ml-2 px-2 py-0.5 rounded-lg text-micro font-medium
                  ${product.confidence >= 80 ? 'bg-status-good/15 text-status-good' : 'bg-status-warn/15 text-status-warn'}
                `}>
                  {product.confidence}% confidence
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { label: 'Demand', score: product.metrics.demandScore, max: 10 },
                { label: 'Competition', score: product.metrics.competitionScore, max: 10 },
                { label: 'Pricing', score: product.metrics.pricingScore, max: 10 },
                { label: 'Supply Chain', score: product.metrics.supplyChainScore, max: 10 },
                { label: 'Risk', score: product.metrics.riskScore, max: 10 }
              ].map(item => (
                <div key={item.label} className="text-center">
                  <div className="relative w-full h-1.5 bg-surface-overlay rounded-full mb-2">
                    <div 
                      className={`
                        absolute h-full rounded-full
                        ${item.score >= 8 ? 'bg-status-good' : ''}
                        ${item.score >= 6 && item.score < 8 ? 'bg-status-warn' : ''}
                        ${item.score < 6 ? 'bg-status-bad' : ''}
                      `}
                      style={{ width: `${(item.score / item.max) * 100}%` }}
                    />
                  </div>
                  <p className="text-micro text-text-muted">{item.label}</p>
                  <p className="text-caption font-semibold">{item.score}/{item.max}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl bg-surface">
            <div>
              <p className="text-micro text-text-muted mb-1">Expected margin</p>
              <p className="text-body font-semibold text-status-good">{product.metrics.expectedMargin}%</p>
            </div>
            <div>
              <p className="text-micro text-text-muted mb-1">Unit cost</p>
              <p className="text-body font-semibold">{product.metrics.unitCost}</p>
            </div>
            <div>
              <p className="text-micro text-text-muted mb-1">Target price</p>
              <p className="text-body font-semibold">{product.metrics.targetPrice}</p>
            </div>
            <div>
              <p className="text-micro text-text-muted mb-1">First order</p>
              <p className="text-body font-semibold">{product.metrics.firstOrderCost}</p>
            </div>
          </div>

          {/* Market Data */}
          <div className="p-4 rounded-xl bg-surface space-y-3">
            <h4 className="text-caption text-text-secondary flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Market snapshot
            </h4>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-body font-semibold">{product.marketData.marketSize}</p>
                <p className="text-micro text-text-muted">Market size</p>
              </div>
              <div>
                <p className="text-body font-semibold text-status-good">{product.marketData.cagr}</p>
                <p className="text-micro text-text-muted">CAGR</p>
              </div>
              <div>
                <p className="text-body font-semibold">{product.marketData.usMarketShare}</p>
                <p className="text-micro text-text-muted">US share</p>
              </div>
              <div>
                <p className="text-body font-semibold">{product.marketData.onlineGrowth}</p>
                <p className="text-micro text-text-muted">Online growth</p>
              </div>
            </div>
          </div>

          {/* Suppliers Preview */}
          <div className="space-y-2">
            <h4 className="text-caption text-text-secondary">Verified suppliers ({product.suppliers.length})</h4>
            <div className="space-y-2">
              {product.suppliers.slice(0, 3).map((supplier, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-surface">
                  <span className="text-sm">{supplier.name}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-status-good">{supplier.price}/unit</span>
                    <span className="text-micro text-text-muted">MOQ: {supplier.moq}</span>
                  </div>
                </div>
              ))}
              {product.suppliers.length > 3 && (
                <p className="text-micro text-text-muted text-center">+{product.suppliers.length - 3} more suppliers</p>
              )}
            </div>
          </div>

          {/* Veto Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-border-subtle">
            <p className="text-caption text-text-secondary">
              Ready for outreach. Choose one action.
            </p>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => onVeto(product.id, 'rejected')}
                className="btn-danger text-sm"
              >
                <XCircle className="w-4 h-4" />
                No Go
              </button>
              <button 
                onClick={() => onVeto(product.id, 'approved')}
                className="btn-success text-sm"
              >
                <CheckCircle className="w-4 h-4" />
                Go
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
