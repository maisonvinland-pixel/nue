// Pages servies directement par le middleware (connexion, configuration incomplète).
// Autonomes : CSS en ligne, aucune dépendance aux assets générés.

const esc = s =>
  String(s ?? '').replace(
    /[&<>"']/g,
    c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
  )

const FIN =
  '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round" aria-hidden="true"><path d="M4 19c0-6 2.5-11.5 8.5-15 1.5 4.5.8 8.6-1 11.6 1.4.9 3.7 2 7.5 3.4H4Z"/></svg>'

const ERRORS = {
  code: 'Ce code d’accès n’est pas reconnu. Vérifie qu’il est complet (format RQ-XXXX-XXXX-XXXX-XXXX).',
  pas_membre:
    'Ton compte Discord n’est pas membre du serveur 100% REQUIN. Rejoins le serveur, puis réessaie.',
  role: 'Ton compte Discord est bien sur le serveur, mais n’a pas le rôle membre donnant accès à la formation. Si tu viens de t’abonner, patiente quelques minutes puis réessaie, ou contacte l’équipe.',
  discord: 'La connexion avec Discord a échoué. Réessaie dans un instant.',
  discord_annule: 'Connexion Discord annulée. Tu peux réessayer quand tu veux.',
  discord_off: 'La connexion Discord n’est pas activée sur cet espace.',
  etat: 'La demande de connexion a expiré. Recommence depuis cette page.',
  requete: 'La requête n’a pas pu être lue. Recharge la page et réessaie.',
}

const STYLE = `
:root{--bg:#04070e;--surface:#0a1422;--line:#172a3c;--text:#d5e8e7;--dim:#93b2b2;--faint:#62807f;--accent:#42e6db;--ink:#022320;--ice:#ecfbfb;--danger:#ff8a7a;--ok:#5fe3a1;color-scheme:dark}
@media (prefers-color-scheme:light){:root{--bg:#f5f7f7;--surface:#fff;--line:#dde5e6;--text:#15242a;--dim:#465d63;--faint:#6c8086;--accent:#0a7c76;--ink:#fff;--ice:#071419;--danger:#b2382a;--ok:#157a4c;color-scheme:light}}
*{box-sizing:border-box}
body{margin:0;min-height:100vh;display:grid;place-items:center;padding:24px 16px;background:radial-gradient(circle at 70% 0%,rgba(66,230,219,.10),transparent 55%),var(--bg);color:var(--text);font:400 16px/1.6 Inter,system-ui,-apple-system,"Segoe UI",sans-serif;-webkit-font-smoothing:antialiased}
.box{width:100%;max-width:440px;background:var(--surface);border:1px solid var(--line);border-radius:18px;padding:34px 30px;box-shadow:0 30px 80px -40px rgba(0,0,0,.8)}
.brand{display:flex;align-items:center;gap:10px;color:var(--accent);margin-bottom:26px}
.brand b{font:800 1.05rem/1 Orbitron,"Chakra Petch",system-ui,sans-serif;color:var(--ice);letter-spacing:.02em}
h1{font:700 1.6rem/1.2 "Chakra Petch",system-ui,sans-serif;color:var(--ice);margin:0 0 8px}
p{margin:0}
.sub{color:var(--dim);margin-bottom:26px}
.btn{display:flex;width:100%;align-items:center;justify-content:center;gap:10px;border:0;border-radius:11px;padding:14px 18px;font:600 1rem/1 Inter,system-ui,sans-serif;cursor:pointer;text-decoration:none}
.btn-discord{background:#5865f2;color:#fff}
.btn-discord:hover{background:#4752c4}
.btn-primary{background:var(--accent);color:var(--ink);margin-top:12px}
.or{display:flex;align-items:center;gap:12px;color:var(--faint);font-size:.82rem;margin:22px 0}
.or::before,.or::after{content:"";flex:1;height:1px;background:var(--line)}
label{display:block;font-weight:600;font-size:.9rem;margin-bottom:8px;color:var(--ice)}
input{width:100%;padding:13px 14px;border-radius:10px;border:1px solid var(--line);background:transparent;color:var(--ice);font:500 1rem/1.2 "JetBrains Mono",ui-monospace,monospace;letter-spacing:.04em;text-transform:uppercase}
input:focus{outline:2px solid var(--accent);outline-offset:1px}
.hint{font-size:.8rem;color:var(--faint);margin-top:8px}
.msg{border-radius:10px;padding:12px 14px;font-size:.9rem;margin-bottom:20px;border:1px solid}
.msg-err{color:var(--danger);border-color:color-mix(in srgb,var(--danger) 40%,transparent);background:color-mix(in srgb,var(--danger) 8%,transparent)}
.msg-ok{color:var(--ok);border-color:color-mix(in srgb,var(--ok) 40%,transparent);background:color-mix(in srgb,var(--ok) 8%,transparent)}
.foot{margin-top:26px;padding-top:18px;border-top:1px solid var(--line);font-size:.86rem;color:var(--dim)}
.foot a{color:var(--accent)}
:focus-visible{outline:2px solid var(--accent);outline-offset:3px}
`

function shell(title, inner) {
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${esc(title)} · 100% REQUIN</title>
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@700&family=Inter:wght@400;600&family=JetBrains+Mono:wght@500&family=Orbitron:wght@800&display=swap">
<style>${STYLE}</style>
</head>
<body>
<main class="box">
<p class="brand">${FIN}<b>100% REQUIN</b></p>
${inner}
</main>
</body>
</html>`
}

export function loginPage({ methods, next = '/', error, loggedOut, joinUrl }) {
  const err =
    error && ERRORS[error] ? `<p class="msg msg-err" role="alert">${esc(ERRORS[error])}</p>` : ''
  const ok =
    loggedOut && !err ? '<p class="msg msg-ok" role="status">Tu es déconnecté. À bientôt.</p>' : ''
  const discord = methods.discord
    ? `<a class="btn btn-discord" href="/auth/discord/?next=${encodeURIComponent(next)}"><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M19.6 5.3A17 17 0 0 0 15.4 4l-.5 1.1a15.7 15.7 0 0 0-5.8 0L8.6 4a17 17 0 0 0-4.2 1.3C1.7 9.3 1 13.2 1.3 17a17 17 0 0 0 5.2 2.6l1.1-1.8c-.6-.2-1.2-.5-1.7-.9l.4-.3a12 12 0 0 0 10.4 0l.4.3c-.5.4-1.1.7-1.7.9l1.1 1.8a17 17 0 0 0 5.2-2.6c.4-4.4-.7-8.3-3.1-11.7ZM8.7 14.8c-1 0-1.9-.9-1.9-2.1s.8-2.1 1.9-2.1 1.9.9 1.9 2.1-.8 2.1-1.9 2.1Zm6.6 0c-1 0-1.9-.9-1.9-2.1s.8-2.1 1.9-2.1 1.9.9 1.9 2.1-.8 2.1-1.9 2.1Z"/></svg>Se connecter avec Discord</a>`
    : ''
  const code = methods.code
    ? `<form method="post" action="/auth/login/">
<input type="hidden" name="next" value="${esc(next)}">
<label for="code">Code d’accès personnel</label>
<input id="code" name="code" required autocomplete="one-time-code" autocapitalize="characters" spellcheck="false" placeholder="RQ-XXXX-XXXX-XXXX-XXXX" maxlength="40"${error === 'code' ? ' aria-invalid="true" autofocus' : ''}>
<p class="hint">Le code t’a été remis après ton achat. Il est personnel : ne le partage pas.</p>
<button class="btn btn-primary" type="submit">Accéder à la formation</button>
</form>`
    : ''
  const none =
    !methods.discord && !methods.code
      ? '<p class="msg msg-err" role="alert">Aucune méthode de connexion n’est encore configurée sur cet espace. L’administrateur doit définir les variables DISCORD_* ou ACCESS_CODES.</p>'
      : ''
  return shell(
    'Connexion',
    `<h1>Espace membre</h1>
<p class="sub">Cette formation est réservée aux membres. Connecte-toi pour accéder aux chapitres, scripts et modèles.</p>
${err}${ok}${none}
${discord}
${methods.discord && methods.code ? '<p class="or">ou</p>' : ''}
${code}
<p class="foot">Pas encore membre ? <a href="${esc(joinUrl)}" rel="noopener noreferrer">Rejoindre 100% REQUIN</a></p>`
  )
}

export function configErrorPage() {
  return shell(
    'Configuration incomplète',
    `<h1>Espace en cours de configuration</h1>
<p class="sub">L’accès est temporairement fermé : la clé de session du serveur n’est pas définie. Par sécurité, aucun contenu n’est servi tant que la configuration n’est pas terminée.</p>
<p class="foot">Administrateur : définis la variable d’environnement <code>SESSION_SECRET</code> (32 caractères minimum) puis redéploie.</p>`
  )
}
