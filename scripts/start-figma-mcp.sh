#!/bin/bash

# Figma MCP Server Startup Script for WishMaker
# This script starts the Figma MCP server with proper configuration

echo "🎨 Starting Figma MCP Server for WishMaker..."

# Check if Figma API key is set
if [ -z "$FIGMA_API_KEY" ]; then
    echo "⚠️  FIGMA_API_KEY environment variable not set!"
    echo "Please set your Figma API key:"
    echo "export FIGMA_API_KEY='your-figma-api-key-here'"
    echo ""
    echo "To get your API key:"
    echo "1. Go to https://www.figma.com/developers/api#access-tokens"
    echo "2. Generate a personal access token"
    echo "3. Copy the token and set it as environment variable"
    exit 1
fi

# Start Figma MCP Server
echo "🚀 Starting Figma MCP Pro server..."
figma-mcp-pro --figma-api-key "$FIGMA_API_KEY" --debug --stdio

echo "✅ Figma MCP Server started successfully!"