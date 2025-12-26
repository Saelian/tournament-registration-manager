# Tasks: add-tournament-config

## 1. Data Model
- [x] 1.1 Create Tournament model
- [x] 1.2 Create migration (name, start_date, end_date, location, refund_deadline, waitlist_timer_hours)
- [x] 1.3 Add VineJS validations

## 2. Backend API
- [x] 2.1 Create TournamentController
- [x] 2.2 GET /admin/tournament - Retrieve config
- [x] 2.3 PUT /admin/tournament - Update config
- [x] 2.4 Create validators (create, update)

## 3. Admin Frontend
- [x] 3.1 Create tournament configuration page, only accessible for admins
- [x] 3.2 Form with all fields
- [x] 3.3 Client-side validation (Zod)
- [x] 3.4 TanStack Query integration (useQuery, useMutation)
- [x] 3.5 Dashboard for admins to see existing tournaments

## 4. Tests
- [x] 4.1 Test tournament creation
- [x] 4.2 Test update
- [x] 4.3 Test validations (coherent dates, etc.)