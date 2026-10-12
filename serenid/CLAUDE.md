# CLAUDE.md — Site e-commerce Sérénid (projet scolaire fictif)

## 0. Règle absolue

Tu construis **uniquement** un site e-commerce **fictif** pour le projet scolaire « Graine de boîte » (Lycée Blaise Pascal, Châteauroux, Première STMG).
Porteur : Hailley Labonne.
Tout est inventé : produits, avis, stocks, entreprise, paiements.
Aucun produit n’est réellement vendu. Aucune donnée réelle n’est collectée.
Le footer **doit** contenir, de façon discrète mais visible :
« Site fictif réalisé dans le cadre d’un projet scolaire. Aucun produit n’est réellement vendu. »

Si une demande semble sortir de ce cadre, tu restes dans le fictif et tu le rappelles une seule fois.

---

## 1. Identité de la marque

**Nom :** Sérénid
**Produit phare :** Sérénid Nid
**Slogan :** « Protéger sans enfermer »

Sérénid Nid est un système de sécurité domestique pour jeunes enfants qui :
- localise l’enfant dans la maison **sans caméra ni micro** (radar 60 GHz),
- ne verrouille que les zones dangereuses **quand l’enfant s’en approche**,
- laisse l’enfant explorer librement le reste de la maison.

### Composants du système

| Élément | Rôle | Détails obligatoires |
|---|---|---|
| **Le Nid** | Détecte position et mouvement | Radar ondes millimétriques 60 GHz. Traitement 100 % local. Coque blanc coquille, voyant LED abricot. USB-C + batterie de secours. |
| **Les Pastilles** | Verrouillent les zones dangereuses | Serrures adhésives sans perçage (placards, tiroirs, portes, fenêtres). Fail-secure (reste fermé en cas de panne). Ouverture : appli, montre ou clé magnétique. Pile ≈ 2 ans. |
| **Clé Sérénid** | Accès sans téléphone | Clé magnétique pour grands-parents, nounou, invités. |
| **Application** | Pilotage et réassurance | Carte d’atteinte, alertes, rapport hebdomadaire d’exploration, déverrouillage progressif selon l’âge. |
| **Normes** | Confiance | Bluetooth Low Energy, Thread, Matter. Marquage CE, directive RED, RGPD. |

Services : appli gratuite, Diagnostic de la maison (questionnaire), mises à jour, assistance, option **Sérénid+** (3,99 €/mois), reprise des Pastilles.

### Règles de justesse (non négociables)

- Ne jamais écrire « révolutionnaire », « inédit dans le monde », « jamais vu », « zéro accident ».
- Formule autorisée : « À notre connaissance, aucun produit grand public ne combine… »
- Ne jamais promettre une efficacité médicale.
- Une seule fois, sobrement : « Sérénid complète la vigilance des parents, il ne la remplace pas. »
- Avis fictifs autorisés mais **plausibles** : notes 4,3–4,9, quelques 3–4 étoiles avec critique réelle, pas de superlatifs en série.

Ton de marque : doux, rassurant, précis, jamais anxiogène.
On parle de sérénité, de liberté d’explorer, de maison qui reste un nid.
Interdit : photos choquantes, vocabulaire dramatique (« mortel », « danger de mort »).

---

## 2. Charte graphique (stricte)

### Couleurs — variables CSS obligatoires

```css
:root {
  --encre: #1F3A4D;      /* texte, titres, boutons principaux */
  --bleu: #4F7A96;       /* accents, liens, icônes */
  --brume: #C9DBE6;      /* fonds de sections, bordures */
  --abricot: #E8A07A;    /* point de l’enfant, LED, badges — JAMAIS pour du texte */
  --coquille: #F7F5F1;   /* fond principal de page */
}
```

### Typographies

- Titres : Fraunces (SOFT 100) — Google Fonts.
- Texte & UI : Hanken Grotesk — Google Fonts.
- Échelle fluide avec `clamp()`. Aucune autre police.

### Logo

Fichiers dans `assets/logo/` (SVG, PNG, Favicon).
- Utiliser le SVG partout.
- Ne jamais déformer, recolorer ni ajouter d’effet.
- Espace libre autour = 2 × diamètre du point abricot.
- Taille minimale : 120 px.
- Fond clair → logo Encre. Fond sombre → version inversée.
- Symbole : toit protecteur + courbe nid + point abricot (l’enfant). Ce point peut animer le voyant LED du Nid.

