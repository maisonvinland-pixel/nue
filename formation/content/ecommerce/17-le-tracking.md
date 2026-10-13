---
title: "Le tracking"
description: "Tu sauras : ce que ton pixel enregistre vraiment (les 5 « événements »), pourquoi les pros ajoutent une connexion « serveur » (CAPI) en plus du pixel, à quoi servent GA4 et GTM…"
module: scaler
icon: target
updated: 2026-10-13
origin: livre
source: "Ebook e-commerce (Notion), chapitre 17"
---
> [!INFO] Ce que tu vas apprendre
> **Niveau : intermédiaire**
>
> À la fin, tu sauras : ce que ton pixel enregistre vraiment (les 5 « événements »), pourquoi les pros ajoutent une connexion « serveur » (CAPI) en plus du pixel, à quoi servent GA4 et GTM, comment vérifier que ton suivi marche avant de dépenser, et surtout comment savoir d’où viennent tes ventes (UTM, codes promo, question après l’achat) sans te faire piéger par des chiffres qui ne collent pas entre eux.

## Pourquoi ce chapitre compte autant

Imagine un magasin sans caisse enregistreuse, sans compteur à l’entrée et sans tickets. Le soir, il y a de l’argent dans le tiroir… mais tu ne sais pas quel produit s’est vendu, à qui, ni quelle affiche a fait entrer les clients. Tu ne peux rien améliorer. C’est exactement une boutique en ligne **sans tracking**.

Le **tracking** (« suivi » en anglais), c’est l’ensemble des outils qui **comptent les actions importantes** sur ton site et dans tes pubs : une visite, un ajout au panier, un achat. En une phrase : **sans tracking précis, tu ne sais pas ce qui fonctionne et tu gaspilles ton budget**.

Au chapitre 12, tu as vu la règle de base : **pas de pixel vérifié = pas de pub**. Ici, on va plus loin : comment le pixel fonctionne, comment le renforcer, comment le tester, et comment lire d’où vient chaque euro.

> [!RETENIR] À retenir
> « **zapper le pixel et l’email dès le départ** » parmi les **8 pièges qui tuent un débutant**. Le tracking n’est pas une option « pour plus tard ».

## Le vocabulaire du chapitre

| Mot | Ce que ça veut dire, simplement |
| --- | --- |
| **Pixel** | Un petit code de suivi installé sur ton site. Il envoie à la plateforme de pub (Meta, TikTok, Google…) ce que font les visiteurs : pages vues, ajouts au panier, achats. |
| **Événement** | Une action précise que le pixel enregistre (ex. « ajout au panier »). |
| **Conversion** | L’action que tu veux obtenir au bout du compte. En e-commerce : l’**achat**. |
| **CAPI / API serveur** | Une deuxième façon d’envoyer les événements : directement depuis le serveur, en plus du navigateur du client. On l’explique plus bas. |
| **Déduplication** | Le fait de ne pas compter deux fois le même achat quand il arrive par deux chemins (pixel + serveur). |
| **GA4** | Google Analytics 4 : l’outil **gratuit** de Google pour analyser les visites de ton site (qui vient, quelles pages, combien de temps, d’où). |
| **GTM** | Google Tag Manager : une « boîte centrale » qui gère tous tes codes de suivi au même endroit. |
| **Balise (tag)** | Un code de suivi rangé dans GTM (ex. « envoyer l’achat à GA4 »). |
| **UTM** | Des petites étiquettes ajoutées à la fin d’un lien pour savoir d’où vient le clic. |
| **Attribution** | Le système qui décide **quelle pub ou quel canal reçoit le mérite** d’une vente. |
| **Fenêtre d’attribution** | Le délai pendant lequel une vente est encore attribuée à une pub (ex. un achat 7 jours après le clic). |

## Partie 1 — Le pixel, en profondeur

### Ce qu’il enregistre : les 5 événements

Le chemin du client se décrit en **5 événements**, du simple passage à l’achat. Pense à un client dans un vrai magasin :

