/* eslint-env node */
import { config } from '@dotenvx/dotenvx';
import type { Config } from 'drizzle-kit';

// Ensure this only runs in Node.js environment
if (typeof process === 'undefined') {
    throw new Error(
        'drizzle.config.ts should only be run in Node.js environment'
    );
}

// Load environment variables in order of precedence (last one wins)
// 1. Root environment files
config({ path: '../.env' });
config({ path: '../.env.development' });
config({ path: '../.env.production' });
// 2. Frontend-specific files
config({ path: '.env.development' });
config({ path: '.env.production' });
// 3. Local overrides (highest priority)
config({ path: '../.env.local' });
config({ path: '.env.local' });

// eslint-disable-next-line no-undef
const connectionString = process.env.VITE_NEON_DATABASE_URL;

if (
    !connectionString ||
    connectionString === 'postgresql://username:password@hostname:port/database'
) {
    console.error('❌ Neon Database URL not configured!');
    console.log('📝 To set up Neon Database:');
    console.log('1. Sign up at https://console.neon.tech/');
    console.log('2. Create a new project');
    console.log('3. Copy your connection string');
    console.log(
        '4. Update VITE_NEON_DATABASE_URL in .env and .env.local files'
    );
    console.log('');
    console.log('Current value:', connectionString);
    // eslint-disable-next-line no-undef
    process.exit(1);
}

export default {
    schema: './src/lib/schema.ts',
    out: './src/lib/migrations',
    dialect: 'postgresql',
    dbCredentials: {
        url: connectionString,
    },
} satisfies Config;
