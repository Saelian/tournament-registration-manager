## ADDED Requirements

### Requirement: Quick Registration Form
The system MUST provide a simplified form for on-site registrations.

#### Scenario: Form Opening
- **WHEN** the admin clicks on "Last Minute Registration"
- **THEN** a form with player search and table selection opens

#### Scenario: Player Search
- **WHEN** the admin enters a license number
- **THEN** the player's information is retrieved via FFTT

### Requirement: Rule Bypass
The system MUST allow bypassing rules for admin registrations.

#### Scenario: Rules Respected
- **WHEN** the admin registers an eligible player
- **THEN** the registration is created normally

#### Scenario: Bypass Activated
- **WHEN** the admin checks "Ignore rules" for an ineligible player
- **THEN** the registration is created despite conflicts

#### Scenario: Warning Displayed
- **WHEN** rules are violated
- **THEN** a warning is displayed before confirmation

### Requirement: Payment Method Selection
The system MUST allow choosing the payment method.

#### Scenario: Cash Payment
- **WHEN** the admin selects "Cash"
- **THEN** the registration is marked as paid (payment_method = cash)

#### Scenario: Check Payment
- **WHEN** the admin selects "Check"
- **THEN** the registration is marked as paid (payment_method = check)

#### Scenario: QR Code Payment
- **WHEN** the admin selects "QR Code / Online"
- **THEN** a payment link is generated and can be displayed as QR

### Requirement: Immediate Check-in
The system MUST automatically check in last-minute registrations.

#### Scenario: Automatic Check-in
- **WHEN** a last-minute registration is created
- **THEN** the player is automatically marked as present

### Requirement: Last Minute Tracking
The system MUST identify registrations made on site.

#### Scenario: Last-minute Flag
- **WHEN** a registration is created via this form
- **THEN** it is marked with is_last_minute = true

#### Scenario: Admin Filtering
- **WHEN** the admin views registrations
- **THEN** they can filter last-minute registrations