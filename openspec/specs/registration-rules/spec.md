# registration-rules Specification

## Purpose
TBD - created by archiving change add-registration-rules. Update Purpose after archive.
## Requirements
### Requirement: Points Eligibility
The system MUST filter tables according to player points.

#### Scenario: Player Eligible
- **WHEN** a player has 1200 points and a table has points_max = 1500
- **THEN** the table is displayed as eligible

#### Scenario: Player Ineligible (points too high)
- **WHEN** a player has 1600 points and a table has points_max = 1500
- **THEN** the table is greyed out with message "Points too high"

#### Scenario: Player Ineligible (points too low)
- **WHEN** a player has 800 points and a table has points_min = 1000
- **THEN** the table is greyed out with message "Points insufficient"

### Requirement: Daily Table Limit
The system MUST limit to 2 tables per day per player (excluding special tables).

#### Scenario: Limit Not Reached
- **WHEN** a player has 1 registration for Saturday
- **THEN** they can register for another table on Saturday

#### Scenario: Limit Reached
- **WHEN** a player has 2 registrations for Saturday (normal tables)
- **THEN** other tables on Saturday are blocked with message "Daily limit reached"

#### Scenario: Special Table
- **WHEN** a player has 2 registrations for Saturday
- **THEN** they can still register for a special table on Saturday

### Requirement: Time Conflict Detection
The system MUST prevent registration for two tables at the same time.

#### Scenario: No Conflict
- **WHEN** a player selects tables at 9am and 2pm
- **THEN** both are authorized

#### Scenario: Conflict Detected
- **WHEN** a player attempts to select a second table at 9am
- **THEN** a "Schedule conflict" error is displayed

### Requirement: Availability Display
The system MUST display the remaining places for each table.

#### Scenario: Places Available
- **WHEN** a table has 20 places and 15 registered
- **THEN** "5 places remaining" is displayed

#### Scenario: Table Full
- **WHEN** a table has reached its quota
- **THEN** "Full" is displayed with "Waitlist" option

### Requirement: Combined Validation
The system MUST validate all rules before allowing registration.

#### Scenario: Successful Validation
- **WHEN** all rules are respected
- **THEN** the registration can proceed to payment

#### Scenario: Failed Validation
- **WHEN** one or more rules are not respected
- **THEN** a detailed error message per rule is returned

