-- ============================================================
-- PATCH: complete_registration RPC
--
-- Run this in Supabase → SQL Editor → New Query → Run
--
-- PURPOSE:
--   Replaces the separate members INSERT + referral_codes UPDATE
--   that happened after signUp in AuthContext.register().
--   Those calls ran as 'anon' (no session yet) and were silently
--   blocked by RLS. This function runs as SECURITY DEFINER
--   (bypasses RLS) and works regardless of whether email
--   confirmation is on or off.
--
-- SECURITY:
--   - Verifies p_auth_id exists in auth.users (prevents spoofing)
--   - Locks the referral row to prevent race conditions
--   - Checks referral is unused before proceeding
--   - Wrapped in a transaction: both inserts succeed or neither does
-- ============================================================

DROP FUNCTION IF EXISTS public.complete_registration(UUID, UUID, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.complete_registration(UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.complete_registration(UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT);

-- Add new columns if they don't exist yet (safe to re-run)
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS college_email TEXT;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS phone TEXT;

CREATE OR REPLACE FUNCTION public.complete_registration(
  p_auth_id       UUID,
  p_ref_id        UUID,
  p_member_code   TEXT,
  p_name          TEXT,
  p_email         TEXT,
  p_sap_id        TEXT DEFAULT NULL,
  p_batch         TEXT DEFAULT NULL,
  p_course        TEXT DEFAULT NULL,
  p_college_email TEXT DEFAULT NULL,
  p_phone         TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify the auth_id exists in auth.users (prevents a caller from
  -- supplying a fake UUID to claim a referral code)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_auth_id) THEN
    RAISE EXCEPTION 'Invalid auth_id — user does not exist in auth.users';
  END IF;

  -- Lock the referral code row and confirm it is still unclaimed
  -- (FOR UPDATE prevents two simultaneous registrations using the same code)
  PERFORM id FROM public.referral_codes
    WHERE id = p_ref_id AND used_by_auth_id IS NULL
    FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Referral code has already been used';
  END IF;

  -- Insert the member row (bypasses RLS via SECURITY DEFINER)
  INSERT INTO public.members (id, auth_id, name, email, role, status, sap_id, batch, course, college_email, phone, joined_at)
  VALUES (p_member_code, p_auth_id, p_name, p_email, 'student', 'Active Member', p_sap_id, p_batch, p_course, p_college_email, p_phone, NOW());

  -- Mark referral code as consumed
  UPDATE public.referral_codes SET
    used_by_auth_id = p_auth_id,
    used_by_name    = p_name,
    used_by_email   = p_email,
    used_at         = NOW(),
    member_code     = p_member_code
  WHERE id = p_ref_id;
END;
$$;

-- Grant to both anon and authenticated so it works regardless of
-- whether email confirmation is enabled
GRANT EXECUTE ON FUNCTION public.complete_registration(UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT)
  TO anon, authenticated;

-- ============================================================
-- PATCH: Enable real-time replication for live feed
-- Required for supabase.channel() WebSocket subscriptions to
-- receive INSERT / UPDATE / DELETE events for feed_posts.
-- ============================================================
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'feed_posts'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.feed_posts;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'post_votes'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.post_votes;
  END IF;
END $$;

-- ============================================================
-- PATCH: Anonymous posting + Replies
-- ============================================================

-- Add is_anonymous flag to feed_posts
ALTER TABLE public.feed_posts ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN NOT NULL DEFAULT false;

-- Add reply_count to feed_posts (maintained by trigger below)
ALTER TABLE public.feed_posts ADD COLUMN IF NOT EXISTS reply_count INT NOT NULL DEFAULT 0;

-- Replies table
CREATE TABLE IF NOT EXISTS public.post_replies (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id      UUID        NOT NULL REFERENCES public.feed_posts(id) ON DELETE CASCADE,
  user_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  member_id    TEXT        REFERENCES public.members(id) ON DELETE SET NULL,
  user_name    TEXT        NOT NULL,
  user_role    TEXT        NOT NULL DEFAULT 'student',
  is_anonymous BOOLEAN     NOT NULL DEFAULT false,
  body         TEXT        NOT NULL CHECK (char_length(body) BETWEEN 1 AND 500),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.post_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "read_all"           ON public.post_replies FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_own"         ON public.post_replies FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "delete_own_or_admin" ON public.post_replies FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR public.get_my_role() = 'admin');

-- Trigger: keep feed_posts.reply_count in sync
CREATE OR REPLACE FUNCTION public.sync_reply_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.feed_posts SET reply_count = reply_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.feed_posts SET reply_count = GREATEST(reply_count - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_reply_count
  AFTER INSERT OR DELETE ON public.post_replies
  FOR EACH ROW EXECUTE FUNCTION public.sync_reply_count();

-- Enable real-time for replies
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'post_replies'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.post_replies;
  END IF;
END $$;

-- ============================================================
-- PATCH: admin_update_member RPC
-- Allows admins to update any member row bypassing RLS.
-- Called from AdminPanel.saveMember via supabase.rpc(...)
-- ============================================================
CREATE OR REPLACE FUNCTION public.admin_update_member(
  p_member_id    TEXT,
  p_name         TEXT         DEFAULT NULL,
  p_email        TEXT         DEFAULT NULL,
  p_college_email TEXT        DEFAULT NULL,
  p_phone        TEXT         DEFAULT NULL,
  p_role         TEXT         DEFAULT 'student',
  p_status       TEXT         DEFAULT 'Active Member',
  p_sap_id       TEXT         DEFAULT NULL,
  p_batch        TEXT         DEFAULT NULL,
  p_course       TEXT         DEFAULT NULL,
  p_certificates JSONB        DEFAULT '[]'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only admins may call this
  IF public.get_my_role() != 'admin' THEN
    RAISE EXCEPTION 'Unauthorized: admin role required';
  END IF;

  UPDATE public.members SET
    name          = COALESCE(p_name, name),
    email         = COALESCE(p_email, email),
    college_email = p_college_email,
    phone         = p_phone,
    role          = COALESCE(p_role, role),
    status        = COALESCE(p_status, status),
    sap_id        = p_sap_id,
    batch         = p_batch,
    course        = p_course,
    certificates  = COALESCE(p_certificates, '[]'::jsonb)
  WHERE id = p_member_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Member not found: %', p_member_id;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_update_member(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB)
  TO authenticated;
