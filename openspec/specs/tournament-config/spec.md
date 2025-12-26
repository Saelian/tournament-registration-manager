# tournament-config Specification

## Purpose
TBD - created by archiving change add-tournament-config. Update Purpose after archive.
## Requirements
### Requirement: Tournament Configuration
The system MUST allow configuring global tournament parameters.

#### Scenario: Configuration Retrieval
- **WHEN** an admin calls GET /admin/tournament
- **THEN** the current tournament configuration is returned

#### Scenario: Configuration Update
- **WHEN** an admin submits a valid update via PUT /admin/tournament
- **THEN** the configuration is updated and the new version is returned

### Requirement: Tournament Dates
The tournament MUST have a start date and an end date.

#### Scenario: Valid Dates
- **WHEN** an admin configures the tournament dates
- **THEN** the end date must be greater than or equal to the start date

#### Scenario: Invalid Dates
- **WHEN** an admin configures an end date prior to the start date
- **THEN** a validation error with code `INVALID_DATES` is returned

### Requirement: Refund Deadline
The system MUST allow configuring a refund deadline.

#### Scenario: Deadline Configuration
- **WHEN** an admin configures the refund deadline
- **THEN** this date is recorded and used for refund calculations

#### Scenario: Deadline Passed
- **WHEN** the current date is after the deadline
- **THEN** unregistration requests do not trigger a refund

### Requirement: Waitlist Timer Configuration
The system MUST allow configuring the waitlist timer duration.

#### Scenario: Timer Configuration
- **WHEN** an admin configures the timer to X hours
- **THEN** this duration is used for released place notifications

#### Scenario: Default Value
- **WHEN** no timer is configured
- **THEN** a default value of 4 hours is applied

