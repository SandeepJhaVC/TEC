-- ═══════════════════════════════════════════════════════════════════════════
-- TEC Security & Scalability Patch — run ONCE in Supabase SQL Editor
-- Addresses issues found in production-readiness audit (March 2026)
-- ═══════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────
-- 1. PERFORMANCE INDEXES
--    Without these, every feed/vote query does a full table scan.
-- ─────────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_feed_posts_created_at
    ON public.feed_posts (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_feed_posts_user_id
    ON public.feed_posts (user_id);

CREATE INDEX IF NOT EXISTS idx_post_replies_post_id
    ON public.post_replies (post_id, created_at);

CREATE INDEX IF NOT EXISTS idx_post_votes_post_user
    ON public.post_votes (post_id, user_id);

CREATE INDEX IF NOT EXISTS idx_members_auth_id
    ON public.members (auth_id);

CREATE INDEX IF NOT EXISTS idx_members_joined_at
    ON public.members (joined_at DESC);

CREATE INDEX IF NOT EXISTS idx_referral_codes_code
    ON public.referral_codes (code);

CREATE INDEX IF NOT EXISTS idx_marketplace_listings_created_at
    ON public.marketplace_listings (created_at DESC);

-- ─────────────────────────────────────────────────────────────────────────
-- 2. REFERRAL CODE — UNIQUE CONSTRAINT (prevents race-condition double-use)
--    Two simultaneous registrations with the same code will now fail at the
--    DB level even if both pass the client-side availability check.
-- ─────────────────────────────────────────────────────────────────────────
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'referral_codes_code_key'
          AND conrelid = 'public.referral_codes'::regclass
    ) THEN
        ALTER TABLE public.referral_codes ADD CONSTRAINT referral_codes_code_key UNIQUE (code);
    END IF;
END $$;

-- Also prevent a code from being used by more than one auth_id
-- (the used_by_auth_id column should be UNIQUE when non-null)
CREATE UNIQUE INDEX IF NOT EXISTS idx_referral_codes_used_by
    ON public.referral_codes (used_by_auth_id)
    WHERE used_by_auth_id IS NOT NULL;

-- ─────────────────────────────────────────────────────────────────────────
-- 3. SERVER-SIDE user_role ENFORCEMENT ON POSTS & REPLIES
--    Overrides whatever role the client sends with the real value from the
--    members table.  Prevents a user from faking an admin/builder badge.
-- ─────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.enforce_post_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_role TEXT;
BEGIN
    SELECT role INTO v_role
    FROM public.members
    WHERE auth_id = auth.uid()
    LIMIT 1;

    NEW.user_role := COALESCE(v_role, 'student');
    RETURN NEW;
END;
$$;

-- Apply to feed_posts
DROP TRIGGER IF EXISTS trg_enforce_post_user_role ON public.feed_posts;
CREATE TRIGGER trg_enforce_post_user_role
    BEFORE INSERT ON public.feed_posts
    FOR EACH ROW EXECUTE FUNCTION public.enforce_post_user_role();

-- Apply to post_replies
DROP TRIGGER IF EXISTS trg_enforce_reply_user_role ON public.post_replies;
CREATE TRIGGER trg_enforce_reply_user_role
    BEFORE INSERT ON public.post_replies
    FOR EACH ROW EXECUTE FUNCTION public.enforce_post_user_role();

-- ─────────────────────────────────────────────────────────────────────────
-- 4. RATE LIMITING VIEW / HELPER
--    Detects if a single IP/user is posting more than 10 feed posts in the
--    last 60 seconds.  Wire this into an RLS policy or a check function.
--    NOTE: Supabase's built-in auth rate-limits cover /auth/* endpoints.
--          This covers feed-post spam specifically.
-- ─────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.user_post_rate_ok()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
    SELECT COUNT(*) < 10
    FROM public.feed_posts
    WHERE user_id = auth.uid()
      AND created_at > NOW() - INTERVAL '60 seconds';
$$;

-- RLS policy: only allow insert when rate is OK
-- (Run this AFTER confirming RLS is enabled on feed_posts)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename  = 'feed_posts'
          AND policyname = 'feed_posts_rate_limit'
    ) THEN
        EXECUTE $policy$
            CREATE POLICY feed_posts_rate_limit
                ON public.feed_posts
                FOR INSERT
                TO authenticated
                WITH CHECK (public.user_post_rate_ok())
        $policy$;
    END IF;
END $$;

-- ─────────────────────────────────────────────────────────────────────────
-- 5. MEMBER CODE UNIQUENESS — belt-and-suspenders
--    The code column should already be TEXT but add a unique index so two
--    simultaneous registrations never produce the same member code.
-- ─────────────────────────────────────────────────────────────────────────
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name   = 'members'
          AND column_name  = 'member_code'
    ) THEN
        CREATE UNIQUE INDEX IF NOT EXISTS idx_members_member_code
            ON public.members (member_code)
            WHERE member_code IS NOT NULL;
    END IF;
END $$;

-- ─────────────────────────────────────────────────────────────────────────
-- 6. CONFIRM RLS IS ON — fail loudly if any critical table has it off
-- ─────────────────────────────────────────────────────────────────────────
DO $$
DECLARE
    t TEXT;
    tables TEXT[] := ARRAY[
        'members', 'feed_posts', 'post_replies', 'post_votes',
        'referral_codes', 'deals', 'admin_listings', 'marketplace_listings',
        'pulse_issues'
    ];
BEGIN
    FOREACH t IN ARRAY tables LOOP
        IF NOT EXISTS (
            SELECT 1 FROM pg_class c
            JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE n.nspname = 'public'
              AND c.relname  = t
              AND c.relrowsecurity = TRUE
        ) THEN
            RAISE WARNING 'RLS is DISABLED on table: %.  Enable it with: ALTER TABLE public.% ENABLE ROW LEVEL SECURITY;', t, t;
        END IF;
    END LOOP;
END $$;

-- ─────────────────────────────────────────────────────────────────────────
-- 7. REFERRAL CODE RLS — allow users to see codes they created or were assigned
--    Original policy only showed codes they *used*. This update also lets
--    users see codes they generated (created_by) or that were assigned to
--    their email by an admin (assigned_to_email).
-- ─────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "auth_read" ON public.referral_codes;
CREATE POLICY "auth_read" ON public.referral_codes
  FOR SELECT TO authenticated
  USING (
    used_by_auth_id = auth.uid()
    OR created_by = auth.uid()
    OR assigned_to_email = (SELECT email FROM public.members WHERE auth_id = auth.uid() LIMIT 1)
    OR public.get_my_role() = 'admin'
  );

-- ─────────────────────────────────────────────────────────────────────────
-- DONE.
-- After running this patch, verify in Supabase dashboard:
--   Authentication > Rate Limits — set sensible limits on signUp/signIn
--   Database > Indexes        — all indexes above should appear
-- ─────────────────────────────────────────────────────────────────────────
