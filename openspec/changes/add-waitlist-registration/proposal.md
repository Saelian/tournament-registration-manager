# Change: Waitlist Registration

## Why
When a table is full, players must be able to join a waitlist to be notified if a place becomes free. No payment at this stage.

## What Changes
- "Add me to waitlist" option for full tables
- No payment required for waitlist
- Rank visible in dashboard
- Distinct "waitlist" status

## Impact
- Affected specs: `waitlist` (new capability)
- Affected code: `api/app/services/WaitlistService.ts`