-- Rename 'user' table to 'users' to match backend expectations
-- Run this in your Supabase SQL editor

-- First, check if the table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user', 'users');

-- Rename the table
ALTER TABLE "user" RENAME TO "users";

-- Verify the rename worked
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'users';

-- Check the table structure
\d users;
