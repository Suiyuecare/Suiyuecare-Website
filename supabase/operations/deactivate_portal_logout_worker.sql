-- Emergency stop; run in the Portal project before rolling back the API.
begin;
update private.portal_logout_worker_config set enabled = false where singleton;
select cron.unschedule('portal-logout-worker-minute');
commit;
