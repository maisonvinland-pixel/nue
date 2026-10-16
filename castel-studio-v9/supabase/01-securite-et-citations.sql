-- ============================================================================
-- CASTEL STUDIO — Supabase · script v9 (immobilier)
-- À exécuter dans Supabase → SQL Editor → New query → Run.
-- Idempotent : relançable sans risque.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 1) VÉRIFICATION DE SÉCURITÉ (à lancer EN PREMIER, avant tout le reste)
--    La clé « anon » est publique par nature : elle est visible dans
--    assets/js/config.js. La seule protection réelle est la RLS.
--    Si une table apparaît avec rls_active = false ci-dessous, n'importe qui
--    peut lire ou vider vos demandes de devis.
-- ----------------------------------------------------------------------------
select
  c.relname                as table_name,
  c.relrowsecurity         as rls_active,
  (select count(*) from pg_policies p
    where p.schemaname = 'public' and p.tablename = c.relname) as nb_policies
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r'
order by c.relname;


-- ----------------------------------------------------------------------------
-- 2) VERROU MINIMAL SUR LES DEMANDES DE DEVIS
--    Objectif : le site peut ÉCRIRE (insert) sans être connecté,
--    mais personne ne peut LIRE, MODIFIER ou SUPPRIMER sans être authentifié.
--    Adaptez le nom de la table si la vôtre s'appelle autrement.
-- ----------------------------------------------------------------------------
do $$
begin
  if to_regclass('public.demandes') is not null then

    execute 'alter table public.demandes enable row level security';

    -- écriture publique (le formulaire du site)
    if not exists (select 1 from pg_policies
                   where tablename = 'demandes' and policyname = 'insert_public') then
      execute $p$
        create policy insert_public on public.demandes
        for insert to anon with check (true)
      $p$;
    end if;

    -- lecture réservée aux comptes connectés (console admin)
    if not exists (select 1 from pg_policies
                   where tablename = 'demandes' and policyname = 'select_authentifie') then
      execute $p$
        create policy select_authentifie on public.demandes
        for select to authenticated using (true)
      $p$;
    end if;

    -- mise à jour réservée aux comptes connectés
    if not exists (select 1 from pg_policies
                   where tablename = 'demandes' and policyname = 'update_authentifie') then
      execute $p$
        create policy update_authentifie on public.demandes
        for update to authenticated using (true) with check (true)
      $p$;
    end if;

  end if;
end $$;


-- ----------------------------------------------------------------------------
-- 2 bis) MÊME VERROU POUR LES AUDITS
--    L'audit en ligne écrit dans « audits » (score, réponses, priorités, nom,
--    email, téléphone). On ne pose les règles QUE si la table n'en a aucune :
--    des règles déjà en place ne sont jamais élargies par ce script.
--    La table « avis » n'est pas touchée ici (elle a ses propres règles, dont
--    l'interdiction pour le public de publier lui-même un avis).
-- ----------------------------------------------------------------------------
do $$
begin
  if to_regclass('public.audits') is not null
     and not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'audits') then
    execute 'alter table public.audits enable row level security';
    execute 'create policy insert_public on public.audits for insert to anon with check (true)';
    execute 'create policy gestion_authentifie on public.audits for all to authenticated using (true) with check (true)';
  end if;
end $$;

-- ----------------------------------------------------------------------------
-- 3) SUIVI DES CITATIONS / BACKLINKS
--    ⚠️ Un Google Sheet suffit tant que vous suivez UN seul site.
--    Elle sert à la mise en cohérence des annuaires incluse dans le Pack
--    Monopole : une agence cliente = une entité, une ligne par annuaire, et un
--    historique daté à montrer dans le rapport mensuel.
-- ----------------------------------------------------------------------------
create table if not exists public.citations (
  id            bigint generated always as identity primary key,
  cree_le       timestamptz not null default now(),
  maj_le        timestamptz not null default now(),

  -- à qui appartient la citation : 'castel-studio' pour vous, sinon le client
  entite        text        not null default 'castel-studio',

  annuaire      text        not null,          -- « Bing Places », « Apple Plans », « PagesJaunes »…
  categorie     text        not null default 'generaliste',
                                               -- generaliste | carto | sectoriel
                                               -- | local | presse | partenaire
  url_soumise   text,                          -- l'URL de la fiche une fois créée
  lien_suivi    boolean     not null default false,   -- lien en dofollow ?

  -- le NAP exact déclaré sur cette fiche, pour repérer les incohérences
  nap_nom       text,
  nap_adresse   text,
  nap_tel       text,

  statut        text        not null default 'a_faire',
                                               -- a_faire | soumis | en_attente
                                               -- | valide | refuse | a_corriger
  date_soumis   date,
  date_valide   date,
  cout_eur      numeric(8,2) not null default 0,
  notes         text
);

create index if not exists citations_entite_idx  on public.citations (entite);
create index if not exists citations_statut_idx  on public.citations (statut);
create unique index if not exists citations_unique_idx
  on public.citations (entite, annuaire);

alter table public.citations enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies
                 where tablename = 'citations' and policyname = 'citations_authentifie') then
    execute $p$
      create policy citations_authentifie on public.citations
      for all to authenticated using (true) with check (true)
    $p$;
  end if;
end $$;

-- horodatage automatique
create or replace function public.touch_maj_le()
returns trigger language plpgsql as $f$
begin new.maj_le = now(); return new; end $f$;

drop trigger if exists citations_touch on public.citations;
create trigger citations_touch before update on public.citations
for each row execute function public.touch_maj_le();


-- ----------------------------------------------------------------------------
-- 5) TABLEAU DE BORD — où en est la campagne ?
-- ----------------------------------------------------------------------------
create or replace view public.v_citations_avancement as
select
  entite,
  count(*)                                                    as total,
  count(*) filter (where statut = 'valide')                   as valides,
  count(*) filter (where statut in ('soumis','en_attente'))   as en_cours,
  count(*) filter (where statut = 'a_faire')                  as restantes,
  round(100.0 * count(*) filter (where statut = 'valide')
        / nullif(count(*), 0), 1)                             as pct_valide,
  sum(cout_eur)                                               as cout_total_eur
from public.citations
group by entite;

-- incohérences de NAP : le point qui casse le référencement local
create or replace view public.v_citations_nap_incoherent as
select entite, annuaire, url_soumise, nap_nom, nap_adresse, nap_tel
from public.citations
where statut = 'valide'
  and (
    nap_nom     is distinct from 'Castel Studio'
 or nap_tel     is distinct from '06 23 06 90 05'
  )
  and entite = 'castel-studio';

-- vérification finale
select * from public.v_citations_avancement;
