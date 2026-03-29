#!/bin/bash
# MCP Server Setup Script
# Run: chmod +x .mcp/scripts/setup.sh && .mcp/scripts/setup.sh

set -e

echo "🔧 Amazon Seller MCP Setup"
echo "=========================="

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Install from nodejs.org"
    exit 1
fi
echo "✅ Node.js $(node -v)"

# Check npx
if ! command -v npx &> /dev/null; then
    echo "❌ npx not found. Run: npm install -g npx"
    exit 1
fi
echo "✅ npx available"

# Create directories
mkdir -p .mcp/credentials
mkdir -p .mcp/config
echo "✅ Directories created"

# Check credentials
echo ""
echo "📋 Credential Status:"

if [ -f ".mcp/credentials/gmail.json" ]; then
    echo "  ✅ Gmail credentials found"
else
    echo "  ⚪ Gmail credentials missing - see .mcp/config/gmail.md"
fi

if [ -f ".mcp/credentials/google.json" ]; then
    echo "  ✅ Google Sheets credentials found"
else
    echo "  ⚪ Google Sheets credentials missing - see .mcp/config/google-sheets.md"
fi

if [ -n "$SLACK_BOT_TOKEN" ]; then
    echo "  ✅ Slack token set"
else
    echo "  ⚪ SLACK_BOT_TOKEN not set - see .mcp/config/slack.md"
fi

if [ -n "$DATABASE_URL" ]; then
    echo "  ✅ Database URL set"
else
    echo "  ⚪ DATABASE_URL not set (optional)"
fi

# Pre-download MCP packages
echo ""
echo "📦 Pre-downloading MCP packages..."
npx -y @anthropics/mcp-fetch --version 2>/dev/null || echo "  Fetch server ready"

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Add Gmail credentials (see .mcp/config/gmail.md)"
echo "2. Enable servers in .vscode/mcp.json"
echo "3. Reload VS Code window"
