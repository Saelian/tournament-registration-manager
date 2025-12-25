# Development Plan - Tournament Registration Manager

This document describes the project breakdown into OpenSpec changes. Each change corresponds to an atomic feature, independently implementable (in the planned order).

---

## Phase 0: Infrastructure & Setup

### 1. `add-project-setup`
**Capability**: `project-setup`

Initial project setup:
- Monorepo structure (api/, web/, packages/)
- AdonisJS v6 configuration (API mode)
- React/Vite configuration with Tailwind + Shadcn
- Docker Compose (API, DB PostgreSQL, Redis)
- Strict TypeScript configuration
- Shared Prettier/ESLint

**Dependencies**: None

---

## Phase 1: Technical Foundation & Back-Office (Admin)

### 2. `add-admin-auth`
**Capability**: `admin-auth`

Administrator authentication:
- Admin Login/Logout (email + password)
- Secure session (httpOnly cookies)
- Admin route protection middleware
- Default admin seed

**Dependencies**: `add-project-setup`
**User Stories**: Implicit prerequisite

---

### 3. `add-tournament-config`
**Capability**: `tournament-config`

Global tournament configuration:
- Tournament CRUD (name, dates, location)
- Refund deadline
- Waitlist timer duration
- General settings

**Dependencies**: `add-admin-auth`
**User Stories**: US-1.2

---

### 4. `add-table-crud`
**Capability**: `table-management`

Table management:
- Table CRUD (Name, Day, Start Time, Price, Min/Max Points, Quota)
- "Special Table" option (ignores 2 tables/day rule)
- Fill rate display

**Dependencies**: `add-tournament-config`
**User Stories**: US-1.1, US-1.3

---

### 5. `add-fftt-client`
**Capability**: `fftt-client`

Isolated FFTT API Client:
- Standalone module in `packages/fftt-client`
- Agnostic interface (pure TS/Axios)
- Search by license number
- Retrieval: First Name, Last Name, Club, Points, Gender, Category
- MockFFTTClient for local dev (JSON file)
- Manual entry fallback with "To Verify" flag

**Dependencies**: `add-project-setup`
**User Stories**: US-2.3, Technical Note

---

## Phase 2: Public Registration & Payment

### 6. `add-otp-auth`
**Capability**: `otp-auth`

Passwordless authentication for public users:
- Email entry
- 6-digit OTP code sent by email
- OTP validation and session creation
- Configurable session duration

**Dependencies**: `add-project-setup`
**User Stories**: US-2.1

---

### 7. `add-user-dashboard`
**Capability**: `user-dashboard`

User dashboard:
- List of registrations linked to email
- Visual statuses: Validated, Pending Payment, Waitlist, Cancelled
- Navigation to details/actions

**Dependencies**: `add-otp-auth`
**User Stories**: US-2.2

---

### 8. `add-player-search`
**Capability**: `player-search`

Player search and identification:
- License number input field
- fftt-client integration to retrieve profile
- "Myself" vs "Third party" distinction
- Subscriber email / player association

**Dependencies**: `add-fftt-client`, `add-otp-auth`
**User Stories**: US-2.3, US-2.4

---

### 9. `add-registration-rules`
**Capability**: `registration-rules`

Registration rules engine:
- Eligible table filter (player points <= max points)
- Control: max 2 tables/day (except special ones)
- Control: no tables at the same time
- Control: Gender/Age if parameterized
- Remaining places display

**Dependencies**: `add-table-crud`, `add-player-search`
**User Stories**: US-2.5, US-2.6

---

### 10. `add-registration-flow`
**Capability**: `registration-flow`

Complete registration flow:
- Table selection (with rules)
- Registration cart
- Saturation management: "Register" or "Waitlist"
- Registration statuses (pending, paid, waitlist)

**Dependencies**: `add-registration-rules`
**User Stories**: B3, B4 from PRD

---

### 11. `add-helloasso-payment`
**Capability**: `payment`

HelloAsso payment integration:
- HelloAsso checkout creation (API V5)
- Passing registration_id in metadata
- Payment confirmation webhook
- Registration status update after payment
- Never trust redirect alone

**Dependencies**: `add-registration-flow`
**User Stories**: US-2.7

---

### 12. `add-cancellation-refund`
**Capability**: `cancellation`

Cancellation and refund:
- "Unregister" button on dashboard
- Deadline rule: before = refund, after = none
- HelloAsso API call for refund
- Place release

