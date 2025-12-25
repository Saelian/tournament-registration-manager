## ADDED Requirements

### Requirement: Day Selection
The system MUST allow selecting a specific day of the tournament.

#### Scenario: Multi-day Tournament
- **WHEN** the tournament lasts several days
- **THEN** tabs or a selector allow choosing the date

#### Scenario: Default Display
- **WHEN** the admin opens the check-in page
- **THEN** the current day is selected by default (if it is a tournament day)

### Requirement: Player List
The system MUST display the list of expected players for the selected day.

#### Scenario: Alphabetical List
- **WHEN** a day is selected
- **THEN** players are listed in alphabetical order

#### Scenario: Displayed Information
- **WHEN** a player is displayed
- **THEN** their name, their tables for the day, and their check-in status are visible

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
The system MUST allow checking in a player.

#### Scenario: Successful Check-in
- **WHEN** the admin clicks on "Present" for a player
- **THEN** the time is recorded and the status changes visually

#### Scenario: Check-in Cancellation
- **WHEN** the admin clicks again on an already checked-in player
- **THEN** the check-in is cancelled

#### Scenario: Timestamping
- **WHEN** a player is checked in
- **THEN** the exact time is recorded and displayed

### Requirement: Absent Filter
The system MUST allow filtering unchecked players.

#### Scenario: Filter Activated
- **WHEN** the "Show absentees only" toggle is activated
- **THEN** only unchecked players are displayed

#### Scenario: Counters
- **WHEN** the check-in page is displayed
- **THEN** the counters "X present / Y absent / Z total" are visible

### Requirement: Player Summary
The system MUST display a summary of the player's tables.

#### Scenario: Synthetic View
- **WHEN** a player is displayed
- **THEN** all their tables for the day are listed with their schedules

#### Scenario: Schedule Confirmation
- **WHEN** a player is checked in
- **THEN** the admin can confirm their convocation times

### Requirement: Mobile First
The check-in interface MUST be optimized for tablet and mobile.

#### Scenario: Responsive Display
- **WHEN** the interface is used on a tablet
- **THEN** elements are large enough for touch usage

#### Scenario: Performance
- **WHEN** 200 players are displayed
- **THEN** the interface remains fluid and reactive