-- Security fix: Add explicit search_path to handle_updated_at function
-- This prevents potential security issues from mutable search_path

CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER
SET search_path = public, pg_catalog
AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';