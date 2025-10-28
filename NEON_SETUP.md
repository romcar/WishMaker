# Neon Database Integration with Stack Auth

This setup integrates Neon Database (serverless PostgreSQL) with Stack Auth for WishMaker.

## Setup Instructions

### 1. Create a Neon Database Account

1. Go to [Neon Console](https://console.neon.tech/)
2. Sign up for a free account
3. Create a new project
4. Copy the connection string from your project dashboard

### 2. Configure Environment Variables

Update your `.env` file with your Neon database URL:

```env
# Replace with your actual Neon database connection string
VITE_NEON_DATABASE_URL=postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
```

### 3. Set up Database Schema

Run the following commands to set up your database:

```bash
# Generate migration files
npm run db:generate

# Push schema to database (for development)
npm run db:push

# Or run migrations (for production)
npm run db:migrate
```

### 4. Stack Auth Configuration

The Stack Auth integration automatically handles user authentication. Make sure your Stack Auth project is configured to use Neon as the database adapter.

## Database Schema

The wishes table schema:

```sql
CREATE TABLE wishes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'fulfilled', 'cancelled')),
    priority INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Available Scripts

- `npm run db:generate` - Generate migration files from schema changes
- `npm run db:migrate` - Run pending migrations
- `npm run db:push` - Push schema changes directly (development only)
- `npm run db:studio` - Open Drizzle Studio for database exploration

## Usage in Components

Use the `useNeonWishes` hook in your React components:

```tsx
import { useNeonWishes } from '../hooks/useNeonWishes';

function MyComponent() {
    const { wishes, loading, error, createWish, deleteWish, updateWishStatus } = useNeonWishes();

    // Your component logic here
}
```

## Security Notes

- The Neon connection string contains sensitive credentials
- In production, use environment variables and proper secret management
- Stack Auth handles user authentication and authorization automatically
- Each user can only access their own wishes (enforced by user ID filtering)

## Troubleshooting

1. **Connection Issues**: Verify your Neon database URL is correct
2. **Schema Errors**: Run `npm run db:push` to sync schema changes
3. **Authentication**: Ensure Stack Auth is properly configured
4. **CORS Issues**: Neon handles CORS automatically for web applications

## Migration from Local PostgreSQL

If migrating from the local PostgreSQL setup:

1. Export your existing data
2. Update environment variables to use Neon
3. Run migrations to create the new schema
4. Import your data to Neon database
5. Update your components to use the new UUID-based IDs