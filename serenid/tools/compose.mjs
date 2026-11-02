// Assemble les photos composées de tools/compose.html et les écrit en JPEG dans assets/img/
// (version -xl haute définition, version standard et version « -s » pour les vignettes).
// Rendu en densité 2 : les détourages de tools/cutouts sont en haute définition.
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
  'scene-chambre': ['chambre', 'coquille', true], 'scene-entree': ['entree', 'coquille', true],
  'gamme': ['gamme', 'coquille', true],
  'og': ['og', 'coquille', 'og'],
};
const want = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(ALL);
const b = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined });
for (const name of want) {
  const [shot, finish, wide] = ALL[name];
  const p = await b.newPage({ viewport: wide === 'og' ? { width: 1200, height: 630 } : wide ? { width: 1488, height: 992 } : { width: 1200, height: 1200 }, deviceScaleFactor: 2 });
  await p.goto(`http://localhost:8080/tools/compose.html?shot=${shot}&finish=${finish}`);
  await p.waitForFunction(() => window.__done, null, { timeout: 30000 });
  const png = TMP + name + '.png';
  await p.locator('#stage').screenshot({ path: png });
  if (wide === 'og') { // image de partage : un seul fichier, à la racine des assets
    execFileSync('convert', [png, '-filter', 'Lanczos', '-resize', '1200x', '-strip', '-sampling-factor', '4:2:0', '-quality', '84', '-interlace', 'Plane', OUT + '../og-image.jpg']);
    console.log('ok', name); await p.close(); continue;
  }
  const sizes = wide ? [['-xl', 2400, 72], ['', 1264, 82], ['-s', 640, 80]] : [['-xl', 1800, 78], ['', 1000, 82], ['-s', 600, 80]];
  for (const [suffix, width, q] of sizes) {
    execFileSync('convert', [png, '-filter', 'Lanczos', '-resize', `${width}x`, '-strip', '-sampling-factor', '4:2:0', '-quality', String(q), '-interlace', 'Plane', OUT + name + suffix + '.jpg']);
  }
  console.log('ok', name);
  await p.close();
}
await b.close();
