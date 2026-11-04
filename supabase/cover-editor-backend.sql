-- Covvvvvers: album import identity and cover-specific creator credits.
-- Already applied to the connected Supabase project on 2026-11-04.
-- Idempotent for environments where this upgrade has not run.
alter table public.covers
  add column if not exists musicbrainz_release_group_id uuid;

create unique index if not exists covers_musicbrainz_release_group_unique
  on public.covers (musicbrainz_release_group_id)
  where musicbrainz_release_group_id is not null;

alter table public.cover_creators
  add column if not exists role text;

-- Preserve existing credits while moving their role to each cover relationship.
update public.cover_creators cc
set role = c.role
from public.creators c
where cc.creator_id = c.id
  and cc.role is null
  and c.role is not null;
