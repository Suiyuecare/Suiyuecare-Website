do $$
begin
  if to_regclass('public.cms_mojibake_backup_20260523') is not null then
    drop policy if exists "Deny public access to mojibake backup" on public.cms_mojibake_backup_20260523;
    create policy "Deny public access to mojibake backup"
      on public.cms_mojibake_backup_20260523
      for all
      to anon, authenticated
      using (false)
      with check (false);
  end if;
end $$;
