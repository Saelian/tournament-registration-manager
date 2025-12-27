# otp-auth Specification

## Purpose
TBD - created by archiving change add-otp-auth. Update Purpose after archive.
## Requirements
### Requirement: OTP Request
The system MUST allow requesting an OTP code by email.

#### Scenario: Successful OTP Request
- **WHEN** a user submits their email
- **THEN** a 6-digit code is generated and sent by email

#### Scenario: Invalid Email
- **WHEN** a user submits an email with an invalid format
- **THEN** a validation error with code `INVALID_EMAIL` is returned

#### Scenario: Request Limit
- **WHEN** a user requests more than 5 codes in 10 minutes
- **THEN** an error with code `TOO_MANY_REQUESTS` is returned

### Requirement: OTP Verification
The system MUST allow validating an OTP code to create a session.

#### Scenario: Valid Code
- **WHEN** a user submits a valid unexpired code
- **THEN** a session is created and the user is authenticated

#### Scenario: Expired Code
- **WHEN** a user submits a code after expiration (10 minutes)
- **THEN** an error with code `OTP_EXPIRED` is returned

#### Scenario: Incorrect Code
- **WHEN** a user submits an incorrect code
- **THEN** an error with code `INVALID_OTP` is returned

#### Scenario: Too Many Attempts
- **WHEN** a user fails 5 times in a row
- **THEN** the code is invalidated and a new request is required

### Requirement: User Session
The system MUST manage user sessions securely.

#### Scenario: Active Session
- **WHEN** a user has a valid session
- **THEN** they can access protected pages

#### Scenario: Expired Session
- **WHEN** the session exceeds the configured duration (default 7 days)
- **THEN** the user is redirected to the login page

#### Scenario: Logout
- **WHEN** a user logs out
- **THEN** the session is invalidated

### Requirement: User Creation
The system MUST automatically create the user if they do not exist.

#### Scenario: New User
- **WHEN** an unregistered email requests an OTP
- **THEN** a user is created with this email

#### Scenario: Existing User
- **WHEN** an already registered email requests an OTP
- **THEN** the existing user is reused

