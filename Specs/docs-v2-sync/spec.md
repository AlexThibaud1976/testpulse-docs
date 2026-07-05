# Spec — docs-v2-sync : synchronisation web post-2.30.0

**Version :** 1.0 · **Date :** 2026-07-05 · **Auteur :** Claude (validé Alexandre)
**Dialecte :** spec-kit AT Conseil, version allégée (spec.md + tasks.md) — projet documentaire, pas de code applicatif.
**Portée cross-repo :** `testpulse-docs` (Mintlify, docs.atconseil.info) + `atconseil-info/public/testpulse` (landing).

---

## 1. Problème

Le produit est en **2.30.0** (2026-07-04) mais les deux surfaces web externes se sont figées au 2026-07-01 :

- **Landing** : badge héro, `whatsnew.json` et section Nouveautés en **v2.24.4** ; la grille de fonctionnalités ignore le Cockpit.
- **Doc Mintlify** : aucune page Cockpit, Dérive d'exigences, matrice Suite × Configuration, ni changelog en ligne ; `coverage-builder/overview` décrit un Planning scan **obsolète** (« énumère plans → suites → cas de test » — faux depuis le correctif de résolution inversée par cas de test) ; `work-item/test-coverage-tab` s'arrête aux fonctionnalités antérieures au tri de colonnes et aux liens run/plan.

## 2. Invariants (hérités de la constitution produit + docs-v1)

- TestPulse **100 % gratuit**, zéro backend, lecture seule (exception unique : création de plan du Coverage Builder).
- **Parité FR/EN stricte** : chaque page/clé existe dans les deux langues, contenu équivalent.
- **Termes interdits** dans toute copie externe : codes F-xx, labels de vague, TestForge, tier/paywall/licence, « PDF-only » (signature = PDF + Word), badges « AI inside ».
- Langage des signaux : **advisory** — « des indicateurs à examiner, jamais un verdict — c'est vous qui décidez ».
- Exactitude technique : ne jamais documenter un comportement contredit par le code livré (leçon Planning scan).
- Aucune donnée sensible ; liens Marketplace = `Kisskool.testpulse`.

## 3. Périmètre validé (décisions Alexandre, 2026-07-05)

- **Landing : mise à jour complète** — badge 2.30.0, section Nouveautés (2 cartes : pack Insights + Cockpit), grille features remaniée pour donner une carte au Cockpit (6 cartes conservées : Collaboration fusionne avec Config), liens changelog pointés vers la doc en ligne.
- **Mintlify : tout** — correction de l'existant + 3 nouvelles pages (Cockpit, Dérive d'exigences, matrice Suite × Configuration) + **page changelog en ligne** (EN + FR), navigation mise à jour.
- **Skill `testpulse-release-sync`** créé après la synchro (hors de cette spec, tâche T-9).

## 4. User stories

- **US-1** — En tant que visiteur de la landing, je vois la version courante (2.30.0) et les deux derniers apports majeurs (Cockpit, pack Insights) sans ouvrir le Marketplace.
- **US-2** — En tant que QA lecteur de la doc, je trouve une page **Cockpit** décrivant le burndown honnête, « quoi exécuter aujourd'hui » et la charge restante, avec leurs garde-fous (médiane, projection suspendue, états honnêtes).
- **US-3** — En tant que QA, je trouve une page **Dérive d'exigences** couvrant le delta d'US, les candidates au drift et la **couverture périmée** (« N Passed ne prouvent plus rien »).
- **US-4** — En tant que test manager, je trouve une page **matrice Suite × Configuration** (états, trous assumés, marquages « non applicable » partagés, exports).
- **US-5** — En tant que lecteur du Coverage Builder, la description du Planning scan reflète le comportement réel (résolution par cas de test, pas d'énumération de plans, dégradation ⇒ réputé planifié) et la colonne **Plans** + liens **execute** sont documentés.
- **US-6** — En tant que lecteur de la fiche work item, la doc mentionne le tri des colonnes, le lien vers le run, le lien « Exécuter dans Azure DevOps » du plan cadré et le badge « Modifiée après le dernier run ».
- **US-7** — En tant qu'utilisateur, je consulte un **changelog en ligne** (versions récentes détaillées, historique complet renvoyé vers GitHub).

## 5. Critères d'acceptation transverses

- `docs.json` référence chaque nouvelle page dans **les deux** langues ; aucune page orpheline.
- Aucun code F-xx ni terme interdit dans les 12+ fichiers touchés (sweep final).
- La landing reste fonctionnelle sans i18n.js (fallbacks FR de `index.html` alignés sur `fr.json`).
- `whatsnew.json` : version `v2.30.0`, `visible: true`, liens par langue vers `/fr/changelog` et `/en/changelog`.
- Aucune écriture hors des deux repos ; push et déploiement = Alexandre.
