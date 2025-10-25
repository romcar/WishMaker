# Supabase Integration Guide

This document provides a comprehensive guide for the Supabase integration in the WishMaker application.

## 🎯 Overview

The WishMaker application now supports three different backend modes:
1. **Supabase** (recommended for production) - Full-featured authentication and database
2. **Legacy Backend** (Node.js/Express with PostgreSQL) - Original backend implementation
3. **Mock API** (GitHub Pages demo) - Client-side only for static hosting

## 🚀 Features Implemented

### Authentication System
- ✅ Email/password authentication via Supabase Auth
- ✅ User registration with automatic profile creation
- ✅ Secure logout functionality
- ✅ Session persistence across browser sessions
- ✅ Row Level Security (RLS) for data isolation

### Database Schema
- ✅ PostgreSQL database with automatic migrations
- ✅ `profiles` table with user information
- ✅ `wishes` table with user-specific data
- ✅ RLS policies for secure data access
- ✅ Automatic profile creation via database triggers

### Real-time Features
- ✅ Live updates when wishes are created/modified/deleted
- ✅ Real-time synchronization across browser tabs
- ✅ Optimistic UI updates for instant feedback

### UI Components
- ✅ Clean authentication modal with login/register forms
- ✅ User menu with profile display and logout
- ✅ Responsive design matching the existing theme
- ✅ Smooth transitions and professional styling

## 📁 File Structure

```
frontend/src/
├── config/
│   └── supabase.ts              # Supabase client configuration
├── services/
│   ├── supabase.service.ts      # Supabase API service layer
│   └── WishAPIService.ts        # Unified API abstraction
├── contexts/
│   └── SupabaseAuthContext.tsx  # Authentication context provider
├── hooks/
│   └── useWishes.ts             # Custom hook for wish management
├── SupabaseApp.tsx              # Main Supabase-powered component
└── index.tsx                    # Updated to use Supabase mode

supabase/
└── migrations/
    └── 001_initial_schema.sql   # Database schema setup
```

## 🔧 Setup Instructions

### 1. Environment Configuration

Create a `.env.local` file in the `frontend/` directory:

```env
# Supabase Configuration
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key

# Backend Mode Selection (optional - defaults to auto-detection)
REACT_APP_BACKEND_MODE=supabase
```

### 2. Supabase Project Setup

1. **Create a new Supabase project** at [supabase.com](https://supabase.com)
2. **Get your project credentials** from Settings → API
3. **Run the database migration**:
   ```sql
   -- Copy the contents from supabase/migrations/001_initial_schema.sql
   -- and paste into the Supabase SQL Editor
   ```

### 3. GitHub Actions Integration

Update your `.github/workflows/deploy.yml` to include Supabase secrets:

```yaml
- name: Build
  run: npm run build
  env:
    CI: false
    REACT_APP_SUPABASE_URL: ${{ secrets.REACT_APP_SUPABASE_URL }}
    REACT_APP_SUPABASE_ANON_KEY: ${{ secrets.REACT_APP_SUPABASE_ANON_KEY }}
```

Add the secrets in your GitHub repository:
- Go to Settings → Secrets and variables → Actions
- Add `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY`

## 📊 Database Schema

### Profiles Table
```sql
profiles (
  id UUID PRIMARY KEY (references auth.users.id),
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
```

### Wishes Table
```sql
wishes (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('pending', 'fulfilled', 'cancelled')),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
```

### Security Policies
- Users can only access their own profile data
- Users can only manage their own wishes
- All operations require authentication

## 🔄 Backend Mode Detection

The application automatically detects which backend to use:

```typescript
const getBackendMode = (): BackendMode => {
  // 1. Check environment variable
  if (process.env.REACT_APP_BACKEND_MODE) {
    return process.env.REACT_APP_BACKEND_MODE as BackendMode;
  }

  // 2. Check if Supabase is configured
  if (process.env.REACT_APP_SUPABASE_URL && process.env.REACT_APP_SUPABASE_ANON_KEY) {
    return 'supabase';
  }

  // 3. Check if backend server is configured
  if (process.env.REACT_APP_BACKEND_URL) {
    return 'backend';
  }

  // 4. Default to mock for GitHub Pages
  return 'mock';
};
```

## 🎨 UI/UX Features

### Authentication Modal
- Clean, centered design with backdrop blur
- Form validation and error handling
- Seamless switching between login/register
- Loading states during authentication

### User Experience
- Persistent authentication across sessions
- Real-time updates without page refresh
- Optimistic UI for immediate feedback
- Graceful error handling with user-friendly messages

### Responsive Design
- Mobile-friendly authentication forms
- Consistent with existing application theme
- Professional styling with smooth animations

## 🧪 Testing the Integration

### Local Testing
1. Set up environment variables in `.env.local`
2. Run `npm start` in the `frontend/` directory
3. Register a new account or login
4. Create, edit, and delete wishes to test functionality
5. Open multiple tabs to verify real-time synchronization

### Production Testing
1. Deploy with Supabase environment variables configured
2. Test authentication flows
3. Verify data persistence and security
4. Check real-time updates across different browsers

## 🔒 Security Considerations

- ✅ All database access is protected by Row Level Security
- ✅ Authentication tokens are handled securely by Supabase
- ✅ API keys are properly configured (anon key is safe for client-side)
- ✅ User data is isolated using RLS policies
- ✅ SQL injection protection via Supabase's prepared statements

## 🚧 Future Enhancements

### Planned Features
- [ ] Email verification for new accounts
- [ ] Password reset functionality
- [ ] OAuth providers (Google, GitHub, etc.)
- [ ] User profile editing with avatar upload
- [ ] Advanced wish categorization and filtering
- [ ] Wish sharing and collaboration features
- [ ] Push notifications for reminders
- [ ] Data export functionality

### Performance Optimizations
- [ ] Implement pagination for large wish lists
- [ ] Add caching strategies for frequently accessed data
- [ ] Optimize real-time subscription performance
- [ ] Add offline support with sync when reconnected

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [React TypeScript Best Practices](https://react-typescript-cheatsheet.netlify.app/)

## 🤝 Contributing

When working with the Supabase integration:

1. **Database Changes**: Always create migrations in `supabase/migrations/`
2. **Type Safety**: Update TypeScript interfaces when schema changes
3. **Testing**: Test all three backend modes (supabase, backend, mock)
4. **Security**: Verify RLS policies are working correctly
5. **Performance**: Monitor real-time subscription impact

---

The Supabase integration provides a modern, scalable backend-as-a-service solution for the WishMaker application while maintaining compatibility with existing implementations. This ensures flexibility for different deployment scenarios and future growth.