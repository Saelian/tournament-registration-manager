# Tournament Registration Manager

Application de gestion des inscriptions pour les tournois de tennis de table.

## Prérequis

- Node.js >= 20.0.0
- pnpm >= 9.0.0
- Docker et Docker Compose

## Installation

```bash
# Cloner le repository
git clone <repo-url>
cd tournament-registration-manager

# Installer les dépendances
pnpm install

# Copier le fichier d'environnement
cp .env.example .env
# Modifier .env avec vos valeurs
```

## Développement

### Démarrer l'infrastructure (PostgreSQL)

```bash
docker compose up -d
```

### Démarrer les applications en développement

```bash
# Démarrer API et frontend en parallèle
pnpm dev

# Ou séparément
pnpm dev:api   # API sur http://localhost:3333
pnpm dev:web   # Frontend sur http://localhost:5173
```

### Commandes utiles

```bash
# Linting
pnpm lint

# Formatage du code
pnpm format

# Vérification des types
pnpm typecheck

# Build de production
pnpm build
```

## Structure du projet

```
tournament-registration-manager/
├── api/                    # Backend AdonisJS v6
│   ├── app/
│   │   ├── controllers/    # Contrôleurs HTTP
│   │   ├── models/         # Modèles Lucid ORM
│   │   ├── validators/     # Validateurs VineJS
│   │   ├── helpers/        # Utilitaires (api_response.ts)
│   │   └── exceptions/     # Gestion des erreurs
│   ├── database/
│   │   └── migrations/     # Migrations PostgreSQL
│   └── start/
│       └── routes.ts       # Routes API
├── web/                    # Frontend React + Vite
│   ├── src/
│   │   ├── components/     # Composants React
│   │   ├── lib/           # Utilitaires (api.ts, query-client.ts)
│   │   └── pages/         # Pages de l'application
│   └── index.html
├── packages/              # Packages partagés (à venir)
├── infra/                 # Données Docker (volumes)
├── compose.yml            # Configuration Docker Compose
└── pnpm-workspace.yaml    # Configuration monorepo pnpm
```

## Stack technique

### Backend (api/)

- **AdonisJS v6** - Framework Node.js
- **Lucid ORM** - ORM pour PostgreSQL
- **VineJS** - Validation des données
- **PostgreSQL 17** - Base de données

### Frontend (web/)

- **React 19** - Framework UI
- **Vite 7** - Build tool
- **Tailwind CSS v4** - Styling
- **Shadcn UI** - Composants (thème Neo-Brutalism)
- **TanStack Query** - Gestion des requêtes API
- **Axios** - Client HTTP

## Format de réponse API

Toutes les réponses API suivent un format standardisé :

```typescript
// Succès
{
  "status": "success",
  "data": { ... }
}

// Erreur
{
  "status": "error",
  "code": "ERROR_CODE",
  "message": "Description de l'erreur"
}
```

## Docker

### Développement

```bash
docker compose up -d          # Démarrer PostgreSQL et Mailpit
docker compose down           # Arrêter les services
docker compose logs -f        # Voir les logs
```

### Production

Les Dockerfiles sont fournis pour le déploiement :

- `api/Dockerfile` - Build multi-stage pour l'API
- `web/Dockerfile` - Build + Nginx pour le frontend

## Licence

Propriétaire
