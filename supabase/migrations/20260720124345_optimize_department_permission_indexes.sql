-- Cover the audit foreign key used when memberships are reassigned.
create index if not exists department_memberships_created_by_idx
on public.department_memberships(created_by)
where created_by is not null;

-- The department approval migration supersedes the legacy index with the same
-- predicate. Keep one unique index so inserts do not pay the cost twice.
drop index if exists public.publish_requests_one_pending_per_entity_idx;
