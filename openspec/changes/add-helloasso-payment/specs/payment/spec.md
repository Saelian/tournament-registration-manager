## ADDED Requirements

### Requirement: Payment Checkout Creation
The system MUST create a HelloAsso payment session for registrations.

#### Scenario: Successful Creation
- **WHEN** a user clicks on "Pay" with valid registrations
- **THEN** a HelloAsso checkout URL is generated and the user is redirected

#### Scenario: Metadata Transmitted
- **WHEN** a checkout is created
- **THEN** registration_ids are passed in metadata for reconciliation

#### Scenario: Amount Calculation
- **WHEN** a checkout is created for multiple registrations
- **THEN** the total amount is the sum of table prices

### Requirement: Payment Webhook
The system MUST process HelloAsso webhooks to confirm payments.

#### Scenario: Payment Confirmed
- **WHEN** HelloAsso sends a successful payment webhook
- **THEN** concerned registrations pass to status = paid

#### Scenario: Signature Verification
- **WHEN** a webhook is received
- **THEN** the signature is verified before processing

#### Scenario: Invalid Webhook
- **WHEN** a webhook has an invalid signature
- **THEN** it is rejected with HTTP 401 and logged

#### Scenario: Idempotency
- **WHEN** the same webhook is received twice
- **THEN** the second one is ignored without error

### Requirement: Payment Record
The system MUST record payments for tracking.

#### Scenario: Recording
- **WHEN** a payment is confirmed
- **THEN** a Payment record is created with details

#### Scenario: Registration-Payment Link
- **WHEN** a payment is recorded
- **THEN** it is linked to concerned registrations

### Requirement: Payment Return Pages
The system MUST handle return pages after payment.

#### Scenario: Success Return
- **WHEN** the user returns after successful payment
- **THEN** a confirmation page is displayed

#### Scenario: Cancellation Return
- **WHEN** the user cancels payment
- **THEN** they are redirected to their cart

### Requirement: Trust Webhook Only
The system MUST NOT trust the redirect alone.

#### Scenario: Redirect without Webhook
- **WHEN** the user returns to the success page but the webhook is not received
- **THEN** status remains pending_payment until webhook confirmation

#### Scenario: Waiting Message
- **WHEN** payment is being confirmed
- **THEN** a "Confirmation in progress..." message is displayed