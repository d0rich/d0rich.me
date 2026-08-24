---
description: "Un script critique, une matrice qui explose, une RAM qui craque. Les juniors voulaient tout réécrire en Rust. La vraie solution était bien plus bête — et bien plus efficace."
date: 2026-08-24
image: /blog/2026-08/de-pandas-a-sqlite.png
lang: fr
tags:
  - Python
  - BigData
  - SQL
---

# De Pandas à SQLite : survivre dans  BigData

Imaginez que vous avez entre les mains un script absolument critique pour vos process métier — celui qui décortique la matrice de croisement entre deux entités. Pas besoin de me faire un dessin, j'ai déjà eu l'occasion de bosser sur un truc pareil. Comme à peu près tout dans cette boîte, c'était écrit en Python, et le cœur du bidule tournait sous Pandas. Alors Pandas, je n'ai rien contre, hein.

## La première optimisation

Le temps a passé, et le volume de données traitées par le script n'a fait que grimper. Je le rappelle, on parle bien d'une matrice qu'on analysait ici. Et comme le nombre de lignes et de colonnes ne cessait d'augmenter, le temps de traitement s'est mis à exploser de façon géométrique.

Et quand le temps d'exécution du script a fini par atteindre des valeurs franchement désagréables, la boîte a décidé de chercher la racine du problème — et elle en est arrivée à la seule conclusion qui vaille : Pandas, c'est nul. Et depuis, un junior sur deux se sentait obligé de dénicher la dernière alternative branchée à Pandas, écrite en Rust évidemment, et qui tournerait soi-disant 10 fois plus vite. Comme ça, on pourrait tout bêtement tout réécrire avec la nouvelle bibliothèque.

Moi, en revanche, j'avais repéré que Pandas était utilisé n'importe comment. Parce que, voyez-vous, Pandas est écrit en C et stocke ses données à part, plus ou moins détachées de Python. La bibliothèque propose des méthodes bien pratiques pour manipuler les tableaux, qui exécutent des opérations natives directement dans le DataFrame. Sauf qu'à l'époque, personne ne s'en servait. On lisait valeur par valeur, et à chaque fois on rappelait une fonction Python. Comme si Python tout seul n'était pas déjà suffisamment lent, il fallait en plus se coltiner une quantité astronomique de sérialisations-désérialisations pour que Pandas arrive à transmettre ses données à Python.

La solution était simple : écrire du bon code. J'ai remplacé les appels à `apply()` par des appels aux opérations natives optimisées, et tout s'est mis à tourner environ 4 fois plus vite.

Évidemment, à certains endroits, ça ne s'est pas fait sans un peu de débrouillardise. Il a fallu repenser complètement l'approche du traitement des données à quelques endroits, parce que remplacer `apply()` par des calculs natifs, tout simplement comme ça, c'était juste impossible.

## La crise de la RAM

Le temps passait, tout le monde était content du script, utilisateurs et développeurs vivaient en harmonie... jusqu'au jour où quelqu'un a posté une issue critique.

Dans certaines conditions, le script tournait affreusement lentement (environ trois heures), et en plus, il plantait de temps en temps, obligeant l'utilisateur à tout relancer depuis zéro et à prier pour que, cette fois-ci, ça passe sans accroc.

En examinant le message d'erreur, j'ai compris que le problème venait d'un manque de RAM. Pandas n'avait tout simplement plus assez de place pour stocker ce qu'il stockait. Quant aux rares exécutions qui réussissaient, mais à une lenteur affligeante, j'avais ma théorie : le système se mettait à utiliser la mémoire SWAP (une partie des données finissait sur le disque dur), ce qui ralentissait le traitement de façon spectaculaire.

Il s'est avéré que le volume de données dans ce cas précis était démesurément plus important que d'habitude, et que la matrice avait gonflé à des proportions hors normes. On peut même dire que la *Data* est devenue *Big Data*.

Il y avait bien une solution temporaire : augmenter la quantité de RAM sur la machine. Mais impossible de savoir combien de temps on pourrait encore s'en sortir avec une quantité raisonnable de RAM.

J'avais quelques pistes pour optimiser l'algorithme de calcul. Mais là aussi, retomber sur un nouveau plafond n'était qu'une question de temps.

