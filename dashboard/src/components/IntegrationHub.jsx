import { useState, useEffect } from 'react'
import {
  ChevronDown, ChevronRight, ExternalLink, Copy, Check,
  Wifi, WifiOff, AlertTriangle, Settings, Play, RefreshCw,
  Mail, Table, HardDrive, Calendar, FileText, Package,
  ShoppingCart, Warehouse, Megaphone, MessageSquare, Bell,
  CheckCircle, Search, TrendingUp, Globe, Folder, File,
  Monitor, Compass, Download, Edit, GitBranch, Star,
  Plug, Zap, Shield, Clock, Cpu, Github
} from 'lucide-react'
import { statusConfig } from '../data/integrationsData'
import { isGitHubConfigured, setGitHubConfig } from '../lib/githubActionsClient'

const iconMap = {
  mail: Mail, table: Table, 'hard-drive': HardDrive, calendar: Calendar,
  'file-text': FileText, package: Package, 'shopping-cart': ShoppingCart,
  warehouse: Warehouse, megaphone: Megaphone, 'message-square': MessageSquare,
  bell: Bell, 'check-circle': CheckCircle, search: Search,
  'trending-up': TrendingUp, globe: Globe, folder: Folder, file: File,
  monitor: Monitor, compass: Compass, download: Download, edit: Edit
}

const serviceIcons = {
  google: (
    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-red-500 to-yellow-500 flex items-center justify-center text-white font-bold text-lg">G</div>
  ),
  amazon: (
    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-yellow-600 flex items-center justify-center text-white font-bold text-lg">A</div>
  ),
  slack: (
    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-white font-bold text-lg">S</div>
  ),
  globe: (
    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
      <Globe className="w-5 h-5 text-white" />
    </div>
  ),
  folder: (
    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center">
      <Folder className="w-5 h-5 text-white" />
    </div>
  ),
  monitor: (
    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
      <Monitor className="w-5 h-5 text-white" />
    </div>
  )
}

function StatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig['needs-setup']
  const StatusIcon = status === 'connected' ? Wifi : status === 'error' ? WifiOff : status === 'ready' ? Zap : Settings
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor} border ${config.borderColor}`}>
      <StatusIcon className="w-3 h-3" />
      {config.label}
    </span>
  )
}

function SetupStep({ step, isLast }) {
  const stepStatusColors = {
    'completed': 'bg-emerald-500 border-emerald-500',
    'action-needed': 'bg-amber-500 border-amber-500 animate-pulse',
    'not-started': 'bg-slate-600 border-slate-500'
  }
  const stepStatusIcons = {
    'completed': <Check className="w-3 h-3 text-white" />,
    'action-needed': <AlertTriangle className="w-3 h-3 text-white" />,
    'not-started': <span className="text-xs text-white font-bold">{step.step}</span>
  }

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${stepStatusColors[step.status]}`}>
          {stepStatusIcons[step.status]}
        </div>
        {!isLast && <div className="w-0.5 h-full bg-slate-700 mt-1" />}
      </div>
      <div className="pb-4">
        <p className={`text-sm font-medium ${step.status === 'completed' ? 'text-emerald-400 line-through' : step.status === 'action-needed' ? 'text-amber-400' : 'text-slate-300'}`}>
          {step.title}
        </p>
        <p className="text-xs text-slate-500 mt-0.5">{step.description}</p>
        {step.link && (
          <a href={step.link} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 mt-1">
            Open <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  )
}

function ConfigBlock({ config }) {
  const [copied, setCopied] = useState(false)
  const jsonStr = JSON.stringify(config, null, 2)

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonStr)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative mt-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-slate-500 font-mono">.vscode/mcp.json</span>
        <button onClick={handleCopy} className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors">
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="bg-slate-900/80 border border-slate-700/50 rounded-lg p-3 text-xs text-slate-300 font-mono overflow-x-auto max-h-48">
        {jsonStr}
      </pre>
    </div>
  )
}

function ServiceToggle({ service }) {
  const Icon = iconMap[service.icon] || Package
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${service.enabled ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-800/50 border-slate-700/50'}`}>
      <Icon className={`w-4 h-4 ${service.enabled ? 'text-emerald-400' : 'text-slate-500'}`} />
      <span className={`text-sm ${service.enabled ? 'text-emerald-300' : 'text-slate-400'}`}>{service.name}</span>
      <div className={`ml-auto w-2 h-2 rounded-full ${service.enabled ? 'bg-emerald-400' : 'bg-slate-600'}`} />
    </div>
  )
}


