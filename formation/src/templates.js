// Gabarits HTML. Fonctions pures : (données) → chaîne HTML.

import { icon } from './icons.js'
import { escapeHtml as e, COPY_KINDS } from './markdown.js'

const FONTS =
  'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800&family=Geist:wght@400..700&family=Geist+Mono:wght@400;500&family=Orbitron:wght@800&display=swap'

export function fmtDate(iso) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

export function fmtMinutes(min) {
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const r = min % 60
  return r ? `${h} h ${String(r).padStart(2, '0')}` : `${h} h`
}

const plural = (n, one, many) => `${n} ${n > 1 ? many : one}`
const tone = slug => `tone-${slug}`

// ---------------------------------------------------------------- layout

export function layout({ site, assets, title, description, page, body, catalog, current = '' }) {
  const nav = [
    ['/', 'Accueil', 'home'],
    ['/bibliotheque/', 'Bibliothèque', 'library'],
    ['/ressources/', 'Scripts & modèles', 'resources'],
  ]
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${e(title ? `${title} · ${site.brand}` : `${site.title} · ${site.brand}`)}</title>
<meta name="description" content="${e(description || site.tagline)}">
<meta name="robots" content="noindex, nofollow">
<meta name="color-scheme" content="light dark">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${FONTS}">
<link rel="stylesheet" href="${assets.css}">
<script src="${assets.theme}"></script>
</head>
<body class="page-${page}">
<a class="skip-link" href="#contenu">Aller au contenu</a>
<div class="reading-progress" aria-hidden="true"><span></span></div>
<header class="topbar">
  <div class="topbar__inner">
    <a class="brand" href="/" aria-label="${e(site.brand)} — accueil"><span class="brand__mark">${icon('fin')}</span><span class="brand__text"><span class="brand__name">${e(site.brand)}</span><span class="brand__sub">${e(site.title)}</span></span></a>
    <nav class="topnav" id="topnav" aria-label="Navigation principale">
      ${nav.map(([href, label, key]) => `<a href="${href}"${current === key ? ' aria-current="page"' : ''}>${label}</a>`).join('\n      ')}
      <a class="topnav__discord" href="${e(site.discord)}" target="_blank" rel="noopener noreferrer">${icon('discord')}Discord</a>
    </nav>
    <div class="topbar__actions">
      <button type="button" class="search-trigger" data-search-open aria-label="Rechercher dans la formation">${icon('search')}<span>Rechercher</span><kbd>Ctrl K</kbd></button>
      <button type="button" class="icon-btn" data-theme-toggle aria-label="Basculer le thème clair ou sombre">${icon('sun', 'icon-sun')}${icon('moon', 'icon-moon')}</button>
      <a class="icon-btn" href="/auth/logout/" aria-label="Se déconnecter" title="Se déconnecter">${icon('logout')}</a>
      <button type="button" class="icon-btn menu-btn" data-menu-toggle aria-controls="topnav" aria-expanded="false" aria-label="Ouvrir le menu">${icon('menu')}</button>
    </div>
  </div>
</header>
<main id="contenu" tabindex="-1">
${body}
</main>
<footer class="footer">
  <div class="wrap footer__row">
    <p class="footer__brand"><span class="brand__mark brand__mark--sm">${icon('fin')}</span><span><b>${e(site.brand)}</b><span>Entre requins uniquement.</span></span></p>
    <p class="footer__note">Contenus pédagogiques réservés aux membres. Ils ne remplacent pas un conseil juridique, fiscal ou financier personnalisé.</p>
  </div>
</footer>
<div class="search" id="search" role="dialog" aria-modal="true" aria-labelledby="search-title" hidden>
  <div class="search__backdrop" data-search-close></div>
  <div class="search__panel">
    <h2 class="sr-only" id="search-title">Rechercher dans la formation</h2>
    <div class="search__bar">${icon('search')}<input type="search" id="search-input" placeholder="Rechercher un chapitre, un script, une règle…" autocomplete="off" spellcheck="false" aria-describedby="search-status"><button type="button" class="search__close" data-search-close aria-label="Fermer la recherche"><kbd>Échap</kbd></button></div>
    <p class="search__status" id="search-status" role="status" aria-live="polite"></p>
    <ul class="search__results" id="search-results" role="listbox" aria-label="Résultats"></ul>
  </div>
</div>
<script type="application/json" id="catalog">${JSON.stringify(catalog).replace(/</g, '\\u003c')}</script>
<script src="${assets.js}" defer></script>
</body>
</html>
`
}

// ---------------------------------------------------------------- pièces

function chapterCard(ch, { showSector = false } = {}) {
  const extras = []
  if (ch.copies.length)
    extras.push(plural(ch.copies.length, 'modèle copiable', 'modèles copiables'))
  else if (ch.hasExercise) extras.push('exercice')
  else if (ch.tasks) extras.push('checklist')
  return `<a class="card chapter-card ${tone(ch.sectorSlug)}" href="${ch.url}" data-chapter="${ch.id}">
  <span class="card__head"><span class="tile">${icon(ch.icon)}</span><span class="card__title">${e(ch.title)}</span></span>
  <span class="card__meta">${showSector ? `<span class="card__sector">${e(ch.sector.short)}</span><span aria-hidden="true">•</span>` : ''}Par ${e(ch.author)} <span aria-hidden="true">•</span> ${fmtDate(ch.updated)}</span>
  <span class="card__foot">${fmtMinutes(ch.minutes)} de lecture${extras.length ? ` · ${extras.join(' · ')}` : ''}</span>
  <span class="status-dot" data-status aria-hidden="true">${icon('check')}</span>
</a>`
}

function progressBar(attr, label) {
  return `<div class="progress" ${attr}><div class="progress__bar"><span style="width:0%"></span></div><p class="progress__label"><span data-progress-text>0 %</span> ${label}</p></div>`
}

function backLink(href, label) {
  return `<a class="back" href="${href}">${icon('chevronLeft')}<span>${label}</span></a>`
}

const countBy = (chapters, fn) => chapters.filter(fn).length

// ---------------------------------------------------------------- tableau de bord

export function dashboardPage({ site, sectors, chapters, copiesCount, recent, first }) {
  const totalMin = chapters.reduce((a, c) => a + c.minutes, 0)
  const exercises = countBy(chapters, c => c.hasExercise || c.tasks)
  const byId = id => chapters.find(c => c.id === id)
  const path = (titleTxt, desc, ids, ic, slug) => {
    const items = ids.map(byId).filter(Boolean)
    const min = items.reduce((a, c) => a + c.minutes, 0)
    return `<article class="path ${tone(slug)}">
  <header class="path__head"><span class="tile">${icon(ic)}</span><div><h3 class="path__title">${titleTxt}</h3><p class="path__meta">${plural(items.length, 'étape', 'étapes')} · ${fmtMinutes(min)}</p></div></header>
  <p class="path__desc">${desc}</p>
  <ol class="path__steps">${items.map(c => `<li><a href="${c.url}" data-chapter="${c.id}"><span class="path__dot" data-status>${icon('check')}</span><span>${e(c.title)}</span></a></li>`).join('')}</ol>
</article>`
  }

  return `<section class="wrap hero-wrap">
  <div class="hero">
    <svg class="hero__fin" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19c0-6 2.5-11.5 8.5-15 1.5 4.5.8 8.6-1 11.6 1.4.9 3.7 2 7.5 3.4H4Z"/></svg>
    <div class="hero__copy">
      <p class="eyebrow eyebrow--cover">${e(site.title)} · ${e(site.brand)}</p>
      <h1 class="display">Construis ton business,<br><em>un chapitre à la fois.</em></h1>
      <p class="hero__lead">${e(site.tagline)} Tout se lit ici, chaque script se copie en un clic, et ta progression te suit d’un chapitre à l’autre.</p>
      <dl class="hero__stats">
        <div><dt>Programmes</dt><dd>${sectors.length}</dd></div>
        <div><dt>Chapitres</dt><dd>${chapters.length}</dd></div>
        <div><dt>Scripts &amp; prompts</dt><dd>${copiesCount}</dd></div>
        <div><dt>De lecture</dt><dd>${fmtMinutes(totalMin)}</dd></div>
      </dl>
    </div>
    <div class="resume" id="resume" data-first="${first.id}">
      <p class="resume__label"><span class="pulse" aria-hidden="true"></span><span data-resume-label>Commencer la formation</span></p>
      <a class="resume__card" href="${first.url}" data-resume-link>
        <span class="resume__sector" data-resume-sector>${e(first.sector.short)}</span>
        <span class="resume__title" data-resume-title>${e(first.title)}</span>
        <span class="resume__cta">Ouvrir le chapitre ${icon('arrowRight')}</span>
      </a>
      ${progressBar('data-progress="all"', 'de la formation terminée')}
    </div>
  </div>
</section>

<section class="wrap block">
  <div class="block__head">
    <div><p class="eyebrow">Tes programmes</p><h2 class="h-section">Quatre secteurs, une méthode complète</h2></div>
    <a class="link-more" href="/bibliotheque/">Toute la bibliothèque ${icon('arrowRight')}</a>
  </div>
  <div class="sector-grid">
    ${sectors
      .map(
        s => `<a class="card sector-card ${tone(s.slug)}" href="/${s.slug}/" data-sector-card="${s.slug}">
      <span class="sector-card__top"><span class="tile tile--lg">${icon(s.icon)}</span><span class="sector-card__arrow">${icon('arrowUpRight')}</span></span>
      <span class="sector-card__title">${e(s.title)}</span>
      <span class="sector-card__desc">${e(s.description)}</span>
      <span class="sector-card__facts"><span>${plural(s.chapters.length, 'chapitre', 'chapitres')}</span><span>${fmtMinutes(s.minutes)}</span>${(n => (n ? `<span>${plural(n, 'modèle', 'modèles')}</span>` : ''))(s.chapters.reduce((a, c) => a + c.copies.length, 0))}</span>
      ${progressBar(`data-progress="${s.slug}"`, 'terminé')}
    </a>`
      )
      .join('\n    ')}
  </div>
</section>

<section class="wrap block">
  <div class="block__head"><div><p class="eyebrow">Parcours guidés</p><h2 class="h-section">Par où commencer selon ta situation</h2></div></div>
  <div class="path-grid">
    ${path('Je pars de zéro', 'Comprendre la méthode, trouver tes premiers prospects et signer un premier client, dans les règles.', ['demarrer/bienvenue', 'smma/mon-parcours-dans-le-smma', 'smma/la-methode-smma-en-4-etapes', 'smma/valider-la-demande-et-creer-ton-offre', 'smma/trouver-tes-premiers-prospects', 'fiscalite/ce-que-la-loi-autorise-selon-ton-age', 'demarrer/plan-30-jours'], 'rocket', 'demarrer')}
    ${path(
      'Je lance ma boutique en ligne',
      'Comprendre le modèle, trouver un produit rentable, construire la boutique et lancer tes premières publicités.',
      [
        'ecommerce/c-est-quoi-l-e-commerce-et-le-dropshipping',
        'ecommerce/le-mental-et-le-budget',
        'ecommerce/vendre-en-ligne-dans-les-regles',
        'ecommerce/trouver-un-produit-les-criteres-et-les-methodes-gratuites',
        'ecommerce/les-chiffres-qui-comptent',
        'ecommerce/creer-sa-boutique-shopify',
        'ecommerce/lancer-et-lire-son-testing-meta',
      ],
      'store',
      'ecommerce'
    )}
    ${path('J’ai déjà des clients', 'Formaliser ton activité, facturer correctement et comprendre ce que tu paies vraiment.', ['fiscalite/choisir-son-statut-juridique', 'fiscalite/micro-entreprise-cotisations-impot-declarations', 'fiscalite/la-tva-sans-prise-de-tete', 'fiscalite/facturation-mentions-et-facture-electronique', 'fiscalite/ca-benefice-tresorerie-revenu-disponible'], 'shield', 'fiscalite')}
    ${path('Je veux structurer et grandir', 'Passer du freelance qui bricole à une agence rentable, avec des process et des automatisations.', ['smma/construire-ses-offres-packs-et-tarifs', 'smma/onboarding-client-et-process-de-production', 'smma/workflows-d-automatisation-avec-n8n', 'smma/calculer-couts-marges-et-tarifs', 'smma/indicateurs-et-croissance-de-l-agence'], 'chart', 'smma')}
  </div>
</section>

<section class="wrap block">
  <div class="block__head"><div><p class="eyebrow">Nouveautés</p><h2 class="h-section">Dernières mises à jour</h2></div></div>
  <div class="card-grid">
    ${recent.map(c => chapterCard(c, { showSector: true })).join('\n    ')}
  </div>
</section>

<section class="wrap block">
  <div class="block__head"><div><p class="eyebrow">Boîte à outils</p><h2 class="h-section">Accès rapide</h2></div></div>
  <div class="quick-grid">
    <a class="quick" href="/ressources/"><span class="tile">${icon('copy')}</span><span><strong>Scripts &amp; modèles</strong><em>${copiesCount} textes prêts à copier</em></span></a>
    ${[
      'demarrer/plan-30-jours',
      'smma/scripts-d-appel-et-objections',
      'fiscalite/facturation-mentions-et-facture-electronique',
      'fiscalite/checklists-et-erreurs-frequentes',
    ]
      .map(byId)
      .filter(Boolean)
      .map(
        c =>
          `<a class="quick ${tone(c.sectorSlug)}" href="${c.url}"><span class="tile">${icon(c.icon)}</span><span><strong>${e(c.title)}</strong><em>${e(c.sector.short)} · ${fmtMinutes(c.minutes)}</em></span></a>`
      )
      .join('\n    ')}
  </div>
  <p class="dash-note">${icon('info')}<span>${exercises} chapitres contiennent un exercice ou une checklist. Ta progression est enregistrée dans ce navigateur, sur cet appareil.</span></p>
</section>`
}

// ---------------------------------------------------------------- bibliothèque

export function libraryPage({ sectors }) {
  return `<section class="wrap page-head">
  ${backLink('/', 'Accueil')}
  <h1 class="h-page">Bibliothèque</h1>
  <p class="lead">Tous les chapitres de la formation, classés par secteur.</p>
  <aside class="notice">
    <span class="tile">${icon('search')}</span>
    <div class="notice__body">
      <p class="notice__title">Retrouve n’importe quelle notion en une seconde</p>
      <p class="notice__text">La recherche parcourt les ${sectors.reduce((a, s) => a + s.chapters.length, 0)} chapitres, titres et paragraphes compris. Essaie « TVA », « objection », « ROAS » ou « acompte ».</p>
      <button type="button" class="notice__cmd" data-search-open>${icon('search')}<span>Rechercher dans la formation</span><kbd>Ctrl K</kbd></button>
    </div>
  </aside>
  <div class="filters" role="group" aria-label="Filtrer la bibliothèque">
    <a class="chip" href="#tout" data-filter-sector="">Tout</a>
    ${sectors.map(s => `<a class="chip" href="#${s.slug}" data-filter-sector="${s.slug}">${e(s.short)}</a>`).join('\n    ')}
    <label class="toggle"><input type="checkbox" data-hide-done><span>Masquer les chapitres terminés</span></label>
  </div>
</section>
${sectors
  .map(
    s => `<section class="wrap block library-sector ${tone(s.slug)}" id="${s.slug}" data-library-sector="${s.slug}">
  <h2 class="library-sector__title"><span class="tile">${icon(s.icon)}</span><a href="/${s.slug}/">${e(s.title)}</a> <span class="count">(${s.chapters.length})</span></h2>
  <div class="card-grid">
    ${s.chapters.map(c => chapterCard(c)).join('\n    ')}
  </div>
</section>`
  )
  .join('\n')}`
}

// ---------------------------------------------------------------- secteur

export function sectorPage({ sector }) {
  const firstCh = sector.chapters[0]
  const copies = sector.chapters.reduce((a, c) => a + c.copies.length, 0)
  const practice = countBy(sector.chapters, c => c.hasExercise || c.tasks)
  const modules = sector.modules.filter(m => m.chapters.length)
  return `<section class="wrap sector-hero ${tone(sector.slug)}">
  ${backLink('/bibliotheque/', 'Bibliothèque')}
  <div class="sector-hero__row">
    <span class="tile tile--xl">${icon(sector.icon)}</span>
    <div class="sector-hero__copy">
      <p class="eyebrow">Programme</p>
      <h1 class="h-page">${e(sector.title)}</h1>
      <p class="lead">${e(sector.description)}</p>
    </div>
  </div>
  <dl class="facts">
    <div><dt>Modules</dt><dd>${modules.length}</dd></div>
    <div><dt>Chapitres</dt><dd>${sector.chapters.length}</dd></div>
    <div><dt>De lecture</dt><dd>${fmtMinutes(sector.minutes)}</dd></div>
    ${copies ? `<div><dt>Scripts &amp; modèles</dt><dd>${copies}</dd></div>` : ''}
    ${practice ? `<div><dt>Exercices &amp; checklists</dt><dd>${practice}</dd></div>` : ''}
  </dl>
  <div class="sector-hero__actions">
    <a class="btn btn--primary" href="${firstCh.url}" data-sector-resume="${sector.slug}"><span>Commencer ce programme</span>${icon('arrowRight')}</a>
    ${progressBar(`data-progress="${sector.slug}"`, 'du programme terminé')}
  </div>
</section>
<div class="wrap modules ${tone(sector.slug)}">
${modules
  .map(
    (m, i) => `<section class="module" id="module-${m.id}">
  <header class="module__head">
    <p class="module__index">Module ${String(i + 1).padStart(2, '0')}</p>
    <h2 class="module__title">${e(m.title)}</h2>
    <p class="module__desc">${e(m.description)}</p>
    <p class="module__meta">${plural(m.chapters.length, 'chapitre', 'chapitres')} · ${fmtMinutes(m.chapters.reduce((a, c) => a + c.minutes, 0))}</p>
  </header>
  <ol class="chapter-list">
    ${m.chapters
      .map(
        c => `<li><a class="chapter-row" href="${c.url}" data-chapter="${c.id}">
      <span class="chapter-row__num">${c.num}</span>
      <span class="chapter-row__body"><span class="chapter-row__title">${e(c.title)}</span><span class="chapter-row__desc">${e(c.description)}</span>
        <span class="chapter-row__tags"><span class="tag">${icon('clock')}${fmtMinutes(c.minutes)}</span>${c.copies.length ? `<span class="tag">${icon('copy')}${plural(c.copies.length, 'modèle', 'modèles')}</span>` : ''}${c.hasExercise ? `<span class="tag">${icon('pen')}Exercice</span>` : ''}${c.tasks ? `<span class="tag">${icon('list')}Checklist</span>` : ''}</span></span>
      <span class="status-dot" data-status aria-hidden="true">${icon('check')}</span>
    </a></li>`
      )
      .join('\n    ')}
  </ol>
</section>`
  )
  .join('\n')}
</div>`
}

// ---------------------------------------------------------------- chapitre

export function chapterPage({ ch, sector, prev, next }) {
  const toc = ch.toc.filter(t => t.depth === 2)
  const tocHtml = toc.length
    ? `<ol>${ch.toc
        .filter(t => t.depth <= 3)
        .map(t => `<li class="toc__d${t.depth}"><a href="#${t.id}">${e(t.text)}</a></li>`)
        .join('')}</ol>`
    : ''
  const source =
    ch.origin === 'livre'
      ? `<span class="meta-item">${icon('book')}${e(ch.source)}</span>`
      : ch.origin === 'mixte'
        ? `<span class="meta-item">${icon('book')}${e(ch.source)}</span><span class="meta-item meta-item--plus">${icon('sparkles')}Enrichi</span>`
        : `<span class="meta-item meta-item--plus">${icon('sparkles')}${e(ch.source || 'Contenu exclusif')}</span>`

  return `<div class="chapter-layout ${tone(sector.slug)}">
  <aside class="chapter-nav" id="chapter-nav" aria-label="Chapitres du programme">
    <div class="chapter-nav__inner">
      <a class="chapter-nav__sector" href="/${sector.slug}/"><span class="tile tile--sm">${icon(sector.icon)}</span><span>${e(sector.title)}</span></a>
      ${progressBar(`data-progress="${sector.slug}"`, 'terminé')}
      ${sector.modules
        .filter(m => m.chapters.length)
        .map(
          m => `<p class="chapter-nav__module">${e(m.title)}</p>
      <ol>${m.chapters.map(c => `<li><a href="${c.url}" data-chapter="${c.id}"${c.id === ch.id ? ' aria-current="page"' : ''}><span class="chapter-nav__num">${c.num}</span><span class="chapter-nav__label">${e(c.title)}</span><span class="status-dot status-dot--sm" data-status aria-hidden="true">${icon('check')}</span></a></li>`).join('')}</ol>`
        )
        .join('\n      ')}
    </div>
  </aside>

  <article class="chapter" data-chapter-id="${ch.id}">
    <nav class="crumbs" aria-label="Fil d'Ariane"><a href="/bibliotheque/">Bibliothèque</a>${icon('chevronRight')}<a href="/${sector.slug}/">${e(sector.short)}</a>${icon('chevronRight')}<a href="/${sector.slug}/#module-${ch.module.id}">${e(ch.module.title)}</a></nav>
    <button type="button" class="btn btn--ghost chapter-nav-toggle" data-chapter-nav-toggle aria-controls="chapter-nav" aria-expanded="false">${icon('list')}<span>Chapitres du programme</span></button>
    <header class="chapter__head">
      <p class="chapter__kicker"><span class="tile tile--sm">${icon(ch.icon)}</span><span>Chapitre ${ch.num}</span><span aria-hidden="true">·</span><span>${e(ch.module.title)}</span></p>
      <h1 class="chapter__title">${e(ch.title)}</h1>
      <p class="chapter__lead">${e(ch.description)}</p>
      <div class="chapter__meta">
        <span class="meta-item">${icon('clock')}${fmtMinutes(ch.minutes)} de lecture</span>
        ${ch.copies.length ? `<span class="meta-item">${icon('copy')}${plural(ch.copies.length, 'modèle copiable', 'modèles copiables')}</span>` : ''}
        <span class="meta-item">${icon('calendar')}Mis à jour le ${fmtDate(ch.updated)}</span>
        ${source}
        ${ch.verified ? `<span class="meta-item meta-item--ok">${icon('shield')}Règles vérifiées le ${fmtDate(ch.verified)}</span>` : ''}
      </div>
    </header>
    ${
      toc.length > 1
        ? `<details class="toc-inline"><summary><span class="toc-inline__label">${icon('list')}Au programme de ce chapitre</span><span class="toc-inline__count">${plural(toc.length, 'partie', 'parties')}</span></summary><nav aria-label="Sommaire du chapitre"><ol>${toc.map(t => `<li><a href="#${t.id}">${e(t.text)}</a></li>`).join('')}</ol></nav></details>`
        : ''
    }
    <div class="prose">
${ch.html}
    </div>
    <section class="chapter__done" aria-label="Progression">
      <span class="tile tile--lg">${icon('checkCircle')}</span>
      <div>
        <p class="chapter__done-title">Chapitre terminé ?</p>
        <p class="chapter__done-text" data-done-text>Marque-le pour suivre ta progression et retrouver ta place la prochaine fois.</p>
      </div>
      <button type="button" class="btn btn--primary" data-mark-done aria-pressed="false">${icon('check')}<span>Marquer comme terminé</span></button>
    </section>
    <nav class="pager" aria-label="Chapitres précédent et suivant">
      ${prev ? `<a class="pager__link" href="${prev.url}" rel="prev"><span class="pager__dir">${icon('arrowLeft')}Précédent</span><span class="pager__title">${e(prev.title)}</span></a>` : '<span></span>'}
      ${next ? `<a class="pager__link pager__link--next" href="${next.url}" rel="next"><span class="pager__dir">Suivant${icon('arrowRight')}</span><span class="pager__title">${e(next.title)}</span></a>` : `<a class="pager__link pager__link--next" href="/${sector.slug}/"><span class="pager__dir">Fin du programme${icon('arrowRight')}</span><span class="pager__title">Revenir à ${e(sector.short)}</span></a>`}
    </nav>
  </article>

  <aside class="toc" aria-label="Sur cette page">
    ${tocHtml ? `<div class="toc__inner"><p class="toc__title">Sur cette page</p><nav>${tocHtml}</nav></div>` : ''}
  </aside>
</div>`
}

// ---------------------------------------------------------------- ressources

export function resourcesPage({ sectors }) {
  const kinds = new Set()
  sectors.forEach(s => s.chapters.forEach(c => c.copies.forEach(x => kinds.add(x.kind))))
  const total = sectors.reduce((a, s) => a + s.chapters.reduce((b, c) => b + c.copies.length, 0), 0)
  const blocks = sectors
    .map(s => {
      const chs = s.chapters.filter(c => c.copies.length)
      if (!chs.length) return ''
      return `<section class="wrap block ${tone(s.slug)}" data-res-sector>
  <h2 class="library-sector__title"><span class="tile">${icon(s.icon)}</span>${e(s.title)}</h2>
  ${chs
    .map(
      c => `<div class="res-chapter" data-res-chapter>
    <h3 class="res-chapter__title"><a href="${c.url}">${e(c.title)}</a><span class="count">${c.copies.length}</span></h3>
    <div class="res-grid">
    ${c.copies
      .map(
        x => `<figure class="copy-block" data-kind="${e(x.kind)}" data-res-item id="r-${c.sectorSlug}-${c.slug}-${x.id}">
      <figcaption class="copy-block__head"><span class="copy-block__badge">${COPY_KINDS[x.kind] || 'Modèle'}</span><span class="copy-block__title">${e(x.title)}</span><button type="button" class="copy-btn" data-copy="#r-${c.sectorSlug}-${c.slug}-${x.id} code">${icon('copy')}<span>Copier</span></button></figcaption>
      <pre><code>${e(x.text).replace(/\[([^\]\n]{1,60})\]/g, '<mark class="ph">[$1]</mark>')}</code></pre>
      <a class="res-src" href="${c.url}#${x.id}">Voir dans le chapitre ${icon('arrowRight')}</a>
    </figure>`
      )
      .join('\n    ')}
    </div>
  </div>`
    )
    .join('\n  ')}
