# ESLint Curly Brace Enforcement

This project enforces consistent use of curly braces around all `if`, `else`, `for`, `while`, and other control statements using ESLint.

## Rule Configuration

The `curly` rule is configured with `"all"` option, which requires braces around all statements:

```javascript
// ❌ Not allowed - missing braces
if (condition) doSomething();

// ❌ Not allowed - missing braces
if (condition)
    doSomething();

// ✅ Required - braces around single statements
if (condition) {
    doSomething();
}

// ✅ Required - braces around multiple statements
if (condition) {
    doSomething();
    doSomethingElse();
}
```

## Configuration Files

### Frontend (React + TypeScript)
- **Configuration**: `package.json` → `eslintConfig` section
- **Extends**: `react-app`, `react-app/jest`
- **Rule**: `"curly": ["error", "all"]`

### Backend (Node.js + TypeScript)
- **Configuration**: `eslint.config.js` (ESLint v9 format)
- **Parser**: `@typescript-eslint/parser`
- **Plugins**: `@typescript-eslint/eslint-plugin`
- **Rule**: `"curly": ["error", "all"]`

## Available Commands

### Project-wide (from root):
```bash
# Lint both frontend and backend
npm run lint

# Auto-fix linting issues including curly braces
npm run lint:fix
```

### Frontend only:
```bash
cd frontend
npm run lint
npm run lint:fix
```

### Backend only:
```bash
cd backend
npm run lint
npm run lint:fix
```

## Benefits of Enforcing Curly Braces

1. **Consistency**: All control statements look the same
2. **Safety**: Prevents bugs when adding statements later
3. **Readability**: Clear visual boundaries for code blocks
4. **Maintainability**: Reduces confusion during code reviews

## Common Scenarios Fixed

### If Statements
```javascript
// Before (error)
if (user) return user.name;

// After (fixed)
if (user) {
    return user.name;
}
```

### For Loops
```javascript
// Before (error)
for (let i = 0; i < items.length; i++) processItem(items[i]);

// After (fixed)
for (let i = 0; i < items.length; i++) {
    processItem(items[i]);
}
```

### While Loops
```javascript
// Before (error)
while (condition) doWork();

// After (fixed)
while (condition) {
    doWork();
}
```

## Integration with CI/CD

Consider adding linting to your GitHub Actions workflow:

```yaml
- name: Lint Code
  run: |
    npm run lint

- name: Check if auto-fix needed
  run: |
    npm run lint:fix
    git diff --exit-code || (echo "Code needs formatting" && exit 1)
```
## Conclusion
Enforcing curly braces around all control statements improves code quality and reduces potential bugs. Integrate ESLint checks into your development workflow to maintain consistency across your codebase.
