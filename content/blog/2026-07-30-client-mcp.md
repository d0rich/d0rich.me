---
date: 2026-07-30
image: /blog/2026-07-30/cover.webp
lang: fr
tags:
  - MCP
  - AI
---

# C’est quoi ça, le client MCP ?

J'ai déjà écrit que le serveur MCP n'est pas vraiment différent des serveurs HTTP : [Le serveur MCP (Model Context Protocol) pour les enfants](https://d0rich.me/blog/2026-07-06-mcp-pour-les-enfants/). Il reste à comprendre ce qu'est le client MCP, comment l'intégrer dans une application.

## Configuration simple

Agents LLM nombreux (ex. GitHub Copilot, Claude Code, Antigravity) supportent MCP par défaut. Ce qu'il vous faut, c'est juste de déclarer serveur MCP dans le fichier de configuration ou de l'ajouter en utilisant une commande CLI.

Exemple de `mcp.json` pour GitHub Copilot avec déclaration de connexions à l'Angular MCP (type StdIO) et au MCP de MDN (type HTTP) :

```json
{
  "servers": {
    "angular-cli": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@angular/cli", "mcp"]
    },
    "mdn": {
      "type": "http",
      "url": "https://mcp.mdn.mozilla.net/"
    }
  }
}
```

Après la configuration initiale, votre agent va s’occuper de :
1. Récupération des tools / resources / prompts du serveur MCP
2. Décisions à quel moment appeler quelle fonctionnalité
3. Appels des fonctionnalités choisies

## Intégration propriétaire

Il n’existe pas un seul chemin pour écrire sa propre implémentation du client MCP. Ça dépend toujours de son stack technique, mais la logique de base reste la même.

Oui, juste appeler une utilité d’un serveur MCP est assez simple : il faut utiliser le SDK de Model Context Protocol officiel pour envoyer une requête (comme la requête HTTP). Néanmoins la tâche principale, c’est de comprendre quelle fonctionnalité de MCP utiliser selon le contexte.

En général, l’algorithme est le suivant :
1. Préparation — on se connecte à un serveur MCP et récupère ses outils.
2. On donne le contexte et les outils MCP disponibles à un modèle LLM et lui demande de choisir des outils pertinents.
3. On appelle les serveurs MCP choisis en utilisant les entrées générées par le LLM.
4. On ajoute les réponses des MCP au contexte principal pour la génération de la réponse.

Comme ça, l’agent va avoir beaucoup plus de contexte pertinent pour ou même agir dans un système si MCP le permet.

## Et maintenant ?

Le client MCP n’est pas une brique magique : c’est simplement la partie de votre application qui donne du contexte à un LLM, lui permet de choisir des outils, puis exécute ces outils via un serveur MCP. Une fois que vous avez compris ce cycle — préparation, sélection, appel, enrichissement du contexte — vous pouvez l’adapter à n’importe quel stack, du prototype en Python à l’application enterprise en TypeScript.

Si vous voulez aller plus loin : 
- Expérimentez avec un serveur MCP existant (Angular CLI, MDN, ou un serveur maison) et intégrez-le dans un petit agent.
- Observez comment le choix des outils évolue selon le contexte que vous donnez au LLM.
- Itérez sur la manière dont vous présentez les tools / resources / prompts : c’est souvent là que se gagne la pertinence des réponses.

Si vous aussi vous naviguez dans l’IT — étudiant, développeur junior ou plus senior, en France ou ailleurs — je serais ravi d’échanger sur vos propres expériences, vos galères et vos victoires.