/* =============================================================================
   CASTEL STUDIO — l'assistant
   Une bulle en bas à droite, un panneau de conversation, la dictée et la
   lecture vocale du navigateur.

   Deux modes, selon config.js :
   · webhookAssistant renseigné → chaque message part au workflow n8n, qui
     répond avec l'IA. C'est le mode « associé ».
   · webhookAssistant vide      → l'assistant répond avec sa propre base. Elle
     couvre une trentaine de sujets, propose le bon lien, et ne cite jamais de
     prix. Rien n'a l'air cassé, et il ne raconte pas n'importe quoi.

   La conversation suit le visiteur de page en page (sessionStorage).
   ========================================================================== */
(function () {
  "use strict";

  var CFG = window.CASTEL || {};
  var WA = "https://wa.me/33623069005";
  var reduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── L'avatar : l'arc du logo, en petit ─────────────────────────────────── */
  var AVATAR =
    '<svg viewBox="0 0 120 120" aria-hidden="true" class="av-mark">' +
    '<rect width="120" height="120" rx="34" fill="#1F4A38"/>' +
    '<g fill="#F7F6F2"><rect x="32" y="26" width="11" height="13" rx="2"/>' +
    '<rect x="54" y="26" width="11" height="13" rx="2"/>' +
    '<rect x="76" y="26" width="11" height="13" rx="2"/></g>' +
    '<path d="M88 54 a28 28 0 1 0 0 34" fill="none" stroke="#F7F6F2" stroke-width="12" stroke-linecap="round"/>' +
    '<path d="M92 63 l3.2 7.4 7.4 3.2 -7.4 3.2 -3.2 7.4 -3.2 -7.4 -7.4 -3.2 7.4 -3.2 z" fill="#B7861E"/></svg>';

  /* ── Normalisation : accents, ponctuation, élisions ─────────────────────── */
  function normaliser(s) {
    return (" " + (s || "") + " ")
      .toLowerCase()
      .normalize("NFD").replace(/[̀-ͯ]/g, "")   // é → e
      .replace(/['’]/g, " ")                          // j'ai → j ai
      .replace(/[^a-z0-9]+/g, " ");
  }

  /* ── La base de connaissances ───────────────────────────────────────────
     cles  : expressions déclenchantes. Une expression de plusieurs mots vaut
             plus qu'un mot seul — c'est ce qui évite les confusions.
     dit   : la réponse. Seuls les prix publics du Pack sont cités.
     lien  : [libellé, adresse] — un bouton sous la réponse.
     suite : les questions proposées ensuite.
     L'ORDRE COMPTE : à score égal c'est la première entrée qui gagne, donc les
     cas particuliers (« mauvais avis ») passent avant les cas larges (« avis »). */
  var SAVOIR = [
    { cles: ["prix", "tarif", "cout", "combien ca coute", "combien coute", "budget", "cher", "facture", "abonnement", "mensuel"],
      dit: "Une seule offre : le Pack Monopole Local Immobilier. 990 € HT de mise en place, en une ou deux fois, "
         + "puis 149 € HT par mois pour la gestion de la fiche, les avis et le suivi de position. "
         + "L'abonnement est sans engagement de durée.",
      lien: ["Voir le Pack Monopole", "services.html"],
      suite: ["Que contient le Pack ?", "C'est quoi la garantie ?"] },

    { cles: ["deux fois", "2 fois", "plusieurs fois", "paiement", "payer", "stripe", "carte bancaire", "commander"],
      dit: "Le paiement se fait en ligne par Stripe : 990 € HT en une fois, ou 495 € HT à la commande et 495 € HT "
         + "à la mise en service. L'abonnement de 149 € HT par mois démarre à la mise en service, pas à la commande.",
      lien: ["Réserver le Pack", "services.html#commander"] },

    { cles: ["garantie", "garanti", "rembourse", "resultat", "10 avis", "dix avis", "promesse"],
      dit: "La Garantie Castel est écrite au contrat : 10 avis Google 5 étoiles authentiques sur votre fiche dans les "
         + "30 jours qui suivent la mise en service. Sinon, les 30 jours de suivi suivants sont offerts. "
         + "On ne promet pas la première place : personne ne contrôle Google.",
      lien: ["Lire la garantie", "index.html#garantie"],
      suite: ["Les avis sont-ils de vrais avis ?", "Que contient le Pack ?"] },

    { cles: ["faux avis", "acheter des avis", "vrais avis", "avis authentique", "legal", "interdit", "autorise", "conforme"],
      dit: "Uniquement de vrais avis, laissés par vos clients après une vraie transaction. Pas d'achat, pas de "
         + "rédaction à leur place, pas de contrepartie, et pas de tri : tous les clients reçoivent le même message. "
         + "C'est la règle de Google et la loi française sur les avis en ligne.",
      lien: ["Comment on collecte les avis", "blog-avis-google-apres-signature.html"] },

    { cles: ["que contient", "contenu du pack", "pack monopole", "pack", "offre", "service", "prestation", "que faites vous", "vous proposez quoi"],
      dit: "Trois pièces : la reprise complète de votre fiche Google Maps, un système qui envoie automatiquement "
         + "une demande d'avis par SMS ou WhatsApp après chaque signature, et une landing page « Estimation offerte "
         + "à [votre ville] » reliée à votre fiche. Puis chaque mois : gestion, réponses aux avis et suivi de position.",
      lien: ["Le détail du Pack", "services.html"],
      suite: ["Combien ça coûte ?", "En combien de temps ?"] },

    { cles: ["mauvais avis", "avis negatif", "une etoile", "1 etoile", "client mecontent", "supprimer un avis", "repondre aux avis"],
      dit: "Un avis négatif ne se supprime pas, sauf s'il enfreint les règles de Google. En revanche, une réponse "
         + "calme et précise rassure souvent plus qu'une série de cinq étoiles sans réponse. Avec l'abonnement, "
         + "chaque avis reçoit une réponse sous 48 heures ouvrées.",
      lien: ["Voir l'abonnement", "services.html"] },

    { cles: ["avis", "sms", "whatsapp", "collecte", "signature", "compromis", "acte", "plus d avis", "obtenir des avis"],
      dit: "Après chaque compromis, acte ou remise de clés, votre client reçoit un message à votre nom avec le lien "
         + "direct vers votre fiche. Une seule relance à J+3. Et dès la mise en service, vos clients des 24 derniers "
         + "mois sont sollicités une fois : c'est ce qui fait décoller le compteur.",
      lien: ["Voir une simulation", "realisations.html#avis-sim"],
      suite: ["C'est quoi la garantie ?", "Dois-je changer de logiciel ?"] },

    { cles: ["logiciel", "crm", "apimo", "hektor", "netty", "integration", "export", "saisie"],
      dit: "Aucun changement de logiciel. Les signatures arrivent par un formulaire de saisie de vingt secondes, "
         + "par un export régulier, ou par une connexion directe quand votre logiciel le permet. On choisit la "
         + "solution la plus simple lors de l'appel de lancement.",
      lien: ["Poser la question", "contact.html"] },

    { cles: ["fiche google", "google business", "gmb", "google maps", "maps", "referencement local", "seo local", "seo", "classement", "premiere place", "remonter"],
      dit: "On reprend la fiche entièrement : catégorie « Agence immobilière », services, zone, horaires, photos, "
         + "liens et cohérence des annuaires. Le bouton « Site Web » mène à votre page d'estimation. Puis on la fait "
         + "vivre chaque mois.",
      lien: ["Les 8 réglages qui comptent", "blog-fiche-google-agence-immobiliere.html"],
      suite: ["Comment marche la collecte d'avis ?", "C'est quoi la landing page ?"] },

    { cles: ["landing", "page d estimation", "estimation", "page locale", "site", "site web", "page web"],
      dit: "Une page dédiée à votre secteur : « Estimation offerte à [votre ville] », votre note Google, vos biens "
         + "vendus, et un formulaire en trois étapes. Chaque demande vous arrive en temps réel par email et SMS. "
         + "Elle est hébergée et maintenue par nos soins.",
      lien: ["Voir des exemples", "realisations.html#landing"] },

    { cles: ["mandataire", "reseau", "iad", "safti", "capifrance", "megagence", "sans vitrine", "sans agence", "conseiller"],
      dit: "Oui, le Pack fonctionne pour un mandataire : fiche en zone desservie, sans adresse affichée, quand votre "
         + "réseau l'autorise, avec une page personnelle par secteur et des avis à votre nom. Pour équiper plusieurs "
         + "conseillers, on chiffre un déploiement réseau.",
      lien: ["Demander un devis réseau", "contact.html?objet=reseau"] },

    { cles: ["delai", "combien de temps", "duree", "rapide", "quand", "en combien", "mise en service"],
      dit: "Quatorze jours ouvrés au plus après réception de l'accès à votre fiche, de vos photos et de l'export de "
         + "vos clients. La garantie se mesure sur les 30 jours qui suivent la mise en service.",
      lien: ["Voir la méthode", "index.html#methode"] },

    { cles: ["engagement", "resilier", "resiliation", "contrat", "arreter", "quitter", "partir"],
      dit: "L'abonnement est sans engagement de durée : il se résilie chaque mois avec 30 jours de préavis. "
         + "La fiche et les avis restent à vous, ils ont toujours été à votre nom.",
      lien: ["Lire les CGV", "cgv.html"] },

    { cles: ["exclusivite", "concurrent", "meme ville", "deux agences", "secteur reserve"],
      dit: "Nous n'accompagnons jamais deux agences concurrentes sur le même secteur. Dès la commande, votre zone "
         + "vous est réservée.",
      lien: ["Réserver mon secteur", "services.html#commander"] },

    { cles: ["audit", "gratuit", "diagnostic", "analyse", "bilan", "score"],
      dit: "L'audit est gratuit : six questions, deux minutes. Votre position estimée, vos avis, votre collecte : "
         + "un score sur 100, vos trois priorités, et la possibilité de réserver un appel ou de commander directement.",
      lien: ["Lancer l'audit", "audit.html"] },

    { cles: ["exemple", "realisation", "portfolio", "reference", "client", "preuve", "avant apres"],
      dit: "La page Réalisations montre le Pack pièce par pièce, sur des simulations : pack local avant/après, fiche, "
         + "grille de position, message d'avis et landing pages. Les résultats de nos clients se montrent en direct, "
         + "sur leurs vraies fiches, pendant l'appel.",
      lien: ["Voir les réalisations", "realisations.html"] },

    { cles: ["adresse", "ville", "ou etes vous", "vous etes ou", "deplac", "rendez vous physique", "region", "distance", "france"],
      dit: "Castel Studio travaille 100 % à distance, avec des agences partout en France. Un appel de lancement de "
         + "vingt minutes, des accès, des validations par écrit : vous ne perdez pas une demi-journée en rendez-vous.",
      lien: ["Prendre rendez-vous", "contact.html?objet=appel"] },

    { cles: ["horaire", "ouvert", "joignable", "disponible"],
      dit: "Du lundi au vendredi, de 9 h à 19 h. En dehors, laissez un message : réponse sous 24 h ouvrées." },

    { cles: ["contact", "rendez vous", "rdv", "appeler", "telephone", "numero", "parler a quelqu un", "joindre", "mail", "email"],
      dit: "Le plus simple : WhatsApp au 06 23 06 90 05, ou le formulaire de contact. Le premier appel dure "
         + "vingt minutes et ne vous engage à rien.",
      lien: ["Écrire sur WhatsApp", WA] },

    { cles: ["qui etes vous", "vous etes qui", "agence", "studio", "equipe", "castel"],
      dit: "Castel Studio — bâtisseurs de marques royales — est une agence spécialisée dans un seul terrain : Google "
         + "Maps pour les agences immobilières indépendantes et les réseaux de mandataires. Un interlocuteur unique, "
         + "100 % à distance.",
      lien: ["Découvrir le studio", "studio.html"] },

    { cles: ["rgpd", "donnees personnelles", "donnees de mes clients", "mentions legales", "cgv", "cnil"],
      dit: "Pour les demandes d'avis, nous agissons comme sous-traitant de vos données, avec un accord de traitement "
         + "dans les CGV. Chaque message permet de refuser les envois suivants, et les données sont supprimées après "
         + "la fin du contrat.",
      lien: ["Lire les CGV", "cgv.html"] },

    { cles: ["blog", "article", "conseil", "apprendre", "guide"],
      dit: "Six articles sur le blog : les réglages de la fiche Google, le bon moment pour demander un avis, le "
         + "parcours d'un vendeur, la page d'estimation, les mandataires, et l'indépendant face aux réseaux.",
      lien: ["Ouvrir le blog", "blog.html"] },

    { cles: ["merci", "super", "parfait", "genial", "top"],
      dit: "Avec plaisir. Pour aller plus loin, l'audit gratuit prend deux minutes et vous donne votre score.",
      lien: ["Lancer l'audit", "audit.html"] },

    { cles: ["bonjour", "salut", "bonsoir", "hello"],
      dit: "Bonjour ! Dites-moi dans quelle ville vous cherchez des mandats et combien d'avis affiche votre fiche : "
         + "je vous dis par où commencer.",
      suite: ["Que contient le Pack ?", "C'est quoi la garantie ?", "Je suis mandataire"] }
  ];

  var SUGGESTIONS = ["Que contient le Pack ?", "C'est quoi la garantie ?",
                     "Combien ça coûte ?", "Je suis mandataire"];

  // Sur certaines pages, l'assistant ouvre sur le bon sujet.
  var ACCUEILS = {
    "services": "Bonjour ! Vous regardez le Pack Monopole. Une question sur le contenu, le paiement en deux fois "
              + "ou la garantie ? Je vous réponds tout de suite.",
    "audit": "Bonjour ! L'audit à côté prend deux minutes. Si vous préférez, posez-moi directement votre question.",
    "realisations": "Bonjour ! Ces simulations suivent notre méthode réelle. Dites-moi votre ville, je vous dis "
                  + "laquelle ressemble le plus à votre situation.",
    "contact": "Bonjour ! Vous pouvez écrire ici plutôt que de remplir le formulaire — je vous oriente tout de suite."
  };
  var ACCUEIL_DEFAUT = "Bonjour ! Je suis l'assistant de Castel Studio. Dites-moi votre ville et combien d'avis "
                     + "affiche votre fiche Google — je vous dirai par où commencer.";

  /* ── Le moteur de réponse hors ligne ────────────────────────────────────── */
  function repondreHorsLigne(question) {
    var q = normaliser(question);
    var meilleur = null, score = 0;

    SAVOIR.forEach(function (entree) {
      var s = 0;
      entree.cles.forEach(function (cle) {
        if (q.indexOf(" " + cle) === -1) return;
        // une expression de plusieurs mots est bien plus discriminante qu'un mot seul
        s += cle.indexOf(" ") === -1 ? 1 : 3 + cle.split(" ").length;
      });
      if (s > score) { score = s; meilleur = entree; }
    });

    if (meilleur) return meilleur;
    return {
      dit: "Je préfère ne pas répondre à côté. Le plus rapide est d'en parler directement — "
         + "ou de lancer l'audit gratuit, qui donne un plan précis en deux minutes.",
      lien: ["Écrire sur WhatsApp", WA],
      suite: ["Que contient le Pack ?", "C'est quoi la garantie ?"]
    };
  }

  /* ── Session : la conversation suit le visiteur de page en page ─────────── */
  var jeton, historique = [];
  try {
    jeton = sessionStorage.getItem("castel-session");
    if (!jeton) {
      jeton = "cs-" + Math.abs(Date.now() ^ (Math.random() * 1e9 | 0)).toString(36);
      sessionStorage.setItem("castel-session", jeton);
    }
    historique = JSON.parse(sessionStorage.getItem("castel-fil") || "[]");
  } catch (e) {
    jeton = "cs-" + Math.abs(Date.now() ^ (Math.random() * 1e9 | 0)).toString(36);
  }
  function memoriser() {
    try { sessionStorage.setItem("castel-fil", JSON.stringify(historique.slice(-24))); } catch (e) {}
  }

  /* ── Construction du panneau ────────────────────────────────────────────── */
  var hote = document.createElement("div");
  hote.className = "assistant";
  hote.innerHTML =
    '<button class="assistant-bulle" type="button" aria-expanded="false" aria-controls="assistant-panneau"'
    + ' aria-label="Ouvrir l\'assistant Castel Studio">'
    + '<span class="ab-ouvre">' + AVATAR + "</span>"
    + '<svg class="ab-ferme" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"'
    + ' stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>'
    + '<i class="assistant-pastille" aria-hidden="true"></i>'
    + "</button>"
    + '<section class="assistant-panneau" id="assistant-panneau" hidden aria-label="Assistant Castel Studio">'
    + '  <header class="assistant-tete">'
    + '    <span class="assistant-av">' + AVATAR + "</span>"
    + '    <div><b>L\'assistant Castel Studio</b><span data-etat>Répond tout de suite</span></div>'
    + '    <button class="assistant-x" type="button" aria-label="Fermer">'
    + '      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">'
    + '      <path d="M6 6l12 12M18 6L6 18"/></svg></button>'
    + "  </header>"
    + '  <div class="assistant-fil" data-fil role="log" aria-live="polite"></div>'
    + '  <div class="assistant-suggestions" data-suggestions></div>'
    + '  <form class="assistant-saisie" data-form>'
    + '    <button class="assistant-micro" type="button" data-micro hidden aria-label="Dicter le message">'
    + '      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">'
    + '      <rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3"/>'
    + "      </svg></button>"
    + '    <input type="text" data-champ placeholder="Écrivez votre question…" autocomplete="off"'
    + '           aria-label="Votre message">'
    + '    <button class="assistant-envoi" type="submit" aria-label="Envoyer">'
    + '      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"'
    + '           stroke-linejoin="round"><path d="M4 12h15M13 6l6 6-6 6"/></svg></button>'
    + "  </form>"
    + '  <p class="assistant-pied">Réponses automatiques. Pour un engagement ferme, '
    + '     <a href="' + WA + '" target="_blank" rel="noopener">écrivez-nous</a>.</p>'
    + "</section>";
  document.body.appendChild(hote);

  var bulle = hote.querySelector(".assistant-bulle");
  var panneau = hote.querySelector(".assistant-panneau");
  var fil = hote.querySelector("[data-fil]");
  var form = hote.querySelector("[data-form]");
  var champ = hote.querySelector("[data-champ]");
  var boiteSug = hote.querySelector("[data-suggestions]");
  var etat = hote.querySelector("[data-etat]");
  var micro = hote.querySelector("[data-micro]");
  var pastille = hote.querySelector(".assistant-pastille");

  function accueil() {
    var page = (location.pathname.split("/").pop() || "index").replace(".html", "");
    return ACCUEILS[page] || ACCUEIL_DEFAUT;
  }

  function ouvrir(oui) {
    panneau.hidden = !oui;
    hote.classList.toggle("est-ouvert", oui);
    bulle.setAttribute("aria-expanded", oui ? "true" : "false");
    if (!oui) return;
    pastille.hidden = true;
    if (!fil.children.length) {
      if (historique.length) {
        historique.forEach(function (m) { dire(m.role === "user" ? "vous" : "assistant", m.content); });
      } else {
        dire("assistant", accueil());
      }
      poserSuggestions(SUGGESTIONS);
    }
    setTimeout(function () { champ.focus(); }, 120);
  }
  bulle.addEventListener("click", function () { ouvrir(panneau.hidden); });
  hote.querySelector(".assistant-x").addEventListener("click", function () { ouvrir(false); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !panneau.hidden) ouvrir(false);
  });

  function dire(qui, texte, lien) {
    var ligne = document.createElement("div");
    ligne.className = "msg msg-" + qui;
    if (qui === "assistant") {
      ligne.innerHTML = '<span class="msg-av" aria-hidden="true">' + AVATAR
                      + '</span><span class="msg-corps"></span>';
      var corps = ligne.querySelector(".msg-corps");
      corps.textContent = texte;
      if (lien) {
        var a = document.createElement("a");
        a.className = "msg-action";
        a.href = lien[1];
        a.textContent = lien[0];
        if (/^https?:/.test(lien[1])) { a.target = "_blank"; a.rel = "noopener"; }
        corps.appendChild(a);
      }
    } else {
      ligne.textContent = texte;
    }
    fil.appendChild(ligne);
    fil.scrollTop = fil.scrollHeight;
    return ligne;
  }

  function poserSuggestions(liste) {
    boiteSug.innerHTML = "";
    (liste || SUGGESTIONS).slice(0, 4).forEach(function (s) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = s;
      b.addEventListener("click", function () { envoyer(s); });
      boiteSug.appendChild(b);
    });
  }

  function attente() {
    var l = document.createElement("div");
    l.className = "msg msg-assistant msg-attente";
    l.innerHTML = "<i></i><i></i><i></i>";
    fil.appendChild(l);
    fil.scrollTop = fil.scrollHeight;
    return l;
  }

  /* ── La voix : dictée et lecture, par le navigateur ──────────────────────── */
  var Reco = window.SpeechRecognition || window.webkitSpeechRecognition;
  var ecoute = null, litToutHaut = false;

  if (CFG.voix !== false && Reco) {
    micro.hidden = false;
    micro.addEventListener("click", function () {
      if (ecoute) { ecoute.stop(); return; }
      ecoute = new Reco();
      ecoute.lang = "fr-FR";
      ecoute.interimResults = false;
      ecoute.onstart = function () { micro.classList.add("ecoute"); etat.textContent = "Je vous écoute…"; };
      ecoute.onerror = function () { micro.classList.remove("ecoute"); etat.textContent = "Micro indisponible"; };
      ecoute.onend = function () {
        micro.classList.remove("ecoute");
        etat.textContent = "Répond tout de suite";
        ecoute = null;
      };
      ecoute.onresult = function (e) {
        var dit = e.results[0][0].transcript;
        champ.value = dit;
        litToutHaut = true;   // question posée à la voix → réponse lue à voix haute
        envoyer(dit);
      };
      ecoute.start();
    });
  }

  function lire(texte) {
    if (!litToutHaut || CFG.voix === false || !window.speechSynthesis) return;
    litToutHaut = false;
    try {
      window.speechSynthesis.cancel();
      var v = new SpeechSynthesisUtterance(texte);
      v.lang = "fr-FR";
      v.rate = 1.02;
      window.speechSynthesis.speak(v);
    } catch (e) { /* la voix est un bonus, jamais un blocage */ }
  }

  /* ── L'envoi ────────────────────────────────────────────────────────────── */
  function envoyer(texte) {
    texte = (texte || "").trim();
    if (!texte) return;
    champ.value = "";
    boiteSug.innerHTML = "";
    dire("vous", texte);
    historique.push({ role: "user", content: texte });
    memoriser();

    var patiente = attente();

    function afficher(reponse, lien, suite) {
      patiente.remove();
      dire("assistant", reponse, lien);
      historique.push({ role: "assistant", content: reponse });
      memoriser();
      poserSuggestions(suite);
      lire(reponse);
    }

    if (!CFG.webhookAssistant) {
      var r = repondreHorsLigne(texte);
      setTimeout(function () { afficher(r.dit, r.lien, r.suite); }, reduit ? 0 : 380);
      return;
    }

    var fini = false;
    var secours = setTimeout(function () {
      if (fini) return;
      fini = true;
      var r = repondreHorsLigne(texte);   // le webhook traîne : on ne laisse pas le visiteur en plan
      afficher(r.dit, r.lien, r.suite);
    }, 12000);

    fetch(CFG.webhookAssistant, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: texte,
        session: jeton,
        page: location.pathname,
        historique: historique.slice(-10)
      })
    })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
      .then(function (d) {
        if (fini) return;
        fini = true; clearTimeout(secours);
        var rep = d && (d.reponse || d.output || d.text || d.message);
        if (rep) { afficher(rep, null, SUGGESTIONS); }
        else { var f = repondreHorsLigne(texte); afficher(f.dit, f.lien, f.suite); }
      })
      .catch(function () {
        if (fini) return;
        fini = true; clearTimeout(secours);
        var f = repondreHorsLigne(texte);
        afficher(f.dit, f.lien, f.suite);
      });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    envoyer(champ.value);
  });

  // La pastille attire l'œil une fois, si la conversation n'a pas commencé
  if (historique.length) {
    pastille.hidden = true;
  } else if (!reduit) {
    setTimeout(function () {
      if (panneau.hidden) hote.classList.add("appelle");
      setTimeout(function () { hote.classList.remove("appelle"); }, 2600);
    }, 6000);
  }
})();
