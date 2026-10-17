# Castel Studio — plan d'acquisition

Objectif de la semaine : **1 000 € encaissés en 7 jours**.
Objectif ensuite : **un revenu mensuel récurrent qui se construit client après client**, sans dépendre du téléphone.

---

## 0. La réalité des chiffres

**1 000 € en une semaine = une seule vente du Pack** (990 € HT), ou deux agences qui paient la première échéance de 495 €.

C'est atteignable, mais pas garanti : vous démarrez sans référence client, et une agence immobilière ne paie pas 990 € à un inconnu sur un simple email. Ce qui rend l'objectif réaliste, c'est **le volume et la personnalisation**. Chaque agence contactée reçoit SA page de diagnostic, avec SES chiffres.

Entonnoir visé pour la semaine (ordres de grandeur prudents, à ajuster avec vos vrais chiffres dès le 3e jour) :

| Étape | Volume semaine | Taux visé |
|---|---|---|
| Agences relevées + diagnostic généré | 200 | — |
| Emails envoyés (J0) | 200 | — |
| Diagnostics ouverts (alerte Netlify) | 40 à 60 | 20–30 % |
| Réponses | 8 à 15 | 4–7 % |
| Échanges sérieux (écrit ou appel) | 3 à 5 | — |
| **Ventes** | **1 à 2** | — |

Si vous n'êtes pas à **20 ouvertures** de diagnostic à J3, le problème vient de l'objet ou de la liste, pas de l'offre : changez l'objet de l'email.
Si les ouvertures sont là mais sans réponse, c'est la page de diagnostic : envoyez-moi les chiffres et on la retravaille.

Avec 0 vente à J7 mais 10 conversations en cours, la semaine n'est pas ratée : en B2B, la moitié des ventes tombent entre J8 et J21, grâce aux relances.

---

## 1. Avant de lancer (J0, une demi-journée)

À faire **dans cet ordre**, sinon les ventes ne pourront pas être encaissées :

1. **Identité légale** : remplir `_sources/identite.json`, puis `python3 _sources/construire.py .`
2. **Stripe** : créer les 2 liens de paiement (990 € et 495 €), avec redirection après paiement vers `/bienvenue.html`, puis les coller dans `assets/js/config.js`.
3. **Nom de domaine + email pro** : par exemple `castelstudio.fr` et `contact@castelstudio.fr` (Google Workspace ou OVH). Ensuite, `python3 changer-domaine.py`.
   **Important :** envoyer la prospection depuis un **second domaine** (par exemple `castel-studio.fr`), pour protéger le domaine principal.
4. **Configuration de l'envoi (anti-spam)** : SPF, DKIM et DMARC sur le domaine d'envoi. Votre hébergeur email l'explique en 10 minutes.
5. **Netlify** : déployer, puis activer Forms. Vérifier que les formulaires `contact`, `audit`, `lancement` et `ouverture` apparaissent.
6. **Notifications Netlify Forms par email** : chaque ouverture de diagnostic vous arrive en direct. C'est votre signal pour relancer au bon moment.
7. **Outil d'envoi des emails** : un outil d'envoi programmé (lemlist, La Growth Machine, Brevo…) ou, pour la première semaine, votre boîte pro avec 40 envois par jour au maximum, à la main ou par fusion d'emails depuis `envois.csv`.

---

## 2. Qui viser (ne pas se disperser)

**Cible prioritaire :** les agences immobilières **indépendantes** (pas les franchises, dont la communication est verrouillée par le siège), dans des villes de **30 000 à 300 000 habitants** : Angers, Poitiers, Tours, Limoges, Le Mans, Pau, La Rochelle, Niort, Valence, Annecy…

Dans ces villes, la concurrence sur Google Maps est réelle mais pas saturée, et le dirigeant décide seul.

**Signal d'achat** (à repérer pendant le relevé) :

- Position entre la **4e et la 15e** sur « agence immobilière + ville ».
- **Moins de 40 avis**, alors que le leader en a plus de 100.
- Un dernier avis vieux de plusieurs mois, ou des avis sans réponse.

Ce sont elles qui ont **le plus à gagner** et qui le voient tout de suite dans le diagnostic.

**À éviter la première semaine :** les agences déjà dans le top 3 avec plus de 150 avis, les franchises nationales, Paris intra-muros et Lyon centre (concurrence trop forte pour une première preuve).

---

## 3. La méthode « zéro appel »

Vous êtes fort en digital et vous n'aimez pas le téléphone : la vente se fait **par écrit**, et la page de diagnostic fait le travail de conviction.

