# 🔧 Figma MCP Server Setup Guide

This guide will help you set up and start the Figma MCP (Model Context Protocol) server for your WishMaker project, enabling programmatic access to your Figma designs.

## 📋 Prerequisites

1. **Figma Account** - You need a Figma account with access to design files
2. **Figma API Key** - Personal access token from Figma
3. **Node.js** - Required for running the MCP server

## 🔑 Getting Your Figma API Key

### Step 1: Generate Figma Personal Access Token

1. Go to [Figma Developer Settings](https://www.figma.com/developers/api#access-tokens)
2. Sign in to your Figma account
3. Click "Create a new personal access token"
4. Give it a name like "WishMaker MCP Server"
5. Copy the generated token (keep it secure!)

### Step 2: Set Environment Variable

Add your Figma API key to your environment:

```bash
# Add to your ~/.zshrc or ~/.bash_profile
export FIGMA_API_KEY="your-figma-api-key-here"

# Reload your shell
source ~/.zshrc
```

Or set it temporarily for this session:
```bash
export FIGMA_API_KEY="your-figma-api-key-here"
```

## 🚀 Starting the Figma MCP Server

### Option 1: Using npm script (recommended)
```bash
npm run figma:mcp
```

### Option 2: Direct script execution
```bash
./scripts/start-figma-mcp.sh
```

### Option 3: Manual command
```bash
figma-mcp-pro --figma-api-key "$FIGMA_API_KEY" --debug --stdio
```

## 📁 Figma Project Setup

### Step 1: Create Figma Project Structure

1. **Create a new Figma team** (if you don't have one):
   - Go to Figma dashboard
   - Click "Create team"
   - Name it "WishMaker Design System"

2. **Set up project files** following your design documentation:
   - `WishMaker Design Tokens` - Colors, typography, spacing
   - `WishMaker Component Library` - UI components
   - `WishMaker Screens - Current` - Current app screens
   - `WishMaker Screens - Enhanced` - UX improvements

### Step 2: Get Figma File URLs

You'll need the file URLs or IDs for the MCP server:

```
https://www.figma.com/file/[FILE_ID]/[FILE_NAME]
```

Example:
```
https://www.figma.com/file/abc123def456/WishMaker-Design-System
```

The FILE_ID is: `abc123def456`

## 🔧 MCP Server Configuration

The server is configured via `.figma-mcp.config.json`:

```json
{
  "figma": {
    "apiKey": "YOUR_FIGMA_API_KEY_HERE",
    "teamId": "YOUR_FIGMA_TEAM_ID_HERE",
    "projectId": "YOUR_FIGMA_PROJECT_ID_HERE"
  },
  "server": {
    "port": 3001,
    "debug": true,
    "stdio": true
  },
  "project": {
    "name": "WishMaker",
    "description": "Figma integration for WishMaker application design system and UX prototyping"
  }
}
```

## 🎯 What the MCP Server Enables

Once running, the Figma MCP server provides:

1. **Design File Access** - Read Figma file contents and metadata
2. **Component Extraction** - Access component definitions and properties
3. **Asset Download** - Retrieve images, icons, and other assets
4. **Design Token Sync** - Extract colors, typography, spacing values
5. **Comment Processing** - Read design feedback and annotations
6. **Export Generation** - Generate code snippets from designs

## 🔄 Typical Workflow

1. **Start MCP Server**: `npm run figma:mcp`
2. **Design in Figma**: Create/modify designs using your setup guide
3. **Sync with Code**: Use MCP server to extract design specs
4. **Generate Components**: Convert Figma components to React code
5. **Implement UX**: Apply design improvements to your codebase

## 🐛 Troubleshooting

### Common Issues:

**"FIGMA_API_KEY not set"**
- Make sure you've exported the environment variable
- Verify the key is valid and not expired

**"Connection refused"**
- Check if the server is running
- Verify port 3001 is available
- Try restarting with `npm run figma:mcp`

**"Unauthorized"**
- Double-check your Figma API key
- Ensure you have access to the Figma files
- Regenerate API key if needed

**"File not found"**
- Verify Figma file URLs/IDs are correct
- Check file permissions in Figma
- Ensure files are in accessible team/project

## 📚 Next Steps

1. ✅ **Setup Complete** - MCP server is running
2. 📐 **Create Designs** - Follow `docs/design/figma-setup-guide.md`
3. 🎨 **Build Components** - Use component specifications
4. 🔄 **Sync & Code** - Extract designs and implement

## 🔗 Related Documentation

- [`docs/design/figma-setup-guide.md`](./figma-setup-guide.md) - Figma workspace setup
- [`docs/design/component-specifications.md`](./component-specifications.md) - Component specs
- [`docs/design/user-flow-diagrams.md`](./user-flow-diagrams.md) - User journeys

---

**💡 Pro Tip**: Keep the MCP server running in a separate terminal tab while working on design implementations. This enables real-time synchronization between your Figma designs and code.