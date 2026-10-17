#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Castel Studio v9 — compilateur du site statique.

Chaque page = un fragment HTML dans pages/ (le contenu de <main>) + une fiche
de métadonnées ci-dessous. Le compilateur pose autour le <head>, la barre
supérieure, la navigation, le pied de page, les scripts et le JSON-LD.

Jetons reconnus dans les fragments :
  {{i:nom}}            pictogramme SVG (voir ICONES)
  {{bloc:nom}}         bloc partagé (voir BLOCS)
  {{faq:cle}}          section FAQ + alimente le JSON-LD FAQPage
  {{WA}} {{TEL}} {{TEL_AFF}} {{EMAIL}} {{SITE}}
  {{id:champ}}         valeur de l'identité légale (identite.json)

Usage : python3 construire.py <dossier_sortie>   (ou sh assembler.sh pour tout le site)
"""
import json, os, re, sys, shutil, html

ICI = os.path.dirname(os.path.abspath(__file__))
SORTIE = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else os.path.join(ICI, "sortie"))

SITE = "https://castelstudio.netlify.app"
WA = "https://wa.me/33623069005"
TEL = "+33623069005"
TEL_AFF = "06 23 06 90 05"
EMAIL = "agency75240@gmail.com"
INSTA = "https://www.instagram.com/castelstudio.fr/"
V = "9"  # version des ressources (cache)

IDENTITE = json.load(open(os.path.join(ICI, "identite.json"), encoding="utf-8"))
ETIQ_ID = {"entrepreneur": "Nom et prénom de l'entrepreneur", "siren": "SIREN",
           "domiciliation": "Adresse de domiciliation", "tva_mention": "Régime de TVA"}
MANQUANTS = set()

# ── Pictogrammes ─────────────────────────────────────────────────────────────
TRAIT = 'fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"'
_P = {
  "coche":    '<path d="M4.5 12.5l5 5 10-11"/>',
  "fleche":   '<path d="M4 12h15M13 6l6 6-6 6"/>',
  "bas":      '<path d="M5 9l7 7 7-7"/>',
  "droite":   '<path d="M9 5l7 7-7 7"/>',
  "epingle":  '<path d="M12 21.5s-7-5.6-7-11a7 7 0 1114 0c0 5.4-7 11-7 11z"/><circle cx="12" cy="10.2" r="2.6"/>',
  "etoile":   '<path d="M12 3.5l2.7 5.6 6.1.8-4.5 4.3 1.1 6.1L12 17.4l-5.4 2.9 1.1-6.1L3.2 9.9l6.1-.8z"/>',
  "jauge":    '<path d="M3.4 17.4a9.4 9.4 0 1117.2 0"/><path d="M12 17.4l4.2-5"/><circle cx="12" cy="17.6" r="1.5" fill="currentColor" stroke="none"/>',
  "document": '<path d="M5.5 3.5h9l5 5v12h-14z"/><path d="M14.5 3.5v5h5"/><path d="M8.5 13h7M8.5 16.5h5"/>',
  "fenetre":  '<rect x="2.6" y="4" width="18.8" height="16" rx="3"/><path d="M2.6 9h18.8"/><path d="M6.5 12.5h7M6.5 16h4.5"/>',
  "loupe":    '<path d="M11 20.4S4.6 14.9 4.6 10a6.4 6.4 0 1112.8 0"/><circle cx="11" cy="9.8" r="2.4"/><circle cx="17.4" cy="16.6" r="3.4"/><path d="M19.9 19.1L22 21.2"/>',
  "bouclier": '<path d="M12 3l7.5 3v5.6c0 4.6-3.2 8.2-7.5 9.4-4.3-1.2-7.5-4.8-7.5-9.4V6z"/><path d="M8.6 12.2l2.4 2.4 4.5-4.8"/>',
  "message":  '<path d="M20.5 12a8.5 8.5 0 01-12.6 7.4L3.5 20.5l1.2-4.2A8.5 8.5 0 1120.5 12z"/><path d="M8.5 11h7M8.5 14h4.5"/>',
  "courbe":   '<path d="M3.5 20.5h17"/><path d="M5 16l4.5-4.5 3.5 3 6.5-7"/><path d="M15 7.5h4.5V12"/>',
  "cle":      '<circle cx="8" cy="15.5" r="4"/><path d="M11 12.5l8.5-8.5M16.5 7l2.5 2.5M14.5 9l2 2"/>',
  "maison":   '<path d="M3.5 11L12 4l8.5 7"/><path d="M5.8 9.5V20h12.4V9.5"/><path d="M10 20v-5.5h4V20"/>',
  "equipe":   '<circle cx="9" cy="8.5" r="3.2"/><path d="M3 19.5c.6-3.3 3-5.2 6-5.2s5.4 1.9 6 5.2"/><circle cx="17" cy="9.5" r="2.4"/><path d="M16.2 14.4c2.6.1 4.3 1.8 4.8 4.6"/>',
  "lecture":  '<circle cx="12" cy="12" r="9"/><path d="M10 8.6l5.4 3.4-5.4 3.4z" fill="currentColor"/>',
  "horloge":  '<circle cx="12" cy="12" r="8.6"/><path d="M12 7.4V12l3.2 2"/>',
  "carte":    '<path d="M3.5 6.5l5.5-2.5 6 2.5 5.5-2.5v13.5l-5.5 2.5-6-2.5-5.5 2.5z"/><path d="M9 4v13.5M15 6.5V20"/>',
  "cadenas":  '<rect x="5" y="10.5" width="14" height="10" rx="2.4"/><path d="M8.2 10.5V8a3.8 3.8 0 017.6 0v2.5"/>',
  "carte-b":  '<rect x="2.8" y="5.5" width="18.4" height="13" rx="2.6"/><path d="M2.8 10h18.4M6.5 15h4"/>',
  "mail":     '<rect x="2.8" y="5" width="18.4" height="14" rx="2.6"/><path d="M3.4 7.4L12 13l8.6-5.6"/>',
  "tel":      '<path d="M6.6 3.5h2.6l1.4 4-2 1.5a12 12 0 006.4 6.4l1.5-2 4 1.4v2.6a2 2 0 01-2.2 2A17 17 0 014.6 5.7a2 2 0 012-2.2z"/>',
  "chateau":  '<path d="M4 20.5V8.5h3v2h2.5v-2h5v2H17v-2h3v12z"/><path d="M10 20.5v-4.5h4v4.5"/>',
  "plus":     '<path d="M12 5v14M5 12h14"/>',
}
_PLEIN = {
  "insta": '<path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2-.1-1.3-.1-1.7-.1-4.9s0-3.6.1-4.9c.1-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4 1.3-.1 1.7-.1 4.9-.1zm0 2c-3.1 0-3.5 0-4.8.1-1.1.1-1.4.2-1.7.3-.4.2-.7.3-1 .6-.3.3-.5.6-.6 1-.1.3-.3.6-.3 1.7-.1 1.3-.1 1.6-.1 4.8s0 3.5.1 4.8c.1 1.1.2 1.4.3 1.7.2.4.3.7.6 1 .3.3.6.5 1 .6.3.1.6.3 1.7.3 1.3.1 1.6.1 4.8.1s3.5 0 4.8-.1c1.1-.1 1.4-.2 1.7-.3.4-.2.7-.3 1-.6.3-.3.5-.6.6-1 .1-.3.3-.6.3-1.7.1-1.3.1-1.6.1-4.8s0-3.5-.1-4.8c-.1-1.1-.2-1.4-.3-1.7-.2-.4-.3-.7-.6-1-.3-.3-.6-.5-1-.6-.3-.1-.6-.3-1.7-.3-1.3-.1-1.6-.1-4.8-.1zm0 3.4a5.4 5.4 0 110 10.8 5.4 5.4 0 010-10.8zm0 8.9a3.5 3.5 0 100-7 3.5 3.5 0 000 7zm6.9-9.1a1.3 1.3 0 11-2.6 0 1.3 1.3 0 012.6 0z"/>',
  "wa": '<path d="M12 2a10 10 0 00-8.6 15L2 22l5.2-1.4A10 10 0 1012 2zm0 1.9a8.1 8.1 0 016.9 12.4l-.2.3.8 2.9-3-.8-.3.2A8.1 8.1 0 1112 3.9zm-3.6 4c-.2 0-.5.1-.7.4-.3.3-.9.9-.9 2.1s.9 2.4 1 2.6c.1.2 1.7 2.7 4.3 3.7 2.1.8 2.6.7 3 .6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3l-1.9-.9c-.3-.1-.5-.2-.7.1l-.7.9c-.1.2-.3.2-.5.1-.3-.1-1.2-.4-2.2-1.4-.8-.7-1.4-1.6-1.5-1.8-.1-.3 0-.4.1-.5l.4-.5c.1-.2.2-.3.3-.5v-.5l-.9-2c-.2-.5-.4-.5-.6-.5z"/>',
}

def icone(nom):
    if nom in _PLEIN:
        return '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' + _PLEIN[nom] + "</svg>"
    return '<svg viewBox="0 0 24 24" ' + TRAIT + ' aria-hidden="true">' + _P[nom] + "</svg>"

def logo(fond="#F7F6F2"):
    return ('<svg viewBox="0 0 120 120" aria-hidden="true"><rect width="120" height="120" rx="30" fill="' + fond + '"/>'
            '<g fill="#1F4A38"><rect x="30" y="24" width="12" height="14" rx="2"/><rect x="54" y="24" width="12" height="14" rx="2"/>'
            '<rect x="78" y="24" width="12" height="14" rx="2"/></g><path d="M88 52 a30 30 0 1 0 0 36" fill="none" stroke="#1F4A38" '
            'stroke-width="13" stroke-linecap="round"/><path d="M92 62 l3.5 8 8 3.5 -8 3.5 -3.5 8 -3.5 -8 -8 -3.5 8 -3.5 z" fill="#B7861E"/></svg>')

FAVICON = ("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'%3E%3Crect width='120' height='120' rx='30' "
           "fill='%23FFFFFF'/%3E%3Cg fill='%231F4A38'%3E%3Crect x='30' y='24' width='12' height='14' rx='2'/%3E%3Crect x='54' y='24' width='12' "
           "height='14' rx='2'/%3E%3Crect x='78' y='24' width='12' height='14' rx='2'/%3E%3C/g%3E%3Cpath d='M88 52 a30 30 0 1 0 0 36' fill='none' "
           "stroke='%231F4A38' stroke-width='13' stroke-linecap='round'/%3E%3Cpath d='M92 62 l3.5 8 8 3.5 -8 3.5 -3.5 8 -3.5 -8 -8 -3.5 8 -3.5 z' "
           "fill='%23B7861E'/%3E%3C/svg%3E")

# ── Chrome commun ────────────────────────────────────────────────────────────
def topbar():
    c = icone("coche")
    return f'''<div class="topbar">
  <div class="topbar-int">
    <div class="topbar-claims">
      <span class="tb-promo"><a href="index.html#garantie">{c} <b>Garantie Castel</b><span class="tb-det"> &mdash; 10 avis Google 5&nbsp;&#9733; en 30&nbsp;jours, sinon le mois suivant est offert</span><span class="tb-court"> &middot; 10 avis en 30&nbsp;j</span></a></span>
      <span>{c} Audit gratuit</span>
      <span>{c} 100&nbsp;% &agrave; distance &middot; France enti&egrave;re</span>
    </div>
    <div class="topbar-liens">
      <a href="{INSTA}" target="_blank" rel="noopener">{icone("insta")} @castelstudio.fr</a>
      <a class="topbar-tel" href="{WA}" target="_blank" rel="noopener">{icone("wa")} {TEL_AFF}</a>
    </div>
  </div>
</div>'''

MEGA = [
  # (href, icone, titre, sous-titre, apercu, pitch, puces, bouton)
  ("services.html", "chateau", "Pack Monopole Local", "990 € HT + 149 €/mois", "ap-pack",
   "Fiche Google reprise, avis collectés après chaque signature, page de capture de mandats. Une seule offre, complète.",
   ["Fiche Google Maps optimisée", "Avis automatisés SMS / WhatsApp", "Landing page hyper-locale", "Suivi de position mensuel"],
   "Voir l'offre"),
  ("index.html#garantie", "bouclier", "La Garantie Castel", "10 avis en 30 jours", "ap-garantie",
   "10 avis Google 5 étoiles authentiques en 30 jours, ou les 30 jours de suivi suivants sont offerts. Écrit au contrat.",
   ["Engagement contractuel", "Avis de vrais clients, jamais achetés", "Compteur partagé avec vous"],
   "Lire la garantie"),
  ("audit.html", "jauge", "Audit gratuit", "6 questions · 2 minutes", "ap-audit",
   "Votre position estimée, vos avis, votre système de collecte. Un score sur 100 et le plan qui en découle.",
   ["Score de visibilité sur 100", "Trois priorités chiffrées", "Réservation ou commande directe"],
   "Lancer l'audit"),
  ("index.html#demo", "lecture", "La démo vidéo", "30 secondes", "ap-demo",
   "Ce que voit un vendeur qui cherche une agence, avant et après le Pack Monopole.",
   ["Le pack local avant / après", "Le parcours d'un avis", "La page qui capte l'estimation"],
   "Voir la démo"),
]

def entete(courant):
    onglets, vues = [], []
    for k, (href, ic, t, st, ap, pitch, puces, btn) in enumerate(MEGA):
        onglets.append(f'<button class="mega-onglet" type="button" role="tab" data-href="{href}" aria-selected="{"true" if k == 0 else "false"}">'
                       f'<i>{icone(ic)}</i><span><b>{t}</b><span>{st}</span></span>{icone("droite")}</button>')
        lis = "".join(f'<li>{icone("coche")}<span>{p}</span></li>' for p in puces)
        vues.append(f'<div class="mega-vue{" on" if k == 0 else ""}" role="tabpanel"><div class="mega-apercu {ap}" aria-hidden="true">{icone(ic)}<span>{st}</span></div>'
                    f'<p class="mega-h">{t}</p><p class="pitch">{pitch}</p><ul class="mega-liste">{lis}</ul>'
                    f'<a class="btn btn-plein" href="{href}">{btn} {icone("fleche")}</a></div>')
    def cur(p):
        return ' aria-current="page"' if p == courant else ""
    return f'''<header class="entete" id="haut">
  <div class="shell">
    <nav class="nav" aria-label="Navigation principale">
      <a class="nav-logo" href="index.html" aria-label="Castel Studio — accueil">
        {logo()}<b>Castel Studio</b>
      </a>

      <ul class="nav-liens">
        <li class="nav-groupe" data-ouvert="false">
          <button class="nav-bascule" type="button" aria-expanded="false">L'offre {icone("bas")}</button>
          <div class="mega" role="presentation">
            <div class="mega-rail" role="tablist" aria-label="L'offre Castel Studio">{"".join(onglets)}<a class="mega-tous" href="services.html#commander">Réserver le Pack Monopole {icone("fleche")}</a></div>
            <div class="mega-vues">{"".join(vues)}</div>
          </div>
        </li>
        <li><a class="nav-lien" href="realisations.html"{cur("realisations")}>Réalisations</a></li>
        <li><a class="nav-lien" href="blog.html"{cur("blog")}>Blog</a></li>
        <li><a class="nav-lien" href="studio.html"{cur("studio")}>Le studio</a></li>
        <li><a class="btn nav-cta nav-audit" href="audit.html">{icone("jauge")} Audit gratuit</a></li>
        <li><a class="btn btn-plein nav-cta" href="services.html#commander">Réserver le Pack</a></li>
      </ul>

      <button class="burger" type="button" aria-expanded="false" aria-controls="tiroir" aria-label="Ouvrir le menu">
        <i aria-hidden="true"></i>
      </button>
    </nav>
  </div>
</header>

<div class="tiroir" id="tiroir" data-ouvert="false">
  <div class="shell">
    <a href="index.html">Accueil</a>
    <a href="services.html">Pack Monopole Local Immobilier &mdash; 990&nbsp;&euro; HT</a>
    <a class="tiroir-sous" href="index.html#garantie">La Garantie Castel</a>
    <a class="tiroir-sous" href="index.html#demo">La d&eacute;mo vid&eacute;o</a>
    <a href="realisations.html">R&eacute;alisations</a>
    <a href="blog.html">Blog</a>
    <a href="studio.html">Le studio</a>
    <a href="contact.html">Contact</a>
    <a class="btn btn-ligne" href="audit.html">Audit gratuit</a>
    <a class="btn btn-plein" href="services.html#commander">R&eacute;server le Pack</a>
  </div>
</div>'''

def pied():
    return f'''<footer class="pied">
  <div class="shell">
    <div class="pied-haut">
      <div class="pied-marque">
        <a href="index.html" class="nav-logo" aria-label="Castel Studio — accueil">
          {logo("#FFFFFF")}<b>Castel Studio</b>
        </a>
        <p>Bâtisseurs de marques royales. Visibilité Google Maps et acquisition de mandats pour les agences immobilières indépendantes et les réseaux de mandataires — France entière, 100&nbsp;% à distance.</p>
        <div class="pied-social">
          <a href="{INSTA}" target="_blank" rel="noopener" aria-label="Instagram">{icone("insta")}</a>
          <a href="{WA}" target="_blank" rel="noopener" aria-label="WhatsApp">{icone("wa")}</a>
          <a href="mailto:{EMAIL}" aria-label="Email">{icone("mail")}</a>
        </div>
      </div>
      <div class="pied-col"><h3 class="pied-t">L'offre</h3><ul>
        <li><a href="services.html">Pack Monopole Local</a></li>
        <li><a href="index.html#garantie">La Garantie Castel</a></li>
        <li><a href="audit.html">Audit gratuit</a></li>
        <li><a href="index.html#demo">La démo vidéo</a></li>
      </ul></div>
      <div class="pied-col"><h3 class="pied-t">Agence</h3><ul>
        <li><a href="realisations.html">Réalisations</a></li>
        <li><a href="blog.html">Blog</a></li>
        <li><a href="studio.html">Le studio</a></li>
        <li><a href="contact.html">Contact</a></li>
      </ul></div>
      <div class="pied-col"><h3 class="pied-t">Nous joindre</h3><ul>
        <li><a href="{WA}" target="_blank" rel="noopener">WhatsApp · {TEL_AFF}</a></li>
        <li><a href="tel:{TEL}">Téléphone · {TEL_AFF}</a></li>
        <li><a href="mailto:{EMAIL}">{EMAIL}</a></li>
        <li><span>Lun.–ven., 9 h – 19 h</span></li>
      </ul></div>
    </div>
    <div class="pied-bas">
      <span>© <span data-annee>2026</span> Castel Studio — agence 100&nbsp;% à distance, France entière</span>
      <nav class="pied-legal" aria-label="Liens légaux">
        <a href="mentions-legales.html">Mentions légales</a>
        <a href="confidentialite.html">Confidentialité</a>
        <a href="cgv.html">CGV</a>
        <a href="#" data-cookies>G&eacute;rer les cookies</a>
      </nav>
    </div>
  </div>
</footer>'''

# ── JSON-LD ──────────────────────────────────────────────────────────────────
ORGA = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": SITE + "/#castelstudio",
  "name": "Castel Studio",
  "slogan": "Bâtisseurs de marques royales",
  "description": "Agence de visibilité Google Maps pour les agences immobilières indépendantes et les réseaux de mandataires : fiche Google Business optimisée, collecte d'avis automatisée après signature et landing pages locales de capture de mandats.",
  "url": SITE + "/",
  "logo": SITE + "/assets/img/og-castel-studio.jpg",
  "image": SITE + "/assets/img/og-castel-studio.jpg",
  "telephone": TEL,
  "email": EMAIL,
  "areaServed": {"@type": "Country", "name": "France"},
  "knowsAbout": ["Google Business Profile", "référencement local immobilier", "avis Google",
                 "acquisition de mandats exclusifs", "landing page d'estimation immobilière"],
  "sameAs": [INSTA],
  "makesOffer": {
    "@type": "Offer",
    "name": "Pack Monopole Local Immobilier",
    "url": SITE + "/services.html",
    "priceCurrency": "EUR",
    "priceSpecification": [
      {"@type": "UnitPriceSpecification", "price": "990", "priceCurrency": "EUR",
       "valueAddedTaxIncluded": False, "description": "Mise en place initiale"},
      {"@type": "UnitPriceSpecification", "price": "149", "priceCurrency": "EUR",
       "valueAddedTaxIncluded": False, "billingDuration": "P1M", "unitCode": "MON",
       "description": "Abonnement mensuel : gestion, avis, suivi de positionnement"}
    ],
    "itemOffered": {"@type": "Service", "name": "Pack Monopole Local Immobilier",
      "description": "Reprise et optimisation de la fiche Google Maps, système automatisé de collecte d'avis après signature (SMS / WhatsApp) et landing page hyper-locale de capture de mandats."}
  }
}

def jsonld(obj):
    return '<script type="application/ld+json">' + json.dumps(obj, ensure_ascii=False, separators=(",", ":")) + "</script>"

# ── Blocs partagés ───────────────────────────────────────────────────────────
def lire(nom):
    return open(os.path.join(ICI, nom), encoding="utf-8").read()

BLOCS = {}
for f in os.listdir(os.path.join(ICI, "blocs")):
    BLOCS[f.rsplit(".", 1)[0]] = lire(os.path.join("blocs", f))

FAQS = json.load(open(os.path.join(ICI, "faq.json"), encoding="utf-8"))

def faq_html(cle):
    items = "".join(
        f'<details class="faq-i"><summary>{html.escape(q)}</summary><div class="faq-r"><p>{r}</p></div></details>'
        for q, r in FAQS[cle])
    return (f'<section class="sect fond-blanc" id="faq">\n  <div class="shell">\n'
            f'    <div class="sect-tete rev"><h2>Les questions que posent les agences.</h2></div>\n'
            f'    <div class="faq rev">{items}</div>\n'
            f'    <p class="pitch mt-m rev">Une question qui n\'est pas là&nbsp;? <a href="contact.html">Écrivez-nous</a> ou appelez le <a href="tel:{TEL}">{TEL_AFF}</a>.</p>\n'
            f'  </div>\n</section>')

def faq_ld(cle):
    return {"@type": "FAQPage", "mainEntity": [
        {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": re.sub("<[^>]+>", "", r)}}
        for q, r in FAQS[cle]]}

def remplacer(txt, faqs_vues):
    def r(m):
        k, v = m.group(1), m.group(2)
        if k == "i": return icone(v)
        if k == "bloc": return remplacer(BLOCS[v], faqs_vues)
        if k == "faq":
            faqs_vues.append(v); return faq_html(v)
        if k == "id":
            val = IDENTITE.get(v, "").strip()
            if not val:
                MANQUANTS.add(v)
                return '<mark class="a-saisir">' + ETIQ_ID[v] + '</mark>'
            return html.escape(val)
        raise KeyError(m.group(0))
    txt = re.sub(r"\{\{(i|bloc|faq|id):([a-z0-9_-]+)\}\}", r, txt)
    for a, b in (("{{WA}}", WA), ("{{TEL}}", TEL), ("{{TEL_AFF}}", TEL_AFF), ("{{EMAIL}}", EMAIL), ("{{SITE}}", SITE), ("{{INSTA}}", INSTA)):
        txt = txt.replace(a, b)
    return txt

# ── Pages ────────────────────────────────────────────────────────────────────
SCRIPTS_BASE = ["config", "donnees", "castel", "assistant", "accueil"]

PAGES = json.load(open(os.path.join(ICI, "pages.json"), encoding="utf-8"))

MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"]
def date_fr(d):
    a, m, j = d.split("-")
    return f"{int(j)} {MOIS[int(m) - 1]} {a}"

ARTICLES = [f for f, m in PAGES.items() if m.get("article")]
ARTICLES.sort(key=lambda f: PAGES[f]["article"]["date"], reverse=True)

def couv(f, lazy=True, photo=True):
    a = PAGES[f]["article"]
    charge = ' loading="lazy"' if lazy else ' loading="eager" fetchpriority="high"'
    if photo and a.get("photo"):
        return (f'<img src="assets/img/photos/{a["photo"]}.webp" alt="" width="512" height="341" decoding="async"' + charge + '>')
    return (f'<img src="assets/img/blog/{a["couv"]}.svg" alt="" width="1200" height="750" decoding="async"' + charge + '>')

def billet(f):
    a = PAGES[f]["article"]
    return (f'<a class="billet" href="{f}"><div class="couv">{couv(f)}</div><div class="billet-corps">'
            f'<div class="meta-billet"><span class="cat">{a["cat"]}</span><span class="sep">·</span><span>{a["minutes"]} min de lecture</span></div>'
            f'<h3>{a["titre"]}</h3><p>{a["chapo"]}</p><span class="lire">Lire l\'article {icone("fleche")}</span></div></a>')

def vedette():
    f = ARTICLES[0]; a = PAGES[f]["article"]
    return (f'<article class="blog-vedette rev"><div class="couv volet rev">{couv(f, False)}</div><div>'
            f'<div class="meta-billet"><span class="cat">À la une</span><span class="sep">·</span><span>{a["cat"]}</span>'
            f'<span class="sep">·</span><span>{a["minutes"]} min</span></div>'
            f'<h2 class="mt-s">{a["titre"]}</h2><p class="lead mt-s">{a["chapo"]}</p>'
            f'<div class="btn-rang mt-m"><a class="btn btn-plein" href="{f}">Lire l\'article {icone("fleche")}</a></div></div></article>')

def gabarit_article(f, meta):
    a = meta["article"]
    corps = lire(os.path.join("articles", f))
    i = ARTICLES.index(f)
    suite = [ARTICLES[(i + k) % len(ARTICLES)] for k in (1, 2, 3)]
    return f'''<section class="page-tete" style="padding-bottom:26px">
  <div class="aplats" aria-hidden="true"><div class="aplat aplat-1"></div><div class="aplat aplat-2"></div></div>
  <div class="shell">
    <div class="art-tete rev vu">
      <nav class="fil" aria-label="Fil d'Ariane"><a href="index.html">Accueil</a><span>/</span><a href="blog.html">Blog</a><span>/</span><em>{a["cat"]}</em></nav>
      <div class="meta-billet"><span class="cat">{a["cat"]}</span>
        <span class="sep">·</span><time datetime="{a["date"]}">{date_fr(a["date"])}</time>
        <span class="sep">·</span><span>{a["minutes"]} min de lecture</span></div>
      <h1>{a["titre"]}</h1>
      <p class="lead">{a["chapo"]}</p>
    </div>
  </div>
</section>

<section class="sect fond-blanc" style="padding-top:10px">
  <div class="shell">
    <figure class="art-couv volet rev" style="max-width:980px;margin:0 auto 46px">{couv(f, False, False)}</figure>
    <div class="article rev">
{corps.strip()}
      <div class="btn-rang mt-m">
        <a class="btn btn-plein" href="audit.html">Auditer ma fiche gratuitement {icone("fleche")}</a>
        <a class="btn btn-ligne" href="services.html">Le Pack Monopole</a>
      </div>
    </div>
  </div>
</section>

<section class="sect fond-ivoire">
  <div class="shell">
    <div class="sect-tete rev"><h2>À lire ensuite.</h2></div>
    <div class="billets mt-m" data-cascade>{"".join(billet(x) for x in suite)}</div>
  </div>
</section>

{{{{bloc:cta}}}}'''

def page(fichier, meta):
    faqs_vues = []
    if meta.get("article"):
        source = gabarit_article(fichier, meta)
    else:
        source = lire(os.path.join("pages", fichier.replace(".html", ".frag.html")))
    source = source.replace("{{vedette}}", vedette() if "{{vedette}}" in source else "")
    source = source.replace("{{billets}}", "".join(billet(x) for x in ARTICLES[1:]) if "{{billets}}" in source else "")
    corps = remplacer(source, faqs_vues)
    titre, desc = meta["titre"], meta["description"]
    url = SITE + "/" + ("" if fichier == "index.html" else fichier)
    robots = meta.get("robots", "index,follow,max-image-preview:large,max-snippet:-1")
    graphe = [ORGA | {"@context": None}] if fichier == "index.html" else []
    if fichier != "index.html" and meta.get("fil"):
        elems = [{"@type": "ListItem", "position": 1, "name": "Accueil", "item": SITE + "/"}]
        for i, (nom, lien) in enumerate(meta["fil"], start=2):
            elems.append({"@type": "ListItem", "position": i, "name": nom, "item": SITE + "/" + lien})
        graphe.append({"@type": "BreadcrumbList", "itemListElement": elems})
    for c in faqs_vues:
        graphe.append(faq_ld(c))
    if meta.get("article"):
        a = meta["article"]
        graphe.append({"@type": "BlogPosting", "headline": a["titre"], "datePublished": a["date"],
                       "dateModified": a["date"], "image": SITE + "/assets/img/blog/" + a["couv"] + ".svg",
                       "author": {"@type": "Organization", "name": "Castel Studio", "url": SITE + "/"},
                       "publisher": {"@id": SITE + "/#castelstudio"}, "mainEntityOfPage": url, "inLanguage": "fr-FR"})
    if fichier == "services.html":
        graphe.append(ORGA["makesOffer"]["itemOffered"] | {"provider": {"@id": SITE + "/#castelstudio"},
                      "areaServed": {"@type": "Country", "name": "France"},
                      "offers": {k: v for k, v in ORGA["makesOffer"].items() if k != "itemOffered"}})
    for g in graphe:
        g.pop("@context", None)
    ld = jsonld({"@context": "https://schema.org", "@graph": graphe}) if graphe else ""

    scripts = SCRIPTS_BASE + meta.get("scripts", [])
    balises = "\n".join(f'<script src="assets/js/{s}.js?v={V}"{"" if s == "config" else " defer"}></script>' for s in scripts)
    og = meta.get("og", "assets/img/og-castel-studio.jpg")
    canon = "" if "noindex" in robots else f'<link rel="canonical" href="{url}">\n'
    return f'''<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<script>document.documentElement.className += " js";</script>
<title>{titre}</title>
<meta name="description" content="{html.escape(desc)}">
{canon}<meta name="robots" content="{robots}">
<meta name="theme-color" content="#F7F6F2">
<meta property="og:type" content="{"article" if meta.get("article") else "website"}">
<meta property="og:locale" content="fr_FR">
<meta property="og:site_name" content="Castel Studio">
<meta property="og:title" content="{html.escape(titre)}">
<meta property="og:description" content="{html.escape(desc)}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{SITE}/{og}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/svg+xml" href="{FAVICON}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap">
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap" rel="stylesheet" media="print" onload="this.media='all'">
<noscript><link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap" rel="stylesheet"></noscript>
<link rel="stylesheet" href="assets/css/castel.css?v={V}">
{ld}
</head>
<body>
<a class="saut" href="#contenu">Aller au contenu</a>

{topbar()}

{entete(meta.get("nav", ""))}

<main id="contenu">
{corps.strip()}
</main>

{pied()}
<nav class="barre-mobile" aria-label="Actions rapides"><a class="btn btn-ligne" href="audit.html">Audit gratuit</a><a class="btn btn-plein" href="services.html#commander">Réserver le Pack</a></nav>
{balises}
</body>
</html>
'''

def main():
    os.makedirs(SORTIE, exist_ok=True)
    for fichier, meta in PAGES.items():
        out = page(fichier, meta)
        if re.search(r"\{\{[^}]*\}\}", out):
            sys.exit("jeton non résolu dans " + fichier + " : " + re.search(r"\{\{[^}]*\}\}", out).group(0))
        open(os.path.join(SORTIE, fichier), "w", encoding="utf-8").write(out)
    # sitemap
    urls = [f for f, m in PAGES.items() if "noindex" not in m.get("robots", "")]
    sm = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for f in urls:
        m = PAGES[f]
        lastmod = m.get("article", {}).get("date", "2026-10-16")
        prio = "1.0" if f == "index.html" else ("0.9" if f in ("services.html", "audit.html") else "0.6")
        sm.append(f"  <url><loc>{SITE}/{'' if f == 'index.html' else f}</loc><lastmod>{lastmod}</lastmod><priority>{prio}</priority></url>")
    sm.append("</urlset>")
    open(os.path.join(SORTIE, "sitemap.xml"), "w", encoding="utf-8").write("\n".join(sm) + "\n")
    print(len(PAGES), "pages écrites dans", SORTIE)
    if MANQUANTS:
        print("ATTENTION — identite.json incomplet :", ", ".join(sorted(MANQUANTS)))

if __name__ == "__main__":
    main()
