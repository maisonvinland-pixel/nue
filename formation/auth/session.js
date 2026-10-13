// Sessions signées (HMAC-SHA256) et codes d'accès.
// Uniquement des API Web standard (crypto.subtle) : fonctionne dans le middleware Vercel et dans Node ≥ 20.

const enc = new TextEncoder()
const dec = new TextDecoder()

export const SESSION_COOKIE = 'rq_session'

function b64url(bytes) {
  let s = ''
  for (const b of bytes) s += String.fromCharCode(b)
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
function fromB64url(str) {
  const s = atob(str.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((str.length + 3) % 4))
  return Uint8Array.from(s, c => c.charCodeAt(0))
}

const keyCache = new Map()
async function hmacKey(secret) {
  if (!keyCache.has(secret)) {
    keyCache.set(
      secret,
      crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [
        'sign',
        'verify',
      ])
    )
  }
  return keyCache.get(secret)
}

export function secretIsValid(secret) {
  return typeof secret === 'string' && secret.length >= 32
}

/** Crée un jeton signé : v1.<payload>.<signature> */
export async function signSession(payload, secret, ttlSeconds) {
  const now = Math.floor(Date.now() / 1000)
  const body = b64url(enc.encode(JSON.stringify({ ...payload, iat: now, exp: now + ttlSeconds })))
  const sig = new Uint8Array(
    await crypto.subtle.sign('HMAC', await hmacKey(secret), enc.encode(`v1.${body}`))
  )
  return `v1.${body}.${b64url(sig)}`
}

/** Vérifie la signature (comparaison à temps constant via subtle.verify) et l'expiration. */
export async function verifySession(token, secret) {
  if (!token || !secretIsValid(secret)) return null
  const parts = token.split('.')
  if (parts.length !== 3 || parts[0] !== 'v1') return null
  try {
    const ok = await crypto.subtle.verify(
      'HMAC',
      await hmacKey(secret),
      fromB64url(parts[2]),
      enc.encode(`v1.${parts[1]}`)
    )
    if (!ok) return null
    const payload = JSON.parse(dec.decode(fromB64url(parts[1])))
    if (typeof payload.exp !== 'number' || payload.exp < Math.floor(Date.now() / 1000)) return null
    return payload
  } catch (_) {
    return null
  }
}

// ---------------------------------------------------------------- codes d'accès

/** Normalise un code saisi : majuscules, sans espaces ni tirets. */
export function normalizeCode(code) {
  return String(code || '')
    .toUpperCase()
    .replace(/[\s-]/g, '')
}

export async function sha256Hex(str) {
  const d = new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode(str)))
  return [...d].map(b => b.toString(16).padStart(2, '0')).join('')
}

/** ACCESS_CODES : entrées « libellé:empreinte_sha256 » séparées par des virgules ou des retours à la ligne. */
export function parseAccessCodes(raw) {
  return String(raw || '')
    .split(/[\n,]+/)
    .map(s => s.trim())
    .filter(Boolean)
    .map(entry => {
      const i = entry.lastIndexOf(':')
      return i > 0
        ? {
            label: entry.slice(0, i).trim(),
            hash: entry
              .slice(i + 1)
              .trim()
              .toLowerCase(),
          }
        : null
    })
    .filter(e => e && /^[0-9a-f]{64}$/.test(e.hash))
}

function timingSafeEqualHex(a, b) {
  if (a.length !== b.length) return false
  let r = 0
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return r === 0
}

/** Renvoie l'entrée correspondant au code, ou null. Parcourt toujours toute la liste. */
export async function matchAccessCode(code, entries) {
  const norm = normalizeCode(code)
  if (norm.length < 12) return null
  const h = await sha256Hex(norm)
  let found = null
  for (const e of entries) if (timingSafeEqualHex(h, e.hash)) found = e
  return found
}

const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789' // sans I, L, O, 0, 1 (lisibilité)

/** Génère un code lisible : RQ-XXXX-XXXX-XXXX-XXXX (≈ 79 bits d'entropie). */
export function generateCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  const chars = [...bytes].map(b => ALPHABET[b % ALPHABET.length]).join('')
  return `RQ-${chars.slice(0, 4)}-${chars.slice(4, 8)}-${chars.slice(8, 12)}-${chars.slice(12, 16)}`
}

export function randomToken(n = 24) {
  return b64url(crypto.getRandomValues(new Uint8Array(n)))
}

// ---------------------------------------------------------------- cookies

export function parseCookies(header) {
  const out = {}
  for (const part of String(header || '').split(';')) {
    const i = part.indexOf('=')
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim())
  }
  return out
}

export function cookie(name, value, { maxAge, path = '/', secure = true } = {}) {
  let c = `${name}=${encodeURIComponent(value)}; Path=${path}; HttpOnly; SameSite=Lax`
  if (secure) c += '; Secure'
  if (maxAge !== undefined) c += `; Max-Age=${maxAge}`
  return c
}
