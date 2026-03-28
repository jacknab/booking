-- Add sms_tokens column to locations table
ALTER TABLE locations
ADD COLUMN sms_tokens INTEGER NOT NULL DEFAULT 0;
