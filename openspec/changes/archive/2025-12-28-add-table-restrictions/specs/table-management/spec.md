## ADDED Requirements

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
