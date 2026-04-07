-- =============================================
-- TEC — Missing tables patch
-- Run in Supabase SQL Editor
-- =============================================

-- 1. members
CREATE TABLE members (
    id           text         PRIMARY KEY,            -- format: TEC-XXXX
    auth_id      uuid         UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name         text         NOT NULL,
    email        text         NOT NULL,
    role         text         NOT NULL DEFAULT 'student',
    status       text         NOT NULL DEFAULT 'Active Member',
    sap_id       text,
    batch        text,
    course       text,
    certificates jsonb        DEFAULT '[]'::jsonb,
    joined_at    timestamptz  NOT NULL DEFAULT now(),
    created_at   timestamptz  NOT NULL DEFAULT now()
);

-- 2. referral_codes
CREATE TABLE referral_codes (
    id                uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
    code              text         UNIQUE NOT NULL,
    created_by        uuid         NOT NULL REFERENCES auth.users(id),
    assigned_to_name  text,
    assigned_to_email text,
    used_by_auth_id   uuid         REFERENCES auth.users(id),
    used_by_name      text,
    used_by_email     text,
    used_at           timestamptz,
    member_code       text,
    created_at        timestamptz  NOT NULL DEFAULT now()
);

-- 3. deals
CREATE TABLE deals (
    id         uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
    name       text          NOT NULL,
    cat        text          NOT NULL DEFAULT 'Food',
    discount   text          NOT NULL DEFAULT '',
    "desc"     text          DEFAULT '',
    validity   text          DEFAULT '',
    code       text,
    loc        text          DEFAULT '',
    created_at timestamptz   NOT NULL DEFAULT now()
);

-- 4. admin_listings
CREATE TABLE admin_listings (
    id         uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
    name       text          NOT NULL,
    tab        text          NOT NULL DEFAULT 'PG / Hostels',
    loc        text          DEFAULT '',
    price      text          DEFAULT '',
    rating     numeric(2,1)  DEFAULT 4.0,
    tags       text          DEFAULT '',
    "desc"     text          DEFAULT '',
    reviews    integer       DEFAULT 0,
    created_at timestamptz   NOT NULL DEFAULT now()
);

-- 5. events
CREATE TABLE events (
    id          uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
    title       text         NOT NULL,
    description text,
    start_time  timestamptz  NOT NULL,
    end_time    timestamptz,
    location    text,
    created_at  timestamptz  NOT NULL DEFAULT now()
);

-- 6. map_locations
CREATE TABLE map_locations (
    id         uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
    category   text          NOT NULL,
    name       text          NOT NULL,
    lng        float8        NOT NULL,
    lat        float8        NOT NULL,
    subtitle   text,
    distance   text,
    is_live    boolean       NOT NULL DEFAULT false,
    badge      text,
    rating     numeric(2,1),
    sort_order integer       NOT NULL DEFAULT 0
);

-- 7. map_zones
CREATE TABLE map_zones (
    id          uuid     PRIMARY KEY DEFAULT gen_random_uuid(),
    name        text     NOT NULL,
    color       text     NOT NULL,
    accent      text     NOT NULL,
    description text,
    sort_order  integer  NOT NULL DEFAULT 0
);

-- 8. map_locked_zones
CREATE TABLE map_locked_zones (
    id        text  PRIMARY KEY,
    label     text  NOT NULL,
    status    text  NOT NULL DEFAULT 'locked',
    reason    text,
    chip_top  text,
    chip_left text
);

-- =============================================
-- Row Level Security — enable on all tables
-- =============================================
ALTER TABLE members          ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_codes   ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals            ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_listings   ENABLE ROW LEVEL SECURITY;
ALTER TABLE events           ENABLE ROW LEVEL SECURITY;
ALTER TABLE map_locations    ENABLE ROW LEVEL SECURITY;
ALTER TABLE map_zones        ENABLE ROW LEVEL SECURITY;
ALTER TABLE map_locked_zones ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS Policies — read access for authenticated users
-- =============================================

-- members: users can read all, update own
CREATE POLICY "Members are viewable by authenticated users"
    ON members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own member record"
    ON members FOR UPDATE TO authenticated USING (auth_id = auth.uid());
CREATE POLICY "Users can insert own member record"
    ON members FOR INSERT TO authenticated WITH CHECK (auth_id = auth.uid());

-- referral_codes: authenticated can read, insert, update
CREATE POLICY "Referral codes viewable by authenticated"
    ON referral_codes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert referral codes"
    ON referral_codes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update referral codes"
    ON referral_codes FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete referral codes"
    ON referral_codes FOR DELETE TO authenticated USING (true);

-- deals: read for authenticated
CREATE POLICY "Deals viewable by authenticated users"
    ON deals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Deals manageable by authenticated users"
    ON deals FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- admin_listings: read for authenticated
CREATE POLICY "Listings viewable by authenticated users"
    ON admin_listings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Listings manageable by authenticated users"
    ON admin_listings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- events: read for authenticated
CREATE POLICY "Events viewable by authenticated users"
    ON events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Events manageable by authenticated users"
    ON events FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- map tables: read for authenticated
CREATE POLICY "Map locations viewable by authenticated"
    ON map_locations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Map locations manageable by authenticated"
    ON map_locations FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Map zones viewable by authenticated"
    ON map_zones FOR SELECT TO authenticated USING (true);
CREATE POLICY "Map zones manageable by authenticated"
    ON map_zones FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Locked zones viewable by authenticated"
    ON map_locked_zones FOR SELECT TO authenticated USING (true);
CREATE POLICY "Locked zones manageable by authenticated"
    ON map_locked_zones FOR ALL TO authenticated USING (true) WITH CHECK (true);
