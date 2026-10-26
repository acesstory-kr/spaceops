-- REVIEW ONLY. Not run by the app/build/preview. Requires explicit database approval.
-- Take a Supabase database backup before applying. Existing tables/rows are preserved.
BEGIN;
CREATE TABLE IF NOT EXISTS spaceops.members (
 email text PRIMARY KEY, legacy_user_id text NOT NULL UNIQUE,
 display_name text NOT NULL, role text NOT NULL CHECK(role IN ('admin','worker','viewer')),
 active boolean NOT NULL DEFAULT true
);
CREATE TABLE IF NOT EXISTS spaceops.spaces (
 id uuid PRIMARY KEY, legacy_category integer UNIQUE, name text NOT NULL,
 color text NOT NULL, logo_url text, booking_url text, active boolean NOT NULL DEFAULT true
);
CREATE TABLE IF NOT EXISTS spaceops.task_assignments (
 task text NOT NULL REFERENCES spaceops.tasks(id) ON DELETE CASCADE,
 member_email text NOT NULL REFERENCES spaceops.members(email), PRIMARY KEY(task,member_email)
);
ALTER TABLE spaceops.photos ADD COLUMN IF NOT EXISTS phase text NOT NULL DEFAULT 'unspecified';
ALTER TABLE spaceops.photos ADD COLUMN IF NOT EXISTS uploaded_at timestamptz;
ALTER TABLE spaceops.photos ADD COLUMN IF NOT EXISTS uploader_email text;
-- Old photos: phase=unspecified and uploaded_at=NULL. Never invent past timestamps.
CREATE TABLE IF NOT EXISTS spaceops.activity_logs (
 id uuid PRIMARY KEY, task text, actor_email text NOT NULL, action text NOT NULL,
 details jsonb NOT NULL DEFAULT '{}', created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS spaceops.notifications (
 id uuid PRIMARY KEY, recipient_email text NOT NULL REFERENCES spaceops.members(email),
 event_key text NOT NULL, task text, kind text NOT NULL, read_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(recipient_email,event_key)
);
CREATE TABLE IF NOT EXISTS spaceops.push_subscriptions (
 id uuid PRIMARY KEY, member_email text NOT NULL REFERENCES spaceops.members(email),
 endpoint text NOT NULL UNIQUE, keys jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
REVOKE ALL ON ALL TABLES IN SCHEMA spaceops FROM anon,authenticated;
COMMIT;
-- Rollback: roll back application code first. Leave these additive tables/columns
-- in place until a separate approved archival/removal operation; no destructive DOWN.
-- Admin/worker/viewer rows require reviewed account mapping; no guessed identities.
