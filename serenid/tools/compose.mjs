// Assemble les photos composées de tools/compose.html et les écrit en JPEG dans assets/img/
// (version grande + version « -s » pour les vignettes).
// Usage : serveur statique sur :8080 à la racine de serenid/, puis
//   node tools/compose.mjs [nom ...]
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const OUT = new URL('../assets/img/', import.meta.url).pathname;
const TMP = new URL('./.tmp/', import.meta.url).pathname;
mkdirSync(OUT, { recursive: true }); mkdirSync(TMP, { recursive: true });

const ALL = {
  'pastille-brume': ['pastille', 'brume'],
  'pack-coquille': ['pack', 'coquille'], 'pack-brume': ['pack', 'brume'],
  'kit-decouverte-coquille': ['kit-decouverte', 'coquille'], 'kit-decouverte-brume': ['kit-decouverte', 'brume'],
  'kit-famille-coquille': ['kit-famille', 'coquille'], 'kit-famille-brume': ['kit-famille', 'brume'],
  'kit-maison-coquille': ['kit-maison', 'coquille'], 'kit-maison-brume': ['kit-maison', 'brume'],
  'plus': ['plus', 'coquille'],
};
const want = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(ALL);
const b = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined });
for (const name of want) {
  const [shot, finish] = ALL[name];
  const p = await b.newPage({ viewport: { width: 1200, height: 1200 }, deviceScaleFactor: 1 });
  await p.goto(`http://localhost:8080/tools/compose.html?shot=${shot}&finish=${finish}`);
  await p.waitForFunction(() => window.__done, null, { timeout: 30000 });
  const png = TMP + name + '.png';
  await p.locator('#stage').screenshot({ path: png });
  execFileSync('convert', [png, '-filter', 'Lanczos', '-resize', '1000x', '-strip', '-sampling-factor', '4:2:0', '-quality', '82', '-interlace', 'Plane', OUT + name + '.jpg']);
  execFileSync('convert', [png, '-filter', 'Lanczos', '-resize', '480x', '-strip', '-quality', '78', '-interlace', 'Plane', OUT + name + '-s.jpg']);
  console.log('ok', name);
  await p.close();
}
await b.close();
