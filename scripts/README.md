# Contrôle local de la documentation

Depuis la racine du dépôt, avec Node.js :

```powershell
node scripts/validate-docs.mjs
```

Ce contrôle ne télécharge rien, ne modifie aucun fichier et ne publie rien. Il sort avec le code `1` en cas de problème et indique le fichier et, pour les liens MDX, la ligne concernée.

Il vérifie :

- l’existence des pages déclarées dans la navigation de `docs.json` ;
- la parité des chemins FR/EN, dans la navigation et dans les fichiers ;
- les destinations locales des liens et images Markdown, ainsi que les attributs statiques `href`, `src` et `poster` des composants MDX ;
- le favicon et les logos locaux de la configuration ;
- l’absence de marqueurs de rédaction (`TODO`, `TBD`, `FIXME`, `PLACEHOLDER`, « à compléter », « capture à ajouter ») dans les tutoriels.

Les liens absolus depuis la racine (`/fr/...`), relatifs au fichier et vers des fichiers téléchargeables sont acceptés. Les fragments et paramètres sont retirés avant de vérifier la page cible ; les liens vers un fragment seul restent valides sans tentative de reproduire les ancres générées par Mintlify. Les URL externes, `mailto:`, `data:` et autres schémas ne sont pas visités. Le contenu des blocs et spans de code n’est pas interprété comme du balisage de liens.

Le contrôle porte sur les conventions statiques de ce dépôt, pas sur toute la syntaxe MDX : les expressions JSX dynamiques, les ancres générées, les redirections et la disponibilité des sites externes nécessitent toujours la prévisualisation Mintlify ou un contrôle complémentaire. Il vérifie la présence des images, pas leur lisibilité ni leur contenu. Les contenus importés dans des composants ne sont pas exécutés.

Pour vérifier une copie isolée du dépôt, un répertoire peut être fourni :

```powershell
node scripts/validate-docs.mjs C:\chemin\vers\copie-docs
```

Pendant une rédaction à plusieurs, une page ou une capture encore absente peut être signalée. Conserver le lien prévu et terminer le fichier manquant ; ne pas supprimer une référence utile pour rendre le contrôle vert. Relancer après la fin des contributions, puis vérifier le rendu avec Mintlify.
