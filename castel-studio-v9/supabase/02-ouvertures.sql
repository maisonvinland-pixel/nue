-- ============================================================================
-- CASTEL STUDIO — Supabase · ouvertures des diagnostics (déjà appliqué)
-- Chaque ouverture d'une page d/*.html écrit une ligne ici. Le site écrit,
-- personne ne lit sans être connecté (RLS sans règle de lecture).
-- ============================================================================
create table if not exists public.ouvertures (
  id uuid primary key default gen_random_uuid(),
  cree_le timestamptz not null default now(),
  slug text not null check (char_length(slug) between 3 and 160),
  agence text check (char_length(agence) <= 200)
);
alter table public.ouvertures enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'ouvertures' and policyname = 'insert_public') then
    create policy insert_public on public.ouvertures for insert to anon with check (true);
  end if;
end $$;
create index if not exists ouvertures_slug_idx on public.ouvertures (slug, cree_le desc);
