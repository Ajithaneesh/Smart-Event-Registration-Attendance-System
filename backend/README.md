# SERAS Backend — Supabase

## Overview
The SERAS backend uses **Supabase** as a Backend-as-a-Service (BaaS), providing:
- **PostgreSQL Database** with Row Level Security (RLS)
- **Authentication** (Email + Password with OTP verification)
- **Realtime** subscriptions for live updates
- **Storage** for avatars and certificates
- **Edge Functions** for server-side logic (email sending, etc.)

## Project Configuration
- **Project URL**: `https://oisztvvklksoxbvmuqii.supabase.co`
- **Project Ref**: `oisztvvklksoxbvmuqii`

## Setup

### 1. Install Supabase CLI
```bash
npm install -g supabase
```

### 2. Login & Link
```bash
supabase login
supabase init
supabase link --project-ref oisztvvklksoxbvmuqii
```

### 3. Run Migrations
```bash
supabase db push
```

### 4. Seed Data (Optional)
```bash
supabase db seed
```

## Database Schema

### Tables
| Table | Description |
|-------|-------------|
| `profiles` | User profiles (extends auth.users) |
| `events` | Event listings |
| `event_faculty` | Faculty assigned to events |
| `registrations` | Student event registrations |
| `feedback` | Post-event ratings & comments |
| `reminders` | Smart reminder preferences |
| `messages` | Faculty-Participant messaging |
| `favorites` | Saved/bookmarked events |

### Row Level Security
All tables have RLS enabled with policies ensuring:
- Public data (events, faculty, profiles) is readable by everyone
- Users can only modify their own data
- Admin-only operations require `role = 'admin'` in profiles

## Directory Structure
```
backend/
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql    # Tables, indexes, RLS, triggers
│   ├── functions/                     # Edge Functions
│   │   └── send-ticket-email/
│   └── seed.sql                       # Sample data
└── README.md
```
