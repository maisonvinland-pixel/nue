---
title: Workflows d'automatisation avec n8n
description: Construire des systèmes reproductibles plutôt que tout faire à la main — les bases de n8n et 5 workflows concrets pour une agence locale.
module: ia
icon: workflow
updated: 2026-10-13
origin: exclusif
source: Contenu exclusif
---

Le livre fixe le bon ordre : **automatiser une fois la méthode rodée.** Automatiser un process que tu ne maîtrises pas à la main, c'est automatiser le chaos. Ce chapitre suppose que tu as déjà livré quelques clients.

## n8n en deux minutes

n8n est un outil d'automatisation visuel : tu relies des **nœuds** (Google Sheets, Gmail, un formulaire, un outil d'IA…) pour créer un **workflow** qui s'exécute tout seul.

- **Déclencheur (trigger)** : ce qui lance le workflow — un formulaire envoyé, une nouvelle ligne dans un tableur, une heure fixe, un webhook.
- **Nœuds d'action** : ce que fait le workflow — lire, écrire, envoyer un e-mail, appeler une IA, filtrer.
- **Données** : chaque nœud reçoit les données du précédent et les transmet au suivant.

On peut l'utiliser en version hébergée (abonnement) ou l'auto-héberger. Les offres et tarifs changent régulièrement : consulte le site officiel au moment de choisir. Des alternatives existent (Make, Zapier) : les principes de ce chapitre s'appliquent à toutes.

> [!ATTENTION] Avant d'automatiser quoi que ce soit
> - Le process existe et fonctionne **à la main** depuis plusieurs semaines.
> - Tu sais exactement ce qui doit se passer dans chaque cas, y compris les erreurs.
> - Les données personnelles traitées sont limitées au nécessaire, et les accès sont protégés.
> - Un humain reste dans la boucle pour tout ce qui part chez un client (au début, valide avant envoi).

## Choisir quoi automatiser

Automatise ce qui est **fréquent, répétitif et sans créativité**. Calcule toujours le gain :

> [!CHIFFRE] Le calcul de rentabilité
> Temps gagné par exécution × nombre d'exécutions par mois = temps gagné par mois. Si un workflow te prend 4 heures à construire et te fait gagner 10 minutes par semaine, il est rentabilisé en un peu plus de 5 mois. S'il en fait gagner 2 heures par semaine, en 2 semaines.

## 5 workflows concrets

### 1. Nouveau lead → tableau → alerte

Pour ton agence : chaque demande reçue via le formulaire de ton site arrive dans ton tableau de suivi et te prévient.

:::steps
1. **Déclencheur** — Webhook ou nœud de formulaire (n8n fournit un nœud « Form Trigger »).
2. **Nettoyage** — Mise en forme du téléphone, du nom, de la date.
3. **Google Sheets** — Ajout d'une ligne dans ta base de prospects avec le statut « Intéressé » et la date de prochaine action = aujourd'hui.
4. **Notification** — E-mail ou message (Telegram, Discord, Slack) : « Nouveau lead : [nom], [métier], [ville] ».
5. **Réponse automatique au prospect** — « Merci, je vous rappelle dans la journée » (texte validé par toi une fois pour toutes).
:::

### 2. Relance automatique à J+7

Le livre le recommande : un rappel automatique 7 jours après chaque contact sans réponse.

:::steps
1. **Déclencheur** — Planification quotidienne (chaque matin à 8 h).
2. **Google Sheets** — Lecture des lignes au statut « Contacté — sans réponse » dont le dernier contact date de 7 jours ou plus et sans relance déjà faite.
3. **Choix** — Pour chacune : soit l'envoi d'un brouillon de relance dans ta boîte (tu valides), soit une simple liste « À relancer aujourd'hui » envoyée sur ton téléphone.
4. **Mise à jour** — Statut passé à « À relancer », date notée.
:::

> [!LEGAL] Automatiser une relance, pas un harcèlement
> Une seule relance, puis plus rien. Le workflow doit exclure toute ligne marquée « Ne plus contacter » — teste ce filtre avant tout.

### 3. Demande d'avis Google après livraison (pour tes clients)

Un service que tu peux vendre en abonnement : chaque client final de ton client reçoit une demande d'avis.

