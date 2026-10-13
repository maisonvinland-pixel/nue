"""Convertit les pages publiées d'un Notion (HTML rendu) en chapitres Markdown de la plateforme.

Usage : python3 scripts/notion-import.py <dossier_html> <dossier_sortie>
Chaque fichier chNN.html devient content/<secteur>/NN-slug.md (frontmatter + corps).
Réutilisable : refaire l'import après une mise à jour du Notion écrase les fichiers générés.
"""

import re
import sys
import unicodedata
from pathlib import Path

from bs4 import BeautifulSoup, NavigableString, Tag

SECTOR_SOURCE = 'Ebook e-commerce (Notion)'
UPDATED = '2026-10-13'

# chapitre -> (module, icône)
PLAN = {
    1: ('bases', 'store'), 2: ('bases', 'coins'), 3: ('bases', 'target'),
    4: ('produit', 'search'), 5: ('produit', 'chart'), 6: ('produit', 'calculator'),
    7: ('produit', 'handshake'), 8: ('produit', 'globe'),
    9: ('boutique', 'store'), 10: ('boutique', 'file'), 11: ('boutique', 'grid'),
    12: ('acquisition', 'shield'), 13: ('acquisition', 'video'), 14: ('acquisition', 'chart'),
    15: ('acquisition', 'video'), 16: ('acquisition', 'layers'),
    17: ('scaler', 'target'), 18: ('scaler', 'rocket'),
    19: ('fideliser', 'mail'), 20: ('fideliser', 'message'), 21: ('fideliser', 'sparkles'),
    22: ('grandir', 'workflow'), 23: ('grandir', 'flag'), 24: ('grandir', 'book'),
}

QUOTE_TYPES = [
    (r"^À retenir\s*:", 'RETENIR', 'À retenir'),
    (r"^Erreur à éviter\s*:", 'ERREUR', "L'erreur à éviter"),
    (r"^Astuce de pro\s*:", 'ASTUCE', 'Astuce de pro'),
    (r"^L[’']IA peut t[’']aider\s*:", 'IA', "L'IA peut t'aider"),
    (r"^Attention\s*:", 'ATTENTION', 'Attention'),
]
EMOJI_TYPES = {'🎯': 'RETENIR', '⚠️': 'ATTENTION', '💡': 'ASTUCE', '🤖': 'IA', '📌': 'INFO', 'ℹ️': 'INFO'}


def slugify(s):
    s = unicodedata.normalize('NFD', s)
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn').lower()
    s = re.sub(r'[^a-z0-9]+', '-', s).strip('-')
    return s[:70].rstrip('-')


def cls(tag):
    for c in tag.get('class', []):
        if c.startswith('notion-') and c.endswith('-block') and c != 'notion-selectable':
            return c[len('notion-'):-len('-block')]
    return None


def child_blocks(block):
    """Blocs enfants directs (le bloc Notion le plus proche est `block`)."""
    out = []
    for d in block.find_all(class_='notion-selectable'):
        if d is block or cls(d) == 'table':
            continue
        anc = d.find_parent(class_='notion-selectable')
        if anc is block:
            out.append(d)
    return out


def own_leaf(block):
    for leaf in block.find_all(attrs={'data-content-editable-leaf': 'true'}):
        if leaf.find_parent(class_='notion-selectable') is block:
            return leaf
    return None


def esc_text(s):
    s = s.replace('\\', '\\\\').replace('<', '&lt;').replace('*', '\\*').replace('`', '\\`')
    s = re.sub(r'_(?=\S)|(?<=\S)_', r'\\_', s)
    return s


def wrap(text, mark):
    m = re.match(r'^(\s*)(.*?)(\s*)$', text, re.S)
    lead, core, trail = m.groups()
    return f'{lead}{mark}{core}{mark}{trail}' if core else text


def inline(node, code=False):
    out = []
    for c in node.children:
        if isinstance(c, NavigableString):
            t = str(c).replace('​', '')
            out.append(t if code else esc_text(t))
        elif isinstance(c, Tag):
            if c.name == 'img':
                out.append(c.get('alt', ''))
            elif c.name == 'br':
                out.append('\n')
            elif c.name == 'a':
                out.append(f"[{inline(c)}]({c.get('href', '')})")
            else:
                style = c.get('style', '')
                if 'SFMono' in style or 'monospace' in style:
                    out.append(wrap(c.get_text().replace('`', "'"), '`'))
                    continue
                inner = inline(c, code)
                if 'font-weight:600' in style.replace(' ', ''):
                    inner = wrap(inner, '**')
                if 'font-style:italic' in style.replace(' ', ''):
                    inner = wrap(inner, '*')
                out.append(inner)
    return ''.join(out)


def leaf_text(block, code=False):
    leaf = own_leaf(block)
    if leaf is None:
        return ''
    return inline(leaf, code).strip('\n')


def strip_emoji_prefix(s):
    return re.sub(r'^[^\wÀ-ÿ«"“(\[]+\s*', '', s).strip()


def soft_breaks(s):
    return s.replace('\n', '<br>')


