// capture.mjs — exécute la liste de shots.config.mjs et écrit les PNG dans ../images/.
//
//   node capture.mjs                    toutes les captures
//   node capture.mjs --only cockpit     une seule, par id
//   node capture.mjs --headed           navigateur visible, pour diagnostiquer
//
// Prérequis : `node auth.mjs` a créé le profil persistant .profile/

import { chromium } from 'playwright';
import { mkdir, access } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import {
  APP_URL, APP_FRAME, PROFILE_DIR, VIEWPORT, SCALE,
  APP_REDACTIONS, HOST_REDACTIONS, HOST_HIDE, LANG_TOGGLE, SHOTS, NAV,
} from './shots.config.mjs';

const OUT_ROOT = join('..', 'images');
const argv = process.argv;
const only = argv.includes('--only') ? argv[argv.indexOf('--only') + 1] : null;
const headed = argv.includes('--headed');

try {
  await access(PROFILE_DIR);
} catch {
  console.error("  Profil absent. Lance d'abord : node auth.mjs");
  process.exit(1);
}

// Profil persistant : la session Azure DevOps survit d'une exécution à l'autre.
// Un storageState ne suffisait pas — mesuré le 2026-09-04.
const context = await chromium.launchPersistentContext(PROFILE_DIR, {
  headless: !headed,
  viewport: VIEWPORT,
  deviceScaleFactor: SCALE,
  locale: 'fr-FR',
  timezoneId: 'Europe/Paris',
  reducedMotion: 'reduce',
  colorScheme: 'light',
});

const page = context.pages()[0] ?? (await context.newPage());

/**
 * L'app vit dans une iframe cross-origin. On a besoin des DEUX formes :
 *  - FrameLocator pour cliquer et cadrer
 *  - Frame        pour évaluer du JS dedans (un page.evaluate ne franchit pas la frontière)
 */
async function appContexts() {
  const handle = await page.locator(APP_FRAME).first().elementHandle({ timeout: 30_000 });
  const frame = await handle.contentFrame();
  if (!frame) throw new Error(`iframe ${APP_FRAME} introuvable ou non chargée`);
  await frame.waitForSelector('#root', { timeout: 30_000 });
  return { tp: page.locator(APP_FRAME).first().contentFrame(), frame };
}

/** Remplace le contenu sensible et masque le chrome. Deux contextes, deux passes. */
async function sanitize(frame) {
  const apply = (target, redactions, hide) =>
    target.evaluate(({ redactions, hide }) => {
      for (const r of redactions) {
        for (const el of document.querySelectorAll(r.selector)) el.textContent = r.text;
      }
      for (const sel of hide) {
        for (const el of document.querySelectorAll(sel)) el.style.visibility = 'hidden';
      }
      const s = document.createElement('style');
      s.textContent =
        '*{caret-color:transparent!important;animation:none!important;transition:none!important}';
      document.head.appendChild(s);
    }, { redactions, hide });

  await apply(page, HOST_REDACTIONS, HOST_HIDE);
  await apply(frame, APP_REDACTIONS, []);
}

/**
 * Bascule l'interface. Mesuré le 2026-09-04 : MUI ne reflète PAS la prop `value` du
 * ToggleButton en attribut DOM, donc `[value="fr"]` ne matche rien. Le nom accessible
 * est le sélecteur primaire — acceptable ici car « FR » et « EN » ne sont pas traduits.
 * Le CSS reste en repli au cas où des data-testid seraient ajoutés plus tard.
 */
/** Relève l'état réel des boutons de la barre d'outils. Sert uniquement au diagnostic. */
async function toolbarReport(frame) {
  return frame.evaluate(() =>
    Array.from(
      document.querySelectorAll('.MuiToolbar-root button, .MuiToolbar-root [role="button"]'),
    ).map((b) => {
      const r = b.getBoundingClientRect();
      const cs = getComputedStyle(b);
      return {
        tag: b.tagName.toLowerCase(),
        texte: (b.textContent || '').trim().slice(0, 24),
        aria: b.getAttribute('aria-label'),
        pressed: b.getAttribute('aria-pressed'),
        value: b.getAttribute('value'),
        disabled: b.disabled ?? b.getAttribute('aria-disabled'),
        taille: `${Math.round(r.width)}x${Math.round(r.height)}`,
        visible: cs.visibility !== 'hidden' && cs.display !== 'none' && r.width > 0,
        pointerEvents: cs.pointerEvents,
        classes: (b.className || '').split(' ').filter((c) => c.startsWith('Mui')).join('.'),
      };
    }),
  );
}

