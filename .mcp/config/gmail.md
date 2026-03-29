# Gmail MCP Server Configuration

## Purpose
Automate supplier email outreach, follow-ups, and negotiation communications.

## Setup Steps

### 1. Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project: `amazon-seller-automation`
3. Enable APIs:
   - Gmail API
   - Google Sheets API (for later)

### 2. OAuth Credentials
1. Go to APIs & Services → Credentials
2. Create Credentials → OAuth 2.0 Client ID
3. Application type: Desktop app
4. Name: `Amazon Seller MCP`
5. Download JSON

### 3. Install Credentials
```bash
mkdir -p .mcp/credentials
mv ~/Downloads/client_secret_*.json .mcp/credentials/gmail.json
```

### 4. Enable Server
Edit `.vscode/mcp.json`:
```json
"gmail": {
  "disabled": false
}
```

### 5. Authorize
First time the server runs, it will open browser for OAuth consent.
Grant permissions and close browser when done.

## Available Tools

Once enabled, these tools become available:

| Tool | Purpose |
|---|---|
| `gmail_send_email` | Send outreach emails to suppliers |
| `gmail_read_email` | Read supplier responses |
| `gmail_search` | Find emails by subject/sender |
| `gmail_create_draft` | Prepare emails for review |
| `gmail_list_threads` | Get conversation threads |

## Agent Integration

Update agent to use gmail tools:
```yaml
tools: [read, edit, search, web, execute, todo, gmail/*]
```

## Email Templates Location
`/active-deals/[product]/outreach-emails-ready-to-send.md`

## Security Notes
- Credentials file is gitignored
- OAuth token refreshes automatically
- Revoke access at myaccount.google.com/permissions if needed
