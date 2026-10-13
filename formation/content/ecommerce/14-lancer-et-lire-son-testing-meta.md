---
title: "Lancer et lire son testing Meta"
description: "Tu sauras : monter ta première campagne de test sur Meta (structure, budget, nombre de créas), la lancer proprement, lire tes résultats dans le bon ordre…"
module: acquisition
icon: chart
updated: 2026-10-13
origin: livre
source: "Ebook e-commerce (Notion), chapitre 14"
---
> [!INFO] Ce que tu vas apprendre
> **Niveau : intermédiaire**
>
> À la fin, tu sauras : monter ta première campagne de test sur Meta (structure, budget, nombre de créas), la lancer proprement, lire tes résultats dans le bon ordre, décider pour chaque pub et pour la campagne s’il faut couper, maintenir ou augmenter, trouver d’où vient le problème quand ça ne marche pas (les pubs ou la boutique ?), et faire tes toutes premières augmentations de budget sans tout casser.

## Le testing : ton premier vrai rendez-vous avec le marché

Tu as tout préparé : ta boutique (chapitres 9 à 11), tes comptes Meta et ton pixel (chapitre 12), tes créatives (chapitre 13), et surtout tes chiffres (chapitre 6). Maintenant, tu vas mettre de l’argent sur la table pour poser une seule question au marché : **est-ce que des inconnus achètent mon produit, à un prix qui me laisse de la marge ?**

C’est ça, un **testing** : une phase de pub avec un petit budget, pour savoir vite si un produit (et quelles pubs) peuvent devenir rentables.

Pourquoi Meta pour ça ? Parce que, Meta donne des **signaux lisibles en 48 à 72 heures**. C’est le canal le plus rapide pour savoir si un produit a du potentiel.

> [!RETENIR] À retenir
> Un testing ne sert pas à « gagner de l’argent tout de suite ». Il sert à **récolter des informations** : quel produit, quelle pub, quel angle, quelle étape de ta boutique bloque. Le scaling (faire grossir ce qui marche) vient après, au chapitre 18.

## Le vocabulaire du testing (à lire une fois)

Tu as vu les bases au chapitre 12 (campagne > ad set > ad, CPM, pixel). Voici les mots en plus dont tu as besoin ici.

| Mot | Ce que ça veut dire, simplement |
| --- | --- |
| **CBO** (*Campaign Budget Optimization*) | Tu mets **un seul budget au niveau de la campagne**, et Meta le répartit tout seul entre tes ad sets et tes pubs, selon ce qui marche le mieux. |
| **ABO** (*Ad set Budget Optimization*) | Tu fixes **toi-même un budget pour chaque ad set**. Tu gardes le contrôle, Meta ne déplace pas l’argent. |
| **Broad** (« large ») | Ciblage ouvert : tu n’imposes ni âge, ni sexe, ni centres d’intérêt. Tu laisses l’algorithme trouver les acheteurs grâce à ta créa. |
| **Objectif Achat** | Tu demandes à Meta de chercher des gens qui **achètent** (et pas juste des gens qui cliquent ou ajoutent au panier). |
| **Batch** | Un lot de créas lancées ensemble. |
| **Winneuse** | Une créa gagnante (qui vend de façon rentable). |
| **Spend** | L’argent dépensé en pub. |
| **ATC** (*Add To Cart*) | Un ajout au panier. |
| **CPA** (*Cost Per Acquisition*) | Ce que te coûte **une vente** en pub (dépense ÷ nombre d’achats). Ton **CPA max** = ta ligne rouge, calculée au chapitre 6. |
| **ROAS BE / ROAS Target** | Ton seuil d’équilibre et ton seuil de « vraie » rentabilité. Tu dois les connaître **avant** de lancer (chapitre 6). |
| **Phase d’apprentissage** (*learning phase*) | Le moment où Meta « cherche » à qui montrer tes pubs. Les résultats bougent beaucoup. Il faut **50 conversions en 7 jours** pour en sortir : **ne touche pas** à la campagne pendant cette période. |

## 1. La structure : comment organiser ta campagne de test

### La CBO

La grande majorité lance son test en **CBO**.

### Où mettre les créas ?

