# Tasks — docs-v2-sync

**Version :** 1.0 · **Date :** 2026-07-05 · Voir `spec.md` pour le périmètre et les invariants.

## Phase 1 — Landing (`E:\Code\atconseil-info\public\testpulse`)
- [x] T-1 `whatsnew.json` → v2.30.0 (2026-07-04), FR/EN, liens par langue vers le changelog Mintlify (US-1)
- [x] T-2 `i18n/fr.json` + `i18n/en.json` : badge héro 2.30.0, grille features (carte Cockpit, fusion Collaboration+Config), section Nouveautés (Insights + Cockpit), lien changelog (US-1)
- [x] T-3 `index.html` : fallbacks FR alignés (badge, taglines wn-cards, desc Nouveautés, cartes i1/i2), href du lien changelog (US-1)

## Phase 2 — Mintlify : nouvelles pages (`E:\Code\testpulse-docs`)
- [x] T-4 `en|fr/cockpit/execution-cockpit.mdx` (US-2)
- [x] T-5 `en|fr/quality/requirement-drift.mdx` (US-3)
- [x] T-6 `en|fr/reports/suite-configuration-matrix.mdx` (US-4)
- [x] T-7 `en|fr/changelog.mdx` — composants `<Update>`, versions 2.25.0→2.30.0 détaillées + renvoi GitHub pour l'historique (US-7)

## Phase 3 — Mintlify : corrections de l'existant
- [x] T-8a `en|fr/coverage-builder/overview.mdx` : Planning scan corrigé + section colonne Plans & liens execute (US-5)
- [x] T-8b `en|fr/work-item/test-coverage-tab.mdx` : tri, lien run, lien plan execute, badge « Modifiée après le dernier run » (US-6)
- [x] T-8c `en|fr/index.mdx` : cartes Cockpit + Dérive dans « Ce que vous pouvez faire »
- [x] T-8d `docs.json` : groupes Cockpit + Changelog, pages Dérive et Matrice dans les groupes existants, EN + FR

## Phase 4 — Vérification & clôture
- [x] T-9 Sweep termes interdits (F-xx, vagues, TestForge, tier/paywall, PDF-only) sur tous les fichiers touchés
- [x] T-10 Relecture cohérence : parité FR/EN, aucune page orpheline dans `docs.json`, liens internes valides
- [x] T-11 Skill `testpulse-release-sync` (hors repo doc — livré séparément)
- [ ] T-12 Alexandre : `mint dev` en local, push des deux repos, vérif live (docs.atconseil.info + atconseil.info/testpulse)
