-- Add username and password columns to event_faculty
ALTER TABLE event_faculty 
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS password TEXT;
