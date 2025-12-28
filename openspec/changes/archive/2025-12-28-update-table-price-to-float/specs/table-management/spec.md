## ADDED Requirements

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
