import { useState, useEffect, useCallback } from 'react'
import {
  Table, RefreshCw, ExternalLink, Loader2, CheckCircle,
  XCircle, AlertTriangle, Clock, Wifi, WifiOff, Trash2,
  Download, Filter, ChevronDown, ChevronUp, Eye, Search,
  FileSpreadsheet, Plus
} from 'lucide-react'
import { checkServerHealth, initSession, readSheet, updateSheet, createSpreadsheet } from '../lib/mcpClient'
import { validationPhases } from '../data/departmentData'

const USER_EMAIL = 'celestialcuriosseller@gmail.com'
const RESEARCH_SHEET_KEY = 'research_log_spreadsheet_id'

// Column definitions for the research log sheet
const SHEET_HEADERS = [
  'Date', 'Product', 'Department', 'Budget', 'Min Margin',
  'Demand Score', 'Demand Confidence',
  'Competition Score', 'Competition Confidence',
  'Pricing Score', 'Pricing Confidence',
  'Supply Chain Score', 'Supply Chain Confidence',
  'Risk Score', 'Risk Confidence',
  'Total Score', 'Avg Confidence', 'Verdict', 'Notes'
]

function getVerdictStyle(verdict) {
  if (verdict === 'PASS') return { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' }
  if (verdict === 'FAIL') return { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' }
  return { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' }
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
          <span className="text-xs text-emerald-400 font-medium">Sheets Connected</span>
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

function ResearchRow({ row, index, isExpanded, onToggle }) {
  const [date, product, department, budget, minMargin,
    demandScore, demandConf, compScore, compConf,
    pricingScore, pricingConf, scScore, scConf,
    riskScore, riskConf, totalScore, avgConf, verdict, notes
  ] = row

  const vs = getVerdictStyle(verdict)

  return (
    <>
      <tr
        className={`border-b border-slate-700/30 hover:bg-slate-800/50 cursor-pointer transition-colors ${
          isExpanded ? 'bg-slate-800/30' : ''
        }`}
        onClick={onToggle}
      >
        <td className="px-3 py-2.5 text-xs text-slate-400">{date}</td>
        <td className="px-3 py-2.5 text-xs text-white font-medium">{product}</td>
        <td className="px-3 py-2.5 text-xs text-slate-300">{department}</td>
        <td className="px-3 py-2.5 text-xs text-slate-300 text-center">{totalScore}/50</td>
        <td className="px-3 py-2.5 text-xs text-slate-300 text-center">{avgConf}%</td>
        <td className="px-3 py-2.5 text-center">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${vs.bg} ${vs.text} border ${vs.border}`}>
            {verdict === 'PASS' && <CheckCircle className="w-2.5 h-2.5" />}
            {verdict === 'FAIL' && <XCircle className="w-2.5 h-2.5" />}
            {verdict === 'REVIEW' && <AlertTriangle className="w-2.5 h-2.5" />}
            {verdict}
          </span>
        </td>
        <td className="px-3 py-2.5 text-center">
          {isExpanded ? <ChevronUp className="w-3 h-3 text-slate-400 inline" /> : <ChevronDown className="w-3 h-3 text-slate-400 inline" />}
        </td>
      </tr>
      {isExpanded && (
        <tr className="border-b border-slate-700/30 bg-slate-800/20">
          <td colSpan={7} className="px-4 py-3">
            <div className="grid grid-cols-5 gap-3">
              {validationPhases.map((phase, pi) => {
                const score = row[5 + pi * 2]
                const conf = row[6 + pi * 2]
                const passed = parseInt(score) >= phase.minScore
                return (
                  <div key={phase.id} className={`p-2 rounded-lg border ${passed ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-red-500/20 bg-red-500/5'}`}>
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-xs">{phase.icon}</span>
                      <span className="text-[10px] text-slate-400">{phase.name}</span>
                    </div>
                    <p className={`text-sm font-bold ${passed ? 'text-emerald-400' : 'text-red-400'}`}>{score}/10</p>
                    <p className="text-[10px] text-slate-500">{conf}% conf</p>
                  </div>
                )
              })}
            </div>
            <div className="mt-2 flex items-center gap-4 text-xs text-slate-400">
              <span>Budget: <span className="text-white">${budget}</span></span>
              <span>Min Margin: <span className="text-white">{minMargin}%</span></span>
              {notes && <span>Notes: <span className="text-slate-300">{notes}</span></span>}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

export default function ResearchLog({ onStageComplete }) {
  const [serverStatus, setServerStatus] = useState('disconnected')
  const [spreadsheetId, setSpreadsheetId] = useState(() => localStorage.getItem(RESEARCH_SHEET_KEY) || '')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [expandedRow, setExpandedRow] = useState(null)
  const [filterVerdict, setFilterVerdict] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [creating, setCreating] = useState(false)

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

  // Load data from sheet
  const loadFromSheet = useCallback(async () => {
    if (!spreadsheetId || serverStatus !== 'connected') return
    setLoading(true)
    setError(null)
    try {
      const result = await readSheet({
        spreadsheetId,
        range: 'Research Log!A2:S100',
        userEmail: USER_EMAIL
      })
      // Parse the result — workspace-mcp returns text description
      // Try to extract rows from the response
      try {
        // The response may contain a JSON-like grid or a text summary
        // Look for array patterns
        const match = result.match(/\[\[.*\]\]/s)
        if (match) {
          const parsed = JSON.parse(match[0])
          setRows(parsed)
        } else if (result.includes('empty') || result.includes('no data') || result.includes('No values')) {
          setRows([])
        } else {
          // Try to parse as grid from text
          const lines = result.split('\n').filter(l => l.trim() && !l.includes('Range:') && !l.includes('range'))
          if (lines.length > 0) {
            // Check if it's a formatted table
            const parsed = lines
              .map(line => line.split('\t').map(c => c.trim()).filter(Boolean))
              .filter(r => r.length >= 5)
            if (parsed.length > 0) setRows(parsed)
            else setRows([])
          } else {
            setRows([])
          }
        }
      } catch {
        setRows([])
      }
    } catch (err) {
      if (err.message?.includes('Unable to read')) {
        setRows([])
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }, [spreadsheetId, serverStatus])

  useEffect(() => {
    if (serverStatus === 'connected' && spreadsheetId) {
      loadFromSheet()
    }
  }, [serverStatus, spreadsheetId, loadFromSheet])

  // Create research log spreadsheet
  const createResearchSheet = async () => {
    if (serverStatus !== 'connected') return
    setCreating(true)
    setError(null)
    try {
      const result = await createSpreadsheet({
        title: 'Amazon Seller - Research Log',
        userEmail: USER_EMAIL
      })
      // Extract spreadsheet ID from response
      const idMatch = result.match(/ID:\s*([a-zA-Z0-9_-]+)/)
      if (idMatch) {
        const newId = idMatch[1]
        setSpreadsheetId(newId)
        localStorage.setItem(RESEARCH_SHEET_KEY, newId)

        // Write headers
        await updateSheet({
          spreadsheetId: newId,
          range: 'Sheet1!A1:S1',
          values: [SHEET_HEADERS],
          userEmail: USER_EMAIL
        })

        // Rename sheet by writing headers — the sheet name defaults to Sheet1
        // Add existing product validation as first row
        const existingRow = [
          '2026-03-29', 'Self-Cleaning Pet Slicker Brush', 'Pet Supplies',
          '500', '35',
          '8', '85', '6', '75', '9', '90', '8', '85', '7', '80',
          '38', '83', 'PASS', 'Validated winner — 54% expected margin'
        ]
        await updateSheet({
          spreadsheetId: newId,
          range: 'Sheet1!A2:S2',
          values: [existingRow],
          userEmail: USER_EMAIL
        })

        setRows([existingRow])
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setCreating(false)
    }
  }

  // Stage a new research result to the sheet
  const stageResearch = async (researchData) => {
    if (!spreadsheetId || serverStatus !== 'connected') return false
    try {
      const nextRow = rows.length + 2 // +1 for header, +1 for 1-indexed
      const row = [
        new Date().toISOString().split('T')[0],
        researchData.productName,
        researchData.department || 'All',
        researchData.budget,
        researchData.targetMargin,
        ...(validationPhases.flatMap(phase => {
          const r = researchData.phaseResults[phase.id]
          return [String(r?.score || 0), String(r?.confidence || 0)]
        })),
        String(researchData.totalScore),
        String(researchData.avgConfidence),
        researchData.verdict,
        researchData.notes || ''
      ]

      await updateSheet({
        spreadsheetId,
        range: `Sheet1!A${nextRow}:S${nextRow}`,
        values: [row],
        userEmail: USER_EMAIL
      })

      setRows(prev => [...prev, row])
      if (onStageComplete) onStageComplete()
      return true
    } catch (err) {
      setError(err.message)
      return false
    }
  }

  // Expose stageResearch via ref pattern — store on window for sibling access
  useEffect(() => {
    window.__researchLogStage = stageResearch
    return () => { delete window.__researchLogStage }
  })

  // Filtered rows
  const filteredRows = rows.filter(r => {
    const matchesVerdict = filterVerdict === 'all' || r[17] === filterVerdict
    const matchesSearch = !searchQuery ||
      r[1]?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r[2]?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesVerdict && matchesSearch
  })

  const passCount = rows.filter(r => r[17] === 'PASS').length
  const failCount = rows.filter(r => r[17] === 'FAIL').length
  const reviewCount = rows.filter(r => r[17] === 'REVIEW').length

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <FileSpreadsheet className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Research Log</h3>
              <p className="text-xs text-slate-400">
                {rows.length} research entries staged to Google Sheets
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ServerStatus status={serverStatus} onReconnect={connectToServer} />

            {spreadsheetId && (
              <>
                <button
                  onClick={loadFromSheet}
                  disabled={loading || serverStatus !== 'connected'}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-700/50 text-slate-300 hover:bg-slate-700 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <a
                  href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 transition-colors"
                >
                  Open Sheet <ExternalLink className="w-3 h-3" />
                </a>
              </>
            )}
          </div>
        </div>
      </div>

      {/* No spreadsheet yet — create one */}
      {!spreadsheetId && (
        <div className="glass-card p-6 text-center">
          <FileSpreadsheet className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <h4 className="text-sm font-semibold text-white mb-1">No Research Log Sheet</h4>
          <p className="text-xs text-slate-400 mb-4 max-w-md mx-auto">
            Create a Google Sheets research log to stage all product validation results for investor review.
            Each research run will be automatically logged with scores, confidence levels, and verdicts.
          </p>
          <button
            onClick={createResearchSheet}
            disabled={creating || serverStatus !== 'connected'}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-amazon-orange/20 text-amazon-orange border border-amazon-orange/30 hover:bg-amazon-orange/30 transition-colors disabled:opacity-50"
          >
            {creating ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</>
            ) : (
              <><Plus className="w-4 h-4" /> Create Research Log Sheet</>
            )}
          </button>
          {serverStatus !== 'connected' && (
            <p className="text-xs text-red-400 mt-2">MCP server must be running to create sheet.</p>
          )}
        </div>
      )}

      {/* Stats */}
      {spreadsheetId && rows.length > 0 && (
        <div className="glass-card p-4">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-white">{rows.length}</p>
              <p className="text-xs text-slate-400">Total Researched</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-400">{passCount}</p>
              <p className="text-xs text-slate-400">Validated</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-400">{reviewCount}</p>
              <p className="text-xs text-slate-400">Needs Review</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-400">{failCount}</p>
              <p className="text-xs text-slate-400">Rejected</p>
            </div>
          </div>
        </div>
      )}

      {/* Filter + Search */}
      {spreadsheetId && rows.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search product or department..."
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white text-sm focus:border-amazon-orange focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 border border-slate-600">
            <Filter className="w-3 h-3 text-slate-400" />
            <select
              value={filterVerdict}
              onChange={e => setFilterVerdict(e.target.value)}
              className="bg-transparent text-sm text-white focus:outline-none"
            >
              <option value="all">All Verdicts</option>
              <option value="PASS">Passed Only</option>
              <option value="REVIEW">Needs Review</option>
              <option value="FAIL">Failed Only</option>
            </select>
          </div>
        </div>
      )}

      {/* Table */}
      {spreadsheetId && (
        <div className="glass-card overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <Loader2 className="w-6 h-6 text-blue-400 animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-400">Loading research log from Sheets...</p>
            </div>
          ) : filteredRows.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700/50 bg-slate-800/50">
                    <th className="px-3 py-2.5 text-left text-[10px] text-slate-500 uppercase tracking-wider font-medium">Date</th>
                    <th className="px-3 py-2.5 text-left text-[10px] text-slate-500 uppercase tracking-wider font-medium">Product</th>
                    <th className="px-3 py-2.5 text-left text-[10px] text-slate-500 uppercase tracking-wider font-medium">Department</th>
                    <th className="px-3 py-2.5 text-center text-[10px] text-slate-500 uppercase tracking-wider font-medium">Score</th>
                    <th className="px-3 py-2.5 text-center text-[10px] text-slate-500 uppercase tracking-wider font-medium">Confidence</th>
                    <th className="px-3 py-2.5 text-center text-[10px] text-slate-500 uppercase tracking-wider font-medium">Verdict</th>
                    <th className="px-3 py-2.5 w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row, idx) => (
                    <ResearchRow
                      key={idx}
                      row={row}
                      index={idx}
                      isExpanded={expandedRow === idx}
                      onToggle={() => setExpandedRow(expandedRow === idx ? null : idx)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          ) : rows.length > 0 ? (
            <div className="p-8 text-center">
              <Search className="w-6 h-6 text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-400">No entries match your filters.</p>
            </div>
          ) : (
            <div className="p-8 text-center">
              <Table className="w-6 h-6 text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-400">No research entries yet. Run a product validation to stage results here.</p>
            </div>
          )}
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="flex items-start gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-red-300">
            <span className="font-semibold">Error:</span> {error}
          </div>
        </div>
      )}
    </div>
  )
}
