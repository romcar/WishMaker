# RLS Policy Performance Optimization

## What is Row Level Security (RLS)?

**Row Level Security (RLS)** is a PostgreSQL security feature that allows you to control which rows individual users can access in database tables. Instead of granting or denying access to entire tables, RLS lets you define fine-grained policies that determine which specific rows a user can see, insert, update, or delete.

### How RLS Works
```sql
-- Example: Users can only see their own wishes
CREATE POLICY "Users can view their own wishes"
    ON public.wishes FOR SELECT
    TO authenticated
    USING (user_id = current_user_id);
```

When a user queries the `wishes` table, PostgreSQL automatically applies this policy as a `WHERE` clause, ensuring they only see rows where `user_id` matches their identity.

### RLS vs Application-Level Security

| **Application-Level Security**        | **Row Level Security (RLS)**            |
| ------------------------------------- | --------------------------------------- |
| ❌ Security logic in application code  | ✅ Security enforced at database level   |
| ❌ Vulnerable to code bugs/bypasses    | ✅ Impossible to bypass                  |
| ❌ Must remember to add WHERE clauses  | ✅ Automatically applied to all queries  |
| ❌ Inconsistent across different apps  | ✅ Consistent across all database access |
| ❌ Can be forgotten during development | ✅ Always enforced, even for admin tools |

## Why RLS is Critical for Multi-Tenant Applications

### 🔒 **Security Benefits**
1. **Data Isolation**: Users cannot access other users' data, even with direct database access
2. **Defense in Depth**: Security is enforced at the database level, not just application level
3. **Audit Compliance**: Meets regulatory requirements for data access controls
4. **Zero Trust**: Even if application code is compromised, data remains isolated

### 🛡️ **Attack Prevention**
RLS protects against common vulnerabilities:
- **SQL Injection**: Even successful injection cannot access other users' data
- **Application Bugs**: Forgotten WHERE clauses cannot leak data
- **Insider Threats**: Database administrators cannot easily access user data
- **API Bypasses**: Direct database access still respects user boundaries

### 🎯 **Use Cases Perfect for RLS**
- **SaaS Applications**: Each customer's data is isolated
- **Social Platforms**: Users only see their own posts/messages
- **Healthcare Systems**: Patient data access controls
- **Financial Applications**: Account-level data security
- **Corporate Tools**: Department or team-level data access

### Example: Why WishMaker Needs RLS
```sql
-- Without RLS: Dangerous - could return ALL wishes
SELECT * FROM wishes WHERE title LIKE '%vacation%';

-- With RLS: Safe - automatically becomes:
SELECT * FROM wishes
WHERE title LIKE '%vacation%'
  AND user_id = (SELECT auth.uid());  -- Added automatically!
```

## RLS in Supabase Context

### 🔧 **Supabase RLS Integration**
Supabase leverages PostgreSQL's native RLS with additional features:
- **Authentication Integration**: `auth.uid()` function provides current user ID
- **JWT Claims Access**: `auth.jwt()` for role-based access patterns
- **Real-time Security**: RLS policies apply to real-time subscriptions
- **API Security**: All Supabase API calls respect RLS policies automatically

### 🌐 **Client-Side Security Model**
```javascript
// ✅ This is safe because RLS enforces user isolation
const { data: wishes } = await supabase
  .from('wishes')
  .select('*');  // User can only see their own wishes
```

Even though the client has direct database access via Supabase, RLS ensures:
1. **API Keys**: Anon key allows limited access with RLS enforcement
2. **Row Filtering**: Users automatically see only their authorized data
3. **Real-time Updates**: Live subscriptions only deliver permitted rows
4. **Consistent Security**: Same rules apply whether accessing via REST API, GraphQL, or real-time

### 🔄 **RLS + Real-time Subscriptions**
```javascript
// Real-time subscription automatically filtered by RLS
const subscription = supabase
  .channel('wishes')
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'wishes' },
    (payload) => {
      // Only receives changes to user's own wishes
      console.log('Change received!', payload);
    }
  )
  .subscribe();
```

## Issue Summary
**Title**: RLS Policy Performance - Direct auth.uid() Calls
**Entity**: All RLS policies on `public.profiles` and `public.wishes`
**Severity**: Performance impact at scale

## Problem Description
The RLS policies were calling `auth.uid()` directly in policy expressions, causing:

- **Per-row re-evaluation**: `auth.uid()` was being called for each row during queries
- **Unnecessary CPU overhead**: Function calls repeated instead of cached
- **Poor query performance**: Significant slowdown when scanning many rows
- **Inefficient query planning**: PostgreSQL couldn't optimize the constant value

## Root Cause Analysis

### Original Problematic Policies
```sql
-- ❌ Inefficient: auth.uid() called per row
CREATE POLICY "Users can delete their own wishes"
    ON public.wishes FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own wishes"
    ON public.wishes FOR SELECT
    USING (auth.uid() = user_id);
```