| Façon de faire | Pourquoi |
| --- | --- |
| **1 CBO → 1 seul ad set en broad → toutes les créas dedans** (5 à 15) | Simple, et Meta choisit lui-même la meilleure pub |

Pour toi, débutant : **garde la même organisation** d’un test à l’autre, pour pouvoir comparer.

### L’autre méthode : tester en ABO

Une autre méthode existe. En CBO, Meta met presque tout le budget sur **1 ou 2 pubs**, et les nouvelles créas (surtout les images statiques) reçoivent souvent **0 à 1 €** : elles ne sont jamais vraiment testées. Alors :

- soit l’**ABO**, avec **un ad set par créa** et le **même petit budget** pour chacun ;
- soit la CBO avec une **règle de re-test** : au bout de 48 h, les pubs qui ont dépensé **moins de 5 €** partent dans un petit ad set séparé pour avoir leur chance.

Autre repère : ABO en phase de test, CBO en phase de scaling. Une **ABO de testing** est aussi utilisée… mais seulement plus tard, quand la boutique approche **~1 500 € de CA par jour** (on verra ça au chapitre 18).

> [!ASTUCE] Astuce de pro
> Si tu restes en CBO (comme la majorité), garde en tête le problème soulevé par la méthode ABO. Une créa avec **un bon taux de clic mais presque pas de dépense** n’est pas forcément mauvaise : elle a peut-être été « étouffée » par la CBO. Ne la juge pas comme une perdante, re-teste-la à part.

### Une règle commune

Règle d’or : **ne jamais tester des créas neuves contre d’anciennes gagnantes.** Les anciennes ont déjà accumulé des données : c’est un combat injuste.

### Le ciblage : broad

- **1 ad set broad**, zéro ciblage âge/sexe/intérêt. Laisse l’algo trouver.
- Laisse les créas faire le travail, **pays + sexe + âge minimum** suffisent en général, évite d’empiler les centres d’intérêt.

Tous sont d’accord sur un point, qu’on a vu au chapitre 12 : depuis Andromeda, **c’est ta créative qui fait le ciblage**.

## 2. Le budget : combien par jour, et pendant combien de temps

C’est LE sujet où les avis divergent. Voici les repères, côte à côte.

| Budget de test | Pendant combien de temps |
| --- | --- |
| **100 €/jour** | Signaux en 48-72 h ; décisions sur les **3-4 derniers jours** |
| **50 €/jour** | **2-3 jours** avant de juger |
| **50 €/jour** | — |
| **50 à 100 $ au total** pour un produit testé | — |
| **20 à 50 $/jour** | 3-5 jours |

**Dépenser trop peu, c’est la loterie** : un test avec 300 € n’a pas de sens. Le repère de 50-100 $ au total est donc très éloigné des autres : garde-le en tête comme une exception.

**Exemple de calcul** (pour te faire une idée de ce que coûte un test, pas une règle) :

- 50 €/jour × 3 jours = **150 €**
- 100 €/jour × 3 jours = **300 €**
- 100 €/jour × 7 jours = **700 €**

Et ce n’est que **un** test. C’est pour ça qu’au chapitre 2, on parlait de mettre de côté 2 000 à 3 000 € avant de lancer : il faut pouvoir enchaîner plusieurs batchs de créas sans être à sec au bout d’une semaine.

> [!ERREUR] L'erreur à éviter
> Lancer un test « pour voir » avec trop peu d’argent, puis conclure « le produit ne marche pas ». Avec trop peu de dépense, tu n’as aucun signal fiable. C’est aussi l’un des 8 pièges du débutant : **mélanger l’argent de test et l’argent pour vivre.** Ton budget de test, c’est de l’argent que tu acceptes de dépenser pour apprendre.

## 3. Les créas : combien, et lesquelles

Les créas elles-mêmes (TOFU, BOFU, hooks, formats…), c’est le chapitre 13. Ici, on parle juste de **combien** en mettre dans ton test et **dans quelle proportion**.

### Combien de créas ?

Nombre de créas pour un test

**10 à 15**

**5 (minimum) à 15**

**3 à 5**

pour un premier batch (3 statiques + 1 vidéo par défaut)

### Le bon mélange TOFU / BOFU

