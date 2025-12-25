# Change: Table Management

## Why
Tables are the heart of the tournament's sports offering. The organizer must be able to create, modify, and delete tables with their parameters (points, schedules, quotas, prices).

## What Changes
- Complete CRUD for tables
- Parameters: name, day, time, min/max points, quota, price
- "Special Table" option (ignores 2 tables/day rule)
- Fill rate display

## Impact
- Affected specs: `table-management` (new capability)
- Affected code: `api/app/models/Table.ts`, `api/app/controllers/admin/TablesController.ts`