</section>`
    })
    .join('\n')

  return `<section class="wrap page-head">
  ${backLink('/', 'Accueil')}
  <h1 class="h-page">Scripts &amp; modèles</h1>
  <p class="lead">Les ${total} textes prêts à l’emploi de la formation : scripts d’appel, messages, prompts, clauses et modèles. Les zones <mark class="ph">[entre crochets]</mark> sont à personnaliser avant envoi.</p>
  <div class="filters" role="group" aria-label="Filtrer par type">
    <button type="button" class="chip" data-filter-kind="" aria-pressed="true">Tout</button>
    ${[...kinds].map(k => `<button type="button" class="chip" data-filter-kind="${k}" aria-pressed="false">${COPY_KINDS[k] || k}</button>`).join('\n    ')}
  </div>
</section>
${blocks}`
}

export function notFoundPage() {
  return `<section class="wrap page-head empty">
  <p class="eyebrow">Erreur 404</p>
  <h1 class="h-page">Cette page n’existe pas.</h1>
  <p class="lead">Le lien est peut-être ancien, ou le chapitre a été renommé. Utilise la recherche ou repars de la bibliothèque.</p>
  <p class="empty__actions"><a class="btn btn--primary" href="/bibliotheque/">${icon('book')}<span>Ouvrir la bibliothèque</span></a> <button type="button" class="btn btn--ghost" data-search-open>${icon('search')}<span>Rechercher</span></button></p>
</section>`
}
