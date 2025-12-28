# Change: Add Table Eligibility Restrictions and Check-in Time

## Why

Currently, tables can only be restricted by points range. Tournament organizers need to create specialized tables for specific demographics (women-only tables, youth categories) and define maximum check-in times for operational efficiency on tournament day.

## What Changes

- Add `gender_restriction` field to restrict tables by player gender (NULL = all, 'F' = women only, 'M' = men only)
- Add `allowed_categories` field (JSONB array) to restrict tables to specific FFTT age categories
- Add `max_checkin_time` field for maximum check-in time (default: 30 minutes before table start)
- Update registration eligibility logic to enforce gender and category restrictions
- Add UI components with checkboxes for category selection

## Impact

- Affected specs: `table-management`, `registration-rules`
- Affected code:
  - `api/app/models/table.ts` - New columns
  - `api/database/migrations/` - Schema changes
  - `api/app/controllers/admin/tables_controller.ts` - CRUD handling
  - `api/app/services/registration_service.ts` - Eligibility checks
  - `web/src/features/admin/tables/` - Form with gender/category selection
