import { useState, useEffect } from 'react'
import { TrendingUp, Sparkles, ArrowUpRight, ArrowDownRight, Minus, Loader2, Eye } from 'lucide-react'
import { trends } from '../lib/platformClient'

const COMPETITION_TONE = {
  low: 'text-status-good bg-status-good/10',
  medium: 'text-status-warn bg-status-warn/10',
  high: 'text-status-bad bg-status-bad/10'
}

const DIRECTION_ICON = {
  rising: ArrowUpRight,
  stable: Minus,
  declining: ArrowDownRight
}

const DIRECTION_TONE = {
  rising: 'text-status-good',
  stable: 'text-text-secondary',
  declining: 'text-status-bad'
}

export default function TrendDiscovery() {
  const [discoveries, setDiscoveries] = useState([])
  const [trending, setTrending] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeView, setActiveView] = useState('discoveries') // 'discoveries' | 'trending'

  useEffect(() => {
    setLoading(true)
    Promise.all([
      trends.getDiscoveries().catch(() => ({ discoveries: [] })),
      trends.getTrending().catch(() => ({ rising: [], opportunities: [], hotCategories: [] }))
    ]).then(([discData, trendData]) => {
      setDiscoveries(discData.discoveries)
      setTrending(trendData)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-5 h-5 animate-spin text-text-muted" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* View toggle */}
      <div className="flex gap-1 bg-surface rounded-lg p-1 w-fit">
        {[
          { id: 'discoveries', label: 'Discoveries' },
          { id: 'trending', label: 'Trending Now' }
        ].map(v => (
          <button
            key={v.id}
            onClick={() => setActiveView(v.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all min-h-[40px] ${
              activeView === v.id
                ? 'bg-brand/15 text-brand'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {activeView === 'discoveries' && (
        <DiscoveriesView discoveries={discoveries} />
      )}

      {activeView === 'trending' && trending && (
        <TrendingView data={trending} />
      )}
    </div>
  )
}

function DiscoveriesView({ discoveries }) {
  if (discoveries.length === 0) {
    return (
      <div className="card p-12 text-center">
        <Sparkles className="w-10 h-10 text-text-muted mx-auto mb-3" />
        <p className="text-text-secondary mb-2">No trend discoveries yet</p>
        <p className="text-caption text-text-muted">
          Run the Product Discovery Agent to scan for opportunities, or add discoveries manually via the API.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {discoveries.map(d => (
        <div key={d.id} className="card p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center flex-shrink-0">
            <span className="text-brand font-bold text-sm">{d.opportunity_score || '?'}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium">{d.keyword}</div>
            <div className="text-caption text-text-muted">
              {d.category_name || 'Uncategorized'}
              {d.source && ` · ${d.source}`}
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-sm">
            {d.search_volume && (
              <span className="text-text-secondary">{d.search_volume.toLocaleString()} /mo</span>
            )}
            {d.growth_rate != null && (
              <span className={d.growth_rate > 0 ? 'text-status-good' : 'text-status-bad'}>
                {d.growth_rate > 0 ? '+' : ''}{d.growth_rate}%
              </span>
            )}
            {d.competition && (
              <span className={`text-xs font-medium px-2 py-1 rounded-md ${COMPETITION_TONE[d.competition] || ''}`}>
                {d.competition}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function TrendingView({ data }) {
  const { rising, opportunities, hotCategories } = data
  const hasData = rising.length > 0 || opportunities.length > 0 || hotCategories.length > 0

  if (!hasData) {
    return (
      <div className="card p-12 text-center">
        <TrendingUp className="w-10 h-10 text-text-muted mx-auto mb-3" />
        <p className="text-text-secondary mb-2">No trending data yet</p>
        <p className="text-caption text-text-muted">
          Add products and run trend scans to populate this view.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Rising Products */}
      {rising.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
            <ArrowUpRight className="w-4 h-4 text-status-good" />
            Rising Products
          </h3>
          <div className="space-y-2">
            {rising.map((r, i) => {
              const DirIcon = DIRECTION_ICON[r.trend_direction] || Minus
              return (
                <div key={i} className="card p-3 flex items-center gap-3">
                  <DirIcon className={`w-4 h-4 ${DIRECTION_TONE[r.trend_direction] || ''}`} />
                  <div className="flex-1">
                    <span className="font-medium">{r.name}</span>
                    <span className="text-text-muted text-caption ml-2">{r.slug}</span>
                  </div>
                  {r.demand_score && (
                    <span className="text-sm text-text-secondary">Demand: {r.demand_score}/10</span>
                  )}
                  {r.search_volume && (
                    <span className="text-sm text-text-muted">{r.search_volume.toLocaleString()} /mo</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Top Opportunities */}
      {opportunities.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand" />
            Top Opportunities (Score ≥ 7)
          </h3>
          <div className="space-y-2">
            {opportunities.map((o, i) => (
              <div key={i} className="card p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center">
                  <span className="text-brand font-bold text-xs">{o.opportunity_score}</span>
                </div>
                <div className="flex-1">
                  <span className="font-medium">{o.keyword}</span>
                  <span className="text-text-muted text-caption ml-2">{o.category_name || ''}</span>
                </div>
                {o.competition && (
                  <span className={`text-xs px-2 py-0.5 rounded ${COMPETITION_TONE[o.competition] || ''}`}>
                    {o.competition}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hot Categories */}
      {hotCategories.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Eye className="w-4 h-4 text-status-warn" />
            Active Categories
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {hotCategories.map((c, i) => (
              <div key={i} className="card p-3 text-center">
                <div className="font-medium text-sm">{c.name}</div>
                <div className="text-caption text-text-muted">
                  {c.product_count} products
                  {c.avg_score != null && ` · avg ${Math.round(c.avg_score)}/50`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
