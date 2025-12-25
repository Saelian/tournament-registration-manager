# Change: CSV Exports

## Why
The organizer needs to export data to import it into tournament management software (SPID/GIRPE) and for accounting.

## What Changes
- "Referee" Export: License, Last Name, First Name, Points, Club (grouped by table)
- "Accounting" Export: List of payments
- Download from back-office

## Impact
- Affected specs: `exports` (new capability)
- Affected code: `api/app/controllers/admin/ExportsController.ts`