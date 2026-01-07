# Tasks: add-checkin-interface

## 1. Data Model
- [x] 1.1 Add `checked_in_at` field (nullable DateTime) to Registration model
- [x] 1.2 Create migration for the new field

## 2. Backend API - Check-in
- [x] 2.1 Create `CheckinController` in `api/app/controllers/`
- [x] 2.2 `GET /admin/checkin/days` - List of tournament days
- [x] 2.3 `GET /admin/checkin/:date/players` - Players expected this day with check-in status
- [x] 2.4 `POST /admin/checkin/:registrationId` - Check in a player (record timestamp)
- [x] 2.5 `DELETE /admin/checkin/:registrationId` - Cancel check-in (set null)
- [x] 2.6 Include each player's tables with start times in the response

## 3. Backend API - Exports Enhancement
- [x] 3.1 Add `presentOnly` filter parameter to `POST /admin/exports/registrations`
- [x] 3.2 Add `presence` and `checkedInAt` columns to registrations export
- [x] 3.3 Filter by `checked_in_at IS NOT NULL` when `presentOnly=true`

## 4. Frontend - Check-in Page (Mobile First)
- [x] 4.1 Create `/admin/checkin` route and page component
- [x] 4.2 Day selector tabs (default: current day if tournament day)
- [x] 4.3 Counters display: "X présents / Y absents / Z total"
- [x] 4.4 Alphabetical player list with: name, license, club, tables, check-in status

## 5. Frontend - Check-in Search
- [x] 5.1 Sticky search bar at top (mobile friendly)
- [x] 5.2 Instant search (debounce 300ms)
- [x] 5.3 Search by name or license number
- [x] 5.4 "No player found" empty state

## 6. Frontend - Check-in Action
- [x] 6.1 Toggle button/switch per player for check-in
- [x] 6.2 Immediate visual feedback (green checkmark, time displayed)
- [x] 6.3 Display check-in time (HH:mm format)
- [x] 6.4 Allow cancelling check-in (toggle off)

## 7. Frontend - Check-in Filters
- [x] 7.1 Filter selector: "Tous" / "Présents" / "Absents"
- [x] 7.2 Update counters in real-time

## 8. Frontend - Registrations > By Table Enhancement
- [x] 8.1 Add presence indicator column to `PlayerRegistrationsTable`
- [x] 8.2 Add presence summary per table in `TableAccordion` header ("X/Y présents")
- [x] 8.3 Add presence filter dropdown in table accordion content

## 9. Frontend - CSV Export Enhancement
- [x] 9.1 Add "Présents uniquement" checkbox in `CsvExportModal` (for table exports)
- [x] 9.2 Add "Présence" and "Heure de pointage" columns options
- [x] 9.3 Pass `presentOnly` parameter to export endpoint

## 10. Tests
- [x] 10.1 API tests: check-in/cancel check-in
- [x] 10.2 API tests: export with presence filter
- [x] 10.3 API tests: export with presence columns
