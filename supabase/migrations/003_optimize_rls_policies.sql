-- Performance fix: Optimize RLS policies by wrapping auth.uid() in subselects
-- This prevents re-evaluation of auth.uid() for each row, improving query performance

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own wishes" ON public.wishes;
DROP POLICY IF EXISTS "Users can insert their own wishes" ON public.wishes;
DROP POLICY IF EXISTS "Users can update their own wishes" ON public.wishes;
DROP POLICY IF EXISTS "Users can delete their own wishes" ON public.wishes;

-- Recreate profiles policies with optimized auth.uid() calls
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    TO authenticated
    USING ((SELECT auth.uid()) = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING ((SELECT auth.uid()) = id);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    TO authenticated
    WITH CHECK ((SELECT auth.uid()) = id);

-- Recreate wishes policies with optimized auth.uid() calls
CREATE POLICY "Users can view their own wishes"
    ON public.wishes FOR SELECT
    TO authenticated
    USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert their own wishes"
    ON public.wishes FOR INSERT
    TO authenticated
    WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own wishes"
    ON public.wishes FOR UPDATE
    TO authenticated
    USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete their own wishes"
    ON public.wishes FOR DELETE
    TO authenticated
    USING ((SELECT auth.uid()) = user_id);

-- Fix handle_new_user function security: Add explicit search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SET search_path = public, pg_catalog
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, first_name, last_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', '')
    );
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Ensure we have proper indexes for RLS policy columns (already exist but confirming)
CREATE INDEX IF NOT EXISTS idx_wishes_user_id ON public.wishes(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_id ON public.profiles(id);