# Espace membre 100% REQUIN

Plateforme de formation réservée aux acheteurs : 4 secteurs, 67 chapitres, 142 scripts, prompts et modèles copiables, recherche plein texte, progression, accès protégé côté serveur.

- **Site statique** généré par un petit moteur Node (`src/`), sans framework : rapide, sans base de données, facile à maintenir.
- **Contenu en Markdown** (`content/`) : ajouter un chapitre = ajouter un fichier.
- **Accès protégé** par un middleware Vercel (`middleware.js` → `auth/`) qui s'exécute avant chaque requête, fichiers statiques compris.

## Démarrer en local

```bash
cd formation
npm ci
npm run build          # génère dist/ et vérifie tous les liens internes
npm test               # tests du build et du contrôle d'accès
AUTH_DEV_BYPASS=1 npm run dev   # http://localhost:4321 sans connexion
```

Pour tester la vraie connexion en local, crée un fichier `.env.local` (non versionné) avec `SESSION_SECRET` et `ACCESS_CODES` (voir plus bas), puis `npm run dev`.

## Arborescence

```
formation/
├── site.config.js        Secteurs et modules (titres, descriptions, icônes, ordre)
├── content/
│   ├── demarrer/         5 chapitres — bienvenue, plan 30 jours, FAQ, glossaire, mot de la fin
│   ├── smma/             23 chapitres — 7 modules
│   ├── ecommerce/        25 chapitres — ebook Notion (23 chapitres + lexique) + 1 chapitre légal exclusif
│   └── fiscalite/        14 chapitres — 3 modules
├── src/
│   ├── build.js          Générateur : lecture, validation, rendu, index de recherche
│   ├── markdown.js       Markdown enrichi (encadrés, blocs copiables, étapes…)
│   ├── templates.js      Gabarits HTML des pages
│   └── icons.js          Jeu d'icônes SVG
├── assets/               styles.css, app.js (interactions), theme.js, favicon
├── auth/                 Sessions signées, codes d'accès, Discord OAuth, page de connexion
├── middleware.js         Point d'entrée du middleware Vercel
├── scripts/              Serveur de dev, générateur de codes d'accès
├── tests/                Tests (node --test)
└── vercel.json           Build, en-têtes de sécurité, cache
```

Pages générées : `/` (tableau de bord), `/bibliotheque/`, `/ressources/` (scripts & modèles), `/<secteur>/`, `/<secteur>/<chapitre>/`, `/data/search.json` (index de recherche, protégé).

## Ajouter ou modifier un chapitre

1. Crée `content/<secteur>/NN-slug-du-chapitre.md` (NN = ordre dans le module).
2. En-tête obligatoire :

```markdown
---
title: Titre du chapitre
description: Une à deux phrases, affichées sous le titre et dans les cartes.
module: prospection            # id d'un module du secteur (site.config.js)
icon: phone                     # optionnel, voir src/icons.js
updated: 2026-10-13             # date de mise à jour (AAAA-MM-JJ)
verified: 2026-10-13            # optionnel : date de vérification des règles (fiscalité)
origin: exclusif                # livre | mixte | exclusif
source: Livre, chapitre 04      # libellé de l'origine
---
```

3. Rédige le corps en Markdown (titres `##` et `###`, pas de `#`). Syntaxes propres à la plateforme :

