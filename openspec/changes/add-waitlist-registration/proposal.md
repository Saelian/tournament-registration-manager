# Change: Waitlist Registration

## Why
When a table is full, players must be able to join a waitlist to be notified if a place becomes free. No payment at this stage. When a spot opens up, admins can manually promote waitlist players, who then have a limited time to pay.

## What Changes
- "Add me to waitlist" option for full tables
- No payment required for waitlist
- Rank visible in dashboard
- Distinct "waitlist" status
- Users can withdraw from waitlist (same as cancelling a registration)
- Admins can promote a waitlist registration to pending_payment
- User notified by email when promoted, must pay within configured timer
- Waitlist protection: new direct registrations blocked while waitlist exists
- Ranks recalculated when someone leaves the waitlist

## Future Considerations
- Automatic promotion when a spot opens (not in scope, but design should allow it)

## Impact
- Affected specs: `waitlist` (new capability)
- Affected code:
  - `api/app/services/waitlist_service.ts` (new)
  - `api/app/services/registration_rules_service.ts` (waitlist protection)
  - `api/app/controllers/registrations_controller.ts`
  - `api/app/controllers/admin/registrations_controller.ts`
