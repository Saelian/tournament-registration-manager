# sponsor-management Specification

## Purpose
Manage tournament sponsors with their contact information and visibility settings.

## ADDED Requirements

### Requirement: Sponsor CRUD
The system MUST allow complete management of sponsors (creation, reading, modification, deletion).

#### Scenario: Sponsor Creation
- **WHEN** an admin creates a sponsor with name "Butterfly"
- **THEN** the sponsor is created and returned with its ID

#### Scenario: Sponsor List
- **WHEN** an admin calls GET /admin/sponsors
- **THEN** all tournament sponsors are returned with their table associations count

#### Scenario: Sponsor Modification
- **WHEN** an admin modifies a sponsor's information
- **THEN** the modifications are saved

#### Scenario: Sponsor Deletion without associations
- **WHEN** an admin deletes a sponsor without table associations
- **THEN** the sponsor is deleted

#### Scenario: Sponsor Deletion with associations
- **WHEN** an admin deletes a sponsor that has table associations
- **THEN** the sponsor is deleted and all table associations are removed (cascade)

### Requirement: Sponsor Information
Each sponsor MUST have a name and optional contact information.

#### Scenario: Minimal sponsor
- **WHEN** an admin creates a sponsor with only a name
- **THEN** the sponsor is created with null values for optional fields

#### Scenario: Full sponsor information
- **WHEN** an admin creates a sponsor with name, website, email and description
- **THEN** all information is saved and returned

#### Scenario: Website URL validation
- **WHEN** an admin provides an invalid URL for website_url
- **THEN** a validation error with code `INVALID_URL` is returned

#### Scenario: Email validation
- **WHEN** an admin provides an invalid email for contact_email
- **THEN** a validation error with code `INVALID_EMAIL` is returned

### Requirement: Global Sponsor Flag
A sponsor MUST be capable of being marked as a global tournament sponsor for increased visibility.

#### Scenario: Mark sponsor as global
- **WHEN** an admin sets is_global to true on a sponsor
- **THEN** the sponsor is marked as a global tournament sponsor

#### Scenario: Global sponsor with table associations
- **WHEN** a global sponsor is also associated with specific tables
- **THEN** both the global flag and table associations are maintained

#### Scenario: Global sponsors list
- **WHEN** the system retrieves global sponsors
- **THEN** all sponsors with is_global=true are returned

#### Scenario: Non-global sponsor default
- **WHEN** a sponsor is created without specifying is_global
- **THEN** is_global defaults to false

### Requirement: Sponsor Display
Sponsors MUST be displayed appropriately based on their global status and table associations.

#### Scenario: Global sponsors visibility
- **WHEN** a participant views the tournament landing page
- **THEN** global sponsors are prominently displayed

#### Scenario: Table sponsors visibility
- **WHEN** a participant views a table's details
- **THEN** sponsors associated with that table are displayed

#### Scenario: Sponsor link display
- **WHEN** a sponsor has a website_url configured
- **THEN** the sponsor name is displayed as a clickable link
