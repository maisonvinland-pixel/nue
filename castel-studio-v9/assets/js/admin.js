/* =============================================================================
   CASTEL STUDIO — la console de modération
   Publier un avis, y répondre, suivre les demandes et les audits, sans ouvrir
   Supabase.

   La connexion se fait avec un vrai compte (adresse + mot de passe), pas avec
   la clé secrète du projet : une clé collée dans une page web finit toujours
   par fuiter. Le navigateur ne détient qu'un jeton de session, révocable
   depuis Supabase, et lié à la seule adresse de l'agence.
   ========================================================================== */
(function () {
  "use strict";

  var CFG = window.CASTEL || {};
  var BASE = (CFG.supabaseUrl || "").replace(/\/+$/, "");

  var connexion = document.querySelector("[data-connexion]");
  var console_ = document.querySelector("[data-console]");
  var liste = document.querySelector("[data-liste]");
  var etat = document.querySelector("[data-etat]");
  var etatCle = document.querySelector("[data-etat-cle]");
  var quitter = document.querySelector("[data-quitter]");
  var vueActive = "avis";
  var jeton = "";                       // jeton de session, jamais la clé du projet
  var CLE_PUB = CFG.supabaseCle || "";

  document.querySelector("[data-projet]").textContent =
    BASE ? BASE.replace("https://", "").replace(".supabase.co", "") : "aucun projet configuré";

  function dire(boite, texte, ok) {
    boite.textContent = texte;
    boite.className = "cs-etat " + (ok ? "ok" : "ko");
    boite.hidden = false;
    if (ok) setTimeout(function () { boite.hidden = true; }, 4000);
  }

  function api(chemin, options) {
    options = options || {};
    options.headers = Object.assign({
      apikey: CLE_PUB,
      Authorization: "Bearer " + jeton,
      "Content-Type": "application/json"
    }, options.headers || {});
    return fetch(BASE + "/rest/v1/" + chemin, options).then(function (r) {
      if (!r.ok) return r.text().then(function (t) { throw new Error(t || ("erreur " + r.status)); });
      return r.status === 204 ? null : r.json();
    });
  }

  function echapper(s) {
    var d = document.createElement("div");
    d.textContent = s == null ? "" : String(s);
    return d.innerHTML;
  }

  function quand(iso) {
    try {
      return new Date(iso).toLocaleString("fr-FR",
        { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch (e) { return iso; }
  }

  /* ── Connexion ──────────────────────────────────────────────────────────── */
  function entrer(nouveauJeton, retenir) {
    jeton = nouveauJeton;
    // On vérifie que ce compte a bien les droits : sans la bonne adresse, les
    // règles de la base renvoient une liste vide même en étant connecté.
    api("demandes?select=id&limit=1")
      .then(function () {
        try {
          (retenir ? localStorage : sessionStorage).setItem("castel-jeton", nouveauJeton);
        } catch (e) {}
        connexion.hidden = true;
        console_.hidden = false;
        quitter.hidden = false;
        charger();
      })
      .catch(function () {
        jeton = "";
        try { sessionStorage.removeItem("castel-jeton"); localStorage.removeItem("castel-jeton"); } catch (e) {}
        dire(etatCle, "Ce compte n'a pas accès à la console. Vérifiez que l'adresse est "
                    + "bien celle déclarée dans la base.", false);
      });
  }

  document.querySelector("[data-form-cle]").addEventListener("submit", function (e) {
    e.preventDefault();
    if (!BASE) { dire(etatCle, "Aucun projet Supabase n'est configuré dans config.js.", false); return; }

    var email = document.querySelector("[data-email]").value.trim();
    var motdepasse = document.querySelector("[data-motdepasse]").value;
    var retenir = document.querySelector("[data-retenir]").checked;
    var bouton = e.target.querySelector('button[type="submit"]');
    bouton.disabled = true;

    fetch(BASE + "/auth/v1/token?grant_type=password", {
      method: "POST",
      headers: { apikey: CLE_PUB, "Content-Type": "application/json" },
      body: JSON.stringify({ email: email, password: motdepasse })
    })
      .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
      .then(function (r) {
        bouton.disabled = false;
        if (!r.ok || !r.d.access_token) {
          dire(etatCle, r.d.error_description || r.d.msg
               || "Adresse ou mot de passe incorrect.", false);
          return;
        }
        document.querySelector("[data-motdepasse]").value = "";
        entrer(r.d.access_token, retenir);
      })
      .catch(function () {
        bouton.disabled = false;
        dire(etatCle, "Connexion impossible. Vérifiez votre réseau.", false);
      });
  });

  quitter.addEventListener("click", function () {
    try { sessionStorage.removeItem("castel-jeton"); localStorage.removeItem("castel-jeton"); } catch (e) {}
    location.reload();
  });

  /* ── Rendu ──────────────────────────────────────────────────────────────── */
  function carteAvis(a) {
    return '<article class="cs-carte" data-id="' + a.id + '">'
      + "<header><b>" + echapper(a.nom) + "</b>"
      + '<span>' + "★".repeat(a.note) + "☆".repeat(5 - a.note) + " · "
      + echapper([a.metier, a.ville].filter(Boolean).join(" · ") || "—") + " · " + quand(a.cree_le) + "</span>"
      + '<span class="cs-badge ' + (a.publie ? "publie" : "attente") + '">'
      + (a.publie ? "en ligne" : "en attente") + "</span></header>"
      + '<p class="texte">' + echapper(a.message) + "</p>"
      + '<textarea data-reponse placeholder="Votre réponse publique (facultative)">'
      + echapper(a.reponse || "") + "</textarea>"
      + '<div class="actions">'
      + '<button class="btn btn-plein" data-action="publier">'
      + (a.publie ? "Retirer du site" : "Publier") + "</button>"
      + '<button class="btn btn-ligne" data-action="repondre">Enregistrer la réponse</button>'
      + '<button class="btn btn-ligne" data-action="supprimer">Supprimer</button>'
      + "</div></article>";
  }

  function carteDemande(d) {
    var contacts = [d.telephone, d.email].filter(Boolean).join(" · ");
    return '<article class="cs-carte" data-id="' + d.id + '">'
      + "<header><b>" + echapper(d.nom) + "</b>"
      + "<span>" + echapper(d.entreprise || "—") + " · " + quand(d.cree_le) + "</span>"
      + '<span class="cs-badge ' + (d.statut === "nouveau" ? "attente" : "publie") + '">'
      + echapper(d.statut) + "</span></header>"
      + '<p class="texte">' + echapper(d.message) + "</p>"
      + '<p class="cs-note">' + echapper(contacts)
      + (d.service ? " — intéressé par : " + echapper(d.service) : "") + "</p>"
      + '<div class="actions">'
      + '<a class="btn btn-plein" href="mailto:' + encodeURIComponent(d.email) + '">Répondre par mail</a>'
      + (d.telephone ? '<a class="btn btn-ligne" href="https://wa.me/'
          + d.telephone.replace(/[^0-9]/g, "").replace(/^0/, "33") + '" target="_blank" rel="noopener">WhatsApp</a>' : "")
      + '<button class="btn btn-ligne" data-action="statut" data-valeur="en cours">En cours</button>'
      + '<button class="btn btn-ligne" data-action="statut" data-valeur="repondu">Répondu</button>'
      + '<button class="btn btn-ligne" data-action="statut" data-valeur="archive">Archiver</button>'
      + "</div></article>";
  }

  function carteAudit(a) {
    var p = Array.isArray(a.priorites) ? a.priorites : [];
    return '<article class="cs-carte" data-id="' + a.id + '">'
      + "<header><b>Score " + a.score + "/100</b>"
      + "<span>" + quand(a.cree_le) + "</span>"
      + '<span class="cs-badge ' + (a.contacte ? "publie" : "attente") + '">'
      + (a.contacte ? "traité" : "à rappeler") + "</span></header>"
      + (p.length ? '<p class="texte">' + p.map(function (x, i) {
          return (i + 1) + ". " + echapper(x); }).join("\n") + "</p>" : "")
      + '<p class="cs-note">' + echapper([a.nom, a.email, a.telephone].filter(Boolean).join(" · ")
          || "Audit anonyme — le visiteur n'a pas laissé de coordonnées.") + "</p>"
      + '<div class="actions">'
      + '<button class="btn btn-ligne" data-action="contacte">'
      + (a.contacte ? "Remettre à traiter" : "Marquer comme traité") + "</button>"
      + '<button class="btn btn-ligne" data-action="supprimer">Supprimer</button>'
      + "</div></article>";
  }

  var VUES = {
    avis: {
      requete: "avis?select=*&order=publie.asc,cree_le.desc",
      carte: carteAvis,
      compte: function (l) { return l.filter(function (x) { return !x.publie; }).length; },
      vide: "Aucun avis pour l'instant. Le formulaire du site alimentera cette liste."
    },
    demandes: {
      requete: "demandes?select=*&order=cree_le.desc",
      carte: carteDemande,
      compte: function (l) { return l.filter(function (x) { return x.statut === "nouveau"; }).length; },
      vide: "Aucune demande pour l'instant."
    },
    audits: {
      requete: "audits?select=*&order=cree_le.desc",
      carte: carteAudit,
      compte: function (l) { return l.filter(function (x) { return !x.contacte; }).length; },
      vide: "Aucun audit réalisé pour l'instant."
    }
  };

  function charger() {
    var v = VUES[vueActive];
    liste.innerHTML = '<p class="cs-vide">Chargement…</p>';
    api(v.requete)
      .then(function (l) {
        liste.innerHTML = l.length ? l.map(v.carte).join("") : '<p class="cs-vide">' + v.vide + "</p>";
        majPastilles();
      })
      .catch(function (e) { liste.innerHTML = '<p class="cs-vide">Lecture impossible : ' + echapper(e.message) + "</p>"; });
  }

  function majPastilles() {
    Object.keys(VUES).forEach(function (nom) {
      api(VUES[nom].requete).then(function (l) {
        var p = document.querySelector("[data-n-" + nom + "]");
        var n = VUES[nom].compte(l);
        p.textContent = n;
        p.hidden = n === 0;
      }).catch(function () {});
    });
  }

  document.querySelectorAll(".cs-onglets button").forEach(function (b) {
    b.addEventListener("click", function () {
      document.querySelectorAll(".cs-onglets button").forEach(function (o) {
        o.setAttribute("aria-selected", o === b ? "true" : "false");
      });
      vueActive = b.dataset.vue;
      charger();
    });
  });

  /* ── Actions ────────────────────────────────────────────────────────────── */
  liste.addEventListener("click", function (e) {
    var bouton = e.target.closest("[data-action]");
    if (!bouton) return;
    var carte = bouton.closest(".cs-carte");
    var id = carte.dataset.id;
    var action = bouton.dataset.action;
    var table = vueActive;

    function patch(corps, message) {
      bouton.disabled = true;
      api(table + "?id=eq." + id, {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify(corps)
      })
        .then(function () { dire(etat, message, true); charger(); })
        .catch(function (err) { dire(etat, "Échec : " + err.message, false); bouton.disabled = false; });
    }

    if (action === "publier") {
      var enLigne = carte.querySelector(".cs-badge").classList.contains("publie");
      patch({ publie: !enLigne }, enLigne ? "Avis retiré du site." : "Avis publié — il est en ligne.");
    } else if (action === "repondre") {
      var txt = carte.querySelector("[data-reponse]").value.trim();
      patch({ reponse: txt || null }, txt ? "Réponse enregistrée." : "Réponse effacée.");
    } else if (action === "statut") {
      patch({ statut: bouton.dataset.valeur }, "Demande marquée « " + bouton.dataset.valeur + " ».");
    } else if (action === "contacte") {
      var fait = carte.querySelector(".cs-badge").classList.contains("publie");
      patch({ contacte: !fait }, fait ? "Audit remis à traiter." : "Audit marqué comme traité.");
    } else if (action === "supprimer") {
      if (!window.confirm("Supprimer définitivement ? Cette action est irréversible.")) return;
      bouton.disabled = true;
      api(table + "?id=eq." + id, { method: "DELETE", headers: { Prefer: "return=minimal" } })
        .then(function () { dire(etat, "Supprimé.", true); charger(); })
        .catch(function (err) { dire(etat, "Échec : " + err.message, false); bouton.disabled = false; });
    }
  });

  /* ── Reprise de session ─────────────────────────────────────────────────── */
  var memorise = "";
  var venaitDuLocal = false;
  try {
    memorise = sessionStorage.getItem("castel-jeton") || "";
    if (!memorise) { memorise = localStorage.getItem("castel-jeton") || ""; venaitDuLocal = !!memorise; }
  } catch (e) {}
  if (memorise) entrer(memorise, venaitDuLocal);
})();