| # | Événement | Dans un vrai magasin | Ce que ça te dit |
| --- | --- | --- | --- |
| 1 | **PageView** (vue de page) | Il passe la porte | Diagnostic : le trafic arrive bien. Doit se déclencher **une fois par vraie page**. |
| 2 | **ViewContent** (vue du produit) | Il prend le produit en main | Intérêt : un produit / une offre est identifié. |
| 3 | **AddToCart** (ajout au panier) | Il le met dans son panier | Intention : on envoie la **valeur** et l’**identifiant** du produit. |
| 4 | **InitiateCheckout** (début de paiement) | Il fait la queue à la caisse | Friction : le checkout a **réellement** été ouvert. |
| 5 | **Purchase** (achat) | Il paie et repart avec son ticket | Décision : on envoie un **ID unique** de commande + la **valeur** + la **devise**. |

Pourquoi c’est important ? Parce que chaque étape où ça « fuit » te dit **quoi réparer**. Beaucoup d’ajouts au panier mais peu d’achats ? Le problème est plutôt au panier ou au paiement. Peu d’ajouts au panier ? Plutôt la page ou l’offre. (La lecture complète de ces chiffres, c’est le chapitre 14 pour les pubs et le chapitre 21 pour la boutique.)

> [!RETENIR] À retenir
> L’événement le plus important, c’est l’**achat**, avec 3 infos obligatoires : un **ID unique** (le numéro de commande), la **valeur** (le montant) et la **devise** (€, $…). Sans valeur, la plateforme ne peut pas calculer ton ROAS (ton chiffre d’affaires ÷ ce que tu as dépensé en pub).

### Quand l’installer

- **Dans l’ordre du montage de ta boutique** : le pixel se place en **dernière étape** du montage Shopify (produit → collections → menu et pages → thème → réglages → domaine → **pixel**). Logique : on installe la caméra quand le magasin est fini.
- **Avant la moindre pub** : **installe le tracking AVANT de lancer la moindre pub**.
- **Dès le 1er jour, même en organique** : installe les pixels **Meta + TikTok** dès le départ, avec une **bannière cookies**. Même si tu ne fais pas encore de pub, ton pixel commence à apprendre qui achète chez toi.

### Un seul pixel, et tu le gardes

Ton pixel, c’est la **mémoire** de ta boutique. Plus il voit d’acheteurs, mieux il sait en trouver d’autres.

- **La niche aide ton pixel** : une boutique de niche fait que le pixel « **chauffe** » sur **une seule cible** (on en parlait au chapitre 3). Si tu vends une lampe, puis un collier pour chien, puis une crème, ton pixel apprend trois clients différents et n’en connaît bien aucun.

> [!ASTUCE] Astuce de pro
> Le pixel sert aussi à **espionner** (proprement). Si un concurrent a un **pixel Meta installé**, c’est qu’il fait des pubs. Et une boutique **sans aucun pixel ni tracking** est un **red flag** (signal d’alerte) : soit elle ne fait pas de pub, soit elle n’est pas sérieuse. (Les outils pour le voir, c’est le chapitre 5.)

## Partie 2 — Pixel + serveur (CAPI) : deux témoins valent mieux qu’un

### Le problème du pixel seul

Le pixel fonctionne **dans le navigateur** du client (Chrome, Safari…). Or, entre le navigateur et la plateforme de pub, des choses peuvent bloquer le signal. Parmi les raisons d’écart entre outils : le **consentement** (le client refuse les cookies) et les **bloqueurs**. L’attribution est aussi devenue **plus compliquée depuis iOS 14**, qui limite le tracking sur iPhone.

Résultat : des ventes réelles que ta plateforme de pub **ne voit pas**. Et une plateforme qui ne voit pas tes acheteurs ne peut pas en trouver d’autres.

### La solution : un deuxième chemin, depuis le serveur

Architecture recommandée : **Pixel web + Events API serveur (CAPI) = signal dédupliqué**.

L’analogie : imagine qu’un achat est un colis qu’on doit déclarer à la plateforme.

- Le **pixel**, c’est le client qui le déclare depuis son téléphone. Parfois, son téléphone bloque l’envoi.
- La **CAPI** (API de conversions, ou API serveur), c’est **ta boutique** qui le déclare directement depuis son propre système. Elle ne dépend pas du téléphone du client.

Deux témoins pour la même vente : si l’un rate, l’autre est là.

Par plateforme :

- **TikTok** : connexion des données = **Pixel + API, avec déduplication** (fait officiel).
- **Snapchat** : **Pixel + CAPI conjoints** (utilisés ensemble).

