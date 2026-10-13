---
title: Utiliser l'IA efficacement dans son agence
description: Où l'IA fait gagner du temps, où elle est dangereuse, comment écrire un bon prompt — et une bibliothèque de prompts prêts à l'emploi.
module: ia
icon: bot
updated: 2026-10-13
origin: exclusif
source: Contenu exclusif
---

Le livre pose la limite dès la fin : **l'IA accélère, mais ne remplace jamais la prospection, la relation client, ni le jugement.** Il rappelle aussi qu'un site correct, même avec l'IA, demande au minimum 3 jours de travail sérieux. Ce chapitre t'apprend à l'utiliser là où elle est vraiment utile.

## Où l'IA fait gagner du temps

| Tâche | Gain | Ce qui reste à toi |
| --- | --- | --- |
| Premier jet de textes de site | Élevé | Vérifier chaque information, adapter au ton du client |
| Idées de publications et calendrier éditorial | Élevé | Choisir, adapter à l'actualité réelle du client |
| Personnalisation de messages de prospection | Élevé | L'observation d'audit, qui doit venir de toi |
| Code d'un site vitrine | Moyen à élevé | Tester, sécuriser, rendre accessible, héberger |
| Scripts de vidéos courtes | Moyen | Le tournage, le rythme, l'authenticité |
| Réponses aux avis Google | Moyen | Validation par le client, ton humain |
| Résumé d'un appel client | Moyen | Vérifier que rien d'important n'est oublié |
| Visuels générés | Variable | Droits, cohérence de marque, pas de fausses réalisations |

## Où l'IA est dangereuse

