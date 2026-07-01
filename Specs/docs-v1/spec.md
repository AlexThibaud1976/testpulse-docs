# Spec — Documentation TestPulse : IA & inventaire de pages

> **Version** : 0.1 · **Date** : 2026-07-01 · Voir `constitution.md`, `plan.md`, `tasks.md`.

## 1. Personas
- **Hugo (PO / Test Manager)** : veut un rapport pro + un verdict GO/NO-GO, sans coder.
- **Inès (QA / dev)** : couverture, profondeur, échecs, exports, traçabilité.
- **Karim (Admin ADO)** : installation (cloud + on-prem), permissions, sécurité, configuration.
- **Léa (nouvelle venue)** : onboarding — « premier rapport en 5 min ».

## 2. Architecture d'information (blueprint complet — EN & FR)
> Chaque entrée = une page bilingue. `[G]` = guidé/onboarding.

**Prise en main** — introduction · ce que c'est / n'est pas · cibles (cloud + Server 2022.1) · installation (Marketplace) · installation (on-prem .vsix) · prérequis · **[G] Quickstart : premier rapport en 5 min** · **[G] tour du produit**
**Concepts** — modèle Test Plans → Suites → Cas · traçabilité & hiérarchie · lecture seule + Coverage Builder · statuts & résultats
**Générer un rapport** — ouvrir le hub · sélectionner un plan · champs du formulaire · validation · page de garde (libellé vs titre, choix des champs) · templates & vues sauvegardées · processus de génération
**Exports** — comparaison des formats · PDF · HTML · Word · Excel · PowerPoint · visibilité des boutons d'export · signature (PDF & Word)
**Qualité & décision** — profondeur de couverture · Quality Gate & grade A–E · verdict GO/NO-GO · échecs sans défaut
**Sur la fiche (Work Item)** — onglet Test coverage · sélecteur de portée (plan) · verdict d'exécution (Passed / Not OK / Not Run / Non couvert)
**Dashboard** — widget « Quality overview » · configuration du widget
**Coverage Builder** — générer un plan/suites depuis des exigences (opt-in, écriture)
**Tendances & collaboration** — historique & recherche · tendances · notifications Teams/Slack · rapports planifiés
**Configuration** — paramètres généraux · configuration des champs · associated build · import de résultats (JUnit/NUnit/xUnit)
**Sécurité** — confidentialité (100% client-side, aucune donnée ne sort d'ADO) · permissions & scopes
**Référence** — FAQ / dépannage · changelog · glossaire

## 3. Exigences
- **Parité EN/FR** sur chaque page (critère de fini).
- Chaque page « écran » documente **tous les champs/paramètres** de l'écran.
- Onboarding : Quickstart pas-à-pas (Steps) + tour (Cards).
- Zéro terme interdit ; zéro mention TestForge ; cohérence version 2.26.0.

## 4. Critères de fini (par page)
Front-matter (title/description/icon) · contenu dérivé du produit · **EN + FR présents** · composants Mintlify utilisés · liens internes valides · aucun terme interdit.

---
*IA = blueprint ; la navigation `docs.json` grandit section par section (site valide à chaque étape).*