Je voyais bien où était le problème : on fourrait une quantité astronomique de données en RAM, alors que leur place, pour un tel volume, c'était plutôt sur le disque dur. Mais restait une question de taille : comment garder une vitesse de traitement acceptable ?

## Épisode III : un nouvel espoir

Ça m'a immédiatement fait penser aux bases de données relationnelles du genre Postgres, MySQL. Elles stockent toutes leurs données sur le disque, et en plus, elles embarquent déjà tout un tas de mécanismes d'optimisation, comme les index. Sauf que je n'avais aucune envie d'obliger chaque utilisateur à se monter un serveur SGBD dans son coin, et puis, faire transiter les données sur le réseau, ça n'allait clairement pas jouer en faveur de la rapidité.

J'ai donc fini par resserrer le champ à SQLite. Il est déjà préinstallé avec Python, stocke ses données dans un petit fichier binaire, et permet de streamer les résultats des requêtes directement vers Python. 

En théorie, ça réglait le problème de fond : je ne stockais plus tout en RAM, seulement les données que j'étais en train de traiter, sans pour autant sacrifier la vitesse de façon dramatique. 

Il me restait deux questions en suspens :
1. Combien de RAM SQLite allait-il bouffer pour exécuter des requêtes complexes ?
2. Quelle allait être la vitesse d'une telle solution ?

Et donc, en cachette, je me suis lancé dans l'activité préférée de tout développeur : tout réécrire de zéro. Il a fallu adopter des approches radicalement différentes, donc le script Pandas ne faisait plus vraiment l'affaire comme base. Bien sûr, j'ai placé le nouveau code à côté de l'ancien, sans supprimer ce dernier, histoire de se couvrir.

Pour la mise en œuvre de cette solution, je me suis accroché à un seul principe : dès que c'était possible, faire tourner les calculs directement en SQL plutôt qu'en Python, afin d'éviter de multiplier les sérialisations de données.

Représenter la matrice sous forme de table a posé un petit problème. J'ai tenté le coup avec un plugin de tables Pivot, mais la limite de 200 colonnes par table m'a vite fait comprendre que j'étais sur la mauvaise piste. 

J'ai fini par l'implémenter sous la forme d'une table où chaque ligne représente une cellule de la matrice. Et là, j'ai même gagné en volume, puisqu'avec cette approche, je n'avais plus besoin de stocker les cellules signalant l'absence d'intersection entre deux entités. Et ensuite, j'ai pondu une requête SQL bien maligne, qui ordonne les cellules exactement comme si je parcourais la matrice.

Rien que deux misérables jours de dev non-stop, et c'était prêt. Je me suis précipité pour tester.

## Les résultats

Le plus important, c'est la fonctionnalité. Mon implémentation produisait des résultats comparables à ceux du script d'origine, même si une certaine marge d'erreur subsistait. Il faut noter que je m'attaquais là à un problème NP-difficile, et dans ce cas, des divergences entre les solutions, c'est largement acceptable, voire attendu.

Pour la comparaison des temps, j'ai pris un cas sans souci de RAM. Je m'attendais à ce que ma solution soit bien plus lente que l'originale, mais en réalité, la nouvelle version s'est avérée environ 20% plus rapide.

Et enfin, la consommation de RAM. Pratiquement nulle. Peu importe la quantité de données que je chargeais pour le traitement, la consommation restait quasiment inchangée. J'ai été agréablement surpris de voir à quel point SQLite est optimisé.

Concernant ce fameux cas maudit, avec ses trois heures d'attente et ses plantages à répétition :
- Plus besoin d'une quantité astronomique de RAM pour lancer le script
- Aucun plantage constaté
- Le temps d'exécution est passé de trois heures à cinq minutes

Tout le monde était content : moi, j'étais content, les utilisateurs étaient contents. Seul l'auteur du script original ne l'était pas.

SQLite est une technologie largement sous-estimée. Le champ d'application d'une base de données aussi légère et peu exigeante est bien plus vaste que vos pauvres petits tests d'API. Peut-être bien que ce genre de techno convient bien mieux à votre projet que le fameux Postgres bien hypé, avec un ORM en prime.
