// Rendu Markdown enrichi pour les chapitres.
//
// Syntaxe propre à la plateforme (documentée dans le README) :
//   > [!ASTUCE] Titre optionnel        → encadré pédagogique (INFO, ASTUCE, ATTENTION, ERREUR, LEGAL, EXEMPLE, CHIFFRE)
//   ```copy title="…" kind="script"    → bloc copiable (script, prompt, message, modele, clause, email)
//   :::steps … :::                      → liste ordonnée présentée en étapes
//   :::recap … :::                      → « L'essentiel à retenir »
//   :::exercise Titre … :::             → exercice pratique
//   :::cols … +++ … :::                 → deux colonnes (séparées par une ligne +++)
//   :::stat 6 650 € … :::               → chiffre clé
//   - [ ] tâche                          → case à cocher persistée (progression)
//   [texte](@smma/slug#ancre)           → lien interne vérifié au build

import { Marked } from 'marked'

export const CALLOUTS = {
  INFO: { label: 'Bon à savoir', icon: 'info' },
  ASTUCE: { label: 'Astuce', icon: 'bulb' },
  ATTENTION: { label: 'Attention', icon: 'alert' },
  ERREUR: { label: "L'erreur à éviter", icon: 'alert' },
  LEGAL: { label: 'Cadre légal', icon: 'scale' },
  EXEMPLE: { label: 'Exemple', icon: 'pen' },
  CHIFFRE: { label: 'Le chiffre à retenir', icon: 'chart' },
  PDF: { label: 'Dans le livre', icon: 'book' },
}

export const COPY_KINDS = {
  script: 'Script',
  prompt: 'Prompt IA',
  message: 'Message',
  email: 'E-mail',
  modele: 'Modèle',
  clause: 'Clause',
  checklist: 'Checklist',
}

