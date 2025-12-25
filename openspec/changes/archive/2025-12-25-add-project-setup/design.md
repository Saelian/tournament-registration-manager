# Design: add-project-setup

## Context
Initial setup of a fullstack TypeScript project with AdonisJS (backend) and React (frontend), deployed via Docker on Dokploy.

## Goals / Non-Goals
**Goals:**
- Clear and maintainable structure
- Shared strict TypeScript configuration
- Reproducible development environment (Docker)
- Consistent Neo-Brutalism UI theme

**Non-Goals:**
- CI/CD setup (will be done later)
- Automated tests (each feature will add its tests)

## Decisions

### Monorepo Structure
```
/
├── api/                 # AdonisJS backend
├── web/                 # React frontend
├── packages/            # Shared packages (fftt-client, types)
├── docker-compose.yml
└── package.json         # Workspace config
```
**Rationale:** Simplicity, no need for Turborepo/Nx for this project size.

### Package Manager
- **Decision:** pnpm with workspaces
- **Rationale:** Faster, better dependency management, native workspace support

### API Response Format
```typescript
// Success
{ status: "success", data: T }

// Error
{ status: "error", code: string, message: string }
```
**Rationale:** Uniform format to simplify frontend parsing.

### Neo-Brutalism Theme
```css
/* Tailwind config overrides */
--radius: 0px;
border: 2px solid black;
box-shadow: 4px 4px 0px 0px #000;
```
**Rationale:** Applied via Shadcn component customization, reversible if needed.

## Risks / Trade-offs
- **Simple Monorepo** → May require migration to Turborepo if project grows
- **pnpm** → Less common than npm/yarn, minor learning curve

## Open Questions
- None for this phase