# Plan — Documentation TestPulse (Mintlify i18n + synchro + build)

> **Version** : 0.1 · **Date** : 2026-07-01 · Voir `constitution.md`, `spec.md`, `tasks.md`.

## §1 — Structure Mintlify & i18n EN/FR
- **Localisation native** via `docs.json` → `navigation.languages` : deux blocs (`en`, `fr`), chacun sa nav.
- **Arborescence miroir** : pages sous `en/…` et `fr/…` (mêmes chemins relatifs). Défaut = `en`.
- Composants : `<Steps>`, `<Tabs>`, `<CardGroup>/<Card>`, `<Accordion>`, `<Frame>` (captures), `<Note>/<Warning>/<Tip>`.
- `docs.json` : `name` = TestPulse, `colors`, `logo` (light/dark), `favicon`, `navbar`, `footer`. **Aucune** clé/asset TestForge.

## §2 — Domaine
- **`atconseil.info/docs`** = sous-chemin ⇒ **reverse-proxy** (Mintlify natif = sous-domaine). Réglage hébergement côté Alexandre (proxy `/docs` → déploiement Mintlify). Documenté hors-repo.

## §3 — Synchro avec le guide in-app
- **Mintlify = canonique.** Étape ultérieure (hors ce scaffold) : condenser `doc-content.ts` en pointeurs vers les pages Mintlify (éviter double maintenance). **Ne pas** modifier `doc-content.ts` dans ce chantier sans un patch dédié côté repo produit.

## §4 — Flux de travail (local-first)
- Claude **écrit en local** dans `E:\Code\testpulse-docs` (PowerShell, UTF-8 no-BOM). **Alexandre push** (procédure fournie). Aperçu local : `mint dev`.
- **Site valide à chaque commit** : la nav `docs.json` ne référence que des pages **existantes** ; on étend section par section.

## §5 — Vérifications (règles Alexandre)
- **Pas de code** ici ⇒ « test-first / routes API / API externes / LLM » = **N/A** (doc statique). Ce qui s'applique : **exactitude vs produit**, **parité EN/FR**, **zéro terme interdit / zéro TestForge**, **cohérence version 2.26.0**, **liens valides**.
- Garde anti-régression : ne jamais introduire de contradiction avec `doc-content.ts` / `overview.md`.

## §6 — Build incrémental
- Phase par section (voir `tasks.md`). Chaque section : pages EN+FR + entrée nav + revue exactitude. `mint dev` vert (aucun lien cassé) avant de passer à la suivante.

---
*Chaque section livrée est complète (EN+FR) et le site reste déployable.*