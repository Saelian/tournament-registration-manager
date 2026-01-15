# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Tournament Registration Manager - Application de gestion des inscriptions pour les tournois de tennis de table.

**Philosophie**: "Zero friction" - pas de compte complexe, pas de mot de passe. Priorité à la rapidité d'inscription et l'efficacité administrative le jour J.

## Commands

```bash
# Development
pnpm dev              # Start API + frontend in parallel
pnpm dev:api          # API only (http://localhost:3333)
pnpm dev:web          # Frontend only (http://localhost:5173)
docker compose up -d  # Start PostgreSQL + Mailpit

# Quality
pnpm lint             # Lint all packages
pnpm format           # Format with Prettier
pnpm typecheck        # TypeScript check all packages

# Build
pnpm build            # Build all packages

# Tests - API (Japa)
cd api && node ace test                           # Run all tests
cd api && node ace test tests/functional/auth.spec.ts  # Single test file
NODE_ENV=test node ace migration:fresh --seed     # Reset test DB

# Tests - Web (Vitest)
cd web && pnpm test   # Run tests
```

## Architecture

### Monorepo Structure

- `api/` - AdonisJS v6 backend
- `web/` - React + Vite frontend
- `packages/fftt-client/` - FFTT API client (standalone, AdonisJS agnostic)

### Backend (api/)

**Framework**: AdonisJS v6 with Lucid ORM + VineJS validation

**Key Patterns**:

- Controllers: HTTP request/response only, delegate to services
- Services: Business logic (`app/services/`)
- Validators: VineJS schemas in `app/validators/`
- API responses use standardized format via `#helpers/api_response` helpers

**Important Files**:

- `start/routes.ts` - All API routes
- `app/helpers/api_response.ts` - Response helpers (success, error, created, notFound, etc.)
- `app/services/registration_rules_service.ts` - Registration business rules
- `app/services/hello_asso_service.ts` - Payment integration

**Auth**:

- User auth: Passwordless OTP via email (session-based)
- Admin auth: Password-based with separate middleware (`admin_auth_middleware.ts`)

### Frontend (web/)

**Framework**: React 19 + Vite 7 + TailwindCSS v4 + Shadcn UI (Neo-Brutalism theme)

**Key Patterns**:

- Feature-based architecture in `src/features/`
- TanStack Query for server state
- Zod for API response validation
- Axios instance with response unwrapping in `src/lib/api.ts`

**Features Structure**:

```
src/features/
├── auth/           # Login, contexts (admin + user)
├── registration/   # Player search, table selection, cart
├── payment/        # HelloAsso integration callbacks
├── dashboard/      # User dashboard
├── admin/          # Admin panel
├── tables/         # Table CRUD (admin)
├── sponsors/       # Sponsor management
├── tournament/     # Tournament config
└── public/         # Landing, public table list
```

## API Response Format

All API responses follow this format:

```typescript
// Success
{ "status": "success", "data": { ... } }

// Error
{ "status": "error", "code": "ERROR_CODE", "message": "..." }
```

Use `#helpers/api_response` helpers: `success()`, `error()`, `created()`, `notFound()`, etc.

## Conventions

- **Variables/Functions**: camelCase
- **Classes/Components**: PascalCase
- **Files**: kebab-case
- **Database columns**: snake_case (Lucid auto-maps)
- **Constants**: UPPER_SNAKE_CASE
- **TypeScript**: `any` forbidden, use `unknown` with narrowing

## External Integrations

### FFTT API (French Table Tennis Federation)

- Player data lookup by license number
- Client in `packages/fftt-client/`
- Mock available for local dev (`MockFFTTClient`)

### HelloAsso (Payment)

- API V5, webhook verification mandatory
- Never trust frontend redirect, always verify via webhook
- Metadata includes `registration_id` for reconciliation

## Domain Model

**Key entities**: Tournament, Table, Player, Registration, Payment, User (subscriber), Admin

**Business rules**:

- Max 2 tables per day per player (except special tables)
- No tables with same start time for same player
- Registration confirmed only after payment
- Waitlist with configurable timer (4h-12h)

<!-- OPENSPEC:START -->

# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:

- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:

- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->