**Dependencies**: `add-helloasso-payment`, `add-user-dashboard`
**User Stories**: US-2.8

---

## Phase 3: Waitlist Automation

### 13. `add-waitlist-registration`
**Capability**: `waitlist`

Waitlist registration:
- Add to queue if table full
- No immediate payment
- Rank visible to user
- "waitlist" status in dashboard

**Dependencies**: `add-registration-flow`
**User Stories**: US-3.1

---

### 14. `add-waitlist-automation`
**Capability**: `waitlist-automation`

Waitlist automation:
- Detection of released place (unregistration/deletion)
- Email to rank 1 with unique payment link
- Configurable timer (4h-12h)
- Expiration: player moved to end of list, pass to next
- CRON jobs or events

**Dependencies**: `add-waitlist-registration`, `add-cancellation-refund`
**User Stories**: US-3.2, US-3.3, US-3.4

---

## Phase 4: "D-Day" Module (Check-in)

### 15. `add-checkin-interface`
**Capability**: `checkin`

Check-in interface:
- Day/Date selector (multi-day tabs)
- Alphabetical list of expected players
- Instant search bar (Name/License)
- Synthetic view: player's tables for the day
- Check-in action (switch/"Present" button)
- Timestamping in database
- Filter "Show absentees only"
- Mobile First Interface

**Dependencies**: `add-registration-flow`
**User Stories**: US-4.1, US-4.2, US-4.3, US-4.4

---

### 16. `add-last-minute-registration`
**Capability**: `last-minute-registration`

"Last Minute" registration:
- Simplified on-site form
- Player search (fftt-client)
- Possible rule bypass (admin)
- Payment method choice: Cash, Check, QR Code

**Dependencies**: `add-checkin-interface`, `add-fftt-client`
**User Stories**: US-4.5, US-1.4

---

### 17. `add-csv-exports`
**Capability**: `exports`

CSV Exports:
- "Referee" format: License, Last Name, First Name, Points, Club (grouped by table)
- "Accounting" format: List of payments
- Download from back-office

**Dependencies**: `add-registration-flow`, `add-admin-auth`
**User Stories**: US-1.5

---

## Changes Summary

| # | Change ID | Capability | Phase | Main Dependencies |
|---|-----------|------------|-------|-------------------|
| 1 | `add-project-setup` | project-setup | 0 | - |
| 2 | `add-admin-auth` | admin-auth | 1 | 1 |
| 3 | `add-tournament-config` | tournament-config | 1 | 2 |
| 4 | `add-table-crud` | table-management | 1 | 3 |
| 5 | `add-fftt-client` | fftt-client | 1 | 1 |
| 6 | `add-otp-auth` | otp-auth | 2 | 1 |
| 7 | `add-user-dashboard` | user-dashboard | 2 | 6 |
| 8 | `add-player-search` | player-search | 2 | 5, 6 |
| 9 | `add-registration-rules` | registration-rules | 2 | 4, 8 |
| 10 | `add-registration-flow` | registration-flow | 2 | 9 |
| 11 | `add-helloasso-payment` | payment | 2 | 10 |
| 12 | `add-cancellation-refund` | cancellation | 2 | 7, 11 |
| 13 | `add-waitlist-registration` | waitlist | 3 | 10 |
| 14 | `add-waitlist-automation` | waitlist-automation | 3 | 12, 13 |
| 15 | `add-checkin-interface` | checkin | 4 | 10 |
| 16 | `add-last-minute-registration` | last-minute-registration | 4 | 5, 15 |
| 17 | `add-csv-exports` | exports | 4 | 2, 10 |

---

## Suggested Implementation Order

```
Phase 0: 1
Phase 1: 2 → 3 → 4 (sequential) + 5 (parallel to 2-4)
Phase 2: 6 → 7 → 8 → 9 → 10 → 11 → 12
Phase 3: 13 → 14
Phase 4: 15 → 16 + 17 (parallel)
```

---

## Next Steps

For each change, create the OpenSpec structure:
```
openspec/changes/<change-id>/
├── proposal.md     # Why, What, Impact
├── tasks.md        # Implementation Checklist
├── design.md       # If technical complexity (optional)
└── specs/
    └── <capability>/
        └── spec.md # Requirements with Scenarios
```

Use `/openspec:proposal` or request manual creation of each spec.