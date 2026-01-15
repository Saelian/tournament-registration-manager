# checkin Specification

## Purpose
TBD - created by archiving change add-checkin-interface. Update Purpose after archive.
## Requirements
### Requirement: Day Selection
The system MUST allow selecting a specific day of the tournament.

#### Scenario: Multi-day Tournament
- **WHEN** the tournament lasts several days
- **THEN** tabs or a selector allow choosing the date

#### Scenario: Default Display
- **WHEN** the admin opens the check-in page
- **THEN** the current day is selected by default (if it is a tournament day)

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

### Requirement: Instant Search
The system MUST allow instant searching.

#### Scenario: Search by Name
- **WHEN** the admin types "Dup" in the search
- **THEN** only players whose name contains "Dup" are displayed

#### Scenario: Search by License
- **WHEN** the admin types a license number
- **THEN** the corresponding player is displayed

#### Scenario: No Result
- **WHEN** the search finds nothing
- **THEN** a "No player found" message is displayed

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

### Requirement: Player Summary
The system MUST display a summary of the player's tables.

#### Scenario: Synthetic View
- **WHEN** a player is displayed
- **THEN** all their tables for the day are listed with their start times

#### Scenario: Visual Indicator per Table
- **WHEN** a table's start time is approaching (within 30 minutes)
- **THEN** the table is highlighted visually

### Requirement: Mobile First
The check-in interface MUST be optimized for tablet and mobile.

#### Scenario: Responsive Display
- **WHEN** the interface is used on a tablet
- **THEN** elements are large enough for touch usage

#### Scenario: Performance
- **WHEN** 200 players are displayed
- **THEN** the interface remains fluid and reactive

### Requirement: Presence in Registrations View
The existing "Registrations > By Table" view MUST display presence information.

#### Scenario: Presence Column in Table View
- **WHEN** viewing the "By Table" tab in Registrations
- **THEN** each player row shows a presence indicator (checked/unchecked)

#### Scenario: Presence Summary per Table
- **WHEN** viewing a table accordion
- **THEN** a summary shows "X/Y present" for that specific table

#### Scenario: Filter by Presence in Table View
- **WHEN** viewing a specific table
- **THEN** the admin can filter to show only present or absent players

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

