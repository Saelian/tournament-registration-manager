# Tasks: add-tournament-config

## 1. Data Model
- [ ] 1.1 Create Tournament model
- [ ] 1.2 Create migration (name, start_date, end_date, location, refund_deadline, waitlist_timer_hours)
- [ ] 1.3 Add VineJS validations

## 2. Backend API
- [ ] 2.1 Create TournamentController
- [ ] 2.2 GET /admin/tournament - Retrieve config
- [ ] 2.3 PUT /admin/tournament - Update config
- [ ] 2.4 Create validators (create, update)

## 3. Admin Frontend
- [ ] 3.1 Create tournament configuration page
- [ ] 3.2 Form with all fields
- [ ] 3.3 Client-side validation (Zod)
- [ ] 3.4 TanStack Query integration (useQuery, useMutation)

## 4. Tests
- [ ] 4.1 Test tournament creation
- [ ] 4.2 Test update
- [ ] 4.3 Test validations (coherent dates, etc.)