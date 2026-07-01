# Constitution — Documentation TestPulse (Mintlify)

> **Projet** : doc vivante / onboarding TestPulse · **Version** : 0.1 · **Date** : 2026-07-01 · **Auteur** : Alexandre (Kisskool)
> **Cible** : `atconseil.info/docs` (sous-chemin ⇒ reverse-proxy) · **Repo** : `testpulse-docs` (GitHub) ↔ `E:\Code\testpulse-docs` · **Moteur** : Mintlify.
> **Langues** : **EN + FR** (localisation native Mintlify, parité obligatoire).

## Changelog
- 0.1 (2026-07-01) : création. Invariants §1→§7, IA dans `spec.md`, i18n+synchro dans `plan.md`, build phasé dans `tasks.md`.

## Mission
Une doc de référence **exhaustive** (chaque écran, chaque paramètre, chaque fonctionnalité) **+ un parcours guidé d'onboarding**, en **EN & FR**, canonique et vivante, alignée sur le produit et sur le guide in-app.

## §1 — Séparation stricte des produits (invariant dur)
- **TestPulse UNIQUEMENT.** **Zéro** contenu, lien, mention ou renvoi vers **TestForge** dans ces docs. Déploiement, repo et domaine **séparés** de TestForge.
- Termes **interdits** (copie externe) : TestForge, TFS Reporter, Pro/Enterprise tier, paywall, license flag, €12, sur devis, Wave 1/2, AI inside.

## §2 — Source de vérité & synchro
- **Mintlify = canonique riche.** Le guide in-app `doc-content.ts` devient un **quick-reference condensé qui pointe vers Mintlify** (pas de double copie longue).
- Toute page dérive du **produit réel** (repo `TFS_Reporter_Addon` : `doc-content.ts`, `overview.md`, README, CHANGELOG, spec-kits). **Ne rien inventer** : si un comportement est incertain ⇒ vérifier le code, sinon marquer TODO.

## §3 — Parité linguistique
- **Chaque page existe en EN et FR.** Une page ne sort pas tant que les deux langues ne sont pas présentes (parité = critère de fini). Structure miroir `en/` ↔ `fr/`.

## §4 — Exactitude & non-régression
- **Versions/faits vérifiés** contre le repo (version publiée courante = **2.26.0**). Captures d'écran datées de la version.
- À chaque évolution produit : la doc est mise à jour (surface doc). **Pas de contradiction** avec `doc-content.ts`.

## §5 — Exactitude technique produit (rappels invariants TestPulse)
- **100% client-side, zéro backend.** **Lecture seule SAUF** la création de plans opt-in du **Coverage Builder** (`vso.test_write` légitime).
- Cibles : **ADO Services (cloud) + Server 2022.1 on-prem**. Gratuit, sans palier.
- Scopes réels : `vso.test`, `vso.work`, `vso.identity`, `vso.build`, `vso.test_write`.

## §6 — Style
- Ton clair, orienté tâche, phrases courtes. Composants Mintlify (Steps, Tabs, Cards, Accordions, Frames) plutôt que murs de texte. Un **parcours guidé** (Quickstart « premier rapport en 5 min »).

## §7 — Ce que ces docs NE sont PAS
- ⛔ Pas un funnel vers un produit payant. ⛔ Pas de contenu TestForge. ⛔ Pas de promesse de fonctionnalité non livrée. ⛔ Pas de secret/URL/tenant client.

---
*Voir `spec.md` (IA + personas), `plan.md` (i18n Mintlify + synchro + build), `tasks.md` (phases).*