# Moteur Castel — la routine automatique

Ce fichier est le mode d'emploi que suit Claude à chaque passage programmé
(du lundi au vendredi, vers 8 h et vers 14 h, heure de Paris). Il sert aussi
de référence si vous voulez lancer un passage à la main : « Fais un passage
du moteur Castel ».

## Les sources

| Quoi | Où |
|---|---|
| Cockpit (base de données) | https://claude.ai/artifact/EMEMURXfE46dAScMbUu2Lg — outil `ArtifactData` |
| Site | dépôt `maisonvinland-pixel/nue`, branche `castel-studio-v9`, dossier `castel-studio-v9/` |
| Ouvertures, leads, paiements | Supabase, projet `ponwkdlasixpmxagxlxk` : tables `ouvertures`, `audits`, `demandes`, `lancements` |
| Emails (quand le connecteur est relié) | Gmail : brouillons et lecture des réponses |
| Relevé Google Maps | Firecrawl (`firecrawl_scrape` sur `google.com/maps/search/...`) |

Collections du cockpit : `reglages/principal`, `prospects/<slug>`, `leads/<id>`,
`clients/<id>`, `taches/<id>`, `journal/<id>`.

Le cockpit lit aussi Supabase en direct (toutes les minutes quand il est ouvert) : le
moteur couvre les moments où personne ne l'a ouvert.

## Passage du matin (complet)

1. **Lire `reglages/principal`.** Si `actif` vaut `false` : écrire une ligne de
   journal « Moteur coupé, rien fait » et s'arrêter.
2. **Synchroniser les signaux** (voir passage de l'après-midi).
3. **Prospection.** Compter les prospects au statut `pret`. S'il y en a moins que
   `quota` × 2, relever de nouvelles agences jusqu'à atteindre `quota` nouvelles :
   - pour chaque ville de `villes`, scraper `https://www.google.com/maps/search/agence+immobili%C3%A8re+<ville>/?hl=fr`
     (format markdown). Noter rang, nom, note, nombre d'avis, site web ;
   - garder les 3 premières comme concurrents (c1..c3) ;
   - **écarter** les franchises et réseaux : Laforêt, Orpi, Century 21, Guy Hoquet,
     Stéphane Plaza, Nestenn, Citya, Foncia, l'Adresse, ERA, Square Habitat,
     Arthurimmo, Nicole Joubert, Sixième Avenue, La Visite, Espaces Atypiques,
     Capifrance, iad, Safti, Optimhome, Megagence, BSK, Barnes, Sotheby's,
     Engel & Völkers, Coldwell Banker, Keller Williams — et toute fiche qui affiche un réseau ;
   - **viser** : indépendantes classées entre la 4e et la 20e place, ou hors du
     top 20 avec une bonne note, et moins de 80 avis ;
   - pour une indépendante hors du top 20, scraper sa fiche (`google.com/maps/search/<nom>+<ville>`)
     pour la note et les avis ; position = 21 ;
   - trouver l'email sur son site (accueil, contact, mentions légales). Prénom du
     dirigeant s'il est écrit. Ne jamais deviner un email ;
   - ignorer toute agence déjà présente dans `prospects` (même slug ou même nom + ville).
4. **Diagnostics.** Écrire `castel-studio-v9/_pilotage/prospects.csv` (colonnes de
   `prospects-modele.csv`, cases de constats laissées **vides** : un point non
   vérifié n'est jamais affiché), puis :
   `python3 castel-studio-v9/_pilotage/diagnostics.py castel-studio-v9/_pilotage/prospects.csv`.
   Commiter les nouvelles pages `castel-studio-v9/d/*.html` et pousser sur
   `castel-studio-v9` (Netlify déploie si le site est relié à GitHub).
5. **Cockpit.** Pour chaque ligne de `_pilotage/envois.json`, créer `prospects/<slug>` :
   `agence, ville, email, prenom, note, avis, position` (texte : « 9e » ou « hors top 20 »),
   `leader` (max des avis c1..c3), `lien, slug, objet, j0 (email_j0), j3 (relance_j3), j7 (relance_j7)`,
   `statut: "pret"`, `relance: 0`, `cree_le` (ISO). En lot (`batch`, 50 max).
6. **Journal + réglages.** Ajouter `journal/<AAAAMMJJ-matin>` `{quand, texte, type:"matin"}`
   (ce qui a été relevé, retenu, écarté, généré, poussé). Mettre `reglages/principal.dernier_passage`.

## Passage de l'après-midi (signaux)

1. **Ouvertures** : `select slug, count(*) n, max(cree_le) dernier from ouvertures where cree_le > now() - interval '30 days' group by slug`.
   Pour chaque slug présent dans `prospects` : `ouvertures = n`, `ouvert_le = dernier` ; si le
   statut est `envoye`, le passer à `ouvert`. Ne jamais rétrograder un statut
   (`repondu`, `gagne`, `perdu`, `stop` restent tels quels).
2. **Leads du site** : `audits` avec email non nul et `demandes`, créés depuis le
   dernier passage. Créer `leads/<id Supabase>` `{type: "audit"|"contact", nom, entreprise, email, telephone, score, message, quand, statut: "nouveau"}`
   si absent.
3. **Paiements** : pour chaque ligne de `lancements` qui n'a pas encore de client
   (`clients` dont `lancement_id` = son id), créer `clients/<slug du prospect ou l-<8 premiers caractères de l'id>>`
   `{agence, ville, email, telephone, lancement_id, slug, details, debut: <cree_le>, abonnement_actif: false, etapes}`
   avec les étapes du cockpit (bienvenue J+1, acces J+2, avis J+5, fiche J+7, page J+7,
   historique J+10, service J+14, garantie J+44, chacune `{cle, j, titre, fait: false}`),
   et passer le prospect lié en `gagne`. Notifier : c'est un client qui vient de payer.
4. **Gmail** (seulement si le connecteur répond) :
   - réponses : chercher les fils reçus depuis le dernier passage dont l'expéditeur
     est l'email d'un prospect `envoye` ou `ouvert` ; passer le prospect en `repondu`,
     `repondu_le`, et créer un brouillon de réponse dans le fil (règles du Kit : écrit,
     court, vers la réservation, aucun chiffre inventé). Un « stop » passe en `stop`, sans brouillon ;
   - matin uniquement : créer les brouillons J0 des prospects `pret` (au plus `quota`, par
     potentiel décroissant) et les brouillons J3/J7 des relances dues, puis noter
     `brouillon_le` sur le prospect. Ne jamais envoyer.
5. **Vendredi, passage de l'après-midi** : écrire `journal/<AAAAMMJJ-bilan>` avec le bilan de
   la semaine (envoyés, ouvertures, réponses, ventes, taux, la décision pour la semaine
   suivante : villes à garder ou changer, objet d'email à tester).
6. **Journal** : une ligne `journal/<AAAAMMJJ-midi>` et `dernier_passage`.

## Règles

- Ne jamais envoyer d'email, de SMS ni de message à la place de l'utilisateur.
- N'écrire dans un diagnostic que ce qui a été constaté sur Google Maps.
- Les positions relevées sont indicatives (le relevé ne part pas de la ville) : le
  dire dans le journal si un écart semble douteux.
- Une agence qui a répondu « stop » ne revient jamais dans la prospection.
- Au-delà de 2 passages ratés de suite, envoyer une notification.
