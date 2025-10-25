/// <reference types="vitest" />
import react from '@vitejs/plugin-react';
import path from 'path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],

    // Configure dev server
    server: {
        port: 3000,
        host: true, // Allow external connections (needed for Docker)
        strictPort: true, // Don't automatically try other ports
    },

    // Configure build
    build: {
        outDir: 'build',
        sourcemap: true,
        // Increase chunk size warning limit for large dependencies
        chunkSizeWarningLimit: 1000,
    },

    // Configure path resolution
    resolve: {
        alias: {
            '@': path.resolve(
                path.dirname(fileURLToPath(import.meta.url)),
                './src'
            ),
        },
    },

    // Define global constants (replaces DefinePlugin from webpack)
    define: {
        global: 'globalThis',
    },

    // Configure environment variables
    envPrefix: 'VITE_',

    // Configure base path: use '/WishMaker/' for GitHub Pages, '/' for Docker
    base: process.env.VITE_GITHUB_PAGES === 'true' ? '/WishMaker/' : '/',

    // Optimize dependencies
    optimizeDeps: {
        include: ['react', 'react-dom', 'axios'],
    },

    // Configure Vitest
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./src/setupTests.ts'],
        css: true,
    },
});