Petit rappel du chapitre 13 : les créas **TOFU** (haut de l’entonnoir) **éduquent** des gens qui ne te connaissent pas. Les créas **BOFU** (bas de l’entonnoir) **récoltent** les ventes chez des gens déjà convaincus (souvent des images statiques avec l’offre). Prévois un mélange des deux : **ne fais pas que du BOFU**, ça épuise ton audience.

> [!ASTUCE] Astuce de pro
> Donne un nom clair à chaque créa avant de lancer. Propose : `[date]-[angle]-[format]-[version]`. Quand tu liras tes résultats dans 3 jours, tu sauras tout de suite quelle pub est quoi.

## 4. Le lancement, pas à pas

Voici le « setup » standard :

1. **Vérifie ton pixel** : l’événement **Achat** doit bien remonter (chapitre 12, détails au chapitre 17). **Sans achats suivis, toute l’analyse est faussée.**
1. **Crée 1 campagne** avec l’objectif **Achat** (pas « Ajout au panier »).
1. Active le **budget de campagne (CBO)** : 50 ou 100 €/jour selon ton choix.
1. **1 ad set broad** (ou un ad set par créa).
1. Mets tes **créas** dedans (5 à 15), avec un mélange TOFU/BOFU.
1. Programme le lancement **à minuit, le lendemain** (00h). C’est pour ça qu’au chapitre 12, on a choisi le fuseau horaire du pays où tu vends : minuit doit être le minuit de tes clients.
1. Relis tout, puis **ne touche plus à rien** pendant la période que tu t’es fixée.

Côté formats : **9:16** (1080 × 1920) pour les Reels et Stories, **4:5** (1080 × 1350) pour le fil, **1:1** (1080 × 1080) pour les statiques.

> [!ERREUR] L'erreur à éviter
> Regarder ton Ads Manager le premier soir et tout modifier parce que « ça ne vend pas encore ». C’est la **« panique du 1er soir »** : c’est comme ça qu’on tue un winner dans l’œuf. Couper une pub trop tôt, sur une seule journée, fait partie des 8 pièges du débutant.

## 5. Combien de temps attendre avant de juger ?

Encore un point où les avis varient :

- **48-72 h** (avec des décisions prises sur les **3-4 derniers jours**, ou sur **3 jours glissants**, pas sur une soirée).
- **2-3 jours** pour juger le CPA d’une créa.
- **3 jours minimum, 5-7 si c’est encourageant**.

Les **« fenêtres de lecture »** sont très utiles, et s’appliquent aussi à Meta : à chaque période, on ne regarde pas les mêmes choses.

| Période | Ce que tu regardes | Ce que tu évites | Ce que tu peux décider |
| --- | --- | --- | --- |
| **Jour 0-1** | Est-ce que ça dépense, est-ce que ça s’affiche, le tracking marche, la page fonctionne, pas de pub refusée | Changer le ciblage à cause du CPA du 1er jour | Réparer un problème technique |
| **Jour 2-4** | Le hook, le CTR, le CPC, est-ce que les clics arrivent bien sur le site | Dire « mon ROAS est stable » avec 3 achats | Faire une variante d’une créa, réparer le passage clic → site |
| **Jour 5-7** | Ajouts au panier, checkouts, achats | — | Traiter la première étape faible de ta boutique |
| **Jour 8-14** | CPA, ROAS, marge après pub, fatigue | Scaler juste sur le ROAS affiché par la plateforme | Garder, corriger ou couper (et noter pourquoi) |

> [!RETENIR] À retenir
> Plus ton budget est petit, moins tu as de données chaque jour, et plus il faut de patience. Plancher : **minimum 20-30 $ dépensés et 1 000 impressions par créa** avant de tirer la moindre conclusion sur elle.

## 6. Lire les KPI dans le bon ordre

Un **KPI** (*Key Performance Indicator*, indicateur clé), c’est un chiffre que tu suis pour savoir si ça marche. Il y en a des dizaines dans l’Ads Manager. Le piège, c’est de regarder le premier qui saute aux yeux (souvent le CTR) et de paniquer.

### L’ordre de lecture

Voici un ordre simple, **toujours le même** :

**Dépensé → Achats → CPA → ROAS**, puis tu compares ton ROAS à ton **ROAS Break-Even**.