### La déduplication : ne pas compter deux fois le même achat

Si le pixel ET le serveur déclarent le même achat, la plateforme risque de compter **2 ventes au lieu d’1**. Ton ROAS paraîtrait deux fois meilleur… et tu prendrais de mauvaises décisions.

La solution, c’est l’**ID unique** dont on parlait plus haut. Règle : l’**ID doit être stable entre le web et le serveur**. Comme deux témoins qui citent le **même numéro de ticket** : la plateforme voit que c’est la même vente et ne la compte qu’une fois.

> [!ERREUR] L'erreur à éviter
> Croire que « plus d’achats affichés = mieux ». Si ton tableau de bord montre soudain beaucoup plus d’achats que ta boutique Shopify n’a reçu de commandes, ce n’est pas une bonne nouvelle : c’est souvent un **doublon**. Ta boutique, elle, compte les vraies commandes.

### Côté Google : les « conversions améliorées »

L’équivalent chez Google Ads : les **conversions améliorées**. L’email et le téléphone du client sont **transformés en code illisible (« hash ») avant d’être envoyés**, ce qui permet à Google de **reconnaître des clients qu’il aurait ratés** quand les cookies sont bloqués. Même idée que la CAPI : récupérer les ventes que le navigateur n’a pas pu signaler.

> [!RETENIR] À retenir
> Pixel = le témoin du navigateur. CAPI = le témoin du serveur. ID unique = le numéro de ticket qui évite de compter deux fois. Les trois ensemble = un signal propre.

## Partie 3 — Vérifier que ton tracking marche (avant de dépenser)

Installer, c’est bien. **Vérifier**, c’est ce qui compte. Vérifie d’abord que **l’événement achat remonte**, sinon **toute l’analyse est faussée**.

### Le contrôle qualité d’un événement

Voici 3 règles simples pour chaque événement :

1. **Un déclenchement par action** : un achat = un événement achat. Pas zéro, pas deux.
1. **Valeur et devise correctes** : une commande de 49 € doit remonter « 49 » et « EUR », pas « 0 » ni « 49 $ ».
1. **ID stable entre web et serveur** (pour la déduplication).

### Les outils de test

- Le **Pixel Helper** ou l’outil **Test Events** des plateformes : pour vérifier qu’il n’y a **pas de doublon**.
- Le **mode « Aperçu »** de GTM (si tu utilises GTM, voir partie 4) : un mode test **sans mise en ligne**, pour vérifier que chaque balise se déclenche au bon moment avant de publier.

### Le test qui compte vraiment : le vrai parcours sur un vrai téléphone

Dans un plan de lancement en 14 jours, réserve :

- le **jour 2** à un « **tracking testable** » : pixel de la plateforme, événements du funnel, Test Events + déduplication ;
- le **jour 7** à la règle « **zéro surprise** » : parcours sur un **téléphone réel**, **achat test**, UTM et tableau de bord vérifiés.

Pourquoi un vrai téléphone ? Parce que tes pubs sur TikTok, Instagram ou Facebook sont surtout vues sur téléphone. Si ça marche sur ton ordinateur mais pas sur un iPhone, tu ne le sauras jamais autrement.

> [!ERREUR] L'erreur à éviter
> Te dire « Shopify s’occupe de tout, ça doit marcher ». Tant que tu n’as pas vu de tes yeux un **achat test** apparaître dans l’outil de test de la plateforme, avec la bonne valeur, tu ne sais pas si ça marche.

### Ta liste « GO / NO-GO » côté tracking

Termine ton plan par une checklist de 10 points avant de lancer. Quatre concernent directement le tracking :

- L’événement final (l’achat) remonte avec **valeur, devise et identifiant unique**.
- Le Pixel Helper / Test Events ne montre **pas de doublon**.
- Le parcours complet a été **testé sur un téléphone réel**.
- Les **UTM** identifient **plateforme, campagne et créative** (on y vient en partie 5).

Si un seul de ces points est « non », c’est **NO-GO** : tu répares avant de lancer.

## Partie 4 — GTM et GA4 : le duo de Google

