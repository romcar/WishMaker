# Code Formatting with Prettier

This project uses Prettier for consistent code formatting across all JavaScript/TypeScript files.

## Configuration

The Prettier configuration is defined in [`.prettierrc`](../.prettierrc) file.:

### Key Settings:
- **4 spaces** for indentation (no tabs)
- **Single quotes** for strings
- **80 character** line width (aggressive line breaking for parameters)
- **Semicolons** always included
- **Trailing commas** where valid in ES5
- **Bracket same line** disabled for better JSX/object formatting

### Function Parameter Formatting:
With `printWidth: 80`, Prettier will automatically break function parameters onto new lines when the total line length exceeds 80 characters. This typically means:

- **3+ parameters**: Usually formatted on separate lines
- **Long parameter names**: Will trigger line breaks sooner
- **Complex types**: TypeScript types count toward line length

Example formatting:
```typescript
// Long function - parameters on separate lines
function functionWithManyParameters(
    firstParameter: string,
    secondParameter: number,
    thirdParameter: boolean
): void {
    // ...
}

// Short function - stays on one line
function short(a: string, b: number): void {
    // ...
}
```

## Usage

### Format all files:
```bash
# From project root (formats both frontend and backend)
npm run format

# Frontend only
cd frontend && npm run format

# Backend only
cd backend && npm run format
```

### Check formatting without changing files:
```bash
# From project root
npm run format:check

# Frontend only
cd frontend && npm run format:check

# Backend only
cd backend && npm run format:check
```

## IDE Integration

### VS Code
Install the Prettier extension and add to your settings.json:
```json
{
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true,
    "[javascript]": {
        "editor.defaultFormatter": "esbenp.prettier-vscode"
    },
    "[typescript]": {
        "editor.defaultFormatter": "esbenp.prettier-vscode"
    },
    "[typescriptreact]": {
        "editor.defaultFormatter": "esbenp.prettier-vscode"
    }
}
```

## Ignored Files

See [`.prettierignore`](../.prettierignore) for files and directories excluded from formatting:
- `node_modules/`
- `build/` and `dist/` directories
- Log files
- Environment files
- Generated files
- And more...

## Git Integration

Consider adding a pre-commit hook to ensure all code is formatted before commits:

```bash
# Install husky for git hooks
npm install --save-dev husky

# Add pre-commit hook
npx husky add .husky/pre-commit "npm run format:check"
```

This ensures consistent formatting across all contributors and prevents formatting-related merge conflicts.