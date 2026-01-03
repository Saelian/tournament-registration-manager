## MODIFIED Requirements

### Requirement: Payment Record
The system MUST record payments for tracking.

#### Scenario: Recording
- **WHEN** a checkout is initiated
- **THEN** a Payment record is created with the HelloAsso checkout intent ID
- **AND** the amount is stored in cents

#### Scenario: Registration-Payment Link
- **WHEN** a payment is recorded
- **THEN** it is linked to concerned registrations via the `payment_registrations` pivot table
- **AND** referential integrity is enforced by foreign keys

#### Scenario: Refund Tracking
- **WHEN** a refund is processed by an administrator
- **THEN** the `refunded_at` timestamp is recorded
- **AND** the `refund_method` is stored (helloasso_manual, bank_transfer, or cash)

## ADDED Requirements

### Requirement: Refund Request
The system MUST allow users to request a refund for their payment.

#### Scenario: User Requests Refund
- **WHEN** a user requests a refund for a succeeded payment before the refund deadline
- **THEN** the payment status changes to `refund_requested`
- **AND** an email notification is sent to all administrators
- **AND** the payment remains visible in the user's dashboard with "Refund Requested" status

#### Scenario: Refund Deadline Passed
- **WHEN** a user tries to request a refund after the refund deadline
- **THEN** the request is rejected with an appropriate error message
- **AND** the payment status remains unchanged

#### Scenario: Admin Notification Email
- **WHEN** a refund is requested
- **THEN** all administrators receive an email containing:
  - The subscriber's name and email
  - The payment amount
  - The list of tables concerned
  - A link to the admin payments page

### Requirement: Admin Refund Processing
The system MUST allow administrators to process refund requests manually.

#### Scenario: Admin Views Pending Refunds
- **WHEN** an administrator accesses the payments page
- **THEN** payments with `refund_requested` status are clearly highlighted
- **AND** a "Process Refund" action is available for each

#### Scenario: Admin Processes Refund
- **WHEN** an administrator clicks "Process Refund"
- **THEN** a confirmation modal is displayed with the warning: "En validant, cela confirme que le remboursement a été fait en amont (à la main sur HelloAsso, par virement, en espèces...)"
- **AND** the administrator must select the refund method

#### Scenario: Refund Method Selection
- **WHEN** processing a refund
- **THEN** the administrator must choose one of: "Remboursement depuis la plateforme HelloAsso", "Virement", "Espèces"

#### Scenario: Refund Confirmation
- **WHEN** an administrator confirms the refund processing
- **THEN** the payment status changes to `refunded`
- **AND** the `refunded_at` timestamp is set to the current date/time
- **AND** the selected `refund_method` is stored
- **AND** all linked registrations are cancelled

### Requirement: Payment Status Values
The system MUST support the following payment statuses.

#### Scenario: Status Enum
- **WHEN** a payment is created or updated
- **THEN** its status must be one of: `pending`, `succeeded`, `failed`, `expired`, `refund_requested`, `refunded`, `refund_pending` (legacy), `refund_failed` (legacy)
