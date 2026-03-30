-- ============================================================
-- TEC App — Complete Database Schema (Clean Slate)
-- Version: 2.0 — Fully planned, linked, and RLS-secured
--
-- HOW TO RUN:
--   Paste the ENTIRE file into Supabase → SQL Editor → Run
--
-- BEFORE YOU RUN:
--   1. Go to Supabase → Auth → Settings → Email
--      Disable "Enable email confirmations"
--      (Required so the members INSERT works right after signUp)
--
-- WARNING:
--   This script DROPS and recreates all tables.
--   All existing data will be permanently deleted.
-- ============================================================


-- ============================================================
-- SECTION 0 — DROP EVERYTHING (clean slate)
-- ============================================================

DROP TABLE IF EXISTS public.hostel_waitlist  CASCADE;
DROP TABLE IF EXISTS public.hostel_bookings  CASCADE;
DROP TABLE IF EXISTS public.hostel_beds      CASCADE;
DROP TABLE IF EXISTS public.hostel_rooms     CASCADE;
DROP TABLE IF EXISTS public.hostels          CASCADE;
DROP TABLE IF EXISTS public.build_votes      CASCADE;
DROP TABLE IF EXISTS public.builds           CASCADE;
DROP TABLE IF EXISTS public.issue_votes      CASCADE;
DROP TABLE IF EXISTS public.post_votes       CASCADE;
DROP TABLE IF EXISTS public.events           CASCADE;
DROP TABLE IF EXISTS public.admin_listings   CASCADE;
DROP TABLE IF EXISTS public.deals            CASCADE;
DROP TABLE IF EXISTS public.marketplace_listings CASCADE;
DROP TABLE IF EXISTS public.pulse_issues     CASCADE;
DROP TABLE IF EXISTS public.feed_posts       CASCADE;
DROP TABLE IF EXISTS public.referral_codes   CASCADE;
DROP TABLE IF EXISTS public.members          CASCADE;

DROP FUNCTION IF EXISTS public.get_my_role();
DROP FUNCTION IF EXISTS public.cast_post_vote(UUID);
DROP FUNCTION IF EXISTS public.cast_issue_vote(UUID);
DROP FUNCTION IF EXISTS public.bootstrap_first_admin(UUID);
DROP FUNCTION IF EXISTS public.sync_post_vote_count();
DROP FUNCTION IF EXISTS public.sync_issue_vote_count();
DROP FUNCTION IF EXISTS public.sync_build_vote_count();
DROP FUNCTION IF EXISTS public.protect_member_columns();


-- ============================================================
-- SECTION 1 — CORE: MEMBERS
--   Central entity. Every feature links back here.
--   id is "TEC-XXXX" — the member's public code.
--   auth_id links to Supabase Auth (auth.users).
-- ============================================================

