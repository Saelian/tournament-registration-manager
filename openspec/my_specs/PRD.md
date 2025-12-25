# 1. Overview and Objectives

Goal: Provide a simplified web application allowing complete management of registrations, payment, and check-in for a table tennis tournament.
Philosophy: "Zero friction".
No complex user account, no password.
Priority on registration speed and administrative efficiency on D-Day.
Scope: Online registrations, payment, automated waitlist, administrative management, on-site check-in.
Exclusion: Sports management (brackets, pools).

# 2. Actors (Personas)

1. The Manager (Admin): Tournament organizer. Configures tables, tracks finances, and manages check-in on D-Day.
2. The Subscriber (Public User): The person navigating the site. Owns the email address. Can be the player themselves or a third party (coach, parent).
3. The Player: The physical person who will play. Identified by their FFTT License No.

# 3. Functional Specifications (By Module)

## MODULE A: Authentication & User Management (Front-Office)

Principle: "Passwordless" authentication.

- A1. OTP Login:
	- User enters their email.
	- System sends a 6-digit code (or magic link) by email.
	- Session is active for a determined duration.
	- Use case: Register, modify a registration, pay a balance.

- A2. User Dashboard ("My Registrations"):
	- List of all registrations linked to this email.
	- Visual status: Validated, Pending Payment, Waitlist, Cancelled.

## MODULE B: Registration Flow

Principle: Strict rule verification before payment.

- B1. Licensee Search (FFTT API):
	- Input field: "License Number" or "Last Name/First Name".
	- FFTT API call to retrieve: Last Name, First Name, Club, Official Points, Gender, Age Category.
	- If API unavailable: Allow manual entry (with "To Verify" flag for admin).
- B2. Player Identification:
	- Question: "Who are you registering?"
	- Choice 1: "Myself" (Player profile is linked to subscriber's email).
	- Choice 2: "Another player" (Parent/Coach). Subscriber's email manages the registration, but player name is different.

- B3. Table Selection (Business Logic):
	- Display eligible tables according to player points (Filter: Player Points <= Table Max Points).
	- Fill rate display (Progress bar or "X places remaining").
	- Validation Control (Blocking):
	- Max 2 tables per day (Unless table tagged "Special").
	- No tables with same start time.
	- Forbidden if Gender or Age does not correspond (if parameterized).

- B4. Saturation Management:
	- If Registered < Capacity: "Register" Button.
	- If Registered >= Capacity: "Add to waitlist" Button (No immediate payment).

## MODULE C: Payment and Cancellation
- C1. Online Payment (HelloAsso API):
	- Cart total calculation.
	- Registration confirmed only after payment success (Webhook Callback).
- C2. Player Cancellation:
	- "Unregister" button on dashboard.
	- Rule: If Current Date < Deadline -> API Refund trigger (total or partial according to config).
	- Rule: If Current Date > Deadline -> Unregistration without refund (warning message).

## MODULE D: Waitlist Automation (Backend)

Complex heart of the application. Must function via scheduled tasks (CRON) or events.

- D1. Trigger: A place becomes free (Unregistration or Admin deletes a player).
- D2. Priority Notification:
	- System takes rank 1 from waitlist.
	- Sends email with unique payment link.
	- Starts a Timer (e.g., 4h or 12h, parameterizable).
- D3. Timer Expiration:
- If no payment at T+Delay:
	- Registration passes to status Waitlist - Expired.
	- Player is moved to the very end of current waitlist.
	- System triggers procedure (D2) for next player.

## MODULE E: Administration (Configuration)
- E1. Tournament & Table CRUD:
	- Table creation: Name, Day, Start Time, Price, Min/Max Points, Places Quota.
	- "Special Table" option (Checkbox: ignores 2 tables/day rule).
	- Global configuration: Tournament Date, Refund Deadline, Waitlist Timer Duration.

- E2. Registrant Management:
	- Complete table with filters (Table, Payment Status, Club).
	- Manual actions: Add a player (bypass rules possible), Delete (Refund Yes/No choice), Change payment status (e.g., check received).

- E3. Exports (CSV):
	- "Referee" format: License, Last Name, First Name, Points, Club (grouped by table).
	- "Accounting" format: List of payments.

## MODULE F: Check-in (Tournament Day)

Tablet/Mobile First Interface.

- F1. Day Selector: "Saturday" / "Sunday" tabs.
- F2. Smart List:

- Instant search bar (Name or License).
- Global alphabetical list of day's players.
- Visual indicator next to name: List of tables where registered (e.g., "Table A - 9am", "Table C - 2pm").

- F3. Check-in Action:
	- ON/OFF Switch or "Present" Button.
	- Action timestamp recorded in database.
	- Quick filter: "Show absentees only".

- F4. "Last Minute" Registration:
	- Simplified form to add a player on site.
    - Payment choice: "Cash", "Check", "QR Code (Online)".

# 4. Task Breakdown (Technical Roadmap)
## Phase 1: Skeleton & Back-office (Admin)
- Project and Database Setup.
- Admin Authentication.
- CRUD (Creation/Modif) of Tables and tournament parameters.
- FFTT API Integration (player data retrieval test).
## Phase 2: Public Registration (Core)
- OTP Authentication (Email).
- Player search form (FFTT API) and "Me" vs "Third party" distinction.
- Table selection logic (Rules engine: points, schedules, quotas).
- Payment Integration (HelloAsso API).
## Phase 3: Advanced Flow Management
- Waitlist Setup (Registration logic if full).
- Automation development (Cron jobs): Release email, Timer, List rotation.
- Automatic Cancellation and Refund management.
## Phase 4: "D-Day" Module (Check-in)
- Responsive interface for check-in.
- Filtering logic by day.
- CSV Exports for Referee.
- Load tests and "Coach registering 10 kids" scenarios.