---

## 3. Direction artistique

Objectif : site ultra professionnel, vivant, dynamique, niveau Safety 1st / Babymoov / Badabulle pour le contenu, Boku pour l’énergie, mais avec l’identité calme de Sérénid.

À éviter absolument (aspect « fait par IA ») : dégradés violet/bleu génériques, ombres lourdes partout, cartes identiques en grille de 3, emojis comme icônes, titres du type « Révolutionnez… », lorem ipsum, gros textes centrés systématiques, listes de bénéfices en 3 colonnes répétitives.

À viser : hiérarchie typographique forte (Fraunces en grand), beaucoup d’espace blanc, rythme de sections varié (alternance Coquille / Brume / Encre), micro-interactions soignées (150–300 ms), icônes SVG trait fin de même épaisseur, animations au scroll (GSAP 3.12.5 + ScrollTrigger depuis cdnjs, versions figées), hero avec modèle 3D ou pseudo-3D du Nid (three.js r128 ou CSS/SVG) — boîtier blanc coquille, voyant abricot qui « respire » —, section « Comment ça marche » animée (maison en coupe, point abricot qui se déplace, Pastilles qui se verrouillent), respect strict de `prefers-reduced-motion`.

---

## 4. Structure du site

Site statique : `index.html` + `styles.css` + `app.js`. Prêt pour Netlify / Vercel. Navigation SPA légère autorisée.

Pages obligatoires : Accueil (hero 3D + CTA « Voir le kit » → réassurance → Comment ça marche → Présentation du kit → Avantages → Avis → Comparatif → FAQ → Newsletter), Boutique (filtres, tri, badges), Fiche produit (galerie, variantes, quantité, ajout panier, onglets description / caractéristiques / installation / FAQ, avis, produits associés), Diagnostic de la maison, Technologie, Application (maquette téléphone), Notre histoire, FAQ, Livraison & retours, Contact, Mentions légales (fictives + mention projet scolaire).

Panier & commande (100 % simulés) : tiroir latéral, total dynamique, code promo BIENVENUE10, barre « livraison offerte dès X € », tunnel 3 étapes + confirmation, aucun appel réseau réel, panier en localStorage (toujours dans un try/catch).

### Produits (prix provisoires — objet JS `PRODUCTS`)

| Produit | Contenu | Prix |
|---|---|---|
| Kit Découverte | 1 Nid + 4 Pastilles + 1 clé | 189 € |
| Kit Famille | 1 Nid + 10 Pastilles + 2 clés | 329 € |
| Kit Maison (2 étages) | 2 Nids + 16 Pastilles + 3 clés | 549 € |
| Nid supplémentaire | 1 Nid | 99 € |
| Pack de 4 Pastilles | 4 Pastilles | 59 € |
| Clé Sérénid | 1 clé | 15 € |
| Sérénid+ | Abonnement mensuel | 3,99 €/mois |

Offre de lancement visible (bandeau + badge « -15 % » + compte à rebours fictif), sans agressivité.

---

## 5. Technique

HTML5 sémantique, CSS moderne, JavaScript vanilla. Dépendances uniquement cdnjs ou Google Fonts, versions figées. Photos produit en JPEG optimisé dans `assets/img/` (< 200 Ko, version `-s` pour les vignettes) ; ailleurs, images SVG ou illustrations en code. Mobile first, marges ≥ 16 px, aucun défilement horizontal à 360 px. Accessibilité AA (contraste, alt, labels, focus visible, clavier, ARIA panier/onglets). Animations uniquement sur `transform` et `opacity`. SEO de base (title, meta description, Open Graph, `lang="fr"`). Français de France, vouvoiement.

## 6–8. Méthode, définition de « terminé », interdits

Voir la demande initiale : construire par étapes, tester à 360 / 768 / 1440 px, aucune erreur console, aucun débordement mobile, charte respectée à 100 %, aucune affirmation médicale ni superlatif invérifiable, aucun framework, aucun vrai paiement ni vraie collecte de données, toujours dans le cadre « projet scolaire fictif ».
