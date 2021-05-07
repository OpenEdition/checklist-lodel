# Plugin Checklist pour Lodel

Ce plugin Lodel est une implémentation du script [OpenEdition Checklist](https://github.com/OpenEdition/checklist) adaptée au modèle éditorial des revues et des livres.

Il comprend les éléments suivants :

* Des templates LodelScript spécifiques pour la présentation des entités Lodel (publications, textes, entrées)
* Un fichier de configuration pour l'utilisation d'OpenEdition Checklist dans ces templates

## Installation

Git et NPM doivent être installés.

1. Cloner ce dépôt
2. `cd checklist-lodel`
3. `npm install`

## Mise à jour

Remarque : dans le cas d'une modification du [noyau de Checklist](https://github.com/OpenEdition/checklist), il faut s'assurer dans un premier temps que la nouvelle version du paquet `@openedition/checklist` a bien été publiée sur [NPM](https://www.npmjs.com/package/@openedition/checklist). Lire à ce sujet : https://github.com/OpenEdition/checklist#readme

1. `git pull`
2. `npm update @openedition/checklist`

## Développement

Pour voir comment utiliser ou modifier la configuration de Checklist, lire https://github.com/OpenEdition/checklist#utilisation

## Numéro de version

Le numéro de version affiché dans l'interface de Checklist est celui du noyau `@openedition/checklist`. Ce numéro est renseigné dans le fichier : https://github.com/OpenEdition/checklist/blob/master/package.json