---
applyTo: "**/*"
description: "Route Amazon seller operations to appropriate MCP servers for autonomous execution."
---
## MCP Server Routing

When executing autonomous workflows, use the appropriate MCP server tools:

### Email Operations → gmail/*
- Sending supplier outreach emails
- Reading supplier responses
- Sending follow-ups and counter-offers
- Negotiation communications

### Data Tracking → google-sheets/*
- Logging supplier quotes
- Updating comparison matrices
- Recording order status
- KPI dashboard updates

### Notifications → slack/*
- Alerting on new quotes received
- Sending approval requests
- Operational updates
- Urgent alerts

### Web Research → fetch/*
- Alibaba supplier searches
- Market research
- Competitor analysis
- Price monitoring

### File Operations → filesystem/*
- Reading templates
- Writing deal documents
- Updating tracking files

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
