## ADDED Requirements

### Requirement: Table Prizes Configuration
The system MUST allow configuring prizes (rewards) for each table's ranking positions.

#### Scenario: Add cash prize
- **WHEN** an admin adds a prize with type 'cash' for rank 1 with amount 50
- **THEN** the prize is saved with cash_amount=50.00 and the table's total cost increases by 50

#### Scenario: Add item prize
- **WHEN** an admin adds a prize with type 'item' for rank 2 with description "Raquette Butterfly"
- **THEN** the prize is saved with item_description and does not affect the table's total cost

#### Scenario: Multiple prizes per table
- **WHEN** an admin configures prizes for ranks 1, 2, and 3
- **THEN** all three prizes are saved and displayed in rank order

#### Scenario: Unique rank per table
- **WHEN** an admin tries to add a second prize for an existing rank
- **THEN** a validation error with code `DUPLICATE_PRIZE_RANK` is returned

#### Scenario: Prize deletion
- **WHEN** an admin deletes a prize from a table
- **THEN** the prize is removed and the table's total cost is recalculated

### Requirement: Table Cost Calculation
The system MUST calculate the total cost of a table as the sum of all cash prizes.

#### Scenario: Cost with cash prizes only
- **WHEN** a table has cash prizes of 100, 50, and 25 euros
- **THEN** the total cost is 175 euros

#### Scenario: Cost with mixed prizes
- **WHEN** a table has one cash prize of 100 euros and one item prize
- **THEN** the total cost is 100 euros (items don't count)

#### Scenario: Cost with no prizes
- **WHEN** a table has no prizes configured
- **THEN** the total cost is 0 euros

#### Scenario: Cost displayed in table list
- **WHEN** an admin views the table list
- **THEN** each table displays its calculated total cost

### Requirement: Table Sponsors Association
The system MUST allow associating one or more sponsors to a table.

#### Scenario: Associate sponsor to table
- **WHEN** an admin associates a sponsor to a table
- **THEN** the association is saved in the pivot table

#### Scenario: Multiple sponsors per table
- **WHEN** an admin associates three sponsors to a table
- **THEN** all three sponsors are linked and displayed for that table

#### Scenario: Dissociate sponsor from table
- **WHEN** an admin removes a sponsor association from a table
- **THEN** the association is deleted but the sponsor remains in the system

#### Scenario: Sponsors displayed on table
- **WHEN** a table is viewed (admin or public)
- **THEN** all associated sponsors are displayed with their names
