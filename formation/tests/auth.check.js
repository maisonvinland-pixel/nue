// Contrôle d'accès : sessions, codes, redirections, Discord (API simulée).
import { test, mock } from 'node:test'
import assert from 'node:assert/strict'
import { handle, safeNext } from '../auth/handler.js'
import {
  signSession,
  verifySession,
  generateCode,
  normalizeCode,
  sha256Hex,
} from '../auth/session.js'

const SECRET = 'x'.repeat(48)
const CODE = 'RQ-ABCD-EFGH-JKMN-PQRS'
const env = async (extra = {}) => ({
  SESSION_SECRET: SECRET,
  ACCESS_CODES: `Test Acheteur:${await sha256Hex(normalizeCode(CODE))}`,
  ...extra,
})
const req = (path, init = {}) => new Request(`https://espace.example.com${path}`, init)
const withCookie = (path, token, init = {}) =>
  req(path, {
    ...init,
    headers: { cookie: `rq_session=${encodeURIComponent(token)}`, ...(init.headers || {}) },
  })

test('sans SESSION_SECRET, tout le contenu est refusé (503)', async () => {
  const res = await handle(req('/smma/'), {})
  assert.equal(res.status, 503)
  const data = await handle(req('/data/search.json'), {})
  assert.equal(data.status, 503)
})

test('les assets publics passent, le contenu est protégé', async () => {
  const e = await env()
  assert.equal(await handle(req('/assets/styles.abc.css'), e), null)
  assert.equal(await handle(req('/robots.txt'), e), null)
  const page = await handle(
    req('/smma/trouver-tes-premiers-prospects/', { headers: { accept: 'text/html' } }),
    e
  )
  assert.equal(page.status, 302)
  assert.equal(
    page.headers.get('location'),
    '/connexion/?next=%2Fsmma%2Ftrouver-tes-premiers-prospects%2F'
  )
  const json = await handle(
    req('/data/search.json', { headers: { accept: 'application/json' } }),
    e
  )
  assert.equal(json.status, 401)
})

test('connexion par code valide : cookie de session signé puis accès', async () => {
  const e = await env()
  const body = new URLSearchParams({
    code: CODE.toLowerCase().replace(/-/g, ' '),
    next: '/fiscalite/',
  })
  const res = await handle(req('/auth/login/', { method: 'POST', body }), e)
  assert.equal(res.status, 303)
  assert.equal(res.headers.get('location'), '/fiscalite/')
  const setCookie = res.headers.get('set-cookie')
  assert.match(setCookie, /rq_session=v1\./)
  assert.match(setCookie, /HttpOnly/)
  assert.match(setCookie, /Secure/)
  assert.match(setCookie, /SameSite=Lax/)
  const token = decodeURIComponent(/rq_session=([^;]+)/.exec(setCookie)[1])
  assert.equal(await handle(withCookie('/fiscalite/', token), e), null)
  const me = await handle(withCookie('/auth/me/', token), e)
  assert.deepEqual(await me.json(), {
    id: 'code:Test Acheteur',
    name: 'Test Acheteur',
    method: 'code',
  })
})

test('code invalide : 401 et aucun cookie', async () => {
  const e = await env()
  const res = await handle(
    req('/auth/login', {
      method: 'POST',
      body: new URLSearchParams({ code: 'RQ-XXXX-XXXX-XXXX-XXXX' }),
    }),
    e
  )
  assert.equal(res.status, 401)
  assert.equal(res.headers.get('set-cookie'), null)
  assert.match(await res.text(), /n’est pas reconnu/)
})

test('jeton falsifié, signé avec une autre clé ou expiré : refusé', async () => {
  const e = await env()
  const good = await signSession({ sub: 'code:x', name: 'x', m: 'code' }, SECRET, 3600)
  const [v, body, sig] = good.split('.')
  const forged = `${v}.${Buffer.from(JSON.stringify({ sub: 'admin', exp: 9999999999 })).toString('base64url')}.${sig}`
  const otherKey = await signSession({ sub: 'code:x' }, 'y'.repeat(48), 3600)
  const expired = await signSession({ sub: 'code:x' }, SECRET, -10)
  for (const t of [forged, otherKey, expired, `${v}.${body}.`, 'nimportequoi']) {
    const res = await handle(withCookie('/', t, { headers: { accept: 'text/html' } }), e)
    assert.equal(res?.status, 302, `jeton accepté à tort : ${t.slice(0, 20)}`)
  }
  assert.ok(await verifySession(good, SECRET))
})

test('redirection après connexion : chemins internes uniquement', () => {
  assert.equal(safeNext('/smma/'), '/smma/')
  assert.equal(safeNext('//evil.example'), '/')
  assert.equal(safeNext('https://evil.example'), '/')
  assert.equal(safeNext('/\\evil.example'), '/')
  assert.equal(safeNext('/auth/logout/'), '/')
  assert.equal(safeNext(null), '/')
})

test('déconnexion : cookie effacé', async () => {
  const res = await handle(req('/auth/logout/'), await env())
  assert.equal(res.status, 302)
  assert.match(res.headers.get('set-cookie'), /rq_session=; .*Max-Age=0/)
})

