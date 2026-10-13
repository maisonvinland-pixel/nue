---
title: Organiser sa base de prospects
description: Un tableur qui devient un vrai CRM — colonnes, statuts, score de priorité, routine quotidienne et règles RGPD.
module: prospection
icon: list
updated: 2026-10-13
origin: exclusif
source: Contenu exclusif
---

Sans organisation, la prospection devient un brouillard : tu rappelles deux fois la même personne, tu oublies les relances, tu ne sais plus qui t'a dit « rappelez-moi en septembre ». Un simple tableur bien construit règle 90 % du problème.

## Les sources légitimes de prospects

| Source | Ce que tu obtiens | Remarque |
| --- | --- | --- |
| Google Maps | Nom, adresse, téléphone, site, note, avis | La source principale pour les commerces locaux |
| Pages Jaunes et annuaires professionnels | Coordonnées, activité | Utile pour recouper |
| Annuaire des entreprises (annuaire-entreprises.data.gouv.fr) | SIREN, date de création, dirigeant, forme juridique | Données officielles ; utile pour repérer les entreprises récentes |
| Réseaux sociaux (Instagram, Facebook) | Activité réelle, qualité des publications | Idéal pour juger le besoin en contenu |
| Ton entourage, tes premiers clients | Recommandations | Le canal le mieux converti |
| Passage en boutique, salons, marchés | Contacts directs | Notes à saisir le jour même |

> [!ASTUCE] Les entreprises récemment créées
> Une entreprise créée il y a moins d'un an a souvent tout à construire : site, fiche Google, réseaux. Les données de création sont publiques sur l'Annuaire des entreprises.

## Le tableau de suivi complet

Colle cette ligne d'en-têtes en première ligne de ton tableur (Google Sheets, Excel, Notion, Airtable) :

```copy title="En-têtes de colonnes du tableau de prospection" kind="modele"
Entreprise	Métier	Ville	Contact (nom)	Téléphone	E-mail	Site (oui/non/daté)	Note Google	Nb avis	Score priorité	Source	Statut	Canal	Dernier contact	Prochaine action	Date prochaine action	Notes	Opposition (oui/non)
```

### Les statuts (toujours les mêmes mots)

Des statuts normalisés te permettent de filtrer et de compter. Utilise une liste déroulante.

| Statut | Signification |
| --- | --- |
| À contacter | Dans la liste, jamais contacté |
| Contacté — sans réponse | Premier contact fait, pas de retour |
| À relancer | Une date de relance est fixée |
| Intéressé | A demandé plus d'informations |
| RDV pris | Rendez-vous daté |
| Proposition envoyée | Devis ou proposition transmise |
| Gagné | Accord signé, acompte reçu |
| Perdu | Refus clair (noter la raison) |
| Ne plus contacter | Opposition exprimée — ne jamais recontacter |

### Le score de priorité

Note chaque prospect pour savoir qui appeler en premier :

| Critère | Points |
| --- | --- |
| Aucun site | +3 |
| Site daté ou non adapté au mobile | +2 |
| Moins de 10 avis Google | +2 |
| Note Google inférieure à 4 | +1 |
| Activité qui génère des paniers élevés (bâtiment, rénovation…) | +2 |
| Réseaux sociaux actifs (sait l'intérêt de la visibilité) | +1 |

Appelle d'abord les scores les plus élevés.

## La routine quotidienne

:::steps
1. **Le matin, 5 minutes** — Filtre « Date prochaine action = aujourd'hui ». C'est ta liste du jour.
2. **Contacts du jour** — Fais d'abord les relances prévues, puis les nouveaux contacts par score décroissant.
3. **Après chaque contact** — Mets à jour statut, date, canal, notes, et fixe **toujours** une prochaine action datée (sauf Perdu / Ne plus contacter).
4. **Le soir, 5 minutes** — Compte : contacts faits, réponses, rendez-vous. Note les chiffres dans un onglet « Indicateurs ».
:::

> [!CHIFFRE] La règle d'or
> Aucune ligne active sans « prochaine action » datée. Un prospect sans prochaine action est un prospect perdu.

## Les règles RGPD, en pratique

Ta base contient des données personnelles dès qu'elle mentionne une personne (nom du gérant, numéro de portable). Quelques règles simples :

- [ ] Ne collecte que ce qui sert à la prospection (pas de date de naissance, pas d'informations privées).
- [ ] Indique dans ton premier message qui tu es et comment refuser les prochains contacts.
- [ ] En cas de refus : statut « Ne plus contacter », immédiatement, et ne recontacte jamais.
- [ ] Supprime les prospects inactifs depuis longtemps (par exemple, sans échange depuis plus de 3 ans — la CNIL retient ce délai comme référence pour les données de prospects).
- [ ] Protège l'accès au fichier (compte personnel, pas de lien de partage public).
- [ ] Ne revends ni ne partages jamais ta base.

> [!LEGAL] Pour aller plus loin
> Les règles de prospection (B2B, B2C, e-mail, téléphone) sont détaillées dans [Obligations de la vente en ligne et des prestations](@fiscalite/obligations-vente-en-ligne-et-prestations).

## Quand passer à un vrai CRM ?

Un tableur suffit largement jusqu'à quelques centaines de lignes. Passe à un outil dédié (Notion, Airtable, ou un CRM gratuit) quand :

- tu travailles à plusieurs sur la même base ;
- tu veux des rappels automatiques ;
- tu veux connecter la base à des automatisations (voir [Workflows n8n](@smma/workflows-d-automatisation-avec-n8n)).

:::exercise Monte ta base aujourd'hui
Crée le tableau avec les en-têtes ci-dessus, ajoute la liste déroulante des statuts, importe tes 30 premiers prospects et calcule leur score. Trie par score : les 10 premiers sont ta liste de demain.
:::

:::recap
- Sources légitimes : Google Maps, annuaires, Annuaire des entreprises, réseaux sociaux, recommandations.
- Statuts normalisés + score de priorité = tu sais toujours qui contacter.
- Aucune ligne active sans prochaine action datée.
- RGPD : collecte minimale, droit d'opposition respecté immédiatement, fichier protégé, jamais revendu.
:::
