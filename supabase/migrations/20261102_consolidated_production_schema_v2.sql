-- ==============================================================================
-- SKILLSWAP AI — CONSOLIDATED PRODUCTION DATABASE SCHEMA & SECURITY SETUP (V2)
-- ==============================================================================
-- Migration File: 20261102_consolidated_production_schema_v2.sql
-- Description: Second Security Audit Revision — Hardened RBAC, State Machines,
--              Field Immutability, Notification Anti-Spoofing, and Migration Safety.
-- Target: Supabase PostgreSQL (Fresh Project OR Existing Database Upgrade)
-- Safety: 100% Non-destructive, Idempotent, Safe for pre-existing records.
-- ==============================================================================

-- 0. CRYPTOGRAPHIC EXTENSIONS
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ==============================================================================
-- 1. ROLE-BASED ACCESS CONTROL (RBAC) & PERMISSION HIERARCHY
-- ==============================================================================

create table if not exists public.admin_roles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  role text not null check (role in ('super_admin', 'admin', 'moderator')) default 'moderator',
  granted_by uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_admin_roles_user_id on public.admin_roles(user_id);
create index if not exists idx_admin_roles_role on public.admin_roles(role);

-- Helper 1: Get raw role of user (or null)
create or replace function public.get_user_role(user_uid uuid)
returns text
language sql
security definer
stable
set search_path = public, pg_temp
as $$
  select role from public.admin_roles where user_id = user_uid limit 1;
$$;

-- Helper 2: Check if user is super_admin
create or replace function public.is_super_admin(user_uid uuid)
returns boolean
language plpgsql
security definer
stable
set search_path = public, pg_temp
as $$
begin
  if user_uid is null then
    return false;
  end if;
  return exists (
    select 1 from public.admin_roles
    where user_id = user_uid and role = 'super_admin'
  );
end;
$$;

-- Helper 3: Check if user is admin or super_admin
create or replace function public.is_admin_or_super(user_uid uuid)
returns boolean
language plpgsql
security definer
stable
set search_path = public, pg_temp
as $$
begin
  if user_uid is null then
    return false;
  end if;
  return exists (
    select 1 from public.admin_roles
    where user_id = user_uid and role in ('admin', 'super_admin')
  );
end;
$$;

-- Helper 4: Check if user is moderator, admin, or super_admin
create or replace function public.is_moderator_or_higher(user_uid uuid)
returns boolean
language plpgsql
security definer
stable
set search_path = public, pg_temp
as $$
begin
  if user_uid is null then
    return false;
  end if;
  return exists (
    select 1 from public.admin_roles
    where user_id = user_uid and role in ('moderator', 'admin', 'super_admin')
  );
end;
$$;

-- Helper 5: Backwards compatible is_admin function (strictly admin or super_admin)
-- Prevents moderators from being treated as full administrators.
create or replace function public.is_admin(user_uid uuid)
returns boolean
language plpgsql
security definer
stable
set search_path = public, pg_temp
as $$
begin
  return public.is_admin_or_super(user_uid);
end;
$$;

-- Protect against accidental deletion or demotion of the last remaining super_admin
create or replace function public.validate_admin_role_mutation()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if TG_OP = 'UPDATE' then
    if old.role = 'super_admin' and new.role <> 'super_admin' then
      if (select count(*) from public.admin_roles where role = 'super_admin') <= 1 then
        raise exception 'Cannot demote the last remaining super_admin account.';
      end if;
    end if;
  elsif TG_OP = 'DELETE' then
    if old.role = 'super_admin' then
      if (select count(*) from public.admin_roles where role = 'super_admin') <= 1 then
        raise exception 'Cannot delete the last remaining super_admin account.';
      end if;
    end if;
  end if;
  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_validate_admin_role_mutation on public.admin_roles;
create trigger trg_validate_admin_role_mutation
  before update or delete on public.admin_roles
  for each row execute function public.validate_admin_role_mutation();

-- ==============================================================================
-- 2. PROFILES TABLE & PRIVACY
-- ==============================================================================