export function escapeHtml(s = '') {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function slugify(s) {
  return String(s)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/&[a-z]+;/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

function parseAttrs(str = '') {
  const out = {}
  for (const m of str.matchAll(/(\w+)="([^"]*)"/g)) out[m[1]] = m[2]
  return out
}

function stripTags(html) {
  return html
    .replace(/<a class="anchor"[^>]*>#<\/a>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/ {2,}/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

// Met en évidence les zones à personnaliser : [prénom], [ville]…
function highlightPlaceholders(escaped) {
  return escaped.replace(/\[([^\]\n]{1,60})\]/g, '<mark class="ph">[$1]</mark>')
}

const container = {
  name: 'container',
  level: 'block',
  start(src) {
    return src.match(/^:::/m)?.index
  },
  tokenizer(src) {
    const m = /^:::([a-z]+)[ \t]*([^\n]*)\n([\s\S]*?)\n:::[ \t]*(?:\n+|$)/.exec(src)
    if (!m) return
    const [raw, kind, arg, body] = m
    const token = { type: 'container', raw, kind, arg: arg.trim(), parts: [] }
    const chunks = kind === 'cols' ? body.split(/\n\+\+\+[ \t]*\n/) : [body]
    for (const chunk of chunks) token.parts.push(this.lexer.blockTokens(chunk, []))
    return token
  },
  renderer(token) {
    const inner = token.parts.map(p => this.parser.parse(p))
    const ctx = this.parser.options.ctx
    switch (token.kind) {
      case 'steps':
        return `<div class="steps">${inner[0]}</div>\n`
      case 'recap':
        return `<section class="recap" aria-label="L'essentiel à retenir"><p class="recap__label">${ctx.icon('flag')}<span>${escapeHtml(token.arg || "L'essentiel à retenir")}</span></p>${inner[0]}</section>\n`
      case 'exercise':
        return `<section class="exercise"><p class="exercise__label">${ctx.icon('pen')}<span>Exercice pratique</span></p>${token.arg ? `<p class="exercise__title">${escapeHtml(token.arg)}</p>` : ''}${inner[0]}</section>\n`
      case 'cols':
        return `<div class="cols">${inner.map(h => `<div class="cols__col">${h}</div>`).join('')}</div>\n`
      case 'stat':
        return `<div class="stat"><p class="stat__value">${escapeHtml(token.arg)}</p><div class="stat__text">${inner[0]}</div></div>\n`
      default:
        throw new Error(`Bloc :::${token.kind} inconnu`)
    }
  },
}

export function renderMarkdown(src, { resolveLink, icon, chapterId }) {
  const ctx = { toc: [], copies: [], tasks: 0, ids: new Set(), icon, links: [] }

  const uniqueId = base => {
    let id = base || 'section'
    let n = 2
    while (ctx.ids.has(id)) id = `${base}-${n++}`
    ctx.ids.add(id)
    return id
  }

  const marked = new Marked({ gfm: true })
  marked.use({ ctx, extensions: [container] })
  marked.use({
    renderer: {
      heading({ tokens, depth }) {
        const html = this.parser.parseInline(tokens)
        if (depth === 1)
          throw new Error(
            `${chapterId} : n'utilise pas de titre H1 dans le corps (le titre vient du frontmatter)`
          )
        const text = stripTags(html.replace(/<[^>]+>/g, '')).trim()
        const id = uniqueId(slugify(text))
        if (depth <= 3) ctx.toc.push({ depth, id, text })
        return `<h${depth} id="${id}"><a class="anchor" href="#${id}" aria-label="Lien vers cette section">#</a>${html}</h${depth}>\n`
      },

      code({ text, lang }) {
        const info = (lang || '').trim()
        const kindWord = info.split(/\s+/)[0]
        const attrs = parseAttrs(info)
        const isCopy = kindWord === 'copy'
        const kind = attrs.kind || (isCopy ? 'modele' : 'code')
        const title = attrs.title || ''
        const id = `copy-${ctx.copies.length + 1}`
        const body = isCopy ? highlightPlaceholders(escapeHtml(text)) : escapeHtml(text)
        if (isCopy) ctx.copies.push({ id, title, kind, text })
        const badge = COPY_KINDS[kind] || 'Code'
        return `<figure class="copy-block${isCopy ? '' : ' copy-block--code'}" id="${id}" data-kind="${escapeHtml(kind)}">
<figcaption class="copy-block__head"><span class="copy-block__badge">${badge}</span><span class="copy-block__title">${escapeHtml(title)}</span><button type="button" class="copy-btn" data-copy="#${id} code">${icon('copy')}<span>Copier</span></button></figcaption>
<pre><code>${body}</code></pre></figure>\n`
      },

      blockquote({ tokens }) {
        let html = this.parser.parse(tokens)
        const m = /^<p>\[!([A-Z]+)\][ \t]*([^\n<]*)(\n|<\/p>\n?)/.exec(html)
        if (!m) return `<blockquote class="pull">${html}</blockquote>\n`
        const type = m[1]
        const conf = CALLOUTS[type]
        if (!conf) throw new Error(`${chapterId} : encadré [!${type}] inconnu`)
        const title = m[2].trim() || conf.label
        html = html.slice(m[0].length)
        html = (m[3] === '\n' ? '<p>' : '') + html
        html = html.replace(/^<p><\/p>\n?/, '')
        return `<aside class="callout callout--${type.toLowerCase()}"><p class="callout__label">${icon(conf.icon)}<span>${title}</span></p>${html}</aside>\n`
      },

      checkbox({ checked }) {
        ctx.tasks += 1
        return `<input type="checkbox" class="task" data-task="${ctx.tasks}"${checked ? ' checked' : ''} aria-label="Marquer comme fait"> `
      },

      link({ href, title, tokens }) {
        const text = this.parser.parseInline(tokens)
        const t = title ? ` title="${escapeHtml(title)}"` : ''
        if (href.startsWith('@')) {
          const url = resolveLink(href.slice(1))
          ctx.links.push(href)
          return `<a href="${url}"${t}>${text}</a>`
        }
        if (/^https?:\/\//.test(href)) {
          return `<a href="${escapeHtml(href)}"${t} target="_blank" rel="noopener noreferrer" class="ext">${text}<span class="sr-only"> (nouvel onglet)</span></a>`
        }
        return `<a href="${escapeHtml(href)}"${t}>${text}</a>`
      },
    },
  })

  let html = frenchTypo(marked.parse(src))
  html = html
    .replace(/<table>/g, '<div class="table-wrap" tabindex="0"><table>')
    .replace(/<\/table>/g, '</table></div>')
    .replace(
      /<li><input type="checkbox" class="task"/g,
      '<li class="task-item"><input type="checkbox" class="task"'
    )

  const text = stripTags(html)
  const words = text.split(/\s+/).filter(Boolean).length
  return { html, toc: ctx.toc, copies: ctx.copies, tasks: ctx.tasks, words, text }
}

// Espaces fines insécables de la typographie française (hors code et hors balises).
export function frenchTypo(html) {
  return html
    .split(/(<pre[\s\S]*?<\/pre>|<code>[\s\S]*?<\/code>|<[^>]+>)/)
    .map((part, i) =>
      i % 2 ? part : part.replace(/ ([;:!?»])/g, '\u202F$1').replace(/« /g, '«\u202F')
    )
    .join('')
}

// Découpe le HTML rendu en sections (par H2) pour l'index de recherche.
export function sectionsForSearch(html) {
  const out = []
  const parts = html.split(/(?=<h2 id=")/)
  for (const part of parts) {
    const m = /^<h2 id="([^"]+)">(.*?)<\/h2>/s.exec(part)
    const heading = m ? stripTags(m[2]).trim() : ''
    const body = stripTags(m ? part.slice(m[0].length) : part)
      .replace(/\s+/g, ' ')
      .trim()
    if (!heading && !body) continue
    out.push({ id: m ? m[1] : '', heading, text: body })
  }
  return out
}
