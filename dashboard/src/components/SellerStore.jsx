import { useState, useEffect } from 'react'
import { Store, ShoppingBag, Package, ExternalLink, Edit3, Loader2, Plus } from 'lucide-react'
import { store, catalog } from '../lib/platformClient'

export default function SellerStore() {
  const [profile, setProfile] = useState(null)
  const [listings, setListings] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState('store') // 'store' | 'listings' | 'orders'
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      store.getProfile().catch(() => null),
      store.listListings().catch(() => ({ listings: [] })),
      store.getOrders().catch(() => ({ orders: [] }))
    ]).then(([profileData, listingsData, ordersData]) => {
      if (profileData) setProfile(profileData.seller)
      setListings(listingsData.listings)
      setOrders(ordersData.orders)
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
      {/* Section toggle */}
      <div className="flex gap-1 bg-surface rounded-lg p-1 w-fit">
        {[
          { id: 'store', label: 'My Store', icon: Store },
          { id: 'listings', label: `Listings (${listings.length})`, icon: Package },
          { id: 'orders', label: `Orders (${orders.length})`, icon: ShoppingBag }
        ].map(s => {
          const Icon = s.icon
          return (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all min-h-[40px] ${
                activeSection === s.id
                  ? 'bg-brand/15 text-brand'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {s.label}
            </button>
          )
        })}
      </div>

      {activeSection === 'store' && (
        <StoreProfile
          profile={profile}
          onUpdate={setProfile}
          editing={editing}
          setEditing={setEditing}
        />
      )}

      {activeSection === 'listings' && (
        <ListingsView listings={listings} onRefresh={() => {
          store.listListings().then(d => setListings(d.listings)).catch(() => {})
        }} />
      )}

      {activeSection === 'orders' && (
        <OrdersView orders={orders} />
      )}
    </div>
  )
}

function StoreProfile({ profile, onUpdate, editing, setEditing }) {
  const [storeName, setStoreName] = useState(profile?.store_name || '')
  const [bio, setBio] = useState(profile?.bio || '')
  const [saving, setSaving] = useState(false)

  if (!profile) {
    return (
      <div className="card p-12 text-center">
        <Store className="w-10 h-10 text-text-muted mx-auto mb-3" />
        <p className="text-text-secondary">Setting up your store…</p>
      </div>
    )
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const data = await store.updateProfile({ storeName, bio })
      onUpdate(data.seller)
      setEditing(false)
    } catch (err) {
      console.error('Failed to update profile:', err)
    } finally {
      setSaving(false)
    }
  }

  const storeUrl = `/store/${profile.store_slug}`

  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-title">{profile.store_name}</h3>
          <p className="text-caption text-text-muted flex items-center gap-1">
            {storeUrl}
            <ExternalLink className="w-3 h-3" />
          </p>
        </div>
        <button onClick={() => setEditing(!editing)} className="btn-ghost text-sm flex items-center gap-1">
          <Edit3 className="w-3.5 h-3.5" />
          Edit
        </button>
      </div>

      {editing ? (
        <div className="space-y-3">
          <div>
            <label className="block text-caption text-text-muted mb-1">Store Name</label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full px-3 py-2.5 bg-surface rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 min-h-[44px]"
            />
          </div>
          <div>
            <label className="block text-caption text-text-muted mb-1">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="Tell buyers about your store…"
              className="w-full px-3 py-2.5 bg-surface rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 resize-none"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving} className="btn-primary">
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button onClick={() => setEditing(false)} className="btn-ghost">Cancel</button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface rounded-lg p-3">
              <div className="text-micro text-text-muted">Slug</div>
              <div className="text-sm font-medium">{profile.store_slug}</div>
            </div>
            <div className="bg-surface rounded-lg p-3">
              <div className="text-micro text-text-muted">Plan</div>
              <div className="text-sm font-medium capitalize">{profile.plan}</div>
            </div>
          </div>
          {profile.bio && (
            <p className="text-sm text-text-secondary">{profile.bio}</p>
          )}
        </div>
      )}
    </div>
  )
}

