-- Additional Tables and Columns for SERAS

-- 1. Create missing tables
CREATE TABLE IF NOT EXISTS form_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  field_type TEXT NOT NULL CHECK (field_type IN ('text', 'number', 'email', 'select', 'radio', 'checkbox', 'textarea', 'file')),
  is_required BOOLEAN DEFAULT TRUE,
  options JSONB,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS registration_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID REFERENCES registrations(id) ON DELETE CASCADE,
  field_id UUID REFERENCES form_fields(id) ON DELETE CASCADE,
  response_value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  certificate_url TEXT NOT NULL,
  issued_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add columns to events
ALTER TABLE events ADD COLUMN IF NOT EXISTS registration_open BOOLEAN DEFAULT TRUE;
ALTER TABLE events ADD COLUMN IF NOT EXISTS registration_deadline TIMESTAMPTZ;
ALTER TABLE events ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'cancelled', 'completed'));

-- Update existing events to have status 'published'
UPDATE events SET status = 'published' WHERE status IS NULL;

-- 3. Enable RLS and add policies
ALTER TABLE form_fields ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Form fields are viewable by everyone" ON form_fields;
CREATE POLICY "Form fields are viewable by everyone" ON form_fields FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can manage form fields" ON form_fields;
CREATE POLICY "Admins can manage form fields" ON form_fields FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

ALTER TABLE registration_responses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own responses" ON registration_responses;
CREATE POLICY "Users can view own responses" ON registration_responses FOR SELECT USING (EXISTS (SELECT 1 FROM registrations WHERE id = registration_id AND (user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))));
DROP POLICY IF EXISTS "Users can insert own responses" ON registration_responses;
CREATE POLICY "Users can insert own responses" ON registration_responses FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM registrations WHERE id = registration_id AND user_id = auth.uid()));

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Announcements are viewable by everyone" ON announcements;
CREATE POLICY "Announcements are viewable by everyone" ON announcements FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins and Faculty can manage announcements" ON announcements;
CREATE POLICY "Admins and Faculty can manage announcements" ON announcements FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'admin' OR role = 'faculty')));

ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own certificates" ON certificates;
CREATE POLICY "Users can view own certificates" ON certificates FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins can manage certificates" ON certificates;
CREATE POLICY "Admins can manage certificates" ON certificates FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