def table_md(block):
    rows = []
    for tr in block.find_all('tr'):
        cells = []
        for td in tr.find_all(['td', 'th']):
            leaf = td.find(attrs={'data-content-editable-leaf': 'true'})
            txt = inline(leaf).strip() if leaf else ''
            cells.append(soft_breaks(txt).replace('|', '\\|') or ' ')
        rows.append(cells)
    if not rows:
        return ''
    width = max(len(r) for r in rows)
    rows = [r + [' '] * (width - len(r)) for r in rows]
    lines = ['| ' + ' | '.join(rows[0]) + ' |', '|' + ' --- |' * width]
    lines += ['| ' + ' | '.join(r) + ' |' for r in rows[1:]]
    return '\n'.join(lines)


class Converter:
    def __init__(self):
        self.out = []
        self.last_heading = ''
        self.last_text = ''

    def emit(self, s):
        self.out.append(s)

    def blocks(self, blocks, indent=''):
        i = 0
        while i < len(blocks):
            b = blocks[i]
            kind = cls(b)
            if kind in ('bulleted_list', 'numbered_list', 'to_do'):
                group = []
                while i < len(blocks) and cls(blocks[i]) == kind:
                    group.append(blocks[i])
                    i += 1
                self.emit(self.list_md(group, kind, indent))
                continue
            self.block(b, kind, indent)
            i += 1

    def list_md(self, items, kind, indent):
        lines = []
        for it in items:
            mark = {'bulleted_list': '-', 'numbered_list': '1.', 'to_do': '- [ ]'}[kind]
            text = soft_breaks(leaf_text(it))
            lines.append(f'{indent}{mark} {text}')
            kids = child_blocks(it)
            if kids:
                sub = Converter()
                sub.blocks(kids, indent + '    ')
                lines.append('\n'.join(x for x in sub.out if x.strip()))
        return '\n'.join(lines)

    def block(self, b, kind, indent):
        if kind == 'text':
            t = leaf_text(b)
            if t.strip():
                t = soft_breaks(t)
                if re.match(r'^(\d+[.)]|[-+>#]) ', t):
                    t = '\\' + t
                self.emit(indent + t)
                self.last_text = t
        elif kind in ('sub_header', 'sub_sub_header', 'header', 'header_4'):
            level = {'header': '##', 'sub_header': '##', 'sub_sub_header': '##', 'header_4': '###'}[kind]
            t = strip_emoji_prefix(leaf_text(b).replace('**', ''))
            if t:
                self.emit(f'{level} {t}')
                self.last_heading = t
        elif kind == 'divider':
            pass
        elif kind == 'table':
            self.emit(table_md(b))
        elif kind == 'code':
            self.emit(self.code_md(b))
        elif kind == 'quote':
            self.emit(self.quote_md(b))
        else:
            t = leaf_text(b)
            if t.strip():
                self.emit(soft_breaks(t))

    def code_md(self, b):
        leaf = own_leaf(b)
        text = leaf.get_text().replace('​', '').rstrip() if leaf else ''
        short = len(text) < 400 and ('↓' in text or ('→' in text and text.count('\n') < 2))
        if short:
            return f'```text\n{text}\n```'
        head = self.last_heading
        ctx = (head + ' ' + self.last_text).lower()
        if 'prompt' in ctx or 'ia' in ctx.split() or 'outil de génér' in ctx:
            kind = 'prompt'
        elif 'script' in ctx:
            kind = 'script'
        elif 'message' in ctx or 'mail' in ctx:
            kind = 'message'
        else:
            kind = 'modele'
        title = head.replace('"', "'")
        fence = '````' if '```' in text else '```'
        return f'{fence}copy title="{title}" kind="{kind}"\n{text}\n{fence}'

    def quote_md(self, b):
        leaf = own_leaf(b)
        first_img = leaf.find('img') if leaf else None
        emoji = first_img.get('alt', '') if first_img else ''
        raw = leaf_text(b)
        text = re.sub(r'^\s*' + re.escape(emoji) + r'\s*', '', raw) if emoji else raw
        kids = child_blocks(b)
        sub = Converter()
        sub.blocks(kids)
        kid_md = '\n\n'.join(x for x in sub.out if x.strip())

        plain = text.replace('**', '')
        if re.match(r'^Ta mission\s*:', plain):
            body = re.sub(r'^\**Ta mission\s*:\**\s*', '', text)
            body = body[:1].upper() + body[1:]
            parts = [soft_breaks(body)] + ([kid_md] if kid_md else [])
            return ':::exercise Ta mission\n' + '\n\n'.join(parts) + '\n:::'
        ctype, title = None, ''
        for pat, t, label in QUOTE_TYPES:
            if re.match(pat, plain):
                ctype, title = t, label
                text = re.sub(r'^\**[^:]{1,40}:\**\s*', '', text, count=1)
                break
        if not ctype:
            ctype = EMOJI_TYPES.get(emoji, 'INFO')
            m = re.match(r'^\**([^:*]{2,40})\s*:\**\s*(.*)$', text, re.S)
            if m:
                title, text = m.group(1).strip(), m.group(2)
        body = soft_breaks(text.strip())
        if body[:1].islower():
            body = body[0].upper() + body[1:]
        lines = [f'> [!{ctype}] {title}'.rstrip()]
        for part in [body] + ([kid_md] if kid_md else []):
            for line in part.split('\n'):
                lines.append('> ' + line if line else '>')
            lines.append('>')
        return '\n'.join(lines[:-1])