Le pixel Meta et le pixel TikTok parlent à **leur** plateforme. Mais pour analyser ton site dans son ensemble, et si un jour tu fais de la pub Google (chapitre 16), tu vas croiser deux outils : **GTM** et **GA4**.

### À quoi sert chacun

Avec Google Ads :

| Outil | Son rôle | L’analogie |
| --- | --- | --- |
| **GTM** (Google Tag Manager) | L’outil **central** qui gère **tous** les codes de suivi. Il a un identifiant du type GTM-XXXX. | La **multiprise** : tu la branches une fois au mur, puis tu y branches tous tes appareils sans retoucher au mur. |
| **GA4** (Google Analytics 4) | **Mesure et analyse les visites** : qui vient, quelles pages, combien de temps. Gratuit. | Le **cahier de bord** du magasin : qui est entré, par où, combien de temps il est resté. |
| **Google Ads** | Crée les pubs Google et **reçoit l’info quand une pub amène un client**. | La **régie pub** qui veut savoir si ses affiches ont marché. |

L’architecture : **ton site → envoie les infos à GTM → GTM les transmet à GA4 (pour analyser) et à Google Ads (pour les pubs)**.

Le gros avantage de GTM : on colle **2 morceaux de code** dans le site (un dans la partie `<head>`, un dans la partie `<body>`), **une seule fois**. Ensuite, tout se règle dans GTM, sans retoucher au code du site.

### Les 3 briques de GTM, expliquées simplement

Pour configurer GTM, on assemble 3 types de briques. Une recette de cuisine aide à comprendre :

| Brique | Ce que c’est | Dans la recette |
| --- | --- | --- |
| **Variable** | Une info que le site transmet (ex. la valeur de la commande, d’où vient le visiteur) | Les **ingrédients** |
| **Déclencheur** | Le moment où quelque chose doit se passer (ex. « quand l’achat est validé ») | Le **« quand »** (« quand l’eau bout… ») |
| **Balise** | L’action envoyée à un outil (ex. « envoyer l’achat à GA4 ») | L’**action** (« …ajoute les pâtes ») |

### Les 9 étapes d’installation (version e-commerce)

⚠️ Cette méthode vient d’un cas réel d’**entreprise de ménage** qui suit des demandes de devis et des appels, pas des achats. On garde la **méthode**, en la transposant à une boutique (où la conversion principale est l’achat) :

1. **Installer GTM** : sur tagmanager.google.com, créer un compte puis un conteneur « Web », coller les 2 bouts de code dans le site.
1. **Faire envoyer les infos par le site** : le site envoie un message à GTM à chaque action importante, avec une étiquette qui dit d’où elle vient.
1. **Créer les variables** : la plus importante sépare ce qui vient **de la pub** de ce qui vient **du gratuit**.
1. **Créer les déclencheurs** : quand une action doit être comptée.
1. **Créer les balises** : vers GA4, vers Google Ads, plus une balise « **Conversion Linker** » qui **mémorise de quelle pub vient le visiteur**.
1. **Définir les conversions** dans Google Ads : une **principale** (chez toi, l’achat) et éventuellement des secondaires.
1. **Activer les conversions améliorées** (email et téléphone transformés en « hash » avant envoi, voir partie 2).
1. **Le consentement** : une bannière cookies, avec **tout refusé par défaut** ; la mesure démarre quand le visiteur clique « Accepter ».
1. **Tester, publier, vérifier** : mode « Aperçu » → vérifier que chaque conversion part au bon endroit (et ne part pas là où elle ne doit pas) → « Envoyer » → « Publier ».

> [!ASTUCE] Astuce de pro
> Le principe le plus utile, c’est la règle n°1 : **séparer ce qui vient de la pub de ce qui vient du gratuit**. Dans le cas de l’entreprise de ménage, on ne compte comme « conversion pub » que les demandes faites sur la page où arrivent les pubs, pas celles de la page d’accueil (qui viennent du référencement naturel). Pour toi, l’idée est la même : si tu mélanges tes ventes organiques et tes ventes pub, tu crois que tes pubs rapportent plus (ou moins) qu’en réalité.

> [!IA] L'IA peut t'aider
> GTM fait peur au début avec ses variables, déclencheurs et balises. Décris à ChatGPT ou Claude ce que tu veux suivre (« je veux envoyer l’achat avec sa valeur à GA4 ») et demande-lui de t’expliquer **chaque brique à créer, une par une, avec le mot exact à cliquer**. Puis teste toujours en mode Aperçu avant de publier : l’IA peut se tromper sur un nom de menu.

