# User Stories List - Table Tennis Tournament Management

## Phase 1: Technical Foundation & Configuration (Admin)

The goal is to allow administrators to configure the tournament structure before opening registrations.

- US-1.1: Table Creation
- As an Admin,
- I want to create a new "Table" by defining its parameters (Name, Min/Max Points, Start Time, Tournament Day, Place Quota, Price),
- so that I can structure the competition's sports offering.

- US-1.2: Refund Configuration
- As an Admin,
- I want to define a refund deadline date and time,
- so that the system automatically knows when to refuse player refund requests.
- US-1.3: Special Tables
- As an Admin,
- I want to activate a "Special Table" marker on certain tables (e.g., Doubles, All Series),
- so that I can exempt players registering for this table from the "2 tables per day" limit rule.
- US-1.4: Manual Registration (Back-office)
- As an Admin,
- I want to manually register a player with the ability to bypass rules (quotas or points),
- so that I can manage exceptional cases (Wildcards, entry errors, guests).
- US-1.5: CSV Exports
- As an Admin,
- I want to export the list of registrants per table in CSV format (including License No., points, club),
- so that I can import this data into the tournament management software (SPID/GIRPE).


## Phase 2: Public Registration & Payment

The goal is to allow fluid and autonomous registration for participants.

- US-2.1: Passwordless Authentication
- As a Subscriber (Public User),
- I want to log in by entering my email and receiving an OTP code (or magic link),
- so that I don't have to create an account or memorize a password.

- US-2.2: Dashboard
- As a Subscriber,
- I want to see the list of all my registrations (past and current) with their status,
- so that I can verify if I am properly registered or still on the waitlist.

- US-2.3: License Search (Update)
- As a Subscriber,
- I want to enter only the player's License Number,
- so that I can identify the player uniquely via the FFTT database (or Mock) without risk of homonymy.

- US-2.4: Payer / Player Distinction
- As a Subscriber,
- I want to be able to specify if I am registering "Myself" or "A third party" (another player),
- so that the system records the correct name on the match sheet, even if it is my email managing the file.

- US-2.5: Schedule Conflict Control
- As a System,
- I want to prevent simultaneous selection of two tables having the same start time,
- so that I can avoid a player being called to two places at the same time.

- US-2.6: Quantitative Limit Control
- As a System,
- I want to block validation if a player has selected more than 2 tables for a same day (excluding special tables),
- so that I can enforce sports regulations.

- US-2.7: Online Payment
- As a Subscriber,
- I want to pay my cart total by credit card,
- so that I can definitively validate my registrations (unpaid registrations are not validated).

- US-2.8: Cancellation and Refund
- As a Subscriber,
- I want to click on an "Unregister" button,
- so that I can free up my place.
    
- Acceptance Criterion: If current date < Deadline, a refund is triggered. Otherwise, the place is freed without refund.
    
## Phase 3: Waitlist Automation

The goal is to optimize table filling without human intervention.

- US-3.1: Waitlist Registration
- As a Subscriber,
- I want to register on the "Waitlist" if a table is full (without paying),
- so that I can be notified if a place becomes free.

- US-3.2: Free Place Notification
- As a System,
- I want to detect that a place has become free and automatically send an email to the Rank 1 player on the waitlist with a payment link,
- so that I can fill the gap as quickly as possible.

- US-3.3: Validation Timer
- As a System,
- I want to start a countdown (e.g., 4h or 12h) at the moment the email is sent,
- so that I don't block the place if the player does not react.

- US-3.4: Automatic Rotation (Expiration)
- As a System,
- I want to verify Timer expiration. If the delay is exceeded without payment:
1. The current player is moved to the end of the waitlist.
2. The process restarts for the next player,
- so that I can give the next person a chance and guarantee the table fills up.


## Phase 4: "D-Day" Module (Check-in)

The goal is to speed up player reception on tournament day.

- US-4.1: Day Filtering (Update)
- As an Admin,
- I want to select a specific date among the tournament days (via a menu/tabs),
- so that I can filter the list and only display players expected that day (multi-day management).

- US-4.2: Player Synthetic View
- As an Admin,
- I want to see at a glance all of a player's tables for the selected day during their check-in,
- so that I can confirm their convocation times to them.

- US-4.3: Check-in Action
- As an Admin,
- I want to validate a player's presence via a simple button/switch ("Check-in"),
- so that I can record their arrival time in the database.

- US-4.4: Absentee Identification
- As an Admin,
- I want to quickly visualize registered but not checked-in players (color code or filter),
- so that I can make microphone calls or scratch them from pools before the tournament starts.

- US-4.5: "Last Minute" Registration
- As an Admin,
- I want to register a player on site via a simplified form and note their payment method (Cash/Check/QR Code),
- so that I can fill last-minute withdrawals.


## Technical Note (For developers)

- FFTT API: For the development phase (V1), calls to the Federation will be simulated ("Mocked") with a test dataset (static JSON file) to not depend on real API availability.
- Dates: The system must handle timezones correctly, but the tournament is considered to take place in a single timezone (Metropolitan France by default).