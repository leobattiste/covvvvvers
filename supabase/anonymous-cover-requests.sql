-- Run in the Supabase SQL editor before deploying anonymous cover requests.
-- Existing signed-in submissions and admin review continue to work.
alter table public.submissions alter column user_id drop not null;
drop policy if exists "public request covers" on public.submissions;
create policy "public request covers" on public.submissions
  for insert to anon, authenticated
  with check (user_id is null or user_id = auth.uid());
grant insert on public.submissions to anon, authenticated;
