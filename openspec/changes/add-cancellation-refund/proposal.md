# Change: Cancellation and Refund

## Why
Players must be able to unregister. Depending on the configured deadline, a refund is triggered or not. The freed place triggers the waitlist automation.

## What Changes
- "Unregister" button in dashboard
- Refund logic according to deadline
- HelloAsso API call for refund
- Place release and waitlist notification

## Impact
- Affected specs: `cancellation` (new capability)
- Affected code: `api/app/services/CancellationService.ts`