// GitHub Actions client — trigger agent workflows and poll for results

const GITHUB_API = 'https://api.github.com'

function getConfig() {
  // Config stored in localStorage by Integrations tab
  return {
    token: localStorage.getItem('github_pat') || '',
    owner: localStorage.getItem('github_owner') || '',
    repo: localStorage.getItem('github_repo') || ''
  }
}

export function isGitHubConfigured() {
  const { token, owner, repo } = getConfig()
  return !!(token && owner && repo)
}

export function setGitHubConfig({ token, owner, repo }) {
  if (token) localStorage.setItem('github_pat', token)
  if (owner) localStorage.setItem('github_owner', owner)
  if (repo) localStorage.setItem('github_repo', repo)
}

async function ghFetch(path, options = {}) {
  const { token, owner, repo } = getConfig()
  const url = path.startsWith('http') ? path : `${GITHUB_API}/repos/${owner}/${repo}${path}`

  const res = await fetch(url, {
    ...options,
    headers: {
      'Accept': 'application/vnd.github+json',
      'Authorization': `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...options.headers
    }
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || `GitHub API ${res.status}`)
  }

  if (res.status === 204) return null
  return res.json()
}

// ─── Trigger Workflows ───────────────────────────────────────

export async function triggerValidation({ product, department, budget, targetMargin, phases }) {
  await ghFetch('/actions/workflows/agent-validate-product.yml/dispatches', {
    method: 'POST',
    body: JSON.stringify({
      ref: 'main',
      inputs: {
        product,
        department: department || 'General',
        budget: String(budget || 500),
        target_margin: String(targetMargin || 35),
        phases: phases || 'all'
      }
    })
  })

  // workflow_dispatch returns 204 — we need to poll for the run
  await new Promise(r => setTimeout(r, 2000))
  return findLatestRun('agent-validate-product.yml')
}

export async function triggerOperation({ operation, product, context }) {
  await ghFetch('/actions/workflows/agent-supplier-ops.yml/dispatches', {
    method: 'POST',
    body: JSON.stringify({
      ref: 'main',
      inputs: {
        operation,
        product,
        context_json: JSON.stringify(context || {})
      }
    })
  })

  await new Promise(r => setTimeout(r, 2000))
  return findLatestRun('agent-supplier-ops.yml')
}

// ─── Poll for Results ────────────────────────────────────────

async function findLatestRun(workflowFile) {
  const data = await ghFetch(`/actions/workflows/${workflowFile}/runs?per_page=1&status=queued,in_progress,completed`)
  return data.workflow_runs?.[0] || null
}

export async function getRunStatus(runId) {
  return ghFetch(`/actions/runs/${runId}`)
}

export async function pollRunUntilDone(runId, onProgress, timeoutMs = 300000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    const run = await getRunStatus(runId)
    if (onProgress) onProgress(run)

    if (run.status === 'completed') {
      return run
    }

    await new Promise(r => setTimeout(r, 5000))
  }
  throw new Error('Workflow timed out')
}

export async function getRunArtifacts(runId) {
  const data = await ghFetch(`/actions/runs/${runId}/artifacts`)
  return data.artifacts || []
}

export async function downloadArtifact(artifactId) {
  const { token, owner, repo } = getConfig()
  const res = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/actions/artifacts/${artifactId}/zip`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json'
      }
    }
  )

  if (!res.ok) throw new Error(`Failed to download artifact: ${res.status}`)

  // GitHub returns a zip — we need to extract the JSON
  const blob = await res.blob()
  const { BlobReader, ZipReader, TextWriter } = await import('https://cdn.jsdelivr.net/npm/@nicolo-ribaudo/zipjs.min@4.0.7/+esm')
  const reader = new ZipReader(new BlobReader(blob))
  const entries = await reader.getEntries()
  const jsonEntry = entries.find(e => e.filename.endsWith('.json'))
  if (!jsonEntry) throw new Error('No JSON file in artifact')
  const text = await jsonEntry.getData(new TextWriter())
  await reader.close()
  return JSON.parse(text)
}

// ─── List Recent Runs ────────────────────────────────────────

export async function listRecentRuns(workflowFile, count = 10) {
  const data = await ghFetch(`/actions/workflows/${workflowFile}/runs?per_page=${count}`)
  return data.workflow_runs || []
}

export async function listAllAgentRuns(count = 20) {
  const data = await ghFetch(`/actions/runs?per_page=${count}`)
  return (data.workflow_runs || []).filter(r =>
    r.name?.startsWith('Agent')
  )
}
