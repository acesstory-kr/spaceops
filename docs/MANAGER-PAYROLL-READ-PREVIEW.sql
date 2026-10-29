-- DRAFT: apply only after backup and approval. No live database changes in preview.
DROP POLICY IF EXISTS manager_rates_read ON spaceops.payroll_rates;
CREATE POLICY manager_rates_read ON spaceops.payroll_rates FOR SELECT TO spaceops_runtime USING(spaceops.actor_role()='manager');
-- Rollback: DROP POLICY manager_rates_read ON spaceops.payroll_rates;
