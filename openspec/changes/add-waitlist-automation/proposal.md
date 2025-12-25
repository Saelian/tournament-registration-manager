# Change: Waitlist Automation

## Why
When a place becomes free, the rank 1 player must be automatically notified with a deadline to pay. If the deadline expires, the next player is notified. This process must be automatic 24/7.

## What Changes
- Automatic detection of freed places
- Email to rank 1 with unique payment link
- Configurable timer (4h-12h)
- Expiration: player moved to end of list, notification of next
- CRON jobs or events

## Impact
- Affected specs: `waitlist-automation` (new capability)
- Affected code: `api/app/services/WaitlistAutomationService.ts`, `api/app/jobs/`