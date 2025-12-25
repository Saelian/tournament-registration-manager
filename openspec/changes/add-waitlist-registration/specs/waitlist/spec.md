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

#### Scenario: Rank Update
- **WHEN** a player ahead of them leaves the waitlist
- **THEN** their rank is recalculated

### Requirement: Waitlist Display
The system MUST clearly display the waitlist status.

#### Scenario: In Selection
- **WHEN** a table is full
- **THEN** "Full" and "Join Waitlist" are displayed

#### Scenario: In Dashboard
- **WHEN** a registration is on the waitlist
- **THEN** a badge "Waitlist - Rank X" is displayed

### Requirement: Waitlist Constraints
The system MUST apply the same rules for the waitlist.

#### Scenario: Eligibility Rules
- **WHEN** an ineligible player (points) attempts to join the waitlist
- **THEN** they are refused with the same error

#### Scenario: Daily Limit
- **WHEN** a player reaches their 2 tables/day limit
- **THEN** they cannot join an additional waitlist on that day