Autrement dit : **« ne jamais commencer par le CTR »**. Lis du plus important au plus technique :

1. **Business** : est-ce que ça fait des ventes, du chiffre, de la marge ?
1. **Conversion** : est-ce que ta boutique transforme les visites en achats (panier, checkout, achat) ?
1. **Expérience** : est-ce que le clic arrive au bon endroit (vitesse, page) ?
1. **Créatif** : hook, rétention, CTR… quelle promesse a amené ce trafic ?
1. **Diffusion** : CPM, fréquence… Meta a-t-il pu diffuser correctement ?

Autrement dit : on part de **l’argent**, et on ne descend dans les détails que pour **comprendre pourquoi**.

### Les métriques à connaître

| Métrique | Ce que ça mesure | Comment ça se calcule |
| --- | --- | --- |
| **Dépensé (spend)** | Ce que tu as payé | — |
| **Achats** | Le nombre de ventes venues de la pub | — |
| **CPA** | Ce que te coûte une vente | Dépense ÷ achats |
| **ROAS** | Ce que rapporte 1 € de pub (en CA) | CA ÷ dépense |
| **CPM** | Le prix pour 1 000 affichages | Dépense ÷ impressions × 1 000 |
| **CTR** (*Click-Through Rate*, taux de clic) | La part des gens qui cliquent après avoir vu la pub | Clics ÷ impressions |
| **CPC** (*Cost Per Click*) | Le prix d’un clic | Dépense ÷ clics, ou **CPM ÷ (1 000 × CTR)** |
| **Hook rate** (taux d’accroche) | La part des gens qui regardent les 3 premières secondes d’une vidéo | Lectures de 3 s ÷ impressions |
| **Hold rate** (taux de rétention) | La part des gens qui restent plus longtemps sur la vidéo : est-ce que le script « tient la distance » | (Meta donne aussi les ThruPlay et la lecture à 50 %) |
| **Fréquence** | Combien de fois, en moyenne, une même personne a vu ta pub | — |

La formule du CPC est précieuse : elle montre que **le prix d’un clic dépend de deux choses**, le CPM et le CTR. Si ton CPC est cher, c’est soit que l’affichage coûte cher, soit que trop peu de gens cliquent. **Exemple de calcul :** CPM de 10 € et CTR de 2 % → CPC = 10 ÷ (1 000 × 0,02) = 10 ÷ 20 = **0,50 €**.

### Les repères chiffrés (ordres de grandeur, pas des règles)

| Métrique | Repères |
| --- | --- |
| **CPM** | ~7-20 € ; 8-15 € sur Meta |
| **CTR** | ≈ 2 % et plus ; > 1 % bon, > 1,5 % excellent ; 1-2 % pour Meta ; **faible si &lt; 0,8 %** après 1 000 impressions |
| **CPC** | ~0,30-0,70 € |
| **Hook rate** | ≥ 30 % ; **faible si &lt; 25 %** |
| **Hold rate** | ≥ 10 % |
| **Fréquence** | > 3 = signe de fatigue de la pub (pour une audience froide) |
| **CPA** | ≤ ton CPA max / ton point mort |

Voici des moyennes Meta par secteur (campagnes de trafic, 2025) : **CTR moyen 1,71 %** et **CPC moyen 0,70 $**, avec de gros écarts selon le secteur (par exemple 4,13 % pour « Shopping, Collectibles & Gifts », 1,29 % pour la mode et les bijoux). Ça te montre une chose : **un « bon » CTR dépend de ta niche**.

> [!RETENIR] À retenir
> En une phrase : **aucun de ces seuils ne se juge seul, seule la rentabilité tranche.** Un CPM ou un CPC élevé n’est pas grave si derrière, ça achète.

### Les repères pour ta boutique (le « funnel »)

Le **funnel** (entonnoir), c’est le chemin du client : il voit la pub → clique → arrive sur la page → ajoute au panier → passe au paiement → achète. Voici des repères en trois couleurs (approximatifs, pas des garanties) :

