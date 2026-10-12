# Sérénid — site e-commerce fictif

Projet scolaire « Graine de boîte » · Première STMG · Lycée Blaise Pascal, Châteauroux.
Porteuse du projet : Hailley Labonne.

> Site fictif réalisé dans le cadre d’un projet scolaire. Aucun produit n’est réellement vendu.
> Panier, commande, newsletter et contact sont simulés : aucune donnée n’est envoyée.

## Contenu

| Fichier | Rôle |
|---|---|
| `index.html` | Toutes les pages (navigation SPA par hash : `#/boutique`, `#/produit/kit-famille`, …) |
| `styles.css` | Charte graphique (variables `--encre`, `--bleu`, `--brume`, `--abricot`, `--coquille`), mise en page, animations CSS |
| `app.js` | Catalogue `PRODUCTS`, panier (localStorage), code promo, tunnel de commande, diagnostic, Nid 3D, animations GSAP |
| `assets/logo/` | Logo SVG (version Encre et inversée), symbole, favicon, PNG |
| `assets/og-image.jpg` | Image de partage (Open Graph) |
| `assets/img/` | Photos produit et d’ambiance en JPEG (< 200 Ko), avec une version `-s` pour les vignettes |
| `tools/compose.html` · `tools/compose.mjs` | Montage local des photos composées (packs, kits avec coffret, Sérénid+) |
| `tools/cutouts/` | Produits détourés servant au montage |

Pages : Accueil, Boutique, Fiche produit, Diagnostic de la maison, Technologie, Application,
Notre histoire, FAQ, Livraison & retours, Contact, Mentions légales, Commande (3 étapes), Confirmation.

Code promo de test : `BIENVENUE10` (−10 % sur le matériel). Livraison offerte dès 200 €.

## Photos produit

Les photos sont fictives : aucune n’est une photo d’un produit réel.

- **Générées par IA** (Creative Claw, modèle Nano Banana 2) : Nid de face et de dos, Pastille coquille,
  Clés coquille et encre, ambiances cuisine et salon. Chaque produit est décrit de façon identique d’une
  image à l’autre, et le packshot du produit sert d’image de référence pour les scènes.
- **Montées en local**, sans génération supplémentaire : Pastille brume (recoloration), packs de 4 Pastilles,
  Kits Découverte / Famille / Maison (coffret encre portant le logo officiel, en finitions coquille et brume)
  et Sérénid+ (capture réelle de l’application `tools/app-screen.png` sur un téléphone).
  Pour les régénérer : servir `serenid/` sur le port 8080, puis `node tools/compose.mjs`.
- **Scènes chambre et entrée** : décors vides générés par IA (GPT Image 2.5 Flare, `tools/backdrops/`),
  dans lesquels le vrai Nid détouré est posé par montage, pour qu’il reste identique aux autres photos.
- **Gros plans** (`detail-*.jpg`) : recadrages des photos haute définition (voyant, USB-C, bouton, gravure).
- **Gamme** (`gamme.jpg`) : montage de tous les produits sur un même fond.
- Aucun texte n’apparaît sur les images, hormis le logo sur le coffret et l’écran de l’application.

`tools/studio.html` et `tools/render.mjs` sont un ancien prototype de rendu 3D : `render.mjs` écrit dans
`assets/img/` avec les mêmes noms de fichiers et écraserait les photos, ne le relancez pas sans le vouloir.

## Dépendances (CDN, versions figées)

- GSAP 3.12.5 + ScrollTrigger — cdnjs
- three.js r128 — cdnjs, chargé uniquement sur l’accueil (repli SVG si WebGL indisponible)
- Fraunces (axe SOFT) et Hanken Grotesk — Google Fonts

Sans ces CDN, le site reste entièrement lisible et fonctionnel (sans animations).
`prefers-reduced-motion` est respecté : animations coupées, Nid 3D figé, maison en coupe statique.

## Lancer en local

```bash
cd serenid
npx http-server -c-1 .   # ou : python3 -m http.server
```

## Déployer

- **Netlify** : nouveau site depuis le dépôt, *Base directory* = `serenid`, pas de commande de build.
- **Vercel** : *Root Directory* = `serenid`, preset « Other », pas de commande de build.
