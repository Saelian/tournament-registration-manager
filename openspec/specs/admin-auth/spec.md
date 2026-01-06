# admin-auth Specification

## Purpose
TBD - created by archiving change add-admin-auth. Update Purpose after archive.
## Requirements
### Requirement: Admin Login
The system MUST allow administrators to log in with email and password.

#### Scenario: Successful Login
- **WHEN** an admin submits a valid email and password
- **THEN** a session is created and an httpOnly cookie is returned

#### Scenario: Failed Login - Invalid Credentials
- **WHEN** an admin submits an incorrect email or password
- **THEN** a 401 error with code `INVALID_CREDENTIALS` is returned

#### Scenario: Failed Login - Non-existent Email
- **WHEN** an admin submits an email that does not exist
- **THEN** a 401 error with code `INVALID_CREDENTIALS` is returned (same message to avoid enumeration)

### Requirement: Admin Logout
The system MUST allow administrators to log out.

#### Scenario: Successful Logout
- **WHEN** a logged-in admin calls the logout endpoint
- **THEN** the session is invalidated and the cookie is deleted

### Requirement: Admin Session Protection
Administrator routes MUST be protected by an authentication middleware.

#### Scenario: Authorized Access
- **WHEN** a request to /admin/* contains a valid session
- **THEN** the request is processed normally

#### Scenario: Denied Access
- **WHEN** a request to /admin/* does not contain a valid session
- **THEN** a 401 error with code `UNAUTHORIZED` is returned

### Requirement: Admin Info
The system MUST provide an endpoint to retrieve logged-in admin information.

#### Scenario: Profile Retrieval
- **WHEN** a logged-in admin calls GET /admin/me
- **THEN** the admin information (id, email, name) is returned

### Requirement: Default Admin Seeder
The system MUST provide a seeder to create a default admin.

#### Scenario: First Start
- **WHEN** the seeder is executed on an empty database
- **THEN** an admin with credentials configured via environment variables is created

### Requirement: Admin CLI Creation
The system MUST provide a CLI command to create administrators.

#### Scenario: Création réussie
- **WHEN** un opérateur exécute `node ace admin:create` avec des données valides
- **THEN** un nouvel administrateur est créé en base de données
- **AND** un message de confirmation est affiché

#### Scenario: Email déjà utilisé
- **WHEN** un opérateur tente de créer un admin avec un email existant
- **THEN** une erreur est affichée indiquant que l'email est déjà utilisé
- **AND** aucun administrateur n'est créé

#### Scenario: Mot de passe invalide
- **WHEN** un opérateur fournit un mot de passe de moins de 8 caractères
- **THEN** une erreur est affichée indiquant les critères requis
- **AND** aucun administrateur n'est créé

#### Scenario: Mode interactif
- **WHEN** la commande est exécutée sans arguments
- **THEN** le système demande successivement l'email, le nom complet et le mot de passe
- **AND** le mot de passe n'est pas affiché lors de la saisie

#### Scenario: Aucune route API
- **WHEN** une requête HTTP tente de créer un administrateur
- **THEN** aucune route ne permet cette opération
- **AND** la seule méthode de création reste la commande CLI

