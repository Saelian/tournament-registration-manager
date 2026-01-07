# Change: Check-in Interface

## Why
On the tournament day, organizers must be able to quickly check in present players. The interface must be optimized for tablet/mobile and allow fast identification. Additionally, when table start times approach, organizers need to extract player lists per table with presence information.

## What Changes
- Day/Date selector (multi-day tournaments)
- Alphabetical list of expected players with check-in status
- Instant search (name or license)
- Synthetic view: player's tables for the day
- Check-in action with timestamping
- Filters: "absentees only" / "present only"
- Presence indicators in "By Table" view (existing Registrations page)
- CSV export with "present only" filter option

## Impact
- Affected specs: `checkin` (new capability), `exports` (modification)
- Affected code:
  - `api/app/models/registration.ts` - Add `checkedInAt` field
  - `api/app/controllers/admin/CheckinController.ts` - New controller
  - `api/app/controllers/admin_exports_controller.ts` - Add presence filter
  - `web/src/features/checkin/` - New check-in interface
  - `web/src/features/admin/registrations/TableAccordion.tsx` - Add presence display
  - `web/src/features/admin/registrations/PlayerRegistrationsTable.tsx` - Add presence column
