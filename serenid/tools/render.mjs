// Rend les photos produit de tools/studio.html en JPEG (assets/img/).
// Usage : serveur statique sur :8080 à la racine de serenid/, puis
//   node tools/render.mjs [shot ...]
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const OUT = new URL('../assets/img/', import.meta.url).pathname;
const TMP = new URL('./.tmp/', import.meta.url).pathname;
mkdirSync(OUT, { recursive: true }); mkdirSync(TMP, { recursive: true });

const SQ = { w: 1200, h: 1200 }, WIDE = { w: 1600, h: 1000 };
const ALL = {
  'nid': ['nid', {}, SQ], 'nid-back': ['nid-back', {}, SQ],
  'pastille-coquille': ['pastille', { finish: 'coquille' }, SQ], 'pastille-brume': ['pastille', { finish: 'brume' }, SQ],
  'pack-coquille': ['pack', { finish: 'coquille' }, SQ], 'pack-brume': ['pack', { finish: 'brume' }, SQ],
  'cle-coquille': ['cle', { finish: 'coquille' }, SQ], 'cle-encre': ['cle', { finish: 'encre' }, SQ],
  'plus': ['plus', {}, SQ],
  'kit-decouverte-coquille': ['kit-decouverte', { finish: 'coquille' }, SQ], 'kit-decouverte-brume': ['kit-decouverte', { finish: 'brume' }, SQ],
  'kit-famille-coquille': ['kit-famille', { finish: 'coquille' }, SQ], 'kit-famille-brume': ['kit-famille', { finish: 'brume' }, SQ],
  'kit-maison-coquille': ['kit-maison', { finish: 'coquille' }, SQ], 'kit-maison-brume': ['kit-maison', { finish: 'brume' }, SQ],
  'scene-cuisine': ['cuisine', {}, WIDE], 'scene-salon': ['salon', {}, WIDE],
};
const want = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(ALL);
const b = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
for (const name of want) {
  const [shot, q, { w, h }] = ALL[name];
  const p = await b.newPage({ viewport: { width: w, height: h } });
  const qs = new URLSearchParams({ shot, w, h, ss: 2, ...q });
  await p.goto(`http://localhost:8080/tools/studio.html?${qs}`);
  await p.waitForFunction(() => window.__done || window.__err, null, { timeout: 180000 });
  const err = await p.evaluate(() => window.__err);
  if (err) { console.log('ERR', name, err); await p.close(); continue; }
  const data = await p.evaluate(() => document.querySelector('canvas').toDataURL('image/png'));
  const png = TMP + name + '.png';
  writeFileSync(png, Buffer.from(data.split(',')[1], 'base64'));
  const big = w >= 1600 ? 1600 : 1200, small = w >= 1600 ? 800 : 600;
  execFileSync('convert', [png, '-filter', 'Lanczos', '-resize', `${big}x`, '-unsharp', '0x0.6+0.4+0', '-strip', '-sampling-factor', '4:2:0', '-quality', '80', '-interlace', 'Plane', OUT + name + '.jpg']);
  execFileSync('convert', [png, '-filter', 'Lanczos', '-resize', `${small}x`, '-strip', '-quality', '78', '-interlace', 'Plane', OUT + name + '-s.jpg']);
  console.log('ok', name);
  await p.close();
}
await b.close();