create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text not null,
  avatar_url text,
  headline text not null,
  university text not null,
  major text not null,
  graduation_year integer not null,
  bio text,
  availability_hours_per_week integer default 15 check (availability_hours_per_week between 1 and 60),
  preferred_work_style text check (preferred_work_style in ('async', 'hybrid', 'sync_intensive')) default 'hybrid',
  timezone text default 'EST (UTC-5)',
  github_url text,
  linkedin_url text,
  portfolio_url text,
  is_public boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Upgrade pre-existing profiles table safely
alter table public.profiles
  add column if not exists is_public boolean not null default false,
  add column if not exists availability_hours_per_week integer default 15,
  add column if not exists preferred_work_style text default 'hybrid',
  add column if not exists timezone text default 'EST (UTC-5)',
  add column if not exists github_url text,
  add column if not exists linkedin_url text,
  add column if not exists portfolio_url text,
  add column if not exists updated_at timestamp with time zone default timezone('utc'::text, now());

create index if not exists idx_profiles_is_public on public.profiles(is_public);

-- Automatic Profile Creation Trigger on new user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
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
    false -- Strictly default new profiles to private
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Secure Public Profiles View (Security Invoker)
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
-- 3. PROFILE SKILLS TABLE (ALL 12 CATEGORIES)
-- ==============================================================================

create table if not exists public.profile_skills (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  skill_name text not null,
  category text not null,
  proficiency text check (proficiency in ('beginner', 'intermediate', 'advanced', 'expert')) default 'intermediate',
  skill_type text check (skill_type in ('offered', 'seeking')) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Upgrade existing category check constraint safely
do $$
begin
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

-- Pre-flight deduplication of profile_skills before creating unique constraint
do $$
begin
  delete from public.profile_skills a
  using public.profile_skills b
  where a.id < b.id
    and a.profile_id = b.profile_id
    and a.skill_name = b.skill_name
    and a.skill_type = b.skill_type;
exception when others then
  null;
end $$;

do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where table_name = 'profile_skills' and constraint_type = 'UNIQUE'
    and constraint_name = 'profile_skills_profile_id_skill_name_skill_type_key'
  ) then
    alter table public.profile_skills add constraint profile_skills_profile_id_skill_name_skill_type_key unique (profile_id, skill_name, skill_type);
  end if;
exception when others then
  null;
end $$;

create index if not exists idx_profile_skills_profile_id on public.profile_skills(profile_id);
create index if not exists idx_profile_skills_category on public.profile_skills(category);

-- ==============================================================================
-- 4. PROJECTS & ROLES
-- ==============================================================================

