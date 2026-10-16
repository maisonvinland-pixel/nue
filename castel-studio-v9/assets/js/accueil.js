/* ════════════════════════════════════════════════════════════════════
   Castel Studio — bandeau cookies + panneau de bienvenue
   Aucun cookie de mesure n'est déposé tant que le visiteur n'a pas
   accepté. Le refus est aussi simple que l'acceptation.
   ════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var CLE_COOKIE = "cs_cookies_v2";
  var CLE_ACCUEIL = "cs_accueil_v3";
  var reduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function lire(cle) {
    try { return window.localStorage.getItem(cle); } catch (e) { return null; }
  }
  function ecrire(cle, val) {
    try { window.localStorage.setItem(cle, val); } catch (e) { /* navigation privée */ }
  }

  /* ── 1. Bandeau cookies ───────────────────────────────────────── */
  function bandeauCookies() {
    if (lire(CLE_COOKIE)) return;

    var b = document.createElement("div");
    b.className = "ck";
    b.setAttribute("role", "region");
    b.setAttribute("aria-label", "Gestion des cookies");
    b.innerHTML =
      '<p>Ce site utilise uniquement des cookies de mesure d\'audience, pour savoir ' +
      'quelles pages sont lues. Rien n\'est déposé tant que vous n\'avez pas accepté.</p>' +
      '<div class="ck-b">' +
        '<button type="button" class="ck-ok">Accepter</button>' +
        '<button type="button" class="ck-no">Refuser</button>' +
        '<a href="confidentialite.html">En savoir plus</a>' +
      '</div>';
    document.body.appendChild(b);
    requestAnimationFrame(function () { b.setAttribute("data-vu", "true"); });

    function fermer(choix) {
      ecrire(CLE_COOKIE, choix);
      if (choix === "oui" && window.CastelMesure) window.CastelMesure();
      b.removeAttribute("data-vu");
      setTimeout(function () { b.remove(); accueil(); }, reduit ? 0 : 320);
    }
    b.querySelector(".ck-ok").addEventListener("click", function () { fermer("oui"); });
    b.querySelector(".ck-no").addEventListener("click", function () { fermer("non"); });
  }

  /* ── 2. Panneau de bienvenue ──────────────────────────────────── */
  function accueil() {
    if (lire(CLE_ACCUEIL)) return;
    if (document.querySelector(".ck")) return; // on attend le choix cookies

    setTimeout(function () {
      if (document.querySelector(".bienv")) return;

      var p = document.createElement("aside");
      p.className = "bienv";
      p.setAttribute("role", "complementary");
      p.setAttribute("aria-label", "La Garantie Castel");
      p.innerHTML =
        '<button type="button" class="bienv-x" aria-label="Fermer">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
          'stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
        '</button>' +
        '<span class="bienv-tag">Garantie Castel</span>' +
        '<b>10 avis Google 5 ★ en 30 jours.</b>' +
        '<p>C\'est écrit au contrat du Pack Monopole Local Immobilier : sinon, les 30 jours de suivi ' +
        'suivants sont offerts. Commencez par l\'audit gratuit : six questions, deux minutes.</p>' +
        '<div class="bienv-b">' +
          '<a class="bienv-1" href="audit.html">Mon audit gratuit</a>' +
          '<a class="bienv-2" href="index.html#garantie">Voir la garantie</a>' +
        '</div>';
      document.body.appendChild(p);
      requestAnimationFrame(function () { p.setAttribute("data-vu", "true"); });

      function fermer() {
        ecrire(CLE_ACCUEIL, "vu");
        p.removeAttribute("data-vu");
        setTimeout(function () { p.remove(); }, reduit ? 0 : 320);
      }
      p.querySelector(".bienv-x").addEventListener("click", fermer);
      // Cliquer sur un bouton vaut acceptation : on ne le remontre pas.
      [].slice.call(p.querySelectorAll("a")).forEach(function (a) {
        a.addEventListener("click", function () { ecrire(CLE_ACCUEIL, "vu"); });
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && document.body.contains(p)) fermer();
      });
    }, reduit ? 400 : 2600);
  }

  function demarrer() {
    bandeauCookies();
    accueil();
  }

  document.addEventListener("click", function (e) {
    var lien = e.target.closest && e.target.closest("[data-cookies]");
    if (!lien) return;
    e.preventDefault();
    window.CastelCookies.rouvrir();
  });

  window.CastelCookies = {
    rouvrir: function () {
      try { window.localStorage.removeItem(CLE_COOKIE); } catch (e) {}
      var v = document.querySelector(".ck");
      if (v) v.remove();
      bandeauCookies();
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", demarrer);
  } else {
    demarrer();
  }
})();
