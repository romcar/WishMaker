import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

// Get Neon connection string from environment variables
const connectionString = import.meta.env.VITE_NEON_DATABASE_URL;

if (!connectionString) {
    throw new Error('VITE_NEON_DATABASE_URL environment variable is required');
}

// Create the Neon SQL client
export const sql = neon(connectionString);

// Create the Drizzle database instance
export const db = drizzle(sql);

// Export for use with Stack Auth
export { connectionString };