test('le mode développement est ignoré sur Vercel', async () => {
  const res = await handle(
    req('/', { headers: { accept: 'text/html' } }),
    await env({ AUTH_DEV_BYPASS: '1', VERCEL: '1' })
  )
  assert.equal(res.status, 302)
  const local = await handle(req('/'), await env({ AUTH_DEV_BYPASS: '1' }))
  assert.equal(local, null)
})

test('page de connexion : affiche les méthodes configurées', async () => {
  const onlyCode = await (await handle(req('/connexion/'), await env())).text()
  assert.match(onlyCode, /Code d’accès personnel/)
  assert.doesNotMatch(onlyCode, /Se connecter avec Discord/)
  const both = await (
    await handle(
      req('/connexion/'),
      await env({ DISCORD_CLIENT_ID: 'id', DISCORD_CLIENT_SECRET: 's', DISCORD_GUILD_ID: 'g' })
    )
  ).text()
  assert.match(both, /Se connecter avec Discord/)
})

test('codes générés : format lisible et unicité', () => {
  const codes = new Set(Array.from({ length: 500 }, generateCode))
  assert.equal(codes.size, 500)
  for (const c of codes) assert.match(c, /^RQ-[A-HJKMNP-Z2-9]{4}(-[A-HJKMNP-Z2-9]{4}){3}$/)
})

// ---------------------------------------------------------------- Discord (API simulée)

const discordEnv = extra =>
  env({
    DISCORD_CLIENT_ID: 'cid',
    DISCORD_CLIENT_SECRET: 'csecret',
    DISCORD_GUILD_ID: 'guild1',
    DISCORD_ROLE_IDS: 'role-membre',
    ...extra,
  })

async function startDiscord(e) {
  const res = await handle(req('/auth/discord/?next=/smma/'), e)
  assert.equal(res.status, 302)
  const loc = new URL(res.headers.get('location'))
  assert.equal(loc.origin + loc.pathname, 'https://discord.com/oauth2/authorize')
  assert.equal(loc.searchParams.get('scope'), 'identify guilds.members.read')
  assert.equal(
    loc.searchParams.get('redirect_uri'),
    'https://espace.example.com/auth/discord/callback'
  )
  const state = loc.searchParams.get('state')
  const stateCookie = /rq_oauth=([^;]+)/.exec(res.headers.get('set-cookie'))[1]
  return { state, stateCookie }
}

function mockDiscord(member, status = 200) {
  return mock.method(globalThis, 'fetch', async url => {
    if (String(url).endsWith('/oauth2/token')) return Response.json({ access_token: 'tok' })
    if (String(url).includes('/users/@me/guilds/guild1/member'))
      return Response.json(member, { status })
    throw new Error('URL inattendue ' + url)
  })
}

test('Discord : membre avec le bon rôle → session', async () => {
  const e = await discordEnv()
  const { state, stateCookie } = await startDiscord(e)
  const f = mockDiscord({
    user: { id: '42', username: 'shark' },
    nick: 'Requin',
    roles: ['role-membre'],
  })
  const res = await handle(
    req(`/auth/discord/callback?code=abc&state=${state}`, {
      headers: { cookie: `rq_oauth=${stateCookie}` },
    }),
    e
  )
  f.mock.restore()
  assert.equal(res.status, 302)
  assert.equal(res.headers.get('location'), '/smma/')
  const cookies = res.headers.getSetCookie().join('\n')
  const token = decodeURIComponent(/rq_session=([^;]+)/.exec(cookies)[1])
  const s = await verifySession(token, SECRET)
  assert.equal(s.sub, 'discord:42')
  assert.equal(s.name, 'Requin')
})

test('Discord : rôle manquant, non-membre ou état invalide → refus', async () => {
  const e = await discordEnv()
  let { state, stateCookie } = await startDiscord(e)
  let f = mockDiscord({ user: { id: '42' }, roles: ['autre'] })
  let res = await handle(
    req(`/auth/discord/callback?code=abc&state=${state}`, {
      headers: { cookie: `rq_oauth=${stateCookie}` },
    }),
    e
  )
  f.mock.restore()
  assert.equal(res.headers.get('location'), '/connexion/?erreur=role')
  ;({ state, stateCookie } = await startDiscord(e))
  f = mockDiscord({ message: 'Unknown Guild' }, 404)
  res = await handle(
    req(`/auth/discord/callback?code=abc&state=${state}`, {
      headers: { cookie: `rq_oauth=${stateCookie}` },
    }),
    e
  )
  f.mock.restore()
  assert.equal(res.headers.get('location'), '/connexion/?erreur=pas_membre')
  res = await handle(
    req(`/auth/discord/callback?code=abc&state=autre`, {
      headers: { cookie: `rq_oauth=${stateCookie}` },
    }),
    e
  )
  assert.equal(res.headers.get('location'), '/connexion/?erreur=etat')
  assert.ok(!res.headers.getSetCookie().some(c => c.startsWith('rq_session=v1')))
})
