-- DRAFT ONLY. Back up before applying; not executed in preview.
CREATE TABLE IF NOT EXISTS spaceops.payment_records(id text PRIMARY KEY,data text NOT NULL,created_at text NOT NULL);
ALTER TABLE spaceops.payment_records ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON spaceops.payment_records FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT ON spaceops.payment_records TO spaceops_runtime;
DROP POLICY IF EXISTS app_payments ON spaceops.payment_records;
CREATE POLICY app_payments ON spaceops.payment_records TO spaceops_runtime USING(spaceops.actor_role()='owner') WITH CHECK(spaceops.actor_role()='owner');
-- Rollback: remove app navigation first; retain records. Revoke runtime INSERT if necessary.
-- Do not drop payment_records or delete history to roll back the UI.
