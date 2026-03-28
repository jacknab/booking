-- Add password_changed column to users table
-- This tracks if staff members have changed their initial temporary password

ALTER TABLE users ADD COLUMN password_changed BOOLEAN DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN users.password_changed IS 'Tracks if staff user has changed their initial temporary password';
