# Portal 跨模組登出背景補償

Portal API 先將精確 Google subject、已驗證電郵、建立時的 UTC `createdBefore` 截止時間及四個撤銷目標寫入 Portal 資料庫的 `private.portal_logout_*` outbox，再撤銷發起模組的 Auth session。其餘模組若失敗，API 回傳 `202 pending`，已完成的目標保持完成，背景 worker 僅重試未完成者。每次撤銷都使用原任務的 `createdBefore`，只刪除 `auth.sessions.created_at < createdBefore` 的舊 session，避免背景重試撤銷之後新登入的 session。表格啟用 RLS，只有 service-role RPC 能存取；已全部完成且超過 30 天的任務會清除。

新 migration **不啟用排程**。正式啟用前須核對目前連線確為 Portal Supabase 專案 `ussnmxdpxeoshlrdchov`，確認四模組撤銷器與 `/api/portal-handoff?action=logout-worker` 已部署，並以測試帳號驗證 200、202 及補償流程。之後才執行 [activate_portal_logout_worker.sql](activate_portal_logout_worker.sql)。此腳本每分鐘用 Supabase Cron 呼叫 `private.portal_logout_dispatch_worker()`，由 pg_net 送出一次性、兩分鐘內有效的 ticket；固定密鑰不進入 pg_net request queue。

由於本協調器固定指向四個正式 Supabase 專案及 APM 正式網域，API 只在 `VERCEL_ENV=production` 執行。Preview 不會用正式身分與金鑰撤銷任何 session；正式跨模組驗收需在受控的正式發布窗口進行。

運作檢查：

```sql
select jobname, schedule, active from cron.job where jobname = 'portal-logout-worker-minute';
select enabled from private.portal_logout_worker_config where singleton;
select count(*) as pending_targets from private.portal_logout_targets where completed_at is null;
select j.id, j.source, j.created_at, t.module_id, t.attempts, t.next_attempt_at
from private.portal_logout_jobs j
join private.portal_logout_targets t on t.job_id = j.id
where t.completed_at is null
order by j.created_at;
```

發生異常時先執行 [deactivate_portal_logout_worker.sql](deactivate_portal_logout_worker.sql)，保留 outbox 及尚未完成任務供修復。僅回退 Vercel 程式碼會留下無 worker 的待補償任務；回退前須先確認佇列清空或部署相容 worker。資料庫 migration 不應在存在未完成任務時直接刪除。APM HMAC 值需由 Portal 的 `APM_PORTAL_LOGOUT_SECRET` 與 APM 的 `PORTAL_LOGOUT_SECRET` 共用，且與 handoff secret 分開。
