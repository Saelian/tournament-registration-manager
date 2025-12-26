# fftt-client Specification

## Purpose
TBD - created by archiving change add-fftt-client. Update Purpose after archive.
## Requirements
### Requirement: Player Search by Licence
The system MUST allow searching for a player by their FFTT license number.

#### Scenario: License Found
- **WHEN** a search is performed with a valid license number
- **THEN** the player's information is returned (last name, first name, club, points, gender, category)

#### Scenario: License Not Found
- **WHEN** a search is performed with a non-existent license number
- **THEN** null is returned

#### Scenario: Invalid License Format
- **WHEN** a search is performed with an invalid license format
- **THEN** a validation error is returned

### Requirement: Mock Client for Development
The system MUST provide a mock client for development without API credentials.

#### Scenario: Mock Usage in Dev
- **WHEN** the application runs in development mode
- **THEN** the MockFFTTClient is used with local data

#### Scenario: Realistic Mock Data
- **WHEN** the mock client is used
- **THEN** it returns players with realistic data (varied points, different clubs)

### Requirement: API Fallback
The system MUST handle FFTT API unavailability gracefully.

#### Scenario: API Unavailable
- **WHEN** the FFTT API does not respond or returns an error
- **THEN** the system allows manual entry with a "needs_verification" flag

#### Scenario: API Timeout
- **WHEN** the FFTT API takes more than 5 seconds to respond
- **THEN** the request is cancelled and the fallback is proposed

### Requirement: Standalone Package
The FFTT client MUST be a reusable standalone package.

#### Scenario: External Import
- **WHEN** another project wants to use the client
- **THEN** it can install it as an npm dependency

#### Scenario: No Framework Dependency
- **WHEN** the package is installed
- **THEN** it does not depend on AdonisJS or React (pure TypeScript + Axios)