## Partie 5 — Savoir d’où viennent tes ventes

C’est LA question. Tu as fait 10 ventes aujourd’hui : est-ce grâce à ta pub Meta ? À ta vidéo TikTok de mardi ? À un client qui t’a recommandé ? Voici les méthodes, de la plus simple à la plus technique.

### Méthode 1 — Sans aucun outil (idéal en organique)

Voici 4 techniques simples :

| Technique | Comment ça marche | Exemple |
| --- | --- | --- |
| **Un code promo par plateforme** | Chaque canal a son propre code | Un code pour TikTok, un autre pour Instagram : si le code TikTok est utilisé, la vente vient de TikTok. |
| **La question après l’achat** | Sur la page de confirmation, tu demandes « Comment nous as-tu connus ? » | Le client coche TikTok, Instagram, un ami… |
| **La conversion filtrée par pays** | Tu regardes ton taux de conversion **uniquement sur ton pays cible** | Une vidéo virale vue à l’étranger peut ramener plein de visiteurs qui ne peuvent pas commander chez toi : ils font baisser ton taux sans rien dire de ta page. |
| **La fenêtre d’attribution** | Tu relies tes ventes à tes publications du **jour même et de la veille** | Une vidéo postée hier soir peut vendre ce matin. |

> [!ASTUCE] Astuce de pro
> Ces méthodes ne coûtent rien et marchent aussi avec la pub. Un code promo réservé à un créateur ou à une plateforme, c’est un compteur simple : il ne dépend pas des cookies.

### Méthode 2 — Les UTM : étiqueter chaque lien

Un **UTM**, c’est une étiquette collée à la fin de ton lien. Le visiteur ne la remarque pas, mais GA4 la lit et sait exactement d’où vient le clic.

Il y a **5 paramètres** :

| Paramètre | Ce qu’il indique |
| --- | --- |
| **utm\_source** | D’où vient le clic (la plateforme) |
| **utm\_medium** | Le type de canal (ex. pub sur un réseau social) |
| **utm\_campaign** | Le nom de la campagne |
| **utm\_term** | Le mot-clé |
| **utm\_content** | La variante de l’annonce (quelle créa) |

Voici une **convention** simple (des règles de nommage fixes) : source = la plateforme, medium = `paid_social` (réseau social payant), campaign = le test, content = l’**angle créatif**. Exemple :

```copy title="Méthode 2 — Les UTM : étiqueter chaque lien" kind="modele"
?utm_source=tiktok&utm_medium=paid_social&utm_campaign=test_angle_1&utm_content=preuve_client
```

Lis-le comme une adresse : « ce clic vient de **TikTok**, d’une **pub payante sur réseau social**, de la campagne **test\_angle\_1**, et de la créa à l’angle **preuve client** ».

> [!ERREUR] L'erreur à éviter
> Écrire tes UTM au hasard (« TikTok », « tiktok », « Tiktok-ads »…). Pour l’outil, ce sont **trois sources différentes**, et tes chiffres seront éparpillés. Fixe ta convention une fois pour toutes, en minuscules, et respecte-la. Pense aussi à **nommer tes fichiers** de façon fixe : `[date]-[angle]-[format]-[version]`. Si ton nom de fichier et ton `utm_content` racontent la même chose, tu retrouves tout en deux secondes.

« **Activer le tracking (pixel, événements, UTM)** » fait partie des étapes d’upload de chaque pub, et de la checklist avant lancement : « **métriques de suivi en place (pixel, UTM, events)** ». Bref : chaque pub part avec ses étiquettes.

### Méthode 3 — Comprendre l’attribution (et ses pièges)

L’**attribution**, c’est le système qui décide **à qui revient le mérite** d’une vente. Trois modèles courants :

| Modèle | Qui reçoit le mérite | Exemple : le client voit ta pub TikTok, puis clique une pub Meta 3 jours après et achète |
| --- | --- | --- |
| **Last-click** (dernier clic) | Le **dernier** clic avant l’achat | Meta reçoit tout |
| **First-click** (premier clic) | Le **premier** contact | TikTok reçoit tout |
| **Linéaire** | Le mérite est **partagé** | Chacun en reçoit une part |

