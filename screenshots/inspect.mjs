// inspect.mjs — relève la structure réelle d'un écran, après navigation.
//
//   node inspect.mjs settings-branding
//
// N'écrit aucune capture. Sert à choisir un `clip` sur des faits plutôt que sur une
// hypothèse. Trois devinettes successives de sélecteur ont coûté autant d'allers-retours
// le 2026-09-04 ; cet outil existe pour que ça n'arrive plus.

import { chromium } from 'playwright';
import { APP_URL, APP_FRAME, PROFILE_DIR, VIEWPORT, SHOTS } from './shots.config.mjs';

const id = process.argv[2];
const shot = SHOTS.find((s) => s.id === id);
if (!shot) {
  console.error(`  shot "${id}" inconnu. Disponibles : ${SHOTS.map((s) => s.id).join(', ')}`);
  process.exit(1);
}

const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
  headless: true,
  viewport: VIEWPORT,
  locale: 'fr-FR',
});
const page = ctx.pages()[0] ?? (await ctx.newPage());
await page.goto(APP_URL, { waitUntil: 'domcontentloaded' });

const handle = await page.locator(APP_FRAME).first().elementHandle({ timeout: 30_000 });
const frame = await handle.contentFrame();
await frame.waitForSelector('#root', { timeout: 30_000 });
const tp = page.locator(APP_FRAME).first().contentFrame();

await page.waitForTimeout(3_000); // hydratation
if (shot.prepare) {
  try {
    await shot.prepare(tp, page);
  } catch (e) {
    console.error('  prepare a échoué :', String(e.message).split('\n')[0]);
  }
}
await page.waitForTimeout(1_500);

const report = await frame.evaluate(() => {
  const box = (el) => {
    const r = el.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height), y: Math.round(r.top) };
  };
  const visible = (el) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none';
  };
  const chain = (el) => {
    const out = [];
    let n = el;
    for (let i = 0; i < 5 && n && n !== document.body; i++) {
      out.push(
        n.tagName.toLowerCase() +
          (n.id ? `#${n.id}` : '') +
          '.' + (n.className || '').split(' ').filter((c) => c.startsWith('Mui')).slice(0, 3).join('.'),
      );
      n = n.parentElement;
    }
    return out.join('  <  ');
  };

  return {
    tablists: Array.from(document.querySelectorAll('[role="tablist"]'))
      .filter(visible)
      .map((t) => ({
        aria: t.getAttribute('aria-label'),
        onglets: Array.from(t.querySelectorAll('[role="tab"]')).map((x) => (x.textContent || '').trim().slice(0, 22)),
        ...box(t),
        remontee: chain(t),
      })),
    papers: Array.from(document.querySelectorAll('[class*="MuiPaper"]'))
      .filter(visible)
      .map((p) => ({
        classes: (p.className || '').split(' ').filter((c) => c.startsWith('Mui')).join('.'),
        ...box(p),
        contientTablist: !!p.querySelector('[role="tablist"]'),
        texte: (p.textContent || '').trim().slice(0, 44),
      }))
      .sort((a, b) => b.w * b.h - a.w * a.h)
      .slice(0, 12),
    testids: Array.from(document.querySelectorAll('[data-testid]'))
      .filter(visible)
      .map((e) => ({ id: e.getAttribute('data-testid'), ...box(e) }))
      .sort((a, b) => b.w * b.h - a.w * a.h)
      .slice(0, 15),
  };
});

console.log('\n=== TABLISTS visibles ===');
report.tablists.forEach((t) => console.log('  ' + JSON.stringify(t)));
console.log('\n=== PAPERS visibles (12 plus grands) ===');
report.papers.forEach((p) => console.log('  ' + JSON.stringify(p)));
console.log('\n=== data-testid visibles (15 plus grands) ===');
report.testids.forEach((t) => console.log('  ' + JSON.stringify(t)));

await ctx.close();
process.exit(0);