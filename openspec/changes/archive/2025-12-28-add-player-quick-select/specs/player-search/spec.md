## ADDED Requirements

### Requirement: Quick Player Selection
The system MUST allow logged-in users to quickly select a player from their previous registrations.

#### Scenario: User with Previous Registrations
- **WHEN** a logged-in user starts a new registration
- **THEN** a "My Players" section displays players from their previous registrations
- **AND** a license search section titled "Register a player by license number" is displayed below

#### Scenario: Player Selection
- **WHEN** a user clicks on a player from their list
- **THEN** the player's information is automatically populated in the registration form

#### Scenario: User without Previous Registrations
- **WHEN** a logged-in user has no previous registrations
- **THEN** only the license search section is displayed

#### Scenario: Adding a New Player
- **WHEN** a user wants to register a player not in their list
- **THEN** they can directly use the visible license search field without extra clicks

### Requirement: My Players API
The system MUST provide an API endpoint to retrieve players from a user's registrations.

#### Scenario: Authenticated Request
- **WHEN** an authenticated user requests their players
- **THEN** a list of distinct players from their registrations is returned

#### Scenario: Unauthenticated Request
- **WHEN** an unauthenticated user requests the endpoint
- **THEN** a 401 error is returned

#### Scenario: Player Data Structure
- **WHEN** players are returned
- **THEN** each player includes id, firstName, lastName, licenceNumber, club, and points
