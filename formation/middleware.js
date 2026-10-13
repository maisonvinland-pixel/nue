// Middleware Vercel (Routing Middleware) : s'exécute avant chaque requête, cache et fichiers statiques compris.
// Toute la logique est dans auth/handler.js (testée localement par scripts/dev-server.js et tests/).
import { next } from '@vercel/functions'
import { handle } from './auth/handler.js'

export const config = { runtime: 'nodejs' }

export default async function middleware(request) {
  const response = await handle(request, process.env)
  return response ?? next()
}
