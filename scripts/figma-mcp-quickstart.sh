#!/bin/bash

# Quick setup script for Figma MCP integration with WishMaker
# This script helps you get started quickly

echo "🎨 WishMaker Figma MCP Quick Setup"
echo "=================================="

# Check if Figma MCP Pro is installed
if ! command -v figma-mcp-pro &> /dev/null; then
    echo "❌ Figma MCP Pro not found. Installing..."
    npm install -g figma-mcp-pro
    echo "✅ Figma MCP Pro installed successfully!"
fi

# Check for API key
if [ -z "$FIGMA_API_KEY" ]; then
    echo ""
    echo "🔑 Figma API Key Setup Required"
    echo "================================"
    echo ""
    echo "To continue, you need a Figma API key:"
    echo "1. Visit: https://www.figma.com/developers/api#access-tokens"
    echo "2. Generate a personal access token"
    echo "3. Copy the token"
    echo "4. Run: export FIGMA_API_KEY='your-token-here'"
    echo "5. Then run this script again"
    echo ""
    exit 1
fi

echo ""
echo "✅ Figma API Key found!"
echo "🚀 Starting Figma MCP Server..."
echo ""

# Start the server in the background
figma-mcp-pro --figma-api-key "$FIGMA_API_KEY" --debug &
MCP_PID=$!

echo "📡 MCP Server started with PID: $MCP_PID"
echo "🔗 Server running on default stdio transport"
echo ""
echo "📋 Next Steps:"
echo "1. Create your Figma workspace (see docs/design/figma-setup-guide.md)"
echo "2. Design your components following the specifications"
echo "3. Use the MCP server to sync designs with code"
echo ""
echo "🛑 To stop the server later, run: kill $MCP_PID"
echo ""
echo "💡 Keep this terminal open while working with Figma integration"

# Keep the script running to maintain server connection
wait