def intro_from(b):
    """Bloc ⏱ : '12 min de lecture · 🟢 Débutant / À la fin, tu sauras : …'."""
    t = leaf_text(b).replace('**', '')
    level = ''
    m = re.search(r'min de lecture\s*·\s*\W*\s*([A-Za-zÀ-ÿ]+)', t)
    if m:
        level = m.group(1)
    obj = ''
    m = re.search(r'À la fin, tu sauras\s*:\s*(.*)$', t, re.S)
    if m:
        obj = m.group(1).strip()
    return level, obj


def short_description(obj, title):
    if not obj:
        return title
    obj = obj.rstrip('.')
    if len(obj) <= 190:
        d = obj
    else:
        cut = obj[:190]
        d = cut[: cut.rfind(',')] if ',' in cut else cut
        d = d.rstrip(' ,;') + '…'
    return 'Tu sauras : ' + d + ('' if d.endswith('…') else '.')


def convert(html_path):
    soup = BeautifulSoup(Path(html_path).read_text(), 'lxml')
    page = soup.select_one('.notion-page-content')
    top = page.find_all(recursive=False)
    chapters = []
    current = None
    for b in top:
        kind = cls(b)
        if kind == 'sub_header':
            title = leaf_text(b).replace('**', '').strip()
            current = {'title_raw': title, 'blocks': [], 'intro': None}
            chapters.append(current)
            continue
        if current is None:
            continue
        if kind == 'quote' and current['intro'] is None and not current['blocks']:
            leaf = own_leaf(b)
            img = leaf.find('img') if leaf else None
            if img is not None and img.get('alt') == '⏱':
                current['intro'] = intro_from(b)
                continue
        current['blocks'].append(b)
    return chapters


def alphabet_headings(body):
    """Insère « ## A », « ## B »… devant chaque groupe de définitions « **Terme** : … »."""
    out, current = [], None
    for para in body.split('\n\n'):
        m = re.match(r'^\*\*(.)', para)
        if m:
            ch = unicodedata.normalize('NFD', m.group(1))[0].upper()
            letter = ch if ch.isalpha() else '0-9'
            if letter != current:
                out.append(f'## {letter}')
                current = letter
        out.append(para)
    return '\n\n'.join(out)


def render_chapter(num, ch):
    m = re.match(r'^Chapitre\s+\d+\s*[—–-]\s*(.+)$', ch['title_raw'])
    title = m.group(1).strip() if m else ch['title_raw']
    title = re.sub(r'\s*\(\+\s*lexique\)\s*$', '', title, flags=re.I)
    title = re.sub(r'\s*:\s*', ' : ', title)
    level, obj = ch['intro'] or ('', '')
    conv = Converter()
    conv.blocks(ch['blocks'])
    body = '\n\n'.join(x for x in conv.out if x.strip())
    if title.lower().startswith('lexique'):
        body = alphabet_headings(body)
    intro = ''
    if obj or level:
        lines = ['> [!INFO] Ce que tu vas apprendre']
        if level:
            lines.append(f'> **Niveau : {level.lower()}**')
            lines.append('>')
        if obj:
            lines.append('> À la fin, tu sauras : ' + soft_breaks(obj))
        intro = '\n'.join(lines) + '\n\n'
    module, icon = PLAN[num]
    desc = short_description(obj, title).replace('"', "'")
    if title.lower().startswith('lexique'):
        desc = "Toutes les définitions de l'e-commerce de A à Z : publicité, boutique, logistique, chiffres et rétention."

    src = f'{SECTOR_SOURCE}, chapitre {num}' if num <= 23 else f'{SECTOR_SOURCE}, lexique'
    fm = '\n'.join([
        '---',
        f'title: "{title}"',
        f'description: "{desc}"',
        f'module: {module}',
        f'icon: {icon}',
        f'updated: {UPDATED}',
        'origin: livre',
        f'source: "{src}"',
        '---',
        '',
    ])
    return title, fm + intro + body.strip() + '\n'


def main(src_dir, out_dir):
    out = Path(out_dir)
    out.mkdir(parents=True, exist_ok=True)
    num = 0
    report = []
    for f in sorted(Path(src_dir).glob('ch*.html')):
        for ch in convert(f):
            num += 1
            title, md = render_chapter(num, ch)
            name = f'{num:02d}-{slugify(title)}.md'
            (out / name).write_text(md)
            words = len(re.sub(r'[#>*|`\-]', ' ', md).split())
            report.append(f'{name}  ({words} mots)')
    print('\n'.join(report))


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
