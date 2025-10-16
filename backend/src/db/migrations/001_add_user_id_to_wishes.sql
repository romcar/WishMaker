-- Migration: Add user_id foreign key to wishes table
-- Date: 2025-10-15
-- Purpose: Fix critical security issue - add data isolation between users
-- Related Linear Ticket: https://linear.app/romcar/issue/ROM-6/critical-fix-database-schema-security-issues

-- Add user_id column to wishes table
ALTER TABLE wishes ADD COLUMN user_id INTEGER;

-- Add foreign key constraint to ensure referential integrity
ALTER TABLE wishes ADD CONSTRAINT fk_wishes_user_id
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Create performance indexes
CREATE INDEX idx_wishes_user_id ON wishes(user_id);
CREATE INDEX idx_wishes_user_created ON wishes(user_id, created_at DESC);
CREATE INDEX idx_wishes_user_status ON wishes(user_id, status);

-- Create unique constraint to prevent duplicate titles per user (case-sensitive)
CREATE UNIQUE INDEX idx_wishes_user_title ON wishes(user_id, title);

-- For existing data: assign wishes to test user (development only)
-- In production, this step would need careful handling of existing data
UPDATE wishes
SET user_id = (SELECT id FROM users WHERE email = 'test@example.com' LIMIT 1)
WHERE user_id IS NULL;

-- Make user_id NOT NULL to enforce data integrity
ALTER TABLE wishes ALTER COLUMN user_id SET NOT NULL;