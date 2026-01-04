## ADDED Requirements

### Requirement: Waitlist Registration
The system MUST allow registering on the waitlist for a full table.

#### Scenario: Adding to Waitlist
- **WHEN** a user registers for a full table
- **THEN** the registration is created with status = waitlist and a rank assigned

#### Scenario: No Payment
- **WHEN** a user registers on the waitlist
- **THEN** no payment is required at this stage

#### Scenario: Confirmation
- **WHEN** the waitlist registration is created
- **THEN** a confirmation message with the rank is displayed

### Requirement: Waitlist Ranking
The system MUST manage waitlist ranks.

#### Scenario: Rank Assignment
- **WHEN** a player joins the waitlist
- **THEN** they receive the next rank (current max + 1)

#### Scenario: Displayed Rank
- **WHEN** a player views their waitlist registration
- **THEN** their current rank is displayed ("Position 3 of 5")

#### Scenario: Rank Recalculation
- **WHEN** a player leaves the waitlist (withdrawal, promotion, or cancellation)
- **THEN** all remaining waitlist ranks for that table are recalculated sequentially

### Requirement: Waitlist Display
The system MUST clearly display the waitlist status.

#### Scenario: In Selection
- **WHEN** a table is full
- **THEN** "Full" and "Join Waitlist" are displayed

#### Scenario: In Dashboard
- **WHEN** a registration is on the waitlist
- **THEN** a badge "Waitlist - Rank X" is displayed

### Requirement: Waitlist Constraints
The system MUST apply the same eligibility rules for the waitlist.

#### Scenario: Eligibility Rules
- **WHEN** an ineligible player (points) attempts to join the waitlist
- **THEN** they are refused with the same error

#### Scenario: Daily Limit
- **WHEN** a player reaches their 2 tables/day limit
- **THEN** they cannot join an additional waitlist on that day

### Requirement: Waitlist Withdrawal
The system MUST allow users to withdraw from the waitlist.

#### Scenario: Self-Withdrawal
- **WHEN** a user cancels their waitlist registration
- **THEN** the registration is cancelled
- **AND** other waitlist ranks are recalculated

#### Scenario: Withdrawal UI
- **WHEN** a user views their waitlist registration in the dashboard
- **THEN** a "Withdraw" button is available

### Requirement: Waitlist Protection
The system MUST protect waitlist priority when a spot opens.

#### Scenario: Direct Registration Blocked
- **WHEN** a table has available spots AND has players on the waitlist
- **THEN** new direct registrations are blocked for that table
- **AND** a message explains that waitlist players have priority

#### Scenario: No Waitlist
- **WHEN** a table has available spots AND has no waitlist
- **THEN** direct registration is allowed normally

### Requirement: Admin Waitlist Promotion
The system MUST allow admins to promote a waitlist registration to pending_payment.

#### Scenario: Manual Promotion
- **WHEN** an admin promotes a waitlist registration
- **THEN** the registration status changes to pending_payment
- **AND** the waitlist_rank is set to null
- **AND** other waitlist ranks are recalculated

#### Scenario: User Notification
- **WHEN** a waitlist registration is promoted
- **THEN** the user receives an email notification
- **AND** the email contains a link to the dashboard to complete payment
- **AND** the email mentions the payment deadline

#### Scenario: Payment Deadline
- **WHEN** a promoted registration is not paid within the configured timer (waitlistTimerHours)
- **THEN** the registration is cancelled by the existing cleanup job
- **AND** the spot becomes available again

### Requirement: Future Automation Ready
The system MUST encapsulate promotion logic for future automation.

#### Scenario: Service Abstraction
- **WHEN** the WaitlistService is implemented
- **THEN** the promotion logic is encapsulated in a method that can be called manually or automatically
