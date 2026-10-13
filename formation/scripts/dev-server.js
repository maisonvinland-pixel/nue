// Serveur de développement : sert dist/ en appliquant exactement le même middleware que sur Vercel.
// Usage : npm run dev   (variables lues dans .env.local si présent)
import { createServer } from 'node:http'
import { readFileSync, existsSync, statSync } from 'node:fs'
import { join, extname, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { handle } from '../auth/handler.js'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const DIST = join(ROOT, 'dist')
const PORT = Number(process.env.PORT || 4321)

const envFile = join(ROOT, '.env.local')
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, 'utf8').split('\n')) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line)
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
}
process.env.AUTH_INSECURE_COOKIES ??= '1' // http://localhost : cookies sans l'attribut Secure

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
}

function resolveFile(pathname) {
  const clean = decodeURIComponent(pathname).replace(/\.\.+/g, '')
  const candidates = [
    join(DIST, clean),
    join(DIST, clean, 'index.html'),
    join(DIST, clean + '.html'),
  ]
  return candidates.find(p => p.startsWith(DIST) && existsSync(p) && statSync(p).isFile())
}

createServer(async (req, res) => {
  const url = `http://${req.headers.host}${req.url}`
  const chunks = []
  for await (const c of req) chunks.push(c)
  const request = new Request(url, {
    method: req.method,
    headers: req.headers,
    body: ['GET', 'HEAD'].includes(req.method) ? undefined : Buffer.concat(chunks),
  })
  const response = await handle(request, process.env)
  if (response) {
    res.statusCode = response.status
    response.headers.forEach((v, k) => {
      if (k !== 'set-cookie') res.setHeader(k, v)
    })
    const cookies = response.headers.getSetCookie?.() || []
    if (cookies.length) res.setHeader('set-cookie', cookies)
    res.end(Buffer.from(await response.arrayBuffer()))
    return
  }
  const pathname = new URL(url).pathname
  // trailingSlash: true (comme sur Vercel)
  if (!pathname.endsWith('/') && !extname(pathname) && resolveFile(pathname)) {
    res.writeHead(308, { location: pathname + '/' })
    return res.end()
  }
  const file = resolveFile(pathname)
  if (!file) {
    res.writeHead(404, { 'content-type': TYPES['.html'] })
    return res.end(readFileSync(join(DIST, '404.html')))
  }
  res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream' })
  res.end(readFileSync(file))
}).listen(PORT, () => console.log(`Espace membre : http://localhost:${PORT}`))
