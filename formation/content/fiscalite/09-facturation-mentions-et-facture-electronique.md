---
title: "Facturation : mentions obligatoires et facture électronique"
description: Ce qui doit figurer sur une facture en 2026, quand l'émettre, les délais de paiement, les acomptes — et le calendrier de la facture électronique.
module: gestion
icon: receipt
updated: 2026-10-13
verified: 2026-10-13
origin: exclusif
source: Contenu exclusif
---

Une facture n'est pas une formalité : c'est un document légal, qui sert de preuve en cas de litige et de base aux contrôles. Ce chapitre te donne les règles 2026 et la trame complète.

> [!LEGAL] Sources et date de vérification
> Vérifié le 13/10/2026 sur [« Mentions obligatoires sur une facture »](https://entreprendre.service-public.gouv.fr/vosdroits/F31808) (vérifiée par l'administration le 11/08/2026), [« Tout savoir sur la facturation »](https://entreprendre.service-public.gouv.fr/vosdroits/F23208) et la page de economie.gouv.fr consacrée à la facturation électronique.

## Les mentions obligatoires

### Pour toutes les factures

- [ ] Date d'émission
- [ ] Numéro unique, issu d'une **séquence chronologique et continue** (pas de trou, pas de doublon)
- [ ] Date de la vente ou de la prestation (fin d'exécution), ou date de versement de l'acompte
- [ ] Identité du prestataire :
  - entrepreneur individuel : nom et prénom précédés ou suivis de « **Entrepreneur individuel** » ou « **EI** », adresse, numéro SIREN ;
  - société : dénomination sociale, SIREN, adresse du siège, **forme juridique** (EURL, SASU…) et **montant du capital social**.
- [ ] Identité du client : nom ou dénomination, adresse (et adresse de facturation si différente)
- [ ] Numéro du bon de commande, si le client en a établi un
- [ ] Numéros de TVA intracommunautaire du prestataire et du client professionnel redevable (sauf factures ≤ 150 € HT)
- [ ] Désignation précise de chaque prestation, quantité, prix unitaire HT
- [ ] Taux de TVA applicable, **ou** la mention d'exonération : « **TVA non applicable, art. 293 B du CGI** » en franchise en base
- [ ] Totaux HT et TTC (et la TVA)
- [ ] Réductions éventuelles (rabais, remises)
- [ ] Date d'échéance du paiement et conditions d'escompte (ou « Escompte pour paiement anticipé : néant »)
- [ ] Taux des pénalités de retard
- [ ] Mention de l'**indemnité forfaitaire de 40 €** pour frais de recouvrement en cas de retard (clients professionnels)

### Les 4 nouvelles mentions liées à la facture électronique

Obligatoires à partir du **1er septembre 2027** pour les PME et micro-entreprises (dès le 1er septembre 2026 pour les grandes entreprises et ETI) :

- [ ] **Numéro SIREN du client**, lorsqu'il s'agit d'une entreprise
- [ ] **Adresse de livraison** des biens si elle diffère de celle du client
- [ ] **Nature des opérations** : livraison de biens, prestation de services, ou les deux
- [ ] « **Option pour le paiement de la taxe d'après les débits** », si le prestataire a choisi cette option

> [!ASTUCE] Commence dès maintenant
> Rien n'empêche d'ajouter ces 4 mentions dès aujourd'hui : tu n'auras rien à changer en 2027.

## Quand émettre la facture

Pour une prestation de services entre professionnels, la facture est émise **dès la réalisation de la prestation**. Pour un acompte, une **facture d'acompte** est émise à l'encaissement, puis la facture finale déduit l'acompte déjà facturé.

```copy title="Trame : facture d'acompte puis facture de solde" kind="modele"
FACTURE D'ACOMPTE N° [2026-015] — émise le [date]
Prestation : Création d'un site vitrine — acompte de 30 % selon devis n° [D-2026-008] du [date]
Montant : [195,00] € [HT + TVA / TVA non applicable, art. 293 B du CGI]

FACTURE N° [2026-021] — émise le [date de mise en ligne]
Prestation : Création d'un site vitrine 3 pages, mise en ligne le [date] — prestation de services
Total : [650,00] €
Acompte déjà facturé (facture n° 2026-015 du [date]) : − [195,00] €
Reste à payer : [455,00] € — échéance : [date]
```

## Délais de paiement et retards (clients professionnels)

| Règle | Détail |
| --- | --- |
| Délai par défaut | Si rien n'est prévu : 30 jours après réception de la prestation |
| Délai maximum convenu | 60 jours après la date d'émission de la facture, ou 45 jours fin de mois |
| Pénalités de retard | Taux à indiquer sur la facture ; il ne peut pas être inférieur à trois fois le taux d'intérêt légal |
| Indemnité forfaitaire | 40 € par facture payée en retard, due de plein droit |

> [!INFO] Clients particuliers
> Les règles de délais et d'indemnité de 40 € concernent les relations entre professionnels. Pour un client particulier, indique clairement la date d'échéance, et respecte les règles propres aux contrats avec les consommateurs (voir [Obligations de la vente en ligne et des prestations](@fiscalite/obligations-vente-en-ligne-et-prestations)).

## Numérotation : les règles pratiques

- Une séquence continue, par exemple `2026-001`, `2026-002`… (tu peux repartir à 001 chaque année si l'année figure dans le numéro).
- Jamais de suppression : une facture erronée se corrige par une **facture d'avoir** (qui l'annule totalement ou partiellement), puis une nouvelle facture.
- Une seule série pour toute l'activité, sauf justification (une série par activité est possible si elle est cohérente).

> [!ERREUR] Les erreurs qui reviennent
> - Oublier « EI » ou la mention de franchise de TVA.
> - Facturer avec un numéro « au hasard » ou supprimer une facture.
> - Facturer au nom du parent alors que la prestation est faite par ta société (ou l'inverse).
> - Ne pas facturer du tout les petites prestations.
> - Oublier les pénalités de retard et l'indemnité de 40 € sur les factures aux professionnels.

## La facture électronique

### Le calendrier officiel

| Date | Réception de factures électroniques | Émission de factures électroniques et e-reporting |
| --- | --- | --- |
| **1er septembre 2026** | **Toutes les entreprises**, y compris micro-entreprises et entreprises en franchise de TVA | Grandes entreprises et ETI |
| **1er septembre 2027** | — | **PME et micro-entreprises** |

### Ce que ça veut dire pour toi

- **Depuis le 1er septembre 2026**, tu dois être en mesure de **recevoir** des factures électroniques : il faut avoir choisi une **plateforme agréée** par l'administration fiscale (directement ou via un logiciel compatible). La liste des plateformes immatriculées est publiée sur impots.gouv.fr.
- **À partir du 1er septembre 2027**, tes factures à des **entreprises assujetties à la TVA établies en France** devront être émises au format électronique **via une plateforme agréée**. Un PDF envoyé par e-mail ne sera plus conforme pour ces factures.
- Les opérations avec des **particuliers** ou des clients **à l'étranger** ne passent pas par la facture électronique, mais leurs données de transaction devront être transmises à l'administration (**e-reporting**), selon le même calendrier.

> [!ATTENTION] Les micro-entrepreneurs sont concernés
> Selon le ministère de l'Économie, la réforme concerne aussi les indépendants, les professions libérales et les micro-entrepreneurs, **qu'ils facturent ou non la TVA**. Ne crois pas les messages qui affirment le contraire.

:::steps
1. **Maintenant** — Choisis une plateforme agréée (ou vérifie que ton logiciel de facturation est connecté à l'une d'elles) pour recevoir tes factures fournisseurs.
2. **Dès que possible** — Ajoute les 4 nouvelles mentions à tes factures, et collecte le SIREN de tes clients entreprises.
3. **Avant septembre 2027** — Passe ton émission de factures sur cette plateforme et teste-la avec un client.
:::

> [!INFO] La période de démarrage
> L'administration a publié un guide pratique de démarrage (impots.gouv.fr) qui précise la conduite à tenir pendant la phase de lancement. Il ne constitue ni un report ni une suspension des obligations.

:::recap
- Une facture conforme : identités complètes (avec « EI » ou forme et capital), numéro continu, désignation, prix, TVA ou mention 293 B, échéance, pénalités, indemnité de 40 €.
- 4 nouvelles mentions à prévoir : SIREN du client, adresse de livraison, nature des opérations, option débits.
- Réception électronique obligatoire pour tous depuis le 1er septembre 2026 ; émission pour les micro-entreprises et PME le 1er septembre 2027.
- Une erreur se corrige par un avoir, jamais par une suppression.
:::
