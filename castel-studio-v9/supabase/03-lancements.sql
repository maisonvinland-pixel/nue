-- ============================================================================
-- CASTEL STUDIO — Supabase · formulaires de lancement (déjà appliqué)
-- Le formulaire de bienvenue.html (après paiement) écrit une ligne ici :
-- le cockpit propose alors de démarrer la livraison du client.
-- ============================================================================
create table if not exists public.lancements (
  id uuid primary key default gen_random_uuid(),
  cree_le timestamptz not null default now(),
  agence text not null check (char_length(agence) between 2 and 160),
  ville text check (char_length(ville) <= 120),
  email text check (char_length(email) <= 160),
  telephone text check (char_length(telephone) <= 30),
  details jsonb not null default '{}'::jsonb
);
alter table public.lancements enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'lancements' and policyname = 'insert_public') then
    create policy insert_public on public.lancements for insert to anon with check (true);
  end if;
end $$;
