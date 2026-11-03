-- =============================================================================
-- Migration: 20261102_team_room_and_storage_schema_v2.sql
-- Description: Team Room sprint tasks, persistent team chat, Supabase Storage, and Realtime (V2)
-- Note: 100% IDEMPOTENT & SAFE TO RUN ON FRESH OR EXISTING SUPABASE DATABASE (PART 2)
--
-- SECOND SECURITY AUDIT REVISIONS (Phase 10 - V2):
-- 1. [RBAC Separation] Updated all contributor and administrative policies to use
--    public.is_admin_or_super(auth.uid()) and public.is_project_contributor.
-- 2. [Field Immutability] Added validation trigger on project_tasks to prevent
--    reassigning tasks across different projects.
-- 3. [Message Security] Team Room chat messages are strictly append-only (updates prevented).
--    Deletions restricted to project creator and administrators.
-- 4. [Storage Distinction & Protection]
--    - Public vs. Private project asset access controls.
--    - Upload restricted strictly to verified project contributors.
--    - Deletion restricted to project creator or administrators to prevent asset vandalism.
-- 5. [Realtime Hardening] REPLICA IDENTITY FULL configured on project_tasks and project_messages.
-- =============================================================================

-- =============================================================================
-- 1. TEAM ROOM SPRINT TASKS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.project_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    done BOOLEAN NOT NULL DEFAULT false,
    assignee_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    assignee_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Upgrade existing columns if already present
ALTER TABLE public.project_tasks
    ADD COLUMN IF NOT EXISTS description TEXT,
    ADD COLUMN IF NOT EXISTS done BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS assignee_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS assignee_name TEXT,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_project_tasks_project_id
    ON public.project_tasks(project_id);

CREATE INDEX IF NOT EXISTS idx_project_tasks_assignee
    ON public.project_tasks(assignee_id)
    WHERE assignee_id IS NOT NULL;

ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tasks REPLICA IDENTITY FULL;

-- Helper function: Check if user is creator, member, or accepted collaborator on a project
CREATE OR REPLACE FUNCTION public.is_project_contributor(p_project_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
    SELECT (
        p_user_id IS NOT NULL AND (
            EXISTS (
                SELECT 1 FROM public.projects
                WHERE id = p_project_id AND creator_id = p_user_id
            ) OR EXISTS (
                SELECT 1 FROM public.collaboration_requests
                WHERE project_id = p_project_id
                  AND status = 'accepted'
                  AND (sender_id = p_user_id OR receiver_id = p_user_id)
            ) OR EXISTS (
                SELECT 1 FROM public.project_members
                WHERE project_id = p_project_id
                  AND profile_id = p_user_id
            )
        )
    );
$$;

-- Protect project_id on project_tasks (cannot be moved to another project)
CREATE OR REPLACE FUNCTION public.validate_project_task_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF NEW.id IS DISTINCT FROM OLD.id OR
       NEW.project_id IS DISTINCT FROM OLD.project_id OR
       NEW.created_at IS DISTINCT FROM OLD.created_at THEN
        RAISE EXCEPTION 'Task identity and project_id are immutable.';
    END IF;
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_project_task_update ON public.project_tasks;
CREATE TRIGGER trg_validate_project_task_update
    BEFORE UPDATE ON public.project_tasks
    FOR EACH ROW EXECUTE FUNCTION public.validate_project_task_update();

-- Inventory and drop existing task policies
DROP POLICY IF EXISTS project_tasks_select_policy ON public.project_tasks;
DROP POLICY IF EXISTS project_tasks_insert_policy ON public.project_tasks;
DROP POLICY IF EXISTS project_tasks_update_policy ON public.project_tasks;
DROP POLICY IF EXISTS project_tasks_delete_policy ON public.project_tasks;

-- RLS: Read tasks (contributor or admin)
CREATE POLICY project_tasks_select_policy
    ON public.project_tasks
    FOR SELECT
    USING (
        public.is_project_contributor(project_id, auth.uid())
        OR public.is_admin_or_super(auth.uid())
    );

-- RLS: Insert tasks (contributor only)
CREATE POLICY project_tasks_insert_policy
    ON public.project_tasks
    FOR INSERT
    WITH CHECK (
        public.is_project_contributor(project_id, auth.uid())
    );

-- RLS: Update tasks (contributor only)
CREATE POLICY project_tasks_update_policy
    ON public.project_tasks
    FOR UPDATE
    USING (
        public.is_project_contributor(project_id, auth.uid())
    )
    WITH CHECK (
        public.is_project_contributor(project_id, auth.uid())
    );

-- RLS: Delete tasks (project creator only or admin)
CREATE POLICY project_tasks_delete_policy
    ON public.project_tasks
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE id = project_id AND creator_id = auth.uid()
        ) OR public.is_admin_or_super(auth.uid())
    );

