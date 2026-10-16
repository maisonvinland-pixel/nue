# Castel Studio v9 — refonte immobilier

Dossier prêt à déposer tel quel sur Netlify (glisser-déposer, ou dépôt Git avec ce dossier comme racine).
`LISEZMOI.md`, `_sources/`, `supabase/` et `changer-domaine.py` ne sont jamais servis (voir `_redirects`).

## À faire avant la mise en ligne

1. **Identité légale** : remplir les 4 champs de `_sources/identite.json` (nom de l'entrepreneur, SIREN,
   adresse de domiciliation, régime de TVA — ex. « TVA non applicable, art. 293 B du CGI »), puis :
   `python3 _sources/construire.py .`  → régénère toutes les pages HTML et le sitemap.
   Tant qu'un champ est vide, il apparaît surligné dans les mentions légales, les CGV et la page confidentialité.
2. **Stripe** (`assets/js/config.js` → `stripe`) : créer deux liens de paiement
   - `setup1x` : produit « Pack Monopole — mise en place » 990 € HT ;
   - `setup2x` : « Pack Monopole — 1re échéance » 495 € HT (la 2e échéance est facturée à la mise en service).
   Dans chaque lien : « Après le paiement » → rediriger vers `https://castelstudio.netlify.app/bienvenue.html`.
   L'abonnement de 149 € HT/mois est créé à la mise en service (abonnement Stripe ou facture récurrente).
   Tant que les liens sont vides, les boutons « Payer » mènent au formulaire de contact, offre pré-cochée.
3. **Prise de rendez-vous** (`config.js` → `reservation`) : lien Calendly / Cal.com de l'appel de 20 min.
4. **Vidéo** (`config.js` → `videoDemo`) : MP4, YouTube ou Vimeo. Vide → le film animé `film.html` est joué.
5. **Netlify Forms** : activer la détection des formulaires. Deux formulaires remontent : `contact` et `audit`.
6. **Supabase** : exécuter `supabase/01-securite-et-citations.sql` (vérification RLS, verrou sur `demandes` et `audits`).

## Ce qui a changé par rapport à la v8

- Pages supprimées (redirigées en 301 vers l'offre ou le nouvel article) : seo-local, site-vitrine,
  fiche-google, collecte-avis, page-locale, suivi, et les six anciens articles.
- Scripts supprimés : panier.js, promo.js, reel.js. Ajoutés : lecteur.js. Réécrits : castel.js (audit,
  tunnel Stripe, comparatif), assistant.js, formulaire.js, accueil.js.
- Images des maquettes artisans supprimées ; illustrations du blog et image de partage refaites.
- Google Analytics n'est plus chargé sans consentement ; le micro de l'assistant est autorisé (Permissions-Policy).
- `vercel.json` retiré : le site est servi par Netlify (`_headers`, `_redirects`).
