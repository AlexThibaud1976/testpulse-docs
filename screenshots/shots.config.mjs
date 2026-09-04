// shots.config.mjs — la liste des captures, et rien d'autre.
//
// STRUCTURE — relevée sur l'instance réelle le 2026-09-04, jamais déduite.
// L'application tourne dans une iframe cross-origin (gallerycdn.vsassets.io) : deux
// contextes distincts, le frame hôte (chrome Azure DevOps) et le frame app (TestPulse).

export const ORG_URL = 'https://dev.azure.com/ATCONSEIL';
export const PROJECT = 'DEMO3';
export const HUB_ID = 'Kisskool.testpulse.testpulse-hub';
export const APP_URL = `${ORG_URL}/${PROJECT}/_apps/hub/${HUB_ID}`;

export const APP_FRAME = 'iframe.external-content--iframe';
export const PROFILE_DIR = '.profile';

export const VIEWPORT = { width: 1600, height: 1000 };
export const SCALE = 2;

// ── Navigation ──────────────────────────────────────────────────────────────
// MUI <Tab> n'émet PAS sa prop `value` dans le DOM : seul le nom accessible existe,
// et il est traduit. « Documentation » devient « User Guide » — le libellé change de
// mot ET de sens. Naviguer par libellé casserait donc la boucle bilingue.
//
// On navigue par INDEX, seul repère indépendant de la langue. La liste ci-dessous est
// l'ordre réel de la barre, relevé le 2026-09-04. Si le nombre d'onglets change, le
// script échoue bruyamment plutôt que de capturer l'écran voisin.
export const NAV = [
  'report', 'explore', 'cockpit', 'drift', 'coverage',
  'repository', 'import', 'history', 'bulk', 'settings', 'docs',
];

/**
 * Zone de contenu du shell, hors AppBar et barre d'onglets.
 * Structure vérifiée : #root → Box racine → [AppBar, progression?, message?, contenu].
 * Les Snackbars partent en portal sur body, donc le dernier enfant est bien le contenu.
 */
export const CONTENT = '#root > div > div:last-of-type';

// ── Anonymisation ───────────────────────────────────────────────────────────
// Le contenu est REMPLACÉ, pas caché : cacher déformerait la mise en page.
// L'AppBar porte l'e-mail et le chip projet — vérifié : "TestPulseFRENDEMO3alexandre…".
export const APP_REDACTIONS = [
  { selector: '.MuiToolbar-root .MuiTypography-caption', text: 'demo@example.com' },
  { selector: '.MuiToolbar-root .MuiChip-label',         text: 'DEMO' },
];

export const HOST_REDACTIONS = [
  { selector: '[aria-label="Breadcrumb"] a[aria-describedby$="described-byCollection"] .bolt-breadcrumb-item-text', text: 'CONTOSO' },
  { selector: '[aria-label="Breadcrumb"] a[aria-describedby$="described-byProject"] .bolt-breadcrumb-item-text',    text: 'DEMO' },
];

export const HOST_HIDE = [
  'div[data-renderedregion="navigation"]',
  '[role="search"]',
];

export const LANG_TOGGLE = (lang) =>
  `.MuiToggleButtonGroup-root .MuiToggleButton-root[value="${lang}"]`;

// ── Les captures ────────────────────────────────────────────────────────────
// nav     : clé de NAV. Navigation par index, insensible à la langue.
// clip    : sélecteur DANS le frame app. Doit être UNIQUE (une ambiguïté = une erreur).
// prepare : interactions APRÈS la navigation. Reçoit (tp, page).

export const SHOTS = [
  {
    id: 'settings-branding',
    doc: 'configuration/settings-and-import',
    out: 'settings-branding',
    lang: 'both',
    nav: 'settings',
    clip: '.MuiPaper-root.MuiPaper-outlined:has([role="tablist"])',
    // Le rail de gauche est un SECOND [role="tablist"], à l'intérieur du carton outlined.
    // La barre principale, elle, vit dans l'AppBar (MuiPaper-elevation) : le scope suffit
    // à les distinguer sans dépendre d'un aria-label traduit.
    prepare: async (tp) => {
      await tp.locator('.MuiPaper-outlined [role="tablist"] [role="tab"]').nth(1)
        .click({ timeout: 8_000 });
    },
  },
  {
    id: 'quickstart-report',
    doc: 'getting-started/quickstart',
    out: 'quickstart-01-report',
    lang: 'both',
    nav: 'report',
    clip: CONTENT,
    // État d'arrivée : formulaire à gauche, panneau droit « Aucun rapport généré ».
  },
  {
    id: 'cockpit-empty',
    doc: 'cockpit/execution-cockpit',
    out: 'cockpit-01-no-plan',
    lang: 'both',
    nav: 'cockpit',
    clip: CONTENT,
    // Sans plan sélectionné, seul le combobox est rendu. C'est l'état d'arrivée.
  },
  {
    id: 'explore-hub',
    doc: 'exploratory/sessions-hub',
    out: 'sessions-hub',
    lang: 'both',
    nav: 'explore',
    clip: '[data-testid="explore-hub-root"]',   // seul écran correctement instrumenté
    // Le hub applique de lui-même un filtre sur le testeur courant, dont le PRÉNOM
    // s'affiche alors dans le combobox — donnée personnelle sur une doc publique.
    // « Afficher tout le projet » le retire, et donne au passage une capture plus juste :
    // un inventaire complet plutôt qu'une vue personnelle. Sélecteur structurel.
    prepare: async (tp) => {
      const notice = tp.locator('[data-testid="explore-hub-default-tester-notice"] button');
      if (await notice.count()) await notice.first().click({ timeout: 8_000 });
    },
  },
  {
    id: 'repository-hygiene',
    doc: 'test-repository/overview',
    out: 'repository-hygiene',
    lang: 'both',
    nav: 'repository',
    clip: CONTENT,
    // Vue Hygiène par défaut, avant analyse : c'est l'état d'arrivée.
  },
  {
    id: 'import-dropzone',
    doc: 'reports/generation-and-templates',
    out: 'import-dropzone',
    lang: 'both',
    nav: 'import',
    clip: `${CONTENT} .MuiPaper-root >> nth=0`,
  },
  {
    id: 'history-list',
    doc: 'collaboration/history',
    out: 'history-list',
    lang: 'both',
    nav: 'history',
    clip: CONTENT,
  },

  // ── Non couverts, et pourquoi ─────────────────────────────────────────────
  // export-buttons : exige de GÉNÉRER un rapport, ce qui crée un brouillon persistant
  //                  dans l'historique. Effet de bord à arbitrer avant de l'automatiser.
  // docs           : l'écran affiche un chip de version — périmé à chaque release.
  // cover-page     : décrit un PDF produit, pas un écran. Procédure distincte.
  // bulk           : exclu délibérément, l'opération est irréversible.
];
