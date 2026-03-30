import { useState, useEffect, useCallback } from 'react'
import {
  Mail, Send, CheckCircle, XCircle, Clock, AlertTriangle,
  Eye, ChevronDown, ChevronUp, Wifi, WifiOff, RefreshCw,
  Loader2, ExternalLink, Copy, Check, Star, Shield,
  Edit3, Zap
} from 'lucide-react'
import { checkServerHealth, initSession, sendEmail } from '../lib/mcpClient'

const USER_EMAIL = 'celestialcuriosseller@gmail.com'
const SPREADSHEET_ID = '11JNYh_AT_X-lzzbXf5u_37675yNBqykcd0r3HcPj9Q0'

// Verified suppliers from Made-in-China research
const suppliers = [
  {
    id: 1,
    name: 'Nexus International Trading (Shanghai)',
    platform: 'Made-in-China',
    storeUrl: 'https://sh-nexus.en.made-in-china.com',
    product: 'Self-Cleaning Skin Friendly Steamy Pet Slicker Brush',
    priceRange: '$1.80 - $2.02',
    moq: 48,
    rating: 4.0,
    ratingLabel: 'Fast Delivery',
    audited: false,
    securedTrading: false,
    notes: 'PRIORITY - Lowest MOQ',
    priority: 1
  },
  {
    id: 2,
    name: 'Yangzhou Xiaoyi Intelligent Technology',
    platform: 'Made-in-China',
    storeUrl: 'https://xiaoyi-pet.en.made-in-china.com',
    product: 'Self Cleaning Slicker Brush for Dogs Cats',
    priceRange: '$1.09 - $1.90',
    moq: 100,
    rating: 5.0,
    ratingLabel: 'Amazing Service',
    audited: true,
    securedTrading: false,
    notes: 'Best price-quality ratio',
    priority: 2
  },
  {
    id: 3,
    name: 'Wenzhou Aoding Industry',
    platform: 'Made-in-China',
    storeUrl: 'https://aoding.en.made-in-china.com',
    product: 'Best Plastic Self Cleaning Pet Dog Cat Grooming Slicker Brush',
    priceRange: '$0.30 - $0.70',
    moq: 100,
    rating: 4.2,
    ratingLabel: 'Fast Delivery',
    audited: true,
    securedTrading: false,
    notes: 'Cheapest - verify quality',
    priority: 3
  },
  {
    id: 4,
    name: 'Rizhao Spring Trading',
    platform: 'Made-in-China',
    storeUrl: 'https://rzcsmy.en.made-in-china.com',
    product: 'Wholesale Self-Cleaning Pet Slicker Brush Large-Size',
    priceRange: '$0.66 - $0.97',
    moq: 100,
    rating: 5.0,
    ratingLabel: 'Good Quality',
    audited: true,
    securedTrading: true,
    notes: 'Good trust signals',
    priority: 4
  },
  {
    id: 5,
    name: 'Suzhou Becpet E-commerce',
    platform: 'Made-in-China',
    storeUrl: 'https://becpet.en.made-in-china.com',
    product: 'Pet Groomer Hair Removal Self Cleaning Slicker Brush',
    priceRange: '$2.08 - $2.20',
    moq: 100,
    rating: 5.0,
    ratingLabel: 'Perfect Service',
    audited: true,
    securedTrading: true,
    notes: 'Highest service rating',
    priority: 5
  }
]

function generateEmailBody(supplier) {
  return `Hi ${supplier.name} Team,

I'm sourcing Self-Cleaning Pet Slicker Brushes for sale on Amazon US and found your listing on Made-in-China.com.

I'm interested in:
1. Product: ${supplier.product}
2. Quantity: Starting with ${Math.max(supplier.moq, 100)} units, scaling to 500-1000 monthly if successful
3. Fulfillment: Bulk shipping to US warehouse (Amazon FBA)

Could you please provide:
- Unit pricing at MOQ, 200, 500, and 1000 units
- MOQ and any flexibility for a first test order
- Lead time from order to ship
- Shipping cost to US (air and sea options)
- Sample availability and cost (1-3 samples)
- Payment terms (Trade Assurance preferred)

I value long-term supplier relationships and prioritize quality and reliability over lowest price alone. We are looking to establish a consistent monthly reorder with the right partner.

Looking forward to your response.

Best regards,
Celestial Curios
Amazon US Seller
celestialcuriosseller@gmail.com`
}