| Syntaxe | Rendu |
| --- | --- |
| `> [!ASTUCE] Titre` (ou `INFO`, `ATTENTION`, `ERREUR`, `LEGAL`, `EXEMPLE`, `CHIFFRE`) | Encadré pédagogique |
| ` ```copy title="…" kind="script" ` (kinds : `script`, `prompt`, `message`, `email`, `modele`, `clause`, `checklist`) | Bloc copiable, repris automatiquement dans « Scripts & modèles » |
| `:::steps` … `:::` | Liste ordonnée présentée en étapes |
| `:::recap` … `:::` | « L'essentiel à retenir » |
| `:::exercise Titre` … `:::` | Exercice pratique |
| `:::cols` … `+++` … `:::` | Deux colonnes |
| `:::stat 95 %` … `:::` | Chiffre clé |
| `- [ ] tâche` | Case à cocher mémorisée |
| `[texte](@smma/slug#ancre)` | Lien interne **vérifié au build** |

4. `npm run build` : le build échoue avec un message clair si un lien interne, une ancre, un module ou un champ obligatoire est incorrect.

Pour ajouter un **secteur** : ajoute une entrée dans `site.config.js` et crée le dossier `content/<slug>/`.

### Réimporter l'ebook depuis Notion

Le secteur E-commerce est généré à partir des pages Notion publiées (HTML rendu, une page par chapitre `chNN.html`) par `scripts/notion-import.py` (Python 3 + BeautifulSoup) :

```bash
python3 scripts/notion-import.py <dossier_des_chNN.html> content/ecommerce
```

Le script conserve gras, italique, listes (imbriquées), tableaux, cases à cocher, encadrés (« À retenir », « Erreur à éviter », « Astuce de pro », « L'IA peut t'aider »), missions (exercices) et transforme chaque bloc de code en prompt ou modèle copiable. Il écrase les fichiers `01` à `24` ; le chapitre exclusif `25-vendre-en-ligne-dans-les-regles.md` n'est pas touché.

## Contrôle d'accès

Le middleware refuse tout le contenu (pages, index de recherche) sans session valide. Seuls `/assets/*` (CSS, JS, icône) et `/robots.txt` sont publics. **Sans `SESSION_SECRET`, le site renvoie une page « configuration incomplète » : rien n'est servi par défaut.**

Deux méthodes de connexion, activables indépendamment :

### 1. Discord (recommandé pour les membres du serveur)

L'utilisateur se connecte avec Discord ; l'accès est accordé s'il est **membre du serveur** et, si configuré, s'il possède **un des rôles autorisés** (par exemple le rôle attribué automatiquement aux abonnés).

1. Sur <https://discord.com/developers/applications>, crée une application → **OAuth2** : ajoute l'URL de redirection `https://<ton-domaine>/auth/discord/callback`.
2. Récupère le **Client ID** et le **Client Secret**.
3. Dans Discord (mode développeur activé), copie l'**ID du serveur** et l'**ID du ou des rôles** donnant accès.

### 2. Codes d'accès personnels (pour les ventes hors Discord)

```bash
npm run code:new -- "Prénom Nom ou n° de commande"
```

Le script affiche le code à transmettre à l'acheteur (`RQ-XXXX-XXXX-XXXX-XXXX`) et la ligne `libellé:empreinte` à ajouter à `ACCESS_CODES`. Seule l'empreinte SHA-256 est stockée. Pour révoquer un code : retire sa ligne et redéploie.

### Variables d'environnement (Vercel → Settings → Environment Variables)

| Variable | Obligatoire | Rôle |
| --- | --- | --- |
| `SESSION_SECRET` | **Oui** | Clé de signature des sessions, 32 caractères minimum (ex. `openssl rand -base64 48`). La changer déconnecte tout le monde. |
| `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, `DISCORD_GUILD_ID` | Pour Discord | Active la connexion Discord |
| `DISCORD_ROLE_IDS` | Recommandé | IDs de rôles autorisés, séparés par des virgules. Vide = tout membre du serveur. |
| `ACCESS_CODES` | Pour les codes | Lignes `libellé:empreinte`, séparées par des virgules ou des retours à la ligne |
| `SESSION_TTL_DISCORD_DAYS` / `SESSION_TTL_CODE_DAYS` | Non | Durée des sessions (7 et 30 jours par défaut) |
| `PUBLIC_URL` | Non | URL publique si elle diffère de l'hôte de la requête |
| `JOIN_URL` | Non | Lien « Rejoindre » de la page de connexion |

### Ce qui est sécurisé, et les limites

- ✅ Contenu, index de recherche et pages servis uniquement avec une session signée (HMAC-SHA256), cookie `HttpOnly`, `Secure`, `SameSite=Lax`.
- ✅ Jetons falsifiés, expirés ou signés avec une autre clé refusés (tests automatisés).
- ✅ Redirections après connexion limitées aux chemins internes ; état OAuth vérifié.
- ⚠️ Une session reste valide jusqu'à son expiration : un membre qui perd son rôle Discord garde l'accès jusqu'à 7 jours (durée réglable). Pour couper tout le monde immédiatement : changer `SESSION_SECRET`.
- ⚠️ Un membre connecté peut toujours copier ou enregistrer ce qu'il lit : aucune solution web ne l'empêche.
- ⚠️ La progression est stockée dans le navigateur (par compte et par appareil), pas sur un serveur.

## Déploiement sur Vercel

1. Importe le dépôt dans Vercel et règle **Root Directory = `formation`** (le reste du dépôt est le framework Nue, non concerné).
2. Ajoute les variables d'environnement ci-dessus (au minimum `SESSION_SECRET` et une méthode de connexion).
3. Déploie. `vercel.json` définit le build (`npm run build` → `dist/`), les en-têtes de sécurité et le cache.
4. Branche ton domaine (Settings → Domains) et mets à jour l'URL de redirection Discord.

> Vérifie les conditions de l'offre Vercel choisie : l'offre gratuite (Hobby) est réservée à un usage personnel non commercial ; une formation payante relève normalement d'une offre payante.

## Maintenance du contenu juridique et fiscal

Les chapitres du secteur Fiscalité affichent « Règles vérifiées le … ». Les seuils et taux changent souvent au 1er janvier et au 1er juillet : à chaque changement, mets à jour le chapitre concerné, puis les champs `updated` et `verified`. Les chiffres 2026 cités se trouvent principalement dans `fiscalite/04`, `05`, `06`, `07`, `08`, `smma/22` et `ecommerce/25`.
