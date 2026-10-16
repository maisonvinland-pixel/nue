/* ============================================================================
   CASTEL STUDIO — script v9
   Navigation, révélations, tunnel de commande, comparatif avant/après,
   flyer animé, audit immobilier.
   Aucune dépendance. Le site reste lisible et utilisable sans JavaScript.
   ========================================================================= */
(function () {
  "use strict";

  /* ── Statistiques ─────────────────────────────────────────────────────
     Charge Google Analytics 4 seulement si un identifiant de mesure est
     renseigné dans config.js (CASTEL.gaId, format "G-XXXXXXXXXX") ET si le
     visiteur a accepté les cookies. Sans les deux, aucun script tiers.     */
  var mesureChargee = false;
  window.CastelMesure = function () {
    var id = (window.CASTEL || {}).gaId;
    if (!id || mesureChargee) return;
    mesureChargee = true;
    var s1 = document.createElement("script");
    s1.async = true;
    s1.src = "https://www.googletagmanager.com/gtag/js?id=" + id;
    document.head.appendChild(s1);
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    gtag("js", new Date());
    gtag("config", id, { anonymize_ip: true });
  };
  try { if (localStorage.getItem("cs_cookies_v2") === "oui") window.CastelMesure(); } catch (e) {}

  var reduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── Menu mobile ──────────────────────────────────────────────────────── */
  var burger = document.querySelector(".burger");
  var tiroir = document.getElementById("tiroir");

  function basculerTiroir(etat) {
    if (!burger || !tiroir) return;
    burger.setAttribute("aria-expanded", etat ? "true" : "false");
    tiroir.setAttribute("data-ouvert", etat ? "true" : "false");
    document.body.style.overflow = etat ? "hidden" : "";
  }
  if (burger && tiroir) {
    burger.addEventListener("click", function () {
      basculerTiroir(burger.getAttribute("aria-expanded") !== "true");
    });
    tiroir.addEventListener("click", function (e) {
      if (e.target.closest("a")) basculerTiroir(false);
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") basculerTiroir(false);
  });
  window.addEventListener("resize", function () {
    if (window.innerWidth > 1060) basculerTiroir(false);
  });

  /* ── Méga-menu à prévisualisation ─────────────────────────────────────── */
  document.querySelectorAll(".nav-groupe").forEach(function (groupe) {
    var bascule = groupe.querySelector(".nav-bascule");
    var onglets = [].slice.call(groupe.querySelectorAll(".mega-onglet"));
    var vues = [].slice.call(groupe.querySelectorAll(".mega-vue"));
    var minuteur = null;

    function ouvrir(etat) {
      groupe.setAttribute("data-ouvert", etat ? "true" : "false");
      if (bascule) bascule.setAttribute("aria-expanded", etat ? "true" : "false");
    }

    // Survoler un onglet change l'aperçu : c'est tout l'intérêt du panneau.
    function montrer(i) {
      onglets.forEach(function (o, k) { o.setAttribute("aria-selected", k === i ? "true" : "false"); });
      vues.forEach(function (v, k) { v.classList.toggle("on", k === i); });
    }
    onglets.forEach(function (o, i) {
      o.addEventListener("mouseenter", function () { montrer(i); });
      o.addEventListener("focus", function () { montrer(i); });
      // Au clavier comme au doigt, l'onglet mène à sa page.
      o.addEventListener("click", function () {
        var href = o.getAttribute("data-href");
        if (!href) return;
        if (o.getAttribute("data-externe")) window.open(href, "_blank", "noopener");
        else window.location.href = href;
      });
    });
    montrer(0);

    if (bascule) {
      bascule.addEventListener("click", function () {
        ouvrir(groupe.getAttribute("data-ouvert") !== "true");
      });
    }
    groupe.addEventListener("mouseenter", function () {
      clearTimeout(minuteur);
      ouvrir(true);
    });
    groupe.addEventListener("mouseleave", function () {
      minuteur = setTimeout(function () { ouvrir(false); }, 160);
    });
    groupe.addEventListener("focusout", function (e) {
      if (!groupe.contains(e.relatedTarget)) ouvrir(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") ouvrir(false);
    });
  });

  /* ── En-tête collée ───────────────────────────────────────────────────── */
  var entete = document.querySelector(".entete");
  if (entete) {
    var majEntete = function () {
      entete.classList.toggle("est-collee", window.scrollY > 12);
    };
    majEntete();
    window.addEventListener("scroll", majEntete, { passive: true });
  }

  /* ── Révélations au défilement ────────────────────────────────────────── */
  var aReveler = document.querySelectorAll(".rev, [data-cascade]");
  if (reduit || !("IntersectionObserver" in window)) {
    aReveler.forEach(function (el) { el.classList.add("vu"); });
  } else {
    var vigie = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add("vu");
        vigie.unobserve(en.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    aReveler.forEach(function (el) { vigie.observe(el); });
  }

  /* ── Cascades : on numérote les enfants pour décaler leur arrivée ─────── */
  document.querySelectorAll("[data-cascade]").forEach(function (bloc) {
    [].slice.call(bloc.children).forEach(function (enfant, i) {
      enfant.style.setProperty("--i", Math.min(i, 9));
    });
  });

  // Un titre marqué [data-lignes] voit chacune de ses lignes montée derrière un masque
  document.querySelectorAll("[data-lignes]").forEach(function (titre) {
    var lignes = titre.innerHTML.split(/<br\s*\/?>/i);
    titre.innerHTML = lignes.map(function (l, i) {
      return '<span class="titre-masque" style="--i:' + i + '"><span>' + l + "</span></span>";
    }).join("");
    // Sans ancêtre révélé, les lignes resteraient sous leur masque pour toujours.
    if (!titre.closest(".rev, [data-cascade]")) titre.classList.add("rev");
  });

  /* ── Barre de progression de lecture ──────────────────────────────────── */
  if (!reduit) {
    var barre = document.createElement("div");
    barre.className = "progression";
    document.body.appendChild(barre);
    var majBarre = function () {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      barre.style.transform = "scaleX(" + (h > 0 ? window.scrollY / h : 0) + ")";
    };
    majBarre();
    window.addEventListener("scroll", majBarre, { passive: true });
    window.addEventListener("resize", majBarre);
  }

  /* ── Année courante ───────────────────────────────────────────────────── */
  document.querySelectorAll("[data-annee]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ══════════════════════════════════════════════════════════════════════
     LE TUNNEL DE COMMANDE — les liens de paiement Stripe et de réservation.
     Les adresses vivent dans config.js. Tant qu'elles sont vides, les boutons
     mènent au formulaire de contact avec l'offre pré-cochée : rien n'a l'air
     cassé, et aucune demande ne se perd.
     ══════════════════════════════════════════════════════════════════════ */
  var CFG = window.CASTEL || {};
  var STRIPE = CFG.stripe || {};

  var Paiement = window.CastelPaiement = {
    lien: function (mode) {
      var url = mode === "2x" ? STRIPE.setup2x : STRIPE.setup1x;
      return url || ("contact.html?offre=pack-" + (mode === "2x" ? "2x" : "1x"));
    },
    reservation: function (objet) {
      return CFG.reservation || ("contact.html?objet=" + (objet || "appel"));
    },
    externe: function (url) { return /^https?:/.test(url); }
  };

  function brancherLien(a, url) {
    a.href = url;
    if (Paiement.externe(url)) { a.target = "_blank"; a.rel = "noopener"; }
    else { a.removeAttribute("target"); }
  }

  document.querySelectorAll("[data-commande]").forEach(function (bloc) {
    var payer = bloc.querySelector("[data-payer]");
    var texte = bloc.querySelector("[data-payer-txt]");
    function maj() {
      var choix = bloc.querySelector('input[name="mode-paiement"]:checked');
      var mode = choix ? choix.value : "1x";
      if (payer) brancherLien(payer, Paiement.lien(mode));
      if (texte) texte.innerHTML = mode === "2x"
        ? "Payer 495&nbsp;€&nbsp;HT et réserver"
        : "Payer 990&nbsp;€&nbsp;HT et réserver";
    }
    bloc.addEventListener("change", maj);
    maj();
  });
  document.querySelectorAll("[data-reserver]").forEach(function (a) {
    var objet = (/objet=([a-z]+)/.exec(a.getAttribute("href") || "") || [])[1];
    brancherLien(a, Paiement.reservation(objet));
  });

  /* ══════════════════════════════════════════════════════════════════════
     LE COMPARATIF AVANT / APRÈS — le curseur découvre la carte « après ».
     Un vrai <input type="range"> : clavier, souris et doigt, sans rien coder.
     ══════════════════════════════════════════════════════════════════════ */
  document.querySelectorAll("[data-comparatif]").forEach(function (cmp) {
    var zone = cmp.querySelector(".cmp-zone");
    var curseur = cmp.querySelector(".cmp-curseur");
    if (!zone || !curseur) return;
    function maj() { zone.style.setProperty("--p", curseur.value + "%"); }
    curseur.addEventListener("input", maj);
    maj();
    // Une invitation au geste, une seule fois, quand le comparatif arrive à l'écran.
    if (reduit || !("IntersectionObserver" in window)) return;
    var vu = false;
    new IntersectionObserver(function (e, obs) {
      if (!e[0].isIntersecting || vu) return;
      vu = true; obs.disconnect();
      var t0 = null;
      function pas(t) {
        if (curseur.dataset.touche) return;
        if (t0 === null) t0 = t;
        var x = (t - t0) / 1600;
        if (x >= 1) { curseur.value = 50; maj(); return; }
        curseur.value = 50 + Math.sin(x * Math.PI * 2) * 22;
        maj();
        requestAnimationFrame(pas);
      }
      setTimeout(function () { requestAnimationFrame(pas); }, 500);
    }, { threshold: 0.5 }).observe(cmp);
    ["pointerdown", "keydown", "touchstart"].forEach(function (ev) {
      curseur.addEventListener(ev, function () { curseur.dataset.touche = "1"; }, { passive: true });
    });
  });

  /* ══════════════════════════════════════════════════════════════════════
     LE FLYER ANIMÉ — six scènes en boucle, tout en SVG et CSS.
     ══════════════════════════════════════════════════════════════════════ */
  (function () {
    var hote = document.querySelector("[data-flyer]");
    if (!hote) return;

    var DUREE = 2800;
    var OR = "#D4A64A";

    function svg(inner, vb) {
      return '<svg viewBox="' + (vb || "0 0 120 120") + '" fill="none" xmlns="http://www.w3.org/2000/svg">' + inner + "</svg>";
    }
    function etoile() {
      return '<svg viewBox="0 0 24 24"><path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.3 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z"/></svg>';
    }
    function arc(couleur) {
      return '<circle cx="60" cy="60" r="42" stroke="' + couleur + '" stroke-width="2" stroke-linecap="round"' +
        ' class="trace" style="--l:264" stroke-dasharray="198 66" stroke-dashoffset="264"' +
        ' transform="rotate(52 60 60)" pathLength="264"/>' +
        '<path class="pousse" d="M103 60 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3 z" fill="' + OR + '"/>';
    }

    var SCENES = [
      '<div class="flyer-obj" style="width:34cqw">' + svg(arc("#F7F6F2") +
        '<g class="pousse"><rect x="42" y="16" width="8" height="10" rx="2" fill="#F7F6F2"/>' +
        '<rect x="56" y="16" width="8" height="10" rx="2" fill="#F7F6F2"/>' +
        '<rect x="70" y="16" width="8" height="10" rx="2" fill="#F7F6F2"/></g>') + "</div>" +
      '<span class="flyer-eyebrow">Agences immobilières · France</span>' +
      '<h2 class="flyer-titre">Castel <em>Studio</em></h2>' +
      '<p class="flyer-dit">Bâtisseurs de marques royales.</p>',

      '<span class="flyer-eyebrow">Google Maps</span>' +
      '<h2 class="flyer-titre">En haut<br><em>de la carte.</em></h2>' +
      '<div class="flyer-obj" style="width:58cqw">' + svg(
        '<rect class="pousse" x="4" y="6" width="112" height="22" rx="7" fill="' + OR + '"/>' +
        '<rect class="pousse" x="12" y="13" width="44" height="8" rx="4" fill="#FFFFFF" fill-opacity=".95"/>' +
        '<rect class="pousse" x="4" y="34" width="112" height="22" rx="7" fill="#FFFFFF" fill-opacity=".14"/>' +
        '<rect class="pousse" x="4" y="62" width="112" height="22" rx="7" fill="#FFFFFF" fill-opacity=".09"/>',
        "0 0 120 90") + "</div>" +
      '<p class="flyer-dit">Le vendeur appelle l\'une des trois premières fiches. La vôtre passe devant.</p>',

      '<span class="flyer-eyebrow">Avis post-signature</span>' +
      '<h2 class="flyer-titre">Signé à 15 h.<br><em>Avis à 18 h.</em></h2>' +
      '<span class="flyer-etoiles">' +
        '<span class="pousse">' + etoile() + "</span><span class=\"pousse\">" + etoile() + "</span>" +
        '<span class="pousse">' + etoile() + "</span><span class=\"pousse\">" + etoile() + "</span>" +
        '<span class="pousse">' + etoile() + "</span>" +
      "</span>" +
      '<span class="flyer-puce">SMS · WhatsApp · automatique</span>',

      '<span class="flyer-eyebrow">Landing page locale</span>' +
      '<h2 class="flyer-titre">L\'estimation,<br><em>en trois étapes.</em></h2>' +
      '<div class="flyer-obj" style="width:54cqw">' + svg(
        '<rect x="4" y="8" width="112" height="76" rx="7" fill="#FFFFFF" fill-opacity=".07" stroke="#FFFFFF" stroke-opacity=".2"/>' +
        '<rect class="pousse" x="14" y="20" width="62" height="8" rx="4" fill="#FFFFFF" fill-opacity=".85"/>' +
        '<rect class="pousse" x="14" y="36" width="28" height="9" rx="4.5" fill="#FFFFFF" fill-opacity=".5"/>' +
        '<rect class="pousse" x="46" y="36" width="28" height="9" rx="4.5" fill="#FFFFFF" fill-opacity=".2"/>' +
        '<rect class="pousse" x="78" y="36" width="28" height="9" rx="4.5" fill="#FFFFFF" fill-opacity=".2"/>' +
        '<rect class="pousse" x="14" y="56" width="40" height="12" rx="6" fill="' + OR + '"/>',
        "0 0 120 92") + "</div>" +
      '<p class="flyer-dit">Une page par secteur, qui transforme le clic en rendez-vous vendeur.</p>',

      '<span class="flyer-eyebrow">Garantie Castel</span>' +
      '<h2 class="flyer-titre">10 avis<br><em>en 30 jours.</em></h2>' +
      '<p class="flyer-dit">Ou les 30 jours de suivi suivants sont offerts. Écrit au contrat.</p>' +
      '<span class="flyer-puce">Engagement contractuel</span>',

      '<div class="flyer-obj" style="width:26cqw">' + svg(arc(OR)) + "</div>" +
      '<span class="flyer-eyebrow">Sans engagement</span>' +
      '<h2 class="flyer-titre">Votre audit<br><em class="pousse">gratuit.</em></h2>' +
      '<p class="flyer-dit">Votre score sur 100 et vos trois priorités, en deux minutes.</p>'
    ];

    hote.innerHTML =
      '<div class="flyer-jauge" aria-hidden="true">' + SCENES.map(function () { return "<i></i>"; }).join("") + "</div>" +
      SCENES.map(function (c) { return '<div class="flyer-scene">' + c + "</div>"; }).join("") +
      '<div class="flyer-pied"><b>@castelstudio.fr</b><span>Castel Studio — France entière</span></div>' +
      '<div class="flyer-cadre" aria-hidden="true"></div>';

    var scenes = [].slice.call(hote.querySelectorAll(".flyer-scene"));
    var barres = [].slice.call(hote.querySelectorAll(".flyer-jauge i"));
    var i = -1, minuteur = null, joue = false;

    function suivante() {
      if (scenes[i]) scenes[i].classList.remove("on");
      i = (i + 1) % scenes.length;
      scenes[i].classList.add("on");
      barres.forEach(function (b, k) {
        b.classList.remove("encours");
        b.classList.toggle("faite", k < i);
        if (k === i) {
          b.style.setProperty("--duree", DUREE + "ms");
          void b.offsetWidth;
          b.classList.add("encours");
        }
      });
      minuteur = setTimeout(suivante, DUREE);
    }
    function demarrer() { if (!joue) { joue = true; suivante(); } }
    function arreter() { joue = false; clearTimeout(minuteur); }

    if (reduit) {
      scenes[0].classList.add("on");
      barres[0].classList.add("faite");
      return;
    }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (ent) {
        ent[0].isIntersecting ? demarrer() : arreter();
      }, { threshold: 0.2 }).observe(hote);
    } else {
      demarrer();
    }
  })();

  /* ══════════════════════════════════════════════════════════════════════
     L'AUDIT IMMOBILIER — six étapes, un score sur 100, une proposition.
       1. l'agence et sa ville          (identification, non notée)
       2. la position estimée sur Maps  (40 points)
       3. le nombre d'avis              (28 points)
       4. la collecte automatisée       (32 points)
       5. les mandats visés par mois    (calibre la proposition, non noté)
       6. l'email et le téléphone       (pour envoyer le résultat)
     Le barème est fixe et publié sur la page : deux agences qui répondent la
     même chose obtiennent le même score. Le résultat débouche directement sur
     la réservation d'un appel ou le paiement de la mise en place.
     ══════════════════════════════════════════════════════════════════════ */
  (function () {
    var bloc = document.querySelector("[data-audit]");
    if (!bloc) return;

    var corps = bloc.querySelector("[data-audit-corps]");
    var jauge = bloc.querySelector(".audit-jauge");

    function echapper(s) {
      var d = document.createElement("div");
      d.textContent = s == null ? "" : String(s);
      return d.innerHTML;
    }

    var ETAPES = [
      { type: "agence",
        q: "Votre agence, et la ville où vous cherchez des mandats.",
        aide: "Le point de départ : c'est sur « agence immobilière + cette ville » que votre position se joue." },
      { type: "choix", cle: "position", max: 40,
        q: function (r) { return "Quand on tape « agence immobilière " + (r.ville || "votre ville") + " » sur Google Maps, votre agence sort :"; },
        aide: "Faites le test sur votre téléphone, en navigation privée, depuis votre secteur.",
        fix: "Reprendre la fiche de fond en comble pour entrer dans le pack local : catégorie, services, zone, liens.",
        r: [["Dans les trois premières", 40], ["Entre la 4e et la 10e place", 18],
            ["Plus loin, ou je ne la trouve pas", 4], ["Je ne sais pas", 8],
            ["Mon agence n'a pas de fiche Google", 0]] },
      { type: "choix", cle: "avis", max: 28,
        q: "Combien d'avis Google votre agence affiche-t-elle aujourd'hui ?",
        aide: "Le nombre et la note des avis s'affichent à côté de votre nom, avant tout le reste.",
        fix: "Solliciter vos clients des 24 derniers mois pour rattraper le volume d'avis des agences voisines.",
        r: [["Moins de 10", 0], ["De 10 à 29", 8], ["De 30 à 79", 18], ["80 ou plus", 28]] },
      { type: "choix", cle: "collecte", max: 32,
        q: "Après une signature, comment demandez-vous un avis à votre client ?",
        aide: "C'est le levier le plus sous-utilisé : le bon message, dans les 48 heures.",
        fix: "Brancher un message automatique après chaque signature, par SMS ou WhatsApp, avec le lien direct.",
        r: [["On ne demande pas, ou de vive voix quand on y pense", 0],
            ["On envoie un lien à la main, de temps en temps", 12],
            ["Un message part automatiquement après chaque signature", 32]] },
      { type: "choix", cle: "mandats", max: 0,
        q: "Combien de mandats visez-vous chaque mois ?",
        aide: "Pour calibrer l'objectif d'avis et le nombre de secteurs à couvrir.",
        r: [["1 à 2", 0], ["3 à 5", 0], ["6 à 10", 0], ["Plus de 10, sur plusieurs agences ou mandataires", 0]] },
      { type: "contact",
        q: "Où vous envoyer votre résultat ?",
        aide: "Votre score s'affiche à l'écran tout de suite. On ne vous rappelle que si vous le demandez." }
    ];

    var rep = { agence: "", ville: "", email: "", telephone: "", rappel: false };
    var pts = {}, libelles = {};
    var etape = 0;

    jauge.innerHTML = ETAPES.map(function () { return "<i></i>"; }).join("");
    function majJauge(n) {
      [].slice.call(jauge.children).forEach(function (b, k) { b.classList.toggle("faite", k < n); });
    }

    function pied() {
      return '<div class="audit-pied">' +
        (etape > 0 ? '<button class="audit-retour" type="button" data-retour>← Question précédente</button>' : "<span></span>") +
        '<span class="audit-etape">' + (etape + 1) + " / " + ETAPES.length + "</span></div>";
    }
    function suivant() {
      etape++;
      if (etape < ETAPES.length) poser(); else resultat();
      // Sur téléphone, on ramène la question à l'écran.
      if (window.innerWidth < 900) bloc.scrollIntoView({ block: "start", behavior: reduit ? "auto" : "smooth" });
    }

    function poser() {
      var E = ETAPES[etape];
      var q = typeof E.q === "function" ? E.q(rep) : E.q;
      majJauge(etape);
      var html = '<div class="audit-q on"><p class="q">' + echapper(q) + "</p>" +
                 (E.aide ? '<p class="audit-aide">' + E.aide + "</p>" : "");

      if (E.type === "choix") {
        html += '<div class="audit-choix">' + E.r.map(function (r, k) {
          return '<button type="button" data-k="' + k + '"><i aria-hidden="true"></i>' + echapper(r[0]) + "</button>";
        }).join("") + "</div>";
      } else if (E.type === "agence") {
        html += '<form class="audit-champs" data-saisie novalidate>' +
          '<label class="champ"><span>Nom de l\'agence</span><input name="agence" autocomplete="organization" required value="' + echapper(rep.agence) + '" placeholder="Agence du Centre, ou votre nom de mandataire"></label>' +
          '<label class="champ"><span>Ville ou secteur</span><input name="ville" autocomplete="address-level2" required value="' + echapper(rep.ville) + '" placeholder="Angers, Lyon 6e, Bordeaux Chartrons…"></label>' +
          '<p class="audit-err" data-err hidden></p>' +
          '<button class="btn btn-plein audit-suivant" type="submit">Continuer <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6"/></svg></button></form>';
      } else {
        html += '<form class="audit-champs" data-saisie novalidate>' +
          '<label class="champ"><span>Email professionnel</span><input type="email" name="email" autocomplete="email" required value="' + echapper(rep.email) + '" placeholder="vous@votre-agence.fr"></label>' +
          '<label class="champ"><span>Téléphone</span><input type="tel" name="telephone" autocomplete="tel" inputmode="tel" required value="' + echapper(rep.telephone) + '" placeholder="06 12 34 56 78"></label>' +
          '<label class="audit-case"><input type="checkbox" name="rappel"' + (rep.rappel ? " checked" : "") + '> <span>Je souhaite être rappelé pour vérifier ces chiffres sur ma vraie fiche.</span></label>' +
          '<label class="audit-case"><input type="checkbox" name="accord" required> <span>J\'accepte que Castel Studio utilise ces informations pour m\'envoyer mon résultat. <a href="confidentialite.html">Confidentialité</a>.</span></label>' +
          '<p class="audit-err" data-err hidden></p>' +
          '<button class="btn btn-plein audit-suivant" type="submit">Voir mon score <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6"/></svg></button></form>';
      }
      corps.innerHTML = html + pied() + "</div>";

      corps.querySelectorAll(".audit-choix button").forEach(function (b) {
        b.addEventListener("click", function () {
          var r = E.r[parseInt(b.getAttribute("data-k"), 10)];
          pts[E.cle] = r[1];
          libelles[E.cle] = r[0];
          suivant();
        });
      });

      var form = corps.querySelector("[data-saisie]");
      if (form) {
        var premier = form.querySelector("input");
        if (premier && etape > 0) setTimeout(function () { premier.focus({ preventScroll: true }); }, 60);
        form.addEventListener("submit", function (e) {
          e.preventDefault();
          var err = form.querySelector("[data-err]");
          var d = new FormData(form);
          if (E.type === "agence") {
            rep.agence = (d.get("agence") || "").toString().trim();
            rep.ville = (d.get("ville") || "").toString().trim();
            if (!rep.agence || !rep.ville) { err.hidden = false; err.textContent = "Indiquez le nom de l'agence et la ville."; return; }
          } else {
            rep.email = (d.get("email") || "").toString().trim();
            rep.telephone = (d.get("telephone") || "").toString().trim();
            rep.rappel = !!d.get("rappel");
            var tel = rep.telephone.replace(/[^0-9+]/g, "");
            if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(rep.email)) { err.hidden = false; err.textContent = "Cette adresse email ne semble pas valide."; return; }
            if (!/^(?:\+33|0)[1-9][0-9]{8}$/.test(tel)) { err.hidden = false; err.textContent = "Un numéro à dix chiffres, s'il vous plaît."; return; }
            if (!d.get("accord")) { err.hidden = false; err.textContent = "Cochez la case d'accord pour recevoir votre résultat."; return; }
          }
          suivant();
        });
      }

      var retour = corps.querySelector("[data-retour]");
      if (retour) retour.addEventListener("click", function () { etape--; poser(); });
    }

    function resultat() {
      majJauge(ETAPES.length);
      var score = (pts.position || 0) + (pts.avis || 0) + (pts.collecte || 0);
      var verdict, sous;
      if (score < 35) {
        verdict = "Sur votre secteur, les vendeurs ne vous voient pas.";
        sous = "Les mandats qui vous arrivent viennent de gens qui vous connaissaient déjà. Ceux qui cherchent sur Google partent chez les trois agences du pack local.";
      } else if (score < 60) {
        verdict = "Vous existez sur la carte. Vous n'y gagnez pas encore de mandats.";
        sous = "La fiche est là, mais rien ne la fait monter en continu. C'est le volume et la régularité des avis qui manquent.";
      } else if (score < 80) {
        verdict = "Bonne base : il manque le moteur.";
        sous = "Vous êtes visible. Ce qui reste à gagner tient à l'automatisation des avis et à la page qui capte l'estimation.";
      } else {
        verdict = "Solide. Reste à verrouiller la première place.";
        sous = "Peu d'agences arrivent ici. On travaille alors les secteurs voisins, les quartiers et la conversion de la landing page.";
      }

      var manques = ETAPES.filter(function (E) { return E.type === "choix" && E.max; })
        .map(function (E) { return { fix: E.fix, manque: E.max - (pts[E.cle] || 0) }; })
        .filter(function (m) { return m.manque > 0; })
        .sort(function (a, b) { return b.manque - a.manque; });
      var priorites = manques.map(function (m) { return m.fix; });
      if (priorites.length < 3) priorites.push("Relier le bouton « Site Web » de la fiche à une landing page d'estimation dédiée à " + (rep.ville || "votre secteur") + ".");
      priorites = priorites.slice(0, 3);

      var reseau = /^Plus de 10/.test(libelles.mandats || "");
      var coche = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.9" aria-hidden="true"><path d="M4 10.5l4 4 8-9" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      var cadenas = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="10.5" width="14" height="10" rx="2.4"/><path d="M8.2 10.5V8a3.8 3.8 0 017.6 0v2.5"/></svg>';
      var P = window.CastelPaiement;
      function lienHTML(url, cls, txt) {
        var ext = P.externe(url) ? ' target="_blank" rel="noopener"' : "";
        return '<a class="btn ' + cls + '" href="' + echapper(url) + '"' + ext + ">" + txt + "</a>";
      }

      corps.innerHTML =
        '<div class="audit-q on audit-score">' +
          '<div class="audit-anneau"><svg width="168" height="168" viewBox="0 0 168 168" aria-hidden="true">' +
            '<circle class="piste" cx="84" cy="84" r="72"/>' +
            '<circle class="arc" cx="84" cy="84" r="72" stroke-dasharray="452" stroke-dashoffset="452"/></svg>' +
            "<b>" + score + "<small>sur 100</small></b></div>" +
          '<p class="audit-verdict">' + verdict + "</p>" +
          '<p class="audit-sous">' + echapper(rep.agence) + " · " + echapper(rep.ville) + " — " + sous + "</p>" +
          '<div class="audit-actions"><h4>Vos trois priorités, dans l\'ordre</h4><ul>' +
            priorites.map(function (p) { return "<li>" + coche + "<span>" + echapper(p) + "</span></li>"; }).join("") +
          "</ul></div>" +
          '<p class="audit-objectif"><b>Objectif à 30 jours : 10 avis Google 5&nbsp;★ de plus.</b> C\'est ce que garantit le Pack Monopole par contrat — sinon, les 30 jours de suivi suivants sont offerts.</p>' +
          '<div class="audit-offre">' +
            '<span class="ao-t">La proposition</span>' +
            '<b class="ao-n">Pack Monopole Local Immobilier</b>' +
            '<p class="ao-p"><b>990&nbsp;€&nbsp;HT</b> de mise en place, puis <b>149&nbsp;€&nbsp;HT/mois</b> sans engagement.</p>' +
            '<div class="ao-btns">' +
              lienHTML(P.reservation("appel"), "btn-clair", "Réserver mon appel de 20 min") +
              lienHTML(P.lien("1x"), "btn-or", cadenas + " Payer la mise en place — 990&nbsp;€&nbsp;HT") +
              lienHTML(P.lien("2x"), "btn-fantome", "En deux fois — 2 × 495&nbsp;€&nbsp;HT") +
            "</div>" +
            '<p class="ao-note">' + (reseau
              ? 'Plusieurs agences ou mandataires ? <a href="contact.html?objet=reseau">Demandez un déploiement réseau</a>, chiffré par conseiller.'
              : 'Paiement sécurisé par Stripe. Votre secteur vous est réservé dès la commande. <a href="services.html">Le détail du Pack</a>.') + "</p>" +
          "</div>" +
          '<div class="btn-rang mt-m" style="justify-content:center">' +
            '<a class="btn btn-ligne" href="https://wa.me/33623069005?text=' + encodeURIComponent("Bonjour Castel Studio ! Audit de " + rep.agence + " (" + rep.ville + ") : " + score + "/100. J'aimerais en parler.") + '" target="_blank" rel="noopener">En parler sur WhatsApp</a>' +
            '<button class="btn btn-ligne" type="button" data-refaire>Refaire l\'audit</button>' +
          "</div>" +
        "</div>";

      var arcEl = corps.querySelector(".arc");
      if (arcEl) requestAnimationFrame(function () {
        arcEl.style.strokeDashoffset = String(452 - (452 * score) / 100);
      });

      enregistrer(score, priorites);
      corps.querySelector("[data-refaire]").addEventListener("click", function () {
        pts = {}; libelles = {}; etape = 0; poser();
      });
    }

    /* Un audit rempli, c'est un prospect qualifié : on le garde à trois
       endroits, et l'échec de l'un n'empêche jamais le visiteur de voir son
       score. Netlify Forms envoie la notification par email, Supabase alimente
       la console d'administration, sessionStorage pré-remplit le contact. */
    function enregistrer(score, priorites) {
      var resume = [
        "Agence : " + rep.agence + " (" + rep.ville + ")",
        "Position : " + (libelles.position || "—"),
        "Avis : " + (libelles.avis || "—"),
        "Collecte : " + (libelles.collecte || "—"),
        "Mandats visés : " + (libelles.mandats || "—"),
        "Rappel demandé : " + (rep.rappel ? "oui" : "non")
      ];

      var D = window.CastelDonnees;
      if (D && D.actif) {
        D.enregistrer("audits", {
          score: score,
          reponses: [pts.position || 0, pts.avis || 0, pts.collecte || 0],
          priorites: priorites,
          nom: rep.agence + " · " + rep.ville + " · " + (libelles.mandats || "") + " mandats/mois",
          email: rep.email,
          telephone: rep.telephone
        }).catch(function () {});
        D.enregistrer("demandes", {
          nom: rep.agence,
          entreprise: rep.agence,
          telephone: rep.telephone,
          email: rep.email,
          service: "Audit en ligne — " + score + "/100",
          message: resume.join("\n") + "\n\nPriorités :\n— " + priorites.join("\n— "),
          page: location.pathname
        }).catch(function () {});
      }

      var champs = {
        "form-name": "audit", agence: rep.agence, ville: rep.ville,
        position: libelles.position || "", avis: libelles.avis || "", collecte: libelles.collecte || "",
        mandats: libelles.mandats || "", email: rep.email, telephone: rep.telephone,
        score: String(score), priorites: priorites.join(" | ") + (rep.rappel ? " | RAPPEL DEMANDÉ" : "")
      };
      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: Object.keys(champs).map(function (k) {
          return encodeURIComponent(k) + "=" + encodeURIComponent(champs[k]);
        }).join("&")
      }).catch(function () {});

      try {
        sessionStorage.setItem("castel-audit", JSON.stringify({
          score: score, priorites: priorites, agence: rep.agence, ville: rep.ville,
          email: rep.email, telephone: rep.telephone, mandats: libelles.mandats || ""
        }));
      } catch (e) {}
    }

    poser();
  })();
})();