Et le même lexique ajoute une phrase à retenir : **comprendre l’attribution évite de couper des pubs qui rapportent en réalité**.

Les plateformes ont aussi leurs **fenêtres d’attribution**. Pour TikTok (fait officiel) : pour les clics, **1 ou 7 jours** ; pour les vues de vidéo engagées, **1 ou 7 jours** ; pour les simples vues, **désactivée ou 1 jour**. Concrètement : avec une fenêtre de 7 jours au clic, un achat fait 5 jours après avoir cliqué sur ta pub sera compté pour cette pub.

### Pourquoi tes outils ne disent jamais la même chose

Tu vas vite le remarquer : Meta dit 12 achats, Shopify dit 10 commandes, GA4 dit 8. Panique ? Non. Voici les causes d’écart (la « **réconciliation entre outils** ») :

- **Fenêtres d’attribution différentes** (chaque outil compte sur une durée différente).
- **Consentement et bloqueurs** (certains visiteurs ne sont pas suivis par tous les outils).
- **Fuseau horaire, devise et remboursements** (une journée ne commence pas à la même heure partout ; une commande remboursée peut encore être comptée quelque part).

Règle d’or : **ne jamais couper une campagne sur un chiffre dont tu ne connais pas la définition, la fenêtre ou la source**.

Pour comparer deux périodes ou deux pubs proprement : **même fenêtre** (dates, fuseau, délai de conversion, attribution), **même population** (nouveaux clients séparés du retargeting), **même objectif**, et **une seule variable** qui change.

> [!RETENIR] À retenir
> Ta boutique (Shopify) compte les **vraies commandes** et le **vrai argent**. Les plateformes de pub te disent **quelle pub a probablement aidé**. Tu as besoin des deux, mais quand tu calcules si tu gagnes de l’argent, pars de tes vraies commandes.

### Le premier réflexe : « la donnée est-elle fiable ? »

Voici un arbre de décision pour lire une campagne. **Toute première question** :

> [!INFO]
> **La donnée est-elle fiable ?** Si non → **STOP, répare le tracking.**

Avant de te demander si ta pub est bonne, demande-toi si tes chiffres sont justes. Dans ses fenêtres de lecture, il réserve d’ailleurs les **jours 0 et 1** d’une campagne à vérifier l’« intégrité » : dépense, diffusion, **tracking**, page d’arrivée, refus. Et dans ses rythmes de revue, le check **quotidien de 10 minutes** inclut le tracking.

## Partie 6 — Ce que tu fais de toutes ces données

Le tracking ne sert à rien si tu ne le lis pas. La lecture détaillée des pubs, c’est le **chapitre 14** ; l’optimisation de la boutique, c’est le **chapitre 21**. Ici, retiens juste **ce que ton tracking doit te permettre de voir**.

### Les indicateurs à afficher pour chaque pub

Voici ce qu’il faut récupérer, **pub par pub**, sur la période choisie :

| Indicateur | Ce qu’il te dit |
| --- | --- |
| Montant dépensé, impressions, CPM | Ce que coûte l’audience |
| Taux de clic sur lien, coût par clic | La force de l’accroche et du visuel |
| Lectures de 3 s ÷ impressions (vidéo) | Si les 3 premières secondes retiennent |
| ThruPlay, taux de lecture à 50 % (vidéo) | Si le script tient la distance |
| Ajouts au panier, coût par ajout | L’intérêt pour le produit |
| Achats, coût par achat, ROAS | La rentabilité, **ce qui compte vraiment** |

Tu remarques ? Les deux dernières lignes **n’existent que si ton pixel remonte bien les ajouts au panier et les achats**. Sans tracking, tu ne vois que le haut du tableau : combien tu dépenses et combien cliquent. Jamais si ça rapporte.

### Un chiffre à chaque étage

Deux contrôles simples :

- **Chaque étape** du parcours (vue, panier, paiement, commande) doit avoir **un chiffre suivi**. Une étape importante sans mesure = un **manque prioritaire**.
- Les chiffres doivent être **cohérents entre eux** : le nombre de commandes **ne peut pas dépasser** le nombre de personnes arrivées au paiement. Si c’est le cas, ton tracking a un problème.

