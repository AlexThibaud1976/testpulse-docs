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

---

## Runbook déploiement — domaine `docs.atconseil.info` (2026-07-01)

**Choix** : sous-domaine (pas `atconseil.info/docs` en sous-chemin — le reverse-proxy Mintlify est Enterprise, incompatible mutualisé).

**Autorité DNS** : **Cloudflare** (et NON OVH — la zone OVH d''atconseil.info est non-autoritaire/morte). Tout se règle chez Cloudflare.

**Enregistrements (dans cet ordre)** :
1. `TXT _acme-challenge.docs` = valeur dashboard Mintlify (autorise Let''s Encrypt).
2. `TXT _cf-custom-hostname.docs` = valeur dashboard (prouve le contrôle du domaine).
3. Attendre les 2 coches vertes dans Mintlify.
4. `CNAME docs` → `cname.mintlify.builders` — **DNS only (nuage gris)**, jamais proxied.

**Gotchas vérifiés** :
- **HSTS `includeSubDomains`** actif sur l''apex ⇒ le certificat TLS doit être prêt **avant** que le CNAME serve du trafic, sinon `docs.` injoignable. L''ordre TXT→vérif→CNAME le garantit.
- Record `docs` en **DNS only** ⇒ les réglages edge Cloudflare (SSL mode, Always Use HTTPS) **ne s''appliquent pas** au sous-domaine (trafic direct vers Mintlify) → provisioning Let''s Encrypt OK.
- `/.well-known/acme-challenge` ne doit jamais être réécrit (réservé validation cert).
- Aucun CAA sur atconseil.info ⇒ Let''s Encrypt non bloqué.

**État final vérifié (18h45)** : `docs → cname.mintlify.builders` (DNS only, résolu 8.8.8.8/1.1.1.1) ; cert **Let''s Encrypt `CN=docs.atconseil.info`** valable → 29/09/2026 ; HTTPS `308 → /en` (scaffold EN/FR servi).

**Changements associés** :
- `docs.json` → `seo.metatags.canonical = https://docs.atconseil.info` (SEO, évite le duplicate avec l''URL `*.mintlify.app`).
- Redirection `atconseil.info/docs → docs.atconseil.info` : `RewriteRule ^docs/?$ [R=301,L]` ajoutée au `.htaccess` du site (E:\Code\atconseil-info) — **staged**, se déploie au prochain push FTP. Alternative edge : Cloudflare Redirect Rule (n''utiliser qu''une seule des deux).

**Nettoyage effectué** : restes TXT `_acme-challenge`/`_cf-custom-hostname` sur l''apex + sur `testpulse.` supprimés (on garde le trio `docs.*`).

**⚠️ Hors périmètre doc — à traiter** : `_visual-studio-marketplace-kisskool TXT` (vérif éditeur Kisskool sur le Marketplace VS) n''existe **que** dans la zone OVH morte → **absent de Cloudflare (autoritaire)** → vérification éditeur potentiellement cassée. À re-poser dans Cloudflare (valeur relevée : `7dc3acae-61e1-449d-bf3a-d0361f19e7fa`, à re-confirmer sur le profil éditeur avant pose).