-- Migration 008: Activity Logs and Auditing
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL, -- e.g. 'event_created', 'event_deleted', 'user_registered', 'favorite_added', 'favorite_removed'
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast log retrieval by action type or date
CREATE INDEX IF NOT EXISTS idx_activity_logs_action_type ON activity_logs (action_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs (created_at DESC);

-- Enable RLS
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- 1. Admins and Faculty can view all activity logs
DROP POLICY IF EXISTS "Admins and Faculty can view activity logs" ON activity_logs;
CREATE POLICY "Admins and Faculty can view activity logs" ON activity_logs 
  FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'admin' OR role = 'faculty')));

-- 2. Authenticated users can insert activity logs (so they can log their own actions)
DROP POLICY IF EXISTS "Authenticated users can insert activity logs" ON activity_logs;
CREATE POLICY "Authenticated users can insert activity logs" ON activity_logs 
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IS NOT NULL);
