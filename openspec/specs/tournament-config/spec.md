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
The system MUST allow configuring a refund deadline stored within tournament options.

#### Scenario: Deadline Configuration
- **WHEN** an admin configures the refund deadline in tournament options
- **THEN** this date is recorded in the options object and used for refund calculations

#### Scenario: Deadline Passed
- **WHEN** the current date is after the deadline stored in options
- **THEN** unregistration requests do not trigger a refund

### Requirement: Waitlist Timer Configuration
The system MUST allow configuring the waitlist timer duration stored within tournament options.

#### Scenario: Timer Configuration
- **WHEN** an admin configures the timer to X hours in tournament options
- **THEN** this duration is stored in the options object and used for released place notifications

#### Scenario: Default Value
- **WHEN** no timer is configured in options
- **THEN** a default value of 4 hours is applied

### Requirement: Tournament Options Structure
The system MUST store configurable tournament settings in an extensible options object.

#### Scenario: Options Storage
- **WHEN** an admin updates tournament configuration
- **THEN** the `refundDeadline` and `waitlistTimerHours` are stored in the `options` JSONB column

#### Scenario: Options Retrieval
- **WHEN** the tournament configuration is retrieved via GET /admin/tournament
- **THEN** the options object is returned with all configured settings

#### Scenario: Options Validation
- **WHEN** an admin submits invalid options (e.g., negative timer hours)
- **THEN** a validation error is returned

### Requirement: Tournament Short Description
The system MUST allow configuring a short description for the tournament.

#### Scenario: Short Description Input
- **WHEN** an admin enters a short description (max 500 characters)
- **THEN** the description is saved and returned in tournament data

#### Scenario: Short Description Display
- **WHEN** a participant views tournament information
- **THEN** the short description is displayed as plain text summary

### Requirement: Tournament Long Description
The system MUST allow configuring a detailed markdown description for the tournament.

#### Scenario: Long Description Input
- **WHEN** an admin enters a long description in markdown format
- **THEN** the markdown content is saved as-is

#### Scenario: Long Description Rendering
- **WHEN** a participant views the tournament details page
- **THEN** the long description is rendered as formatted HTML from markdown

### Requirement: Tournament Rules
The system MUST allow configuring tournament rules via link and/or inline content.

#### Scenario: Rules Link Configuration
- **WHEN** an admin provides an external URL for the rules document
- **THEN** the URL is validated and stored

#### Scenario: Rules Content Configuration
- **WHEN** an admin enters rules content in markdown format
- **THEN** the markdown content is saved (TEXT field, no size limit for multi-page rules)

#### Scenario: Rules Display
- **WHEN** a participant views the tournament rules
- **THEN** both the external link (if provided) and inline content (rendered markdown) are displayed

### Requirement: FFTT Homologation Link
The system MUST allow configuring a link to the FFTT tournament homologation page.

#### Scenario: Homologation Link Configuration
- **WHEN** an admin provides the FFTT homologation URL
- **THEN** the URL is validated and stored

#### Scenario: Homologation Link Display
- **WHEN** a participant views tournament information
- **THEN** the FFTT homologation link is displayed as a clickable link

