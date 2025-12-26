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

