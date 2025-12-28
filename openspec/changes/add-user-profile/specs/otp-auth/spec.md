# otp-auth Specification Delta

## MODIFIED Requirements

### Requirement: User Creation
The system MUST automatically create the user if they do not exist.

#### Scenario: New User
- **WHEN** an unregistered email requests an OTP
- **THEN** a user is created with this email and an incomplete profile (firstName, lastName, phone are null)

#### Scenario: Existing User
- **WHEN** an already registered email requests an OTP
- **THEN** the existing user is reused

### Requirement: User Profile Status
The system MUST indicate whether the user profile is complete.

#### Scenario: Profile Complete Check
- **WHEN** a user session is retrieved via GET /auth/user/me
- **THEN** the response includes an `isProfileComplete` boolean field

#### Scenario: Complete Profile
- **WHEN** firstName, lastName, and phone are all non-null
- **THEN** `isProfileComplete` is true

#### Scenario: Incomplete Profile
- **WHEN** any of firstName, lastName, or phone is null
- **THEN** `isProfileComplete` is false
