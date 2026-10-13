---
title: "Livrer un site : hébergement et nom de domaine"
description: L'étape qui a coûté l'échec le plus douloureux du livre. Héberger sur Vercel, acheter un domaine, brancher les DNS, et la check-list de livraison.
module: livraison
icon: globe
updated: 2026-10-13
origin: mixte
source: Livre, chapitre 07
---

L'étape qui m'a coûté mon plus gros échec. Ne prends aucun client avant de la maîtriser.

## Héberger ton site sur Vercel — gratuit pour démarrer

:::steps
1. Crée un compte sur vercel.com, en te connectant avec GitHub (ou crée un compte GitHub si tu n'en as pas).
2. Place le code de ton site dans un dépôt GitHub (ou utilise l'import direct de fichiers si ton IA génère un export statique).
3. Sur Vercel, clique « Add New → Project » et importe ton dépôt.
4. Vercel détecte automatiquement la configuration (HTML statique, Next.js, etc.) — laisse les réglages par défaut si tu n'es pas sûr.
5. Clique « Deploy ». En moins d'une minute, ton site est en ligne sur une adresse du type ton-projet.vercel.app.
6. Pour chaque nouvelle modification poussée sur GitHub, Vercel redéploie automatiquement.
7. Va dans « Settings → Domains » pour préparer le branchement de ton propre nom de domaine.
:::

:::cols
> [!INFO] Si ça ne marche pas
> Erreur de build : vérifie que ton fichier d'accueil s'appelle bien index.html à la racine. Page blanche : regarde l'onglet « Deployments » puis les logs, l'erreur exacte y est presque toujours écrite en clair.
+++
> [!ASTUCE]
> Garde toujours une version de ton site accessible et fonctionnelle avant de montrer une maquette à un client — un lien cassé en rendez-vous ruine la crédibilité en un instant.
:::

> [!ATTENTION] Offre gratuite et usage commercial
> Les offres gratuites des hébergeurs ont des conditions d'usage (certaines réservent l'offre gratuite à un usage personnel ou non commercial, ou limitent le trafic). Avant d'héberger le site d'un client, lis les conditions en vigueur de l'offre que tu utilises et prévois, si nécessaire, de refacturer un abonnement payant. Vérifié comme point d'attention le 13/10/2026 ; les conditions évoluent.

## Acheter un nom de domaine sur Ionos

:::steps
1. Va sur ionos.fr et vérifie la disponibilité du nom souhaité (essaie d'abord le .fr et le .com).
2. Ajoute le domaine au panier — les premières années sont souvent proposées à prix réduit.
3. Crée ton compte et finalise l'achat (un parent devra probablement renseigner le moyen de paiement si tu es mineur).
4. Va dans « Domaines & SSL → gérer le domaine → DNS ».
5. Sur Vercel, dans les paramètres de domaine du projet, note les enregistrements demandés (en général un A et/ou un CNAME).
6. Ajoute ces enregistrements exacts dans la zone DNS d'Ionos.
7. Attends la propagation (de quelques minutes à quelques heures), puis vérifie sur Vercel que le domaine passe au statut « valide ».
:::

| Extension | Quand la choisir |
| --- | --- |
| .fr | Activité 100 % locale ou française — le plus rassurant pour un commerçant. |
| .com | Si tu vises plus large, ou si le .fr est déjà pris. |
| Nom court | Toujours privilégier : plus facile à dicter au téléphone. |
| Éviter les tirets | ton-agence-web-pro.fr est beaucoup plus dur à retenir et à dicter. |

> [!ERREUR] Erreur fréquente
> Ajouter les enregistrements DNS sans supprimer ceux mis par défaut : les deux entrent en conflit et le domaine ne pointe nulle part. Supprime l'ancien enregistrement A avant d'ajouter celui de Vercel.

Un site en tonnom.fr paraît immédiatement plus professionnel qu'un lien en .vercel.app — c'est souvent ce détail qui fait basculer la décision d'un commerçant hésitant.

> [!ASTUCE] Au nom de qui acheter le domaine du client ?
> Idéalement **au nom du client** (ou transférable à sa demande), avec ses accès. Tu peux gérer techniquement le domaine pour lui, mais il doit pouvoir le récupérer s'il change de prestataire. Note dans ta proposition qui paie le renouvellement annuel, et mets un rappel dans ton agenda un mois avant chaque échéance. Les accès définitifs se transmettent après paiement du solde.

## Check-list de livraison d'un site

- [ ] Le site s'affiche correctement sur mobile
- [ ] Le nom de domaine pointe bien vers le site
- [ ] Le certificat HTTPS est actif
- [ ] Les mentions légales sont présentes
- [ ] Le bandeau cookies est conforme si tu utilises un outil de mesure
- [ ] Tous les liens et le formulaire de contact fonctionnent
- [ ] Le client a reçu ses accès

### Les vérifications complémentaires

- [ ] Le numéro de téléphone est cliquable sur mobile
- [ ] Le formulaire de contact arrive bien dans la bonne boîte (teste-le toi-même)
- [ ] Les textes ont été relus (orthographe, horaires, adresse, téléphone)
- [ ] Les images sont légères (le site se charge vite en 4G) et le client a les droits sur chacune
- [ ] Le titre de page et la description sont renseignés (ce qui s'affiche dans Google)
- [ ] Le lien vers le site est ajouté sur la fiche Google Business du client
- [ ] Une sauvegarde du site (code ou export) est conservée
- [ ] La facture du solde est émise et payée avant le transfert des accès définitifs

> [!LEGAL] Mentions légales et cookies
> Un site professionnel doit afficher des mentions légales (identité de l'éditeur, coordonnées, hébergeur…). Si le site utilise des cookies non essentiels (mesure d'audience non exemptée, publicité, vidéos intégrées…), le consentement de l'internaute est requis avant de les déposer. Les détails sont dans [Obligations de la vente en ligne et des prestations](@fiscalite/obligations-vente-en-ligne-et-prestations) et un modèle de mentions dans [Modèles](@fiscalite/modeles-contrats-mentions-legales-facture).

```copy title="Message de livraison au client" kind="message"
Bonjour [Prénom], bonne nouvelle : votre site est en ligne sur [adresse] ! Vous pouvez le consulter dès maintenant sur téléphone et ordinateur. Je vous envoie dans un message séparé vos accès (nom de domaine et hébergement) dès réception du solde, comme prévu. Si vous voyez la moindre coquille, dites-le-moi d'ici [date] : c'est inclus. Merci pour votre confiance !
```

:::recap
- Ne prends aucun client avant de savoir héberger, brancher un domaine et sécuriser un site.
- Vercel pour héberger, un registraire (ex. Ionos) pour le domaine, des DNS propres (supprime l'ancien A).
- Domaine au nom du client ou transférable ; accès définitifs après le solde.
- Check-list de livraison systématique, avec mentions légales et HTTPS.
:::
