# project-setup Specification

## Purpose
TBD - created by archiving change add-project-setup. Update Purpose after archive.
## Requirements
### Requirement: Monorepo Structure
The project MUST be organized as a monorepo with clear separation between backend, frontend, and shared packages.

#### Scenario: Folder Structure
- **WHEN** a developer clones the project
- **THEN** they find `api/`, `web/`, and `packages/` folders at the root

#### Scenario: Functional Workspace
- **WHEN** a developer runs `pnpm install` at the root
- **THEN** all dependencies for all packages are installed

### Requirement: Backend AdonisJS
The backend MUST be an AdonisJS v6 API configured in API mode with strict TypeScript.

#### Scenario: Server Start
- **WHEN** a developer runs `pnpm dev` in `api/`
- **THEN** the server starts and responds on the configured port

#### Scenario: Database Connection
- **WHEN** the server starts with correct environment variables
- **THEN** the PostgreSQL connection is established via Lucid ORM

### Requirement: Frontend React
The frontend MUST be a React/Vite application with strict TypeScript, Tailwind CSS, and Shadcn UI.

#### Scenario: Frontend Start
- **WHEN** a developer runs `pnpm dev` in `web/`
- **THEN** the application starts in development mode with hot reload

#### Scenario: Neo-Brutalism Theme
- **WHEN** a Shadcn component is displayed
- **THEN** it uses the Neo-Brutalism style (thick borders, hard shadows, minimal radius)

### Requirement: API Response Format
All API responses MUST follow a standardized format.

#### Scenario: Success Response
- **WHEN** an API request succeeds
- **THEN** the response contains `{ "status": "success", "data": {...} }`

#### Scenario: Error Response
- **WHEN** an API request fails
- **THEN** the response contains `{ "status": "error", "code": "ERROR_CODE", "message": "..." }`

### Requirement: Docker Development Environment
The project MUST provide a complete Docker environment for local development.

#### Scenario: Full Start
- **WHEN** a developer runs `docker-compose up`
- **THEN** the API, Web, PostgreSQL, and Redis services start

#### Scenario: Data Persistence
- **WHEN** containers are restarted
- **THEN** PostgreSQL data is persisted via a volume

