/* =============================================================================
   CASTEL STUDIO — le formulaire de contact
   Trois choses, et rien de plus :

   1. Il se pré-remplit. L'offre choisie et les réponses de l'audit arrivent
      déjà saisies — le visiteur n'a pas à tout retaper.
   2. Il corrige au fil de l'eau. L'erreur s'affiche sous le champ concerné,
      au moment où on le quitte, jamais en bloc tout en haut après coup.
   3. Il envoie sans recharger la page, vers Netlify Forms. Si l'envoi échoue
      — hors ligne, formulaire pas encore activé — on le dit franchement et on
      donne le lien WhatsApp, plutôt que d'afficher un faux « merci ».
   ========================================================================== */
(function () {
  "use strict";

  var form = document.querySelector("[data-form-contact]");
  if (!form) return;

  var WA     = "https://wa.me/33623069005";
  var merci  = document.querySelector("[data-form-merci]");
  var bilan  = form.querySelector("[data-form-bilan]");
  var envoi  = form.querySelector("[data-form-envoi]");
  var rappel = form.querySelector("[data-form-rappel]");

  /* ── Les règles de validation ───────────────────────────────────────────
     Le navigateur sait déjà dire « required » ou « type=email ». On ajoute
     seulement ce qu'il ne sait pas : un numéro français, une URL plausible. */
  var REGLES = {
    telephone: function (v) {
      var n = v.replace(/[^0-9+]/g, "");
      return /^(?:\+33|0)[1-9][0-9]{8}$/.test(n);
    },
    email: function (v) { return /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v.trim()); }
  };

  function messageDe(champ) {
    return champ.getAttribute("data-erreur") || "Ce champ est nécessaire pour vous répondre.";
  }

  function valide(champ) {
    var v = (champ.value || "").trim();
    if (champ.type === "checkbox") return champ.checked || !champ.required;
    if (champ.required && !v) return false;
    if (!v) return true;                       // facultatif et vide : rien à vérifier
    var regle = REGLES[champ.name];
    if (regle && !regle(v)) return false;
    if (champ.minLength > 0 && v.length < champ.minLength) return false;
    return true;
  }

  function marquer(champ, ok) {
    var hote = champ.closest(".champ") || champ.closest(".case") || champ.parentNode;
    hote.classList.toggle("en-erreur", !ok);
    var msg = hote.querySelector(".champ-err");
    if (ok) { if (msg) msg.remove(); champ.removeAttribute("aria-invalid"); return; }
    champ.setAttribute("aria-invalid", "true");
    if (!msg) {
      msg = document.createElement("small");
      msg.className = "champ-err";
      hote.appendChild(msg);
    }
    msg.textContent = messageDe(champ);
  }

  var aVerifier = form.querySelectorAll("input[required], textarea[required]");
  aVerifier.forEach(function (champ) {
    champ.addEventListener("blur", function () { marquer(champ, valide(champ)); });
    champ.addEventListener("input", function () {
      // on ne re-fâche pas pendant la frappe : on ne fait que lever l'erreur
      if (champ.closest(".champ, .case").classList.contains("en-erreur") && valide(champ)) marquer(champ, true);
    });
    if (champ.type === "checkbox") {
      champ.addEventListener("change", function () { marquer(champ, valide(champ)); });
    }
  });

  /* ── Le compteur du message ─────────────────────────────────────────────── */
  var texte = form.querySelector("textarea[name=message]");
  var compteur = form.querySelector("[data-compteur]");
  if (texte && compteur) {
    var majCompteur = function () {
      var n = texte.value.trim().length;
      compteur.textContent = n <= 1 ? n + " caractère" : n + " caractères";
      compteur.classList.toggle("ok", n >= 20);
    };
    texte.addEventListener("input", majCompteur);
    majCompteur();
  }

  /* ── Le pré-remplissage : offre, audit, page d'origine ────────────────────
     Le visiteur qui arrive d'un bouton « Payer » ou « Réserver » retrouve son
     objet déjà coché ; celui qui sort de l'audit retrouve ses coordonnées. */
  function parametre(nom) {
    var m = new RegExp("[?&]" + nom + "=([^&]+)").exec(location.search);
    try { return m ? decodeURIComponent(m[1]) : ""; } catch (e) { return ""; }
  }

  function cocherObjet(cle) {
    var r = form.querySelector('input[data-objet="' + cle + '"]');
    if (r) r.checked = true;
  }

  var offre = parametre("offre"), objet = parametre("objet");
  if (offre) {
    cocherObjet("pack");
    if (rappel) {
      rappel.hidden = false;
      rappel.innerHTML = offre === "pack-2x"
        ? "Vous avez choisi le <b>Pack Monopole en deux fois</b> (2 × 495&nbsp;€&nbsp;HT). On vous envoie le lien de paiement sécurisé par retour."
        : "Vous avez choisi le <b>Pack Monopole</b> (990&nbsp;€&nbsp;HT, puis 149&nbsp;€&nbsp;HT/mois). On vous envoie le lien de paiement sécurisé par retour.";
    }
  }
  if (objet) cocherObjet(objet);

  function remplirSiVide(nom, valeur) {
    var c = form.querySelector('[name="' + nom + '"]');
    if (c && !c.value && valeur) c.value = valeur;
  }

  function prerempliserAudit() {
    var champ = form.querySelector("[data-form-audit]");
    try {
      var a = JSON.parse(sessionStorage.getItem("castel-audit") || "null");
      if (!a) return;
      if (champ) champ.value = "Score " + a.score + "/100 — priorités : " + (a.priorites || []).join(" ; ");
      remplirSiVide("entreprise", a.agence);
      remplirSiVide("ville", a.ville);
      remplirSiVide("email", a.email);
      remplirSiVide("telephone", a.telephone);
      var m = form.querySelector('select[name="mandats"]');
      if (m && a.mandats) {
        [].slice.call(m.options).forEach(function (o) { if (a.mandats.indexOf(o.value) === 0 && o.value) m.value = o.value; });
      }
      if (texte && !texte.value) {
        texte.value = "J'ai fait l'audit en ligne : " + a.agence + " est à " + a.score + "/100. ";
        if (compteur) texte.dispatchEvent(new Event("input"));
      }
    } catch (e) {}
  }

  var origine = form.querySelector("[data-form-origine]");
  if (origine) origine.value = document.referrer || location.pathname;

  prerempliserAudit();

  /* ── L'envoi ─────────────────────────────────────────────────────────────
     Deux destinations, une seule promesse au visiteur : la base Supabase pour
     retrouver le prospect dans l'espace d'administration, et l'hébergeur pour
     recevoir le courriel. Il suffit que l'une des deux passe pour que la
     demande soit arrivée quelque part — on ne dit « merci » que dans ce cas. */

  function champs() {
    var d = new FormData(form), o = {};
    d.forEach(function (v, k) {
      if (k === "bot-field") return;
      o[k] = v;
    });
    return o;
  }

  function corps() {
    var d = new FormData(form), p = [];
    d.forEach(function (v, k) {
      if (k === "bot-field") return;
      p.push(encodeURIComponent(k) + "=" + encodeURIComponent(v));
    });
    return p.join("&");
  }

  /* La table « demandes » n'a que sept colonnes. Tout ce que le formulaire
     recueille en plus est replié dans le message, plutôt que perdu. */
  function pourLaBase() {
    var c = champs();
    var extras = [
      ["Secteur", c.ville], ["Profil", c.secteur], ["Mandats visés / mois", c.mandats],
      ["Échéance", c.echeance], ["Rappel par", c.canal], ["Créneau", c.creneau],
      ["Offre", offre], ["Audit", c.audit]
    ].filter(function (l) { return l[1]; })
     .map(function (l) { return l[0] + " : " + l[1]; });

    return {
      nom: (c.nom || "").trim(),
      entreprise: (c.entreprise || "").trim() || null,
      telephone: (c.telephone || "").trim() || null,
      email: (c.email || "").trim(),
      service: c.objet || null,
      message: (c.message || "").trim() + (extras.length ? "\n\n— " + extras.join("\n— ") : ""),
      page: location.pathname
    };
  }

  function reussite() {
    form.hidden = true;
    merci.hidden = false;
    merci.scrollIntoView({ block: "center", behavior: "smooth" });
  }

  function echec(texteErreur) {
    bilan.hidden = false;
    bilan.className = "form-bilan est-erreur";
    bilan.innerHTML = texteErreur + ' <a href="' + WA + '" target="_blank" rel="noopener">Écrire sur WhatsApp</a>.';
    envoi.disabled = false;
    envoi.classList.remove("charge");
    envoi.querySelector("span").textContent = "Envoyer ma demande";
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    bilan.hidden = true;

    // On valide tout, on emmène le visiteur sur le premier champ fautif.
    var premierFautif = null;
    aVerifier.forEach(function (champ) {
      var ok = valide(champ);
      marquer(champ, ok);
      if (!ok && !premierFautif) premierFautif = champ;
    });
    var accord = form.querySelector('input[name="consentement"]');
    if (accord && !accord.checked) { marquer(accord, false); if (!premierFautif) premierFautif = accord; }

    if (premierFautif) {
      bilan.hidden = false;
      bilan.className = "form-bilan est-erreur";
      bilan.textContent = "Il manque encore quelque chose — le champ concerné est signalé ci-dessus.";
      premierFautif.scrollIntoView({ block: "center", behavior: "smooth" });
      setTimeout(function () { premierFautif.focus({ preventScroll: true }); }, 240);
      return;
    }

    envoi.disabled = true;
    envoi.classList.add("charge");
    envoi.querySelector("span").textContent = "Envoi en cours…";

    var D = window.CastelDonnees;
    var versLaBase = (D && D.actif)
      ? D.enregistrer("demandes", pourLaBase()).then(function () { return true; },
                                                      function () { return false; })
      : Promise.resolve(false);

    var versCourriel = fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: corps()
    }).then(function (r) { return r.ok; }, function () { return false; });

    Promise.all([versLaBase, versCourriel]).then(function (r) {
      if (r[0] || r[1]) reussite();
      else echec("L'envoi n'est pas passé. Réessayez dans un instant, ou dites-nous tout directement :");
    });
  });
})();