function generateEmailSubject(supplier) {
  return `Wholesale Inquiry - Self-Cleaning Pet Slicker Brush - Amazon US Seller`
}

// Compose the store contact email (suppliers on Made-in-China don't have direct emails,
// so we use the store inquiry — for this demo we send to ourselves for validation)
function getSupplierContactEmail() {
  // In production, this would be the supplier's contact email from their store page.
  // For testing, we send to ourselves to verify the pipeline works.
  return USER_EMAIL
}

function RatingStars({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`w-3 h-3 ${i <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`}
        />
      ))}
      <span className="text-xs text-slate-400 ml-1">{rating}</span>
    </div>
  )
}

function ServerStatus({ status, onReconnect }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${
      status === 'connected'
        ? 'bg-emerald-500/20 border-emerald-500/30'
        : status === 'connecting'
          ? 'bg-blue-500/20 border-blue-500/30'
          : 'bg-red-500/20 border-red-500/30'
    }`}>
      {status === 'connected' && (
        <>
          <Wifi className="w-3 h-3 text-emerald-400" />
          <span className="text-xs text-emerald-400 font-medium">MCP Connected</span>
        </>
      )}
      {status === 'connecting' && (
        <>
          <Loader2 className="w-3 h-3 text-blue-400 animate-spin" />
          <span className="text-xs text-blue-400 font-medium">Connecting...</span>
        </>
      )}
      {status === 'disconnected' && (
        <>
          <WifiOff className="w-3 h-3 text-red-400" />
          <span className="text-xs text-red-400 font-medium">Disconnected</span>
          <button onClick={onReconnect} className="ml-1 p-0.5 rounded hover:bg-red-500/20">
            <RefreshCw className="w-3 h-3 text-red-400" />
          </button>
        </>
      )}
    </div>
  )
}

function SupplierCard({ supplier, emailStatus, onPreview, onSend, isExpanded, onToggle, isSending }) {
  const status = emailStatus || 'pending'
  const statusConfig = {
    pending: { icon: Clock, color: 'text-slate-400', label: 'Not Sent', bg: 'bg-slate-500/20' },
    sending: { icon: Loader2, color: 'text-blue-400', label: 'Sending...', bg: 'bg-blue-500/20' },
    sent: { icon: CheckCircle, color: 'text-emerald-400', label: 'Sent', bg: 'bg-emerald-500/20' },
    failed: { icon: XCircle, color: 'text-red-400', label: 'Failed', bg: 'bg-red-500/20' }
  }
  const sc = statusConfig[status]
  const StatusIcon = sc.icon

  return (
    <div className={`glass-card overflow-hidden border ${
      status === 'sent' ? 'border-emerald-500/30' : 'border-slate-700/50'
    }`}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Priority badge */}
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
            supplier.priority === 1 ? 'bg-amazon-orange/20 text-amazon-orange' : 'bg-slate-700 text-slate-400'
          }`}>
            #{supplier.priority}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h4 className="text-sm font-semibold text-white truncate">{supplier.name}</h4>
              {supplier.audited && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400">
                  <Shield className="w-2.5 h-2.5" /> Audited
                </span>
              )}
              {supplier.securedTrading && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-400">
                  <Shield className="w-2.5 h-2.5" /> Secured
                </span>
              )}
            </div>

            <p className="text-xs text-slate-400 mb-2 truncate">{supplier.product}</p>

            <div className="flex items-center gap-4 text-xs mb-2 flex-wrap">
              <span className="text-white font-medium">{supplier.priceRange}</span>
              <span className="text-slate-500">MOQ: <span className="text-slate-300">{supplier.moq}</span></span>
              <RatingStars rating={supplier.rating} />
              <span className="text-slate-500">{supplier.ratingLabel}</span>
            </div>

            {supplier.notes && (
              <p className="text-xs text-amber-400/80 italic">{supplier.notes}</p>
            )}
          </div>

          {/* Status + Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${sc.bg} ${sc.color}`}>
              <StatusIcon className={`w-3 h-3 ${status === 'sending' ? 'animate-spin' : ''}`} />
              {sc.label}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-700/50">
          <button
            onClick={onToggle}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-700/50 text-slate-300 hover:bg-slate-700 transition-colors"
          >
            <Eye className="w-3 h-3" />
            {isExpanded ? 'Hide' : 'Preview'} Email
            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {status === 'pending' && (
            <button
              onClick={() => onSend(supplier)}
              disabled={isSending}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium bg-amazon-orange/20 text-amazon-orange border border-amazon-orange/30 hover:bg-amazon-orange/30 transition-colors disabled:opacity-50"
            >
              <Send className="w-3 h-3" />
              Send Email
            </button>
          )}

          {status === 'failed' && (
            <button
              onClick={() => onSend(supplier)}
              disabled={isSending}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors disabled:opacity-50"
            >
              <RefreshCw className="w-3 h-3" />
              Retry
            </button>
          )}

          {status === 'sent' && (
            <span className="text-xs text-emerald-400 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Delivered
            </span>
          )}

          <a
            href={supplier.storeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white transition-colors"
          >
            Store <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Email Preview */}
      {isExpanded && (
        <div className="border-t border-slate-700/50 p-4 bg-slate-800/30">
          <div className="space-y-2 mb-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 w-12">To:</span>
              <span className="text-slate-300">{getSupplierContactEmail()}</span>
              <span className="text-slate-600 italic">(test mode — sends to your inbox)</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 w-12">Subject:</span>
              <span className="text-white font-medium">{generateEmailSubject(supplier)}</span>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-700/50">
            <pre className="text-xs text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
              {generateEmailBody(supplier)}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}

export default function SupplierOutreach() {
  const [serverStatus, setServerStatus] = useState('disconnected')
  const [emailStatuses, setEmailStatuses] = useState({})
  const [expandedSupplier, setExpandedSupplier] = useState(null)
  const [sendingId, setSendingId] = useState(null)
  const [sendLog, setSendLog] = useState([])
  const [bulkSending, setBulkSending] = useState(false)

  const connectToServer = useCallback(async () => {
    setServerStatus('connecting')
    try {
      const health = await checkServerHealth()
      setServerStatus(health.connected ? 'connected' : 'disconnected')
    } catch {
      setServerStatus('disconnected')
    }
  }, [])

  useEffect(() => {
    connectToServer()
  }, [connectToServer])

  const handleSendEmail = async (supplier) => {
    if (serverStatus !== 'connected') {
      alert('MCP server not connected. Start the server first:\nuvx workspace-mcp --single-user --tools gmail sheets --transport streamable-http')
      return
    }

    setSendingId(supplier.id)
    setEmailStatuses(prev => ({ ...prev, [supplier.id]: 'sending' }))

    try {
      const result = await sendEmail({
        to: getSupplierContactEmail(),
        subject: generateEmailSubject(supplier),
        body: generateEmailBody(supplier),
        userEmail: USER_EMAIL
      })

      setEmailStatuses(prev => ({ ...prev, [supplier.id]: 'sent' }))
      setSendLog(prev => [...prev, {
        supplierId: supplier.id,
        supplierName: supplier.name,
        timestamp: new Date().toISOString(),
        status: 'sent',
        result
      }])
    } catch (err) {
      setEmailStatuses(prev => ({ ...prev, [supplier.id]: 'failed' }))
      setSendLog(prev => [...prev, {
        supplierId: supplier.id,
        supplierName: supplier.name,
        timestamp: new Date().toISOString(),
        status: 'failed',
        error: err.message
      }])
    } finally {
      setSendingId(null)
    }
  }

  const handleSendAll = async () => {
    if (serverStatus !== 'connected') {
      alert('MCP server not connected. Start the server first.')
      return
    }

    setBulkSending(true)
    for (const supplier of suppliers) {
      if (emailStatuses[supplier.id] !== 'sent') {
        await handleSendEmail(supplier)
        // Small delay between emails
        await new Promise(r => setTimeout(r, 1500))
      }
    }
    setBulkSending(false)
  }

  const sentCount = Object.values(emailStatuses).filter(s => s === 'sent').length
  const failedCount = Object.values(emailStatuses).filter(s => s === 'failed').length

  return (
    <div className="space-y-6">
      {/* Header with server status */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amazon-orange/20">
              <Mail className="w-5 h-5 text-amazon-orange" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Supplier Email Outreach</h3>
              <p className="text-xs text-slate-400">
                {suppliers.length} verified suppliers &middot; {sentCount} emails sent
                {failedCount > 0 && <span className="text-red-400"> &middot; {failedCount} failed</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ServerStatus status={serverStatus} onReconnect={connectToServer} />

            <button
              onClick={handleSendAll}
              disabled={bulkSending || serverStatus !== 'connected' || sentCount === suppliers.length}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                sentCount === suppliers.length
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default'
                  : 'bg-amazon-orange/20 text-amazon-orange border border-amazon-orange/30 hover:bg-amazon-orange/30 disabled:opacity-50'
              }`}
            >
              {bulkSending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : sentCount === suppliers.length ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  All Sent
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Send All ({suppliers.length - sentCount} remaining)
                </>
              )}
            </button>
          </div>
        </div>

        {/* Progress bar */}
        {sentCount > 0 && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Outreach Progress</span>
              <span>{sentCount} / {suppliers.length}</span>
            </div>
            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${(sentCount / suppliers.length) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Test mode notice */}
      <div className="flex items-start gap-2 px-4 py-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
        <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-amber-300">
          <span className="font-semibold">Test Mode:</span> Emails are sent to your own inbox ({USER_EMAIL}) for verification.
          In production, emails will be sent to each supplier's contact address from their store page.
        </div>
      </div>

      {/* Supplier list */}
      <div className="space-y-3">
        {suppliers.map(supplier => (
          <SupplierCard
            key={supplier.id}
            supplier={supplier}
            emailStatus={emailStatuses[supplier.id]}
            onSend={handleSendEmail}
            isExpanded={expandedSupplier === supplier.id}
            onToggle={() => setExpandedSupplier(expandedSupplier === supplier.id ? null : supplier.id)}
            isSending={sendingId === supplier.id}
          />
        ))}
      </div>

      {/* Send log */}
      {sendLog.length > 0 && (
        <div className="glass-card p-4">
          <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            Send Log
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {sendLog.map((log, idx) => (
              <div key={idx} className="flex items-center gap-3 text-xs py-1.5 border-b border-slate-700/30 last:border-0">
                {log.status === 'sent' ? (
                  <CheckCircle className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                ) : (
                  <XCircle className="w-3 h-3 text-red-400 flex-shrink-0" />
                )}
                <span className="text-slate-300 flex-1 truncate">{log.supplierName}</span>
                <span className="text-slate-500">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                {log.status === 'sent' && log.result && (
                  <span className="text-emerald-400 truncate max-w-[200px]">{log.result}</span>
                )}
                {log.status === 'failed' && (
                  <span className="text-red-400 truncate max-w-[200px]">{log.error}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Spreadsheet link */}
      <div className="glass-card p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/20">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm text-white font-medium">Supplier Tracker Spreadsheet</p>
            <p className="text-xs text-slate-400">All supplier data synced to Google Sheets</p>
          </div>
        </div>
        <a
          href={`https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 transition-colors"
        >
          Open Sheet <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  )
}
