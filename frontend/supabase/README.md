# Supabase Configuration

This directory contains the Supabase configuration and migration files for the WishMaker application.

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new account or sign in
3. Click "New project"
4. Choose your organization and fill in project details:
    - Name: WishMaker
    - Database Password: (generate a strong password)
    - Region: Choose closest to your users

### 2. Get Your Project Credentials

After your project is created, go to Settings > API and copy:

- `Project URL` (REACT_APP_SUPABASE_URL)
- `anon public` key (REACT_APP_SUPABASE_ANON_KEY)

### 3. Set Environment Variables

Create a `.env.local` file in your frontend directory:

```bash
REACT_APP_SUPABASE_URL=your-project-url
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run Database Migrations

#### Option A: Using Supabase CLI (Recommended)

1. Install Supabase CLI:

    ```bash
    brew install supabase/tap/supabase
    ```

2. Login to Supabase:

    ```bash
    supabase login
    ```

3. Initialize Supabase in your project:

    ```bash
    supabase init
    ```

4. Link to your remote project:

    ```bash
    supabase link --project-ref your-project-ref
    ```

5. Push migrations to your project:
    ```bash
    supabase db push
    ```

#### Option B: Manual SQL Execution

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `migrations/001_initial_schema.sql`
4. Click "Run" to execute the migration

### 5. Configure Authentication

In your Supabase dashboard:

1. Go to Authentication > Settings
2. Configure your site URL: `https://romcar.github.io`
3. Add redirect URLs:
    - `https://romcar.github.io/WishMaker`
    - `http://localhost:3000` (for development)
    - `http://localhost:3001` (for development)

### 6. Test the Integration

1. Start your development server:

    ```bash
    npm start
    ```

2. Try creating an account and signing in
3. Create some wishes to test the database functionality

## Database Schema

### Tables

- **profiles**: User profile information (linked to auth.users)
- **wishes**: User wishes with CRUD operations

### Security

- Row Level Security (RLS) is enabled on all tables
- Users can only access their own data
- Automatic profile creation on user signup

### Real-time Features

Supabase provides real-time subscriptions out of the box. The application will automatically sync wish changes across multiple browser tabs/devices.

## GitHub Pages Deployment

The application automatically detects when running on GitHub Pages and falls back to mock data for the demo. For a full Supabase deployment, you would deploy to platforms like:

- Vercel
- Netlify
- Railway
- Your own server

## Environment Variables Reference

```bash
# Supabase Configuration
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key

# Optional: Custom domain for auth redirects
REACT_APP_SITE_URL=https://your-domain.com
```
