# Project Context

## Purpose
Application web de gestion des inscriptions pour tournois de tennis de table.

**Philosophie** : "Zéro friction" - pas de compte utilisateur complexe, pas de mot de passe. Priorité à la rapidité d'inscription et à l'efficacité administrative le jour J.

**Périmètre** :
- Inscriptions en ligne avec vérification des règles (points, horaires, quotas)
- Paiement en ligne (HelloAsso)
- Liste d'attente automatisée avec timer et rotation
- Gestion administrative (CRUD tableaux, exports CSV)
- Pointage sur place le jour du tournoi

**Exclusion** : Gestion sportive (arbres, poules) - gérée par des logiciels tiers (SPID/GIRPE).

## Tech Stack

### Backend
- **Framework** : AdonisJS v6 (API Mode)
- **Database** : PostgreSQL
- **ORM** : Lucid
- **Validation** : VineJS
- **Language** : TypeScript (Strict mode)

### Frontend
- **Framework** : React (via Vite)
- **Language** : TypeScript (Strict mode)
- **Styling** : Tailwind CSS
- **UI Library** : Shadcn UI (Radix Primitives) avec skin Neo-Brutalism
- **State Management** : TanStack Query (server state), React Context (UI state)

### Infrastructure
- **Deployment** : VPS via Dokploy
- **Containers** : Docker multi-container (API, Front, DB, Redis)
- **Automation** : n8n (webhooks pour notifications/reporting)

## Project Conventions

### Code Style

**Naming Conventions** :
- Variables/Functions : `camelCase` (ex: `getPlayerStats`, `isTableFull`)
- Classes/Components : `PascalCase` (ex: `TournamentController`, `SubmitButton`)
- Files : `kebab-case` (ex: `auth-service.ts`, `user-profile.tsx`)
- Database Columns : `snake_case` (mapping automatique par Lucid)
- Constants : `UPPER_SNAKE_CASE` (ex: `MAX_REGISTRATIONS_PER_DAY`)

**TypeScript Rules** :
- `any` strictement interdit - utiliser `unknown` et narrowing si nécessaire
- Backend : VineJS validators pour typer les requêtes HTTP
- Frontend : Zod schemas pour valider les réponses API

### Architecture Patterns

**Backend (AdonisJS)** :
- `app/controllers` : Gestion HTTP request/response UNIQUEMENT
- `app/services` : Logique métier (ex: `RegistrationService.ts` pour la liste d'attente)
- `app/models` : Lucid Models

**Frontend (React)** :
- `src/components/ui` : Composants Shadcn/génériques
- `src/features` : Architecture par fonctionnalité (ex: `src/features/tournament-registration`)
- `src/lib` : Configuration (axios instance, utils)

**API Design** :
- RESTful standard (GET, POST, PUT, DELETE)
- Format de réponse uniforme :
```json
// Success (200/201)
{ "status": "success", "data": { ... } }

// Error (4xx/5xx)
{ "status": "error", "code": "ERROR_CODE_MACHINE", "message": "Message lisible" }
```

### Testing Strategy
- Mock de l'API FFTT pour le développement (fichier JSON statique)
- Tests de charge prévus pour scénarios multi-inscriptions (ex: "Coach inscrit 10 gamins")

### Git Workflow
[À définir selon tes préférences - trunk-based, gitflow, etc.]

## Domain Context

### Acteurs
1. **Gestionnaire (Admin)** : Organisateur du tournoi. Configure les tableaux, suit les finances, gère le pointage.
2. **Souscripteur** : Utilisateur public avec email. Peut être le joueur ou un tiers (entraîneur, parent).
3. **Joueur** : Personne physique identifiée par son N° de Licence FFTT.

### Concepts Métier
- **Tableau** : Catégorie de compétition avec points min/max, horaire, quota, prix
- **Tableau Spécial** : Exempté de la règle "2 tableaux max/jour" (ex: Doubles)
- **Liste d'attente** : File avec timer de paiement et rotation automatique
- **Pointage** : Check-in le jour J avec horodatage

### Règles Métier Clés
- Max 2 tableaux par jour par joueur (sauf tableaux spéciaux)
- Pas de tableaux au même horaire de début
- Inscription confirmée uniquement après paiement
- Timer liste d'attente : délai configurable (4h-12h), expiration = rotation en fin de liste

## Important Constraints

- **Authentification passwordless** : OTP par email uniquement, pas de mot de passe
- **Paiement obligatoire** : Inscription non validée sans paiement (sauf liste d'attente)
- **Date butoir remboursement** : Après cette date, désinscription sans remboursement
- **Fuseau horaire** : France Métropolitaine uniquement
- **Secrets** : Variables d'environnement via Dokploy, jamais hardcodés

## External Dependencies

### API FFTT (Fédération Française de Tennis de Table)
- Récupération données joueur : Nom, Prénom, Club, Points officiels, Sexe, Catégorie d'âge
- Fallback si indisponible : saisie manuelle avec flag "À vérifier"
- **Module isolé** : `packages/fftt-client` - agnostique AdonisJS (pure TS/Axios)
- **Mock** : `MockFFTTClient` pour dev local sans credentials

### API HelloAsso (Paiement)
- Version : API V5
- Webhook verification obligatoire (ne jamais faire confiance au redirect frontend)
- Métadonnée : `registration_id` pour réconciliation des paiements
- Gestion des remboursements automatiques

### n8n (Automatisation)
- Webhooks pour notifications email
- Reporting et alertes