Un piège : un chiffre **global sur tout ton catalogue** peut cacher un comportement très différent entre ton produit phare et le reste.

### Voir ce que font les visiteurs : Microsoft Clarity

Les chiffres te disent **où** les gens partent, pas **pourquoi**. Pour ça, **Microsoft Clarity** est un outil **gratuit** qui montre les **clics, les arrêts et les sorties** des visiteurs sur ton site. (On l’utilise en détail au chapitre 21.)

> [!IA] L'IA peut t'aider
> Le **connecteur officiel (MCP) Meta Ads** permet à une IA comme Claude de **lire les données de ton compte** et de te les résumer par pub. Règle déjà vue au chapitre 12 : l’IA **lit librement**, mais ne crée ou ne modifie rien sans ta demande explicite, et tout ce qu’elle crée reste **désactivé**. Et si l’IA analyse tes chiffres, elle commence par la même question que toi : **l’événement achat remonte-t-il ?**

## Prompt 17.1 : mon plan de tracking avant lancement

```copy title="Prompt 17.1 : mon plan de tracking avant lancement" kind="prompt"
Tu es un expert du tracking e-commerce (pixel, API serveur, GA4, GTM, UTM).
Ma boutique : Shopify, je vends [produit] à [prix moyen] €, dans [pays].
Canaux prévus : [ex. Meta Ads au lancement, TikTok organique en parallèle].
Ce que j'ai déjà installé : [ex. pixel Meta oui / pixel TikTok non / GA4 non / GTM non].

1. Liste les 5 événements à suivre (PageView, ViewContent, AddToCart, InitiateCheckout, Purchase) et, pour chacun, ce qu'il doit envoyer (pour l'achat : ID unique, valeur, devise).
2. Dis-moi ce qui manque dans mon installation, du plus urgent au moins urgent, en partant de la règle : "l'événement achat doit remonter avant toute pub".
3. Donne-moi un protocole de test pas à pas : vérifier qu'il n'y a pas de doublon, qu'un achat déclenche un seul événement, que la valeur et la devise sont justes, et faire un achat test sur un vrai téléphone.
4. Si un point dépend d'un réglage précis de Shopify ou d'une plateforme et que tu n'es pas sûr du chemin exact dans les menus, écris "à vérifier dans l'aide officielle" au lieu d'inventer.
Réponds en tableau puis en checklist à cocher. Tutoiement, mots simples.
```

## Prompt 17.2 : générer mes liens UTM

```copy title="Prompt 17.2 : générer mes liens UTM" kind="prompt"
Je veux étiqueter tous mes liens avec des UTM, en respectant cette convention, toujours en minuscules et sans espaces (remplace les espaces par des _) :
- utm_source = la plateforme (ex. meta, tiktok, snapchat, instagram_bio)
- utm_medium = le type de canal (ex. paid_social pour la pub, organic_social pour l'organique)
- utm_campaign = le nom de mon test ou de ma campagne
- utm_content = l'angle créatif de la pub ou de la vidéo

Mon lien de page produit : [colle ton lien]
Mes campagnes et créas :
[ex. Meta, campagne test_lampe_01, créas : douleur_dos, preuve_client, demo
TikTok organique, campagne lancement, vidéos : unboxing, avant_coucher]

1. Génère un tableau : plateforme | campagne | angle | lien complet avec UTM.
2. Vérifie que la même plateforme est toujours écrite exactement pareil.
3. Propose un nom de fichier pour chaque créa au format [date]-[angle]-[format]-[version] qui correspond à son utm_content.
```

## Prompt 17.3 : comprendre pourquoi mes chiffres ne collent pas