| Étape | 🔴 Rouge | 🟠 À surveiller | 🟢 Vert | Ce qui coince en général |
| --- | --- | --- | --- | --- |
| Arrivées sur la page / clics | &lt; 75 % | 75-88 % | > 88 % | Vitesse sur mobile, redirection |
| Ajout au panier / visites | &lt; 3 % | 3-7 % | > 7 % | Prix, preuve, désir, fiche produit |
| Checkout / paniers | &lt; 35 % | 35-55 % | > 55 % | Frais, livraison, moyens de paiement |
| Achats / visites | &lt; 1 % | 1-2,5 % | > 2,5 % | Funnel complet et qualité du trafic |

> [!ERREUR] L'erreur à éviter
> Couper une pub sur un chiffre que tu ne comprends pas. Règle : **ne jamais couper une campagne sur un chiffre dont tu ne connais pas la définition, la période ou la source.** Si tu ne sais pas ce que mesure une colonne, cherche d’abord (ou demande à l’IA, voir plus bas).

## 7. Décider : couper, maintenir ou augmenter

### Au niveau de la campagne : la règle des trois zones

Tout se ramène à **une seule question : chaque euro investi rapporte-t-il assez ?** Compare ton ROAS à tes deux seuils du chapitre 6 :

| Ton ROAS est… | Ça veut dire | Ce que tu fais |
| --- | --- | --- |
| **Sous le ROAS Break-Even** | Tu perds de l’argent | **Couper** ou optimiser les créas |
| **Entre le ROAS BE et le ROAS Target** | Tu gagnes un peu | **Maintenir** et observer |
| **Au-dessus du ROAS Target** | Tu gagnes bien | **Augmenter** le budget |

Deux cas particuliers :

- **Métriques horribles** (par exemple CPC à 4 €, CTR très faible, zéro ajout au panier) → **couper**.
- **Pas rentable, mais CTR excellent, CPC et coût par ajout au panier bas** → il y a de la **traction** (de l’intérêt réel) : laisser tourner et **optimiser la boutique**. Le problème n’est sans doute pas la pub.

### Exemple de calcul complet

On reprend le produit du chapitre 6 : vendu **40 €**, CPA max **27,80 €**, ROAS BE **1,44**, ROAS Target **2,02** (pour 20 % de marge nette). Imaginons un test à 50 €/jour pendant 3 jours = **150 € dépensés**, et une commande = 1 produit à 40 €. Voici 4 scénarios possibles (chiffres inventés pour l’exercice) :

| Scénario | Achats | CA | ROAS (CA ÷ 150) | CPA (150 ÷ achats) | Zone | Décision |
| --- | --- | --- | --- | --- | --- | --- |
| A | 3 | 120 € | 0,80 | 50 € | Sous le BE | Couper / changer les créas |
| B | 5 | 200 € | 1,33 | 30 € | Juste sous le BE | Regarder le détail des créas et du funnel avant de trancher |
| C | 7 | 280 € | 1,87 | 21,40 € | Entre BE et Target | Maintenir et observer |
| D | 9 | 360 € | 2,40 | 16,70 € | Au-dessus du Target | Augmenter (voir section 9) |

Remarque que le scénario B a un CPA de 30 €, juste au-dessus de ton CPA max de 27,80 € : tu perds un peu sur chaque vente. Ce n’est pas un échec total, c’est un signal à creuser (quelle créa vend ? où bloque la boutique ?).

### Au niveau de chaque créa : les règles de tri

Voici des **règles de départ**, à adapter à ton produit et ta marge :

- **Couper** une créa si elle a dépensé **≥ 1 × ton CPA max sans aucun ajout au panier**, ou **≥ 2 × ton CPA max sans aucun achat**.
- **Accroche faible** si le **CTR &lt; 0,8 % après 1 000 impressions**, ou si les **lectures de 3 s &lt; 25 %** des impressions → refaire les 3 premières secondes ou le visuel.
- **Garder et monter** si le **CPA ≤ ton CPA max sur 2 à 3 jours**.
- **Étouffée par la CBO** : bon CTR mais presque pas de dépense → la re-tester à part avant de la juger.

Avec notre exemple (CPA max 27,80 €) : une créa qui a dépensé **27,80 €** sans un seul ajout au panier, ou **55,60 €** sans un seul achat, peut être coupée. Règle proche : couper si le **CPA dépasse 2 × ta cible**.

Trie aussi tes créas avec le CPA : une créa qui ne fait aucune vente après plusieurs fois le CPA est « pourrie ».

