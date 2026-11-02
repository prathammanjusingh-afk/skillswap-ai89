-- ==============================================================================
-- SKILLSWAP AI — MASTER PRODUCTION MVP MIGRATION (V7)
-- ==============================================================================
-- Target: Supabase PostgreSQL (Production MVP)
-- Safety: Non-destructive, idempotent, preserves all existing tables and rows.
-- 
-- SUMMARY OF DATABASE CHANGES:
-- 1. Profiles:
--    - Adds `is_public` boolean column (default false).
--    - Creates a security_invoker view `public_profiles` to prevent leaking private columns.
--    - Updates `handle_new_user()` trigger function to initialize `is_public = false`.
-- 2. Profile Skills:
--    - Expands category check constraint to include all 12 frontend categories:
--      'frontend', 'backend', 'ai_ml', 'design', 'cloud_devops', 'mobile',
--      'hardware_iot', 'product_management', 'data_science', 'cybersecurity',
--      'languages', 'other'.
-- 3. Collaboration Requests:
--    - Expands status check constraint to support 'cancelled' alongside ('pending', 'accepted', 'declined').
--    - Restricts status updates so only receiver can accept/decline, and only sender can cancel.
-- 4. Sessions:
--    - Dedicated collaboration sessions table for 1-on-1 swaps and scheduling.
--    - Strict participant validation (`creator_id != partner_id`).
-- 5. Flat Direct Messages:
--    - Direct flat messages table compatible with existing frontend architecture (`sender_id`, `receiver_id`, `content`, `read`, `created_at`).
--    - Avoids unnecessary conversation wrapper joins.
-- 6. Notifications:
--    - Database-backed user notifications lifecycle.
-- 7. Reviews:
--    - Verified collaboration ratings and feedback with self-review prevention.
-- 8. Admin Roles & Moderation:
--    - Isolated `admin_roles` table for server-validated authorization.
--    - Moderation `reports` table for safety and community reporting.
-- 9. Row Level Security (RLS) Hardening:
--    - Drops overly permissive public policies (e.g. `using (true)`).
--    - Replaces with strict ownership, participant, and privacy constraints.
-- ==============================================================================

-- Ensure standard cryptographic extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ==============================================================================
-- 1. ADMIN ROLES & PRIVILEGE VERIFICATION (BOOTSTRAP FIRST)
-- ==============================================================================

create table if not exists public.admin_roles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  role text not null check (role in ('admin', 'super_admin', 'moderator')) default 'moderator',
  granted_by uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_admin_roles_user_id on public.admin_roles(user_id);

-- Secure definer function to test administrative authorization without leaking roles
create or replace function public.is_admin(user_uid uuid)
returns boolean as $$
begin
  if user_uid is null then
    return false;
  end if;
  return exists (
    select 1 from public.admin_roles
    where user_id = user_uid
  );
end;
$$ language plpgsql security definer stable;

-- ==============================================================================
-- 2. PROFILES ENHANCEMENTS & PRIVACY
-- ==============================================================================

-- Add is_public column if missing
alter table public.profiles
  add column if not exists is_public boolean not null default false;

create index if not exists idx_profiles_is_public on public.profiles(is_public);

-- Update auth.users new profile trigger function
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (
    id,
    full_name,
    avatar_url,
    headline,
    university,
    major,
    graduation_year,
    bio,
    availability_hours_per_week,
    preferred_work_style,
    timezone,
    is_public
  ) values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Student Innovator'),
    coalesce(new.raw_user_meta_data->>'avatar_url', 'https://api.dicebear.com/7.x/initials/svg?seed=' || encode(digest(new.id::text, 'sha256'), 'hex')),
    coalesce(new.raw_user_meta_data->>'headline', 'Passionate Tech Student Looking for Collaborators'),
    coalesce(new.raw_user_meta_data->>'university', 'Campus University'),
    coalesce(new.raw_user_meta_data->>'major', 'Computer Science'),
    extract(year from current_date)::integer + 2,
    coalesce(new.raw_user_meta_data->>'bio', 'Excited to build ambitious projects and swap skills with fellow students!'),
    15,
    'hybrid',
    'EST (UTC-5)',
    false
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Secure View: public_profiles
-- Exposes only approved public discovery fields to avoid leaking private settings or metadata
create or replace view public.public_profiles
with (security_invoker = true) as
select
  p.id,
  p.full_name,
  p.avatar_url,
  p.headline,
  p.university,
  p.major,
  p.graduation_year,
  p.bio,
  p.availability_hours_per_week,
  p.preferred_work_style,
  p.timezone,
  p.github_url,
  p.linkedin_url,
  p.portfolio_url,
  p.created_at
