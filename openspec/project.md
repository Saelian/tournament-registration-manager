# Project Context

## Purpose
Web application for managing table tennis tournament registrations.

**Philosophy**: "Zero friction" - no complex user account, no password. Priority on registration speed and administrative efficiency on D-Day.

**Scope**:
- Online registrations with rule verification (points, schedules, quotas)
- Online payment (HelloAsso)
- Automated waitlist with timer and rotation
- Administrative management (Table CRUD, CSV exports)
- On-site check-in on tournament day

**Exclusion**: Sports management (brackets, pools) - managed by third-party software (SPID/GIRPE).

## Tech Stack

### Backend
- **Framework**: AdonisJS v6 (API Mode)
- **Database**: PostgreSQL
- **ORM**: Lucid
- **Validation**: VineJS
- **Language**: TypeScript (Strict mode)

### Frontend
- **Framework**: React (via Vite)
- **Language**: TypeScript (Strict mode)
- **Styling**: Tailwind CSS
- **UI Library**: Shadcn UI (Radix Primitives) with Neo-Brutalism skin
- **State Management**: TanStack Query (server state), React Context (UI state)

### Infrastructure
- **Deployment**: VPS via Dokploy
- **Containers**: Docker multi-container (API, Front, DB, Redis)
- **Automation**: n8n (webhooks for notifications/reporting)

## Project Conventions

### Code Style

**Naming Conventions**:
- Variables/Functions: `camelCase` (e.g., `getPlayerStats`, `isTableFull`)
- Classes/Components: `PascalCase` (e.g., `TournamentController`, `SubmitButton`)
- Files: `kebab-case` (e.g., `auth-service.ts`, `user-profile.tsx`)
- Database Columns: `snake_case` (automatic mapping by Lucid)
- Constants: `UPPER_SNAKE_CASE` (e.g., `MAX_REGISTRATIONS_PER_DAY`)

**TypeScript Rules**:
- `any` strictly forbidden - use `unknown` and narrowing if necessary
- Backend: VineJS validators to type HTTP requests
- Frontend: Zod schemas to validate API responses

### Architecture Patterns

**Backend (AdonisJS)**:
- `app/controllers`: HTTP request/response management ONLY
- `app/services`: Business logic (e.g., `RegistrationService.ts` for waitlist logic)
- `app/models`: Lucid Models

**Frontend (React)**:
- `src/components/ui`: Shadcn/generic components
- `src/features`: Feature-based architecture (e.g., `src/features/tournament-registration`)
- `src/lib`: Configuration (axios instance, utils)

**API Design**:
- Standard RESTful (GET, POST, PUT, DELETE)
- Uniform response format:
```json
// Success (200/201)
{ "status": "success", "data": { ... } }

// Error (4xx/5xx)
{ "status": "error", "code": "ERROR_CODE_MACHINE", "message": "Readable message" }
```

### Testing Strategy
- FFTT API Mock for development (static JSON file)
- Load testing planned for multi-registration scenarios (e.g., "Coach registering 10 kids")

### Git Workflow
[To be defined based on preferences - trunk-based, gitflow, etc.]

## Domain Context

### Actors
1. **Manager (Admin)**: Tournament organizer. Configures tables, tracks finances, manages check-in.
2. **Subscriber**: Public user with email. Can be the player or a third party (coach, parent).
3. **Player**: Physical person identified by their FFTT License Number.

### Domain Concepts
- **Table**: Competition category with min/max points, schedule, quota, price
- **Special Table**: Exempt from the "2 tables max/day" rule (e.g., Doubles)
- **Waitlist**: Queue with payment timer and automatic rotation
- **Check-in**: D-Day verification with timestamp

### Key Business Rules
- Max 2 tables per day per player (except special tables)
- No tables with the same start time
- Registration confirmed only after payment
- Waitlist timer: configurable delay (4h-12h), expiration = rotation to end of list

## Important Constraints

- **Passwordless authentication**: OTP by email only, no password
- **Mandatory payment**: Registration not validated without payment (except waitlist)
- **Refund deadline**: After this date, unregistration without refund
- **Timezone**: Metropolitan France only
- **Secrets**: Environment variables via Dokploy, never hardcoded

## External Dependencies

### FFTT API (French Table Tennis Federation)
- Player data retrieval: First Name, Last Name, Club, Official Points, Gender, Age Category
- Fallback if unavailable: manual entry with "To Verify" flag
- **Isolated module**: `packages/fftt-client` - AdonisJS agnostic (pure TS/Axios)
- **Mock**: `MockFFTTClient` for local dev without credentials

### HelloAsso API (Payment)
- Version: API V5
- Webhook verification mandatory (never trust frontend redirect)
- Metadata: `registration_id` for payment reconciliation
- Automatic refund management

### n8n (Automation)
- Webhooks for email notifications
- Reporting and alerts