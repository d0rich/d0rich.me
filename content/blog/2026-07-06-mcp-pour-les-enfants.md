---
description: "Express.js vs MCP : la même logique, une API que les LLM comprennent mieux"
date: 2026-07-06
image: /blog/2026-07-06/cover.webp
lang: fr
tags:
  - MCP
  - AI
  - NodeJS
---

# Le serveur MCP (Model Context Protocol) pour les enfants

Comme si les exigences de connaissance des différentes technologies pour les développeurs ne suffisaient déjà pas, 
Anthropic a présenté son nouveau protocole : le Model Context Protocol. Bien que, de jure, le MCP soit une bibliothèque 
open source décrivant les communications pour une technologie propriétaire, de facto, il est devenu la norme communément admise.


Le MCP n'est déjà plus tout à fait nouveau - il a 2 ans. Et pour le remplacer, on a développé les skills, 
qui résolvent bien des problèmes. Mais il reste encore aujourd'hui, fréquemment, des cas où le MCP demeure la meilleure solution.

## MCP, ça sert à quoi ?

MCP est un protocole propriétaire créé dans Antropic pour l'échange des données entre les agents LLM et le serveur.

### Peut-on éviter MCP ?

Techniquement, oui, les agents LLM peuvent écrire et utiliser les scripts communiquant avec le serveur en protocoles 
différents (par exemple HTTP ou gRPC). Mais ces protocoles classiques demandent les appels précis. Et donc les LLM ont 
des problèmes avec ça : ils peuvent halluciner une route HTTP et construire le corps de requête faux.

MCP rend l'API plus claire pour les modèles de langue, il ajoute des descriptions naturelles pour chaque utilité et 
chaque champ de message. C'est comment MCP laisse moindre risque d'échec.

![Serveur expose sa fonctionnalité en HTTP et MCP](/blog/2026-07-06/mcp-vs-express.png)

> MCP est juste une nouvelle façon d'interagir avec le serveur.

---

Vu que MCP est juste une façon de développer une API, 
il est beaucoup plus compréhensible en comparaison avec les API REST classiques.

Normalement, la configuration d'un serveur REST (Express.js comme un exemple ici) et d'un serveur MCP inclut trois simples étapes :
1. Instanciation de l'objet serveur
2. Déclaration des méthodes
3. Lancement du serveur

### Instantiation d'un serveur

L'étape est extrêmement claire, il faut importer une fonction pour l'instantiation et l'appeler.

```ts
// Express.js

import express from 'express'

const app = express()
```

```ts
// MCP

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'

const server = new McpServer({
  name: "recherche",
  version: "1.0.0",
})
```

### Déclaration des méthodes

En Express.js, on définit :
1. Méthode HTTP (`GET`, `POST`, etc.)
2. Chemin de la requête (`/search`)
3. Fonction de traitement de la requête

```ts
// Express.js

app.post('/search', async (req, res) => {
  const reponse = await monService.search(req.body)
  res.json(response)
})
```

En général, on déclare des outils (tools) dans MCP, mais il faut noter qu'il existe aussi 2 types : ressources et prompts.

Pour un outil, il faut déclarer :
1. Nom de l'outil
2. Description de la fonctionnalité
3. Schéma d'entrée
4. Fonction de traitement d'une requête

Ce qui est remarquable, MCP expose les descriptions de fonctionnalités et de chaque paramètre d'entrée. Après, LLM peut l'utiliser pour adapter mieux ses appels.

```ts
// MCP

import { z } from 'zod'

server.registerTool(
  // Nom de l'outil
  "search",
  {
    // Description de l'outil
    description: "Recherche du contenu pertinent",
    // Schéma d'entrée
    inputSchema: {
      query: z
        .string()
        // Description du parameter query
        .describe("La requête pour chercher l'information"),
    },
  },
  // Fonction de traitement d'une requête
  async ({ query }) => {
    const reponse = await monService.search({ query })
    // Transformer la reponse en texte
    return [{ type: 'text', text: formatterReponse(reponse) }]
  }
)
```

## Lancement du serveur

Après avoir défini toute la logique, il reste seulement de lancer le serveur pour accepter des requêtes.

```ts
// Express.js
// Accepter les requêtes HTTP sur le port 8080
app.listen(8080)
```

Pour lancer le serveur MCP vous avez plusieurs options de transport :
- `StreamableHTTPServerTransport` (ou ancien `SSEServerTransport`) - pour un serveur en ligne
- `StdioServerTransport `- pour un serveur local

```ts
// MCP local

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'

// Instancier le transport
const transport = new StdioServerTransport()
// Lancer le serveur
server.connect(transport)
```

MCP en ligne demande configuration d'un serveur REST pour traiter les requêtes. C'est pourquoi le lancement est un peu plus compliqué.

```ts
// MCP en ligne

import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
// Importer express pour lancer le serveur REST
import express from 'express'

// Instancier le transport
const transport = new StreamableHTTPServerTransport()
// Instancier le serveur express
const app = express()

// Déclarer un route pour MCP
app.post('/mcp', async (req, res) => {
  await transport.handleRequest(req, res, req.body)
})

// Lancer le serveur
server.connect(transport)
  .then(() => app.listen(8080))
```

--- 

Voilà, côté serveur, MCP n'est pas plus compliqué qu'Express.js - juste une façon différente de décrire ce que fait chaque outil. Le vrai gain apparaît côté client : c'est là que le LLM lit ces descriptions et décide quoi appeler. On verra ça dans le prochain article.