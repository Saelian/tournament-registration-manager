# Design: add-waitlist-automation

## Context
The waitlist automation is the complex heart of the application. It must function autonomously 24/7 to maximize table fill rates.

## Goals / Non-Goals
**Goals:**
- Immediate automatic notification upon release
- Admin configurable timer
- Equitable rotation (expired player goes to end of list)
- Complete audit trail

**Non-Goals:**
- SMS notification (email only)
- Priority based on criteria other than arrival order

## Decisions

### Event-driven Architecture
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Cancellation  │────▶│  PlaceFreed     │────▶│  Notify Rank 1  │
│   or Deletion   │     │  Event          │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
                              ┌─────────────────────────────────────┐
                              │  Timer starts (4h by default)       │
                              └─────────────────────────────────────┘
                                        │
                    ┌───────────────────┴───────────────────┐
                    ▼                                       ▼
            ┌───────────────┐                     ┌───────────────┐
            │  Payment OK   │                     │  Timer expires│
            │  → status=paid│                     │  → End of list│
            └───────────────┘                     │  → Notify next│
                                                  └───────────────┘
```

### Claim Token
```typescript
interface WaitlistClaimToken {
  registration_id: number;
  table_id: number;
  expires_at: DateTime;
  token: string; // UUID v4
}
```
- Stored in database for validation
- Expires with the timer
- One-time use

### CRON Job
- `check-waitlist-expirations`: every 5 minutes
- Selects registrations with `waitlist_expires_at < now()` and `status = waitlist_notified`
- For each: moveToEnd() then notifyNext()

### Waitlist Statuses
```
waitlist          → Simple waiting
waitlist_notified → Notified, timer running
waitlist_expired  → Timer expired, moved to end
```

## Risks / Trade-offs
- **Email not received** → User can request a resend
- **Timer too short** → Configurable by admin (default: 4h)
- **Job load** → Unlikely given volume, but monitoring planned

## Open Questions
- Is a reminder notification needed at mid-timer?