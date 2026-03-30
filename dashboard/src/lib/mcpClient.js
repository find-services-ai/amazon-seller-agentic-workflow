// Lightweight MCP client for workspace-mcp server (streamable-http transport)

const MCP_BASE_URL = '/mcp'
const PROTOCOL_VERSION = '2024-11-05'

// Detect static hosting (GitHub Pages, Netlify, etc.) where MCP server can't run
export function isStaticHosting() {
  const host = window.location.hostname
  return host.endsWith('.github.io') ||
    host.endsWith('.netlify.app') ||
    host.endsWith('.vercel.app') ||
    host.endsWith('.pages.dev')
}

let sessionId = null

async function mcpRequest(method, params = {}, id = Date.now()) {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json, text/event-stream'
  }
  if (sessionId) {
    headers['Mcp-Session-Id'] = sessionId
  }

  const res = await fetch(MCP_BASE_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      jsonrpc: '2.0',
      id,
      method,
      params
    })
  })

  // Capture session ID from headers
  const sid = res.headers.get('mcp-session-id')
  if (sid) sessionId = sid

  const text = await res.text()

  // Parse SSE response
  for (const line of text.split('\n')) {
    if (line.startsWith('data: ')) {
      try {
        return JSON.parse(line.slice(6))
      } catch {
        // skip malformed lines
      }
    }
  }

  // Fallback: try parsing as plain JSON
  try {
    return JSON.parse(text)
  } catch {
    throw new Error('Failed to parse MCP response')
  }
}

export async function initSession() {
  const res = await mcpRequest('initialize', {
    protocolVersion: PROTOCOL_VERSION,
    capabilities: {},
    clientInfo: { name: 'dashboard', version: '2.0' }
  })
  return res?.result?.serverInfo
}

export async function listTools() {
  const res = await mcpRequest('tools/list')
  return res?.result?.tools || []
}

export async function callTool(name, args) {
  const res = await mcpRequest('tools/call', { name, arguments: args })
  if (res?.result?.isError) {
    const errMsg = res.result.content?.[0]?.text || 'Unknown MCP error'
    throw new Error(errMsg)
  }
  return res?.result?.content?.[0]?.text || ''
}

export async function sendEmail({ to, subject, body, userEmail }) {
  return callTool('send_gmail_message', {
    to,
    subject,
    body,
    user_google_email: userEmail
  })
}

export async function searchEmails({ query, userEmail, maxResults = 10 }) {
  return callTool('search_gmail_messages', {
    query,
    user_google_email: userEmail,
    max_results: maxResults
  })
}

export async function updateSheet({ spreadsheetId, range, values, userEmail }) {
  return callTool('modify_sheet_values', {
    spreadsheet_id: spreadsheetId,
    range_name: range,
    values,
    user_google_email: userEmail
  })
}

export async function checkServerHealth() {
  if (isStaticHosting()) {
    return { connected: false, error: 'Static hosting detected — MCP server unavailable', staticHost: true }
  }
  try {
    const info = await initSession()
    return { connected: true, serverInfo: info }
  } catch (e) {
    return { connected: false, error: e.message }
  }
}