1. **Relevé** (5 min par agence) : Google Maps en navigation privée → « agence immobilière + ville ». Notez la position, la note, le nombre d'avis et la date du dernier avis de l'agence, puis le nom, la note et les avis des 3 premières, et cochez les 4 constats. Une ligne dans `prospects.csv`.
2. **Génération** : `python3 _pilotage/diagnostics.py _pilotage/prospects.csv`, puis redéploiement. Chaque agence a sa page `d/…html` et son email prêt dans `envois.csv`.
3. **Envoi** de l'email J0 (déjà rédigé avec ses chiffres et son lien).
4. **Alerte d'ouverture** : dès qu'un diagnostic est ouvert, vous recevez l'email Netlify. **Dans l'heure**, envoyez un message court par email ou LinkedIn :
   « Je vois que vous avez pu regarder le diagnostic. Une question sur un point précis ? Je vous réponds par écrit. »
5. **Questions** : répondez avec les réponses types de la section 5, toujours en renvoyant vers le bouton « Réserver le secteur ».
6. **Paiement** → page `bienvenue.html` → formulaire de lancement. Aucun appel nécessaire.

Option qui double l'impact sans parler à personne en direct : pour les 20 agences les plus chaudes, enregistrez une **vidéo d'écran de 60 secondes** (votre voix, sans visage) où vous montrez leur fiche. Collez le lien YouTube non répertorié dans la colonne `video` : il apparaît dans leur diagnostic.

---

## 4. Le sprint de 7 jours

Rythme quotidien : **2 h de relevé, 1 h d'envoi, 1 h de réponses**. C'est tout.

| Jour | Action | Volume |
|---|---|---|
| **J1** | Prérequis de la section 1. Choix de 5 villes. Relevé de 40 agences, génération, relecture de 3 pages avec `?apercu`. | 40 diagnostics |
| **J2** | Envoi des 40 emails J0 (entre 8 h et 10 h, du mardi au jeudi de préférence). Relevé de 40 nouvelles agences. | 40 envois |
| **J3** | Envoi J0 aux 40 nouvelles. Réponse dans l'heure à chaque alerte d'ouverture. Relevé de 40 agences. | 40 envois |
| **J4** | Envoi J0 (40). Relance J3 aux agences du J2 qui n'ont pas répondu. Premier bilan des taux. | 40 + 40 |
| **J5** | Envoi J0 (40). Relance J3 du J3. Si le taux d'ouverture est inférieur à 15 % : changer l'objet de l'email. | 40 + 40 |
| **J6** | Relance J3 du J4. Message LinkedIn aux dirigeants des agences qui ont ouvert sans répondre. | 40 + 20 |
| **J7** | Relance J7 (dernier message) aux agences du J2. Bilan : ouvertures, réponses, ventes. Décision pour la semaine 2. | 40 |

**Levier de clôture :** l'offre « agences fondatrices » (premier mois offert, 5 places) s'affiche partout tant que `fondateurs.restantes` est supérieur à 0 dans `config.js`. Mettez le compteur à jour à chaque vente. **Ne l'affichez que si c'est vrai.**

---

## 5. Les réponses types (à copier-coller)

**« Combien ça coûte ? »**
> 990 € HT de mise en place (en une ou deux fois), puis 149 € HT par mois, sans engagement. La garantie est écrite au contrat : 10 avis 5 étoiles en 30 jours, sinon le mois suivant est offert. Le détail et la commande sont ici : [lien du diagnostic]#commander

**« On a déjà quelqu'un / on gère nous-mêmes. »**
> Très bien. Le diagnostic montre simplement l'écart actuel : [N] avis avec [leader]. Si dans trois mois cet écart n'a pas bougé, ma proposition tient toujours.

**« Je n'ai pas le temps. »**
> C'est justement le principe : de votre côté, il y a dix minutes de formulaire et des validations par email. Le reste tourne seul.

**« Envoyez-moi une proposition. »**
> La voici, avec vos chiffres : [lien]. Tout y est, prix et garantie compris. Vous pouvez réserver directement, ou me poser vos questions ici.

**« C'est légal, les SMS à nos clients ? »**
> Oui : il s'agit d'un message unique, adressé à vos propres clients et lié à la prestation qu'ils viennent de recevoir, avec possibilité de refuser les envois suivants. Je suis sous-traitant de vos données (article 11 des CGV).

**« Vous avez des références ? »**
> Vous seriez parmi nos agences fondatrices : c'est pour ça que le premier mois est offert et que la garantie est contractuelle. Le risque est de notre côté, pas du vôtre.

---

## 6. Les règles à ne jamais enfreindre

- **Prospection B2B par email** : autorisée vers l'adresse professionnelle d'une entreprise, à condition que le message concerne son activité. Il faut vous identifier clairement et proposer un moyen simple de refuser les messages suivants (déjà dans les emails générés). Retirez immédiatement toute agence qui répond « stop ».
- **Pas de SMS ni de WhatsApp de prospection non sollicités** vers les numéros des agences. Les messages WhatsApp ne servent qu'à répondre à une agence qui vous a écrit.
- **Jamais de faux avis**, d'avis achetés ou d'avis « filtrés » chez vos clients : c'est contraire aux règles de Google, sanctionné par la loi, et cela détruirait la garantie.
- **Pas plus de 40 à 50 emails par jour et par boîte d'envoi** la première semaine.
- **Les diagnostics** ne contiennent que des informations publiques de Google Maps. Ils sont non indexés (`noindex` et `robots.txt`) et chaque lien est unique.

