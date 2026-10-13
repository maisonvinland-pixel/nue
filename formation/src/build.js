// Générateur statique de l'espace membre.
// Lit content/<secteur>/*.md, produit dist/ (HTML + index de recherche + assets).
// Usage : node src/build.js

import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import site from '../site.config.js'
import { renderMarkdown, sectionsForSearch } from './markdown.js'
import { icon, iconNames } from './icons.js'
import * as T from './templates.js'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const CONTENT = join(ROOT, 'content')
const DIST = join(ROOT, 'dist')
const DASHBOARD_LINKS = [
  'demarrer/bienvenue',
  'demarrer/plan-30-jours',
  'smma/mon-parcours-dans-le-smma',
  'smma/la-methode-smma-en-4-etapes',
  'smma/valider-la-demande-et-creer-ton-offre',
  'smma/trouver-tes-premiers-prospects',
  'fiscalite/ce-que-la-loi-autorise-selon-ton-age',
  'fiscalite/choisir-son-statut-juridique',
  'fiscalite/micro-entreprise-cotisations-impot-declarations',
  'fiscalite/la-tva-sans-prise-de-tete',
  'fiscalite/facturation-mentions-et-facture-electronique',
  'fiscalite/ca-benefice-tresorerie-revenu-disponible',
  'smma/construire-ses-offres-packs-et-tarifs',
  'smma/onboarding-client-et-process-de-production',
  'smma/workflows-d-automatisation-avec-n8n',
  'smma/calculer-couts-marges-et-tarifs',
  'smma/indicateurs-et-croissance-de-l-agence',
  'smma/scripts-d-appel-et-objections',
  'fiscalite/checklists-et-erreurs-frequentes',
]

// ---------------------------------------------------------------- frontmatter

export function parseFrontmatter(src, file) {
  const m = /^---\n([\s\S]*?)\n---\n?/.exec(src)
  if (!m) throw new Error(`${file} : frontmatter manquant (bloc --- … --- en tête de fichier)`)
  const data = {}
  for (const line of m[1].split('\n')) {
    if (!line.trim() || line.trim().startsWith('#')) continue
    const kv = /^([a-zA-Z_]+):\s*(.*)$/.exec(line)
    if (!kv) throw new Error(`${file} : ligne de frontmatter invalide « ${line} »`)
    let v = kv[2].trim()
    if (/^".*"$/.test(v) || /^'.*'$/.test(v)) v = v.slice(1, -1)
    data[kv[1]] = v
  }
  return { data, body: src.slice(m[0].length) }
}

// ---------------------------------------------------------------- chargement

function loadChapters() {
  const sectors = []
  for (const conf of site.sectors) {
    const dir = join(CONTENT, conf.slug)
    if (!existsSync(dir)) throw new Error(`Dossier manquant : content/${conf.slug}`)
    const files = readdirSync(dir)
      .filter(f => f.endsWith('.md'))
      .sort()
    const sector = {
      ...conf,
      chapters: [],
      modules: conf.modules.map(m => ({ ...m, chapters: [] })),
    }

    for (const file of files) {
      const fm = /^(\d+)-(.+)\.md$/.exec(file)
      if (!fm) throw new Error(`content/${conf.slug}/${file} : le nom doit être « NN-slug.md »`)
      const src = readFileSync(join(dir, file), 'utf8')
      const { data, body } = parseFrontmatter(src, `${conf.slug}/${file}`)
      for (const k of ['title', 'description', 'module', 'updated']) {
        if (!data[k]) throw new Error(`${conf.slug}/${file} : champ « ${k} » manquant`)
      }
      const mod = sector.modules.find(m => m.id === data.module)
      if (!mod) throw new Error(`${conf.slug}/${file} : module « ${data.module} » inconnu`)
      if (!/^\d{4}-\d{2}-\d{2}$/.test(data.updated))
        throw new Error(`${conf.slug}/${file} : date « updated » au format AAAA-MM-JJ`)
      if (data.icon && !iconNames.includes(data.icon))
        throw new Error(`${conf.slug}/${file} : icône « ${data.icon} » inconnue`)
      const slug = fm[2]
      const ch = {
        id: `${conf.slug}/${slug}`,
        slug,
        sectorSlug: conf.slug,
        order: Number(fm[1]),
        url: `/${conf.slug}/${slug}/`,
        title: data.title,
        description: data.description,
        icon: data.icon || conf.icon,
        type: data.type || 'Chapitre',
        updated: data.updated,
        verified: data.verified || '',
        origin: data.origin || 'exclusif', // livre | mixte | exclusif
        source: data.source || '',
        author: site.author,
        body,
        file: `${conf.slug}/${file}`,
        module: mod,
        sector,
      }
      sector.chapters.push(ch)
      mod.chapters.push(ch)
    }
    // ordre de lecture : par module, puis par numéro de fichier
    sector.chapters = sector.modules.flatMap(m => m.chapters.sort((a, b) => a.order - b.order))
    sector.chapters.forEach((c, i) => (c.num = String(i + 1).padStart(2, '0')))
    sectors.push(sector)
  }
  return sectors
}

// ---------------------------------------------------------------- build