> [!ERREUR] Les cinq pièges
> - **Inventer des faits** : l'IA peut écrire « fondée en 1998 » ou « 500 chantiers réalisés » sans aucune source. Chaque fait sur un client doit venir du client.
> - **Inventer des règles** : ne demande jamais à une IA un seuil fiscal ou une obligation légale sans vérifier sur la source officielle.
> - **Données confidentielles** : ne colle pas dans un outil d'IA des données personnelles de clients, des mots de passe ou des contrats sans savoir comment l'outil les traite (vérifie ses conditions et désactive l'entraînement sur tes données si possible).
> - **Contenu générique** : un texte d'IA non retravaillé se reconnaît, et ne différencie pas ton client.
> - **Fausses images de réalisations** : présenter une image générée comme un vrai chantier du client est trompeur.

## Écrire un bon prompt

Un bon prompt contient 5 éléments. Plus tu en fournis, moins tu corriges.

:::steps
1. **Le rôle** — « Tu es rédacteur web spécialisé dans les artisans du bâtiment. »
2. **Le contexte** — L'entreprise, la ville, la cible, ce qui la différencie (tes notes de découverte).
3. **La tâche** — Ce que tu veux, précisément (« le texte de la page d'accueil, en 5 sections »).
4. **Les contraintes** — Longueur, ton, mots interdits, vouvoiement, aucun chiffre inventé.
5. **Le format de sortie** — Titres, listes, tableau, nombre de propositions.
:::

> [!ASTUCE] Itérer plutôt que recommencer
> Si la réponse ne convient pas, ne relance pas de zéro : dis ce qui ne va pas (« trop formel », « la section 2 est trop longue, garde 3 phrases »). Et garde tes meilleurs prompts dans un document : c'est un actif de ton agence.

## La bibliothèque de prompts

Tous ces prompts sont aussi disponibles sur la page [Scripts & modèles](/ressources/), filtre « Prompt IA ».

```copy title="Textes d'un site vitrine" kind="prompt"
Tu es rédacteur web pour des TPE locales françaises. Rédige les textes d'un site vitrine d'une page pour l'entreprise suivante.

Entreprise : [nom] — Métier : [métier] — Ville et zone : [zone]
Services principaux : [liste]
Ce qui la différencie (selon le client) : [éléments]
Clientèle visée : [particuliers / pros, type de projets]
Ton souhaité : [ex. chaleureux et rassurant, vouvoiement]

Structure attendue :
1. Titre principal (8 mots max) + sous-titre (20 mots max) qui disent ce que le client y gagne
2. Section services (une phrase par service)
3. Section « Pourquoi nous choisir » (3 arguments, uniquement à partir des éléments fournis)
4. Section zone d'intervention
5. Appel à l'action final

Contraintes : aucun chiffre, aucune date, aucun label ou certification qui ne figure pas dans mes informations ; signale entre crochets ce que je dois demander au client.
```

```copy title="Calendrier éditorial d'un mois" kind="prompt"
Tu es community manager pour un(e) [métier] à [ville]. Propose un calendrier de [8] publications pour le mois de [mois].

Contexte : [saison, événements locaux, actualité de l'entreprise, nouveautés]
Formats disponibles : [photos de réalisations, vidéos courtes, carrousels, stories]
Objectif principal : [ex. faire demander des devis pour des salles de bain]

Pour chaque publication, donne : date suggérée, format, idée en une phrase, accroche (première ligne), texte (60 mots max), appel à l'action. Varie les formats et n'invente aucune information sur l'entreprise.
```

```copy title="Script de vidéo courte (Reel / TikTok)" kind="prompt"
Écris 3 scripts de vidéos verticales de 20 à 30 secondes pour un(e) [métier] à [ville], filmables au téléphone, sans acteur, par le gérant lui-même.

Pour chaque script : l'accroche des 2 premières secondes (texte à l'écran + phrase dite), 3 à 5 plans décrits simplement (ce qu'on filme), le texte en voix off ou face caméra, le texte de la légende, et l'appel à l'action final.
Thèmes : [ex. un avant/après de chantier ; une erreur fréquente que font les clients ; une journée type].
```

```copy title="Réponses aux avis Google" kind="prompt"
Tu réponds aux avis Google au nom de [nom de l'entreprise], [métier] à [ville]. Ton : [chaleureux, professionnel], vouvoiement, signature « [prénom], [entreprise] ».

Pour chaque avis ci-dessous, propose une réponse de 2 à 4 phrases :
- avis positif : remercier en reprenant un détail précis de l'avis ;
- avis négatif : remercier pour le retour, reconnaître sans se justifier longuement, proposer d'en parler en direct (téléphone ou e-mail), ne jamais divulguer d'information personnelle sur le client.

Avis :
[colle les avis]
```

```copy title="Résumé d'un appel de découverte" kind="prompt"
Voici mes notes brutes d'un rendez-vous avec un prospect :
[colle tes notes]

Produis : (1) un résumé en 5 points de sa situation, (2) ses objectifs avec ses propres mots, (3) les objections ou hésitations exprimées, (4) les informations manquantes à lui demander, (5) l'offre de mon catalogue la plus adaptée parmi : [liste de tes packs], avec la justification. N'ajoute rien qui ne soit pas dans mes notes.
```

```copy title="Génération d'une maquette de site (outil de code IA)" kind="prompt"
Crée une page d'accueil de site vitrine en HTML et CSS (un seul fichier index.html, sans dépendance externe hormis une police Google), responsive, accessible (contrastes suffisants, textes alternatifs), rapide à charger.

Entreprise : [nom], [métier] à [ville]. Couleurs : [couleurs]. Ton : [ton].
Sections, dans l'ordre : en-tête avec numéro cliquable ; bandeau principal (titre + sous-titre + bouton « Appeler » et bouton « Demander un devis ») ; services ; réalisations (emplacements d'images avec texte alternatif) ; avis ; zone d'intervention ; contact (formulaire nom/téléphone/message) ; pied de page avec lien « Mentions légales ».

Textes : [colle les textes validés]. N'invente aucune donnée (adresse, chiffres, labels) : utilise des crochets là où l'information manque.
```

## Choisir ses outils

Les outils évoluent tous les mois : apprends des **catégories**, pas des marques.

| Catégorie | Usage dans l'agence |
| --- | --- |
| Assistant conversationnel (type Claude, ChatGPT…) | Textes, analyses, prompts, code |
| Assistant de code / agent de développement | Création et modification de sites |
| Création graphique avec IA intégrée | Visuels, déclinaisons de formats |
| Montage vidéo assisté (sous-titres automatiques, découpe) | Vidéos courtes |
| Transcription | Comptes rendus d'appels (avec l'accord de l'interlocuteur pour tout enregistrement) |
| Automatisation (n8n et équivalents) | Relier les outils entre eux (chapitre suivant) |

> [!LEGAL] Enregistrer un appel
> N'enregistre jamais un appel ou un rendez-vous sans en informer ton interlocuteur et obtenir son accord.

:::exercise Ta bibliothèque personnelle
Crée un document « Prompts de l'agence ». Copie les prompts de ce chapitre, teste-les sur un client réel ou fictif, et améliore chacun après usage. Note à côté le temps gagné : c'est ce chiffre qui te dira où investir.
:::

:::recap
- L'IA fait gagner du temps sur les premiers jets ; la vérification, l'observation et la relation restent à toi.
- Jamais de fait inventé, de règle non vérifiée, de donnée client confidentielle collée sans précaution.
- Un bon prompt : rôle, contexte, tâche, contraintes, format.
- Tes meilleurs prompts sont un actif : documente-les.
:::
