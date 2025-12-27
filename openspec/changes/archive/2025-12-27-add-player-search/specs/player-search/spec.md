## ADDED Requirements

### Requirement: Player Search by Licence
The system MUST allow searching for a player by their license number.

#### Scenario: Player Found
- **WHEN** a user searches for a valid license number
- **THEN** the player's information (last name, first name, club, points, gender, category) is displayed

#### Scenario: Player Not Found
- **WHEN** a user searches for a non-existent license number
- **THEN** a "Player not found" message is displayed with a manual entry option

#### Scenario: Invalid License Format
- **WHEN** a user enters an invalid license format
- **THEN** a validation error message is displayed

### Requirement: Subscriber vs Player Distinction
The system MUST distinguish the subscriber (who pays) from the player (who plays).

#### Scenario: Registering for Self
- **WHEN** a user chooses "Myself"
- **THEN** the player profile is linked to their email and reusable for future registrations

#### Scenario: Registering for a Third Party
- **WHEN** a user chooses "Another player"
- **THEN** the player is associated with the registration but not with the subscriber's email

### Requirement: Player Profile Storage
The system MUST store player profiles to avoid repeated searches.

#### Scenario: Player Already Known
- **WHEN** a player has already been searched
- **THEN** their information is retrieved from the local database

#### Scenario: Points Update
- **WHEN** a player is searched and their points have changed
- **THEN** the new information is updated in the database

### Requirement: Manual Entry Fallback
The system MUST allow manual entry if the FFTT API is unavailable.

#### Scenario: Manual Entry
- **WHEN** the FFTT API fails or the player is not found
- **THEN** a manual entry form is proposed

#### Scenario: Verification Flag
- **WHEN** a player is entered manually
- **THEN** they are marked with needs_verification = true for admin validation