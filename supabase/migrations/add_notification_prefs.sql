-- Add notification preferences column to profiles
-- Run this in Supabase SQL Editor if you already have the profiles table

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_prefs JSONB DEFAULT '{"email": true, "reminders": true}';
