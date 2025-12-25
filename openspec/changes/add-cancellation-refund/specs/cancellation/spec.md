## ADDED Requirements

### Requirement: Registration Cancellation
The system MUST allow users to cancel their registrations.

#### Scenario: Simple Cancellation
- **WHEN** a user clicks on "Unregister"
- **THEN** the registration passes to status = cancelled

#### Scenario: Confirmation Required
- **WHEN** a user requests cancellation
- **THEN** a confirmation is requested before proceeding

#### Scenario: Registration Already Cancelled
- **WHEN** a user attempts to cancel an already cancelled registration
- **THEN** an error with code `ALREADY_CANCELLED` is returned

### Requirement: Refund Based on Deadline
The system MUST trigger a refund according to the deadline.

#### Scenario: Before Deadline
- **WHEN** a user cancels before the deadline
- **THEN** a refund is triggered via HelloAsso

#### Scenario: After Deadline
- **WHEN** a user cancels after the deadline
- **THEN** no refund is performed and the user is warned

#### Scenario: Refund Info Display
- **WHEN** a user views their registrations
- **THEN** the info "Refundable until [date]" or "Non-refundable" is displayed

### Requirement: Refund Execution
The system MUST execute refunds via HelloAsso.

#### Scenario: Successful Refund
- **WHEN** HelloAsso confirms the refund
- **THEN** the payment passes to status = refunded

#### Scenario: Failed Refund
- **WHEN** HelloAsso refuses the refund
- **THEN** the admin is notified for manual action

### Requirement: Place Liberation
The system MUST free the place upon cancellation.

#### Scenario: Place Freed
- **WHEN** a registration is cancelled
- **THEN** the table's place counter is decremented

#### Scenario: Waitlist Trigger
- **WHEN** a place is freed and a waitlist exists
- **THEN** the "place freed" event is emitted for automation

### Requirement: Cancellation by Admin
The system MUST allow admins to cancel registrations with more options.

#### Scenario: Admin Cancellation with Refund
- **WHEN** an admin cancels a registration checking "Refund"
- **THEN** the refund is triggered even after the deadline

#### Scenario: Admin Cancellation without Refund
- **WHEN** an admin cancels a registration without checking "Refund"
- **THEN** no refund is performed