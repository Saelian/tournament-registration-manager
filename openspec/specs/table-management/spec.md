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

### Requirement: Gender Restriction
The system MUST support optional gender restrictions on tables.

#### Scenario: No Restriction (Default)
- **WHEN** an admin creates a table without gender restriction
- **THEN** players of any gender can register

#### Scenario: Women-Only Table
- **WHEN** an admin sets gender_restriction to 'F'
- **THEN** only players with sex='F' can register

#### Scenario: Men-Only Table
- **WHEN** an admin sets gender_restriction to 'M'
- **THEN** only players with sex='M' can register

#### Scenario: Gender Mismatch Registration
- **WHEN** a player attempts to register for a gender-restricted table with wrong gender
- **THEN** registration is rejected with error code `GENDER_RESTRICTED`

### Requirement: Category Restriction
The system MUST support optional age category restrictions on tables using official FFTT categories.

#### Scenario: No Restriction (Default)
- **WHEN** an admin creates a table without category restriction
- **THEN** players of any category can register

#### Scenario: Category Selection
- **WHEN** an admin configures allowed_categories with one or more FFTT categories
- **THEN** only players with matching category can register

#### Scenario: Valid FFTT Categories
- **WHEN** an admin selects categories
- **THEN** checkboxes are available for: Poussin, Benjamin, Minime, Cadet, Junior, Senior, Vétéran 1, Vétéran 2, Vétéran 3, Vétéran 4, Vétéran 5

#### Scenario: Category Mismatch Registration
- **WHEN** a player attempts to register for a category-restricted table with wrong category
- **THEN** registration is rejected with error code `CATEGORY_RESTRICTED`

#### Scenario: Youth Table Example
- **WHEN** an admin selects Poussin, Benjamin, Minime categories
- **THEN** only players under 13 years old can register

### Requirement: Maximum Check-in Time
Each table MUST have a maximum check-in time defining when players must report.

#### Scenario: Default Check-in Time
- **WHEN** an admin creates a table without specifying max_checkin_time
- **THEN** the effective check-in time is calculated as start_time minus 30 minutes

#### Scenario: Custom Check-in Time
- **WHEN** an admin specifies a max_checkin_time
- **THEN** this time is used instead of the default calculation

#### Scenario: Check-in Time Display
- **WHEN** a table is displayed
- **THEN** the effective check-in time (custom or calculated) is shown

#### Scenario: Check-in Time Validation
- **WHEN** an admin specifies a max_checkin_time after the table start_time
- **THEN** a validation error is returned

### Requirement: Table Price Storage
The system MUST store table prices as decimal values in euros (not cents).

#### Scenario: Price stored in euros
- **WHEN** a table is created with a price of 8.50€
- **THEN** the value 8.50 is stored in the database

#### Scenario: Price returned by API
- **WHEN** the API returns table data
- **THEN** the price field contains the value in euros (e.g., 8.50, not 850)

#### Scenario: Price displayed in views
- **WHEN** a price is displayed in the UI
- **THEN** it shows the euro amount directly without division

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

### Requirement: Table Reference Letter
The system MUST support an optional reference letter for tables to enable quick identification in exports, check-in processes, and third-party integrations.

#### Scenario: Table creation with reference letter
- **WHEN** an admin creates a table with referenceLetter "A"
- **THEN** the table is created and the reference letter is stored

#### Scenario: Table creation without reference letter
- **WHEN** an admin creates a table without providing a reference letter
- **THEN** the table is created with referenceLetter as null

#### Scenario: Reference letter in API response
- **WHEN** a table is retrieved via any API endpoint (index, show, byTournament, eligible)
- **THEN** the response includes the referenceLetter field (string or null)

#### Scenario: Update reference letter
- **WHEN** an admin updates a table's reference letter
- **THEN** the new reference letter is saved

#### Scenario: Reference letter validation
- **WHEN** an admin provides a reference letter longer than 5 characters
- **THEN** a validation error is returned

#### Scenario: Reference letter in CSV import
- **WHEN** a CSV file contains a reference_letter column
- **THEN** the value is imported and associated with the created table

#### Scenario: Reference letter in CSV template
- **WHEN** an admin downloads the CSV import template
- **THEN** the template includes the reference_letter column