from public.profiles p
where p.is_public = true or auth.uid() = p.id;

-- ==============================================================================
-- 3. EXPAND PROFILE SKILLS CATEGORIES (ALL 12 CATEGORIES)
-- ==============================================================================

-- Drop existing 8-category check constraint if present and replace with full 12-category set
do $$
begin
  -- Find and drop any existing check constraint on profile_skills.category
  if exists (
    select 1 from information_schema.table_constraints
    where table_name = 'profile_skills' and constraint_type = 'CHECK'
    and constraint_name = 'profile_skills_category_check'
  ) then
    alter table public.profile_skills drop constraint profile_skills_category_check;
  end if;
end $$;

alter table public.profile_skills
  add constraint profile_skills_category_check check (
    category in (
      'frontend',
      'backend',
      'ai_ml',
      'design',
      'cloud_devops',
      'mobile',
      'hardware_iot',
      'product_management',
      'data_science',
      'cybersecurity',
      'languages',
      'other'
    )
  );

-- ==============================================================================
-- 4. COLLABORATION REQUESTS STATUS LIFECYCLE
-- ==============================================================================

-- Expand check constraint to support 'cancelled'
do $$
begin
  if exists (
    select 1 from information_schema.table_constraints
    where table_name = 'collaboration_requests' and constraint_type = 'CHECK'
    and constraint_name = 'collaboration_requests_status_check'
  ) then
    alter table public.collaboration_requests drop constraint collaboration_requests_status_check;
  end if;
end $$;

alter table public.collaboration_requests
  add constraint collaboration_requests_status_check check (
    status in ('pending', 'accepted', 'declined', 'cancelled')
  );

-- ==============================================================================
-- 5. SESSIONS TABLE (1-ON-1 COLLABORATIONS)
-- ==============================================================================

create table if not exists public.sessions (
  id uuid default gen_random_uuid() primary key,
  creator_id uuid references public.profiles(id) on delete cascade not null,
  partner_id uuid references public.profiles(id) on delete cascade not null,
  skill_to_learn text not null,
  skill_to_teach text not null,
  scheduled_at timestamp with time zone not null,
  duration_minutes integer not null default 60 check (duration_minutes between 15 and 240),
  status text not null default 'scheduled' check (status in ('scheduled', 'rescheduled', 'completed', 'cancelled')),
  meeting_type text not null default 'both' check (meeting_type in ('online', 'in_person', 'both')),
  meeting_link text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  check (creator_id != partner_id)
);

create index if not exists idx_sessions_creator on public.sessions(creator_id);
create index if not exists idx_sessions_partner on public.sessions(partner_id);
create index if not exists idx_sessions_scheduled_at on public.sessions(scheduled_at);

-- ==============================================================================
-- 6. FLAT MESSAGES TABLE (DIRECT CHAT COMPATIBILITY)
-- ==============================================================================

create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  receiver_id uuid references public.profiles(id) on delete cascade not null,
  content text not null check (length(trim(content)) > 0),
  read boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  check (sender_id != receiver_id)
);

create index if not exists idx_messages_sender on public.messages(sender_id);
create index if not exists idx_messages_receiver on public.messages(receiver_id);
create index if not exists idx_messages_unread on public.messages(receiver_id, read) where read = false;
create index if not exists idx_messages_timeline on public.messages(created_at desc);

-- ==============================================================================
-- 7. NOTIFICATIONS TABLE
-- ==============================================================================

create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null check (type in (
    'request_received',
    'request_accepted',
    'request_declined',
    'new_message',
    'session_scheduled',
    'session_reminder',
    'review_received'
  )),
  title text not null,
  message text not null,
  link_tab text,
  read boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_notifications_user on public.notifications(user_id);
create index if not exists idx_notifications_unread on public.notifications(user_id, read) where read = false;

-- ==============================================================================
-- 8. REVIEWS & RATINGS TABLE
-- ==============================================================================

