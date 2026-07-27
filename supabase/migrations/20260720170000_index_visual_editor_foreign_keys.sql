create index if not exists cms_change_sets_department_idx
on public.cms_change_sets(department_id)
where department_id is not null;

create index if not exists cms_change_sets_reviewer_idx
on public.cms_change_sets(reviewed_by)
where reviewed_by is not null;
