## ADDED Requirements

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
