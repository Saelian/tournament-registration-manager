# Change: Registration Rules Engine

## Why
Registrations must adhere to strict business rules: eligibility by points, maximum 2 tables per day, no schedule conflicts. This rules engine centralizes all validation logic.

## What Changes
- Eligible table filtering according to player points
- Control of maximum 2 tables/day (except special tables)
- Schedule conflict detection
- Remaining places display

## Impact
- Affected specs: `registration-rules` (new capability)
- Affected code: `api/app/services/RegistrationRulesService.ts`