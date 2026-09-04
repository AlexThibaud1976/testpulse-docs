# Captures de la documentation TestPulse

Chaîne reproductible de production des visuels de `docs.atconseil.info`.
Hors périmètre de publication : le dossier est exclu par `.mintignore`.

## Pourquoi un script et pas des captures à la main

Une capture est un contenu **périmable**, au même titre qu'un « 4 onglets » écrit en dur dans
une page. La différence est qu'une image périmée inspire plus confiance qu'un texte périmé,
donc elle nuit davantage. Le seul moyen de la maintenir est de pouvoir la **rejouer à
l'identique** : même viewport, mêmes données, même cadrage.

C'est aussi ce qui rend la parité FR/EN abordable. Le produit porte un sélecteur de langue :
capturer les deux langues est une boucle, pas un doublement du travail.

## Mise en route

```bash
cd screenshots
npm install
node auth.mjs      # une fois : connexion manuelle, profil de navigateur conservé
node capture.mjs   # à volonté
```

Options : `--only <id>` pour une seule capture, `--headed` pour voir le navigateur.

`.profile/` contient une session valide. Il est dans `.gitignore` — **ne jamais le commiter**.
À rejouer si une capture échoue sur une page de connexion.

> Un `storageState` ne suffit pas ici : l'authentification par compte Microsoft s'appuie sur
> plusieurs domaines traversés à la redirection. Seul un profil complet survit d'une
> exécution à l'autre. Mesuré le 2026-09-04.

## Relever la structure d'un écran

**Toujours avant d'écrire un `clip` ou un `prepare`.**

```bash
node inspect.mjs <id-du-shot>
```

N'écrit aucune capture. Navigue jusqu'à l'écran et relève les `[role="tablist"]` visibles,
les douze plus grands conteneurs `MuiPaper` avec leurs dimensions, et les `data-testid`
présents.

Cet outil existe parce que trois sélecteurs déduits ont coûté trois allers-retours le
2026-09-04, là où un relevé a réglé le problème en un tour. Quand on ne peut pas mesurer,
on construit l'instrument — on ne devine pas.

## Ajouter une capture

Une entrée dans `shots.config.mjs`, rien d'autre.

```js
{
  id: 'sessions-hub',                       // identifiant, sert à --only
  doc: 'exploratory/sessions-hub',          // page de doc concernée
  out: 'sessions-hub',                      // nom de fichier, sans extension
  lang: 'both',                             // 'fr' | 'en' | 'both'
  nav: 'explore',                           // clé de NAV — navigation par INDEX
  clip: '[data-testid="explore-hub-root"]', // doit être UNIQUE
  prepare: async (tp, page) => { /* … */ },
}
```

Sortie : `images/{fr|en}/{out}.png`.

## Contraintes structurelles relevées sur l'instance

**L'application vit dans une iframe cross-origin** (`gallerycdn.vsassets.io`). Deux contextes :
le frame hôte pour le chrome Azure DevOps, le frame app pour TestPulse. Un `page.evaluate` ne
franchit pas cette frontière.

**La navigation se fait par INDEX**, jamais par libellé. MUI `<Tab>` n'émet pas sa prop `value`
dans le DOM, et les libellés sont traduits — « Documentation » devient « User Guide », changeant
de mot et de sens. `NAV` porte l'ordre réel des onglets ; si leur nombre change, le script
échoue bruyamment plutôt que de capturer l'écran voisin.

**Les onglets ne se démontent pas.** L'écran précédent reste dans le DOM. Tout cadrage doit donc
être ancré sur quelque chose de propre à l'écran visé — une classe générique attraperait un
élément d'un autre onglet. Un `clip` ambigu est traité comme une erreur de configuration, pas
arbitré silencieusement.

**L'hydratation est tardive.** Les préférences arrivent d'Extension Data après le premier rendu.
`settle()` attend la stabilité du **rendu** — deux captures identiques à 400 ms d'intervalle.
`waitForLoadState('networkidle')` ne convient pas : une iframe Azure DevOps ne devient jamais
idle, entre télémétrie et sondages.

**La langue est persistée.** Capturer laisserait le produit dans la dernière langue utilisée ;
le script restaure l'état initial en fin d'exécution.

## Confidentialité

Le meilleur masquage est un cadrage qui n'inclut pas la donnée. Aucun `clip` actuel ne contient
l'AppBar, donc ni adresse e-mail ni nom de projet n'apparaissent. `APP_REDACTIONS` et
`HOST_REDACTIONS` restent en place pour le jour où un cadrage devra inclure l'en-tête.

Attention aux données affichées **dans** l'écran : le hub Explore montrait le prénom du testeur
dans son filtre par défaut, retiré via « Afficher tout le projet ».

Utiliser un projet de démonstration, jamais un projet client, même pour un essai. Et **regarder
chaque capture** avant de la committer : une image publiée est indexée avant qu'on l'ait relue.

## Péremption

Une release qui touche un écran périme ses captures. Le release-sync doit lister celles à
rejouer selon la surface touchée, exactement comme il liste les pages à relire.

Deux cas connus : l'écran Documentation affiche un chip de version, donc périmé à chaque
release ; et la 2.69.0 a changé le tableau des pièces jointes du PDF.

## Non couverts, et pourquoi

- **Barre d'export** : exige de générer un rapport, ce qui crée un brouillon persistant dans
  l'historique. Effet de bord à arbitrer avant automatisation.
- **Rendus PDF** (`cover-page`, `formats`) : ce sont des documents produits, pas des écrans.
  Procédure distincte.
- **Réaffectation en masse** : exclue délibérément, l'opération est irréversible.