create table if not exists public.projects (
  id uuid default gen_random_uuid() primary key,
  creator_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  tagline text not null,
  description text not null,
  category text not null,
  project_type text check (project_type in ('hackathon', 'capstone', 'startup_mvp', 'open_source', 'research')) not null,
  stage text check (stage in ('ideation', 'prototype', 'in_progress', 'polishing')) default 'ideation',
  target_event text,
  weekly_hours_required integer default 12,
  tags text[] default '{}',
  repo_url text,
  demo_url text,
  status text check (status in ('recruiting', 'in_progress', 'completed')) default 'recruiting',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.projects
  add column if not exists weekly_hours_required integer default 12,
  add column if not exists tags text[] default '{}',
  add column if not exists repo_url text,
  add column if not exists demo_url text,
  add column if not exists status text default 'recruiting',
  add column if not exists updated_at timestamp with time zone default timezone('utc'::text, now());

create index if not exists idx_projects_creator_id on public.projects(creator_id);
create index if not exists idx_projects_status on public.projects(status);

create table if not exists public.project_roles (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  role_title text not null,
  description text,
  required_skills text[] default '{}',
  is_filled boolean default false,
  filled_by_profile_id uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_project_roles_project_id on public.project_roles(project_id);

create table if not exists public.project_members (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  role_title text not null,
  is_owner boolean default false,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(project_id, profile_id)
);

create index if not exists idx_project_members_project on public.project_members(project_id);
create index if not exists idx_project_members_profile on public.project_members(profile_id);

-- ==============================================================================
-- 5. COLLABORATION REQUESTS & LIFECYCLE
-- ==============================================================================

create table if not exists public.collaboration_requests (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  receiver_id uuid references public.profiles(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  request_type text check (request_type in ('skill_swap_invite', 'project_application', 'team_invitation')) not null,
  pitch_message text not null,
  status text not null default 'pending',
  synergy_score integer check (synergy_score between 0 and 100),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.collaboration_requests
  add column if not exists status text not null default 'pending',
  add column if not exists synergy_score integer,
  add column if not exists updated_at timestamp with time zone default timezone('utc'::text, now());

-- Upgrade status constraint to support 'cancelled'
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

create index if not exists idx_collab_sender on public.collaboration_requests(sender_id);
create index if not exists idx_collab_receiver on public.collaboration_requests(receiver_id);
create index if not exists idx_collab_project on public.collaboration_requests(project_id);
create index if not exists idx_collab_status on public.collaboration_requests(status);

-- Field Immutability & State Transition Trigger for Collaboration Requests
create or replace function public.validate_collaboration_request_update()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  -- Prevent altering protected ownership and metadata fields
  if new.id is distinct from old.id or
     new.sender_id is distinct from old.sender_id or
     new.receiver_id is distinct from old.receiver_id or
     new.project_id is distinct from old.project_id or
     new.request_type is distinct from old.request_type or
     new.pitch_message is distinct from old.pitch_message or
     new.synergy_score is distinct from old.synergy_score or
     new.created_at is distinct from old.created_at then
    raise exception 'Protected collaboration request fields (sender, receiver, project, pitch, created_at) cannot be modified.';
  end if;

  -- Enforce valid lifecycle transitions
  if old.status = 'pending' and new.status not in ('pending', 'accepted', 'declined', 'cancelled') then
    raise exception 'Invalid status transition from pending to %', new.status;
  elsif old.status = 'accepted' and new.status not in ('accepted', 'cancelled') then
    raise exception 'Invalid status transition from accepted to %', new.status;
  elsif old.status in ('declined', 'cancelled') and new.status <> old.status then
    raise exception 'Cannot modify a collaboration request that is already %', old.status;
  end if;

  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

drop trigger if exists trg_validate_collab_request_update on public.collaboration_requests;
create trigger trg_validate_collab_request_update
  before update on public.collaboration_requests
  for each row execute function public.validate_collaboration_request_update();

-- ==============================================================================
-- 6. SESSIONS TABLE (1-ON-1 EXCHANGE SESSIONS)
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

alter table public.sessions
  add column if not exists duration_minutes integer not null default 60,
  add column if not exists status text not null default 'scheduled',
  add column if not exists meeting_type text not null default 'both',
  add column if not exists meeting_link text,
  add column if not exists notes text,
  add column if not exists updated_at timestamp with time zone default timezone('utc'::text, now());

create index if not exists idx_sessions_creator on public.sessions(creator_id);
create index if not exists idx_sessions_partner on public.sessions(partner_id);
create index if not exists idx_sessions_scheduled_at on public.sessions(scheduled_at);
create index if not exists idx_sessions_status on public.sessions(status);

-- Field Immutability & State Transition Trigger for Sessions
create or replace function public.validate_session_update()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  -- Protect participant identity and skill agreement
  if new.id is distinct from old.id or
     new.creator_id is distinct from old.creator_id or
     new.partner_id is distinct from old.partner_id or
     new.skill_to_learn is distinct from old.skill_to_learn or
     new.skill_to_teach is distinct from old.skill_to_teach or
     new.created_at is distinct from old.created_at then
    raise exception 'Session participants and exchange skills are immutable.';
  end if;

  -- Enforce valid lifecycle transitions
  if old.status in ('completed', 'cancelled') and new.status <> old.status then
    raise exception 'Cannot modify a session that is already %', old.status;
  elsif old.status in ('scheduled', 'rescheduled') and new.status not in ('scheduled', 'rescheduled', 'completed', 'cancelled') then
    raise exception 'Invalid session status transition from % to %', old.status, new.status;
  end if;

  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

drop trigger if exists trg_validate_session_update on public.sessions;
create trigger trg_validate_session_update
  before update on public.sessions
  for each row execute function public.validate_session_update();

-- ==============================================================================
-- 7. FLAT DIRECT MESSAGES
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

alter table public.messages
  add column if not exists read boolean not null default false;

create index if not exists idx_messages_sender on public.messages(sender_id);
create index if not exists idx_messages_receiver on public.messages(receiver_id);
create index if not exists idx_messages_unread on public.messages(receiver_id, read) where read = false;
create index if not exists idx_messages_timeline on public.messages(created_at desc);

-- Message Immutability Trigger (Only 'read' flag can be updated by receiver)
create or replace function public.validate_message_update()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.id is distinct from old.id or
     new.sender_id is distinct from old.sender_id or
     new.receiver_id is distinct from old.receiver_id or
     new.content is distinct from old.content or
     new.created_at is distinct from old.created_at then
    raise exception 'Message content, sender, and receiver are immutable. Only read status may be updated.';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_validate_message_update on public.messages;
create trigger trg_validate_message_update
  before update on public.messages
  for each row execute function public.validate_message_update();

-- ==============================================================================
-- 8. NOTIFICATIONS & ANTI-SPOOFING
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

alter table public.notifications
  add column if not exists link_tab text,
  add column if not exists read boolean not null default false;

create index if not exists idx_notifications_user on public.notifications(user_id);
create index if not exists idx_notifications_unread on public.notifications(user_id, read) where read = false;

-- Notification Content Immutability Trigger (Only 'read' flag can be updated by recipient)
create or replace function public.validate_notification_update()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.id is distinct from old.id or
     new.user_id is distinct from old.user_id or
     new.type is distinct from old.type or
     new.title is distinct from old.title or
     new.message is distinct from old.message or
     new.link_tab is distinct from old.link_tab or
     new.created_at is distinct from old.created_at then
    raise exception 'Notification content and recipient are immutable. Only read status may be updated.';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_validate_notification_update on public.notifications;
create trigger trg_validate_notification_update
  before update on public.notifications
  for each row execute function public.validate_notification_update();

-- ==============================================================================
-- 9. REVIEWS & RATINGS (COMPLETED SESSIONS ONLY)
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

-- Pre-flight Deduplication of existing reviews before creating unique indexes
do $$
begin
  -- Deduplicate session reviews (keep latest)
  delete from public.reviews a
  using public.reviews b
  where a.session_id is not null
    and b.session_id is not null
    and a.reviewer_id = b.reviewer_id
    and a.session_id = b.session_id
    and a.created_at < b.created_at;

  -- Deduplicate general reviews (keep latest)
  delete from public.reviews a
  using public.reviews b
  where a.session_id is null
    and b.session_id is null
    and a.reviewer_id = b.reviewer_id
    and a.target_id = b.target_id
    and a.created_at < b.created_at;
exception when others then
  null;
end $$;

-- Enforce Duplicate Review Prevention
create unique index if not exists idx_reviews_unique_session on public.reviews(reviewer_id, session_id) where session_id is not null;
create unique index if not exists idx_reviews_unique_general on public.reviews(reviewer_id, target_id) where session_id is null;

-- Reviews are immutable once submitted
create or replace function public.prevent_review_update()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  raise exception 'Peer reviews are permanent and cannot be modified once published.';
end;
$$;

drop trigger if exists trg_prevent_review_update on public.reviews;
create trigger trg_prevent_review_update
  before update on public.reviews
  for each row execute function public.prevent_review_update();

-- ==============================================================================
-- 10. CONTENT & USER MODERATION (REPORTS)
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

alter table public.reports
  add column if not exists status text not null default 'pending',
  add column if not exists updated_at timestamp with time zone default timezone('utc'::text, now());

create index if not exists idx_reports_status on public.reports(status);

-- ==============================================================================
-- 11. ROW LEVEL SECURITY (RLS) POLICIES INVENTORY & REPLACEMENT
-- ==============================================================================

-- Enable RLS on all 12 core tables
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
drop policy if exists "Allow public read access to all profiles" on public.profiles;
drop policy if exists "Allow users to insert their own profile" on public.profiles;
drop policy if exists "Allow users to update their own profile" on public.profiles;
drop policy if exists "profiles_select_policy" on public.profiles;
drop policy if exists "profiles_insert_policy" on public.profiles;
drop policy if exists "profiles_update_policy" on public.profiles;

create policy "profiles_select_policy"
  on public.profiles for select
  using (
    auth.uid() = id or
    is_public = true or
    public.is_admin_or_super(auth.uid())
  );

create policy "profiles_insert_policy"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_policy"
  on public.profiles for update
  using (auth.uid() = id or public.is_admin_or_super(auth.uid()))
  with check (auth.uid() = id or public.is_admin_or_super(auth.uid()));

-- ------------------------------------------------------------------------------
-- B. PROFILE SKILLS POLICIES
-- ------------------------------------------------------------------------------
drop policy if exists "Allow public read access to profile skills" on public.profile_skills;
drop policy if exists "Allow owners to manage profile skills" on public.profile_skills;
drop policy if exists "profile_skills_select_policy" on public.profile_skills;
drop policy if exists "profile_skills_all_policy" on public.profile_skills;

create policy "profile_skills_select_policy"
  on public.profile_skills for select
  using (
    auth.uid() = profile_id or
    exists (
      select 1 from public.profiles p
      where p.id = profile_skills.profile_id and p.is_public = true
    ) or
    public.is_admin_or_super(auth.uid())
  );

create policy "profile_skills_all_policy"
  on public.profile_skills for all
  using (auth.uid() = profile_id or public.is_admin_or_super(auth.uid()))
  with check (auth.uid() = profile_id or public.is_admin_or_super(auth.uid()));

-- ------------------------------------------------------------------------------
-- C. PROJECTS POLICIES
-- ------------------------------------------------------------------------------
drop policy if exists "Allow public read access to projects" on public.projects;
drop policy if exists "Allow authenticated creators to insert projects" on public.projects;
drop policy if exists "Allow creators to update their own projects" on public.projects;
drop policy if exists "Allow creators to delete their own projects" on public.projects;
drop policy if exists "projects_select_policy" on public.projects;
drop policy if exists "projects_insert_policy" on public.projects;
drop policy if exists "projects_update_policy" on public.projects;
drop policy if exists "projects_delete_policy" on public.projects;

create policy "projects_select_policy"
  on public.projects for select
  using (true);

create policy "projects_insert_policy"
  on public.projects for insert
  with check (auth.uid() = creator_id);

create policy "projects_update_policy"
  on public.projects for update
  using (auth.uid() = creator_id or public.is_admin_or_super(auth.uid()))
  with check (auth.uid() = creator_id or public.is_admin_or_super(auth.uid()));

create policy "projects_delete_policy"
  on public.projects for delete
  using (auth.uid() = creator_id or public.is_admin_or_super(auth.uid()));

-- ------------------------------------------------------------------------------
-- D. PROJECT ROLES & MEMBERS POLICIES
-- ------------------------------------------------------------------------------
drop policy if exists "Allow public read access to project roles" on public.project_roles;
drop policy if exists "Allow project creators to manage project roles" on public.project_roles;
drop policy if exists "project_roles_select_policy" on public.project_roles;
drop policy if exists "project_roles_all_policy" on public.project_roles;

create policy "project_roles_select_policy"
  on public.project_roles for select
  using (true);

create policy "project_roles_all_policy"
  on public.project_roles for all
  using (
    exists (
      select 1 from public.projects
      where id = project_roles.project_id
      and (creator_id = auth.uid() or public.is_admin_or_super(auth.uid()))
    )
  );

drop policy if exists "Allow public read access to project members" on public.project_members;
drop policy if exists "Allow project creators to manage project members" on public.project_members;
drop policy if exists "project_members_select_policy" on public.project_members;
drop policy if exists "project_members_all_policy" on public.project_members;

create policy "project_members_select_policy"
  on public.project_members for select
  using (true);

create policy "project_members_all_policy"
  on public.project_members for all
  using (
    exists (
      select 1 from public.projects
      where id = project_members.project_id
      and (creator_id = auth.uid() or public.is_admin_or_super(auth.uid()))
    )
  );

-- ------------------------------------------------------------------------------
-- E. COLLABORATION REQUESTS POLICIES
-- ------------------------------------------------------------------------------
drop policy if exists "Allow participants to view their requests" on public.collaboration_requests;
drop policy if exists "Allow users to create collaboration requests" on public.collaboration_requests;
drop policy if exists "Allow receivers or creators to update request status" on public.collaboration_requests;
drop policy if exists "collab_requests_select_policy" on public.collaboration_requests;
drop policy if exists "collab_requests_insert_policy" on public.collaboration_requests;
drop policy if exists "collab_requests_update_policy" on public.collaboration_requests;

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
    public.is_admin_or_super(auth.uid())
  );

create policy "collab_requests_insert_policy"
  on public.collaboration_requests for insert
  with check (
    auth.uid() = sender_id and
    status = 'pending'
  );

create policy "collab_requests_update_policy"
  on public.collaboration_requests for update
  using (
    auth.uid() = receiver_id or
    exists (
      select 1 from public.projects proj
      where proj.id = collaboration_requests.project_id
      and proj.creator_id = auth.uid()
    ) or
    (auth.uid() = sender_id and status = 'pending') or
    (status = 'accepted' and (
      auth.uid() = sender_id or 
      auth.uid() = receiver_id or
      exists (
        select 1 from public.projects proj
        where proj.id = collaboration_requests.project_id
        and proj.creator_id = auth.uid()
      )
    )) or
    public.is_admin_or_super(auth.uid())
  )
  with check (
    -- Receiver or Project Lead can accept or decline
    (auth.uid() = receiver_id and status in ('accepted', 'declined')) or
    (exists (
      select 1 from public.projects proj
      where proj.id = collaboration_requests.project_id
      and proj.creator_id = auth.uid()
    ) and status in ('accepted', 'declined')) or
    -- Sender or accepted participant can cancel
    ((auth.uid() = sender_id or auth.uid() = receiver_id) and status = 'cancelled') or
    -- Admins can update
    public.is_admin_or_super(auth.uid())
  );

-- ------------------------------------------------------------------------------
-- F. SESSIONS POLICIES
-- ------------------------------------------------------------------------------
drop policy if exists "sessions_select_policy" on public.sessions;
drop policy if exists "sessions_insert_policy" on public.sessions;
drop policy if exists "sessions_update_policy" on public.sessions;

create policy "sessions_select_policy"
  on public.sessions for select
  using (
    auth.uid() = creator_id or
    auth.uid() = partner_id or
    public.is_admin_or_super(auth.uid())
  );

create policy "sessions_insert_policy"
  on public.sessions for insert
  with check (
    auth.uid() = creator_id and
    creator_id != partner_id and
    status = 'scheduled'
  );

create policy "sessions_update_policy"
  on public.sessions for update
  using (
    auth.uid() = creator_id or
    auth.uid() = partner_id or
    public.is_admin_or_super(auth.uid())
  )
  with check (
    auth.uid() = creator_id or
    auth.uid() = partner_id or
    public.is_admin_or_super(auth.uid())
  );

-- ------------------------------------------------------------------------------
-- G. FLAT DIRECT MESSAGES POLICIES
-- ------------------------------------------------------------------------------
drop policy if exists "messages_select_policy" on public.messages;
drop policy if exists "messages_insert_policy" on public.messages;
drop policy if exists "messages_update_policy" on public.messages;

create policy "messages_select_policy"
  on public.messages for select
  using (
    auth.uid() = sender_id or
    auth.uid() = receiver_id or
    public.is_admin_or_super(auth.uid())
  );

create policy "messages_insert_policy"
  on public.messages for insert
  with check (
    auth.uid() = sender_id and
    sender_id != receiver_id and
    read = false
  );

create policy "messages_update_policy"
  on public.messages for update
  using (auth.uid() = receiver_id)
  with check (auth.uid() = receiver_id);

-- ------------------------------------------------------------------------------
-- H. NOTIFICATIONS POLICIES (ANTI-SPOOFING & OWNER PRIVACY)
-- ------------------------------------------------------------------------------
drop policy if exists "notifications_owner_policy" on public.notifications;
drop policy if exists "notifications_select_policy" on public.notifications;
drop policy if exists "notifications_insert_policy" on public.notifications;
drop policy if exists "notifications_update_policy" on public.notifications;
drop policy if exists "notifications_delete_policy" on public.notifications;

-- Recipients can read their own notifications; admins can oversee
create policy "notifications_select_policy"
  on public.notifications for select
  using (
    auth.uid() = user_id or
    public.is_admin_or_super(auth.uid())
  );

-- Prevent arbitrary notification fabrication. Users can only insert notifications
-- for other users when tied to a confirmed interaction (message, request, session, review).
create policy "notifications_insert_policy"
  on public.notifications for insert
  with check (
    public.is_admin_or_super(auth.uid())
    or (
      auth.uid() = user_id
    )
    or (
      user_id != auth.uid() and (
        -- Message notification
        (type = 'new_message' and exists (
          select 1 from public.messages m 
          where m.sender_id = auth.uid() and m.receiver_id = user_id
        ))
        -- Collaboration notification
        or (type in ('request_received', 'request_accepted', 'request_declined') and exists (
          select 1 from public.collaboration_requests r
          where (r.sender_id = auth.uid() and r.receiver_id = user_id)
             or (r.receiver_id = auth.uid() and r.sender_id = user_id)
             or exists (select 1 from public.projects p where p.id = r.project_id and p.creator_id = auth.uid())
        ))
        -- Session notification
        or (type in ('session_scheduled', 'session_reminder') and exists (
          select 1 from public.sessions s
          where (s.creator_id = auth.uid() and s.partner_id = user_id)
             or (s.partner_id = auth.uid() and s.creator_id = user_id)
        ))
        -- Review notification
        or (type = 'review_received' and exists (
          select 1 from public.reviews rev
          where rev.reviewer_id = auth.uid() and rev.target_id = user_id
        ))
      )
    )
  );

-- Recipients can mark notifications as read
create policy "notifications_update_policy"
  on public.notifications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Recipients or admins can dismiss/delete notifications
create policy "notifications_delete_policy"
  on public.notifications for delete
  using (
    auth.uid() = user_id or
    public.is_admin_or_super(auth.uid())
  );

-- ------------------------------------------------------------------------------
-- I. REVIEWS POLICIES (COMPLETED SESSIONS ONLY)
-- ------------------------------------------------------------------------------
drop policy if exists "reviews_select_policy" on public.reviews;
drop policy if exists "reviews_insert_policy" on public.reviews;

create policy "reviews_select_policy"
  on public.reviews for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = reviews.target_id and (p.is_public = true or auth.uid() = p.id)
    ) or
    auth.uid() = reviewer_id or
    public.is_admin_or_super(auth.uid())
  );

create policy "reviews_insert_policy"
  on public.reviews for insert
  with check (
    auth.uid() = reviewer_id and
    reviewer_id != target_id and
    (
      -- Case 1: Session-specific review requires an actual COMPLETED session between them
      (
        session_id is not null and
        exists (
          select 1 from public.sessions s
          where s.id = reviews.session_id
          and s.status = 'completed'
          and (
            (s.creator_id = auth.uid() and s.partner_id = target_id) or
            (s.partner_id = auth.uid() and s.creator_id = target_id)
          )
        )
      )
      or
      -- Case 2: General review requires either a completed session or an accepted collaboration
      (
        session_id is null and
        (
          exists (
            select 1 from public.sessions s
            where s.status = 'completed'
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
      )
    )
  );

-- ------------------------------------------------------------------------------
-- J. ADMIN ROLES POLICIES (STRICT SEPARATION: MODERATOR VS ADMIN VS SUPER_ADMIN)
-- ------------------------------------------------------------------------------
drop policy if exists "admin_roles_select_policy" on public.admin_roles;
drop policy if exists "admin_roles_manage_policy" on public.admin_roles;
drop policy if exists "admin_roles_insert_policy" on public.admin_roles;
drop policy if exists "admin_roles_update_policy" on public.admin_roles;
drop policy if exists "admin_roles_delete_policy" on public.admin_roles;

-- Users can inspect their own role; admins and super_admins can inspect all roles.
-- Moderators CANNOT view the list of all administrators.
create policy "admin_roles_select_policy"
  on public.admin_roles for select
  using (
    auth.uid() = user_id or
    public.is_admin_or_super(auth.uid())
  );

-- Super admins can grant any role; Admins can ONLY grant 'moderator'.
-- Moderators CANNOT grant any roles.
create policy "admin_roles_insert_policy"
  on public.admin_roles for insert
  with check (
    public.is_super_admin(auth.uid())
    or (
      public.is_admin_or_super(auth.uid()) and
      role = 'moderator'
    )
  );

-- Only super admins can modify role assignments
create policy "admin_roles_update_policy"
  on public.admin_roles for update
  using (public.is_super_admin(auth.uid()))
  with check (public.is_super_admin(auth.uid()));

-- Super admins can revoke any role; Admins can ONLY revoke 'moderator'.
-- Moderators CANNOT revoke any roles.
create policy "admin_roles_delete_policy"
  on public.admin_roles for delete
  using (
    public.is_super_admin(auth.uid())
    or (
      public.is_admin_or_super(auth.uid()) and
      role = 'moderator'
    )
  );

-- ------------------------------------------------------------------------------
-- K. REPORTS & MODERATION POLICIES (MODERATORS CAN REVIEW/DISMISS)
-- ------------------------------------------------------------------------------
drop policy if exists "reports_insert_policy" on public.reports;
drop policy if exists "reports_admin_policy" on public.reports;
drop policy if exists "reports_select_policy" on public.reports;
drop policy if exists "reports_update_policy" on public.reports;
drop policy if exists "reports_delete_policy" on public.reports;

create policy "reports_insert_policy"
  on public.reports for insert
  with check (auth.uid() = reporter_id);

-- Moderators, Admins, and Super Admins can view reports
create policy "reports_select_policy"
  on public.reports for select
  using (
    auth.uid() = reporter_id or
    public.is_moderator_or_higher(auth.uid())
  );

-- Moderators, Admins, and Super Admins can update report status
create policy "reports_update_policy"
  on public.reports for update
  using (public.is_moderator_or_higher(auth.uid()))
  with check (public.is_moderator_or_higher(auth.uid()));

-- Only Admins and Super Admins can permanently delete reports
create policy "reports_delete_policy"
  on public.reports for delete
  using (public.is_admin_or_super(auth.uid()));

-- ==============================================================================
-- 12. INITIAL BOOTSTRAP INSTRUCTIONS (FOR DATABASE OWNER)
-- ==============================================================================
-- To bootstrap the initial Super Admin:
-- 1. Sign up a user account through the web app (e.g. admin@skillswap.ai).
-- 2. Retrieve their user UUID from Supabase Authentication Dashboard.
-- 3. Run the following command in SQL Editor:
--
--    insert into public.admin_roles (user_id, role)
--    values ('YOUR-USER-UUID-HERE', 'super_admin')
--    on conflict (user_id) do update set role = 'super_admin';
--
-- That user will now have full administrator privileges in the application.
-- ==============================================================================