function ListingsView({ listings, onRefresh }) {
  const [showCreate, setShowCreate] = useState(false)

  if (listings.length === 0 && !showCreate) {
    return (
      <div className="card p-12 text-center">
        <Package className="w-10 h-10 text-text-muted mx-auto mb-3" />
        <p className="text-text-secondary mb-4">No listings yet</p>
        <button onClick={() => setShowCreate(true)} className="btn-primary">
          Create your first listing
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button onClick={() => setShowCreate(!showCreate)} className="btn-secondary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Listing
        </button>
      </div>

      {showCreate && (
        <CreateListingForm
          onCreated={() => {
            setShowCreate(false)
            onRefresh()
          }}
          onCancel={() => setShowCreate(false)}
        />
      )}

      {listings.map(l => (
        <div key={l.id} className="card p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-surface-overlay flex items-center justify-center flex-shrink-0">
            <Package className="w-5 h-5 text-text-muted" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">{l.title || l.product_name}</div>
            <div className="text-caption text-text-muted">
              {l.product_slug} · {l.channel}
            </div>
          </div>
          {l.price && <span className="text-sm font-medium">${l.price}</span>}
          <span className={`text-xs px-2 py-1 rounded-md ${
            l.status === 'active' ? 'text-status-good bg-status-good/10' :
            l.status === 'draft' ? 'text-text-muted bg-surface-overlay' :
            'text-status-warn bg-status-warn/10'
          }`}>
            {l.status}
          </span>
        </div>
      ))}
    </div>
  )
}

function CreateListingForm({ onCreated, onCancel }) {
  const [products, setProducts] = useState([])
  const [productSlug, setProductSlug] = useState('')
  const [channel, setChannel] = useState('storefront')
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    catalog.listProducts().then(d => setProducts(d.products)).catch(() => {})
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!productSlug) return
    setSaving(true)
    setError('')
    try {
      await store.createListing({
        productSlug,
        channel,
        title: title || undefined,
        price: price ? Number(price) : undefined
      })
      onCreated()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-4">
      <h3 className="text-title">Create Listing</h3>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-caption text-text-muted mb-1">Product *</label>
          <select
            value={productSlug}
            onChange={(e) => setProductSlug(e.target.value)}
            className="w-full px-3 py-2.5 bg-surface rounded-lg text-sm text-text-primary min-h-[44px] focus:outline-none focus:ring-2 focus:ring-brand/40"
            required
          >
            <option value="">Select product</option>
            {products.map(p => (
              <option key={p.slug} value={p.slug}>{p.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-caption text-text-muted mb-1">Channel *</label>
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
            className="w-full px-3 py-2.5 bg-surface rounded-lg text-sm text-text-primary min-h-[44px] focus:outline-none focus:ring-2 focus:ring-brand/40"
          >
            <option value="storefront">Storefront</option>
            <option value="amazon">Amazon</option>
            <option value="both">Both</option>
          </select>
        </div>
        <div>
          <label className="block text-caption text-text-muted mb-1">Listing Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Custom title (optional)"
            className="w-full px-3 py-2.5 bg-surface rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 min-h-[44px]"
          />
        </div>
        <div>
          <label className="block text-caption text-text-muted mb-1">Price ($)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="12.99"
            className="w-full px-3 py-2.5 bg-surface rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 min-h-[44px]"
          />
        </div>
      </div>
      {error && <p className="text-sm text-status-bad">{error}</p>}
      <div className="flex gap-3">
        <button type="submit" disabled={saving || !productSlug} className="btn-primary">
          {saving ? 'Creating…' : 'Create Listing'}
        </button>
        <button type="button" onClick={onCancel} className="btn-ghost">Cancel</button>
      </div>
    </form>
  )
}

function OrdersView({ orders }) {
  if (orders.length === 0) {
    return (
      <div className="card p-12 text-center">
        <ShoppingBag className="w-10 h-10 text-text-muted mx-auto mb-3" />
        <p className="text-text-secondary">No orders yet</p>
        <p className="text-caption text-text-muted mt-1">
          Orders from your storefront and Amazon will appear here.
        </p>
      </div>
    )
  }

  const STATUS_TONE = {
    pending: 'text-status-warn bg-status-warn/10',
    confirmed: 'text-brand bg-brand/10',
    shipped: 'text-brand bg-brand/10',
    delivered: 'text-status-good bg-status-good/10',
    returned: 'text-status-bad bg-status-bad/10',
    cancelled: 'text-text-muted bg-surface-overlay'
  }

  return (
    <div className="space-y-2">
      {orders.map(o => (
        <div key={o.id} className="card p-4 flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <div className="font-medium">{o.order_number}</div>
            <div className="text-caption text-text-muted">
              {o.product_name} · {o.buyer_email}
            </div>
          </div>
          <div className="text-sm text-text-secondary">{o.quantity}x</div>
          <div className="text-sm font-medium">${o.total}</div>
          <span className={`text-xs px-2 py-1 rounded-md ${
            STATUS_TONE[o.status] || 'text-text-muted bg-surface-overlay'
          }`}>
            {o.channel}
          </span>
          <span className={`text-xs px-2 py-1 rounded-md ${
            STATUS_TONE[o.status] || 'text-text-muted bg-surface-overlay'
          }`}>
            {o.status}
          </span>
        </div>
      ))}
    </div>
  )
}
