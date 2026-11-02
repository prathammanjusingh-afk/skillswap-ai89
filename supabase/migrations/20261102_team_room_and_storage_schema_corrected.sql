-- =============================================================================
-- Migration: 20261102_team_room_and_storage_schema_corrected.sql
-- Description: Team Room sprint tasks, persistent team chat, Supabase Storage, and Realtime (CORRECTED)
-- Note: 100% IDEMPOTENT & SAFE TO RUN ON FRESH OR EXISTING SUPABASE DATABASE (PART 2)
--
-- AUDIT ENHANCEMENTS APPLIED (Phase 10 Review):
-- 1. [Storage RLS Fix] Updated project-assets policies on storage.objects to support
--    folder path structured by projectId (e.g. project-assets/{projectId}/{file}),
--    validating project contributor status rather than erroneously checking auth.uid() = projectId.
-- 2. [RBAC Consistency] Replaced direct query on admin_roles with public.is_admin(auth.uid())
--    in project_tasks and project_messages policies for consistent security definer access.
-- 3. [Security Hardening] Explicit search_path set on is_project_contributor function.
-- 4. [Realtime Optimization] Added REPLICA IDENTITY FULL to project_tasks and project_messages
--    to ensure complete row data is transmitted on updates/deletes in websocket subscriptions.
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
    SELECT EXISTS (
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
    );
$$;

-- RLS: Read tasks (project creator or accepted collaborator or admin)
DROP POLICY IF EXISTS project_tasks_select_policy ON public.project_tasks;
CREATE POLICY project_tasks_select_policy
    ON public.project_tasks
    FOR SELECT
    USING (
        public.is_project_contributor(project_id, auth.uid())
        OR public.is_admin(auth.uid())
    );

-- RLS: Insert tasks (project creator or accepted collaborator)
DROP POLICY IF EXISTS project_tasks_insert_policy ON public.project_tasks;
CREATE POLICY project_tasks_insert_policy
    ON public.project_tasks
    FOR INSERT
    WITH CHECK (
        public.is_project_contributor(project_id, auth.uid())
    );

-- RLS: Update tasks (project creator or accepted collaborator)
DROP POLICY IF EXISTS project_tasks_update_policy ON public.project_tasks;
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
DROP POLICY IF EXISTS project_tasks_delete_policy ON public.project_tasks;
CREATE POLICY project_tasks_delete_policy
    ON public.project_tasks
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE id = project_id AND creator_id = auth.uid()
        ) OR public.is_admin(auth.uid())
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
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_messages_lookup
    ON public.project_messages(project_id, created_at ASC);

ALTER TABLE public.project_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_messages REPLICA IDENTITY FULL;

-- RLS: Read project messages (contributor or admin)
DROP POLICY IF EXISTS project_messages_select_policy ON public.project_messages;
CREATE POLICY project_messages_select_policy
    ON public.project_messages
    FOR SELECT
    USING (
        public.is_project_contributor(project_id, auth.uid())
        OR public.is_admin(auth.uid())
    );

-- RLS: Send project messages (must be contributor and sender must be authenticated user)
DROP POLICY IF EXISTS project_messages_insert_policy ON public.project_messages;
CREATE POLICY project_messages_insert_policy
    ON public.project_messages
    FOR INSERT
    WITH CHECK (
        auth.uid() = sender_id
        AND public.is_project_contributor(project_id, auth.uid())
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

-- Storage RLS: Public avatar read
DROP POLICY IF EXISTS "Public read for user avatars" ON storage.objects;
CREATE POLICY "Public read for user avatars"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'avatars');

-- Storage RLS: Authenticated user upload to their own avatar folder ({userId}/{filename})
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
CREATE POLICY "Users can upload their own avatar"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'avatars'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Storage RLS: User update their own avatar
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
CREATE POLICY "Users can update their own avatar"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'avatars'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Storage RLS: User delete their own avatar
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
CREATE POLICY "Users can delete their own avatar"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'avatars'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Storage RLS: Public project assets read
DROP POLICY IF EXISTS "Public read for project assets" ON storage.objects;
CREATE POLICY "Public read for project assets"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'project-assets');

-- Storage RLS: Authenticated project contributors can upload project assets ({projectId}/{filename} or {userId}/{filename})
DROP POLICY IF EXISTS "Project contributors can upload project assets" ON storage.objects;
CREATE POLICY "Project contributors can upload project assets"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'project-assets'
        AND (
            (storage.foldername(name))[1] = auth.uid()::text
            OR (
                (storage.foldername(name))[1] ~ '^[0-9a-fA-F-]{36}$'
                AND public.is_project_contributor(((storage.foldername(name))[1])::uuid, auth.uid())
            )
        )
    );

-- Storage RLS: Users or project contributors can delete project assets they manage
DROP POLICY IF EXISTS "Users can delete their project assets" ON storage.objects;
CREATE POLICY "Users can delete their project assets"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'project-assets'
        AND (
            (storage.foldername(name))[1] = auth.uid()::text
            OR (
                (storage.foldername(name))[1] ~ '^[0-9a-fA-F-]{36}$'
                AND public.is_project_contributor(((storage.foldername(name))[1])::uuid, auth.uid())
            )
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
