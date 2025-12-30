## ADDED Requirements

### Requirement: Payment Checkout Creation
The system MUST create a HelloAsso payment session for registrations.

#### Scenario: Successful Creation
- **WHEN** a user clicks on "Pay" with valid registrations
- **THEN** a local Payment record is created (status=pending)
- **AND** registrations are linked via the `payment_registrations` pivot table
- **AND** a HelloAsso checkout URL is generated and the user is redirected

#### Scenario: Amount Calculation
- **WHEN** a checkout is created for multiple registrations
- **THEN** the total amount is the sum of table prices (euros × 100 = cents)

### Requirement: Payment Webhook
The system MUST process HelloAsso Order webhooks to confirm payments.

#### Scenario: Payment Confirmed
- **WHEN** HelloAsso sends a successful Order webhook
- **THEN** concerned registrations (via pivot table) pass to status = paid
- **AND** the local Payment record is updated to status = succeeded
- **AND** the helloasso_order_id is stored

#### Scenario: Security Verification (Double Check)
- **WHEN** a webhook is received
- **THEN** the system MUST call `GET /organizations/{slug}/checkout-intents/{checkoutIntentId}` to verify payment status
- **AND** only process if the API confirms the payment is authorized

#### Scenario: Invalid Webhook
- **WHEN** the Double Check verification fails (API returns non-authorized status)
- **THEN** the webhook is rejected and logged

#### Scenario: Idempotency
- **WHEN** the same webhook is received twice
- **THEN** the second one is ignored without error (Payment already succeeded)

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

### Requirement: Payment Return Pages
The system MUST handle return pages after payment.

#### Scenario: Success Return
- **WHEN** the user returns after successful payment
- **THEN** a confirmation page is displayed

#### Scenario: Cancellation Return
- **WHEN** the user cancels payment
- **THEN** they are redirected to their cart and Payment record remains pending/failed

### Requirement: Trust Webhook Only
The system MUST NOT trust the redirect alone.

#### Scenario: Redirect without Webhook
- **WHEN** the user returns to the success page but the webhook is not received
- **THEN** status remains pending_payment until webhook confirmation

#### Scenario: Waiting Message
- **WHEN** payment is being confirmed
- **THEN** a "Confirmation in progress..." message is displayed

### Requirement: Pending Payment Expiration
The system MUST automatically free table slots when payment is abandoned.

#### Scenario: Slot Reservation During Payment
- **WHEN** a user initiates payment for a table
- **THEN** the slot is reserved (counted in quota) immediately
- **AND** other users cannot take that slot

#### Scenario: Smart Quota Calculation
- **WHEN** calculating table availability
- **THEN** `pending_payment` registrations older than 30 minutes are NOT counted
- **AND** slots are immediately available for other users

#### Scenario: Automatic Cleanup
- **WHEN** a `pending_payment` registration is older than 30 minutes
- **THEN** a scheduled job sets its status to `cancelled`
- **AND** the associated Payment status is set to `expired`
- **AND** the cleanup is logged for audit

#### Scenario: Cleanup Idempotency
- **WHEN** the cleanup job runs multiple times
- **THEN** already cancelled/expired records are not modified again

### Requirement: Scheduled Cleanup Job
The system MUST run periodic cleanup using `node-cron`.

#### Scenario: Job Execution
- **WHEN** the application starts
- **THEN** a cleanup job is scheduled to run every 5 minutes

#### Scenario: Job Resilience
- **WHEN** the application restarts
- **THEN** the cleanup job automatically resumes
- **AND** Layer 1 (smart quota) provides protection during downtime