### Les trois verdicts

Trois mots résument tout ça, pratiques pour noter tes décisions :

- ✅ **GARDER** : le signal est fiable, le CPA est sous ton plafond, la marge est positive.
- 🔧 **CORRIGER** : le hook ou le clic est correct, mais il y a une cassure nette quelque part dans le funnel.
- ❌ **COUPER** : tracking cassé, offre pas tenue, ou dépense importante sans aucun signal utile.

> [!ERREUR] L'erreur à éviter
> Juger sur une seule métrique.
>
> - ❌ « Mon CPM est à 18 €, c’est trop cher, je coupe. »
> - ✅ « Mon CPM est à 18 €, mais cette pub fait des ventes sous mon CPA max : je garde. »
> - ❌ « Super CTR à 4 %, c’est un winner ! »
> - ✅ « Super CTR à 4 %, mais personne n’achète : je regarde où ça bloque sur le site. »

## 8. Les diagnostics : c’est la pub ou c’est la boutique ?

Ton test n’est pas rentable. Avant de dire « le produit est nul » ou « mon compte pub est bridé », il faut **trouver la première fuite**.

### Séparer les KPI « pub » et les KPI « boutique »

Les métriques se séparent en deux côtés : celles de la **pub** (hook rate, CPM, CTR, CPC, rétention) et celles de la **boutique** (ajout au panier, passage au paiement, achat). Si les chiffres de la pub sont bons mais ceux de la boutique mauvais, regarde la boutique ; si la pub retient mal les gens, ils arrivent moins « chauds » sur ton site.

### L’arbre de décision

Voici 5 questions, dans l’ordre :

1. **Les données sont-elles fiables ?** Non → STOP, répare le tracking.
1. **Y a-t-il assez de volume pour lire quelque chose ?** Non → ATTENDS (ou regroupe, ou mets plus de budget).
1. **Le résultat business est-il acceptable ?** Non → REMONTE le funnel et trouve la **première fuite**.
1. **Sais-tu qui doit corriger cette fuite** (la pub ? la page ? l’offre ? le checkout ?) Non → découpe plus finement tes données.
1. **La correction tient-elle sur une nouvelle période ?** Non → corrige à nouveau, ou coupe.

### Les diagnostics les plus fréquents

| Ce que tu vois | Ce que ça veut probablement dire | Où regarder |
| --- | --- | --- |
| CTR faible, hook rate faible | Les premières secondes n’arrêtent pas le scroll | Chapitre 13 (hooks) |
| Bon CTR, mais peu d’ajouts au panier | La page ou l’offre ne convainc pas | Chapitres 10 et 11 |
| Ajouts au panier, mais peu d’achats | Frais, livraison, paiement, confiance | Chapitres 8, 9, 11 |
| CPM très élevé | Qualité de la créa, conformité | Chapitres 12 et 13 |
| Une créa avec bon CTR mais quasi 0 € dépensé | Étouffée par la CBO | Re-test à part |

> [!ASTUCE] Astuce de pro
> Pour voir ce que font vraiment les visiteurs sur ta page (où ils cliquent, où ils s’arrêtent, où ils partent), utilise **Microsoft Clarity** (on le détaille au chapitre 21).

## 9. Après un test rentable : les premières augmentations

On ne parle ici que des **premiers pas**. La vraie méthode de scaling (structure à plusieurs campagnes, paliers jusqu’à des milliers d’euros…) est au **chapitre 18**.

### La règle de base

On ne scale que quand c’est **rentable ET stable**, et **par paliers, jamais d’un coup**. Scaler un produit ou un site pas encore rentable fait partie des 8 pièges du débutant.

### Quand augmenter ?

Là encore, les avis diffèrent un peu :

- **Au-dessus du ROAS Target** ;
- quand la CBO est **rentable avec +20 % de marge** ;
- quand le **CPA reste ≤ ton CPA max sur 2-3 jours** .

### De combien ?

Comment augmenter

Paliers fixes

**toutes les 24-48 h**

, en regardant les

**3-4 derniers jours**

: 100 → 200 → 300 → 400 → 500 → 700 → 1 000 → 1 500 €, puis +500 / +1 000 € selon la stabilité

**+20 à 30 %**

