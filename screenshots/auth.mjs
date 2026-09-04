// auth.mjs — connexion manuelle UNE fois. Le profil de navigateur reste sur disque.
//
//   node auth.mjs
//
// Pourquoi un profil persistant et pas un `storageState` : avec un compte Microsoft,
// l'authentification ne tient pas dans les seuls cookies des origines visitées. Un profil
// complet conserve tout ce dont Azure DevOps a besoin, et survit d'une exécution à l'autre.
// Mesuré le 2026-09-04 : `storageState` obligeait à se reconnecter à chaque capture.
//
// `.profile/` contient une session valide. Il est dans .gitignore.
// NE JAMAIS le commiter. À rejouer si une capture échoue sur une page de connexion.

import { chromium } from 'playwright';
import { PROFILE_DIR, APP_URL, VIEWPORT } from './shots.config.mjs';

const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
  headless: false,
  viewport: VIEWPORT,
});

const page = ctx.pages()[0] ?? (await ctx.newPage());
await page.goto(APP_URL);

console.log("\n  Connecte-toi dans la fenêtre qui vient de s'ouvrir.");
console.log('  Quand TestPulse est affiché, reviens ici et appuie sur Entrée.\n');

process.stdin.resume();
await new Promise((resolve) => process.stdin.once('data', resolve));

await ctx.close();
console.log(`  Profil enregistré dans ${PROFILE_DIR} — ne le commite jamais.`);
process.exit(0);