import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

export default [
    {
        ignores: ['dist', 'build', 'node_modules'],
    },
    js.configs.recommended,
    {
        files: ['**/*.{ts,tsx,js,jsx}'],
        languageOptions: {
            parser: tsparser,
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
                jsx: true,
            },
            ecmaVersion: 2020,
            sourceType: 'module',
            globals: {
                ...globals.browser,
                ...globals.es2020,
                React: 'readonly',
                PublicKeyCredential: 'readonly',
                PublicKeyCredentialCreationOptions: 'readonly',
                PublicKeyCredentialRequestOptions: 'readonly',
                AuthenticatorResponse: 'readonly',
                AuthenticatorAttestationResponse: 'readonly',
                AuthenticatorAssertionResponse: 'readonly',
            },
        },
        plugins: {
            '@typescript-eslint': tseslint,
            react: react,
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
        rules: {
            ...tseslint.configs.recommended.rules,
            ...react.configs.recommended.rules,
            ...reactHooks.configs.recommended.rules,
            'react-refresh/only-export-components': [
                'warn',
                { allowConstantExport: true },
            ],
            // React rules
            'react/react-in-jsx-scope': 'off', // Not needed with React 17+ JSX transform
            'react/prop-types': 'off', // Using TypeScript for prop validation
            'react/no-unescaped-entities': 'off', // Allow apostrophes and quotes in JSX text
            'react/display-name': 'off', // Not required for arrow functions in contexts
            // Custom rules
            curly: ['error', 'all'],
            '@typescript-eslint/no-unused-vars': [
                'error',
                { argsIgnorePattern: '^_' },
            ],
            '@typescript-eslint/no-explicit-any': 'warn',
        },
    },
    {
        // Test files configuration
        files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
        languageOptions: {
            parser: tsparser,
            ecmaVersion: 2020,
            sourceType: 'module',
            globals: {
                ...globals.browser,
                ...globals.es2020,
                ...globals.jest,
                ...globals.vitest,
            },
        },
        plugins: {
            '@typescript-eslint': tseslint,
        },
        rules: {
            ...tseslint.configs.recommended.rules,
            '@typescript-eslint/no-unused-vars': [
                'error',
                { argsIgnorePattern: '^_' },
            ],
            '@typescript-eslint/no-explicit-any': 'warn',
        },
    },
];
