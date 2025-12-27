# Tasks: add-player-search

## 1. Backend API
- [x] 1.1 GET /api/players/search?licence=XXX - FFTT Search
- [x] 1.2 Integrate FFTTClient (mock or real)
- [x] 1.3 Manage result cache (optional - skipped for now)
- [x] 1.4 Create Player model (licence, first_name, last_name, club, points, sex, category, needs_verification)

## 2. Data Model
- [x] 2.1 Migration players table
- [x] 2.2 Relation User hasMany Players (for "my players")
- [x] 2.3 Unique constraint on licence

## 3. Frontend - Search
- [x] 3.1 Create PlayerSearch component
- [x] 3.2 License number input with format validation
- [x] 3.3 Search button with loader
- [x] 3.4 Result display (name, club, points)
- [x] 3.5 Message if not found

## 4. Frontend - Payer/Player Distinction
- [x] 4.1 Question "Who are you registering?"
- [x] 4.2 Option "Myself" - Link player profile to email
- [x] 4.3 Option "Another player" - Just associate with registration
- [x] 4.4 Save user-player relation if "myself"

## 5. Manual Entry Fallback
- [x] 5.1 Button "Enter Manually" if API fails
- [x] 5.2 Form name/first name/club/points
- [x] 5.3 Flag needs_verification = true

## 6. Tests
- [x] 6.1 Test valid license search
- [x] 6.2 Test non-existent license search
- [x] 6.3 Test manual fallback
