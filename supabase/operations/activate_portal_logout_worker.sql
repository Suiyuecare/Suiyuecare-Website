-- Manual production activation after API smoke tests. Confirm the connected
-- database is the Portal project ussnmxdpxeoshlrdchov before running.
-- The migration leaves the worker disabled in every environment.
begin;
create schema if not exists extensions;
create extension if not exists pg_net with schema extensions;
create extension if not exists pg_cron with schema pg_catalog;
select cron.schedule('portal-logout-worker-minute', '* * * * *',
  'select private.portal_logout_dispatch_worker()');
update private.portal_logout_worker_config set enabled = true where singleton;
commit;

-- Verify with:
-- select jobname, schedule, active from cron.job where jobname = 'portal-logout-worker-minute';
-- select enabled from private.portal_logout_worker_config where singleton;
-- select count(*) from private.portal_logout_targets where completed_at is null;
