-- ═══════════════════════════════════════════════════════════════
-- SERAS Seed Data
-- Run after migration to populate sample events and faculty
-- ═══════════════════════════════════════════════════════════════

-- Note: Events are inserted without created_by since there's no admin user yet.
-- The admin user will be created through the app's auth flow.

INSERT INTO events (id, title, description, category, date, time, end_time, venue, image_url, featured, capacity, icon) VALUES
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Annual Tech Innovation Summit 2025', 'Join industry leaders and leading faculty for a full day of insights into the future of artificial intelligence, sustainable computing, and institutional networking architectures.', 'Tech', '2025-10-24', '09:00 AM', '05:00 PM', 'Main Auditorium, North Campus', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80', true, 300, NULL),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'Acoustic Evening Showcase', 'An evening of music and culture featuring talented student performers from across the campus. Enjoy acoustic sets, spoken word, and creative arts in a relaxed outdoor setting.', 'Cultural', '2025-11-02', '06:30 PM', '09:00 PM', 'Student Union Amphitheater', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80', false, 150, NULL),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'Inter-Departmental Basketball Finals', 'The culmination of the inter-departmental basketball season. Come cheer for your department as the top two teams battle it out for the championship trophy.', 'Sports', '2025-11-10', '04:00 PM', '07:00 PM', 'Campus Sports Complex', 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80', false, 500, NULL),
  ('a1b2c3d4-0004-4000-8000-000000000004', 'Cloud Computing Workshop', 'Hands-on workshop covering AWS, GCP, and Azure fundamentals. Deploy your first containerized application in the cloud by the end of this session.', 'Workshop', '2025-11-05', '10:00 AM', '01:00 PM', 'Virtual Session', NULL, false, 100, 'cloud'),
  ('a1b2c3d4-0005-4000-8000-000000000005', 'AI Ethics Seminar', 'A seminar on the ethical implications of large language models, algorithmic bias, and responsible AI development in institutional settings.', 'Seminar', '2025-11-12', '02:00 PM', '04:00 PM', 'Ethics Hall, Block A', NULL, false, 80, 'psychology'),
  ('a1b2c3d4-0006-4000-8000-000000000006', 'Hackathon 2025', 'A full-day hackathon where student teams design and build prototypes to solve real-world campus problems. Prizes for top 3 teams.', 'Tech', '2025-12-01', '08:00 AM', '08:00 PM', 'Main IT Lab', 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80', false, 200, 'terminal'),
  ('a1b2c3d4-0007-4000-8000-000000000007', 'Web3 Development Workshop', 'Learn the fundamentals of blockchain development, smart contracts with Solidity, and decentralized application architecture.', 'Workshop', '2025-11-15', '10:00 AM', '02:00 PM', 'Innovation Lab, Block C', 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80', false, 60, NULL);

-- Faculty for events
INSERT INTO event_faculty (event_id, faculty_name, faculty_role, department, email, phone, is_available, username, password) VALUES
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Dr. Sarah Chen', 'Head of AI Research', 'Computer Science', 'sarah.chen@college.edu', '+1-555-0101', true, 'sarah_chen', 'password123'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Prof. James Miller', 'Dean of Engineering', 'Engineering', 'j.miller@college.edu', '+1-555-0102', true, 'james_miller', 'password123'),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'Dr. Emily Ross', 'Cultural Committee Chair', 'Liberal Arts', 'e.ross@college.edu', '+1-555-0201', true, 'emily_ross', 'password123'),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'Coach Michael Davis', 'Athletic Director', 'Physical Education', 'm.davis@college.edu', '+1-555-0301', true, 'michael_davis', 'password123'),
  ('a1b2c3d4-0004-4000-8000-000000000004', 'Dr. Alex Kumar', 'Cloud Architecture Lead', 'Computer Science', 'a.kumar@college.edu', '+1-555-0401', true, 'alex_kumar', 'password123'),
  ('a1b2c3d4-0005-4000-8000-000000000005', 'Prof. Lisa Park', 'AI Ethics Researcher', 'Computer Science', 'l.park@college.edu', '+1-555-0501', true, 'lisa_park', 'password123'),
  ('a1b2c3d4-0006-4000-8000-000000000006', 'Dr. Sarah Chen', 'Head of AI Research', 'Computer Science', 'sarah.chen2@college.edu', '+1-555-0101', true, 'sarah_chen2', 'password123'),
  ('a1b2c3d4-0007-4000-8000-000000000007', 'Dr. Alex Kumar', 'Cloud Architecture Lead', 'Computer Science', 'a.kumar2@college.edu', '+1-555-0401', true, 'alex_kumar2', 'password123');

