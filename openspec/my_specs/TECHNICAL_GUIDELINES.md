# 1. Stack Overview
## Backend
- Framework: AdonisJS v6 (API Mode).
- Database: PostgreSQL (deployed via Dokploy).
- ORM: Lucid.
- Validation: VineJS.
- Language: TypeScript (Strict mode).
## Frontend
- Framework: React (via Vite).
- Language: TypeScript (Strict mode).
- Styling: Tailwind CSS.
- UI Library: Shadcn UI (Radix Primitives) with Neo-Brutalism skin.
- State Management: React Query (TanStack Query) for server state, React Context for simple global UI state.
## Infrastructure
- Deployment: VPS managed with Dokploy.
- Docker: Multi-container setup (API, Front, DB, Redis).
- Automation: n8n (via Webhooks for notifications/reporting).

# 2. Development Standards
## A. TypeScript & Typing Rules
- No any: Usage of any is strictly prohibited. Use unknown if necessary and narrow down types.
- DTOs (Data Transfer Objects):
- Backend: Use VineJS validators to strictly type incoming HTTP requests.
- Frontend: Use Zod schemas to validate API responses. Do not trust the backend blindly.
- Shared Types: If possible, share TS interfaces between Back and Front (via a monorepo structure or shared package), otherwise, ensure strict syncing.
## B. Naming Conventions
- Variables/Functions: camelCase (e.g., getPlayerStats, isTableFull).
- Classes/Components: PascalCase (e.g., TournamentController, SubmitButton).
- Files: kebab-case (e.g., auth-service.ts, user-profile.tsx).
- Database Columns: snake_case (Adonis handles the mapping automatically).
- Constants: UPPER_SNAKE_CASE (e.g., MAX_REGISTRATIONS_PER_DAY).
## C. Folder Structure (Recommendations)
Backend (AdonisJS)
Standard Adonis structure, but logic must be extracted from Controllers:
- app/controllers: Handle HTTP request/response ONLY.
- app/services: Contains the business logic (e.g., RegistrationService.ts handles the complex waitlist logic).
- app/models: Lucid Models.

Frontend (React)
- src/components/ui: Shadcn/Generic components.
- src/features: Feature-based architecture (e.g., src/features/tournament-registration, src/features/admin-checkin).
- src/lib: Configuration (axios instance, utils).  
# D. API Design Guidelines

- RESTful: Standard REST methods (GET, POST, PUT, DELETE).
- Response Format: All API responses must follow this wrapper:  
     
     ```JSON  
    // Success (200/201)  
    {  
      "status": "success",  
      "data": { ... }  
    }  
      
    // Error (4xx/5xx)  
    {  
      "status": "error",  
      "code": "ERROR_CODE_MACHINE", // e.g., "TABLE_FULL_ERROR"  
      "message": "Human readable message for toast notifications"  
    }  
```
    
# 3. Specific Implementation Details

## Module: FFTT API Client

- Must be developed as a standalone class/module in packages/fftt-client (or similar isolation).
- Requirement: Must be agnostic of AdonisJS (pure TS/Axios) to be reusable in other projects.
- Mocking: Create a MockFFTTClient implementing the same interface for local dev without API credentials.
## Module: Payment (HelloAsso)

- Use the HelloAsso API V5.
- Critical: Implement Webhook verification to confirm payments. Never trust the frontend redirect alone.
- Metadata: Pass the internal registration_id in the HelloAsso metadata field to reconcile payments easily.

## Frontend UI (Neo-Brutalism)
- Base: Shadcn UI.
- Customization:
- border-radius: 0px (or very small).
- border: 2px or 3px solid black.
- box-shadow: Hard shadows (no blur), e.g., 4px 4px 0px 0px #000.

- Reversibility: Do not write custom CSS in index.css. Use Tailwind utility classes within the Shadcn components files. This allows reverting to "Classic" Shadcn by simply replacing the component files.
# 4. Deployment (Dokploy)
- Dockerfile: Create optimized multi-stage Dockerfiles for both Adonis (Node Alpine) and React (Nginx Alpine).
- Environment: secrets must be injected via Environment Variables in Dokploy, never hardcoded.
