# Rejouer le pilote documentaire

Vérifié le 12 octobre 2026 sur TestPulse 2.73.1, Azure DevOps Services. Ce dossier est exclu de la publication par `.mintignore`.

## Périmètre

Les quatre pages `tutorials/demo-project`, `first-report`, `understand-no-go` et `exploratory-session` existent en français et en anglais. Trois aides courtes dans l'extension pointent vers les ateliers correspondants, dans la langue active. Les références existantes conservent leurs URL.

## Jeu de rejeu observé

Dans le projet DEMO3 de l'organisation ATCONSEIL :

| Objet | Identifiant | État observé |
| --- | --- | --- |
| Plan TP-DOC — Boutique démo | 3062 | Contient le parcours documentaire |
| Suite statique TP-DOC — Parcours de commande | 3069 | Trois cas, une configuration |
| TP-DOC-01 — Ajouter un produit au panier | 3064 | Passed, dernier run 54 |
| TP-DOC-02 — Refuser une adresse vide | 3065 | Failed, dernier run 55 |
| TP-DOC-03 — Appliquer un code promotionnel | 3066 | Point Active, aucune exécution |
| User Story TP-DOC — Sécuriser la livraison | 3067 | Hôte de la session Explore |
| Bug TP-DOC — Adresse vide acceptée à la livraison | 3068 | Créé depuis la session, lié à l'US |
| Task [Explore] TP-DOC — Vérifier le refus d’une adresse de livraison vide | 3070 | Closed, tags exploratory-session / Failed / tp-doc-boutique |

La suite racine 3063 contient aussi les mêmes cas : elle a servi au premier essai et a produit les runs 52 et 53. Ne pas confondre ces anciens résultats avec les derniers points de la sous-suite 3069. Le rapport final comporte trois cas courants et cinq lignes historiques, dont la ligne du cas sans résultat.

Le rapport final a été généré, retrouvé dans l'historique personnel et rechargé : trois cas, réussite 50 %, exécution 67 %, Strict D 67/100, NO-GO. Le profil Strict était celui du projet ; les captures ne demandent pas au lecteur de changer son barème.

La Task 3070 possède une capture PNG annotée et le PDF de session joint depuis Explore. Le téléchargement local et le contenu du PDF restent à contrôler manuellement. L'accès automatique à la page interne des téléchargements a été refusé par la politique du navigateur ; aucune tentative de contournement n'a été faite.

## Points révélés par le rejeu

- En 2.73.1, les cas présents uniquement à la racine peuvent être absents du dénominateur lorsque le rapport retombe sur les seuls runs. Le jeu publié demande une sous-suite explicite.
- Le bouton Actualiser recharge la liste des plans. Après création d'une suite, sélectionner réellement un autre plan puis revenir ; vider le sélecteur ne suffit pas. Un rechargement complet de la page a permis de relire la nouvelle suite lors du pilote.
- Le point non exécuté peut apparaître `None` avec `Invalid Date` dans la table. Vérifier le point Active et l'absence de run dans Azure Test Plans plutôt que l'infobulle. Les indicateurs de l'exemple comptent bien trois cas.
- La vignette de capture ne s'affichait pas dans la Timeline active. Le PNG annoté était néanmoins visible dans les pièces jointes de la Task archivée. Ne pas déduire une perte de preuve de la seule vignette.
- L'ajout du PDF à la Task n'affiche pas de toast de réussite : contrôler les pièces jointes avant de répéter l'action.

Ces constats sont documentés ou conservés pour investigation produit. Ils ne sont pas corrigés par ce lot documentaire.

## Contrôles à chaque évolution

1. Rejouer les étapes depuis le jeu décrit dans la documentation, avec une seule configuration et le profil effectivement en vigueur.
2. Contrôler le périmètre, les dernières issues, les plafonnements et la provenance des bugs.
3. Exporter, ouvrir les PDF et comparer leurs données ; retrouver l'instantané et la Task.
4. Reprendre les captures FR/EN concernées, vérifier leur lisibilité et l'absence d'informations de compte/client. Mettre à jour `pilot-manifest.json`.
5. Lancer `node scripts/validate-docs.mjs`, `mint validate --telemetry false`, puis contrôler visuellement la prévisualisation.
6. Faire réaliser les ateliers sans assistance à une personne qui découvre le produit avant d'afficher une durée ou une promesse de complétion novice.

Pour la prévisualisation locale : `mint dev --port 3337 --telemetry false`. Le démonstrateur `examples/boutique-demo.html` s'ouvre également hors ligne. Le CSV fourni est facultatif : adapter les champs imposés par le processus Azure DevOps avant import.

Publication : publier les nouvelles routes Mintlify avant une version de l'extension contenant les trois nouveaux liens d'aide. Ne pas annoncer le lot pilote comme une couverture complète de tous les usages : les ateliers Repository, Couverture, Cockpit, Dérive, Import, partage et réaffectation restent le lot suivant.

## Téléchargement du jeu pédagogique

Le contrôle en production du 12 octobre 2026 a révélé que les liens `/examples/boutique-demo.html` et `/examples/tp-doc-test-cases-fr.csv` répondaient 404 malgré leur fonctionnement dans la prévisualisation locale. Mintlify ne sert pas HTML et réserve CSV et ZIP aux offres Enterprise ; déplacer les fichiers dans `assets/` ne change pas cette règle. Références officielles : [formats servis](https://www.mintlify.com/docs/create/files) et [diagnostic des fichiers 404](https://www.mintlify.com/docs/help-center/static-file-not-served).

Le dépôt `AlexThibaud1976/testpulse-docs` étant public, les ateliers proposent désormais `examples/tp-doc-boutique-kit.zip` via le domaine de téléchargement GitHub. Le kit contient seulement `boutique-demo.html`, `tp-doc-test-cases-fr.csv` et `LIRE-MOI-README.txt`. Il ne nécessite aucun autre hébergement ni installation. Le lecteur doit extraire le ZIP puis ouvrir le HTML ; le CSV reste facultatif.

Après toute modification des trois sources, régénérer le kit avec `powershell -File scripts/build-demo-kit.ps1`. Après publication, vérifier le téléchargement HTTPS du ZIP et comparer ses trois entrées aux sources. La validation locale des liens ne prouve pas la disponibilité des fichiers dans le CDN de production.
