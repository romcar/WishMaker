# Husky Git Hooks Configuration

This document describes the pre-commit hooks setup using Husky and lint-staged to ensure code quality.

## Overview

The project uses [Husky](https://typicode.github.io/husky/) for Git hooks and [lint-staged](https://github.com/okonet/lint-staged) to run code quality tools only on staged files.

## What Happens on Commit

When you run `git commit`, the pre-commit hook automatically:

1. **ESLint Fix**: Runs `eslint --fix` to automatically fix linting issues
2. **Prettier Format**: Runs `prettier --write` to format code consistently
3. **File Processing**: Only processes staged files (not the entire codebase)

## Configuration

### Package.json Scripts

```json
{
  "scripts": {
    "prepare": "husky",
    "pre-commit": "lint-staged"
  },
  "lint-staged": {
    "frontend/**/*.{js,jsx,ts,tsx}": [
      "npm run lint:fix --prefix frontend",
      "npm run format --prefix frontend"
    ],
    "backend/**/*.{js,ts}": [
      "npm run lint:fix --prefix backend", 
      "npm run format --prefix backend"
    ],
    "*.{json,md,yml,yaml}": [
      "prettier --write"
    ]
  }
}
```

### File Processing Rules

- **Frontend TypeScript/React**: ESLint fix → Prettier format
- **Backend TypeScript**: ESLint fix → Prettier format  
- **Config Files**: Prettier format only (JSON, Markdown, YAML)

## Pre-commit Hook Location

The hook is located at `.husky/pre-commit`:

```bash
npm run pre-commit
```

## Benefits

### 🚀 **Automatic Code Quality**
- Fixes common linting issues automatically
- Ensures consistent code formatting
- Prevents poorly formatted code from being committed

### ⚡ **Performance Optimized**
- Only processes staged files (not entire codebase)
- Faster than running tools on all files
- Respects your working directory changes

### 🔄 **Developer Experience**
- No manual formatting needed
- Consistent code style across team
- Catches issues before they reach CI/CD

## Example Workflow

```bash
# 1. Make changes to files
echo "const bad={a:1,b:2};" > frontend/src/example.ts

# 2. Stage files
git add frontend/src/example.ts

# 3. Commit (triggers pre-commit hook)
git commit -m "Add example"
# → ESLint fixes issues
# → Prettier formats code  
# → Commit succeeds with clean code

# 4. Result: Clean, formatted code is committed
cat frontend/src/example.ts
# const bad = { a: 1, b: 2 };
```

## Troubleshooting

### Hook Not Running?

```bash
# Ensure Husky is properly installed
npm run prepare

# Check hook exists and is executable
ls -la .husky/pre-commit
```

### Lint-staged Issues?

```bash
# Test lint-staged manually
npx lint-staged

# Check configuration
cat package.json | grep -A 20 "lint-staged"
```

### Formatting Conflicts?

If you have unstaged changes in files being processed:
1. Commit or stash unstaged changes first
2. Or add all changes: `git add .`
3. Then commit

## Installation (Already Complete)

The setup is already installed, but for reference:

```bash
# Install packages
npm install --save-dev husky lint-staged prettier

# Initialize Husky
npx husky init

# Configure package.json (already done)
# Add lint-staged configuration (already done)
```

## Bypassing Hooks (Emergency Only)

⚠️ **Not recommended** - only for emergencies:

```bash
git commit -m "Emergency fix" --no-verify
```

## Integration with CI/CD

The same lint and format commands run in GitHub Actions, ensuring consistency between local development and deployment.