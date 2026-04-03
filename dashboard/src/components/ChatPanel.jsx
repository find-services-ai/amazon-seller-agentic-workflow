import { useState, useEffect, useRef } from 'react'
import { Send, Loader2, MessageCircle, X, Sparkles, Package, TrendingUp, BarChart3, Users, ChevronRight } from 'lucide-react'
import { chat } from '../lib/platformClient'

// ─── Data Card Renderers ─────────────────────────────────────

function ProductCard({ product }) {
  const STATUS_TONE = {
    idea: 'text-text-secondary bg-surface-overlay',
    researching: 'text-brand bg-brand/10',
    validated: 'text-status-good bg-status-good/10',
    sourcing: 'text-status-warn bg-status-warn/10',
    active: 'text-status-good bg-status-good/10'
  }
  return (
    <div className="flex items-center gap-3 bg-surface rounded-lg p-3">
      <Package className="w-4 h-4 text-text-muted flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{product.name}</div>
        <div className="text-xs text-text-muted">
          {product.category_name || 'Uncategorized'}
          {product.target_price ? ` · $${product.target_price}` : ''}
          {product.expected_margin ? ` · ${product.expected_margin}% margin` : ''}
        </div>
      </div>
      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${STATUS_TONE[product.status] || 'text-text-muted bg-surface-overlay'}`}>
        {product.status}
      </span>
    </div>
  )
}

function StatsCard({ stats }) {
  const items = [
    { label: 'Products', value: stats.products, icon: Package },
    { label: 'Active', value: stats.active, icon: TrendingUp },
    { label: 'Ideas', value: stats.ideas, icon: Sparkles },
    { label: 'Suppliers', value: stats.suppliers, icon: Users },
  ]
  return (
    <div className="grid grid-cols-2 gap-2">
      {items.map(s => {
        const Icon = s.icon
        return (
          <div key={s.label} className="bg-surface rounded-lg p-2.5 text-center">
            <Icon className="w-3.5 h-3.5 text-text-muted mx-auto mb-1" />
            <div className="text-lg font-semibold">{s.value}</div>
            <div className="text-[10px] text-text-muted">{s.label}</div>
          </div>
        )
      })}
    </div>
  )
}

function DataCards({ intent, data }) {
  if (!data) return null

  if (intent === 'get_stats') {
    return (
      <div className="space-y-2">
        <StatsCard stats={data} />
        {data.recentProducts?.length > 0 && (
          <div className="space-y-1">
            <div className="text-[10px] text-text-muted uppercase tracking-wide">Recent</div>
            {data.recentProducts.map((p, i) => (
              <div key={i} className="flex items-center justify-between bg-surface rounded px-2.5 py-1.5 text-xs">
                <span>{p.name}</span>
                <span className="text-text-muted">{p.status}{p.validation_score ? ` · ${p.validation_score}/50` : ''}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (intent === 'add_product' && data.id) {
    return <ProductCard product={data} />
  }

  if (intent === 'search_products' && Array.isArray(data)) {
    if (data.length === 0) return null
    return (
      <div className="space-y-1.5">
        {data.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    )
  }

  if (intent === 'add_supplier' && data.id) {
    return (
      <div className="bg-surface rounded-lg p-3 flex items-center gap-3">
        <Users className="w-4 h-4 text-text-muted" />
        <div>
          <div className="text-sm font-medium">{data.name}</div>
          <div className="text-xs text-text-muted">{data.platform}{data.contact_email ? ` · ${data.contact_email}` : ''}</div>
        </div>
      </div>
    )
  }

  if (intent === 'list_suppliers' && Array.isArray(data)) {
    return (
      <div className="space-y-1.5">
        {data.map(s => (
          <div key={s.id} className="bg-surface rounded-lg p-2.5 flex items-center gap-3 text-sm">
            <Users className="w-3.5 h-3.5 text-text-muted" />
            <span className="flex-1">{s.name}</span>
            <span className="text-xs text-text-muted">{s.platform}</span>
          </div>
        ))}
      </div>
    )
  }

  if (intent === 'discover_trends') {
    const { discoveries, hotCategories } = data
    return (
      <div className="space-y-2">
        {discoveries?.length > 0 && discoveries.map((d, i) => (
          <div key={i} className="bg-surface rounded-lg p-2.5 flex items-center gap-3">
            <div className="w-7 h-7 rounded bg-brand/10 flex items-center justify-center text-brand text-xs font-bold flex-shrink-0">
              {d.opportunity_score || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{d.keyword}</div>
              <div className="text-xs text-text-muted">{d.category_name || ''}{d.search_volume ? ` · ${d.search_volume.toLocaleString()}/mo` : ''}</div>
            </div>
          </div>
        ))}
        {hotCategories?.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {hotCategories.map((c, i) => (
              <span key={i} className="text-xs bg-surface rounded px-2 py-1 text-text-secondary">
                {c.name} ({c.product_count})
              </span>
            ))}
          </div>
        )}
      </div>
    )
  }

  return null
}

// ─── Chat Message ────────────────────────────────────────────

function ChatMessage({ message }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
        isUser ? 'bg-brand/20 text-brand' : 'bg-surface-overlay text-text-muted'
      }`}>
        {isUser ? (
          <span className="text-xs font-medium">You</span>
        ) : (
          <Sparkles className="w-3.5 h-3.5" />
        )}
      </div>
      <div className={`flex-1 max-w-[85%] space-y-2 ${isUser ? 'text-right' : ''}`}>
        <div className={`inline-block text-left rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? 'bg-brand/15 text-text-primary rounded-tr-md'
            : 'bg-surface text-text-primary rounded-tl-md'
        }`}>
          {message.content.split('\n').map((line, i) => (
            <p key={i} className={i > 0 ? 'mt-1.5' : ''}>{line}</p>
          ))}
        </div>
        {message.data && (
          <DataCards intent={message.intent} data={message.data} />
        )}
        {message.suggestions?.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {message.suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => message.onSuggestion?.(s)}
                className="text-xs px-2.5 py-1.5 rounded-lg bg-surface hover:bg-surface-overlay text-text-secondary hover:text-text-primary transition-colors border border-border-subtle"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main Chat Panel ─────────────────────────────────────────

export default function ChatPanel({ isOpen, onClose, onNavigate }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Load initial suggestions
  useEffect(() => {
    if (isOpen) {
      chat.getSuggestions().then(d => setSuggestions(d.suggestions)).catch(() => {})
      inputRef.current?.focus()
    }
  }, [isOpen])

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text) => {
    const trimmed = (text || input).trim()
    if (!trimmed || sending) return

    const userMsg = { role: 'user', content: trimmed }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setSending(true)

    try {
      // Build history for context
      const history = messages.slice(-8).map(m => ({
        role: m.role,
        content: m.content,
        intent: m.intent
      }))

      const res = await chat.send(trimmed, history)

      const assistantMsg = {
        role: 'assistant',
        content: res.reply,
        intent: res.intent,
        data: res.data,
        suggestions: res.suggestions,
        onSuggestion: (s) => sendMessage(s)
      }
      setMessages(prev => [...prev, assistantMsg])

      // Navigate to relevant tab on certain intents
      if (onNavigate) {
        if (res.intent === 'search_products' || res.intent === 'add_product') {
          // User might want to see catalog
        }
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: err.message || 'Something went wrong. Try again.',
        suggestions: ['Show my products', 'Add a product', 'Help']
      }])
    } finally {
      setSending(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    sendMessage()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full sm:max-w-lg h-full sm:h-[600px] sm:max-h-[80vh] bg-[#0a0a0a] sm:rounded-2xl border border-border-subtle flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-brand/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-brand" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Seller Assistant</h3>
              <p className="text-[10px] text-text-muted">Add products, research, manage suppliers</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-overlay transition-colors">
            <X className="w-4 h-4 text-text-muted" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-brand/10 flex items-center justify-center">
                <MessageCircle className="w-7 h-7 text-brand" />
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-1">Chat your way to selling</h3>
                <p className="text-xs text-text-muted max-w-xs">
                  Add products, find trends, research opportunities, and manage your business — all through conversation.
                </p>
              </div>
              {suggestions.length > 0 && (
                <div className="space-y-2 w-full max-w-xs">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(s.example)}
                      className="w-full text-left px-3 py-2.5 rounded-xl bg-surface hover:bg-surface-overlay transition-colors border border-border-subtle group"
                    >
                      <div className="text-sm font-medium text-text-primary group-hover:text-brand transition-colors">{s.text}</div>
                      <div className="text-[10px] text-text-muted mt-0.5">"{s.example}"</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            messages.map((msg, i) => <ChatMessage key={i} message={msg} />)
          )}
          {sending && (
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-surface-overlay flex items-center justify-center flex-shrink-0">
                <Loader2 className="w-3.5 h-3.5 text-text-muted animate-spin" />
              </div>
              <div className="bg-surface rounded-2xl rounded-tl-md px-4 py-2.5">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="px-4 py-3 border-t border-border-subtle">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Add a product, find trends, ask anything…"
              className="flex-1 px-4 py-2.5 bg-surface rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/40 min-h-[44px]"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="px-3 py-2.5 bg-brand rounded-xl text-white disabled:opacity-40 hover:bg-brand/90 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Floating Chat Button ────────────────────────────────────

export function ChatFAB({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-brand text-white shadow-lg shadow-brand/25 hover:shadow-brand/40 hover:scale-105 transition-all flex items-center justify-center group"
      aria-label="Open chat assistant"
    >
      <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
    </button>
  )
}
