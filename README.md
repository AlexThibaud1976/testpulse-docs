# TestPulse Docs

Documentation officielle de **TestPulse** (extension Azure DevOps, éditeur Kisskool), propulsée par **Mintlify**, bilingue **EN + FR**.

- 🌐 **En ligne** : https://docs.atconseil.info
- 🧩 Marketplace : https://marketplace.visualstudio.com/items?itemName=Kisskool.testpulse
- 🏢 Site : https://atconseil.info

## Développement local

```bash
npm i -g mint      # CLI Mintlify
mint dev           # prévisualisation locale
```

## Structure

- `docs.json` — configuration (thème, navigation EN/FR, SEO/canonical).
- `en/`, `fr/` — pages MDX par langue.
- `Specs/docs-v1/` — spec-kit de la documentation (constitution / spec / plan / tasks).

## Déploiement

Push sur la branche par défaut ⇒ Mintlify build & déploie automatiquement sur `docs.atconseil.info`.
Domaine = **sous-domaine** : CNAME `docs` → `cname.mintlify.builders` (DNS only chez Cloudflare), TLS Let''s Encrypt auto. Runbook complet : `Specs/docs-v1/plan.md`.