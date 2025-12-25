# Tasks: add-player-search

## 1. Backend API
- [ ] 1.1 GET /api/players/search?licence=XXX - FFTT Search
- [ ] 1.2 Integrate FFTTClient (mock or real)
- [ ] 1.3 Manage result cache (optional)
- [ ] 1.4 Create Player model (licence, first_name, last_name, club, points, sex, category, needs_verification)

## 2. Data Model
- [ ] 2.1 Migration players table
- [ ] 2.2 Relation User hasMany Players (for "my players")
- [ ] 2.3 Unique constraint on licence

## 3. Frontend - Search
- [ ] 3.1 Create PlayerSearch component
- [ ] 3.2 License number input with format validation
- [ ] 3.3 Search button with loader
- [ ] 3.4 Result display (name, club, points)
- [ ] 3.5 Message if not found

## 4. Frontend - Payer/Player Distinction
- [ ] 4.1 Question "Who are you registering?"
- [ ] 4.2 Option "Myself" - Link player profile to email
- [ ] 4.3 Option "Another player" - Just associate with registration
- [ ] 4.4 Save user-player relation if "myself"

## 5. Manual Entry Fallback
- [ ] 5.1 Button "Enter Manually" if API fails
- [ ] 5.2 Form name/first name/club/points
- [ ] 5.3 Flag needs_verification = true

## 6. Tests
- [ ] 6.1 Test valid license search
- [ ] 6.2 Test non-existent license search
- [ ] 6.3 Test manual fallback