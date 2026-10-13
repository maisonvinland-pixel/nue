// Vérifie l'intégrité du site généré : pages, liens internes, ancres, blocs, index de recherche.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from '../src/build.js'
import { renderMarkdown } from '../src/markdown.js'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const DIST = join(ROOT, 'dist')
const { chapters, sectors } = build({ quiet: true })

function htmlFiles(dir) {
  return readdirSync(dir).flatMap(f => {
    const p = join(dir, f)
    return statSync(p).isDirectory() ? htmlFiles(p) : p.endsWith('.html') ? [p] : []
  })
}
const files = htmlFiles(DIST)
const pageOf = file =>
  '/' +
  file
    .slice(DIST.length + 1)
    .replace(/index\.html$/, '')
    .replace(/\\/g, '/')
const pages = new Map(files.map(f => [pageOf(f), readFileSync(f, 'utf8')]))

test('chaque chapitre a sa page, et chaque secteur la sienne', () => {
  assert.ok(chapters.length >= 40, `${chapters.length} chapitres`)
  for (const ch of chapters) assert.ok(pages.has(ch.url), `page manquante : ${ch.url}`)
  for (const s of sectors) assert.ok(pages.has(`/${s.slug}/`), `secteur manquant : ${s.slug}`)
  for (const p of ['/', '/bibliotheque/', '/ressources/']) assert.ok(pages.has(p), p)
})

test('tous les liens internes pointent vers une page et une ancre existantes', () => {
  const broken = []
  for (const [from, html] of pages) {
    for (const [, href] of html.matchAll(/href="(\/[^"]*)"/g)) {
      if (href.startsWith('/assets/') || href.startsWith('/auth/')) {
        if (href.startsWith('/assets/') && !existsSync(join(DIST, href)))
          broken.push(`${from} → ${href}`)
        continue
      }
      const [path, anchor] = href.split('#')
      const target = pages.get(path)
      if (!target) broken.push(`${from} → ${href}`)
      else if (anchor && !target.includes(`id="${anchor}"`))
        broken.push(`${from} → ${href} (ancre)`)
    }
    for (const [, anchor] of html.matchAll(/href="#([^"]+)"/g)) {
      if (
        !html.includes(`id="${anchor}"`) &&
        !['tout'].includes(anchor) &&
        !sectors.some(s => s.slug === anchor)
      )
        broken.push(`${from} → #${anchor}`)
    }
  }
  assert.deepEqual(broken, [])
})

test('aucune syntaxe non interprétée ne fuit dans les pages', () => {
  for (const ch of chapters) {
    const html = pages.get(ch.url)
    assert.ok(!/\[![A-Z]+\]/.test(html), `${ch.file} : encadré non interprété`)
    assert.ok(!/^:::/m.test(html), `${ch.file} : bloc ::: non interprété`)
    assert.ok(!html.includes('href="@'), `${ch.file} : lien interne non résolu`)
  }
})

test('chaque bouton Copier cible un bloc existant', () => {
  for (const [from, html] of pages) {
    for (const [, sel] of html.matchAll(/data-copy="#([^ "]+) code"/g)) {
      assert.ok(html.includes(`id="${sel}"`), `${from} : cible de copie #${sel} absente`)
    }
  }
})

test('les chapitres sont complets : sommaire, récapitulatif, description', () => {
  for (const ch of chapters) {
    assert.ok(ch.description.length > 30, `${ch.file} : description trop courte`)
    if (ch.words > 500) assert.ok(ch.toc.length >= 2, `${ch.file} : sommaire insuffisant`)
  }
  const withRecap = chapters.filter(c => c.html.includes('class="recap"')).length
  assert.ok(withRecap >= chapters.length - 3, `récapitulatifs : ${withRecap}/${chapters.length}`)
})

test('les chapitres de fiscalité affichent une date de vérification', () => {
  for (const ch of chapters.filter(c => c.sectorSlug === 'fiscalite')) {
    assert.match(ch.verified, /^\d{4}-\d{2}-\d{2}$/, `${ch.file} sans date de vérification`)
    assert.ok(pages.get(ch.url).includes('Règles vérifiées le'), ch.file)
  }
})

test("l'index de recherche couvre chaque chapitre", () => {
  const index = JSON.parse(readFileSync(join(DIST, 'data', 'search.json'), 'utf8'))
  for (const ch of chapters)
    assert.ok(
      index.some(e => e.u === ch.url),
      `${ch.url} absent de la recherche`
    )
  assert.ok(
    index.some(e => /293 B/.test(e.x)),
    'la mention 293 B doit être trouvable'
  )
})

test('le moteur Markdown gère encadrés, blocs copiables, étapes et cases à cocher', () => {
  const r = renderMarkdown(
    [
      '## Titre',
      '> [!ASTUCE] Mon titre',
      '> Texte',
      '',
      '```copy title="Script" kind="script"',
      'Bonjour [prénom]',
      '```',
      '',
      ':::steps',
      '1. **Un** — deux',
      ':::',
      '',
      '- [ ] tâche',
    ].join('\n'),
    { resolveLink: () => '/x/', icon: () => '', chapterId: 'test' }
  )
  assert.match(r.html, /class="callout callout--astuce"/)
  assert.match(r.html, /<span>Mon titre<\/span>/)
  assert.match(r.html, /<mark class="ph">\[prénom\]<\/mark>/)
  assert.match(r.html, /class="steps"/)
  assert.match(r.html, /class="task" data-task="1"/)
  assert.equal(r.copies.length, 1)
  assert.equal(r.copies[0].text, 'Bonjour [prénom]')
})

test('le contenu HTML des blocs copiables est échappé', () => {
  const r = renderMarkdown('```copy title="x"\n<script>alert(1)</script>\n```', {
    resolveLink: () => '/',
    icon: () => '',
    chapterId: 't',
  })
  assert.ok(!r.html.includes('<script>'))
})
