# Tasks: add-registration-rules

## 1. Backend Service
- [x] 1.1 Create RegistrationRulesService
- [x] 1.2 Implement getEligibleTables(player) - filtering by points
- [x] 1.3 Implement checkDailyLimit(player, selectedTables) - max 2/day
- [x] 1.4 Implement checkTimeConflicts(selectedTables) - same time
- [x] 1.5 Implement validateSelection(player, tables) - combination of all rules

## 2. Backend API
- [x] 2.1 GET /api/tables/eligible?player_id=X - Eligible tables
- [x] 2.2 POST /api/registrations/validate - Validate a selection before payment
- [x] 2.3 Return detailed errors per rule

## 3. Frontend
- [x] 3.1 Grey out ineligible tables (points)
- [x] 3.2 Display ineligibility reason on hover
- [x] 3.3 Disable selection if schedule conflict
- [x] 3.4 Display warning if daily limit reached
- [x] 3.5 Display remaining places for each table

## 4. Tests
- [x] 4.1 Test points filter
- [x] 4.2 Test 2 tables/day limit
- [x] 4.3 Test special tables (exempted)
- [x] 4.4 Test schedule conflicts
- [x] 4.5 Test rule combinations