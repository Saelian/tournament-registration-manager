## MODIFIED Requirements

### Requirement: Table Selection
The system MUST allow selecting desired tables with filtering options.

#### Scenario: Simple Selection
- **WHEN** a user selects an eligible table
- **THEN** it is added to the cart with its price

#### Scenario: Multiple Selection
- **WHEN** a user selects multiple tables
- **THEN** all are added to the cart and the total is calculated

#### Scenario: Deselection
- **WHEN** a user deselects a table
- **THEN** it is removed from the cart and the total is recalculated

#### Scenario: Filter by Eligibility
- **WHEN** the "Show only eligible tables" filter is checked
- **THEN** only tables where the player is eligible are displayed

#### Scenario: Filter Already Registered
- **WHEN** the "Show already registered tables" filter is unchecked
- **THEN** tables where the player is already registered are hidden

#### Scenario: Default Filter State
- **WHEN** a user opens the table selection page
- **THEN** both filters are checked by default

#### Scenario: Filter Combination
- **WHEN** multiple filters are applied
- **THEN** only tables matching all active filters are displayed