CREATE TABLE public.members (
  id           TEXT        PRIMARY KEY,
  auth_id      UUID        NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name         TEXT        NOT NULL,
  email        TEXT        NOT NULL,
  role         TEXT        NOT NULL DEFAULT 'student'
                           CHECK (role IN ('student', 'builder', 'moderator', 'admin')),
  status       TEXT        NOT NULL DEFAULT 'Active Member',
  course       TEXT,
  batch        TEXT,
  sap_id        TEXT,
  college_email TEXT,
  phone         TEXT,
  certificates  JSONB       NOT NULL DEFAULT '[]',
  joined_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- ROLE HELPER — must be created before any policy that calls it.
-- SECURITY DEFINER bypasses RLS when reading members.role.
-- STABLE ensures one lookup per outer query, not per row.
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.members WHERE auth_id = auth.uid();
$$;

-- Admin: full access to all rows and all columns
CREATE POLICY "admin_all" ON public.members
  FOR ALL TO authenticated
  USING  (public.get_my_role() = 'admin')
  WITH CHECK (public.get_my_role() = 'admin');

-- Authenticated user: read their own full record
CREATE POLICY "read_own" ON public.members
  FOR SELECT TO authenticated
  USING (auth_id = auth.uid());

-- Authenticated user: update their own row
-- (Protected columns — role, status, etc. — are locked by trigger below)
CREATE POLICY "update_own" ON public.members
  FOR UPDATE TO authenticated
  USING  (auth_id = auth.uid())
  WITH CHECK (auth_id = auth.uid());

-- Registration: insert own row right after signUp (requires email confirm OFF)
CREATE POLICY "insert_own" ON public.members
  FOR INSERT TO authenticated
  WITH CHECK (auth_id = auth.uid());

-- Public lookup (unauthenticated): used by MemberPortal's public profile view
-- NOTE: sap_id is exposed by app design. See members_public view below.
CREATE POLICY "anon_lookup" ON public.members
  FOR SELECT TO anon
  USING (true);

-- Trigger: prevent privilege escalation — users cannot change their own role,
-- status, id, auth_id, email, or joined_at
CREATE OR REPLACE FUNCTION public.protect_member_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- If the caller is not an admin, lock sensitive columns
  IF public.get_my_role() != 'admin' THEN
    NEW.id        := OLD.id;
    NEW.auth_id   := OLD.auth_id;
    NEW.email     := OLD.email;
    NEW.role      := OLD.role;
    NEW.status    := OLD.status;
    NEW.joined_at := OLD.joined_at;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_protect_member_columns
  BEFORE UPDATE ON public.members
  FOR EACH ROW EXECUTE FUNCTION public.protect_member_columns();

-- Convenience view for unauthenticated public profile lookups
-- Omits email; keeps sap_id (display intent confirmed in MemberPortal)
CREATE OR REPLACE VIEW public.members_public AS
  SELECT id, name, role, course, batch, sap_id, joined_at, certificates
  FROM   public.members;

GRANT SELECT ON public.members_public TO anon, authenticated;


-- ============================================================
-- SECTION 2 — REFERRAL CODES
--   Created by admins. Validated by anon during registration.
--   After redemption, used_by_auth_id and member_code are filled.
-- ============================================================

CREATE TABLE public.referral_codes (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  code              TEXT        NOT NULL UNIQUE,
  created_by        UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_to_name  TEXT,
  assigned_to_email TEXT,
  used_by_auth_id   UUID        UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  used_by_name      TEXT,
  used_by_email     TEXT,
  used_at           TIMESTAMPTZ,
  member_code       TEXT        REFERENCES public.members(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- One user can only claim one referral code (UNIQUE on used_by_auth_id enforces this)

ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;

-- Anon: can read code + used_by_auth_id for pre-signup validation
-- (This means unused codes are publicly discoverable by code value; they contain no PII)
CREATE POLICY "anon_validate" ON public.referral_codes
  FOR SELECT TO anon
  USING (true);

-- Authenticated: can see codes they claimed, created, or were assigned to their email
CREATE POLICY "auth_read" ON public.referral_codes
  FOR SELECT TO authenticated
  USING (
    used_by_auth_id = auth.uid()
    OR created_by = auth.uid()
    OR assigned_to_email = (SELECT email FROM public.members WHERE auth_id = auth.uid() LIMIT 1)
    OR public.get_my_role() = 'admin'
  );

-- Authenticated: can claim an unclaimed code (set themselves as the user)
CREATE POLICY "claim_code" ON public.referral_codes
  FOR UPDATE TO authenticated
  USING  (used_by_auth_id IS NULL)
  WITH CHECK (used_by_auth_id = auth.uid());

-- Admin only: create new codes
CREATE POLICY "admin_insert" ON public.referral_codes
  FOR INSERT TO authenticated
  WITH CHECK (public.get_my_role() = 'admin');

-- Admin only: delete codes (only unused ones as gated by app logic)
CREATE POLICY "admin_delete" ON public.referral_codes
  FOR DELETE TO authenticated
  USING (public.get_my_role() = 'admin');


-- ============================================================
-- SECTION 4 — FEED POSTS
--   Community relay feed. Any member can post.
--   Votes are tracked in post_votes for deduplication.
-- ============================================================

CREATE TABLE public.feed_posts (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  member_id  TEXT        REFERENCES public.members(id) ON DELETE SET NULL,
  user_name  TEXT        NOT NULL,
  user_role  TEXT        NOT NULL DEFAULT 'student',
  body       TEXT        NOT NULL CHECK (char_length(body) BETWEEN 1 AND 1000),
  vote_count INT         NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.feed_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "read_all" ON public.feed_posts
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "insert_own" ON public.feed_posts
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "delete_own_or_admin" ON public.feed_posts
  FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR public.get_my_role() = 'admin');


-- ============================================================
-- SECTION 5 — POST VOTES (deduplication for feed_posts)
-- ============================================================

CREATE TABLE public.post_votes (
  post_id    UUID        NOT NULL REFERENCES public.feed_posts(id) ON DELETE CASCADE,
  user_id    UUID        NOT NULL REFERENCES auth.users(id)  ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (post_id, user_id)
);

ALTER TABLE public.post_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "read_own"   ON public.post_votes FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "insert_own" ON public.post_votes FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "delete_own" ON public.post_votes FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Trigger: keep feed_posts.vote_count in sync
CREATE OR REPLACE FUNCTION public.sync_post_vote_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.feed_posts SET vote_count = vote_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.feed_posts SET vote_count = GREATEST(vote_count - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_post_vote_count
  AFTER INSERT OR DELETE ON public.post_votes
  FOR EACH ROW EXECUTE FUNCTION public.sync_post_vote_count();


-- ============================================================
-- SECTION 6 — PULSE ISSUES
--   Community issue tracker. Any member can submit or vote.
-- ============================================================

CREATE TABLE public.pulse_issues (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  member_id   TEXT        REFERENCES public.members(id) ON DELETE SET NULL,
  title       TEXT        NOT NULL,
  area        TEXT        NOT NULL,
  cat         TEXT        NOT NULL,
  description TEXT,
  vote_count  INT         NOT NULL DEFAULT 0,
  status      TEXT        NOT NULL DEFAULT 'Submitted'
              CHECK (status IN ('Submitted', 'In Review', 'Forwarded', 'Resolved')),
  urgent      BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.pulse_issues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "read_all" ON public.pulse_issues
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "insert_own" ON public.pulse_issues
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Only moderators/admins can change status or mark urgent
CREATE POLICY "mod_update" ON public.pulse_issues
  FOR UPDATE TO authenticated
  USING (public.get_my_role() IN ('admin', 'moderator'));

CREATE POLICY "admin_delete" ON public.pulse_issues
  FOR DELETE TO authenticated
  USING (public.get_my_role() = 'admin');


-- ============================================================
-- SECTION 7 — ISSUE VOTES (deduplication for pulse_issues)
-- ============================================================

CREATE TABLE public.issue_votes (
  issue_id   UUID        NOT NULL REFERENCES public.pulse_issues(id) ON DELETE CASCADE,
  user_id    UUID        NOT NULL REFERENCES auth.users(id)   ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (issue_id, user_id)
);

ALTER TABLE public.issue_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "read_own"   ON public.issue_votes FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "insert_own" ON public.issue_votes FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "delete_own" ON public.issue_votes FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Trigger: keep pulse_issues.vote_count in sync
CREATE OR REPLACE FUNCTION public.sync_issue_vote_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.pulse_issues SET vote_count = vote_count + 1 WHERE id = NEW.issue_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.pulse_issues SET vote_count = GREATEST(vote_count - 1, 0) WHERE id = OLD.issue_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_issue_vote_count
  AFTER INSERT OR DELETE ON public.issue_votes
  FOR EACH ROW EXECUTE FUNCTION public.sync_issue_vote_count();


-- ============================================================
-- SECTION 8 — MARKETPLACE LISTINGS
--   Student-submitted buy/sell listings.
--   approved = NULL (pending) | TRUE (live) | FALSE (rejected)
--   RLS enforces the approved filter — unlike the old client-side version.
-- ============================================================

CREATE TABLE public.marketplace_listings (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  member_id   TEXT        REFERENCES public.members(id)      ON DELETE SET NULL,
  title       TEXT        NOT NULL,
  price       TEXT        NOT NULL,
  cat         TEXT        NOT NULL,
  condition   TEXT        NOT NULL,
  description TEXT,
  contact     TEXT        NOT NULL,
  seller_name TEXT        NOT NULL,
  approved    BOOLEAN     DEFAULT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;

-- Students see only approved listings + their own (all states)
-- Admins/mods see everything
CREATE POLICY "read_approved_or_own_or_mod" ON public.marketplace_listings
  FOR SELECT TO authenticated
  USING (
    approved = true
    OR user_id = auth.uid()
    OR public.get_my_role() IN ('admin', 'moderator')
  );

CREATE POLICY "insert_own" ON public.marketplace_listings
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Submitter can edit their own pending listing; mods/admins can edit any
CREATE POLICY "update_own_or_mod" ON public.marketplace_listings
  FOR UPDATE TO authenticated
  USING (
    (user_id = auth.uid() AND approved IS NULL)
    OR public.get_my_role() IN ('admin', 'moderator')
  );

-- Submitter can delete their own pending listing; admin can delete any
CREATE POLICY "delete_own_or_admin" ON public.marketplace_listings
  FOR DELETE TO authenticated
  USING (
    (user_id = auth.uid() AND approved IS NULL)
    OR public.get_my_role() = 'admin'
  );


-- ============================================================
-- SECTION 9 — DEALS
--   Admin-curated vendor discounts.
--   Column named "desc" matches frontend code (deals.desc).
-- ============================================================

CREATE TABLE public.deals (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL,
  cat         TEXT        NOT NULL,
  discount    TEXT        NOT NULL,
  "desc"      TEXT,
  validity    TEXT,
  code        TEXT,
  loc         TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

-- All authenticated members can read deals
CREATE POLICY "read_all" ON public.deals
  FOR SELECT TO authenticated USING (true);

-- Only admins can write
CREATE POLICY "admin_write" ON public.deals
  FOR ALL TO authenticated
  USING  (public.get_my_role() = 'admin')
  WITH CHECK (public.get_my_role() = 'admin');


-- ============================================================
-- SECTION 10 — ADMIN LISTINGS
--   Admin-curated directory (PG, restaurants, etc.)
--   Column named "desc" matches frontend code.
-- ============================================================

CREATE TABLE public.admin_listings (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL,
  tab         TEXT        NOT NULL,
  loc         TEXT,
  price       TEXT,
  rating      FLOAT       CHECK (rating BETWEEN 0 AND 5),
  tags        TEXT,
  "desc"      TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.admin_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "read_all" ON public.admin_listings
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "admin_write" ON public.admin_listings
  FOR ALL TO authenticated
  USING  (public.get_my_role() = 'admin')
  WITH CHECK (public.get_my_role() = 'admin');


-- ============================================================
-- SECTION 11 — EVENTS
--   Calendar events. Created via admin panel.
-- ============================================================

CREATE TABLE public.events (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT        NOT NULL,
  start_time  TIMESTAMPTZ NOT NULL,
  end_time    TIMESTAMPTZ,
  location    TEXT,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "read_all" ON public.events
  FOR SELECT TO authenticated USING (true);

-- Admins and moderators can manage events
CREATE POLICY "mod_write" ON public.events
  FOR ALL TO authenticated
  USING  (public.get_my_role() IN ('admin', 'moderator'))
  WITH CHECK (public.get_my_role() IN ('admin', 'moderator'));


-- ============================================================
-- SECTION 12 — BUILDS
--   Builder-submitted project showcases.
--   Approval flow mirrors marketplace_listings.
-- ============================================================

CREATE TABLE public.builds (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  member_id   TEXT        REFERENCES public.members(id)      ON DELETE SET NULL,
  title       TEXT        NOT NULL,
  description TEXT,
  tech        TEXT[]      DEFAULT '{}',
  links       JSONB       DEFAULT '{}',
  vote_count  INT         NOT NULL DEFAULT 0,
  status      TEXT        NOT NULL DEFAULT 'pending'
              CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.builds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "read_approved_or_own_or_mod" ON public.builds
  FOR SELECT TO authenticated
  USING (
    status = 'approved'
    OR user_id = auth.uid()
    OR public.get_my_role() IN ('admin', 'moderator')
  );

CREATE POLICY "insert_own" ON public.builds
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "mod_update" ON public.builds
  FOR UPDATE TO authenticated
  USING (public.get_my_role() IN ('admin', 'moderator'));

CREATE POLICY "delete_own_or_admin" ON public.builds
  FOR DELETE TO authenticated
  USING (
    (user_id = auth.uid() AND status = 'pending')
    OR public.get_my_role() = 'admin'
  );


-- ============================================================
-- SECTION 13 — BUILD VOTES
-- ============================================================

CREATE TABLE public.build_votes (
  build_id   UUID        NOT NULL REFERENCES public.builds(id) ON DELETE CASCADE,
  user_id    UUID        NOT NULL REFERENCES auth.users(id)    ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (build_id, user_id)
);

ALTER TABLE public.build_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "read_own"   ON public.build_votes FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "insert_own" ON public.build_votes FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "delete_own" ON public.build_votes FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.sync_build_vote_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.builds SET vote_count = vote_count + 1 WHERE id = NEW.build_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.builds SET vote_count = GREATEST(vote_count - 1, 0) WHERE id = OLD.build_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_build_vote_count
  AFTER INSERT OR DELETE ON public.build_votes
  FOR EACH ROW EXECUTE FUNCTION public.sync_build_vote_count();


-- ============================================================
-- SECTION 14 — HOSTELS
--   HostelManagement.jsx currently uses local state only.
--   These tables are ready for when the feature gets wired up.
-- ============================================================

CREATE TABLE public.hostels (
  id             TEXT    PRIMARY KEY,
  name           TEXT    NOT NULL,
  type           TEXT    NOT NULL CHECK (type IN ('boys', 'girls', 'mixed')),
  total_beds     INT     NOT NULL,
  available_beds INT     NOT NULL DEFAULT 0
);

ALTER TABLE public.hostels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_all"    ON public.hostels FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_write" ON public.hostels FOR ALL    TO authenticated
  USING (public.get_my_role() = 'admin') WITH CHECK (public.get_my_role() = 'admin');


CREATE TABLE public.hostel_rooms (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hostel_id   TEXT NOT NULL REFERENCES public.hostels(id) ON DELETE CASCADE,
  room_number TEXT NOT NULL,
  floor       INT,
  capacity    INT  NOT NULL DEFAULT 4,
  UNIQUE (hostel_id, room_number)
);

ALTER TABLE public.hostel_rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_all"    ON public.hostel_rooms FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_write" ON public.hostel_rooms FOR ALL    TO authenticated
  USING (public.get_my_role() = 'admin') WITH CHECK (public.get_my_role() = 'admin');


CREATE TABLE public.hostel_beds (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id    UUID NOT NULL REFERENCES public.hostel_rooms(id) ON DELETE CASCADE,
  bed_number INT  NOT NULL,
  status     TEXT NOT NULL DEFAULT 'available'
             CHECK (status IN ('available', 'occupied', 'maintenance')),
  UNIQUE (room_id, bed_number)
);

ALTER TABLE public.hostel_beds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_all"    ON public.hostel_beds FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_write" ON public.hostel_beds FOR ALL    TO authenticated
  USING (public.get_my_role() = 'admin') WITH CHECK (public.get_my_role() = 'admin');


CREATE TABLE public.hostel_bookings (
  id        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id TEXT        NOT NULL REFERENCES public.members(id)      ON DELETE CASCADE,
  bed_id    UUID        NOT NULL REFERENCES public.hostel_beds(id),
  check_in  DATE        NOT NULL,
  check_out DATE,
  status    TEXT        NOT NULL DEFAULT 'active'
            CHECK (status IN ('active', 'cancelled', 'completed')),
  booked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.hostel_bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_own_or_admin" ON public.hostel_bookings FOR SELECT TO authenticated
  USING (
    member_id IN (SELECT id FROM public.members WHERE auth_id = auth.uid())
    OR public.get_my_role() = 'admin'
  );
CREATE POLICY "insert_own" ON public.hostel_bookings FOR INSERT TO authenticated
  WITH CHECK (
    member_id IN (SELECT id FROM public.members WHERE auth_id = auth.uid())
  );
CREATE POLICY "update_own_or_admin" ON public.hostel_bookings FOR UPDATE TO authenticated
  USING (
    member_id IN (SELECT id FROM public.members WHERE auth_id = auth.uid())
    OR public.get_my_role() = 'admin'
  );


CREATE TABLE public.hostel_waitlist (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id    TEXT        NOT NULL REFERENCES public.members(id)  ON DELETE CASCADE,
  hostel_id    TEXT        NOT NULL REFERENCES public.hostels(id)  ON DELETE CASCADE,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (member_id, hostel_id)
);

ALTER TABLE public.hostel_waitlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_own_or_admin" ON public.hostel_waitlist FOR SELECT TO authenticated
  USING (
    member_id IN (SELECT id FROM public.members WHERE auth_id = auth.uid())
    OR public.get_my_role() = 'admin'
  );
CREATE POLICY "insert_own" ON public.hostel_waitlist FOR INSERT TO authenticated
  WITH CHECK (
    member_id IN (SELECT id FROM public.members WHERE auth_id = auth.uid())
  );
CREATE POLICY "delete_own_or_admin" ON public.hostel_waitlist FOR DELETE TO authenticated
  USING (
    member_id IN (SELECT id FROM public.members WHERE auth_id = auth.uid())
    OR public.get_my_role() = 'admin'
  );


-- ============================================================
-- SECTION 15 — INDEXES (performance)
-- ============================================================

CREATE INDEX idx_members_auth_id          ON public.members (auth_id);
CREATE INDEX idx_referral_codes_code       ON public.referral_codes (code);
CREATE INDEX idx_feed_posts_created_at     ON public.feed_posts (created_at DESC);
CREATE INDEX idx_feed_posts_user_id        ON public.feed_posts (user_id);
CREATE INDEX idx_marketplace_approved      ON public.marketplace_listings (approved, created_at DESC);
CREATE INDEX idx_marketplace_user_id       ON public.marketplace_listings (user_id);
CREATE INDEX idx_pulse_vote_count          ON public.pulse_issues (vote_count DESC);
CREATE INDEX idx_pulse_user_id             ON public.pulse_issues (user_id);
CREATE INDEX idx_events_start_time         ON public.events (start_time ASC);
CREATE INDEX idx_builds_status             ON public.builds (status, created_at DESC);
CREATE INDEX idx_builds_user_id            ON public.builds (user_id);


-- ============================================================
-- SECTION 16 — RPC FUNCTIONS
--   Called from the frontend via supabase.rpc(...)
--   These replace the insecure client-side vote logic.
-- ============================================================

-- cast_post_vote: toggle a vote on a feed post
-- Frontend: await supabase.rpc('cast_post_vote', { p_post_id: id })
-- Returns: { voted: boolean }
CREATE OR REPLACE FUNCTION public.cast_post_vote(p_post_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid          UUID    := auth.uid();
  v_already_voted BOOLEAN;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT EXISTS(
    SELECT 1 FROM public.post_votes
    WHERE post_id = p_post_id AND user_id = v_uid
  ) INTO v_already_voted;

  IF v_already_voted THEN
    DELETE FROM public.post_votes WHERE post_id = p_post_id AND user_id = v_uid;
    RETURN json_build_object('voted', false);
  ELSE
    INSERT INTO public.post_votes (post_id, user_id) VALUES (p_post_id, v_uid);
    RETURN json_build_object('voted', true);
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.cast_post_vote(UUID) TO authenticated;


-- cast_issue_vote: toggle a vote on a pulse issue
-- Frontend: await supabase.rpc('cast_issue_vote', { p_issue_id: id })
-- Returns: { voted: boolean }
CREATE OR REPLACE FUNCTION public.cast_issue_vote(p_issue_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid           UUID    := auth.uid();
  v_already_voted BOOLEAN;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT EXISTS(
    SELECT 1 FROM public.issue_votes
    WHERE issue_id = p_issue_id AND user_id = v_uid
  ) INTO v_already_voted;

  IF v_already_voted THEN
    DELETE FROM public.issue_votes WHERE issue_id = p_issue_id AND user_id = v_uid;
    RETURN json_build_object('voted', false);
  ELSE
    INSERT INTO public.issue_votes (issue_id, user_id) VALUES (p_issue_id, v_uid);
    RETURN json_build_object('voted', true);
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.cast_issue_vote(UUID) TO authenticated;


-- complete_registration: atomically inserts a members row + marks the referral
-- code as used. Runs as SECURITY DEFINER so it works even when there is no
-- active session yet (email confirmation enabled, or timing race on signUp).
-- Called from AuthContext.register() via supabase.rpc('complete_registration', ...)
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
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_auth_id) THEN
    RAISE EXCEPTION 'Invalid auth_id — user does not exist in auth.users';
  END IF;

  PERFORM id FROM public.referral_codes
    WHERE id = p_ref_id AND used_by_auth_id IS NULL
    FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Referral code has already been used';
  END IF;

  INSERT INTO public.members (id, auth_id, name, email, role, status, sap_id, batch, course, college_email, phone, joined_at)
  VALUES (p_member_code, p_auth_id, p_name, p_email, 'student', 'Active Member', p_sap_id, p_batch, p_course, p_college_email, p_phone, NOW());

  UPDATE public.referral_codes SET
    used_by_auth_id = p_auth_id,
    used_by_name    = p_name,
    used_by_email   = p_email,
    used_at         = NOW(),
    member_code     = p_member_code
  WHERE id = p_ref_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.complete_registration(UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT)
  TO anon, authenticated;


-- bootstrap_first_admin: elevate the first registered user to admin
-- Run ONCE in SQL Editor after the first account registers:
--   SELECT public.bootstrap_first_admin('paste-auth-uuid-here');
-- Fails if an admin already exists (safe to call by mistake).
CREATE OR REPLACE FUNCTION public.bootstrap_first_admin(p_auth_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.members WHERE role = 'admin') THEN
    RAISE EXCEPTION 'An admin already exists. Use the AdminPanel to promote users.';
  END IF;

  UPDATE public.members SET role = 'admin' WHERE auth_id = p_auth_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No member found with that auth_id. Make sure they have registered.';
  END IF;

  RETURN 'Success: user promoted to admin.';
END;
$$;
-- Do NOT grant this to normal roles — run only from Supabase SQL Editor as postgres


-- ============================================================
-- SECTION 17 — BOOTSTRAP DATA
--   The first referral code needed to create the admin account.
--   'created_by' is NULL here since no admin exists yet.
-- ============================================================

INSERT INTO public.referral_codes (code)
VALUES ('TECADMIN')
ON CONFLICT (code) DO NOTHING;


-- ============================================================
-- SECTION 18 — POST-SETUP CHECKLIST
-- ============================================================
--
-- After running this script:
--
-- 1. DISABLE email confirmations (if not done already):
--    Supabase Dashboard → Auth → Settings → Email
--    Toggle off "Enable email confirmations"
--
-- 2. REGISTER THE FIRST ACCOUNT:
--    Open your app → /login → Register
--    Use referral code: TECADMIN
--    (This creates a 'student' account — you'll elevate it next)
--
-- 3. GET YOUR AUTH UUID:
--    Supabase Dashboard → Auth → Users
--    Copy the UUID of the account you just created
--
-- 4. PROMOTE TO ADMIN (one-time):
--    Supabase Dashboard → SQL Editor → New Query → Run:
--
--      SELECT public.bootstrap_first_admin('paste-uuid-here');
--
--    You should see: "Success: user promoted to admin."
--
-- 5. REFRESH YOUR APP SESSION:
--    Log out and log back in. Role is now 'admin'.
--    You now have full access to AdminPanel and HostelManagement.
--
-- 6. GENERATE MORE REFERRAL CODES:
--    AdminPanel → Referrals tab → Create codes for new members.
--
-- 7. UPDATE THE FRONTEND VOTE FUNCTIONS:
--    Home.jsx  → handleVote: replace UPDATE query with supabase.rpc('cast_post_vote', { p_post_id: id })
--    Poll.jsx  → handleVote: replace UPDATE query with supabase.rpc('cast_issue_vote', { p_issue_id: id })
--    (See notes at bottom of this file for the exact code)
--
-- ============================================================


-- ============================================================
-- APPENDIX — Frontend code snippets for vote RPCs
-- ============================================================
--
-- HOME.JSX — replace handleVote with:
-- -----------------------------------------------------------------
-- const handleVote = async (id) => {
--   if (!user) return;
--   const { data, error } = await supabase.rpc('cast_post_vote', { p_post_id: id });
--   if (!error) {
--     setPosts(prev => prev.map(p =>
--       p.id === id
--         ? { ...p, vote_count: p.vote_count + (data.voted ? 1 : -1) }
--         : p
--     ));
--   }
-- };
-- -----------------------------------------------------------------
-- Note: vote_count column (was "votes") — update .select() and display too.
--
-- POLL.JSX — replace handleVote with:
-- -----------------------------------------------------------------
-- const handleVote = async (id) => {
--   if (!user) return;
--   const { data, error } = await supabase.rpc('cast_issue_vote', { p_issue_id: id });
--   if (!error) {
--     setIssues(prev => prev.map(i =>
--       i.id === id
--         ? { ...i, vote_count: i.vote_count + (data.voted ? 1 : -1) }
--         : i
--     ));
--   }
-- };
-- -----------------------------------------------------------------
--
-- HOME.JSX — handleRelay should also pass member_id:
-- -----------------------------------------------------------------
-- const { data: member } = await supabase
--   .from('members')
--   .select('id')
--   .eq('auth_id', user.id)
--   .single();
--
-- await supabase.from('feed_posts').insert({
--   user_id:   user.id,
--   member_id: member?.id,     // <-- new field
--   user_name: user.name,
--   user_role: user.role,
--   body:      relayText,
--   vote_count: 0,             // <-- was "votes: 1", now 0 + trigger increments
-- });
-- -----------------------------------------------------------------
-- ============================================================