---

## 7. Livrer (dès la première vente)

| Jour | Tâche | Outil |
|---|---|---|
| J+1 | Relevé de départ (grille de position) + email de bienvenue | Local Falcon (ou équivalent) |
| J+2 à J+7 | Reprise de la fiche : catégorie, services, zone, photos, description, liens | Google Business Profile |
| J+5 | Automatisation des avis : déclencheur → SMS ou WhatsApp → lien d'avis → relance à J+3 | Brevo ou Twilio (SMS), API WhatsApp Business, Make ou n8n |
| J+7 | Landing page d'estimation (copie du modèle, adaptée au secteur) | Netlify (un sous-dossier par client) |
| J+10 | Sollicitation unique des clients des 24 derniers mois | Même automatisation |
| J+14 | Mise en service → l'abonnement et la garantie démarrent | Stripe (abonnement 149 €) |
| J+44 | Bilan de la garantie + premier rapport mensuel | Rapport PDF |

**Documentez chaque étape la première fois** (captures et liste de contrôle) : c'est ce document qui vous permettra de déléguer ensuite.

---

## 8. Passer à l'échelle

Le Pack est conçu pour l'échelle : **chaque client ajoute 149 € de revenu mensuel récurrent**.

### Palier 1 — Semaines 2 à 4 : la preuve
- **Objectif : 3 à 5 clients**, soit 450 à 750 € par mois de récurrent, plus les mises en place.
- Même routine qu'en semaine 1, sur 200 agences par semaine.
- Dès le premier client, captures **avant/après réelles** (avec son accord écrit) → je les intègre au site à la place des simulations. C'est le meilleur levier de conversion qui existe.
- Demander à chaque client un **avis Google sur Castel Studio** et un **témoignage écrit**.

### Palier 2 — Mois 2 et 3 : la machine
- **Objectif : 10 à 15 clients**, soit environ 1 500 à 2 200 € par mois de récurrent.
- **Automatiser le relevé** : passer à l'API Google Places (officielle, payante à l'usage) pour remplir `prospects.csv` automatiquement. Ne pas utiliser d'outil de scraping de Google Maps, interdit par les conditions de Google. Le relevé passe de 5 minutes à quelques secondes par agence.
- **Déléguer la livraison** : un(e) assistant(e) freelance formé(e) sur votre liste de contrôle (fiches, photos, réponses aux avis), payé(e) à la fiche.
- **Monter le prix** pour les nouveaux clients une fois 10 études de cas en ligne, par exemple 1 290 € de mise en place. Les premiers clients gardent leur tarif.
- **Contenu LinkedIn** : un avant/après réel par semaine. C'est du texte et des captures, sans vidéo face caméra.

### Palier 3 — Mois 4 à 6 : les canaux qui travaillent sans vous
- **Objectif : 30 clients**, soit environ 4 500 € par mois de récurrent.
- **Un commercial freelance à la commission** (environ 20 à 30 % de la mise en place) pour les prospects qui veulent absolument un appel. Vous gardez la stratégie et la livraison, il ou elle prend le téléphone.
- **Partenariats avec les réseaux de mandataires** : une offre « réseau » par conseiller (par exemple 49 à 79 € par mois et par conseiller, avec une mise en place allégée), vendue une fois à l'animateur du réseau pour 20, 50 ou 100 conseillers.
- **Apporteurs d'affaires** : diagnostiqueurs immobiliers, courtiers et photographes immobiliers, qui voient des agences toute la semaine. Commission sur chaque client apporté.
- **Publicité** : retargeting LinkedIn et Meta sur les visiteurs du site et des diagnostics, puis Google Ads sur « visibilité agence immobilière google ».

### Palier 4 — Mois 6 à 12 : l'actif
- **Objectif : 60 à 100 clients**, soit environ 9 000 à 15 000 € par mois de récurrent.
- **Tableau de bord client** (accès privé : avis, position, demandes d'estimation). Il justifie la hausse de l'abonnement et réduit les départs.
- **Marque blanche** : vendre la méthode clé en main à d'autres agences web.
- **Options payantes** : page d'estimation supplémentaire par quartier (+49 €/mois), gestion des fiches multi-agences.

### Les 4 chiffres à suivre chaque lundi
1. Diagnostics envoyés et taux d'ouverture.
2. Réponses et ventes.
3. Revenu mensuel récurrent (nombre de clients × 149 €).
4. Taux de garantie tenue (clients à 10 avis ou plus en 30 jours). Si ce taux baisse, c'est la livraison qu'il faut corriger avant de vendre plus.
