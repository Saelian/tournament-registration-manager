# registration-flow Delta

## ADDED Requirements

### Requirement: Single-Page Registration Flow
The system MUST provide a single-page registration experience where all steps happen on the tournament tables page.

#### Scenario: View tables page with login status
- **WHEN** a user visits the tournament tables page
- **THEN** they see their connection status (email if logged in, "Non connecte" otherwise)

#### Scenario: Inline OTP authentication
- **WHEN** a non-authenticated user wants to register
- **THEN** they can enter their email and verify OTP directly on the tables page without navigation

#### Scenario: Inline player selection
- **WHEN** an authenticated user has not selected a player
- **THEN** they can choose "Moi-meme" or "Autre joueur" and search by license directly on the page

#### Scenario: Player summary display
- **WHEN** a player is selected
- **THEN** their name and points are displayed with an option to change

#### Scenario: Tables always visible
- **WHEN** a user is on the tables page at any step of the registration flow
- **THEN** the list of tables remains visible

#### Scenario: Tables disabled before player selection
- **WHEN** no player is selected
- **THEN** tables are visible but not selectable with a message indicating to select a player first

#### Scenario: Tables enabled after player selection
- **WHEN** a player is selected
- **THEN** tables show eligibility status and can be selected

### Requirement: Connection Status Display
The system MUST clearly display the user's authentication status.

#### Scenario: Authenticated user display
- **WHEN** a user is logged in
- **THEN** their email is displayed in the header/panel

#### Scenario: Non-authenticated user display
- **WHEN** a user is not logged in
- **THEN** "Non connecte" is displayed with an invitation to log in

## MODIFIED Requirements

### Requirement: Table Selection
The system MUST allow selecting desired tables for the player in context, inline on the tables page.

#### Scenario: Simple Selection
- **WHEN** a user with a selected player clicks an eligible table
- **THEN** it is added to the cart with its price

#### Scenario: Multiple Selection
- **WHEN** a user selects multiple tables
- **THEN** all are added to the cart and the total is calculated

#### Scenario: Deselection
- **WHEN** a user deselects a table
- **THEN** it is removed from the cart and the total is recalculated

#### Scenario: Player display
- **WHEN** a player is selected
- **THEN** the selected player's name and points are displayed in the registration panel

## REMOVED Requirements

### Requirement: Registration Flow Steps
**Reason**: Replaced by Single-Page Registration Flow - no more separate pages/steps
**Migration**: All functionality moved to inline components on the tables page

### Requirement: Registration Flow Context
**Reason**: Context still exists but simplified - no navigation between pages
**Migration**: State management remains but within a single page context
