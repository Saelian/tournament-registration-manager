## MODIFIED Requirements

### Requirement: Player List
The system MUST display the list of expected players for the selected day with their presence status.

#### Scenario: Alphabetical List
- **WHEN** a day is selected
- **THEN** players are listed in alphabetical order (lastName, firstName)

#### Scenario: Displayed Information
- **WHEN** a player is displayed
- **THEN** their name, license number, club, their tables for the day, and their presence status are visible

#### Scenario: Presence Counter
- **WHEN** the check-in page is displayed
- **THEN** the counters "X present / Y absent / Z unknown / W total" are visible and updated in real-time

#### Scenario: Three Presence States
- **WHEN** a player is displayed
- **THEN** they have one of three presence states: "unknown" (default), "present" (checked in), or "absent" (notified absence)

### Requirement: Check-in Action
The system MUST allow checking in a player or marking them as absent.

#### Scenario: Successful Check-in
- **WHEN** the admin clicks on "Present" for a player
- **THEN** the time is recorded, status changes to "present", and the visual state updates

#### Scenario: Mark as Absent
- **WHEN** the admin clicks on "Absent" for a player
- **THEN** the status changes to "absent" and the visual state updates (no timestamp needed)

#### Scenario: Check-in Cancellation
- **WHEN** the admin clicks "Reset" on a checked-in or absent player
- **THEN** the status returns to "unknown" and checkedInAt is cleared

#### Scenario: Timestamping
- **WHEN** a player is marked as present
- **THEN** the exact time is recorded and displayed (HH:mm format)

### Requirement: Presence Filters
The system MUST allow filtering players by presence status.

#### Scenario: Show Unknown Only
- **WHEN** the "Show unknown only" filter is activated
- **THEN** only players with unknown status are displayed

#### Scenario: Show Absentees Only
- **WHEN** the "Show absentees only" filter is activated
- **THEN** only players marked as absent are displayed

#### Scenario: Show Present Only
- **WHEN** the "Show present only" filter is activated
- **THEN** only checked-in players are displayed

#### Scenario: Show All
- **WHEN** no filter is activated (default)
- **THEN** all players are displayed regardless of presence status

## ADDED Requirements

### Requirement: Explicit Absence Status
The system MUST support an explicit "absent" status for players who have notified their absence.

#### Scenario: Mark Absent via API
- **WHEN** admin calls POST `/admin/checkin/:registrationId/absent`
- **THEN** all registrations for that player on that day have presenceStatus set to "absent"

#### Scenario: Visual Distinction for Absent
- **WHEN** a player is marked as absent
- **THEN** their card displays with a distinct visual style (e.g., gray/muted colors)

#### Scenario: Export Includes Status
- **WHEN** exporting registrations to CSV
- **THEN** the presence column shows "Présent", "Absent", or "Inconnu" based on status
