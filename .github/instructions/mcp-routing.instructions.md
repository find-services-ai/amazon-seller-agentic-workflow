---
applyTo: "**/*"
description: "Route Amazon seller operations to appropriate MCP servers for autonomous execution."
---
## MCP Server Routing — Established Agentic Patterns

When executing autonomous workflows, use the appropriate established MCP server tools:

### Email + Sheets + Drive → google-workspace (workspace-mcp)
- **Package:** `workspace-mcp` by taylorwilsdon (2K+ stars, actively maintained)
- **Pattern:** Desktop OAuth, auto token refresh, single-user mode
- Sending supplier outreach emails → `send_gmail_message`
- Reading supplier responses → `search_gmail_messages`
- Sending follow-ups and counter-offers → `send_gmail_message`
- Logging supplier quotes → `modify_sheet_values`
- Updating comparison matrices → `modify_sheet_values`
- Recording order status → `modify_sheet_values`
- KPI dashboard updates → `read_sheet_values` / `modify_sheet_values`
- File storage and sharing → `search_drive_files` / `create_drive_file`

### Notifications → slack/*
- Alerting on new quotes received
- Sending approval requests
- Operational updates
- Urgent alerts

### Web Research → fetch/*
- Made-in-China.com supplier searches
- Market research
- Competitor analysis
- Price monitoring

### File Operations → filesystem/*
- Reading templates
- Writing deal documents
- Updating tracking files

### Amazon Seller Central → amazon-ads/* + playwright/*
- Amazon Ads campaigns → `@marketplaceadpros/amazon-ads-mcp-server`
- Seller Central browser automation → `@anthropic/mcp-playwright`
- Product listing management
- Order monitoring

## Approval Flow

When human approval is required:
1. Use slack/* to send approval request with details
2. Include clear action buttons/reactions
3. Poll for response
4. Only proceed after approval confirmed

## Fallback Behavior

If MCP server unavailable:
1. Log the intended action to file
2. Notify human of required manual action
3. Continue with non-blocked workflow steps
