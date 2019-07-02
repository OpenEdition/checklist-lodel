# Plugin Checklist pour Lodel

Ce plugin Lodel est une implémentation du script [OpenEdition Checklist](https://github.com/OpenEdition/checklist) adaptée au **modèle éditorial des Revues**.

Il comprend les éléments suivants :

* Des templates LodelScript spécifiques pour la présentation des entités Lodel (publications, textes, entrées)
* Un fichier de configuration pour l'utilisation d'OpenEdition Checklist dans ces templates

## Installation et développement

Git et NPM doivent être installés.

Pour installer le plugin et ses dépendences :

1. Cloner ce dépôt
2. `cd checklist-lodel`
3. `npm install`

Pour mettre à jour le noyau [OpenEdition Checklist](https://github.com/OpenEdition/checklist) :

1. S'assurer que la nouvelle version du paquet `@openedition/checklist` a bien été publiée sur NPM (lire les instructions détaillées dans le README du dépôt dédié à [OpenEdition Checklist](https://github.com/OpenEdition/checklist))
2. `cd checklist-lodel`
3. `npm install`

Pour modifier les templates, la configuration du script JS ou les règles : 

1. Modifier les fichiers adéquats dans ce dépôt
2. Il n'y a pas de 2

Pour voir comment utiliser ou modifier `checklist-config.js`, lire https://github.com/OpenEdition/checklist#utilisation