:::steps
1. **Déclencheur** — Le client (ton client) ajoute une ligne « prestation terminée » dans un tableur partagé ou un formulaire simple.
2. **Attente** — 1 à 2 jours.
3. **Envoi** — SMS ou e-mail poli avec le lien direct vers la page d'avis de la fiche Google.
4. **Journal** — La date d'envoi est notée ; pas de deuxième envoi automatique.
:::

> [!LEGAL] Demander des avis, sans les acheter ni les filtrer
> Demander un avis est légitime. Offrir une contrepartie en échange d'un avis, ne solliciter que les clients satisfaits pour masquer les autres, ou rédiger des avis à la place des clients sont des pratiques interdites par les règles des plateformes et pouvant constituer des pratiques commerciales trompeuses. Le message doit également respecter les règles de prospection et de consentement applicables aux clients du commerçant.

### 4. Rapport mensuel préparé automatiquement

:::steps
1. **Déclencheur** — Le 1er de chaque mois.
2. **Collecte** — Lecture des chiffres du mois que tu as notés (ou récupérés via les outils qui le permettent) dans un tableur par client.
3. **IA** — Génération d'un brouillon de [bilan mensuel](@smma/suivre-les-performances-et-fideliser#le-bilan-mensuel) à partir des chiffres, avec consigne de ne rien inventer.
4. **Brouillon** — Création d'un e-mail en brouillon par client. Tu relis, tu ajoutes ta recommandation, tu envoies.
:::

### 5. Facturation des abonnements : rappel

:::steps
1. **Déclencheur** — Le 25 de chaque mois.
2. **Lecture** — Liste des clients en abonnement actif.
3. **Rappel** — Une tâche « Émettre les factures d'abonnement » avec la liste, dans ton agenda ou ta messagerie.
:::

> [!INFO] Pourquoi pas la facture elle-même ?
> Les factures doivent respecter des mentions obligatoires et, à partir du 1er septembre 2027 pour les micro-entreprises et PME, être émises électroniquement via une plateforme agréée lorsque le client est une entreprise assujettie à la TVA en France. Utilise un logiciel de facturation conforme plutôt qu'un document généré par un workflow maison. Voir [Facturation et facture électronique](@fiscalite/facturation-mentions-et-facture-electronique).

## Les agents IA, sans fantasme

Un « agent » est un workflow dans lequel une IA choisit elle-même certaines actions (chercher une information, rédiger, classer). C'est puissant, mais :

- un agent peut se tromper avec assurance : garde une validation humaine avant toute action visible par un client ;
- donne-lui le minimum de permissions (lecture seule quand c'est possible) ;
- journalise ce qu'il fait, pour pouvoir comprendre une erreur.

Bon premier usage : un agent qui **trie et résume** les demandes entrantes (« urgent / devis / question / spam ») et te propose une réponse, que tu valides.

## Bonnes pratiques

- [ ] Nomme clairement chaque workflow et chaque nœud (« Relance J+7 — lecture Sheets »).
- [ ] Teste avec des données fictives avant de brancher les vraies.
- [ ] Prévois une alerte en cas d'erreur d'exécution.
- [ ] Stocke les identifiants dans le gestionnaire d'identifiants de l'outil, jamais en clair dans un nœud.
- [ ] Documente chaque workflow en 5 lignes : déclencheur, ce qu'il fait, données traitées, qui le surveille, comment le désactiver.
- [ ] Revois tes workflows chaque trimestre : supprime ceux qui ne servent plus.

:::exercise Ton premier workflow
Construis le workflow n°1 (nouveau lead → tableau → alerte) pour ta propre agence. Teste-le avec 3 demandes fictives, dont une avec un téléphone mal formaté. Quand il fonctionne une semaine sans erreur, passe au n°2.
:::

:::recap
- On automatise un process qui fonctionne déjà à la main.
- Priorité : ce qui est fréquent, répétitif, sans créativité — et rentable en temps.
- Cinq workflows utiles : leads, relance J+7, demandes d'avis, rapport mensuel, rappel de facturation.
- Un humain valide tout ce qui part chez un client ; aucun « Ne plus contacter » ne doit être relancé.
:::
