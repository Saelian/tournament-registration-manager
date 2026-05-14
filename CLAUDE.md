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
- `app/services/cancellation_service.ts` - Cancellation logic (user + admin)
- `app/services/waitlist_service.ts` - Waitlist promotion logic
- `app/services/hello_asso_service.ts` - Payment integration
- `app/services/csv_export_service.ts` / `csv_import_service.ts` - CSV import/export
- `app/services/bib_number_service.ts` - Bib number assignment
- `app/services/admin_notification_service.ts` - Admin email notifications
- `app/services/registration_period_service.ts` - Registration window rules

**Auth**:

- User auth: Passwordless OTP via email (session-based)
- Admin auth: Password-based with separate middleware (`admin_auth_middleware.ts`)

**Controllers**:

- `admin_registrations_controller.ts` - Full admin registration management (create, cancel, promote, payment link, partial refund)
- `admin_payments_controller.ts` - Payment management (collect cash/check/card, process refunds)
- `admin_checkin_controller.ts` - Day-of check-in by day/player
- `admin_exports_controller.ts` - CSV exports (tables, registrations, payments)
- `admin_audit_log_controller.ts` - Audit log viewing
- `webhooks_controller.ts` - HelloAsso webhook handler

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
├── registrations/  # Player search, table selection, cart + public players list
├── payments/       # HelloAsso integration callbacks + admin payments page
├── checkin/        # Admin check-in page (day-of)
├── user-space/     # Mon espace joueur (MySpacePage)
├── profile/        # User profile page
├── admin/          # Admin dashboard + audit logs
├── tables/         # Table CRUD (admin)
├── sponsors/       # Sponsor management
├── tournament/     # Tournament config (admin)
└── (public)        # Landing, public table list — merged into registrations/tables
```

**Frontend Routes**:

| Path | Component | Auth |
|------|-----------|------|
| `/` | Landing page | Public |
| `/login` | UserLoginPage | Public |
| `/profile` | ProfilePage | User |
| `/tournaments/:id/tables` | Table selection | Public |
| `/payment/callback` | PaymentCallbackPage | User |
| `/players` | PublicPlayersPage | Public |
| `/faq` | FAQ page | Public |
| `/admin` | AdminDashboardPage | Admin |
| `/admin/tournament` | AdminTournamentConfigPage | Admin |
| `/admin/tables` | AdminTableListPage | Admin |
| `/admin/registrations` | AdminRegistrationsPage | Admin |
| `/admin/payments` | AdminPaymentsPage | Admin |
| `/admin/checkin` | AdminCheckinPage | Admin |
| `/admin/logs` | AdminLogsPage | Admin |
| `/admin/sponsors` | SponsorListPage | Admin |

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

## Domain Model

**Entities**:

- `Tournament` — config centrale (options JSON : dates inscriptions, délai remboursement, timer waitlist, FAQ)
- `Table` — catégorie de compétition (points min/max, quota, prix, restrictions genre/catégorie/numérotation)
- `Player` — joueur identifié par numéro de licence FFTT
- `Registration` — inscription d'un joueur à une table, statuts : `pending_payment` | `paid` | `waitlist` | `cancelled`
- `Payment` — paiement HelloAsso ou manuel (cash/chèque/carte), méthodes : `helloasso` | `cash` | `check` | `card`
- `User` — abonné (email OTP), peut être le joueur ou un tiers (coach, parent)
- `Admin` — organisateur avec mot de passe
- `TournamentPlayer` — numéro de dossard attribué à un joueur pour le tournoi
- `Sponsor` / `TablePrize` / `TableSponsor` — parrainage et lots par table

**Registration model key fields**:

- `status`: `pending_payment` | `paid` | `waitlist` | `cancelled`
- `isAdminCreated`: inscription créée depuis l'interface admin (sans délai d'expiration)
- `presenceStatus`: `unknown` | `present` | `absent` (check-in jour J)
- `checkedInAt`: timestamp du check-in
- `promotedAt`: timestamp de la dernière promotion depuis la liste d'attente
- `waitlistRank`: position dans la liste d'attente
- `cancelledByAdminId` / `refundStatus` / `refundMethod` / `refundedAt`: gestion remboursement admin

**Business rules**:

- Max 2 tables par jour par joueur (sauf tables spéciales)
- Pas de deux tables au même horaire pour le même joueur
- Inscription confirmée uniquement après paiement
- Liste d'attente avec timer configurable (4h-12h), expiration = rotation en fin de liste
- Inscriptions admin (`isAdminCreated = true`) ne sont jamais expirées automatiquement
- Numéros de dossard (`bib_number`) attribués via `TournamentPlayer`

## External Integrations

### FFTT API (French Table Tennis Federation)

- Player data lookup by license number
- Client in `packages/fftt-client/`
- Mock available for local dev (`MockFFTTClient`)

### HelloAsso (Payment)

- API V5, webhook verification mandatory
- Never trust frontend redirect, always verify via webhook
- Metadata includes `registration_id` for reconciliation
- Supports partial and full refunds

### Infrastructure

- **Deployment**: VPS via Dokploy
- **Containers**: Docker multi-container (API, Front, DB, Redis)
- **Automation**: n8n (webhooks for notifications/reporting)

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
