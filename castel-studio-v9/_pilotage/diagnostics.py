#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Castel Studio — générateur de diagnostics personnalisés (prospection).

Une ligne de prospects.csv = une page d/<slug>.html sur le site, avec la vraie
situation de l'agence sur Google Maps face à ses trois premiers concurrents,
ses constats, la garantie et les boutons de commande. Le script écrit aussi
envois.csv : l'email de premier contact et les deux relances, prêts à coller
dans votre outil d'envoi.

Usage (depuis la racine du site) :
    python3 _pilotage/diagnostics.py _pilotage/prospects.csv
    → crée d/*.html et _pilotage/envois.csv
Puis redéployez le site. Ouvrez une page avec ?apercu pour la relire sans
déclencher l'alerte d'ouverture.

Relevé des données : tapez la requête sur Google Maps (navigation privée,
depuis le secteur), notez la position de l'agence, sa note, son nombre d'avis,
la date du dernier avis, et les trois premières fiches. Cinq minutes par agence.

Colonnes facultatives :
  scan   chemin d'une capture de VOTRE scan Local Falcon pour cette agence,
         déposée dans assets/scans/ (ex. assets/scans/agence-angers.webp)
  video  lien YouTube non répertorié ou fichier MP4 de votre explication
"""
import csv, datetime, hashlib, html, json, os, re, sys, unicodedata

ICI = os.path.dirname(os.path.abspath(__file__))
SITE_RACINE = os.path.dirname(ICI)
sys.path.insert(0, os.path.join(SITE_RACINE, "_sources"))   # dans le site livré
sys.path.insert(0, os.path.dirname(ICI))                    # dans le dossier de travail
import construire as C  # noqa: E402  (pictogrammes, blocs, identité)

SIGNATURE = os.environ.get("CASTEL_SIGNATURE", "L'équipe Castel Studio")
VALIDITE_JOURS = 7

def slugifier(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")

def oui(v):
    return (v or "").strip().lower() in ("oui", "o", "yes", "y", "1", "x", "vrai")

def etat(v):
    """True / False si le point a été vérifié, None s'il ne l'a pas été (case vide)."""
    v = (v or "").strip().lower()
    if not v:
        return None
    return v in ("oui", "o", "yes", "y", "1", "x", "vrai")

def entier(v, defaut=0):
    m = re.search(r"\d+", v or "")
    return int(m.group()) if m else defaut

def e(s):
    return html.escape(str(s or ""), quote=True)

def date_fr(d):
    return f"{d.day} {C.MOIS[d.month - 1]} {d.year}"

def page(p, slug, jusqu_au):
    agence, ville = p["agence"].strip(), p["ville"].strip()
    requete = (p.get("requete") or "").strip() or f"agence immobilière {ville.lower()}"
    pos = entier(p.get("position"), 21)
    avis = entier(p.get("avis"))
    conc = []
    for k in (1, 2, 3):
        nom = (p.get(f"c{k}_nom") or "").strip()
        if nom:
            conc.append((nom, (p.get(f"c{k}_note") or "").strip(), entier(p.get(f"c{k}_avis"))))
    leader = max([c[2] for c in conc] or [avis])
    ecart = max(0, leader - avis)
    salut = (p.get("prenom") or "").strip()
    titre_pos = f"{pos}<sup>e</sup>" if pos > 1 else "1<sup>re</sup>"
    if pos > 20:
        titre_pos = "au-delà de la 20<sup>e</sup>"

    lignes = "".join(
        f'<div class="dc-l"><i>{k}</i><div><b>{e(n)}</b><small>{e(note)} ★ · fiche du pack local</small></div><span class="dc-avis"><em>★</em> {a} avis</span></div>'
        for k, (n, note, a) in enumerate(conc, start=1))
    if pos > 3:
        lignes += '<p class="pitch" style="text-align:center;margin:4px 0">· · ·</p>'
    lignes += (f'<div class="dc-l dc-vous"><i>{pos if pos <= 20 else "20+"}</i><div><b>{e(agence)}</b>'
               f'<small>{e(p.get("note"))} ★ · dernier avis {e(p.get("dernier_avis") or "—")}</small></div>'
               f'<span class="dc-avis"><em>★</em> {avis} avis</span></div>')

    constats = [
        (etat(p.get("categorie_ok")), "Catégorie principale",
         "« Agence immobilière » est bien votre catégorie principale.",
         "La catégorie principale n'est pas « Agence immobilière » : c'est le réglage qui pèse le plus sur cette recherche."),
        (etat(p.get("lien_estimation")), "Bouton « Site Web »",
         "Le bouton mène à une page qui parle aux vendeurs.",
         "Le bouton « Site Web » mène à vos annonces, pas à une page d'estimation : le vendeur qui clique ne trouve pas ce qu'il cherche."),
        (etat(p.get("photos_recentes")), "Photos",
         "Des photos récentes rassurent le vendeur.",
         "Pas de photos récentes de l'agence, de l'équipe ou des biens vendus."),
        (etat(p.get("reponses_avis")), "Réponses aux avis",
         "Vous répondez aux avis : c'est lu par les vendeurs.",
         "Les avis restent sans réponse : un vendeur qui compare trois agences lit aussi les réponses."),
    ]
    # Un point non vérifié n'est jamais affiché : on n'affirme que ce qu'on a constaté.
    constats = [c for c in constats if c[0] is not None]
    ck = "".join(
        f'<div class="dk {"dk-ok" if ok else "dk-ko"}"><i>{"✓" if ok else "!"}</i><div><b>{t}</b><span>{bon if ok else mauvais}</span></div></div>'
        for ok, t, bon, mauvais in constats)
    a_corriger = sum(1 for c in constats if not c[0])
    if constats:
        carte3 = f'<div class="de-c"><b>{a_corriger}/{len(constats)}</b><span>réglages de la fiche à corriger, relevés ci-dessous.</span></div>'
    else:
        carte3 = f'<div class="de-c"><b>{leader}</b><span>avis pour la fiche la plus fournie du pack local. C\'est la barre à viser.</span></div>'

    scan = (p.get("scan") or "").strip()
    bloc_scan = ""
    if scan:
        src = scan if re.match(r"https?://", scan) else "/" + scan.lstrip("/")
        bloc_scan = (f'<figure class="photo-cadre mt-m"><img src="{e(src)}" alt="Grille de positionnement de {e(agence)} sur « {e(requete)} »" loading="lazy" decoding="async" style="height:auto">'
                     f'<figcaption>Votre position, point par point, sur « {e(requete)} » : relevé du {date_fr(datetime.date.today())}. '
                     f'Chaque pastille est un point de recherche autour de l\'agence, le chiffre est votre rang.</figcaption></figure>')

    video = (p.get("video") or "").strip()
    bloc_video = ""
    if video:
        yt = re.search(r"(?:youtube\.com/(?:watch\?v=|embed/|shorts/)|youtu\.be/)([\w-]{11})", video)
        if yt:
            src = f"https://www.youtube-nocookie.com/embed/{yt.group(1)}?rel=0"
            bloc_video = f'<div class="diag-video mt-m"><iframe src="{src}" title="Explication vidéo" allowfullscreen></iframe></div>'
        elif re.search(r"\.(mp4|webm)(\?|$)", video):
            bloc_video = f'<div class="diag-video mt-m"><video src="{e(video)}" controls preload="metadata"></video></div>'

    faqs = []
    racine = lambda h: re.sub(r'href="(?!https?:|mailto:|tel:|#|/)', 'href="/', h)
    tarif = racine(C.remplacer(C.BLOCS["tarif"], faqs))
    garantie = racine(C.remplacer(C.BLOCS["garantie"], faqs))
    i = C.icone
    return f'''<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<script>document.documentElement.className += " js";</script>
<title>Diagnostic Google Maps — {e(agence)} ({e(ville)}) · Castel Studio</title>
<meta name="robots" content="noindex,nofollow">
<meta name="description" content="Diagnostic préparé pour {e(agence)} : position sur « {e(requete)} », écart d'avis avec les trois premières agences et plan d'action.">
<link rel="icon" type="image/svg+xml" href="{C.FAVICON}">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/css/castel.css?v={C.V}">
</head>
<body data-diag-slug="{slug}" data-diag-agence="{e(agence)} — {e(ville)}">
<form name="ouverture" data-netlify="true" hidden><input name="agence"><input name="page"><input name="quand"></form>
<header class="diag-tete"><div class="shell">
  <a class="nav-logo" href="/index.html" aria-label="Castel Studio">{C.logo()}<b>Castel Studio</b></a>
  <span class="diag-valid">Diagnostic préparé pour {e(agence)} · valable jusqu'au {date_fr(jusqu_au)}</span>
</div></header>
<main id="contenu">
<section class="page-tete">
  <div class="aplats" aria-hidden="true"><div class="aplat aplat-1"></div><div class="aplat aplat-2"></div></div>
  <div class="shell">
    <div class="page-tete-grille">
      <div class="rev vu">
        <span class="etiq">Relevé du {date_fr(datetime.date.today())} · Google Maps</span>
        <h1>{e(salut) + ", v" if salut else "V"}oici ce que voit un vendeur à {e(ville)}.</h1>
        <p class="lead mt-s">Sur la recherche <b>« {e(requete)} »</b>, {e(agence)} apparaît en <b>{titre_pos} position</b>. Le vendeur compare les trois premières fiches, lit leurs avis, et appelle. Voici l'écart, et comment le combler.</p>
        <div class="btn-rang mt-m"><a class="btn btn-plein" href="#commander">Réserver le secteur de {e(ville)} {i("fleche")}</a><a class="btn btn-ligne" href="{C.WA}?text={e("Bonjour, j'ai lu le diagnostic de " + agence + ".")}" target="_blank" rel="noopener">Répondre par écrit</a></div>
      </div>
      <div class="rev vu rev-d2"><div class="diag-classement">{lignes}</div></div>
    </div>
  </div>
</section>

<section class="sect fond-blanc">
  <div class="shell">
    <div class="sect-tete rev"><h2>L'écart, en trois chiffres.</h2></div>
    <div class="diag-ecart mt-m" data-cascade>
      <div class="de-c"><b>{ecart}</b><span>avis d'écart avec la fiche la mieux notée du pack local.</span></div>
      <div class="de-c"><b>{titre_pos}</b><span>position sur « {e(requete)} ». Seules les trois premières sont vues sans faire défiler.</span></div>
      {carte3}
    </div>
    <div class="diag-constats mt-m" data-cascade>{ck}</div>
    {bloc_scan}
    {bloc_video}
  </div>
</section>

<section class="sect fond-ivoire">
  <div class="shell">
    <div class="sect-tete rev"><span class="etiq">Le plan pour {e(agence)}</span><h2>Quatorze jours pour reprendre la main.</h2></div>
    <div class="etapes mt-m" data-cascade>
      <div class="etape"><span class="etape-num">J7</span><h3>Fiche reconstruite</h3><p>Catégorie, services, zone, photos, lien vers une page d'estimation à {e(ville)}.</p></div>
      <div class="etape"><span class="etape-num">J14</span><h3>Avis en route</h3><p>Vos clients des 24 derniers mois sollicités une fois, puis un message après chaque signature.</p></div>
      <div class="etape"><span class="etape-num">J44</span><h3>Au moins {avis + 10} avis</h3><p>C'est l'objectif garanti : +10 avis 5 ★ en 30 jours après la mise en service, ou le mois suivant offert.</p></div>
    </div>
  </div>
</section>

{garantie}

<section class="sect fond-ivoire">
  <div class="shell">
    <div class="sect-tete rev"><span class="etiq">Commander</span><h2>Le secteur de {e(ville)} est encore disponible.</h2><p class="lead mt-s">Nous n'accompagnons jamais deux agences concurrentes sur la même zone. La première qui réserve le garde.</p></div>
    <div class="mt-m rev">{tarif}</div>
    <p class="pitch mt-m rev">Une question avant de commander&nbsp;? <a href="{C.WA}" target="_blank" rel="noopener">WhatsApp</a> ou <a href="mailto:{C.EMAIL}">{C.EMAIL}</a> — réponse écrite sous 24 h ouvrées. <a href="/services.html">Le détail du Pack</a>.</p>
  </div>
</section>
</main>
<footer class="pied"><div class="shell"><div class="pied-bas">
  <span>© Castel Studio — diagnostic établi à partir des informations publiques de Google Maps à la date du relevé. Les positions varient selon le lieu de recherche.</span>
  <nav class="pied-legal" aria-label="Liens légaux"><a href="/mentions-legales.html">Mentions légales</a><a href="/confidentialite.html">Confidentialité</a><a href="mailto:{C.EMAIL}?subject=STOP%20{e(agence)}">Ne plus être contacté</a></nav>
</div></div></footer>
<script src="/assets/js/config.js?v={C.V}"></script>
<script src="/assets/js/donnees.js?v={C.V}" defer></script>
<script src="/assets/js/castel.js?v={C.V}" defer></script>
</body>
</html>
'''

def enumerer(l):
    l = [str(x) for x in l]
    return " et ".join(l) if len(l) < 3 else ", ".join(l[:-1]) + " et " + l[-1]

def emails(p, lien, jusqu_au):
    agence, ville = p["agence"].strip(), p["ville"].strip()
    requete = (p.get("requete") or "").strip() or f"agence immobilière {ville.lower()}"
    pos = entier(p.get("position"), 21)
    avis = entier(p.get("avis"))
    tops = [entier(p.get(f"c{k}_avis")) for k in (1, 2, 3) if (p.get(f"c{k}_nom") or "").strip()]
    prenom = (p.get("prenom") or "").strip()
    bonjour = f"Bonjour {prenom}," if prenom else "Bonjour,"
    rang = "au-delà de la 20e position" if pos > 20 else (f"en {pos}e position" if pos > 1 else "en 1re position")
    if pos <= 3:
        constat = (f"{agence} est dans les trois premières agences sur « {requete} ». Mais la fiche voisine affiche "
                   f"{max(tops or [avis])} avis quand la vôtre en a {avis} : c'est elle que le vendeur appelle en premier.")
    else:
        constat = (f"Sur Google Maps, en tapant « {requete} », {agence} apparaît {rang}. "
                   f"Les premières fiches affichent {enumerer(tops)} avis ; la vôtre en a {avis}.")
    pied = ("\n\n—\nCastel Studio · Bâtisseurs de marques royales\n"
            "Visibilité Google Maps pour agences immobilières · " + C.SITE + "\n"
            "Vous ne souhaitez plus recevoir de message de ma part ? Répondez simplement « stop ».")
    j0 = (f"{bonjour}\n\n{constat}\n\nJ'ai préparé un diagnostic d'une page pour votre agence, sans inscription ni appel :\n{lien}\n\n"
          f"Vous y verrez l'écart avec vos trois concurrents directs et les réglages qui le réduisent. "
          f"Si le sujet vous intéresse, tout peut se faire par écrit.\n\n{SIGNATURE}" + pied)
    j3 = (f"{bonjour}\n\nJe me permets une relance courte : le diagnostic de {agence} reste en ligne jusqu'au {date_fr(jusqu_au)}.\n{lien}\n\n"
          f"Une seule chose à retenir : chaque mois, les vendeurs de {ville} lisent vos avis avant de choisir à qui confier leur bien.\n\n{SIGNATURE}" + pied)
    j7 = (f"{bonjour}\n\nDernier message de ma part. Je n'accompagne qu'une seule agence par secteur : si celui de {ville} vous intéresse, "
          f"répondez simplement « oui » et je vous envoie la suite par écrit. Sinon, je ne vous relancerai plus.\n\n{SIGNATURE}" + pied)
    objet = f"{agence} : {rang.replace('en ', '')} sur « {requete} »" if pos > 3 else f"{agence} : {max(tops or [avis]) - avis} avis d'écart à {ville}"
    return objet, j0, j3, j7

def main():
    if len(sys.argv) < 2:
        sys.exit("Usage : python3 _pilotage/diagnostics.py _pilotage/prospects.csv")
    source = sys.argv[1]
    sortie = os.path.join(SITE_RACINE, "d")
    os.makedirs(sortie, exist_ok=True)
    jusqu_au = datetime.date.today() + datetime.timedelta(days=VALIDITE_JOURS)
    with open(source, encoding="utf-8-sig", newline="") as f:
        prospects = [r for r in csv.DictReader(f) if (r.get("agence") or "").strip()]
    rangs = []
    for p in prospects:
        empreinte = hashlib.sha1((p["agence"] + p["ville"] + (p.get("email") or "")).encode()).hexdigest()[:6]
        slug = slugifier(p["agence"] + "-" + p["ville"]) + "-" + empreinte
        open(os.path.join(sortie, slug + ".html"), "w", encoding="utf-8").write(page(p, slug, jusqu_au))
        lien = f"{C.SITE}/d/{slug}.html"
        objet, j0, j3, j7 = emails(p, lien, jusqu_au)
        rangs.append({"slug": slug, "email": p.get("email", ""), "agence": p["agence"], "ville": p["ville"], "lien": lien,
                      "objet": objet, "email_j0": j0, "relance_j3": j3, "relance_j7": j7})
    with open(os.path.join(ICI, "envois.csv"), "w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(rangs[0].keys()) if rangs else ["email"])
        w.writeheader(); w.writerows(rangs)
    # La même chose en JSON, pour le cockpit.
    with open(os.path.join(ICI, "envois.json"), "w", encoding="utf-8") as f:
        json.dump(rangs, f, ensure_ascii=False, indent=1)
    print(f"{len(rangs)} diagnostics écrits dans d/ · emails dans _pilotage/envois.csv")

if __name__ == "__main__":
    main()