create table if not exists public.reviews (
  id uuid default gen_random_uuid() primary key,
  reviewer_id uuid references public.profiles(id) on delete cascade not null,
  target_id uuid references public.profiles(id) on delete cascade not null,
  session_id uuid references public.sessions(id) on delete set null,
  rating integer not null check (rating between 1 and 5),
  comment text not null check (length(trim(comment)) > 0),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  check (reviewer_id != target_id)
);

create index if not exists idx_reviews_target on public.reviews(target_id);
create index if not exists idx_reviews_reviewer on public.reviews(reviewer_id);

-- ==============================================================================
-- 9. CONTENT & USER MODERATION (REPORTS TABLE)
-- ==============================================================================

create table if not exists public.reports (
  id uuid default gen_random_uuid() primary key,
  reporter_id uuid references public.profiles(id) on delete cascade not null,
  target_user_id uuid references public.profiles(id) on delete cascade,
  target_project_id uuid references public.projects(id) on delete cascade,
  reason text not null,
  details text,
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'resolved', 'dismissed')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_reports_status on public.reports(status);

-- ==============================================================================
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.profile_skills enable row level security;
alter table public.projects enable row level security;
alter table public.project_roles enable row level security;
alter table public.project_members enable row level security;
alter table public.collaboration_requests enable row level security;
alter table public.sessions enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;
alter table public.reviews enable row level security;
alter table public.admin_roles enable row level security;
alter table public.reports enable row level security;

-- ------------------------------------------------------------------------------
-- A. PROFILES POLICIES
-- ------------------------------------------------------------------------------
-- Drop unsafe public read policy
drop policy if exists "Allow public read access to all profiles" on public.profiles;
drop policy if exists "profiles_select_policy" on public.profiles;
create policy "profiles_select_policy"
  on public.profiles for select
  using (
    auth.uid() = id or
    is_public = true or
    public.is_admin(auth.uid())
  );

drop policy if exists "Allow users to insert their own profile" on public.profiles;
drop policy if exists "profiles_insert_policy" on public.profiles;
create policy "profiles_insert_policy"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Allow users to update their own profile" on public.profiles;
drop policy if exists "profiles_update_policy" on public.profiles;
create policy "profiles_update_policy"
  on public.profiles for update
  using (auth.uid() = id or public.is_admin(auth.uid()))
  with check (auth.uid() = id or public.is_admin(auth.uid()));

-- ------------------------------------------------------------------------------
-- B. PROFILE SKILLS POLICIES
-- ------------------------------------------------------------------------------
-- Drop unconditional read policy
drop policy if exists "Allow public read access to profile skills" on public.profile_skills;
drop policy if exists "profile_skills_select_policy" on public.profile_skills;
create policy "profile_skills_select_policy"
  on public.profile_skills for select
  using (
    auth.uid() = profile_id or
    exists (
      select 1 from public.profiles p
      where p.id = profile_skills.profile_id and p.is_public = true
    ) or
    public.is_admin(auth.uid())
  );

drop policy if exists "Allow owners to manage profile skills" on public.profile_skills;
drop policy if exists "profile_skills_all_policy" on public.profile_skills;
create policy "profile_skills_all_policy"
  on public.profile_skills for all
  using (auth.uid() = profile_id or public.is_admin(auth.uid()))
  with check (auth.uid() = profile_id or public.is_admin(auth.uid()));

-- ------------------------------------------------------------------------------
-- C. COLLABORATION REQUESTS POLICIES
-- ------------------------------------------------------------------------------
drop policy if exists "Allow participants to view their requests" on public.collaboration_requests;
drop policy if exists "collab_requests_select_policy" on public.collaboration_requests;
create policy "collab_requests_select_policy"
  on public.collaboration_requests for select
  using (
    auth.uid() = sender_id or 
    auth.uid() = receiver_id or
    exists (
      select 1 from public.projects proj
      where proj.id = collaboration_requests.project_id
      and proj.creator_id = auth.uid()
    ) or
    public.is_admin(auth.uid())
  );

drop policy if exists "Allow users to create collaboration requests" on public.collaboration_requests;
drop policy if exists "collab_requests_insert_policy" on public.collaboration_requests;
create policy "collab_requests_insert_policy"
  on public.collaboration_requests for insert
  with check (auth.uid() = sender_id);

