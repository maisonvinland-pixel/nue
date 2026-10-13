// Applique le thème choisi avant le premier rendu (évite le flash de thème).
try {
  var t = localStorage.getItem('rq:theme')
  if (t === 'light' || t === 'dark') document.documentElement.dataset.theme = t
} catch (_) {}