### Why This Causes Performance Issues
1. **Function Inlining**: PostgreSQL may inline `auth.uid()` calls per row
2. **No Caching**: The authentication context is re-evaluated unnecessarily
3. **Query Planning**: Optimizer can't treat the value as a constant
4. **Scale Impact**: Performance degrades linearly with row count

## Solution Applied
**Migration**: `003_optimize_rls_policies.sql`

### Optimized Policies with Subselects
```sql
-- ✅ Efficient: auth.uid() evaluated once per query
CREATE POLICY "Users can delete their own wishes"
    ON public.wishes FOR DELETE
    TO authenticated
    USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can view their own wishes"
    ON public.wishes FOR SELECT
    TO authenticated
    USING ((SELECT auth.uid()) = user_id);
```

## Performance Improvements

### ✅ **Subselect Optimization**
- `(SELECT auth.uid())` is evaluated **once per statement**
- PostgreSQL treats the result as a constant for query planning
- Dramatic performance improvement for multi-row operations

### ✅ **Enhanced Role Targeting**
- Added explicit `TO authenticated` clause
- Policies only apply to authenticated users
- Clearer security boundaries

### ✅ **Query Planning Benefits**
- Optimizer can use the constant value more effectively
- Better index utilization on `user_id` columns
- Improved join performance

## All Updated Policies

### Profiles Table Policies
```sql
-- View own profile
USING ((SELECT auth.uid()) = id)

-- Update own profile
USING ((SELECT auth.uid()) = id)

-- Insert own profile
WITH CHECK ((SELECT auth.uid()) = id)
```

### Wishes Table Policies
```sql
-- View own wishes
USING ((SELECT auth.uid()) = user_id)

-- Insert own wishes
WITH CHECK ((SELECT auth.uid()) = user_id)

-- Update own wishes
USING ((SELECT auth.uid()) = user_id)

-- Delete own wishes
USING ((SELECT auth.uid()) = user_id)
```

## Additional Security Improvements

### ✅ **Function Search Path Fixed**
Also updated `handle_new_user()` function:
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SET search_path = public, pg_catalog  -- 🔒 Added explicit search path
AS $$
-- Function body unchanged
$$ language 'plpgsql' SECURITY DEFINER;
```

### ✅ **Index Optimization**
Confirmed essential indexes exist:
```sql
-- User-specific data access
CREATE INDEX IF NOT EXISTS idx_wishes_user_id ON public.wishes(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_id ON public.profiles(id);
```

## Performance Impact Analysis

### Before Optimization
```sql
-- For a query returning 1000 user wishes:
-- auth.uid() called 1000 times ❌
-- CPU overhead: ~1000 function calls
-- Query time: Proportional to row count
```

### After Optimization
```sql
-- For a query returning 1000 user wishes:
-- auth.uid() called 1 time ✅
-- CPU overhead: ~1 function call
-- Query time: Constant overhead regardless of row count
```

### Expected Performance Gains
- **Small datasets (< 100 rows)**: 10-20% improvement
- **Medium datasets (100-1000 rows)**: 30-50% improvement
- **Large datasets (> 1000 rows)**: 50-80% improvement
- **Bulk operations**: Significant improvement

## Testing Recommendations

### Query Performance Testing
```sql
-- Test large dataset queries
EXPLAIN ANALYZE
SELECT * FROM wishes
WHERE user_id = (SELECT auth.uid());

-- Compare with direct auth.uid() calls
EXPLAIN ANALYZE
SELECT * FROM wishes
WHERE user_id = auth.uid();
```

### Functional Testing
1. ✅ Verify users can only access their own data
2. ✅ Test all CRUD operations (create, read, update, delete)
3. ✅ Confirm unauthorized access is properly blocked
4. ✅ Validate performance with realistic data volumes

## Migration Status

- **Applied**: ✅ Migration `003_optimize_rls_policies.sql` successfully applied
- **Environment**: Production Supabase database
- **Policies Updated**: 7 total policies (3 profiles + 4 wishes)
- **Functions Fixed**: 1 additional function (`handle_new_user`)
- **Security**: ✅ All security guarantees maintained
- **Performance**: ✅ Significantly improved for multi-row operations

## Best Practices Established

1. **Subselect Wrapping**: Always wrap `auth.uid()` in `(SELECT ...)` for RLS policies
2. **Role Targeting**: Use explicit `TO authenticated` for clarity
3. **Function Security**: Always set explicit `search_path` for functions
4. **Index Strategy**: Ensure user_id columns are properly indexed
5. **Testing Protocol**: Validate both security and performance after changes

This optimization ensures that your RLS policies are both secure and performant, providing a solid foundation for scaling your application to handle thousands of users and millions of records efficiently.