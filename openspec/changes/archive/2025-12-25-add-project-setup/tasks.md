# Tasks: add-project-setup

## 1. Monorepo Structure
- [x] 1.1 Create folder structure (api/, web/, packages/)
- [x] 1.2 Configure workspace (root package.json or pnpm-workspace.yaml)

## 2. Backend (AdonisJS)
- [x] 2.1 Initialize AdonisJS v6 in api/
- [x] 2.2 Configure API mode (disable views)
- [x] 2.3 Configure Lucid ORM with PostgreSQL
- [x] 2.4 Configure VineJS for validation
- [x] 2.5 Add standardized API response format (success/error wrapper)

## 3. Frontend (React)
- [x] 3.1 Initialize React with Vite in web/
- [x] 3.2 Configure strict mode TypeScript
- [x] 3.3 Install and configure Tailwind CSS
- [x] 3.4 Install Shadcn UI and configure Neo-Brutalism theme
- [x] 3.5 Configure TanStack Query
- [x] 3.6 Create Axios instance with interceptors

## 4. Docker Infrastructure
- [x] 4.1 Create Dockerfile for API (Node Alpine, multi-stage)
- [x] 4.2 Create Dockerfile for Frontend (Nginx Alpine, multi-stage)
- [x] 4.3 Create docker-compose.yml (API, Web, PostgreSQL, Redis)
- [x] 4.4 Configure environment variables (.env.example)

## 5. Code Quality
- [x] 5.1 Configure shared ESLint
- [x] 5.2 Configure shared Prettier
- [x] 5.3 Add common npm scripts (dev, build, lint, format)

## 6. Documentation
- [x] 6.1 Update README with setup instructions
