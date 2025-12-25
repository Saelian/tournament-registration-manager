## ADDED Requirements

### Requirement: Referee Export
The system MUST allow exporting registrations in "Referee" format.

#### Scenario: Complete Export
- **WHEN** the admin requests the Referee export
- **THEN** a CSV file with all paid registrants is downloaded

#### Scenario: File Format
- **WHEN** the file is generated
- **THEN** it contains: License, Last Name, First Name, Points, Club, Sex, Category

#### Scenario: Grouping by Table
- **WHEN** the export contains multiple tables
- **THEN** players are grouped by table with a separator

#### Scenario: Export by Table
- **WHEN** the admin selects a specific table
- **THEN** only registrants of this table are exported

### Requirement: Accounting Export
The system MUST allow exporting payments for accounting.

#### Scenario: Payment Export
- **WHEN** the admin requests the Accounting export
- **THEN** a CSV file with all payments is downloaded

#### Scenario: File Format
- **WHEN** the file is generated
- **THEN** it contains: Date, Player, Email, Tables, Amount, Payment Method, Status

#### Scenario: All Payment Methods
- **WHEN** the export is generated
- **THEN** online, cash, and check payments are included

#### Scenario: Filter by Period
- **WHEN** the admin selects a period
- **THEN** only payments from this period are exported

### Requirement: CSV Format
Exports MUST be in Excel-compatible CSV format.

#### Scenario: Encoding
- **WHEN** a CSV file is generated
- **THEN** it uses UTF-8 encoding with BOM for Excel compatibility

#### Scenario: Separator
- **WHEN** a CSV file is generated
- **THEN** the separator is the semicolon (French standard)

#### Scenario: File Name
- **WHEN** a file is downloaded
- **THEN** its name includes the export type and date (e.g., referee-2024-03-15.csv)

### Requirement: Export Filters
The system MUST allow filtering exports.

#### Scenario: Filter by Day
- **WHEN** the admin selects "Saturday only"
- **THEN** only Saturday registrations are exported

#### Scenario: Filter by Status
- **WHEN** the admin requests the Referee export
- **THEN** only paid registrations are included (not cancelled ones)