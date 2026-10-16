/* =============================================================================
   CASTEL STUDIO — le lecteur de la démo
   Une affiche légère au chargement ; le lecteur n'est créé qu'au clic.
   Source, par ordre de priorité : CASTEL.videoDemo (MP4, YouTube, Vimeo),
   sinon le film animé maison (film.html), qui ne pèse aucun fichier vidéo.
   ========================================================================== */
(function () {
  "use strict";

  var source = ((window.CASTEL || {}).videoDemo || "").trim();

  function cadre(src, titre) {
    var f = document.createElement("iframe");
    f.src = src;
    f.title = titre;
    f.allow = "autoplay; fullscreen; picture-in-picture";
    f.allowFullscreen = true;
    return f;
  }

  function lecteurPour(hote) {
    var yt = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/.exec(source);
    var vi = /vimeo\.com\/(?:video\/)?(\d+)/.exec(source);
    if (yt) return cadre("https://www.youtube-nocookie.com/embed/" + yt[1] + "?autoplay=1&rel=0&modestbranding=1", "Démo du Pack Monopole");
    if (vi) return cadre("https://player.vimeo.com/video/" + vi[1] + "?autoplay=1&dnt=1", "Démo du Pack Monopole");
    if (/\.(mp4|webm)(\?|$)/i.test(source)) {
      var v = document.createElement("video");
      v.src = source;
      v.controls = true;
      v.autoplay = true;
      v.playsInline = true;
      v.preload = "metadata";
      return v;
    }
    return cadre(hote.getAttribute("data-film") || "film.html?mode=land&embed=1", "Démo animée du Pack Monopole");
  }

  document.querySelectorAll("[data-lecteur]").forEach(function (hote) {
    var affiche = hote.querySelector(".lecteur-affiche");
    if (!affiche) return;
    affiche.addEventListener("click", function () {
      var ecran = document.createElement("div");
      ecran.className = "lecteur-ecran";
      ecran.appendChild(lecteurPour(hote));
      affiche.replaceWith(ecran);
      var media = ecran.firstChild;
      if (media.focus) media.focus();
    });
  });
})();
