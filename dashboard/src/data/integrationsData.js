// Integration Hub data — established MCP servers and agentic patterns for all external services

export const integrations = [
  {
    id: 'google-workspace',
    name: 'Google Workspace MCP',
    description: 'Full natural language control over Gmail, Drive, Sheets, Calendar, Docs and more through the most feature-complete Google Workspace MCP server.',
    icon: 'google',
    status: 'ready',               // ready | needs-setup | connected | error
    category: 'communication',
    mcpPackage: 'workspace-mcp',
    installCommand: 'uvx workspace-mcp --tool-tier core --single-user --tools gmail sheets drive',
    repository: 'https://github.com/taylorwilsdon/google_workspace_mcp',
    stars: 2000,
    maintainer: 'taylorwilsdon',
    lastUpdated: '2025-06-26',
    transport: 'streamable-http',
    services: [
      { name: 'Gmail', icon: 'mail', enabled: true, tools: ['send_gmail_message', 'search_gmail_messages', 'get_gmail_message_content', 'draft_gmail_message'] },
      { name: 'Google Sheets', icon: 'table', enabled: true, tools: ['read_sheet_values', 'modify_sheet_values', 'create_spreadsheet'] },
      { name: 'Google Drive', icon: 'hard-drive', enabled: true, tools: ['search_drive_files', 'get_drive_file_content', 'create_drive_file'] },
      { name: 'Google Calendar', icon: 'calendar', enabled: false, tools: ['list_calendars', 'get_events', 'manage_event'] },
      { name: 'Google Docs', icon: 'file-text', enabled: false, tools: ['get_doc_content', 'create_doc', 'modify_doc_text'] }
    ],
    setupSteps: [
      { step: 1, title: 'Create Google Cloud Project', description: 'Go to console.cloud.google.com → Create new project', link: 'https://console.cloud.google.com/', status: 'completed' },
      { step: 2, title: 'Create OAuth Credentials', description: 'APIs & Services → Credentials → Create OAuth Client ID → Choose Desktop Application', link: 'https://console.cloud.google.com/apis/credentials', status: 'completed' },
      { step: 3, title: 'Enable Gmail & Sheets APIs', description: 'APIs & Services → Library → Enable Gmail API, Google Sheets API', link: 'https://console.cloud.google.com/apis/library', status: 'completed' },
      { step: 4, title: 'Add test user to OAuth', description: 'OAuth consent screen → Test users → Add celestialcuriosseller@gmail.com', link: 'https://console.cloud.google.com/apis/credentials/consent', status: 'action-needed' },
      { step: 5, title: 'Start MCP server', description: 'Run: uvx workspace-mcp --tool-tier core --single-user --tools gmail sheets drive', status: 'not-started' }
    ],
    vscodeMcpConfig: {
      "google-workspace": {
        "command": "uvx",
        "args": ["workspace-mcp", "--tool-tier", "core", "--single-user", "--tools", "gmail", "sheets", "drive"],
        "env": {
          "GOOGLE_OAUTH_CLIENT_ID": "${env:GOOGLE_OAUTH_CLIENT_ID}",
          "GOOGLE_OAUTH_CLIENT_SECRET": "${env:GOOGLE_OAUTH_CLIENT_SECRET}",
          "OAUTHLIB_INSECURE_TRANSPORT": "1"
        }
      }
    },
    capabilities: [
      'Send supplier outreach emails',
      'Search and read supplier replies',
      'Track quotes in Google Sheets',
      'Update comparison matrices',
      'Draft follow-up emails',
      'Manage email labels and filters'
    ],
    workflowMapping: {
      'send-outreach': 'send_gmail_message',
      'check-replies': 'search_gmail_messages',
      'update-tracker': 'modify_sheet_values',
      'log-quote': 'modify_sheet_values'
    }
  },
  {
    id: 'amazon-seller',
    name: 'Amazon Seller Central',
    description: 'Amazon SP-API (Selling Partner API) integration for product listings, orders, inventory, and advertising management.',
    icon: 'amazon',
    status: 'needs-setup',
    category: 'marketplace',
    mcpPackage: null, // No established MCP server — use SP-API SDK or Playwright
    repository: 'https://developer-docs.amazon.com/sp-api/',
    pattern: 'sp-api',
    services: [
      { name: 'Product Listings', icon: 'package', enabled: false, tools: ['create_listing', 'update_listing', 'get_listing'] },
      { name: 'Orders', icon: 'shopping-cart', enabled: false, tools: ['get_orders', 'get_order_items'] },
      { name: 'Inventory', icon: 'warehouse', enabled: false, tools: ['get_inventory', 'update_inventory'] },
      { name: 'Advertising', icon: 'megaphone', enabled: false, tools: ['get_campaigns', 'create_campaign'] }
    ],
    setupSteps: [
      { step: 1, title: 'Register as Amazon Developer', description: 'Register at developer.amazonservices.com', link: 'https://developer.amazonservices.com/', status: 'not-started' },
      { step: 2, title: 'Create SP-API Application', description: 'Developer Central → Apps & Services → Register new app', link: 'https://sellercentral.amazon.com/apps/develop/ref', status: 'not-started' },
      { step: 3, title: 'Get LWA Credentials', description: 'Login with Amazon credentials for API access', status: 'not-started' },
      { step: 4, title: 'Install Amazon Ads MCP', description: 'npx @marketplaceadpros/amazon-ads-mcp-server (requires subscription)', link: 'https://marketplaceadpros.com/', status: 'not-started' },
      { step: 5, title: 'Configure Playwright for Seller Central', description: 'Use Microsoft Playwright MCP for browser automation of Seller Central tasks', link: 'https://github.com/microsoft/playwright-mcp', status: 'not-started' }
    ],
    vscodeMcpConfig: {
      "amazon-ads": {
        "command": "npx",
        "args": ["-y", "@marketplaceadpros/amazon-ads-mcp-server"],
        "env": {
          "BEARER_TOKEN": "${env:AMAZON_ADS_BEARER_TOKEN}"
        }
      },
      "playwright": {
        "command": "npx",
        "args": ["-y", "@anthropic/mcp-playwright"],
        "disabled": true
      }
    },
    capabilities: [
      'Create and manage product listings',
      'Monitor order status and fulfillment',
      'Track inventory levels',
      'Manage PPC advertising campaigns',
      'Browser automation for Seller Central tasks'
    ],
    workflowMapping: {
      'create-listing': 'create_listing',
      'check-orders': 'get_orders',
      'update-inventory': 'update_inventory'
    }
  },
  {
    id: 'slack-notifications',
    name: 'Slack Notifications',
    description: 'Real-time alerts for new quotes, approval requests, operational updates, and urgent alerts via Slack.',
    icon: 'slack',
    status: 'needs-setup',
    category: 'notifications',
    mcpPackage: '@anthropics/mcp-slack',
    installCommand: 'npx -y @anthropics/mcp-slack',
    repository: 'https://github.com/modelcontextprotocol/servers',
    services: [
      { name: 'Channel Messages', icon: 'message-square', enabled: false, tools: ['send_message', 'list_channels'] },
      { name: 'Notifications', icon: 'bell', enabled: false, tools: ['send_notification'] },
      { name: 'Approval Requests', icon: 'check-circle', enabled: false, tools: ['send_approval_request'] }
    ],
    setupSteps: [
      { step: 1, title: 'Create Slack App', description: 'Go to api.slack.com/apps → Create New App', link: 'https://api.slack.com/apps', status: 'not-started' },
      { step: 2, title: 'Add Bot Permissions', description: 'OAuth & Permissions → Add chat:write, channels:read scopes', status: 'not-started' },
      { step: 3, title: 'Install to Workspace', description: 'Install app to your Slack workspace and copy Bot Token', status: 'not-started' },
      { step: 4, title: 'Set SLACK_BOT_TOKEN', description: 'Add token to environment variables', status: 'not-started' }
    ],
    vscodeMcpConfig: {
      "slack": {
        "command": "npx",
        "args": ["-y", "@anthropics/mcp-slack"],
        "env": {
          "SLACK_BOT_TOKEN": "${env:SLACK_BOT_TOKEN}"
        }
      }
    },
    capabilities: [
      'Send quote received alerts',
      'Send approval request notifications',
      'Post operational status updates',
      'Urgent alerts for stockouts/issues'
    ],
    workflowMapping: {
      'notify-quote': 'send_message',
      'request-approval': 'send_approval_request'
    }
  },
  {
    id: 'web-research',
    name: 'Web Research (Fetch)',
    description: 'Web content fetching for supplier searches, market research, competitor analysis, and price monitoring.',
    icon: 'globe',
    status: 'connected',
    category: 'research',
    mcpPackage: '@anthropics/mcp-fetch',
    installCommand: 'npx -y @anthropics/mcp-fetch',
    repository: 'https://github.com/modelcontextprotocol/servers',
    services: [
      { name: 'Web Scraping', icon: 'search', enabled: true, tools: ['fetch_url', 'fetch_html'] },
      { name: 'Market Research', icon: 'trending-up', enabled: true, tools: ['fetch_url'] }
    ],
    setupSteps: [
      { step: 1, title: 'Already configured', description: 'Fetch MCP server is active in .vscode/mcp.json', status: 'completed' }
    ],
    vscodeMcpConfig: {
      "fetch": {
        "command": "npx",
        "args": ["-y", "@anthropics/mcp-fetch"]
      }
    },
    capabilities: [
      'Search Made-in-China.com for suppliers',
      'Monitor competitor prices on Amazon',
      'Research market trends',
      'Verify supplier information'
    ],
    workflowMapping: {
      'supplier-search': 'fetch_url',
      'price-monitor': 'fetch_url',
      'market-research': 'fetch_url'
    }
  },
  {
    id: 'filesystem',
    name: 'File Operations',
    description: 'Read and write deal files, templates, tracking documents, and configuration files.',
    icon: 'folder',
    status: 'connected',
    category: 'storage',
    mcpPackage: '@anthropics/mcp-filesystem',
    installCommand: 'npx -y @anthropics/mcp-filesystem ./active-deals',
    repository: 'https://github.com/modelcontextprotocol/servers',
    services: [
      { name: 'File Read/Write', icon: 'file', enabled: true, tools: ['read_file', 'write_file', 'list_directory'] }
    ],
    setupSteps: [
      { step: 1, title: 'Already configured', description: 'Filesystem MCP server is active in .vscode/mcp.json', status: 'completed' }
    ],
    vscodeMcpConfig: {
      "filesystem": {
        "command": "npx",
        "args": ["-y", "@anthropics/mcp-filesystem", "./active-deals"]
      }
    },
    capabilities: [
      'Read outreach templates',
      'Write deal documents',
      'Update tracking files',
      'Manage supplier matrices'
    ],
    workflowMapping: {
      'read-template': 'read_file',
      'write-deal': 'write_file'
    }
  },
  {
    id: 'playwright-browser',
    name: 'Browser Automation (Playwright)',
    description: 'Automate browser interactions for Amazon Seller Central operations, form filling, and data extraction.',
    icon: 'monitor',
    status: 'needs-setup',
    category: 'automation',
    mcpPackage: '@anthropic/mcp-playwright',
    installCommand: 'npx -y @anthropic/mcp-playwright',
    repository: 'https://github.com/microsoft/playwright-mcp',
    stars: null,
    maintainer: 'Microsoft',
    services: [
      { name: 'Browser Navigation', icon: 'compass', enabled: false, tools: ['navigate', 'click', 'type', 'screenshot'] },
      { name: 'Data Extraction', icon: 'download', enabled: false, tools: ['get_text', 'get_attribute'] },
      { name: 'Form Automation', icon: 'edit', enabled: false, tools: ['fill_form', 'submit'] }
    ],
    setupSteps: [
      { step: 1, title: 'Install Playwright MCP', description: 'npx -y @anthropic/mcp-playwright', status: 'not-started' },
      { step: 2, title: 'Configure browser settings', description: 'Set headless mode and browser type in MCP config', status: 'not-started' }
    ],
    vscodeMcpConfig: {
      "playwright": {
        "command": "npx",
        "args": ["-y", "@anthropic/mcp-playwright"]
      }
    },
    capabilities: [
      'Automate Amazon Seller Central login',
      'Create product listings via browser',
      'Extract order data from dashboard',
      'Screenshot monitoring and verification'
    ],
    workflowMapping: {
      'seller-central-login': 'navigate',
      'create-listing-ui': 'fill_form'
    }
  }
]

// Category labels for grouping
export const integrationCategories = {
  communication: { label: 'Communication & Email', color: 'blue' },
  marketplace: { label: 'Marketplace', color: 'orange' },
  notifications: { label: 'Notifications', color: 'purple' },
  research: { label: 'Research & Data', color: 'emerald' },
  storage: { label: 'Storage & Files', color: 'slate' },
  automation: { label: 'Browser Automation', color: 'cyan' }
}

// Status labels
export const statusConfig = {
  'connected': { label: 'Connected', color: 'emerald', bgColor: 'bg-emerald-500/20', textColor: 'text-emerald-400', borderColor: 'border-emerald-500/30' },
  'ready': { label: 'Ready to Connect', color: 'amber', bgColor: 'bg-amber-500/20', textColor: 'text-amber-400', borderColor: 'border-amber-500/30' },
  'needs-setup': { label: 'Needs Setup', color: 'slate', bgColor: 'bg-slate-500/20', textColor: 'text-slate-400', borderColor: 'border-slate-500/30' },
  'error': { label: 'Error', color: 'red', bgColor: 'bg-red-500/20', textColor: 'text-red-400', borderColor: 'border-red-500/30' }
}
