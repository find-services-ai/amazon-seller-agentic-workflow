// Platform API client for catalog, trends, and store endpoints

const API_BASE = '/api'

function authHeaders() {
  const token = localStorage.getItem('auth_token')
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  return headers
}

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: authHeaders(),
    ...options
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  return res.json()
}

// ─── Catalog ─────────────────────────────────────────────────

export const catalog = {
  listProducts: (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return request(`/catalog/products${qs ? `?${qs}` : ''}`)
  },

  getProduct: (slug) => request(`/catalog/products/${slug}`),

  createProduct: (data) => request('/catalog/products', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  updateProduct: (slug, data) => request(`/catalog/products/${slug}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  }),

  deleteProduct: (slug) => request(`/catalog/products/${slug}`, {
    method: 'DELETE'
  }),

  listCategories: () => request('/catalog/categories'),

  listSuppliers: (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return request(`/catalog/suppliers${qs ? `?${qs}` : ''}`)
  },

  addSupplier: (data) => request('/catalog/suppliers', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  addQuote: (productSlug, data) => request(`/catalog/products/${productSlug}/quotes`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  logResearch: (productSlug, data) => request(`/catalog/products/${productSlug}/research`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  getAgentRuns: (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return request(`/catalog/agent-runs${qs ? `?${qs}` : ''}`)
  },

  logAgentRun: (data) => request('/catalog/agent-runs', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  getStats: () => request('/catalog/stats')
}

// ─── Trends ──────────────────────────────────────────────────

export const trends = {
  getDiscoveries: (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return request(`/trends/discoveries${qs ? `?${qs}` : ''}`)
  },

  addDiscovery: (data) => request('/trends/discoveries', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  getProductTrends: (slug, params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return request(`/trends/products/${slug}/trends${qs ? `?${qs}` : ''}`)
  },

  addTrendData: (slug, data) => request(`/trends/products/${slug}/trends`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  getTrending: () => request('/trends/trending')
}

// ─── Store ───────────────────────────────────────────────────

export const store = {
  getProfile: () => request('/store/profile'),

  updateProfile: (data) => request('/store/profile', {
    method: 'PATCH',
    body: JSON.stringify(data)
  }),

  listListings: (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return request(`/store/listings${qs ? `?${qs}` : ''}`)
  },

  createListing: (data) => request('/store/listings', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  updateListing: (id, data) => request(`/store/listings/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  }),

  getOrders: (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return request(`/store/orders${qs ? `?${qs}` : ''}`)
  },

  placeOrder: (data) => request('/store/orders', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  getPublicStore: (storeSlug) => fetch(`${API_BASE}/storefront/${storeSlug}`).then(r => r.json())
}

// ─── Chat ────────────────────────────────────────────────────

export const chat = {
  send: (message, history = []) => request('/chat', {
    method: 'POST',
    body: JSON.stringify({ message, history })
  }),

  getSuggestions: () => request('/chat/suggestions')
}
