// Contrôle d'accès de l'espace membre.
//
// handle(request, env) renvoie :
//   - une Response (redirection, page de connexion, erreur…) ;
//   - null si la requête peut accéder au fichier statique demandé.
//
// Méthodes de connexion (activables indépendamment par variables d'environnement) :
//   1. Discord OAuth2 : l'utilisateur doit être membre du serveur (et, si configuré, avoir un des rôles autorisés).
//   2. Code d'accès personnel : un code par acheteur, stocké sous forme d'empreinte SHA-256.
//
// Sans SESSION_SECRET valide, tout le contenu est refusé (fail closed).

import {
  SESSION_COOKIE,
  signSession,
  verifySession,
  secretIsValid,
  parseAccessCodes,
  matchAccessCode,
  parseCookies,
  cookie,
  randomToken,
} from './session.js'
import { loginPage, configErrorPage } from './pages.js'

const PUBLIC_PREFIXES = ['/assets/']
const PUBLIC_FILES = new Set(['/robots.txt', '/favicon.ico'])
const STATE_COOKIE = 'rq_oauth'
const DISCORD_API = 'https://discord.com/api/v10'

export function readConfig(env) {
  const codes = parseAccessCodes(env.ACCESS_CODES)
  const discord =
    env.DISCORD_CLIENT_ID && env.DISCORD_CLIENT_SECRET && env.DISCORD_GUILD_ID
      ? {
          clientId: env.DISCORD_CLIENT_ID,
          clientSecret: env.DISCORD_CLIENT_SECRET,
          guildId: env.DISCORD_GUILD_ID,
          roleIds: String(env.DISCORD_ROLE_IDS || '')
            .split(',')
            .map(s => s.trim())
            .filter(Boolean),
        }
      : null
  return {
    secret: env.SESSION_SECRET,
    secretOk: secretIsValid(env.SESSION_SECRET),
    codes,
    discord,
    devBypass: env.AUTH_DEV_BYPASS === '1' && !env.VERCEL,
    secure: !env.AUTH_INSECURE_COOKIES,
    publicUrl: env.PUBLIC_URL ? env.PUBLIC_URL.replace(/\/$/, '') : null,
    joinUrl: env.JOIN_URL || 'https://discord.gg/4xzmPTQWx',
    ttlDiscord: Number(env.SESSION_TTL_DISCORD_DAYS || 7) * 86400,
    ttlCode: Number(env.SESSION_TTL_CODE_DAYS || 30) * 86400,
  }
}

const SECURITY_HEADERS = {
  'x-frame-options': 'DENY',
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'same-origin',
  'cache-control': 'no-store',
}

function html(body, status = 200, extra = {}) {
  return new Response(body, {
    status,
    headers: { 'content-type': 'text/html; charset=utf-8', ...SECURITY_HEADERS, ...extra },
  })
}
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...SECURITY_HEADERS },
  })
}
function redirect(location, cookies = [], status = 302) {
  const headers = new Headers({ location, ...SECURITY_HEADERS })
  for (const c of cookies) headers.append('set-cookie', c)
  return new Response(null, { status, headers })
}

/** N'accepte que des chemins internes (« /… » mais pas « //… »). */
export function safeNext(next) {
  if (
    typeof next !== 'string' ||
    !next.startsWith('/') ||
    next.startsWith('//') ||
    next.startsWith('/\\')
  )
    return '/'
  if (next.startsWith('/auth/') || next.startsWith('/connexion')) return '/'
  return next.slice(0, 512)
}

function wantsHtml(request, path) {
  const accept = request.headers.get('accept') || ''
  return accept.includes('text/html') || path.endsWith('/') || !/\.[a-z0-9]+$/i.test(path)
}

async function currentSession(request, cfg) {
  const token = parseCookies(request.headers.get('cookie'))[SESSION_COOKIE]
  return verifySession(token, cfg.secret)
}

