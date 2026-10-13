// Génère un code d'accès personnel pour un acheteur.
// Usage : npm run code:new -- "Prénom Nom"   (ou un identifiant de commande)
// Donne le code à l'acheteur, et ajoute la ligne « libellé:empreinte » à la variable ACCESS_CODES sur Vercel.
import { generateCode, normalizeCode, sha256Hex } from '../auth/session.js'

const label = (process.argv.slice(2).join(' ') || '').replace(/[,:\n]/g, ' ').trim()
if (!label) {
  console.error('Usage : npm run code:new -- "Prénom Nom ou n° de commande"')
  process.exit(1)
}
const code = generateCode()
const hash = await sha256Hex(normalizeCode(code))
console.log(`\nCode à transmettre à l'acheteur :\n\n  ${code}\n`)
console.log(
  `Ligne à ajouter dans ACCESS_CODES (Vercel → Settings → Environment Variables) :\n\n  ${label}:${hash}\n`
)
console.log('Le code en clair n’est stocké nulle part : note-le maintenant.')
