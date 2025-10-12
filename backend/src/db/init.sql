// TODO: CRITICAL DATABASE SECURITY ISSUE
// 🎫 Linear Ticket: https://linear.app/romcar/issue/ROM-6/critical-fix-database-schema-security-issues
// The wishes table is missing a crucial user_id foreign key!
// This means:
// 1. No data isolation between users (users can see each other's wishes)
// 2. No referential integrity (orphaned wishes if user deleted)
// 3. Major privacy and security vulnerability
//
// IMMEDIATE FIXES REQUIRED:
-- ALTER TABLE wishes ADD COLUMN user_id INTEGER;
-- ALTER TABLE wishes ADD CONSTRAINT fk_wishes_user_id
--     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
-- CREATE INDEX idx_wishes_user_id ON wishes(user_id);
CREATE TABLE IF NOT EXISTS wishes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pending'
);

-- TODO: MISSING INDEXES - Add these performance and security indexes:
-- CREATE INDEX IF NOT EXISTS idx_wishes_user_id ON wishes(user_id);
-- CREATE INDEX IF NOT EXISTS idx_wishes_user_created ON wishes(user_id, created_at DESC);
-- CREATE INDEX IF NOT EXISTS idx_wishes_user_status ON wishes(user_id, status);
-- CREATE UNIQUE INDEX IF NOT EXISTS idx_wishes_user_title ON wishes(user_id, LOWER(title)); -- prevent duplicate titles per user

CREATE INDEX IF NOT EXISTS idx_wishes_status ON wishes(status);
CREATE INDEX IF NOT EXISTS idx_wishes_created_at ON wishes(created_at DESC);

-- TODO: MISSING DATABASE FEATURES - Add these essential tables:
-- 1. wish_categories table for organizing wishes
-- 2. wish_tags table with many-to-many relationship
-- 3. wish_comments table for user notes/updates
-- 4. wish_attachments table for file uploads
-- 5. wish_sharing table for collaborative wishes
-- 6. wish_templates table for reusable wish patterns
-- 7. user_preferences table for UI/notification settings
