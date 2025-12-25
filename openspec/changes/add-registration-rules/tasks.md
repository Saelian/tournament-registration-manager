# Tasks: add-registration-rules

## 1. Backend Service
- [ ] 1.1 Create RegistrationRulesService
- [ ] 1.2 Implement getEligibleTables(player) - filtering by points
- [ ] 1.3 Implement checkDailyLimit(player, selectedTables) - max 2/day
- [ ] 1.4 Implement checkTimeConflicts(selectedTables) - same time
- [ ] 1.5 Implement validateSelection(player, tables) - combination of all rules

## 2. Backend API
- [ ] 2.1 GET /api/tables/eligible?player_id=X - Eligible tables
- [ ] 2.2 POST /api/registrations/validate - Validate a selection before payment
- [ ] 2.3 Return detailed errors per rule

## 3. Frontend
- [ ] 3.1 Grey out ineligible tables (points)
- [ ] 3.2 Display ineligibility reason on hover
- [ ] 3.3 Disable selection if schedule conflict
- [ ] 3.4 Display warning if daily limit reached
- [ ] 3.5 Display remaining places for each table

## 4. Tests
- [ ] 4.1 Test points filter
- [ ] 4.2 Test 2 tables/day limit
- [ ] 4.3 Test special tables (exempted)
- [ ] 4.4 Test schedule conflicts
- [ ] 4.5 Test rule combinations