async function setLang(tp, lang, frame) {
  try {
    await tp.locator('.MuiToolbar-root').first().waitFor({ state: 'visible', timeout: 30_000 });
  } catch {
    throw new Error("barre d'outils jamais rendue — l'application n'a pas fini de s'hydrater");
  }

  const snapshot = () => frame.evaluate(() => document.body.innerText.slice(0, 4000));
  const label = lang.toUpperCase();
  // Mesuré le 2026-09-04 : MUI reflète bien `value` en attribut DOM sur ToggleButton.
  // C'est le sélecteur le plus sûr — indépendant du libellé et de l'i18n.
  const candidates = [
    tp.locator(LANG_TOGGLE(lang)),
    tp.getByRole('button', { name: label, exact: true }),
    tp.locator(`.MuiToolbar-root button:text-is("${label}")`),
  ];

  for (const btn of candidates) {
    const n = await btn.count();
    if (n === 0) continue;

    // Plusieurs éléments peuvent porter le même nom accessible — le libellé enveloppé
    // dans un span, un doublon masqué. On retient le premier réellement actionnable
    // plutôt que le premier tout court.
    let target = null;
    for (let i = 0; i < n; i++) {
      const c = btn.nth(i);
      if ((await c.isVisible()) && (await c.isEnabled())) { target = c; break; }
    }
    if (!target) continue;

    if ((await target.getAttribute('aria-pressed')) === 'true') return true;

    const before = await snapshot();
    try {
      await target.click({ timeout: 8_000 });
    } catch (err) {
      const meta = await toolbarReport(frame);
      throw new Error(
        `bouton "${label}" trouvé (${n} correspondance(s)) mais non cliquable : ${String(err.message).split('\\n')[0]}\\n        État réel de la Toolbar :\\n        ` +
          meta.map((b) => JSON.stringify(b)).join('\\n        '),
      );
    }
    // Attendre que le composant confirme la bascule. `aria-pressed` est un signal plus
    // direct que le texte : il ne dépend pas de la traduction des libellés.
    let switched = false;
    for (let i = 0; i < 20; i++) {
      if ((await target.getAttribute('aria-pressed')) === 'true') { switched = true; break; }
      await page.waitForTimeout(250);
    }
    await page.waitForTimeout(400);

    if (!switched || (await snapshot()) === before) {
      const meta = await toolbarReport(frame);
      throw new Error(
        `clic sur "${label}" sans effet — la langue n'a pas changé.\\n        État réel de la Toolbar :\\n        ` +
          meta.map((b) => JSON.stringify(b)).join('\\n        '),
      );
    }
    return true;
  }

  const meta = await toolbarReport(frame);
  throw new Error(
    `aucun bouton "${label}" actionnable.\\n        État réel de la Toolbar :\\n        ` +
      (meta.length ? meta.map((b) => JSON.stringify(b)).join('\\n        ') : '(aucun bouton)'),
  );
}

/**
 * Attend que la zone à capturer cesse de bouger.
 *
 * `networkidle` ne suffit pas : les réglages TestPulse arrivent d'Extension Data et la
 * page se réaffiche APRÈS. Sans cette attente, on capture l'état par défaut — un PNG
 * parfaitement net d'un écran que personne ne voit. Constaté le 2026-09-04 sur
 * settings-branding : thème bleu par défaut au lieu du thème configuré, logo absent.
 *
 * On ne teste pas une condition métier (elle serait différente pour chaque shot) mais la
 * stabilité du rendu : deux captures identiques à 400 ms d'intervalle valent accord.
 */
async function settle(region, clip, { tries = 12, gap = 400 } = {}) {
  let previous = null;
  for (let i = 0; i < tries; i++) {
    const buf = await region.screenshot({ animations: 'disabled' });
    const current = buf.toString('base64');
    if (previous !== null && current === previous) return;
    previous = current;
    await page.waitForTimeout(gap);
  }
  throw new Error(`la zone ${clip} n'est jamais stabilisée après ${tries} essais`);
}

/**
 * Résout le sélecteur de cadrage en EXIGEANT une correspondance unique.
 * `.first()` masquait l'ambiguïté : le 2026-09-04, `.MuiPaper-outlined` a rendu une carte
 * KPI restée montée en arrière-plan au lieu du panneau visé. Un sélecteur ambigu est une
 * erreur de configuration, pas quelque chose à arbitrer silencieusement à l'exécution.
 */
async function resolveClip(tp, clip, frame) {
  const loc = tp.locator(clip);
  const n = await loc.count();
  if (n === 1) return loc;
  if (n === 0) throw new Error(`cadrage "${clip}" ne correspond à aucun élément`);
  const sizes = await frame.evaluate((sel) =>
    Array.from(document.querySelectorAll(sel)).map((el) => {
      const r = el.getBoundingClientRect();
      return `${Math.round(r.width)}x${Math.round(r.height)} :: ${(el.textContent || '').trim().slice(0, 40)}`;
    }), clip);
  throw new Error(
    `cadrage "${clip}" ambigu — ${n} correspondances. Précise le sélecteur.\\n        ` +
      sizes.join('\\n        '),
  );
}

