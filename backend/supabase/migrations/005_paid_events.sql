-- Event settings
ALTER TABLE events ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT FALSE;
ALTER TABLE events ADD COLUMN IF NOT EXISTS price NUMERIC(10, 2) DEFAULT 0.00;
ALTER TABLE events ADD COLUMN IF NOT EXISTS upi_id TEXT DEFAULT 'serasevents@okaxis';
ALTER TABLE events ADD COLUMN IF NOT EXISTS participation_type TEXT DEFAULT 'Solo' CHECK (participation_type IN ('Solo', 'Team'));
ALTER TABLE events ADD COLUMN IF NOT EXISTS max_team_size INTEGER DEFAULT 1;

-- Registration tracking
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'free';
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS payment_id TEXT;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS team_name TEXT;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS team_members TEXT;
