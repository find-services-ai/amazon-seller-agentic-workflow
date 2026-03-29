# Google Sheets MCP Server Configuration

## Purpose
Track suppliers, quotes, orders, and KPIs in structured spreadsheets.

## Setup Steps

### 1. Prerequisites
Complete Gmail setup first (same Google Cloud project).

### 2. Enable Sheets API
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Enable Google Sheets API

### 3. Credentials
Use same credentials as Gmail:
```bash
cp .mcp/credentials/gmail.json .mcp/credentials/google.json
```

### 4. Enable Server
Edit `.vscode/mcp.json`:
```json
"google-sheets": {
  "disabled": false
}
```

## Spreadsheet Structure

Create master spreadsheet: `Amazon Seller Operations`

### Sheet: Suppliers
| Column | Purpose |
|---|---|
| Supplier Name | Company name |
| Platform | Alibaba, 1688, etc |
| Product | Product they supply |
| MOQ | Minimum order |
| Unit Price | Quoted price |
| Dropship | Yes/No |
| Status | Lead, Quoted, Negotiating, Active |
| Last Contact | Date |
| Notes | |

### Sheet: Active Deals
| Column | Purpose |
|---|---|
| Deal ID | Unique identifier |
| Product | Product name |
| Phase | 1-7 |
| Supplier | Selected supplier |
| Terms | Agreed terms summary |
| Status | Active, Pending Approval, Closed |
| Next Action | |
| Owner | Human or Auto |

### Sheet: Orders
| Column | Purpose |
|---|---|
| Order ID | Amazon order ID |
| Date | Order date |
| Product | SKU |
| Customer | Ship-to name |
| Address | Ship-to address |
| Supplier | Fulfilling supplier |
| Sent to Supplier | Timestamp |
| Tracking | Tracking number |
| Status | Pending, Shipped, Delivered |

### Sheet: KPIs
| Column | Purpose |
|---|---|
| Week | Week number |
| Gross Profit | $ |
| Gross Margin | % |
| Orders | Count |
| Stockout Rate | % |
| On-Time Delivery | % |

## Available Tools

| Tool | Purpose |
|---|---|
| `sheets_read_range` | Get data from spreadsheet |
| `sheets_write_range` | Update cells |
| `sheets_append_row` | Add new row |
| `sheets_create_spreadsheet` | Create new spreadsheet |

## Agent Integration

Update agent tools:
```yaml
tools: [read, edit, search, web, execute, todo, gmail/*, google-sheets/*]
```