/**
 * Navigue vers un onglet du shell PAR INDEX.
 *
 * Le libellé est traduit — « Documentation » devient « User Guide » — donc inutilisable
 * dans une boucle bilingue. L'index l'est. En contrepartie, un onglet ajouté décalerait
 * tout : on vérifie donc que le nombre d'onglets correspond toujours à NAV. Sans cette
 * garde, l'ajout d'un onglet ferait capturer l'écran voisin en silence — exactement le
 * genre de succès mensonger que cette chaîne existe pour éviter.
 */
async function gotoTab(tp, key) {
  const idx = NAV.indexOf(key);
  if (idx < 0) throw new Error(`onglet inconnu : "${key}"`);

  const tabs = tp.locator('.MuiAppBar-root [role="tab"]');
  const n = await tabs.count();
  if (n !== NAV.length) {
    const labels = await tabs.allTextContents();
    throw new Error(
      `la barre porte ${n} onglets, NAV en déclare ${NAV.length} — la navigation par index\\n` +
      `        n'est plus fiable. Mets NAV à jour.\\n        Onglets réels : ${labels.join(' | ')}`,
    );
  }
  await tabs.nth(idx).click({ timeout: 8_000 });
  await page.waitForTimeout(400);
}

// La bascule de langue est PERSISTÉE côté Extension Data : capturer laisse le produit
// dans la dernière langue utilisée. On mémorise l'état initial pour le restaurer à la fin —
// un outil de documentation ne doit pas modifier durablement les préférences de l'utilisateur.
let initialLang = null;

let ok = 0;
let failed = 0;

for (const shot of SHOTS) {
  if (only && shot.id !== only) continue;

  const langs = shot.lang === 'both' ? ['fr', 'en'] : [shot.lang ?? 'fr'];

  for (const lang of langs) {
    const target = join(OUT_ROOT, lang, `${shot.out}.png`);
    try {
      await page.goto(APP_URL, { waitUntil: 'domcontentloaded' });
      const { tp, frame } = await appContexts();

      // L'hydratation charge la préférence de langue depuis Extension Data et écrase
      // tout choix fait avant elle. On attend donc que l'app soit stable AVANT de basculer.
      await settle(tp.locator('#root'), '#root');
      if (initialLang === null) {
        initialLang = (await tp.locator(LANG_TOGGLE('fr')).getAttribute('aria-pressed')) === 'true' ? 'fr' : 'en';
      }
      await setLang(tp, lang, frame);
      // Un `prepare` qui échoue est presque toujours un libellé deviné ou un sélecteur
      // périmé. On relève ce qui est cliquable plutôt que de renvoyer un timeout nu.
      if (shot.nav) await gotoTab(tp, shot.nav);

      if (shot.prepare) {
        try {
          await shot.prepare(tp, page);
        } catch (err) {
          const nav = await frame.evaluate(() =>
            Array.from(document.querySelectorAll('[role="tab"], .MuiTab-root')).map((t) => ({
              texte: (t.textContent || '').trim().slice(0, 32),
              selected: t.getAttribute('aria-selected'),
            })),
          );
          throw new Error(
            `prepare a échoué : ${String(err.message).split('\\n')[0]}\\n        Onglets réellement présents :\\n        ` +
              (nav.length ? nav.map((t) => JSON.stringify(t)).join('\\n        ') : '(aucun)'),
          );
        }
      }
      // Pas de waitForLoadState('networkidle') : une iframe Azure DevOps ne devient jamais
      // idle (télémétrie, sondages). `settle` mesure la stabilité du RENDU, seul signal fiable.
      const region = await resolveClip(tp, shot.clip, frame);
      await settle(region, shot.clip);
      await sanitize(frame);

      await mkdir(dirname(target), { recursive: true });
      await region.screenshot({ path: target, animations: 'disabled' });

      console.log(`  OK    ${lang}  ${shot.id}  ->  ${target}`);
      ok++;
    } catch (err) {
      // Un shot qui échoue n'arrête pas les autres : c'est presque toujours un
      // sélecteur périmé, pas une panne de la chaîne.
      console.error(`  ÉCHEC ${lang}  ${shot.id}  :  ${String(err.message).split('\n')[0]}`);
      failed++;
    }
  }
}

// Restauration de la langue d'origine, sans faire échouer le run si elle n'aboutit pas.
if (initialLang) {
  try {
    await page.goto(APP_URL, { waitUntil: 'domcontentloaded' });
    const { tp, frame } = await appContexts();
    await settle(tp.locator('#root'), '#root');
    await setLang(tp, initialLang, frame);
    console.log(`  langue restaurée : ${initialLang.toUpperCase()}`);
  } catch {
    console.warn(`  (!)  langue non restaurée — le produit reste dans la dernière langue capturée`);
  }
}

await context.close();
console.log(`\n  ${ok} capture(s) écrite(s), ${failed} en échec.`);
if (failed > 0) {
  console.log('  Rejoue avec --headed pour voir ce que fait le navigateur.');
  console.log("  Vérifie le sélecteur dans l'application avant de conclure au bug produit.");
}
process.exit(failed > 0 ? 1 : 0);
