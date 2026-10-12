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

Pages : Accueil, Boutique, Fiche produit, Diagnostic de la maison, Technologie, Application,
Notre histoire, FAQ, Livraison & retours, Contact, Mentions légales, Commande (3 étapes), Confirmation.

Code promo de test : `BIENVENUE10` (−10 % sur le matériel). Livraison offerte dès 200 €.

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
