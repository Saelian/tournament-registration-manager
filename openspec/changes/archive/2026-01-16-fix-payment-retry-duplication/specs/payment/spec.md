## MODIFIED Requirements

### Requirement: Payment Checkout Creation
The system MUST create a HelloAsso payment session for registrations, reusing existing pending payments when available.

#### Scenario: Successful Creation (New Payment)
- **WHEN** a user clicks on "Pay" with valid registrations
- **AND** no pending Payment exists for these registrations
- **THEN** a local Payment record is created (status=pending)
- **AND** registrations are linked via the `payment_registrations` pivot table
- **AND** a HelloAsso checkout URL is generated and the user is redirected

#### Scenario: Payment Retry with Existing Payment
- **WHEN** a user clicks on "Pay" for registrations that already have a pending Payment
- **AND** the HelloAsso checkout intent is still valid
- **THEN** the existing Payment is reused (no new Payment created)
- **AND** the existing checkout redirectUrl is returned
- **AND** no duplicate entries are created in `payment_registrations`

#### Scenario: Payment Retry with Expired Checkout
- **WHEN** a user clicks on "Pay" for registrations that already have a pending Payment
- **AND** the HelloAsso checkout intent has expired or is invalid
- **THEN** a new HelloAsso checkout is created
- **AND** the existing Payment record is updated with the new checkoutIntentId
- **AND** the existing Payment amount is updated if table prices have changed
- **AND** no new Payment record is created

#### Scenario: Amount Calculation
- **WHEN** a checkout is created for multiple registrations
- **THEN** the total amount is the sum of table prices (euros x 100 = cents)

#### Scenario: Item Name Generation
- **WHEN** a checkout is created
- **THEN** l'itemName suit le format "NOM Prenom - Tableau1, Tableau2" (max 250 chars)
- **AND** les joueurs uniques sont listes en premier
- **AND** les noms de tableaux suivent

#### Scenario: Existing Payment Selection
- **WHEN** multiple pending Payments exist for the requested registrations
- **THEN** the most recently created Payment is selected for reuse
