-- Migration script to add 'active' column to users table
-- This script handles existing data properly

-- Step 1: Add the column as nullable first (if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'active'
    ) THEN
        ALTER TABLE users ADD COLUMN active BOOLEAN;
    END IF;
END $$;

-- Step 2: Set default value for existing users
UPDATE users SET active = true WHERE active IS NULL;

-- Step 3: Make the column NOT NULL (optional - we're keeping it nullable in JPA for now)
-- ALTER TABLE users ALTER COLUMN active SET NOT NULL;

-- Verify the migration
SELECT 'Migration completed successfully. Active column added and existing users set to active=true.' as status;