```copy title="Prompt 17.3 : comprendre pourquoi mes chiffres ne collent pas" kind="prompt"
Mes outils ne donnent pas les mêmes chiffres sur la même période et je veux comprendre avant de prendre une décision.
Période : [dates], fuseau horaire de mon compte pub : [fuseau], fuseau de ma boutique : [fuseau].
- Mon gestionnaire de pubs [Meta/TikTok] affiche : [X achats, Y € de CA attribué], fenêtre d'attribution : [si tu la connais, sinon "inconnue"]
- Shopify affiche : [X commandes, Y € de CA], dont [X] remboursées
- GA4 affiche (si installé) : [X achats]

1. Liste les causes possibles de l'écart, en t'appuyant sur : fenêtres d'attribution différentes, consentement et bloqueurs, fuseau horaire, devise, remboursements, doublons (pixel + serveur sans déduplication).
2. Pour chaque cause, dis-moi comment la vérifier concrètement.
3. Dis-moi si un chiffre est incohérent (ex. plus d'achats attribués que de commandes réelles) et ce que ça suggère.
4. Rappelle-moi sur quel chiffre m'appuyer pour savoir si je gagne de l'argent.
Ne tire aucune conclusion sur la qualité de mes pubs tant que la fiabilité des données n'est pas vérifiée. Si tu manques d'info, pose-moi la question.
```

## Boîte à outils du chapitre

| Outil | À quoi ça sert | Prix si connu |
| --- | --- | --- |
| **Pixel Meta** | Envoyer à Meta les visites, ajouts au panier et achats | — |
| **Pixel TikTok + API (avec déduplication)** | Suivre les événements pour TikTok par le navigateur et le serveur | — |
| **Pixel Snap + CAPI** | Même chose pour Snapchat (utilisés ensemble) | — |
| **Pixel Helper / Test Events** | Vérifier que les événements se déclenchent, sans doublon | — |
| **Google Tag Manager (GTM)** | Gérer tous les codes de suivi au même endroit ; mode « Aperçu » pour tester | — |
| **Google Analytics 4 (GA4)** | Analyser les visites, les sources de trafic, les conversions | Gratuit |
| **Conversions améliorées (Google Ads)** | Récupérer des ventes ratées quand les cookies sont bloqués | — |
| **UTM** (convention source / medium / campaign / content) | Savoir de quelle plateforme, campagne et créa vient chaque clic | — |
| **Codes promo par plateforme + question post-achat** | Savoir d’où viennent les ventes sans outil technique | — |
| **Microsoft Clarity** | Voir les clics, arrêts et sorties des visiteurs (détail au ch. 21) | Gratuit |
| **Connecteur (MCP) Meta Ads** | Laisser une IA lire les données de ton compte pub | — |
| **ChatGPT / Claude** | Plan de tracking, UTM, explication des écarts entre outils | — |

## Checklist tracking avant ta première pub

- [ ] Mon pixel Meta est installé (et le pixel TikTok si je vais sur TikTok), dès le 1er jour
- [ ] J’ai une bannière cookies sur ma boutique
- [ ] Les 5 événements remontent : PageView, ViewContent, AddToCart, InitiateCheckout, Purchase
- [ ] L’achat remonte avec un ID unique, la bonne valeur et la bonne devise
- [ ] Un achat = un seul événement (aucun doublon dans le Pixel Helper / Test Events)
- [ ] Si j’utilise pixel + serveur (CAPI), la déduplication fonctionne (même ID des deux côtés)
- [ ] J’ai fait un achat test complet sur un vrai téléphone
- [ ] J’utilise un seul pixel pour ma boutique, et je ne le change pas à chaque nouveau produit
- [ ] Ma convention UTM est écrite quelque part, en minuscules, et chaque pub a ses UTM
- [ ] Mes fichiers de créas sont nommés [date]-[angle]-[format]-[version]
- [ ] J’ai un code promo différent par plateforme ou créateur, et/ou la question « Comment nous as-tu connus ? » après l’achat
- [ ] Je sais que Meta, Shopify et GA4 n’afficheront pas les mêmes chiffres, et je sais pourquoi
- [ ] Je ne coupe jamais une pub sur un chiffre dont je ne connais pas la définition, la fenêtre ou la source

:::exercise Ta mission
Fais un **achat test** sur ta propre boutique depuis ton téléphone, en arrivant par un lien qui contient tes UTM. Ensuite, vérifie à trois endroits : l’outil de test de ta plateforme de pub (l’achat apparaît-il **une seule fois**, avec la **bonne valeur** et la **bonne devise** ?), ta boutique Shopify (la commande est-elle là ?) et GA4 si tu l’as installé (la source du clic est-elle la bonne ?). Note ce que tu vois dans un tableau. Si un seul des trois ne colle pas, tu répares **avant** de lancer ta première pub.
:::
