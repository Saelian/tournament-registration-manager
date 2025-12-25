# Change: Check-in Interface

## Why
On the tournament day, organizers must be able to quickly check in present players. The interface must be optimized for tablet/mobile and allow fast identification.

## What Changes
- Day/Date selector (multi-day)
- Alphabetical list of expected players
- Instant search (name or license)
- Synthetic view: player's tables
- Check-in action with timestamping
- Filter "absentees only"

## Impact
- Affected specs: `checkin` (new capability)
- Affected code: `web/src/features/checkin/`, `api/app/controllers/admin/CheckinController.ts`