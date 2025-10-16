-- Migration: Add missing first_name and last_name columns to users table
-- Date: 2025-10-15
-- Purpose: Fix missing columns that were expected by AuthController
-- Related: User registration functionality

-- Add missing name columns that were referenced in auth.controller.ts
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);