par palier (tous les 2-3 jours)

Signal d’alarme : quand la pub fatigue (**CPA qui monte de +30 %**), on revient à la phase de test des hooks.

### Ce que devient ta campagne de test

Voici la suite logique : nourris ta CBO de nouvelles créas.

**Quand une CBO marche, ne la touche plus** et crée-en une nouvelle (moins de 40 créas par CBO).

> [!RETENIR] À retenir
> À ce stade, ton objectif n’est pas de passer à 1 000 €/jour. C’est d’**avoir des créas qui vendent de façon rentable pendant plusieurs jours d’affilée**, et de continuer à en produire de nouvelles. Le reste, c’est le chapitre 18.

### Surveiller la fatigue

Une pub ne marche pas éternellement. Signaux de **fatigue** : **fréquence > 3**, **CTR qui baisse de 10-15 %** d’une semaine à l’autre, **CPA qui augmente**. Une créa dure en moyenne **2 à 4 semaines**, et il faut toujours avoir 2-3 variantes en préparation. C’est normal, ce n’est pas un échec : c’est pour ça qu’on teste en continu.

> [!IA] L'IA peut t'aider
> Utilise l’IA pour **diagnostiquer tes chiffres**, avec une demande toute simple : « voici mes stats Meta, dis-moi si le problème vient des ads ou du site ». Il existe même une connexion directe entre une IA et le compte Meta (le « MCP Meta Ads ») pour lire les statistiques, avec une règle d’or : **l’IA lit librement, mais ne crée ou ne modifie rien sans ton accord explicite** (et crée toujours les campagnes désactivées). L’IA t’aide à lire les chiffres et à poser les bonnes questions ; la décision, c’est toi.

## Prompt 14.1 : préparer mon plan de testing

```copy title="Prompt 14.1 : préparer mon plan de testing" kind="prompt"
Tu es un media buyer Meta Ads qui accompagne un débutant en e-commerce.
Aide-moi à préparer mon premier testing. Voici mes infos :
- Produit : [nom + ce qu'il fait]
- Prix de vente moyen d'une commande : [X €]
- CPA max (calculé) : [X €]
- ROAS Break-Even : [X] / ROAS Target : [X]
- Budget total que j'accepte de dépenser pour ce test : [X €]
- Créas prêtes : [nombre de vidéos TOFU] TOFU et [nombre de statiques BOFU] BOFU

Avec ces infos :
1. Dis-moi si mon budget permet un test à 50 €/jour ou à 100 €/jour, et pendant combien de jours.
2. Vérifie que j'ai un mélange de TOFU et de BOFU (pas uniquement du BOFU).
3. Propose-moi la structure : 1 CBO, objectif Achat, broad, lancement à minuit, et dis-moi si je mets toutes les créas dans un ad set ou un ad set par créa (explique les deux options).
4. Calcule mes seuils de coupe par créa : 1× CPA max sans ajout au panier, 2× CPA max sans achat.
5. Donne-moi un calendrier de lecture jour par jour (ce que je regarde, ce que je ne touche pas).
Ne m'invente aucun chiffre : si une info manque, pose-moi la question.
```

## Prompt 14.2 : diagnostiquer mon test (pub ou boutique ?)

```copy title="Prompt 14.2 : diagnostiquer mon test (pub ou boutique ?)" kind="prompt"
Voici les stats de mon testing Meta. Dis-moi si le problème vient des ads ou du site.

Mes seuils : CPA max = [X €], ROAS Break-Even = [X], ROAS Target = [X].
Durée du test : [X jours], budget : [X €/jour].

Pour la campagne : dépensé [X €], achats [X], CA [X €], ROAS [X], CPA [X €],
CPM [X €], CTR [X %], CPC [X €].
Pour le site : visites [X], ajouts au panier [X], checkouts [X], achats [X].

Pour chaque créa : nom, type (TOFU/BOFU), dépensé, impressions, CTR,
lectures 3 s (si vidéo), ajouts au panier, achats.

Lis dans cet ordre : Dépensé → Achats → CPA → ROAS comparé à mon ROAS BE et Target.
Ensuite seulement, remonte le funnel pour trouver LA première fuite
(hook, CTR, arrivée sur la page, ajout au panier, checkout, achat).
Ne juge jamais sur une seule métrique. Si le volume est trop faible pour conclure,
dis-le clairement au lieu de deviner.
Termine par un verdict par créa : GARDER / CORRIGER / COUPER, avec la raison.
```

