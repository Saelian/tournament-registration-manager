# Tasks: add-checkin-interface

## 1. Data Model
- [ ] 1.1 Add fields to Registration: checked_in_at
- [ ] 1.2 Migration for the new field

## 2. Backend API
- [ ] 2.1 GET /admin/checkin/days - List of tournament days
- [ ] 2.2 GET /admin/checkin/:date/players - Players expected this day
- [ ] 2.3 POST /admin/checkin/:registrationId - Check in a player
- [ ] 2.4 DELETE /admin/checkin/:registrationId - Cancel check-in
- [ ] 2.5 Include each player's tables in the response

## 3. Frontend - List
- [ ] 3.1 Create check-in page (Mobile First)
- [ ] 3.2 Tabs/selector for days
- [ ] 3.3 Alphabetical list of players
- [ ] 3.4 Display for each player: name, tables, check-in status

## 4. Frontend - Search
- [ ] 4.1 Sticky search bar at top
- [ ] 4.2 Instant search (debounce 300ms)
- [ ] 4.3 Search by name or license number
- [ ] 4.4 Highlight searched term

## 5. Frontend - Action
- [ ] 5.1 Switch or "Present" button per player
- [ ] 5.2 Immediate visual feedback
- [ ] 5.3 Display check-in time
- [ ] 5.4 Allow cancelling check-in

## 6. Frontend - Filters
- [ ] 6.1 Toggle "Show absentees only"
- [ ] 6.2 Counter absent/present/total
- [ ] 6.3 Sort by table (optional)

## 7. Tests
- [ ] 7.1 Test check-in
- [ ] 7.2 Test search
- [ ] 7.3 Test filters