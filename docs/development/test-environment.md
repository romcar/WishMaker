# Developer Toolbar Test Scripts

This directory contains scripts to test the developer toolbar functionality in different environments.

## Test Production Build

To verify that the developer toolbar doesn't appear in production builds:

```bash
# Build production version
npm run build

# Serve production build locally
npx serve -s build -l 3001

# Visit http://localhost:3001 - no dev toolbar should appear
```

## Test Development Mode

To verify the developer toolbar appears in development:

```bash
# Start development server
npm start

# Visit http://localhost:3000 - dev toolbar should appear on the bottom right of the screen
```

## Environment Detection Logic

The developer toolbar only appears when:
- `process.env.NODE_ENV === 'development'` OR
- `window.location.hostname === 'localhost'` OR
- `window.location.hostname === '127.0.0.1'`

This ensures it never appears in production deployments while still working in local development environments.