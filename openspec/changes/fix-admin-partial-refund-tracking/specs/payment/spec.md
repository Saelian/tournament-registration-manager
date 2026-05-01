## MODIFIED Requirements

### Requirement: Admin Refund Processing
The system MUST allow administrators to process refund requests manually, including both full payment refunds and partial registration-level refunds from admin cancellations.

#### Scenario: Admin Views Pending Refunds
- **WHEN** an administrator accesses the payments page
- **THEN** payments with `refund_requested` status are clearly highlighted
- **AND** a "Process Refund" action is available for each

#### Scenario: Admin Views Pending Partial Refunds
- **WHEN** an administrator accesses the payments page
- **THEN** registrations with `cancelled_by_admin_id IS NOT NULL AND refund_status = 'requested'` are displayed in a dedicated section
- **AND** each entry shows: player name, table name, amount to refund (`table.price`), cancellation date
- **AND** a "Traiter" action is available for each entry

#### Scenario: Admin Processes Refund
- **WHEN** an administrator clicks "Process Refund" on a payment in `refund_requested` status
- **THEN** a confirmation modal is displayed with the warning: "En validant, cela confirme que le remboursement a été fait en amont (à la main sur HelloAsso, par virement, en espèces...)"
- **AND** the administrator must select the refund method

#### Scenario: Admin Processes Partial Refund
- **WHEN** an administrator clicks "Traiter" on a pending partial refund entry
- **THEN** a confirmation modal is displayed asking for the refund method
- **AND** only `bank_transfer` and `cash` are available (HelloAsso not applicable for partial refunds)
- **AND** on confirmation, `PATCH /admin/registrations/:id/refund` is called

#### Scenario: Refund Method Selection
- **WHEN** processing a full payment refund
- **THEN** the administrator must choose one of: "Remboursement depuis la plateforme HelloAsso", "Virement", "Espèces"

#### Scenario: Refund Confirmation
- **WHEN** an administrator confirms the refund processing
- **THEN** the payment status changes to `refunded`
- **AND** the `refunded_at` timestamp is set to the current date/time
- **AND** the selected `refund_method` is stored
- **AND** all linked registrations are cancelled

### Requirement: Refund Tracking
The system MUST record refunds for tracking at both payment and registration level.

#### Scenario: Payment-level refund recording
- **WHEN** a full refund is processed by an administrator
- **THEN** the `refunded_at` timestamp is recorded on the Payment
- **AND** the `refund_method` is stored on the Payment (`helloasso_manual`, `bank_transfer`, or `cash`)

#### Scenario: Registration-level refund recording
- **WHEN** a partial refund is processed by an administrator for a single cancelled registration
- **THEN** `refund_status = 'done'` is set on the Registration
- **AND** `refunded_at` and `refund_method` are recorded on the Registration
- **AND** `refund_method` is one of `bank_transfer` or `cash`

## ADDED Requirements

### Requirement: Admin Payments Response Includes Partial Refunds
The system MUST include pending partial refunds in the admin payments API response.

#### Scenario: Pending partial refunds in response
- **WHEN** `GET /admin/payments` is called by an authenticated admin
- **THEN** the response includes a `pendingPartialRefunds` array
- **AND** each entry contains: `registrationId`, `playerId`, `playerName`, `playerLicence`, `tableName`, `amountCents` (= `table.price * 100`), `cancelledAt`, `cancelledByAdmin`, subscriber info
- **AND** only registrations with `cancelled_by_admin_id IS NOT NULL AND refund_status = 'requested'` are included

#### Scenario: Empty partial refunds
- **WHEN** no admin-cancelled registrations have `refund_status = 'requested'`
- **THEN** `pendingPartialRefunds` is an empty array
