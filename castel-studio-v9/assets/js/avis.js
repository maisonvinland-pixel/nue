/* =============================================================================
   CASTEL STUDIO — les avis
   Lecture des avis publiés dans Supabase et dépôt d'un nouvel avis.

   Tant que supabaseUrl / supabaseCle sont vides dans config.js, la section
   garde les avis écrits en dur et le formulaire renvoie vers WhatsApp.
   La moyenne n'est calculée que sur les avis publiés — jamais gonflée.
   ========================================================================== */
(function () {
  "use strict";

  var CFG = window.CASTEL || {};
  var actif = !!(CFG.supabaseUrl && CFG.supabaseCle);
  var mur = document.querySelector("[data-avis-mur]");
  var moyenneBoite = document.querySelector("[data-avis-moyenne]");
  var form = document.querySelector("[data-avis-form]");
  if (!mur && !form) return;

  /* La section reste masquée tant qu'aucun avis n'est publié — sauf si on
     arrive par le lien direct index.html#avis (celui qu'on envoie aux clients). */
  var section = document.querySelector("[data-avis-section]");
  function montrerSection() { if (section) section.hidden = false; }
  if (location.hash === "#avis") montrerSection();
  window.addEventListener("hashchange", function () { if (location.hash === "#avis") montrerSection(); });

  var ETOILE = '<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">'
             + '<path d="M10 1l2.6 5.6 6 .8-4.4 4.2 1.1 6L10 14.8 4.7 17.6l1.1-6L1.4 7.4l6-.8z"/></svg>';

  function etoiles(n) {
    var out = "";
    for (var k = 1; k <= 5; k++) out += '<span class="' + (k <= n ? "pleine" : "vide") + '">' + ETOILE + "</span>";
    return '<div class="avis-etoiles" aria-label="' + n + ' étoiles sur 5">' + out + "</div>";
  }

  function echapper(s) {
    var d = document.createElement("div");
    d.textContent = s == null ? "" : String(s);
    return d.innerHTML;
  }

  function initiale(nom) {
    return (nom || "?").trim().charAt(0).toUpperCase();
  }

  function carte(a) {
    var ou = [a.metier, a.ville].filter(Boolean).join(" · ");
    return '<article class="avis-carte">'
      + etoiles(a.note)
      + "<blockquote>« " + echapper(a.message) + " »</blockquote>"
      + (a.reponse ? '<p class="avis-reponse"><b>Castel Studio</b>' + echapper(a.reponse) + "</p>" : "")
      + '<div class="avis-qui"><span class="avis-av" aria-hidden="true">' + echapper(initiale(a.nom)) + "</span>"
      + "<div><b>" + echapper(a.nom || "Client") + "</b><span>" + echapper(ou) + "</span></div></div>"
      + "</article>";
  }

  var D = window.CastelDonnees || { actif: false };
  actif = actif && D.actif;

  /* ── Affichage ──────────────────────────────────────────────────────────
     Un seul aller-retour : la fonction avis_publics() renvoie la liste, la
     moyenne et le total déjà calculés par la base. ------------------------ */
  if (actif && mur) {
    D.appeler("avis_publics", { limite: 12 })
      .then(function (d) {
        if (!d || !d.liste || !d.liste.length) return;   // rien de publié : on garde le contenu en dur
        mur.innerHTML = d.liste.map(carte).join("");
        montrerSection();

        if (moyenneBoite && d.moyenne != null) {
          moyenneBoite.innerHTML =
            "<b>" + String(d.moyenne).replace(".", ",") + "</b>"
            + etoiles(Math.round(d.moyenne))
            + "<span>sur " + d.total + (d.total > 1 ? " avis publiés" : " avis publié") + "</span>";
          moyenneBoite.hidden = false;
        }
      })
      .catch(function () { /* Supabase injoignable : les avis en dur restent affichés */ });
  }

  /* ── Dépôt ──────────────────────────────────────────────────────────────── */
  if (!form) return;

  var note = 5;
  var etoilesForm = form.querySelector("[data-note]");
  if (etoilesForm) {
    for (var k = 1; k <= 5; k++) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "note-etoile";
      b.dataset.valeur = k;
      b.setAttribute("aria-label", k + " étoile" + (k > 1 ? "s" : ""));
      b.innerHTML = ETOILE;
      etoilesForm.appendChild(b);
    }
    var majNote = function () {
      [].slice.call(etoilesForm.children).forEach(function (e, idx) {
        e.classList.toggle("on", idx < note);
      });
    };
    etoilesForm.addEventListener("click", function (e) {
      var cible = e.target.closest(".note-etoile");
      if (!cible) return;
      note = parseInt(cible.dataset.valeur, 10);
      majNote();
    });
    majNote();
  }

  var etat = form.querySelector("[data-avis-etat]");
  function message(texte, ok) {
    if (!etat) return;
    etat.textContent = texte;
    etat.className = "avis-etat" + (ok ? " est-ok" : " est-erreur");
    etat.hidden = false;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var d = new FormData(form);
    var avis = {
      nom: (d.get("nom") || "").toString().trim(),
      metier: (d.get("metier") || "").toString().trim(),
      ville: (d.get("ville") || "").toString().trim(),
      note: note,
      message: (d.get("message") || "").toString().trim()
    };
    if (!avis.nom || !avis.message) { message("Il manque votre nom ou votre message.", false); return; }

    if (!actif) {
      // Sans Supabase, on ne fait pas semblant : on bascule sur WhatsApp.
      var txt = "Bonjour Castel Studio ! Je souhaite laisser un avis (" + avis.note + "/5) : " + avis.message;
      window.open("https://wa.me/33623069005?text=" + encodeURIComponent(txt), "_blank", "noopener");
      message("On ouvre WhatsApp pour transmettre votre avis.", true);
      return;
    }

    var bouton = form.querySelector('button[type="submit"]');
    if (bouton) { bouton.disabled = true; bouton.dataset.avant = bouton.textContent; bouton.textContent = "Envoi…"; }

    D.enregistrer("avis", avis)
      .then(function () {
        form.reset();
        note = 5;
        if (etoilesForm) majNote();
        message("Merci ! Votre avis est enregistré. Il apparaîtra après relecture.", true);
      })
      .catch(function () {
        message("L'envoi a échoué. Écrivez-nous sur WhatsApp, on le publiera pour vous.", false);
      })
      .finally(function () {
        if (bouton) { bouton.disabled = false; bouton.textContent = bouton.dataset.avant || "Publier mon avis"; }
      });
  });
})();
