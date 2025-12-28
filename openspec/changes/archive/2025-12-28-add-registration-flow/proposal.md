# Change: Complete Registration Flow

## Why
The user must be able to select their tables, build their cart, and proceed to registration. This flow integrates business rules and manages the case of full tables (waitlist).

## What Changes
- Table selection interface
- Registration cart with summary
- Saturation management (direct registration or waitlist)
- Creation of registrations with appropriate statuses

## Impact
- Affected specs: `registration-flow` (new capability)
- Affected code: `web/src/features/registration/`, `api/app/controllers/RegistrationsController.ts`