begin;
create function public.portal_session_status() returns jsonb language plpgsql stable security definer set search_path='' as $$
declare sid uuid;u uuid:=auth.uid();
begin
 begin sid:=nullif(auth.jwt()->>'session_id','')::uuid;exception when invalid_text_representation then raise exception 'PORTAL_SESSION_REVOKED' using errcode='42501';end;
 if sid is null or u is null or not exists(select 1 from auth.sessions where id=sid and user_id=u and (not_after is null or not_after>statement_timestamp()))
 or not exists(select 1 from auth.users au join auth.identities i on i.user_id=au.id where au.id=u and au.email_confirmed_at is not null and i.provider='google' and coalesce((i.identity_data->>'email_verified')::boolean,false) and lower(i.identity_data->>'email')~'^[^[:space:]@]+@suiyuecare[.]com$') then raise exception 'PORTAL_SESSION_REVOKED' using errcode='42501';end if;
 return jsonb_build_object('active',true,'userId',u);
end $$;
revoke all on function public.portal_session_status() from public,anon,service_role;
grant execute on function public.portal_session_status() to authenticated;
create function public.portal_revoke_google_sessions(google_subject text,verified_email text) returns jsonb language plpgsql security definer set search_path='' as $$
declare target uuid; candidates bigint; revoked bigint;
begin
 if length(google_subject)<1 or length(google_subject)>256 or verified_email<>lower(btrim(verified_email)) or verified_email !~ '^[^[:space:]@]+@suiyuecare[.]com$' then raise exception 'PORTAL_LOGOUT_INVALID' using errcode='42501';end if;
 execute 'select count(distinct u.id),min(u.id::text)::uuid from auth.users u join auth.identities i on i.user_id=u.id where i.provider=''google'' and coalesce(i.identity_data->>''sub'',i.provider_id)=$1 and u.email_confirmed_at is not null and coalesce((i.identity_data->>''email_verified'')::boolean,false) and lower(i.identity_data->>''email'')=$2' into candidates,target using google_subject,verified_email;
 if candidates>1 then raise exception 'PORTAL_LOGOUT_IDENTITY_AMBIGUOUS' using errcode='42501';end if;
 if candidates=0 then return jsonb_build_object('revoked',true,'matched',false);end if;
 perform 1 from auth.users where id=target for update;
 execute 'delete from auth.sessions where user_id=$1' using target;get diagnostics revoked=row_count;
 return jsonb_build_object('revoked',true,'matched',true);
end $$;
revoke all on function public.portal_revoke_google_sessions(text,text) from public,anon,authenticated;
grant execute on function public.portal_revoke_google_sessions(text,text) to service_role;
notify pgrst,'reload schema';
commit;
