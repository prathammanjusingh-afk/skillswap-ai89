-- ==============================================================================
-- SKILLSWAP AI - PRODUCTION DATABASE SCHEMA & ROW LEVEL SECURITY (RLS)
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES TABLE (linked to Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
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
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. SKILLS DIRECTORY & PROFILE SKILLS
create table public.profile_skills (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  skill_name text not null,
  category text check (category in ('frontend', 'backend', 'ai_ml', 'design', 'cloud_devops', 'mobile', 'hardware_iot', 'product_management')) not null,
  proficiency text check (proficiency in ('beginner', 'intermediate', 'advanced', 'expert')) default 'intermediate',
  skill_type text check (skill_type in ('offered', 'seeking')) not null, -- Offered: skills I have; Seeking: skills I want my partner to have
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(profile_id, skill_name, skill_type)
);

-- 3. PROJECTS TABLE
create table public.projects (
  id uuid default gen_random_uuid() primary key,
  creator_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  tagline text not null,
  description text not null,
  category text not null, -- e.g., 'Artificial Intelligence', 'Developer Tools', 'Fintech', 'EdTech', 'HealthTech'
  project_type text check (project_type in ('hackathon', 'capstone', 'startup_mvp', 'open_source', 'research')) not null,
  stage text check (stage in ('ideation', 'prototype', 'in_progress', 'polishing')) default 'ideation',
  target_event text, -- e.g., 'PennApps 2026', 'Y Combinator W27', 'Senior Design Expo'
  weekly_hours_required integer default 12,
  tags text[] default '{}',
  repo_url text,
  demo_url text,
  status text check (status in ('recruiting', 'in_progress', 'completed')) default 'recruiting',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. PROJECT OPEN ROLES (needed roles with specific skill requirements)
create table public.project_roles (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  role_title text not null, -- e.g. "Full-Stack Engineer", "Lead AI/ML Researcher", "Product Designer"
  description text,
  required_skills text[] default '{}',
  is_filled boolean default false,
  filled_by_profile_id uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. PROJECT MEMBERSHIP
create table public.project_members (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  role_title text not null,
  is_owner boolean default false,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(project_id, profile_id)
);

-- 6. COLLABORATION REQUESTS & SWAP PROPOSALS
create table public.collaboration_requests (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  receiver_id uuid references public.profiles(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  request_type text check (request_type in ('skill_swap_invite', 'project_application', 'team_invitation')) not null,
  pitch_message text not null,
  status text check (status in ('pending', 'accepted', 'declined')) default 'pending',
  synergy_score integer check (synergy_score between 0 and 100),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. ENABLE ROW LEVEL SECURITY (RLS)
alter table public.profiles enable row level security;
alter table public.profile_skills enable row level security;
alter table public.projects enable row level security;
alter table public.project_roles enable row level security;
alter table public.project_members enable row level security;
alter table public.collaboration_requests enable row level security;

-- 8. ROW LEVEL SECURITY POLICIES

-- Profiles: Anyone authenticated can read all public profiles; users can update only their own profile
create policy "Allow public read access to all profiles"
  on public.profiles for select
  using (true);

create policy "Allow users to insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Allow users to update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Profile Skills: Anyone can read, owners can insert/update/delete
create policy "Allow public read access to profile skills"
  on public.profile_skills for select
  using (true);

create policy "Allow owners to manage profile skills"
  on public.profile_skills for all
  using (auth.uid() = profile_id);

-- Projects: Anyone can view recruiting or active projects; owners can manage
create policy "Allow public read access to projects"
  on public.projects for select
  using (true);

create policy "Allow authenticated creators to insert projects"
  on public.projects for insert
  with check (auth.uid() = creator_id);

create policy "Allow creators to update their own projects"
  on public.projects for update
  using (auth.uid() = creator_id);

create policy "Allow creators to delete their own projects"
  on public.projects for delete
  using (auth.uid() = creator_id);

-- Project Roles: Public read, project creators manage
create policy "Allow public read access to project roles"
  on public.project_roles for select
  using (true);

create policy "Allow project creators to manage project roles"
  on public.project_roles for all
  using (
    exists (
      select 1 from public.projects
      where id = project_roles.project_id
      and creator_id = auth.uid()
    )
  );

-- Project Members: Public read, project creators manage
create policy "Allow public read access to project members"
  on public.project_members for select
  using (true);

create policy "Allow project creators to manage project members"
  on public.project_members for all
  using (
    exists (
      select 1 from public.projects
      where id = project_members.project_id
      and creator_id = auth.uid()
    )
  );

-- Collaboration Requests: Involved sender and receiver can read and update
create policy "Allow participants to view their requests"
  on public.collaboration_requests for select
  using (
    auth.uid() = sender_id or 
    auth.uid() = receiver_id or
    exists (
      select 1 from public.projects
      where id = collaboration_requests.project_id
      and creator_id = auth.uid()
    )
  );

create policy "Allow users to create collaboration requests"
  on public.collaboration_requests for insert
  with check (auth.uid() = sender_id);

create policy "Allow receivers or creators to update request status"
  on public.collaboration_requests for update
  using (
    auth.uid() = receiver_id or
    exists (
      select 1 from public.projects
      where id = collaboration_requests.project_id
      and creator_id = auth.uid()
    )
  );

-- 9. AUTOMATIC NEW USER TRIGGER TO PROFILES
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
    availability_hours_per_week
  ) values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Student Innovator'),
    coalesce(new.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'),
    coalesce(new.raw_user_meta_data->>'headline', 'Passionate Tech Student Looking for Collaborators'),
    coalesce(new.raw_user_meta_data->>'university', 'Campus University'),
    coalesce(new.raw_user_meta_data->>'major', 'Computer Science'),
    extract(year from current_date)::integer + 2,
    coalesce(new.raw_user_meta_data->>'bio', 'Excited to build ambitious projects with complementary peers!'),
    15
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to invoke on auth.users insert
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