## Prompt 14.3 : décider de la suite après mon test

```copy title="Prompt 14.3 : décider de la suite après mon test" kind="prompt"
Mon test Meta tourne depuis [X jours]. Résultats des 3-4 derniers jours :
ROAS [X], CPA [X €], dépense [X €/jour].
Mon ROAS Break-Even est [X] et mon ROAS Target est [X].

1. Dans quelle zone suis-je : sous le BE (couper/optimiser), entre BE et Target
   (maintenir), au-dessus du Target (augmenter) ?
2. Si je dois augmenter : propose-moi le prochain palier de budget en restant prudent
   (paliers progressifs, toutes les 24-48 h, pas d'un coup), et explique ce que je dois
   surveiller avant le palier suivant.
3. Pour mes créas gagnantes : propose 3 itérations dans cet ordre de priorité :
   nouveau hook, nouveau visuel, nouveau CTA, un seul élément changé à la fois.
4. Rappelle-moi les signes de fatigue à surveiller.
Reste concret et adapté à un débutant avec un petit budget.
```

## Boîte à outils du chapitre

| Outil | À quoi ça sert | Prix si connu |
| --- | --- | --- |
| **Meta Ads Manager** | Créer la campagne, lire les résultats par créa | Gratuit (tu paies la pub) |
| **Pixel Meta** | Remonter les achats vers Meta (indispensable pour lire ton test) | — |
| **Microsoft Clarity** | Voir où les visiteurs cliquent, s’arrêtent et quittent ta page (chapitre 21) | — |
| **MCP Meta Ads** | Connecter une IA à ton compte pour lire les stats (en lecture seule par défaut) | — |
| **ChatGPT / Claude** | Diagnostiquer tes chiffres, préparer ton plan de test, proposer des itérations | — |
| **Ton calcul du chapitre 6** | Avoir ton CPA max, ROAS BE et ROAS Target sous les yeux pendant le test | Gratuit |

## Checklist avant et pendant ton testing

**Avant de lancer**

- [ ] J’ai calculé mon CPA max, mon ROAS Break-Even et mon ROAS Target (chapitre 6)
- [ ] Mon pixel remonte bien l’événement Achat (chapitre 12)
- [ ] J’ai choisi mon budget (50 ou 100 €/jour) et ma durée, et j’ai l’argent pour aller au bout
- [ ] J’ai entre 5 et 15 créas (selon ton budget), avec un mélange TOFU/BOFU
- [ ] Campagne CBO, objectif Achat, ciblage large, lancement à minuit (fuseau de mes clients)
- [ ] Chaque créa a un nom clair (date-angle-format-version)

**Pendant le test**

- [ ] Je ne touche à rien le premier soir
- [ ] Je lis dans l’ordre : Dépensé → Achats → CPA → ROAS vs ROAS BE
- [ ] Je ne coupe jamais sur une seule métrique ni sur une seule journée
- [ ] J’applique mes seuils par créa (1× CPA max sans ATC, 2× CPA max sans achat)
- [ ] Je repère les créas « étouffées » par la CBO (bon CTR, quasi 0 € dépensé)

**Après le test**

- [ ] Je classe la campagne : sous le BE / entre BE et Target / au-dessus du Target
- [ ] Si ce n’est pas rentable, je trouve la première fuite (pub ou boutique ?)
- [ ] Si c’est rentable, j’augmente par paliers et je prépare un nouveau batch
- [ ] Je note mes décisions et leurs raisons

:::exercise Ta mission
Avant même de lancer ton premier euro, prépare ton **« tableau de bord de test »** : une feuille (papier ou tableur) avec en haut ton CPA max, ton ROAS BE et ton ROAS Target, puis une ligne par créa (nom, type TOFU/BOFU, dépensé, CTR, ajouts au panier, achats, verdict). Passe ensuite tes infos dans le Prompt 14.1 pour obtenir ton plan de test jour par jour. Le jour où tu lances, tu n’auras plus qu’à remplir les cases… et à résister à la panique du premier soir.
:::
