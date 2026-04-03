import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Package, TrendingUp, Filter, ChevronRight, Loader2 } from 'lucide-react'
import { catalog } from '../lib/platformClient'

const STATUS_LABELS = {
  idea: 'Idea',
  researching: 'Researching',
  validated: 'Validated',
  sourcing: 'Sourcing',
  launching: 'Launching',
  active: 'Active',
  paused: 'Paused',
  discontinued: 'Discontinued'
}

const STATUS_TONE = {
  idea: 'text-text-secondary bg-surface-overlay',
  researching: 'text-brand bg-brand/10',
  validated: 'text-status-good bg-status-good/10',
  sourcing: 'text-status-warn bg-status-warn/10',
  launching: 'text-brand bg-brand/10',
  active: 'text-status-good bg-status-good/10',
  paused: 'text-text-muted bg-surface-overlay',
  discontinued: 'text-status-bad bg-status-bad/10'
}

export default function ProductCatalog() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [stats, setStats] = useState(null)

  const loadProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (search) params.search = search
      if (statusFilter) params.status = statusFilter
      const data = await catalog.listProducts(params)
      setProducts(data.products)
      setTotal(data.total)
    } catch (err) {
      console.error('Failed to load products:', err)
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter])

  useEffect(() => {
    loadProducts()
    catalog.listCategories().then(d => setCategories(d.categories)).catch(() => {})
    catalog.getStats().then(d => setStats(d)).catch(() => {})
  }, [loadProducts])

  return (
    <div className="space-y-6">
      {/* Stats bar */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Products', value: stats.products },
            { label: 'Active', value: stats.active },
            { label: 'Ideas', value: stats.ideas },
            { label: 'Suppliers', value: stats.suppliers }
          ].map(s => (
            <div key={s.label} className="card p-4 text-center">
              <div className="text-2xl font-semibold">{s.value}</div>
              <div className="text-caption text-text-muted">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Search + Filter bar */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/40 min-h-[44px]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 bg-surface rounded-lg text-sm text-text-primary min-h-[44px] focus:outline-none focus:ring-2 focus:ring-brand/40"
        >
          <option value="">All statuses</option>
          {Object.entries(STATUS_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Add Product Form */}
      {showAddForm && (
        <AddProductForm
          categories={categories}
          onCreated={(p) => {
            setProducts(prev => [p, ...prev])
            setShowAddForm(false)
            setTotal(t => t + 1)
          }}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* Product List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-5 h-5 animate-spin text-text-muted" />
        </div>
      ) : products.length === 0 ? (
        <div className="card p-12 text-center">
          <Package className="w-10 h-10 text-text-muted mx-auto mb-3" />
          <p className="text-text-secondary mb-4">No products yet</p>
          <button onClick={() => setShowAddForm(true)} className="btn-primary">
            Add your first product
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {products.map(product => (
            <ProductRow
              key={product.id}
              product={product}
              onSelect={() => setSelectedProduct(
                selectedProduct?.id === product.id ? null : product
              )}
              isSelected={selectedProduct?.id === product.id}
            />
          ))}
          <p className="text-micro text-text-muted text-center pt-2">
            Showing {products.length} of {total} products
          </p>
        </div>
      )}

      {/* Product Detail */}
      {selectedProduct && (
        <ProductDetail
          slug={selectedProduct.slug}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  )
}

function ProductRow({ product, onSelect, isSelected }) {
  const margin = product.expected_margin
  const marginColor = margin >= 35 ? 'text-status-good' : margin >= 20 ? 'text-status-warn' : 'text-status-bad'

  return (
    <button
      onClick={onSelect}
      className={`card w-full text-left p-4 flex items-center gap-4 transition-all ${
        isSelected ? 'ring-1 ring-brand/40' : ''
      }`}
    >
      <div className="w-10 h-10 rounded-lg bg-surface-overlay flex items-center justify-center flex-shrink-0">
        <Package className="w-5 h-5 text-text-muted" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{product.name}</div>
        <div className="text-caption text-text-muted">
          {product.category_name || 'Uncategorized'}
        </div>
      </div>
      <div className="hidden sm:flex items-center gap-4 text-sm">
        {product.target_price && (
          <span className="text-text-secondary">${product.target_price}</span>
        )}
        {margin != null && (
          <span className={marginColor}>{margin}% margin</span>
        )}
        {product.validation_score != null && (
          <span className="text-text-secondary">{product.validation_score}/50</span>
        )}
      </div>
      <span className={`text-xs font-medium px-2 py-1 rounded-md ${STATUS_TONE[product.status] || 'text-text-muted bg-surface-overlay'}`}>
        {STATUS_LABELS[product.status] || product.status}
      </span>
      <ChevronRight className={`w-4 h-4 text-text-muted transition-transform ${isSelected ? 'rotate-90' : ''}`} />
    </button>
  )
}

function ProductDetail({ slug, onClose }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    catalog.getProduct(slug)
      .then(setData)
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="card p-8 flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-text-muted" />
      </div>
    )
  }

  if (!data) return null

  const { product, quotes, research, trends, listings } = data

  return (
    <div className="card p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-title">{product.name}</h3>
          <p className="text-caption text-text-muted">{product.category_name} · {product.slug}</p>
        </div>
        <button onClick={onClose} className="btn-ghost text-sm">Close</button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Target Price', value: product.target_price ? `$${product.target_price}` : '—' },
          { label: 'Unit Cost', value: product.unit_cost ? `$${product.unit_cost}` : '—' },
          { label: 'Margin', value: product.expected_margin ? `${product.expected_margin}%` : '—' },
          { label: 'Validation', value: product.validation_score ? `${product.validation_score}/50` : '—' }
        ].map(m => (
          <div key={m.label} className="bg-surface rounded-lg p-3">
            <div className="text-micro text-text-muted">{m.label}</div>
            <div className="text-body font-medium">{m.value}</div>
          </div>
        ))}
      </div>

      {/* Suppliers */}
      {quotes.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">Supplier Quotes ({quotes.length})</h4>
          <div className="space-y-1">
            {quotes.map(q => (
              <div key={q.id} className="flex items-center justify-between bg-surface rounded-lg px-3 py-2 text-sm">
                <span>{q.supplier_name}</span>
                <span className="text-text-secondary">
                  ${q.price_low}–${q.price_high} · MOQ {q.moq}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Research Phases */}
      {research.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">Research ({research.length} phases)</h4>
          <div className="space-y-1">
            {research.map(r => (
              <div key={r.id} className="flex items-center justify-between bg-surface rounded-lg px-3 py-2 text-sm">
                <span className="capitalize">{r.phase_id}</span>
                <div className="flex gap-3 text-text-secondary">
                  <span>Score: {r.score}</span>
                  <span>Confidence: {r.confidence}%</span>
                  <span className={r.verdict === 'PASS' ? 'text-status-good' : r.verdict === 'FAIL' ? 'text-status-bad' : 'text-status-warn'}>
                    {r.verdict}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trend summary */}
      {trends.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">Recent Trends</h4>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {trends.slice(0, 7).map(t => (
              <div key={t.id} className="bg-surface rounded-lg px-3 py-2 text-xs flex-shrink-0">
                <div className="text-text-muted">{t.date}</div>
                <div className="font-medium">{t.trend_direction || '—'}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Listings */}
      {listings.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">Listings ({listings.length})</h4>
          <div className="space-y-1">
            {listings.map(l => (
              <div key={l.id} className="flex items-center justify-between bg-surface rounded-lg px-3 py-2 text-sm">
                <span>{l.title || product.name}</span>
                <div className="flex gap-2">
                  <span className="text-xs px-2 py-0.5 rounded bg-surface-overlay">{l.channel}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-surface-overlay">{l.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function AddProductForm({ categories, onCreated, onCancel }) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [targetPrice, setTargetPrice] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    setError('')
    try {
      const data = await catalog.createProduct({
        name: name.trim(),
        category: category || undefined,
        targetPrice: targetPrice ? Number(targetPrice) : undefined,
        description: description || undefined
      })
      onCreated(data.product)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-4">
      <h3 className="text-title">Add Product Idea</h3>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-caption text-text-muted mb-1">Product Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Self-Cleaning Pet Brush"
            className="w-full px-3 py-2.5 bg-surface rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 min-h-[44px]"
            required
          />
        </div>
        <div>
          <label className="block text-caption text-text-muted mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2.5 bg-surface rounded-lg text-sm text-text-primary min-h-[44px] focus:outline-none focus:ring-2 focus:ring-brand/40"
          >
            <option value="">Select category</option>
            {categories.map(c => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-caption text-text-muted mb-1">Target Price ($)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={targetPrice}
            onChange={(e) => setTargetPrice(e.target.value)}
            placeholder="12.99"
            className="w-full px-3 py-2.5 bg-surface rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 min-h-[44px]"
          />
        </div>
        <div>
          <label className="block text-caption text-text-muted mb-1">Brief Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What makes this product a good idea?"
            className="w-full px-3 py-2.5 bg-surface rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 min-h-[44px]"
          />
        </div>
      </div>

      {error && <p className="text-sm text-status-bad">{error}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={saving || !name.trim()} className="btn-primary">
          {saving ? 'Adding…' : 'Add Product'}
        </button>
        <button type="button" onClick={onCancel} className="btn-ghost">Cancel</button>
      </div>
    </form>
  )
}
