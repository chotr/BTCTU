-- 0003 was amended after it had already been published, so a database that ran the
-- earlier 0003 has no outcome constraint at all. Dropping first makes this
-- migration safe on both kinds of database instead of failing on the ones that
-- already have the constraint.
ALTER TABLE "audit_events" DROP CONSTRAINT IF EXISTS "audit_events_outcome_check";--> statement-breakpoint
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_outcome_check" CHECK ("audit_events"."outcome" in ('SUCCESS', 'DENIED', 'FAILED'));