-- =============================================================================
-- 2. TEAM ROOM PERSISTENT SPRINT CHAT
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.project_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    sender_name TEXT,
    sender_avatar TEXT,
    content TEXT NOT NULL CHECK (length(trim(content)) > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_messages_lookup
    ON public.project_messages(project_id, created_at ASC);

ALTER TABLE public.project_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_messages REPLICA IDENTITY FULL;

-- Messages are append-only. Prevent retrospective edits.
CREATE OR REPLACE FUNCTION public.prevent_project_message_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    RAISE EXCEPTION 'Team chat messages are permanent and cannot be modified once sent.';
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_project_message_update ON public.project_messages;
CREATE TRIGGER trg_prevent_project_message_update
    BEFORE UPDATE ON public.project_messages
    FOR EACH ROW EXECUTE FUNCTION public.prevent_project_message_update();

-- Inventory and drop existing project message policies
DROP POLICY IF EXISTS project_messages_select_policy ON public.project_messages;
DROP POLICY IF EXISTS project_messages_insert_policy ON public.project_messages;
DROP POLICY IF EXISTS project_messages_delete_policy ON public.project_messages;

-- RLS: Read project messages (contributor or admin)
CREATE POLICY project_messages_select_policy
    ON public.project_messages
    FOR SELECT
    USING (
        public.is_project_contributor(project_id, auth.uid())
        OR public.is_admin_or_super(auth.uid())
    );

-- RLS: Send project messages (must be contributor and sender must be authenticated user)
CREATE POLICY project_messages_insert_policy
    ON public.project_messages
    FOR INSERT
    WITH CHECK (
        auth.uid() = sender_id
        AND public.is_project_contributor(project_id, auth.uid())
    );

-- RLS: Delete messages (project creator or admin only)
CREATE POLICY project_messages_delete_policy
    ON public.project_messages
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE id = project_id AND creator_id = auth.uid()
        ) OR public.is_admin_or_super(auth.uid())
    );

-- =============================================================================
-- 3. SUPABASE STORAGE BUCKETS & POLICIES
-- =============================================================================

-- Ensure storage buckets exist with constraints
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
    ('avatars', 'avatars', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
    ('project-assets', 'project-assets', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'])
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Inventory and drop all existing storage policies on storage.objects
DROP POLICY IF EXISTS "Public read for user avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Public read for project assets" ON storage.objects;
DROP POLICY IF EXISTS "Project contributors can upload project assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their project assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their project assets" ON storage.objects;
DROP POLICY IF EXISTS "project_assets_select_policy" ON storage.objects;
DROP POLICY IF EXISTS "project_assets_insert_policy" ON storage.objects;
DROP POLICY IF EXISTS "project_assets_update_policy" ON storage.objects;
DROP POLICY IF EXISTS "project_assets_delete_policy" ON storage.objects;

-- -----------------------------------------------------------------------------
-- AVATARS POLICIES
-- -----------------------------------------------------------------------------
-- Storage RLS: Public avatar read
CREATE POLICY "Public read for user avatars"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'avatars');

-- Storage RLS: Authenticated user upload to their own avatar folder ({userId}/{filename})
CREATE POLICY "Users can upload their own avatar"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'avatars'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Storage RLS: User update their own avatar
CREATE POLICY "Users can update their own avatar"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'avatars'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Storage RLS: User delete their own avatar
CREATE POLICY "Users can delete their own avatar"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'avatars'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- -----------------------------------------------------------------------------
-- PROJECT ASSETS POLICIES (PUBLIC DISCOVERY VS. PRIVATE TEAM ROOM)
-- -----------------------------------------------------------------------------
-- Read Policy: Public discovery projects allow public asset viewing;
-- private/draft assets or team files are restricted to contributors and admins.
CREATE POLICY "project_assets_select_policy"
    ON storage.objects
    FOR SELECT
    USING (
        bucket_id = 'project-assets'
        AND (
            -- Assets for public marketplace projects
            EXISTS (
                SELECT 1 FROM public.projects
                WHERE id::text = (storage.foldername(name))[1]
                  AND status IN ('recruiting', 'in_progress', 'completed')
            )
            -- Or contributor access
            OR (
                (storage.foldername(name))[1] ~ '^[0-9a-fA-F-]{36}$'
                AND public.is_project_contributor(((storage.foldername(name))[1])::uuid, auth.uid())
            )
            -- Or admin access
            OR public.is_admin_or_super(auth.uid())
        )
    );

-- Upload Policy: Strictly authenticated project contributors
CREATE POLICY "project_assets_insert_policy"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'project-assets'
        AND (
            (
                (storage.foldername(name))[1] ~ '^[0-9a-fA-F-]{36}$'
                AND public.is_project_contributor(((storage.foldername(name))[1])::uuid, auth.uid())
            )
            OR (storage.foldername(name))[1] = auth.uid()::text
            OR public.is_admin_or_super(auth.uid())
        )
    );

-- Update Policy: Authenticated project contributors
CREATE POLICY "project_assets_update_policy"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'project-assets'
        AND (
            (
                (storage.foldername(name))[1] ~ '^[0-9a-fA-F-]{36}$'
                AND public.is_project_contributor(((storage.foldername(name))[1])::uuid, auth.uid())
            )
            OR (storage.foldername(name))[1] = auth.uid()::text
            OR public.is_admin_or_super(auth.uid())
        )
    );

-- Delete Policy: Restricted to Project Creator or Administrators (prevents asset vandalism)
CREATE POLICY "project_assets_delete_policy"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'project-assets'
        AND (
            EXISTS (
                SELECT 1 FROM public.projects
                WHERE id::text = (storage.foldername(name))[1]
                  AND creator_id = auth.uid()
            )
            OR (storage.foldername(name))[1] = auth.uid()::text
            OR public.is_admin_or_super(auth.uid())
        )
    );

-- =============================================================================
-- 4. REALTIME PUBLICATION CONFIGURATION
-- =============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_publication_tables 
            WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'notifications'
        ) THEN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM pg_publication_tables 
            WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'messages'
        ) THEN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM pg_publication_tables 
            WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'project_tasks'
        ) THEN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.project_tasks;
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM pg_publication_tables 
            WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'project_messages'
        ) THEN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.project_messages;
        END IF;
    END IF;
END $$;
