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
ALTER PUBLICATION supabase_realtime ADD TABLE public.feed_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_votes;
