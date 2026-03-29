# MCP Integration Framework

Lean, scalable MCP server integration for autonomous Amazon seller operations.

## Architecture

```
.mcp/
├── credentials/          # API keys and OAuth tokens (gitignored)
├── config/              # Server-specific configurations
└── scripts/             # Setup and utility scripts

.vscode/mcp.json         # VS Code MCP server definitions
```

## Available Integrations

| Server | Purpose | Status | Priority |
|---|---|---|---|
| **gmail** | Supplier emails, negotiations | 🔴 Setup needed | P0 |
| **google-sheets** | Quote tracking, KPI dashboards | 🔴 Setup needed | P1 |
| **filesystem** | Deal files, templates | 🟢 Active | - |
| **fetch** | Web scraping, research | 🟢 Active | - |
| **slack** | Notifications, alerts | ⚪ Optional | P2 |
| **postgres** | Data persistence | ⚪ Optional | P3 |

## Quick Setup

### 1. Gmail (Supplier Outreach)

```bash
# Create credentials folder
mkdir -p .mcp/credentials

# Get Gmail API credentials from Google Cloud Console
# 1. Go to console.cloud.google.com
# 2. Create project or select existing
# 3. Enable Gmail API
# 4. Create OAuth 2.0 credentials (Desktop app)
# 5. Download JSON and save as:
cp ~/Downloads/credentials.json .mcp/credentials/gmail.json

# Enable in mcp.json
# Set "gmail": { "disabled": false }
```

### 2. Google Sheets (Tracking)

```bash
# Uses same Google Cloud project
# 1. Enable Google Sheets API in console
# 2. Credentials already downloaded for Gmail work here too
cp .mcp/credentials/gmail.json .mcp/credentials/google.json

# Enable in mcp.json
# Set "google-sheets": { "disabled": false }
```

### 3. Slack (Notifications)

```bash
# 1. Create Slack app at api.slack.com
# 2. Add bot token scopes: chat:write, channels:read
# 3. Install to workspace
# 4. Copy Bot Token

export SLACK_BOT_TOKEN="xoxb-your-token"

# Enable in mcp.json
# Set "slack": { "disabled": false }
```

## Workflow Integration Points

### Phase 2-3: Supplier Outreach
```
[Outreach emails ready] 
    → gmail/* tools send emails
    → google-sheets/* logs sent status
    → slack/* notifies "5 suppliers contacted"
```

### Phase 4: Negotiation
```
[Supplier replies]
    → gmail/* reads responses
    → Agent analyzes quotes
    → gmail/* sends counter-offers
    → google-sheets/* updates comparison matrix
```

### Phase 5: Approval
```
[Terms acceptable]
    → slack/* sends approval request to human
    → Human approves in Slack
    → Agent proceeds to next phase
```

### Daily Operations
```
[New Amazon order]
    → Agent formats order for supplier
    → gmail/* sends order to supplier
    → google-sheets/* logs order
    → slack/* notifies "Order #123 sent to supplier"
```

## Adding New MCP Servers

1. Add server definition to `.vscode/mcp.json`:
```json
"new-server": {
  "command": "npx",
  "args": ["-y", "@org/mcp-server-name"],
  "env": {},
  "disabled": true,
  "description": "What this server does"
}
```

2. Create setup instructions in `.mcp/config/new-server.md`

3. Update agent to reference new tools:
```markdown
## Tools
- new-server/* for [capability]
```

4. Test with `disabled: false`

## Security

- All credentials in `.mcp/credentials/` (gitignored)
- Use environment variables for tokens
- Never commit secrets
- Rotate credentials quarterly

## Troubleshooting

### Server won't start
```bash
# Check if npx can find the package
npx -y @anthropics/mcp-gmail --help

# Check credentials exist
ls -la .mcp/credentials/
```

### Permission errors
```bash
# Re-authorize OAuth
rm .mcp/credentials/gmail.json
# Re-download from Google Cloud Console
```

### Tool not found
```bash
# Reload VS Code window after enabling server
# Cmd+Shift+P → "Developer: Reload Window"
```