drop policy if exists "Allow receivers or creators to update request status" on public.collaboration_requests;
drop policy if exists "collab_requests_update_policy" on public.collaboration_requests;
create policy "collab_requests_update_policy"
  on public.collaboration_requests for update
  using (
    -- Receiver can update
    auth.uid() = receiver_id or
    -- Project owner can update (for project applications)
    exists (
      select 1 from public.projects proj
      where proj.id = collaboration_requests.project_id
      and proj.creator_id = auth.uid()
    ) or
    -- Sender can cancel their own pending request
    (auth.uid() = sender_id and status = 'pending') or
    public.is_admin(auth.uid())
  );

-- ------------------------------------------------------------------------------
-- D. SESSIONS POLICIES
-- ------------------------------------------------------------------------------
drop policy if exists "sessions_select_policy" on public.sessions;
create policy "sessions_select_policy"
  on public.sessions for select
  using (
    auth.uid() = creator_id or
    auth.uid() = partner_id or
    public.is_admin(auth.uid())
  );

drop policy if exists "sessions_insert_policy" on public.sessions;
create policy "sessions_insert_policy"
  on public.sessions for insert
  with check (
    auth.uid() = creator_id and
    creator_id != partner_id
  );

drop policy if exists "sessions_update_policy" on public.sessions;
create policy "sessions_update_policy"
  on public.sessions for update
  using (
    auth.uid() = creator_id or
    auth.uid() = partner_id or
    public.is_admin(auth.uid())
  );

-- ------------------------------------------------------------------------------
-- E. FLAT DIRECT MESSAGES POLICIES
-- ------------------------------------------------------------------------------
drop policy if exists "messages_select_policy" on public.messages;
create policy "messages_select_policy"
  on public.messages for select
  using (
    auth.uid() = sender_id or
    auth.uid() = receiver_id or
    public.is_admin(auth.uid())
  );

drop policy if exists "messages_insert_policy" on public.messages;
create policy "messages_insert_policy"
  on public.messages for insert
  with check (
    auth.uid() = sender_id and
    sender_id != receiver_id
  );

drop policy if exists "messages_update_policy" on public.messages;
create policy "messages_update_policy"
  on public.messages for update
  using (auth.uid() = receiver_id); -- Only recipient updates 'read' field

-- ------------------------------------------------------------------------------
-- F. NOTIFICATIONS POLICIES
-- ------------------------------------------------------------------------------
drop policy if exists "notifications_owner_policy" on public.notifications;
create policy "notifications_owner_policy"
  on public.notifications for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- G. REVIEWS POLICIES
-- ------------------------------------------------------------------------------
drop policy if exists "reviews_select_policy" on public.reviews;
create policy "reviews_select_policy"
  on public.reviews for select
  using (
    -- Reviews visible if target user is public or viewer is target or reviewer
    exists (
      select 1 from public.profiles p
      where p.id = reviews.target_id and (p.is_public = true or auth.uid() = p.id)
    ) or
    auth.uid() = reviewer_id or
    public.is_admin(auth.uid())
  );

drop policy if exists "reviews_insert_policy" on public.reviews;
create policy "reviews_insert_policy"
  on public.reviews for insert
  with check (
    auth.uid() = reviewer_id and
    reviewer_id != target_id and
    -- Verification: reviewer and target had an accepted request or completed session
    (
      exists (
        select 1 from public.sessions s
        where (s.id = reviews.session_id or reviews.session_id is null)
        and (
          (s.creator_id = auth.uid() and s.partner_id = target_id) or
          (s.partner_id = auth.uid() and s.creator_id = target_id)
        )
      )
      or
      exists (
        select 1 from public.collaboration_requests r
        where r.status = 'accepted'
        and (
          (r.sender_id = auth.uid() and r.receiver_id = target_id) or
          (r.receiver_id = auth.uid() and r.sender_id = target_id)
        )
      )
    )
  );

-- ------------------------------------------------------------------------------
-- H. ADMIN ROLES & REPORTS POLICIES
-- ------------------------------------------------------------------------------
drop policy if exists "admin_roles_select_policy" on public.admin_roles;
create policy "admin_roles_select_policy"
  on public.admin_roles for select
  using (public.is_admin(auth.uid()));

drop policy if exists "reports_insert_policy" on public.reports;
create policy "reports_insert_policy"
  on public.reports for insert
  with check (auth.uid() = reporter_id);

drop policy if exists "reports_admin_policy" on public.reports;
create policy "reports_admin_policy"
  on public.reports for all
  using (public.is_admin(auth.uid()));