export function build({ quiet = false } = {}) {
  const sectors = loadChapters()
  const chapters = sectors.flatMap(s => s.chapters)
  const byId = new Map(chapters.map(c => [c.id, c]))

  const pendingAnchors = []
  for (const ch of chapters) {
    const resolveLink = ref => {
      const [id, anchor] = ref.split('#')
      const target = byId.get(id)
      if (!target) throw new Error(`${ch.file} : lien interne cassé « @${ref} »`)
      if (anchor) pendingAnchors.push({ from: ch.file, target, anchor })
      return target.url + (anchor ? `#${anchor}` : '')
    }
    const r = renderMarkdown(ch.body, { resolveLink, icon, chapterId: ch.file })
    Object.assign(ch, r)
    ch.ids = new Set(r.toc.map(t => t.id))
    ch.allIds = new Set([...r.html.matchAll(/ id="([^"]+)"/g)].map(m => m[1]))
    ch.minutes = Math.max(2, Math.round(r.words / 210))
    ch.hasExercise = r.html.includes('class="exercise"')
  }
  for (const { from, target, anchor } of pendingAnchors) {
    if (!target.allIds.has(anchor))
      throw new Error(`${from} : ancre « #${anchor} » introuvable dans ${target.file}`)
  }
  for (const id of DASHBOARD_LINKS)
    if (!byId.has(id)) throw new Error(`Tableau de bord : chapitre « ${id} » introuvable`)
  for (const s of sectors) s.minutes = s.chapters.reduce((a, c) => a + c.minutes, 0)

  // ---- sortie
  rmSync(DIST, { recursive: true, force: true })
  mkdirSync(join(DIST, 'assets'), { recursive: true })
  mkdirSync(join(DIST, 'data'), { recursive: true })

  const assets = {}
  for (const [key, file] of [
    ['css', 'styles.css'],
    ['js', 'app.js'],
    ['theme', 'theme.js'],
  ]) {
    const src = readFileSync(join(ROOT, 'assets', file), 'utf8')
    const hash = createHash('sha256').update(src).digest('hex').slice(0, 10)
    const name = file.replace('.', `.${hash}.`)
    writeFileSync(join(DIST, 'assets', name), src)
    assets[key] = `/assets/${name}`
  }
  writeFileSync(
    join(DIST, 'assets', 'favicon.svg'),
    readFileSync(join(ROOT, 'assets', 'favicon.svg'))
  )
  writeFileSync(join(DIST, 'robots.txt'), 'User-agent: *\nDisallow: /\n')

  const catalog = {
    sectors: sectors.map(s => ({
      slug: s.slug,
      title: s.title,
      short: s.short,
      ids: s.chapters.map(c => c.id),
    })),
    chapters: Object.fromEntries(
      chapters.map(c => [c.id, { t: c.title, u: c.url, s: c.sectorSlug, n: c.num, k: c.tasks }])
    ),
  }

  const write = (path, html) => {
    const full = join(DIST, path)
    mkdirSync(dirname(full), { recursive: true })
    writeFileSync(full, html)
  }
  const page = (path, opts) => write(path, T.layout({ site, assets, catalog, ...opts }))

  const recent = [...chapters]
    .sort((a, b) => b.updated.localeCompare(a.updated) || a.order - b.order)
    .slice(0, 6)
  const copiesCount = chapters.reduce((a, c) => a + c.copies.length, 0)

  page('index.html', {
    page: 'home',
    current: 'home',
    body: T.dashboardPage({ site, sectors, chapters, copiesCount, recent, first: chapters[0] }),
  })
  page('bibliotheque/index.html', {
    page: 'library',
    current: 'library',
    title: 'Bibliothèque',
    body: T.libraryPage({ sectors }),
  })
  page('ressources/index.html', {
    page: 'resources',
    current: 'resources',
    title: 'Scripts & modèles',
    body: T.resourcesPage({ sectors }),
  })
  page('404.html', { page: 'notfound', title: 'Page introuvable', body: T.notFoundPage() })

  for (const s of sectors) {
    page(`${s.slug}/index.html`, {
      page: 'sector',
      title: s.title,
      description: s.description,
      body: T.sectorPage({ sector: s }),
    })
    s.chapters.forEach((ch, i) => {
      page(`${s.slug}/${ch.slug}/index.html`, {
        page: 'chapter',
        title: ch.title,
        description: ch.description,
        body: T.chapterPage({ ch, sector: s, prev: s.chapters[i - 1], next: s.chapters[i + 1] }),
      })
    })
  }

  // ---- index de recherche (protégé comme le reste par le middleware)
  const search = []
  for (const ch of chapters) {
    search.push({ u: ch.url, t: ch.title, s: ch.sector.short, h: '', x: ch.description })
    for (const sec of sectionsForSearch(ch.html)) {
      if (!sec.heading) continue
      search.push({
        u: `${ch.url}#${sec.id}`,
        t: ch.title,
        s: ch.sector.short,
        h: sec.heading,
        x: sec.text.slice(0, 1200),
      })
    }
  }
  writeFileSync(join(DIST, 'data', 'search.json'), JSON.stringify(search))

  const stats = {
    sectors: sectors.length,
    chapters: chapters.length,
    copies: copiesCount,
    words: chapters.reduce((a, c) => a + c.words, 0),
    searchEntries: search.length,
  }
  if (!quiet) {
    console.log(
      `✓ ${stats.chapters} chapitres · ${stats.sectors} secteurs · ${stats.copies} modèles copiables · ${stats.words} mots · ${stats.searchEntries} entrées de recherche`
    )
    for (const s of sectors)
      console.log(
        `  ${s.slug.padEnd(10)} ${String(s.chapters.length).padStart(2)} chapitres · ${T.fmtMinutes(s.minutes)}`
      )
  }
  return { sectors, chapters, stats }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    build()
  } catch (err) {
    console.error(`✗ Build interrompu : ${err.message}`)
    process.exit(1)
  }
}
