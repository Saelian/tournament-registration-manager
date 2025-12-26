# table-management Specification

## Purpose
TBD - created by archiving change add-table-crud. Update Purpose after archive.
## Requirements
### Requirement: Table CRUD
The system MUST allow complete management of tables (creation, reading, modification, deletion).

#### Scenario: Table Creation
- **WHEN** an admin creates a table with all required parameters
- **THEN** the table is created and returned with its ID

#### Scenario: Table List
- **WHEN** an admin calls GET /admin/tables
- **THEN** all tournament tables are returned with their fill rate

#### Scenario: Table Modification
- **WHEN** an admin modifies a table's parameters
- **THEN** the modifications are saved

#### Scenario: Empty Table Deletion
- **WHEN** an admin deletes a table without registrations
- **THEN** the table is deleted

#### Scenario: Deletion of Table with Registrations
- **WHEN** an admin attempts to delete a table with registrations
- **THEN** an error with code `TABLE_HAS_REGISTRATIONS` is returned

### Requirement: Table Points Range
Each table MUST have a points range (min/max) to filter player eligibility.

#### Scenario: Points Configuration
- **WHEN** an admin configures points_min and points_max
- **THEN** only players within this range can register

#### Scenario: Range Validation
- **WHEN** an admin configures points_min > points_max
- **THEN** a validation error with code `INVALID_POINTS_RANGE` is returned

### Requirement: Table Quota
Each table MUST have a quota of places defining its maximum capacity.

#### Scenario: Quota Reached
- **WHEN** the number of registrants reaches the quota
- **THEN** the table is marked as full and new registrations go to the waitlist

#### Scenario: Fill Rate Display
- **WHEN** a table is displayed
- **THEN** the number of remaining places (quota - registered) is visible

### Requirement: Special Table Flag
A table MUST be capable of being marked as "Special" to exempt players from the 2 tables per day rule.

#### Scenario: Special Table Marking
- **WHEN** an admin activates the is_special flag on a table
- **THEN** this table is not counted in the daily limit

#### Scenario: Normal Table
- **WHEN** a table is not marked as special
- **THEN** it counts in the 2 tables per day limit

### Requirement: Price Display and Input
Prices MUST be displayed and entered in Euros in the user interface, but stored in cents in the backend.

#### Scenario: Price Input
- **WHEN** an admin enters a price (e.g., "10.50")
- **THEN** the system converts it to cents (1050) for storage

#### Scenario: Price Display
- **WHEN** the system displays a table's price
- **THEN** the value in cents is converted to Euros (e.g., 1050 -> "10.50 €")

### Requirement: Table Schedule
Each table MUST have a start date and time.

#### Scenario: Schedule Configuration
- **WHEN** an admin configures the start date and time
- **THEN** this information is used to detect schedule conflicts

#### Scenario: Tables at Same Time
- **WHEN** two tables are created with the same date and time
- **THEN** they are created (no admin restriction), but players will not be able to register for both

