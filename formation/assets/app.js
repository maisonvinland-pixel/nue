/* 100% REQUIN — Espace membre : interactions côté client.
   Aucune dépendance. Toutes les fonctionnalités dégradent proprement sans JavaScript
   (le contenu reste entièrement lisible). */
;(() => {
  'use strict'

  const $ = (s, el = document) => el.querySelector(s)
  const $$ = (s, el = document) => [...el.querySelectorAll(s)]
  const catalog = JSON.parse($('#catalog')?.textContent || '{"sectors":[],"chapters":{}}')
  const order = catalog.sectors.flatMap(s => s.ids)

  // ------------------------------------------------------------ stockage sûr
  const ls = {
    get(k) {
      try {
        return localStorage.getItem(k)
      } catch (_) {
        return null
      }
    },
    set(k, v) {
      try {
        localStorage.setItem(k, v)
        return true
      } catch (_) {
        return false
      }
    },
  }

  // ------------------------------------------------------------ progression
  const progress = {
    uid: ls.get('rq:uid') || 'local',
    data: null,
    key() {
      return `rq:progress:${this.uid}`
    },
    load() {
      let d = null
      try {
        d = JSON.parse(ls.get(this.key()) || 'null')
      } catch (_) {}
      this.data = Object.assign({ done: {}, visited: {}, tasks: {}, last: null }, d || {})
    },
    save() {
      ls.set(this.key(), JSON.stringify(this.data))
    },
    isDone(id) {
      return Boolean(this.data.done[id])
    },
    setDone(id, v) {
      if (v) this.data.done[id] = Date.now()
      else delete this.data.done[id]
      this.save()
    },
    visit(id) {
      this.data.visited[id] = Date.now()
      this.data.last = id
      this.save()
    },
  }
  progress.load()

  function nextUndone(fromId) {
    const start = Math.max(0, order.indexOf(fromId))
    for (let i = 0; i < order.length; i++) {
      const id = order[(start + i) % order.length]
      if (!progress.isDone(id)) return id
    }
    return null
  }

  function renderProgress() {
    $$('[data-chapter]').forEach(el =>
      el.classList.toggle('is-done', progress.isDone(el.dataset.chapter))
    )

    $$('[data-progress]').forEach(el => {
      const key = el.dataset.progress
      const ids = key === 'all' ? order : catalog.sectors.find(s => s.slug === key)?.ids || []
      const done = ids.filter(id => progress.isDone(id)).length
      const pct = ids.length ? Math.round((done / ids.length) * 100) : 0
      const bar = $('.progress__bar span', el)
      if (bar) bar.style.width = pct + '%'
      const txt = $('[data-progress-text]', el)
      if (txt) txt.textContent = `${pct} % (${done}/${ids.length})`
    })

    const resume = $('#resume')
    if (resume) {
      const last =
        progress.data.last && catalog.chapters[progress.data.last] ? progress.data.last : null
      const target = last ? (progress.isDone(last) ? nextUndone(last) : last) : null
      const allDone = order.length && order.every(id => progress.isDone(id))
      if (target || allDone) {
        const id = target || order[0]
        const ch = catalog.chapters[id]
        const sec = catalog.sectors.find(s => s.slug === ch.s)
        $('[data-resume-label]', resume).textContent = allDone
          ? 'Formation terminée — tu peux tout revoir'
          : target === last
            ? 'Reprendre là où tu t’es arrêté'
            : 'Prochain chapitre conseillé'
        $('[data-resume-link]', resume).href = ch.u
        $('[data-resume-title]', resume).textContent = ch.t
        $('[data-resume-sector]', resume).textContent = `${sec ? sec.short : ''} · Chapitre ${ch.n}`
      }
    }

    $$('[data-sector-resume]').forEach(btn => {
      const sec = catalog.sectors.find(s => s.slug === btn.dataset.sectorResume)
      if (!sec) return
      const started = sec.ids.some(id => progress.isDone(id) || progress.data.visited[id])
      const target = sec.ids.find(id => !progress.isDone(id))
      const label = $('span', btn)
      if (!target) {
        label.textContent = 'Revoir ce programme'
        btn.href = catalog.chapters[sec.ids[0]].u
      } else if (started) {
        label.textContent = 'Reprendre ce programme'
        btn.href = catalog.chapters[target].u
      }
    })
  }

  // ------------------------------------------------------------ page chapitre
  const article = $('[data-chapter-id]')
  if (article) {
    const id = article.dataset.chapterId
    progress.visit(id)

    const btn = $('[data-mark-done]')
    const doneText = $('[data-done-text]')
    const syncBtn = () => {
      const d = progress.isDone(id)
      btn.setAttribute('aria-pressed', String(d))
      $('span', btn).textContent = d ? 'Terminé' : 'Marquer comme terminé'
      doneText.textContent = d
        ? 'Bien joué. Le chapitre est compté dans ta progression — tu peux annuler en cliquant à nouveau.'
        : 'Marque-le pour suivre ta progression et retrouver ta place la prochaine fois.'
    }
    btn?.addEventListener('click', () => {
      progress.setDone(id, !progress.isDone(id))
      syncBtn()
      renderProgress()
    })
    if (btn) syncBtn()

    // cases à cocher persistées
    const tasks = (progress.data.tasks[id] = progress.data.tasks[id] || {})
    $$('.prose input.task').forEach(cb => {
      const n = cb.dataset.task
      if (n in tasks) cb.checked = tasks[n]
      cb.addEventListener('change', () => {
        tasks[n] = cb.checked
        progress.save()
      })
    })

    // sommaire actif
    const links = $$('.toc a, .toc-inline a')
    const heads = $$('.prose h2[id], .prose h3[id]')
    if ('IntersectionObserver' in window && heads.length && links.length) {
      let current = null
      const io = new IntersectionObserver(
        entries => {
          entries.forEach(en => {
            if (en.isIntersecting) current = en.target.id
          })
          if (current)
            links.forEach(a =>
              a.classList.toggle('is-active', a.getAttribute('href') === '#' + current)
            )
        },
        { rootMargin: '-90px 0px -70% 0px' }
      )
      heads.forEach(h => io.observe(h))
    }
    $$('.toc-inline a').forEach(a =>
      a.addEventListener('click', () => a.closest('details')?.removeAttribute('open'))
    )

    // barre de lecture
    const bar = $('.reading-progress span')
    const onScroll = () => {
      const r = article.getBoundingClientRect()
      const total = r.height - window.innerHeight * 0.6
      const pct = Math.min(100, Math.max(0, (-r.top / Math.max(total, 1)) * 100))
      bar.style.width = pct + '%'
    }
    if (bar) {
      window.addEventListener('scroll', onScroll, { passive: true })
      onScroll()
    }

    // menu latéral : le chapitre courant reste visible (bureau)
    const nav = $('#chapter-nav')
    const currentLink = nav && $('a[aria-current]', nav)
    const navInner = nav && $('.chapter-nav__inner', nav)
    if (currentLink && navInner && navInner.scrollHeight > navInner.clientHeight) {
      navInner.scrollTop =
        currentLink.offsetTop - navInner.clientHeight / 2 + currentLink.offsetHeight / 2
    }

    // tiroir des chapitres (mobile)
    const toggle = $('[data-chapter-nav-toggle]')
    const closeNav = () => {
      nav.classList.remove('is-open')
      toggle.setAttribute('aria-expanded', 'false')
    }
    toggle?.addEventListener('click', e => {
      e.stopPropagation()
      const open = !nav.classList.contains('is-open')
      nav.classList.toggle('is-open', open)
      toggle.setAttribute('aria-expanded', String(open))
      if (open) $('a[aria-current]', nav)?.scrollIntoView({ block: 'center' })
    })
    document.addEventListener('click', e => {
      if (nav?.classList.contains('is-open') && !nav.contains(e.target)) closeNav()
    })
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && nav?.classList.contains('is-open')) closeNav()
    })
  }

  // ------------------------------------------------------------ tableaux larges (mobile)
  const markScrollable = () =>
    $$('.table-wrap').forEach(w => {
      const can = w.scrollWidth > w.clientWidth + 4
      w.classList.toggle('can-scroll', can)
      if (can && !w.previousElementSibling?.classList.contains('table-hint')) {
        const hint = document.createElement('p')
        hint.className = 'table-hint is-visible'
        hint.textContent = 'Tableau large : fais-le défiler horizontalement →'
        w.before(hint)
      }
      if (!can && w.previousElementSibling?.classList.contains('table-hint'))
        w.previousElementSibling.remove()
    })
  markScrollable()
  window.addEventListener('resize', () => requestAnimationFrame(markScrollable), { passive: true })

  // ------------------------------------------------------------ copie
  const live = document.createElement('div')
  live.className = 'sr-only'
  live.setAttribute('aria-live', 'polite')
  document.body.appendChild(live)

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch (_) {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.setAttribute('readonly', '')
      ta.style.cssText = 'position:fixed;top:-1000px;opacity:0'
      document.body.appendChild(ta)
      ta.select()
      let ok = false
      try {
        ok = document.execCommand('copy')
      } catch (_) {}
      ta.remove()
      return ok
    }
  }

  document.addEventListener('click', async e => {
    const btn = e.target.closest('[data-copy]')
    if (!btn) return
    const src = $(btn.dataset.copy)
    if (!src) return
    const ok = await copyText(src.textContent)
    const label = $('span', btn)
    const prev = label.textContent
    btn.classList.toggle('is-copied', ok)
    label.textContent = ok ? 'Copié' : 'Échec'
    live.textContent = ok
      ? 'Texte copié dans le presse-papiers'
      : 'La copie a échoué, sélectionne le texte manuellement'
    if (!ok) {
      const range = document.createRange()
      range.selectNodeContents(src)
      const sel = getSelection()
      sel.removeAllRanges()
      sel.addRange(range)
    }
    clearTimeout(btn._t)
    btn._t = setTimeout(() => {
      btn.classList.remove('is-copied')
      label.textContent = prev === 'Copié' || prev === 'Échec' ? 'Copier' : prev
    }, 1800)
  })

  // ------------------------------------------------------------ thème
  $$('[data-theme-toggle]').forEach(b =>
    b.addEventListener('click', () => {
      const root = document.documentElement
      const current =
        root.dataset.theme ||
        (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark')
      const next = current === 'light' ? 'dark' : 'light'
      root.dataset.theme = next
      ls.set('rq:theme', next)
    })
  )

  // ------------------------------------------------------------ menu mobile
  const menuBtn = $('[data-menu-toggle]')
  const topnav = $('#topnav')
  menuBtn?.addEventListener('click', () => {
    const open = !topnav.classList.contains('is-open')
    topnav.classList.toggle('is-open', open)
    menuBtn.setAttribute('aria-expanded', String(open))
  })

  // ------------------------------------------------------------ bibliothèque : filtres
  const libSections = $$('[data-library-sector]')
  if (libSections.length) {
    const chips = $$('[data-filter-sector]')
    const apply = slug => {
      libSections.forEach(s =>
        s.classList.toggle('is-hidden', Boolean(slug) && s.dataset.librarySector !== slug)
      )
      chips.forEach(c => c.classList.toggle('is-active', c.dataset.filterSector === (slug || '')))
    }
    chips.forEach(c =>
      c.addEventListener('click', e => {
        e.preventDefault()
        const slug = c.dataset.filterSector
        history.replaceState(null, '', slug ? '#' + slug : location.pathname)
        apply(slug)
      })
    )
    const fromHash = location.hash.slice(1)
    apply(libSections.some(s => s.dataset.librarySector === fromHash) ? fromHash : '')

    const hide = $('[data-hide-done]')
    const applyHide = () => {
      document.body.classList.toggle('hide-done', hide.checked)
      $$('.chapter-card').forEach(c =>
        c.classList.toggle('is-hidden', hide.checked && c.classList.contains('is-done'))
      )
      ls.set('rq:hideDone', hide.checked ? '1' : '0')
    }
    if (hide) {
      hide.checked = ls.get('rq:hideDone') === '1'
      hide.addEventListener('change', applyHide)
      requestAnimationFrame(applyHide)
    }
  }

  // ------------------------------------------------------------ ressources : filtres
  const kindChips = $$('[data-filter-kind]')
  if (kindChips.length) {
    kindChips.forEach(chip =>
      chip.addEventListener('click', () => {
        const kind = chip.dataset.filterKind
        kindChips.forEach(c => c.setAttribute('aria-pressed', String(c === chip)))
        $$('[data-res-item]').forEach(it =>
          it.classList.toggle('is-hidden', Boolean(kind) && it.dataset.kind !== kind)
        )
        $$('[data-res-chapter]').forEach(ch =>
          ch.classList.toggle('is-hidden', !$('[data-res-item]:not(.is-hidden)', ch))
        )
        $$('[data-res-sector]').forEach(s =>
          s.classList.toggle('is-hidden', !$('[data-res-chapter]:not(.is-hidden)', s))
        )
      })
    )
  }

  // ------------------------------------------------------------ recherche
  const dialog = $('#search')
  const input = $('#search-input')
  const list = $('#search-results')
  const status = $('#search-status')
  let index = null
  let loading = null
  let results = []
  let active = -1
  let lastFocus = null

  const fold = s => {
    let out = ''
    for (const c of s) out += (c.normalize('NFD')[0] || c).toLowerCase()
    return out
  }
  const esc = s =>
    s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])

  function loadIndex() {
    if (index) return Promise.resolve(index)
    if (loading) return loading
    status.textContent = 'Chargement de l’index…'
    loading = fetch('/data/search.json', { credentials: 'same-origin' })
      .then(r => {
        if (r.redirected || r.status === 401 || r.status === 403) throw new Error('session')
        if (!r.ok) throw new Error('http')
        return r.json()
      })
      .then(data => {
        index = data.map(d => ({ ...d, ft: fold(d.t), fh: fold(d.h), fx: fold(d.x) }))
        status.textContent = ''
        return index
      })
      .catch(err => {
        loading = null
        status.textContent =
          err.message === 'session'
            ? 'Ta session a expiré. Recharge la page pour te reconnecter.'
            : 'La recherche est momentanément indisponible. Vérifie ta connexion et réessaie.'
        throw err
      })
    return loading
  }

  function snippet(entry, terms) {
    const text = entry.x
    const pos = terms
      .map(t => entry.fx.indexOf(t))
      .filter(p => p >= 0)
      .sort((a, b) => a - b)[0]
    if (pos === undefined) return esc(text.slice(0, 150)) + (text.length > 150 ? '…' : '')
    const start = Math.max(0, pos - 60)
    const raw =
      (start ? '…' : '') + text.slice(start, start + 180) + (start + 180 < text.length ? '…' : '')
    // surligne les termes sur le texte brut, puis échappe morceau par morceau
    // (fold() conserve la longueur caractère par caractère, les positions restent alignées)
    const fr = fold(raw)
    const ranges = []
    terms.forEach(t => {
      for (let i = fr.indexOf(t); i >= 0; i = fr.indexOf(t, i + t.length))
        ranges.push([i, i + t.length])
    })
    ranges.sort((a, b) => a[0] - b[0])
    let out = ''
    let cur = 0
    for (const [a, b] of ranges) {
      if (a < cur) continue
      out += esc(raw.slice(cur, a)) + '<mark>' + esc(raw.slice(a, b)) + '</mark>'
      cur = b
    }
    return out + esc(raw.slice(cur))
  }

  function runSearch() {
    const q = fold(input.value.trim())
    const terms = q.split(/\s+/).filter(t => t.length > 1 || /\d/.test(t))
    if (!terms.length) {
      results = []
      list.innerHTML = ''
      status.textContent = index
        ? 'Tape au moins deux lettres : « TVA », « objection », « devis »…'
        : status.textContent
      return
    }
    results = index
      .map(e => {
        let score = 0
        for (const t of terms) {
          const inT = e.ft.includes(t)
          const inH = e.fh.includes(t)
          const inX = e.fx.includes(t)
          if (!inT && !inH && !inX) return null
          score += (inT ? 6 : 0) + (inH ? 8 : 0) + (inX ? 1 : 0)
        }
        if (!e.h) score += 2
        return { e, score }
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score)
      .slice(0, 24)
    active = results.length ? 0 : -1
    status.textContent = results.length
      ? `${results.length} résultat${results.length > 1 ? 's' : ''}`
      : 'Aucun résultat. Essaie un autre mot-clé.'
    list.innerHTML = results
      .map(
        (
          { e },
          i
        ) => `<li role="option" id="sr-${i}" aria-selected="${i === active}"><a href="${esc(e.u)}">
        <span class="sr-path">${esc(e.s)}${e.h ? ' · ' + esc(e.t) : ''}</span>
        <span class="sr-title">${esc(e.h || e.t)}</span>
        <span class="sr-snippet">${snippet(e, terms)}</span></a></li>`
      )
      .join('')
  }

  function setActive(i) {
    const items = $$('li', list)
    if (!items.length) return
    active = (i + items.length) % items.length
    items.forEach((li, j) => li.setAttribute('aria-selected', String(j === active)))
    items[active].scrollIntoView({ block: 'nearest' })
    input.setAttribute('aria-activedescendant', `sr-${active}`)
  }

  function openSearch() {
    if (!dialog) return
    lastFocus = document.activeElement
    dialog.hidden = false
    document.body.style.overflow = 'hidden'
    input.focus()
    input.select()
    loadIndex()
      .then(() => runSearch())
      .catch(() => {})
  }
  function closeSearch() {
    if (!dialog || dialog.hidden) return
    dialog.hidden = true
    document.body.style.overflow = ''
    lastFocus?.focus?.()
  }

  document.addEventListener('click', e => {
    if (e.target.closest('[data-search-open]')) openSearch()
    else if (e.target.closest('[data-search-close]')) closeSearch()
  })
  let t = 0
  input?.addEventListener('input', () => {
    clearTimeout(t)
    t = setTimeout(
      () =>
        index
          ? runSearch()
          : loadIndex()
              .then(runSearch)
              .catch(() => {}),
      90
    )
  })
  input?.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive(active + 1)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive(active - 1)
    } else if (e.key === 'Enter' && results[active]) {
      e.preventDefault()
      location.href = results[active].e.u
      closeSearch()
    }
  })
  list?.addEventListener('click', e => {
    if (e.target.closest('a')) closeSearch()
  })
  document.addEventListener('keydown', e => {
    const typing =
      /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName) ||
      document.activeElement?.isContentEditable
    if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      dialog.hidden ? openSearch() : closeSearch()
    } else if (e.key === '/' && !typing && dialog?.hidden) {
      e.preventDefault()
      openSearch()
    } else if (e.key === 'Escape') {
      closeSearch()
    } else if (e.key === 'Tab' && dialog && !dialog.hidden) {
      // piège de focus minimal dans la boîte de dialogue
      const f = $$('input, button, a[href]', dialog).filter(x => x.offsetParent)
      if (!f.length) return
      const first = f[0]
      const last = f[f.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
  })
  const kbd = $('.search-trigger kbd')
  if (kbd && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent))
    kbd.textContent = '⌘ K'

  // ------------------------------------------------------------ identité (progression par compte)
  renderProgress()
  window.addEventListener('pageshow', e => {
    if (e.persisted) {
      progress.load()
      renderProgress()
    }
  })

  let me = null
  try {
    me = JSON.parse(sessionStorage.getItem('rq:me') || 'null')
  } catch (_) {}
  const applyMe = m => {
    if (!m || !m.id || m.id === progress.uid) return
    progress.uid = m.id
    ls.set('rq:uid', m.id)
    progress.load()
    renderProgress()
    if (article) progress.visit(article.dataset.chapterId)
  }
  if (me) applyMe(me)
  else
    fetch('/auth/me/', { credentials: 'same-origin', headers: { accept: 'application/json' } })
      .then(r => (r.ok ? r.json() : null))
      .then(m => {
        if (!m) return
        try {
          sessionStorage.setItem('rq:me', JSON.stringify(m))
        } catch (_) {}
        applyMe(m)
      })
      .catch(() => {})
})()
