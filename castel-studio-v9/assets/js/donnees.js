/* =============================================================================
   CASTEL STUDIO — la couche de données
   Le seul endroit du site qui parle à Supabase. Les autres scripts passent par
   ici : ils n'ont ni URL ni clé à connaître.

   Règle de conduite : une écriture qui échoue ne doit JAMAIS bloquer le
   visiteur. Le formulaire de contact part quand même par courriel, l'audit
   affiche quand même son score. La base est un bonus, pas un passage obligé.
   ========================================================================== */
(function () {
  "use strict";

  var CFG = window.CASTEL || {};
  var BASE = (CFG.supabaseUrl || "").replace(/\/+$/, "");
  var CLE = CFG.supabaseCle || "";
  var ACTIF = !!(BASE && CLE);

  function entetes(extra) {
    var h = {
      apikey: CLE,
      Authorization: "Bearer " + CLE,
      "Content-Type": "application/json"
    };
    for (var k in extra) if (Object.prototype.hasOwnProperty.call(extra, k)) h[k] = extra[k];
    return h;
  }

  // Un appel qui traîne est un appel abandonné : on ne fait pas attendre la page.
  function avecDelai(promesse, ms) {
    return new Promise(function (resoudre, rejeter) {
      var fini = false;
      var minuteur = setTimeout(function () {
        if (!fini) { fini = true; rejeter(new Error("delai depasse")); }
      }, ms || 8000);
      promesse.then(function (v) {
        if (fini) return;
        fini = true; clearTimeout(minuteur); resoudre(v);
      }, function (e) {
        if (fini) return;
        fini = true; clearTimeout(minuteur); rejeter(e);
      });
    });
  }

  window.CastelDonnees = {

    actif: ACTIF,

    /* Appelle une fonction de la base. Un seul aller-retour, calcul fait côté
       serveur — c'est ce qui remplace « je charge tout et je recalcule ici ». */
    appeler: function (fonction, params) {
      if (!ACTIF) return Promise.reject(new Error("supabase non configure"));
      return avecDelai(
        fetch(BASE + "/rest/v1/rpc/" + fonction, {
          method: "POST",
          headers: entetes(),
          body: JSON.stringify(params || {})
        }).then(function (r) {
          if (!r.ok) throw new Error("rpc " + r.status);
          return r.json();
        })
      );
    },

    /* Enregistre une ligne. Ne renvoie rien : les règles de la base
       interdisent la relecture, et le site n'en a pas besoin. */
    enregistrer: function (table, ligne) {
      if (!ACTIF) return Promise.reject(new Error("supabase non configure"));
      return avecDelai(
        fetch(BASE + "/rest/v1/" + table, {
          method: "POST",
          headers: entetes({ Prefer: "return=minimal" }),
          body: JSON.stringify(ligne)
        }).then(function (r) {
          if (!r.ok) return r.text().then(function (t) { throw new Error(t || ("http " + r.status)); });
          return true;
        })
      );
    }
  };
})();
