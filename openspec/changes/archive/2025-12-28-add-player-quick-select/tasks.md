# Tasks: Add Quick Player Selection

## 1. Backend
- [x] 1.1 Create API endpoint `GET /auth/me/players` to retrieve players from user's previous registrations
- [x] 1.2 Add query to get distinct players registered by the current user (via subscriber email)

## 2. Frontend
- [x] 2.1 Create `useMyPlayers` hook to fetch user's players
- [x] 2.2 Add "My Players" section to `PlayerSearch.tsx` with player cards
- [x] 2.3 Add selection handler to populate player data when clicking a player card
- [x] 2.4 Show license search directly below player list (no extra click needed)
- [x] 2.5 Handle empty state when user has no previous registrations (show license search only)
- [x] 2.6 Remove redundant "Rechercher votre licence" title from RegistrationPanel
- [x] 2.7 Remove duplicate "Inscrire un autre joueur" link

## 3. Testing
- [x] 3.1 Test player list retrieval for authenticated user (backend: `api/tests/functional/auth.spec.ts`)
- [x] 3.2 Test returns distinct players (no duplicates) (backend: `api/tests/functional/auth.spec.ts`)
- [x] 3.3 Test does not return cancelled registrations (backend: `api/tests/functional/auth.spec.ts`)
- [x] 3.4 Test requires authentication (backend: `api/tests/functional/auth.spec.ts`)