export async function handle(request, env = {}) {
  const cfg = readConfig(env)
  const url = new URL(request.url)
  // trailingSlash est activé sur Vercel : on compare les chemins sans la barre finale
  const path = url.pathname.length > 1 ? url.pathname.replace(/\/+$/, '') : '/'
  const origin = cfg.publicUrl || url.origin

  if (PUBLIC_PREFIXES.some(p => path.startsWith(p)) || PUBLIC_FILES.has(path)) return null

  if (cfg.devBypass) {
    if (path === '/auth/me') return json({ id: 'dev', name: 'Mode développement', method: 'dev' })
    if (path === '/connexion' || path.startsWith('/auth/')) return redirect('/')
    return null
  }

  if (!cfg.secretOk) {
    return path.startsWith('/data/')
      ? json({ error: 'not_configured' }, 503)
      : html(configErrorPage(), 503)
  }

  const methods = { discord: Boolean(cfg.discord), code: cfg.codes.length > 0 }

  // ---- page de connexion
  if (path === '/connexion') {
    if (await currentSession(request, cfg)) return redirect(safeNext(url.searchParams.get('next')))
    return html(
      loginPage({
        methods,
        next: safeNext(url.searchParams.get('next')),
        error: url.searchParams.get('erreur'),
        loggedOut: url.searchParams.has('deconnecte'),
        joinUrl: cfg.joinUrl,
      })
    )
  }

  // ---- connexion par code
  if (path === '/auth/login') {
    if (request.method !== 'POST') return redirect('/connexion/')
    let form
    try {
      form = await request.formData()
    } catch (_) {
      return redirect('/connexion/?erreur=requete')
    }
    const next = safeNext(form.get('next'))
    const entry = methods.code ? await matchAccessCode(form.get('code'), cfg.codes) : null
    if (!entry) {
      return html(loginPage({ methods, next, error: 'code', joinUrl: cfg.joinUrl }), 401)
    }
    const token = await signSession(
      { sub: `code:${entry.label}`, name: entry.label, m: 'code' },
      cfg.secret,
      cfg.ttlCode
    )
    return redirect(
      next,
      [cookie(SESSION_COOKIE, token, { maxAge: cfg.ttlCode, secure: cfg.secure })],
      303
    )
  }

  // ---- Discord : départ
  if (path === '/auth/discord') {
    if (!cfg.discord) return redirect('/connexion/?erreur=discord_off')
    const state = randomToken()
    const next = safeNext(url.searchParams.get('next'))
    const q = new URLSearchParams({
      client_id: cfg.discord.clientId,
      response_type: 'code',
      redirect_uri: `${origin}/auth/discord/callback`,
      scope: 'identify guilds.members.read',
      state,
      prompt: 'none',
    })
    return redirect(`https://discord.com/oauth2/authorize?${q}`, [
      cookie(STATE_COOKIE, `${state}|${next}`, { maxAge: 600, path: '/auth/', secure: cfg.secure }),
    ])
  }

  // ---- Discord : retour
  if (path === '/auth/discord/callback') {
    if (!cfg.discord) return redirect('/connexion/?erreur=discord_off')
    const clearState = cookie(STATE_COOKIE, '', { maxAge: 0, path: '/auth/', secure: cfg.secure })
    const [savedState, savedNext] = (
      parseCookies(request.headers.get('cookie'))[STATE_COOKIE] || ''
    ).split('|')
    const state = url.searchParams.get('state')
    if (url.searchParams.get('error'))
      return redirect('/connexion/?erreur=discord_annule', [clearState])
    if (!state || !savedState || state !== savedState)
      return redirect('/connexion/?erreur=etat', [clearState])

    try {
      const tokenRes = await fetch(`${DISCORD_API}/oauth2/token`, {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: cfg.discord.clientId,
          client_secret: cfg.discord.clientSecret,
          grant_type: 'authorization_code',
          code: url.searchParams.get('code') || '',
          redirect_uri: `${origin}/auth/discord/callback`,
        }),
      })
      if (!tokenRes.ok) return redirect('/connexion/?erreur=discord', [clearState])
      const { access_token } = await tokenRes.json()

      const memberRes = await fetch(
        `${DISCORD_API}/users/@me/guilds/${cfg.discord.guildId}/member`,
        {
          headers: { authorization: `Bearer ${access_token}` },
        }
      )
      if (memberRes.status === 404) return redirect('/connexion/?erreur=pas_membre', [clearState])
      if (!memberRes.ok) return redirect('/connexion/?erreur=discord', [clearState])
      const member = await memberRes.json()

      const roles = Array.isArray(member.roles) ? member.roles : []
      if (cfg.discord.roleIds.length && !roles.some(r => cfg.discord.roleIds.includes(r))) {
        return redirect('/connexion/?erreur=role', [clearState])
      }
      const user = member.user || {}
      const token = await signSession(
        {
          sub: `discord:${user.id}`,
          name: member.nick || user.global_name || user.username || 'Membre',
          m: 'discord',
        },
        cfg.secret,
        cfg.ttlDiscord
      )
      return redirect(safeNext(savedNext), [
        clearState,
        cookie(SESSION_COOKIE, token, { maxAge: cfg.ttlDiscord, secure: cfg.secure }),
      ])
    } catch (_) {
      return redirect('/connexion/?erreur=discord', [clearState])
    }
  }

  // ---- déconnexion
  if (path === '/auth/logout') {
    return redirect('/connexion/?deconnecte', [
      cookie(SESSION_COOKIE, '', { maxAge: 0, secure: cfg.secure }),
    ])
  }

  // ---- identité courante (utilisée pour séparer la progression par compte)
  const session = await currentSession(request, cfg)
  if (path === '/auth/me') {
    return session
      ? json({ id: session.sub, name: session.name, method: session.m })
      : json({ error: 'unauthenticated' }, 401)
  }
  if (path.startsWith('/auth/')) return json({ error: 'not_found' }, 404)

  // ---- tout le reste est réservé aux membres
  if (session) return null
  if (wantsHtml(request, path))
    return redirect(`/connexion/?next=${encodeURIComponent(url.pathname + url.search)}`)
  return json({ error: 'unauthenticated' }, 401)
}
