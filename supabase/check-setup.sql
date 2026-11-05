-- Shows which of the setup files have already been run on this database.
-- Run it first; then run only the files marked "not yet".
select 'features.sql' as file,
  case when to_regclass('public.lists') is not null and to_regclass('public.subscribers') is not null then 'done' else 'not yet' end as status
union all
select 'mix-added.sql',
  case when (select count(distinct date_trunc('minute', created_at)) from public.covers) > 5 then 'done (probably)' else 'not yet' end
union all
select 'new-covers.sql',
  case when exists (select 1 from public.covers where slug = 'criminal-minded') then 'done' else 'not yet' end
union all
select 'account.sql',
  case when exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'profiles' and column_name = 'avatar_cover_id')
        and to_regprocedure('public.delete_my_account()') is not null then 'done' else 'not yet' end
union all
select 'us-only.sql',
  case when not exists (select 1 from public.covers where coalesce(country, '') not in ('United States', 'USA', 'US', 'United States of America')) then 'done' else 'not yet' end
union all
select 'anonymous-cover-requests.sql',
  case when exists (select 1 from pg_policies where tablename = 'submissions' and policyname = 'public request covers') then 'done' else 'not yet' end
union all
select 'cover-editor-backend.sql',
  case when exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'cover_creators' and column_name = 'role') then 'done' else 'not yet' end
union all
select 'you are admin',
  case when exists (select 1 from public.profiles p join auth.users u on u.id = p.id where u.email = 'leobaptistea@gmail.com' and p.is_admin) then 'done' else 'not yet' end;