function IntegrationCard({ integration }) {
  const [expanded, setExpanded] = useState(false)
  const [activeSection, setActiveSection] = useState('setup') // setup | config | capabilities

  const completedSteps = integration.setupSteps.filter(s => s.status === 'completed').length
  const totalSteps = integration.setupSteps.length
  const progressPct = Math.round((completedSteps / totalSteps) * 100)
  const hasActionNeeded = integration.setupSteps.some(s => s.status === 'action-needed')

  return (
    <div className="glass-card overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 p-5 text-left hover:bg-slate-700/20 transition-colors"
      >
        {serviceIcons[integration.icon] || serviceIcons.globe}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-white font-semibold">{integration.name}</h3>
            <StatusBadge status={integration.status} />
            {hasActionNeeded && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse">
                Action Required
              </span>
            )}
          </div>
          <p className="text-sm text-slate-400 mt-0.5 truncate">{integration.description}</p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Progress ring */}
          <div className="relative w-10 h-10">
            <svg className="transform -rotate-90 w-10 h-10">
              <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="3" fill="none" className="text-slate-700" />
              <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="3" fill="none"
                className={progressPct === 100 ? 'text-emerald-500' : 'text-amber-500'}
                strokeDasharray={`${progressPct} ${100 - progressPct}`}
                strokeLinecap="round" strokeDashoffset="0"
                style={{ strokeDasharray: `${progressPct * 1.005} 100` }}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-300">{progressPct}%</span>
          </div>

          {expanded ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-slate-700/50">
          {/* Sub-tabs */}
          <div className="flex gap-1 px-5 pt-3 border-b border-slate-700/30 pb-2">
            {['setup', 'config', 'capabilities'].map(section => (
              <button key={section}
                onClick={() => setActiveSection(section)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${activeSection === section
                  ? 'bg-amazon-orange/20 text-amazon-orange'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
              >
                {section === 'setup' ? 'Setup Guide' : section === 'config' ? 'MCP Config' : 'Capabilities'}
              </button>
            ))}
          </div>

          <div className="p-5">
            {/* Setup Guide */}
            {activeSection === 'setup' && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-300">Setup Progress: {completedSteps}/{totalSteps} steps complete</span>
                </div>
                <div className="space-y-0">
                  {integration.setupSteps.map((step, i) => (
                    <SetupStep key={step.step} step={step} isLast={i === integration.setupSteps.length - 1} />
                  ))}
                </div>

                {/* Service toggles */}
                {integration.services.length > 1 && (
                  <div className="mt-4 pt-4 border-t border-slate-700/50">
                    <p className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wide">Available Services</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {integration.services.map(svc => (
                        <ServiceToggle key={svc.name} service={svc} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* MCP Config */}
            {activeSection === 'config' && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <GitBranch className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-300">MCP Server Configuration</span>
                </div>

                {integration.mcpPackage && (
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs text-slate-500">Package:</span>
                    <code className="text-xs bg-slate-900/80 px-2 py-0.5 rounded text-emerald-400 font-mono">{integration.mcpPackage}</code>
                  </div>
                )}

                {integration.installCommand && (
                  <div className="mb-3">
                    <span className="text-xs text-slate-500">Install:</span>
                    <code className="block mt-1 text-xs bg-slate-900/80 px-3 py-2 rounded text-amber-400 font-mono">{integration.installCommand}</code>
                  </div>
                )}

                {integration.repository && (
                  <a href={integration.repository} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 mb-3">
                    <Star className="w-3 h-3" />
                    {integration.stars ? `${(integration.stars / 1000).toFixed(1)}k stars` : 'Documentation'}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}

                <ConfigBlock config={integration.vscodeMcpConfig} />

                {integration.transport && (
                  <div className="mt-3 flex items-center gap-2">
                    <Plug className="w-3 h-3 text-slate-500" />
                    <span className="text-xs text-slate-500">Transport: <span className="text-slate-300">{integration.transport}</span></span>
                  </div>
                )}
              </div>
            )}

            {/* Capabilities */}
            {activeSection === 'capabilities' && (
              <div>
                <p className="text-xs text-slate-500 mb-3 font-medium uppercase tracking-wide">What this integration enables</p>

                <div className="space-y-2">
                  {integration.capabilities.map((cap, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Zap className="w-3.5 h-3.5 text-amazon-orange mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-slate-300">{cap}</span>
                    </div>
                  ))}
                </div>

                {/* Workflow mapping */}
                {integration.workflowMapping && Object.keys(integration.workflowMapping).length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-700/50">
                    <p className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wide">Workflow → Tool Mapping</p>
                    <div className="space-y-1">
                      {Object.entries(integration.workflowMapping).map(([workflow, tool]) => (
                        <div key={workflow} className="flex items-center gap-2 text-xs">
                          <code className="bg-slate-900/80 px-2 py-0.5 rounded text-slate-300 font-mono">{workflow}</code>
                          <span className="text-slate-600">→</span>
                          <code className="bg-emerald-500/10 px-2 py-0.5 rounded text-emerald-400 font-mono border border-emerald-500/20">{tool}</code>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}


export default function IntegrationHub({ integrations }) {
  const [filter, setFilter] = useState('all')
  const [ghToken, setGhToken] = useState(() => localStorage.getItem('github_pat') || '')
  const [ghOwner, setGhOwner] = useState(() => localStorage.getItem('github_owner') || '')
  const [ghRepo, setGhRepo] = useState(() => localStorage.getItem('github_repo') || '')
  const [ghSaved, setGhSaved] = useState(false)
  const ghConfigured = isGitHubConfigured()

  const handleSaveGitHub = () => {
    setGitHubConfig({ token: ghToken, owner: ghOwner, repo: ghRepo })
    setGhSaved(true)
    setTimeout(() => setGhSaved(false), 2000)
  }

  const connected = integrations.filter(i => i.status === 'connected').length
  const ready = integrations.filter(i => i.status === 'ready').length
  const needsSetup = integrations.filter(i => i.status === 'needs-setup').length

  const filtered = filter === 'all'
    ? integrations
    : integrations.filter(i => i.status === filter)

  return (
    <div className="space-y-6">
      {/* GitHub Actions Agent Config */}
      <div className="glass-card p-4 border border-slate-700/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-purple-500/20">
            <Cpu className="w-5 h-5 text-purple-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              GitHub Actions — AI Agent Engine
              {ghConfigured && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle className="w-2.5 h-2.5" /> Connected
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400">
              Free LLM-powered agents via GitHub Models + Actions. No local server needed.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">GitHub PAT</label>
            <input
              type="password"
              value={ghToken}
              onChange={e => setGhToken(e.target.value)}
              placeholder="ghp_..."
              className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500/50"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Owner</label>
            <input
              type="text"
              value={ghOwner}
              onChange={e => setGhOwner(e.target.value)}
              placeholder="your-username"
              className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500/50"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Repository</label>
            <input
              type="text"
              value={ghRepo}
              onChange={e => setGhRepo(e.target.value)}
              placeholder="amazon-seller-agentic-workflow"
              className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500/50"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 mt-3">
          <button
            onClick={handleSaveGitHub}
            disabled={!ghToken || !ghOwner || !ghRepo}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30 transition-colors disabled:opacity-40"
          >
            {ghSaved ? <><CheckCircle className="w-3 h-3" /> Saved</> : <><Shield className="w-3 h-3" /> Save Config</>}
          </button>
          <span className="text-[10px] text-slate-500">
            PAT needs no special scopes for GitHub Models. Add <code className="text-slate-400">repo</code> + <code className="text-slate-400">workflow</code> scopes to trigger Actions.
          </span>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-800/50 text-xs">
            <Zap className="w-3 h-3 text-amber-400" />
            <span className="text-slate-400">Model:</span>
            <span className="text-white font-medium">gpt-4o-mini (free)</span>
          </div>
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-800/50 text-xs">
            <Play className="w-3 h-3 text-blue-400" />
            <span className="text-slate-400">Execution:</span>
            <span className="text-white font-medium">GitHub Actions</span>
          </div>
        </div>
      </div>
      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-4">
        <button onClick={() => setFilter(filter === 'connected' ? 'all' : 'connected')}
          className={`glass-card p-4 text-center transition-colors ${filter === 'connected' ? 'border-emerald-500/50 bg-emerald-500/10' : ''}`}>
          <div className="text-2xl font-bold text-emerald-400">{connected}</div>
          <div className="text-xs text-slate-400 mt-1">Connected</div>
        </button>
        <button onClick={() => setFilter(filter === 'ready' ? 'all' : 'ready')}
          className={`glass-card p-4 text-center transition-colors ${filter === 'ready' ? 'border-amber-500/50 bg-amber-500/10' : ''}`}>
          <div className="text-2xl font-bold text-amber-400">{ready}</div>
          <div className="text-xs text-slate-400 mt-1">Ready to Connect</div>
        </button>
        <button onClick={() => setFilter(filter === 'needs-setup' ? 'all' : 'needs-setup')}
          className={`glass-card p-4 text-center transition-colors ${filter === 'needs-setup' ? 'border-slate-400/50 bg-slate-500/10' : ''}`}>
          <div className="text-2xl font-bold text-slate-400">{needsSetup}</div>
          <div className="text-xs text-slate-400 mt-1">Needs Setup</div>
        </button>
      </div>

      {/* Integration cards */}
      <div className="space-y-4">
        {filtered.map(integration => (
          <IntegrationCard key={integration.id} integration={integration} />
        ))}
      </div>
    </div>
  )
}
