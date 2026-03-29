# Slack MCP Server Configuration

## Purpose
Real-time notifications and human approval requests.

## Setup Steps

### 1. Create Slack App
1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Create New App → From scratch
3. Name: `Amazon Seller Bot`
4. Select workspace

### 2. Configure Permissions
OAuth & Permissions → Bot Token Scopes:
- `chat:write` - Send messages
- `channels:read` - List channels
- `channels:history` - Read messages (for approvals)
- `reactions:read` - Detect approval reactions

### 3. Install to Workspace
Click "Install to Workspace" and authorize.

### 4. Get Bot Token
Copy "Bot User OAuth Token" (starts with `xoxb-`)

### 5. Set Environment Variable
```bash
export SLACK_BOT_TOKEN="xoxb-your-token-here"
```

Add to shell profile (~/.zshrc):
```bash
echo 'export SLACK_BOT_TOKEN="xoxb-your-token"' >> ~/.zshrc
```

### 6. Enable Server
Edit `.vscode/mcp.json`:
```json
"slack": {
  "disabled": false
}
```

## Channel Setup

Create channels:
- `#amazon-ops` - General operations updates
- `#amazon-approvals` - Approval requests only
- `#amazon-alerts` - Urgent issues

## Notification Types

| Event | Channel | Format |
|---|---|---|
| Supplier contacted | #amazon-ops | "📧 Sent outreach to 5 suppliers for Pet Slicker Brush" |
| Quote received | #amazon-ops | "💰 Quote from Petzone: $3.20/unit, MOQ 50" |
| Approval needed | #amazon-approvals | "🔔 **ACTION REQUIRED**\n[Deal] Pet Slicker\n[Terms] $3.20, 50 MOQ\n[Action] React ✅ to approve, ❌ to reject" |
| Order placed | #amazon-ops | "📦 Order #123 sent to supplier" |
| Alert | #amazon-alerts | "⚠️ Supplier response rate dropped below 90%" |

## Available Tools

| Tool | Purpose |
|---|---|
| `slack_send_message` | Post to channel |
| `slack_read_messages` | Read channel history |
| `slack_get_reactions` | Check for approval reactions |

## Approval Workflow

```
[Agent needs approval]
    ↓
slack_send_message to #amazon-approvals:
"🔔 **APPROVAL REQUIRED**
Deal: Pet Slicker Brush
Supplier: Shenzhen Petzone
Terms: $3.20/unit, 50 MOQ, dropship $0.50
Total: $160 + shipping
React ✅ to approve, ❌ to reject"
    ↓
[Agent polls for reaction]
slack_get_reactions every 5 minutes
    ↓
[Human reacts ✅]
    ↓
[Agent proceeds]
```
